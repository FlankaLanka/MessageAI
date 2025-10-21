import { ref, set, onValue, off, serverTimestamp } from 'firebase/database';
import { database } from './firebase';
import { AppState, AppStateStatus } from 'react-native';

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
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.setupAppStateListener();
  }

  // Set user online
  async setUserOnline(uid: string): Promise<void> {
    try {
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
      throw error;
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
      if (this.userUid) {
        if (nextAppState === 'active' && !this.isOnline) {
          this.setUserOnline(this.userUid);
        } else if (nextAppState === 'background' && this.isOnline) {
          this.setUserOffline(this.userUid);
        }
      }
    });
  }

  // Initialize presence for user
  async initialize(uid: string): Promise<void> {
    try {
      this.userUid = uid;
      await this.setUserOnline(uid);
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
    
    // Clear all typing timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    this.listeners.clear();
    this.typingListeners.clear();
  }
}

export const presenceService = new PresenceService();
