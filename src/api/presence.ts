import { ref, set, onValue, off, serverTimestamp, onDisconnect } from 'firebase/database';
import { database } from './firebase';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { networkService } from './network';

export interface PresenceData {
  state: 'online' | 'offline';
  lastSeen: number;
}

export interface TypingData {
  isTyping: boolean;
  timestamp: number;
  userId: string;
  userName: string;
}

class PresenceService {
  private userUid: string | null = null;
  private isOnline: boolean = false;
  private listeners: Map<string, (presence: PresenceData) => void> = new Map();
  private typingListeners: Map<string, (typingData: TypingData[]) => void> = new Map();
  private appStateSubscription: any = null;
  private networkSubscription: any = null;
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private appState: AppStateStatus = 'active';
  private presenceCheckInterval: NodeJS.Timeout | null = null;
  private lastPresenceUpdate: number = 0;
  private presenceUpdateDebounce: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private presenceFreshnessIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastSeenCache: Map<string, number> = new Map();
  private lastEmittedState: Map<string, 'online' | 'offline'> = new Map();

  // Heartbeat configuration
  private static readonly HEARTBEAT_INTERVAL_MS = 3000; // 3 seconds
  private static readonly ONLINE_GRACE_MS = 3000; // Consider online if lastSeen within 9s

  constructor() {
    console.log('🏗️ Initializing PresenceService...');
    this.setupFirebaseConnectionMonitor();
    this.setupAppStateListener();
    this.setupNetworkListener();
    this.setupPeriodicPresenceCheck();
    console.log('✅ PresenceService initialized');
  }

  // Start periodic heartbeat updates while app is active and user is logged in
  private startHeartbeat(): void {
    if (!this.userUid) return;
    if (this.heartbeatInterval) return; // already running

    const beat = async () => {
      try {
        if (!this.userUid) return;
        // Only beat if app is active
        if (this.appState !== 'active') return;
        const userStatusRef = ref(database, `status/${this.userUid}`);
        await set(userStatusRef, {
          state: 'online',
          lastSeen: serverTimestamp(),
        });
        this.isOnline = true;
        this.lastPresenceUpdate = Date.now();
      } catch (error) {
        console.warn('⚠️ Heartbeat failed:', error);
      }
    };

    // Run immediately, then on interval
    void beat();
    this.heartbeatInterval = setInterval(beat, PresenceService.HEARTBEAT_INTERVAL_MS);
    console.log('❤️ Heartbeat started');
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('🛑 Heartbeat stopped');
    }
  }

  // Monitor Firebase Realtime Database connection state
  // This is the CORE of the presence system - it's server-authoritative
  private setupFirebaseConnectionMonitor(): void {
    console.log('🔌 Setting up Firebase connection monitor (SERVER-AUTHORITATIVE)...');
    const connectedRef = ref(database, '.info/connected');
    
    onValue(connectedRef, async (snapshot) => {
      const isFirebaseConnected = snapshot.val() === true;
      console.log('🔌 Firebase connection state changed:', {
        connected: isFirebaseConnected,
        userUid: this.userUid,
        appState: this.appState,
        timestamp: new Date().toISOString()
      });
      
      if (isFirebaseConnected && this.userUid) {
        console.log('🔌 Firebase CONNECTED - Setting up presence');
        
        const userStatusRef = ref(database, `status/${this.userUid}`);
        
        // CRITICAL: Set up onDisconnect FIRST (before setting online)
        // This ensures Firebase server will automatically set us offline when connection drops
        try {
          await onDisconnect(userStatusRef).set({
            state: 'offline',
            lastSeen: serverTimestamp(),
          });
          console.log('✅ onDisconnect handler registered on Firebase server');
          
          // Heartbeat will drive online updates; if active, ensure it is running
          if (this.appState === 'active') {
            this.startHeartbeat();
          }
        } catch (error) {
          console.error('❌ Error setting up Firebase presence:', error);
        }
      } else {
        console.log('🔌 Firebase DISCONNECTED or no user');
        this.isOnline = false;
        this.stopHeartbeat();
      }
    });
    
    console.log('✅ Firebase connection monitor set up (server-authoritative)');
  }

  // Set user online (internal method - no conditions)
  // Note: onDisconnect is now handled by the connection monitor
  private async setUserOnlineInternal(uid: string): Promise<void> {
    try {
      this.userUid = uid;
      this.isOnline = true;
      
      const userStatusRef = ref(database, `status/${uid}`);
      await set(userStatusRef, { state: 'online', lastSeen: serverTimestamp() });
      console.log('✅ User set online in Firebase');
      // Ensure heartbeat is running while active
      if (this.appState === 'active') this.startHeartbeat();
    } catch (error) {
      console.error('Error setting user online:', error);
      // Don't throw error - network issues shouldn't crash the app
    }
  }

  // Set user online (public method with conditions)
  async setUserOnline(uid: string): Promise<void> {
    if (!this.shouldBeOnline()) {
      console.log('⚠️ Cannot set online - conditions not met');
      return;
    }
    await this.setUserOnlineInternal(uid);
  }

  // Set user offline
  async setUserOffline(uid: string): Promise<void> {
    try {
      this.isOnline = false;
      this.stopHeartbeat();
      
      const userStatusRef = ref(database, `status/${uid}`);
      await set(userStatusRef, {
        state: 'offline',
        lastSeen: serverTimestamp(),
      });
      
    } catch (error) {
      console.error('Error setting user offline:', error);
      throw error;
    }
  }

  // Get current user presence (one-time check)
  async getUserPresence(uid: string): Promise<PresenceData | null> {
    try {
      const userStatusRef = ref(database, `status/${uid}`);
      const snapshot = await new Promise<any>((resolve) => {
        onValue(userStatusRef, (snap) => {
          off(userStatusRef);
          resolve(snap);
        }, { onlyOnce: true });
      });
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return {
          state: data.state || 'offline',
          lastSeen: data.lastSeen || Date.now(),
        };
      } else {
        return {
          state: 'offline',
          lastSeen: Date.now(),
        };
      }
    } catch (error) {
      console.error('Error getting user presence:', error);
      return null;
    }
  }

  // Subscribe to user presence
  subscribeToUserPresence(uid: string, callback: (presence: PresenceData) => void): () => void {
    try {
      const userStatusRef = ref(database, `status/${uid}`);
      
      const emitPresence = (lastSeen: number) => {
        const isFresh = Date.now() - lastSeen <= PresenceService.ONLINE_GRACE_MS;
        const nextState: 'online' | 'offline' = isFresh ? 'online' : 'offline';
        const prevState = this.lastEmittedState.get(uid);
        this.lastEmittedState.set(uid, nextState);
        callback({ state: nextState, lastSeen });
      };

      const listener = onValue(userStatusRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const lastSeen: number = data.lastSeen || Date.now();
          this.lastSeenCache.set(uid, lastSeen);
          emitPresence(lastSeen);
        } else {
          // User has no presence data, assume offline
          const now = Date.now();
          this.lastSeenCache.set(uid, now);
          this.lastEmittedState.set(uid, 'offline');
          callback({ state: 'offline', lastSeen: now });
        }
      });

      // Start freshness interval to derive offline without server writes
      if (this.presenceFreshnessIntervals.has(uid)) {
        clearInterval(this.presenceFreshnessIntervals.get(uid)!);
      }
      const interval = setInterval(() => {
        const cached = this.lastSeenCache.get(uid);
        if (cached == null) return;
        const isFresh = Date.now() - cached <= PresenceService.ONLINE_GRACE_MS;
        const nextState: 'online' | 'offline' = isFresh ? 'online' : 'offline';
        const prevState = this.lastEmittedState.get(uid);
        if (prevState !== nextState) {
          this.lastEmittedState.set(uid, nextState);
          callback({ state: nextState, lastSeen: cached });
        }
      }, 1000);
      this.presenceFreshnessIntervals.set(uid, interval);

      // Store listener for cleanup
      this.listeners.set(uid, callback);

      // Return unsubscribe function
      return () => {
        off(userStatusRef, 'value', listener);
        this.listeners.delete(uid);
        if (this.presenceFreshnessIntervals.has(uid)) {
          clearInterval(this.presenceFreshnessIntervals.get(uid)!);
          this.presenceFreshnessIntervals.delete(uid);
        }
        this.lastSeenCache.delete(uid);
        this.lastEmittedState.delete(uid);
      };
    } catch (error) {
      console.error('Error subscribing to user presence:', error);
      return () => {};
    }
  }

  // Subscribe to multiple user presences
  subscribeToMultiplePresences(uids: string[], callback: (presences: Map<string, PresenceData>) => void): () => void {
    try {
      const unsubscribers: (() => void)[] = [];
      const presences = new Map<string, PresenceData>();

      uids.forEach(uid => {
        const unsubscribe = this.subscribeToUserPresence(uid, (presence) => {
          presences.set(uid, presence);
          callback(new Map(presences));
        });
        unsubscribers.push(unsubscribe);
      });

      // Return combined unsubscribe function
      return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe());
      };
    } catch (error) {
      console.error('Error subscribing to multiple presences:', error);
      return () => {};
    }
  }

  // Get online status for a specific user
  async getOnlineStatus(uid: string): Promise<boolean> {
    try {
      const userStatusRef = ref(database, `status/${uid}`);
      const snapshot = await new Promise<any>((resolve) => {
        onValue(userStatusRef, (snap) => {
          resolve(snap);
        }, { onlyOnce: true });
      });
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const lastSeen: number = data.lastSeen || 0;
        return Date.now() - lastSeen <= PresenceService.ONLINE_GRACE_MS;
      }
      return false;
    } catch (error) {
      console.error('Error getting online status:', error);
      return false;
    }
  }

  // Get current user's online status (considering network and app state)
  getCurrentUserOnlineStatus(): boolean {
    // Local view: consider online if we've updated recently and conditions allow
    const fresh = Date.now() - this.lastPresenceUpdate <= PresenceService.ONLINE_GRACE_MS;
    return fresh && this.shouldBeOnline();
  }

  // Manually trigger presence update (useful for debugging)
  async forceUpdatePresence(): Promise<void> {
    console.log('🔄 Force updating presence status...');
    await this.updatePresenceStatus();
  }

  // Force immediate presence check (bypasses conditions)
  async forcePresenceCheck(): Promise<void> {
    if (!this.userUid) {
      console.log('⚠️ No user UID for force presence check');
      return;
    }

    const shouldBeOnline = this.shouldBeOnline();
    console.log('🔍 Force presence check:', {
      shouldBeOnline,
      currentlyOnline: this.isOnline,
      appState: this.appState,
      networkConnected: networkService.getCurrentState().isConnected
    });

    if (shouldBeOnline && !this.isOnline) {
      console.log('🔄 Force setting online');
      await this.setUserOnlineInternal(this.userUid);
    } else if (!shouldBeOnline && this.isOnline) {
      console.log('🔄 Force setting offline');
      await this.setUserOffline(this.userUid);
    } else {
      console.log('✅ Force check - status already correct');
    }
  }

  // Force user offline (useful for logout)
  async forceOffline(): Promise<void> {
    if (this.userUid) {
      console.log('🚪 Forcing user offline (logout)');
      await this.setUserOffline(this.userUid);
    }
  }

  // Debug method to check current state
  debugCurrentState(): void {
    const networkState = networkService.getCurrentState();
    console.log('🔍 Presence Debug Info:', {
      userUid: this.userUid,
      isOnline: this.isOnline,
      appState: this.appState,
      currentAppState: AppState.currentState,
      networkState: {
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        type: networkState.type
      },
      shouldBeOnline: this.shouldBeOnline(),
      hasAppStateListener: !!this.appStateSubscription,
      hasNetworkListener: !!this.networkSubscription
    });
  }

  // Set typing status for a user in a chat
  async setTypingStatus(chatId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    try {
      const typingRef = ref(database, `typing/${chatId}/${userId}`);
      
      if (isTyping) {
        await set(typingRef, {
          isTyping: true,
          timestamp: serverTimestamp(),
          userId,
          userName,
        });
        
        // Auto-stop typing after 3 seconds
        const timeoutKey = `${chatId}_${userId}`;
        if (this.typingTimeouts.has(timeoutKey)) {
          clearTimeout(this.typingTimeouts.get(timeoutKey)!);
        }
        
        const timeout = setTimeout(async () => {
          await this.setTypingStatus(chatId, userId, userName, false);
        }, 3000);
        
        this.typingTimeouts.set(timeoutKey, timeout);
      } else {
        await set(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp(),
          userId,
          userName,
        });
        
        // Clear timeout if user stops typing manually
        const timeoutKey = `${chatId}_${userId}`;
        if (this.typingTimeouts.has(timeoutKey)) {
          clearTimeout(this.typingTimeouts.get(timeoutKey)!);
          this.typingTimeouts.delete(timeoutKey);
        }
      }
    } catch (error) {
      console.error('Error setting typing status:', error);
      throw error;
    }
  }

  // Subscribe to typing indicators for a chat
  subscribeToTypingIndicators(chatId: string, callback: (typingData: TypingData[]) => void): () => void {
    try {
      const typingRef = ref(database, `typing/${chatId}`);
      
      const listener = onValue(typingRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const typingUsers: TypingData[] = [];
          
          Object.values(data).forEach((userData: any) => {
            if (userData.isTyping && userData.userId !== this.userUid) {
              typingUsers.push({
                isTyping: userData.isTyping,
                timestamp: userData.timestamp,
                userId: userData.userId,
                userName: userData.userName,
              });
            }
          });
          
          callback(typingUsers);
        } else {
          callback([]);
        }
      });

      // Store listener for cleanup
      this.typingListeners.set(chatId, callback);

      // Return unsubscribe function
      return () => {
        off(typingRef, 'value', listener);
        this.typingListeners.delete(chatId);
      };
    } catch (error) {
      console.error('Error subscribing to typing indicators:', error);
      return () => {};
    }
  }

  // Setup app state listener
  private setupAppStateListener(): void {
    console.log('📱 Setting up app state listener...');
    
    // Get initial app state
    this.appState = AppState.currentState;
    console.log('📱 Initial app state:', this.appState);
    
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const previousState = this.appState;
      const timestamp = Date.now();
      console.log('📱 [Expo Go] App state changed:', {
        from: previousState,
        to: nextAppState,
        timestamp: new Date(timestamp).toISOString(),
        platform: Platform.OS
      });
      
      this.appState = nextAppState;
      
      // Handle background/foreground transitions
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('📱 App went to BACKGROUND/INACTIVE - stopping heartbeat and setting offline');
        
        // Cancel any pending updates
        if (this.presenceUpdateDebounce) {
          clearTimeout(this.presenceUpdateDebounce);
          this.presenceUpdateDebounce = null;
        }
        
        // Stop heartbeat and set offline in Firebase immediately
        this.stopHeartbeat();
        if (this.userUid) {
          const userStatusRef = ref(database, `status/${this.userUid}`);
          set(userStatusRef, {
            state: 'offline',
            lastSeen: serverTimestamp(),
          }).then(() => {
            this.isOnline = false;
            console.log('✅ User set OFFLINE (app backgrounded)');
          }).catch(err => {
            console.error('❌ Error setting offline on background:', err);
          });
        }
      } else if (nextAppState === 'active') {
        console.log('📱 App became ACTIVE - starting heartbeat and setting online');
        
        // Cancel any pending offline updates
        if (this.presenceUpdateDebounce) {
          clearTimeout(this.presenceUpdateDebounce);
          this.presenceUpdateDebounce = null;
        }
        
        // Start heartbeat and set online in Firebase immediately (if network is available)
        if (this.userUid && previousState !== 'active') {
          const networkState = networkService.getCurrentState();
          if (networkState.isConnected) {
            const userStatusRef = ref(database, `status/${this.userUid}`);
            
            // Re-register onDisconnect handler
            onDisconnect(userStatusRef).set({
              state: 'offline',
              lastSeen: serverTimestamp(),
            }).then(() => {
              console.log('✅ onDisconnect re-registered');
              
              // Now set online
              return set(userStatusRef, {
                state: 'online',
                lastSeen: serverTimestamp(),
              });
            }).then(() => {
              this.isOnline = true;
              this.startHeartbeat();
              console.log('✅ User set ONLINE (app foregrounded)');
            }).catch(err => {
              console.error('❌ Error setting online on foreground:', err);
            });
          } else {
            console.log('⚠️ Network not available, staying offline');
          }
        }
      }
    });
    console.log('✅ App state listener set up for Expo Go');
  }

  // Setup network listener
  // Note: Network disconnections are primarily handled by Firebase's onDisconnect
  // This is just for additional logging and immediate reconnection
  private setupNetworkListener(): void {
    console.log('🌐 Setting up network listener (supplementary)...');
    this.networkSubscription = networkService.subscribe((networkState) => {
      console.log('🌐 Network state changed:', {
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        type: networkState.type
      });
      
      // When network is restored and app is active, try to reconnect
      if (networkState.isConnected && this.userUid && this.appState === 'active') {
        console.log('🌐 Network restored - starting heartbeat');
        this.startHeartbeat();
      } else if (!networkState.isConnected) {
        console.log('🌐 Network lost - stopping heartbeat (onDisconnect handles offline)');
        this.stopHeartbeat();
      }
    });
    console.log('✅ Network listener set up (Firebase handles actual presence)');
  }

  // Setup periodic presence check to ensure accuracy
  private setupPeriodicPresenceCheck(): void {
    console.log('⏰ Setting up periodic presence check...');
    this.presenceCheckInterval = setInterval(() => {
      if (this.userUid) {
        console.log('⏰ Periodic presence check');
        this.updatePresenceStatus().catch(err => {
          console.error('Error in periodic presence check:', err);
        });
      }
    }, 5000); // Check every 5 seconds for faster updates
    console.log('✅ Periodic presence check set up (every 5 seconds)');
  }

  // Check if user should be online based on app state and network
  private shouldBeOnline(): boolean {
    const networkState = networkService.getCurrentState();
    const isAppActive = this.appState === 'active';
    const isNetworkConnected = networkState.isConnected && 
                              (networkState.isInternetReachable === true || networkState.isInternetReachable === null);
    
    console.log('🔍 Should be online check:', {
      appState: this.appState,
      isAppActive,
      isNetworkConnected,
      networkState: networkState.isConnected,
      internetReachable: networkState.isInternetReachable
    });
    
    return isAppActive && isNetworkConnected;
  }

  // Update presence status based on current app state and network
  private async updatePresenceStatus(): Promise<void> {
    if (!this.userUid) {
      console.log('⚠️ No user UID available for presence update');
      return;
    }

    const shouldBeOnline = this.shouldBeOnline();
    const networkState = networkService.getCurrentState();
    
    console.log('🔄 Updating presence status:', {
      userId: this.userUid,
      shouldBeOnline,
      currentlyOnline: this.isOnline,
      appState: this.appState,
      networkConnected: networkState.isConnected
    });
    
    if (shouldBeOnline && !this.isOnline) {
      // Should be online but currently offline
      console.log('✅ Setting user online');
      await this.setUserOnlineInternal(this.userUid);
    } else if (!shouldBeOnline && this.isOnline) {
      // Should be offline but currently online
      console.log('❌ Setting user offline');
      await this.setUserOffline(this.userUid);
    } else {
      console.log('✅ Presence status is already correct');
    }
  }

  // Initialize presence for user
  async initialize(uid: string): Promise<void> {
    try {
      this.userUid = uid;
      // Use updatePresenceStatus to check network and app state
      await this.updatePresenceStatus();
      if (this.shouldBeOnline()) this.startHeartbeat();
    } catch (error) {
      console.error('Error initializing presence:', error);
      throw error;
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up presence service');
    
    // Clear any pending debounce timeout
    if (this.presenceUpdateDebounce) {
      clearTimeout(this.presenceUpdateDebounce);
      this.presenceUpdateDebounce = null;
    }
    this.stopHeartbeat();
    
    // Force user offline before cleanup
    if (this.userUid) {
      try {
        await this.forceOffline();
      } catch (error) {
        console.error('Error setting user offline during cleanup:', error);
      }
    }
    
    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    // Remove network listener
    if (this.networkSubscription) {
      this.networkSubscription();
      this.networkSubscription = null;
    }
    
    // Clear periodic presence check
    if (this.presenceCheckInterval) {
      clearInterval(this.presenceCheckInterval);
      this.presenceCheckInterval = null;
    }
    
    // Clear all typing timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    // Clear all listeners
    this.listeners.clear();
    this.typingListeners.clear();
    
    // Reset state
    this.userUid = null;
    this.isOnline = false;
    this.appState = 'active';
    this.lastPresenceUpdate = 0;
    
    console.log('✅ Presence service cleanup completed');
  }
}

export const presenceService = new PresenceService();
