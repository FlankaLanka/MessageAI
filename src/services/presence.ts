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

  constructor() {
    this.setupAppStateListener();
    this.setupNetworkListener();
  }

  // Set user online (only if network is available and app is active)
  async setUserOnline(uid: string): Promise<void> {
    try {
      // Check if we should actually be online
      if (!this.shouldBeOnline()) {
        console.log('Cannot set user online: network or app state not suitable');
        return;
      }

      this.userUid = uid;
      this.isOnline = true;
      
      const userStatusRef = ref(database, `status/${uid}`);
      await set(userStatusRef, {
        state: 'online',
        lastSeen: serverTimestamp(),
      });
      
      console.log('User set to online:', uid);
    } catch (error) {
      console.error('Error setting user online:', error);
      // Don't throw error - network issues shouldn't crash the app
    }
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
      
      console.log('User set to offline:', uid);
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
    console.log('🔄 Force updating presence status');
    await this.updatePresenceStatus();
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
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      this.appState = nextAppState;
      this.updatePresenceStatus();
    });
  }

  // Setup network listener
  private setupNetworkListener(): void {
    this.networkSubscription = networkService.subscribe((networkState) => {
      console.log('🌐 Network state changed:', {
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        appState: this.appState,
        userUid: this.userUid,
        isOnline: this.isOnline
      });
      this.updatePresenceStatus();
    });
  }

  // Check if user should be online based on app state and network
  private shouldBeOnline(): boolean {
    const networkState = networkService.getCurrentState();
    return this.appState === 'active' && 
           networkState.isConnected && 
           (networkState.isInternetReachable === true || networkState.isInternetReachable === null);
  }

  // Update presence status based on current app state and network
  private async updatePresenceStatus(): Promise<void> {
    if (!this.userUid) {
      console.log('⚠️ Cannot update presence: no user UID');
      return;
    }

    const shouldBeOnline = this.shouldBeOnline();
    const networkState = networkService.getCurrentState();
    
    console.log('🔄 Updating presence status:', {
      shouldBeOnline,
      isOnline: this.isOnline,
      appState: this.appState,
      networkConnected: networkState.isConnected,
      internetReachable: networkState.isInternetReachable
    });
    
    if (shouldBeOnline && !this.isOnline) {
      // Should be online but currently offline
      console.log('📱 Setting user online');
      await this.setUserOnline(this.userUid);
    } else if (!shouldBeOnline && this.isOnline) {
      // Should be offline but currently online
      console.log('📱 Setting user offline');
      await this.setUserOffline(this.userUid);
    } else {
      console.log('📱 No presence change needed');
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
  cleanup(): void {
    if (this.userUid && this.isOnline) {
      this.setUserOffline(this.userUid);
    }
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    
    if (this.networkSubscription) {
      this.networkSubscription();
    }
    
    // Clear all typing timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    this.listeners.clear();
    this.typingListeners.clear();
  }
}

export const presenceService = new PresenceService();
