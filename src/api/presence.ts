import { ref, set, onValue, off, serverTimestamp } from 'firebase/database';
import { database } from './firebase';
import { AppState, AppStateStatus } from 'react-native';
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

  constructor() {
    console.log('🏗️ Initializing PresenceService...');
    this.setupAppStateListener();
    this.setupNetworkListener();
    this.setupPeriodicPresenceCheck();
    console.log('✅ PresenceService initialized');
  }

  // Set user online (internal method - no conditions)
  private async setUserOnlineInternal(uid: string): Promise<void> {
    try {
      this.userUid = uid;
      this.isOnline = true;
      
      const userStatusRef = ref(database, `status/${uid}`);
      await set(userStatusRef, {
        state: 'online',
        lastSeen: serverTimestamp(),
      });
      
      console.log('✅ User set online in Firebase');
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
      const snapshot = await new Promise((resolve, reject) => {
        onValue(userStatusRef, (snapshot) => {
          off(userStatusRef);
          resolve(snapshot);
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
      
      const listener = onValue(userStatusRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const presence: PresenceData = {
            state: data.state || 'offline',
            lastSeen: data.lastSeen || Date.now(),
          };
          callback(presence);
        } else {
          // User has no presence data, assume offline
          callback({
            state: 'offline',
            lastSeen: Date.now(),
          });
        }
      });

      // Store listener for cleanup
      this.listeners.set(uid, callback);

      // Return unsubscribe function
      return () => {
        off(userStatusRef, 'value', listener);
        this.listeners.delete(uid);
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
      const snapshot = await new Promise((resolve, reject) => {
        onValue(userStatusRef, (snapshot) => {
          resolve(snapshot);
        }, { onlyOnce: true });
      }) as any;
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return data.state === 'online';
      }
      return false;
    } catch (error) {
      console.error('Error getting online status:', error);
      return false;
    }
  }

  // Get current user's online status (considering network and app state)
  getCurrentUserOnlineStatus(): boolean {
    return this.isOnline && this.shouldBeOnline();
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
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('📱 App state changed:', this.appState, '->', nextAppState);
      this.appState = nextAppState;
      
      // Handle background/foreground transitions
      if (this.appState === 'background' || this.appState === 'inactive') {
        console.log('📱 App went to background/inactive - forcing offline');
        // Force immediate offline when app goes to background
        if (this.userUid && this.isOnline) {
          this.setUserOffline(this.userUid);
        }
      } else if (this.appState === 'active') {
        console.log('📱 App became active - checking online status');
        // Check if we should be online when app becomes active
        this.updatePresenceStatus();
      }
    });
    console.log('✅ App state listener set up');
  }

  // Setup network listener
  private setupNetworkListener(): void {
    console.log('🌐 Setting up network listener...');
    this.networkSubscription = networkService.subscribe((networkState) => {
      console.log('🌐 Network state changed:', {
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        type: networkState.type
      });
      
      // If network is lost and user is online, force offline immediately
      if (!networkState.isConnected && this.userUid && this.isOnline) {
        console.log('🌐 Network lost - forcing offline immediately');
        this.setUserOffline(this.userUid);
      } else {
        // Otherwise, use normal presence update logic
        this.updatePresenceStatus();
      }
    });
    console.log('✅ Network listener set up');
  }

  // Setup periodic presence check to ensure accuracy
  private setupPeriodicPresenceCheck(): void {
    console.log('⏰ Setting up periodic presence check...');
    this.presenceCheckInterval = setInterval(() => {
      if (this.userUid) {
        console.log('⏰ Periodic presence check');
        this.updatePresenceStatus();
      }
    }, 10000); // Check every 10 seconds
    console.log('✅ Periodic presence check set up');
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
    } catch (error) {
      console.error('Error initializing presence:', error);
      throw error;
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up presence service');
    
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
    
    console.log('✅ Presence service cleanup completed');
  }
}

export const presenceService = new PresenceService();
