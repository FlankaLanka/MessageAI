import { 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDoc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { firestore } from './firebase';
import { sqliteService } from './sqlite';
import NetInfo from '@react-native-community/netinfo';

export interface ReadReceipt {
  userId: string;
  userName: string;
  userPhotoURL?: string;
  messageId: string;
  readAt: number;
}

export interface UserReadStatus {
  userId: string;
  userName: string;
  userPhotoURL?: string;
  lastReadMessageId: string;
  lastReadAt: number;
}

export class ReadReceiptService {
  /**
   * Mark messages as read when user opens a chat
   * Only marks the latest visible message as read
   */
  static async markMessagesAsRead(
    chatId: string,
    messageId: string,
    userId: string,
    userName: string,
    userPhotoURL?: string
  ): Promise<void> {
    try {
      const chatRef = doc(firestore, 'chats', chatId);
      
      // Update the user's read status in the chat document
      await updateDoc(chatRef, {
        [`readStatus.${userId}`]: {
          userId,
          userName,
          userPhotoURL: userPhotoURL || null,
          lastReadMessageId: messageId,
          lastReadAt: serverTimestamp()
        }
      });
      
      console.log(`Marked message ${messageId} as read by ${userName}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      
      // Queue for offline sync if network is not available
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        await this.queueReadReceipt(chatId, messageId, userId, userName, userPhotoURL);
      }
    }
  }

  /**
   * Subscribe to read status changes for a chat
   */
  static subscribeToReadStatus(
    chatId: string,
    onReadStatusUpdate: (readStatus: Record<string, UserReadStatus>) => void
  ): () => void {
    const chatRef = doc(firestore, 'chats', chatId);
    
    return onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const readStatus = data.readStatus || {};
        onReadStatusUpdate(readStatus);
      } else {
        onReadStatusUpdate({});
      }
    }, (error) => {
      console.error('Error in read status subscription:', error);
    });
  }

  /**
   * Get read receipts for a specific message
   * Shows receipts from users whose latest read message is this exact message
   * For group chats, shows receipts under the most recent message from each user
   * If a user has sent messages after their last read, their receipt won't show
   */
  static getReadReceiptsForMessage(
    messageId: string,
    readStatus: Record<string, UserReadStatus>,
    currentUserId: string,
    allMessages: any[] = [],
    isGroupChat: boolean = false
  ): ReadReceipt[] {
    const receipts: ReadReceipt[] = [];
    
    Object.values(readStatus).forEach(userStatus => {
      // Only show receipts from other users
      if (userStatus.userId !== currentUserId) {
        // Only show receipt if this is their exact latest read message
        if (userStatus.lastReadMessageId === messageId) {
          // Check if this user has sent any messages after their last read message
          const hasSentMessagesAfterRead = this.hasUserSentMessagesAfterRead(
            userStatus.userId,
            userStatus.lastReadMessageId,
            allMessages
          );
          
          console.log(`User ${userStatus.userName} (${userStatus.userId}): hasSentMessagesAfterRead = ${hasSentMessagesAfterRead}`);
          
          // Only show receipt if user hasn't sent messages after their last read
          if (!hasSentMessagesAfterRead) {
            console.log(`Showing read receipt for ${userStatus.userName} on message ${messageId}`);
            receipts.push({
              userId: userStatus.userId,
              userName: userStatus.userName,
              userPhotoURL: userStatus.userPhotoURL,
              messageId,
              readAt: userStatus.lastReadAt
            });
          } else {
            console.log(`Hiding read receipt for ${userStatus.userName} because they sent messages after reading`);
          }
        }
      }
    });
    
    return receipts;
  }

  /**
   * Check if a user has sent any messages after their last read message
   */
  private static hasUserSentMessagesAfterRead(
    userId: string,
    lastReadMessageId: string,
    allMessages: any[]
  ): boolean {
    // Find the timestamp of the last read message
    const lastReadMessage = allMessages.find(msg => msg.id === lastReadMessageId);
    if (!lastReadMessage) {
      console.log(`Last read message ${lastReadMessageId} not found for user ${userId}`);
      return false;
    }
    
    const lastReadTimestamp = lastReadMessage.timestamp;
    console.log(`User ${userId} last read message timestamp: ${lastReadTimestamp}`);
    
    // Check if user has sent any messages after this timestamp
    const messagesAfterRead = allMessages.filter(msg => 
      msg.senderId === userId && 
      msg.timestamp > lastReadTimestamp
    );
    
    console.log(`User ${userId} sent ${messagesAfterRead.length} messages after reading:`, 
      messagesAfterRead.map(m => `${m.id} at ${m.timestamp}`)
    );
    
    return messagesAfterRead.length > 0;
  }

  /**
   * Queue a read receipt for offline sync
   */
  static async queueReadReceipt(
    chatId: string,
    messageId: string,
    userId: string,
    userName: string,
    userPhotoURL?: string
  ): Promise<void> {
    try {
      // Ensure SQLite is initialized
      if (!sqliteService.db) {
        await sqliteService.initialize();
      }

      const pendingReceipt = {
        id: `${chatId}_${messageId}_${userId}_${Date.now()}`,
        chatId,
        messageId,
        userId,
        userName,
        userPhotoURL,
        timestamp: Date.now()
      };

      await sqliteService.queueReadReceipt(pendingReceipt);
      console.log('Queued read receipt for offline sync:', pendingReceipt.id);
    } catch (error) {
      console.error('Error queueing read receipt:', error);
    }
  }

  /**
   * Sync all pending read receipts when connection is restored
   */
  static async syncPendingReadReceipts(): Promise<void> {
    try {
      // Ensure SQLite is initialized
      if (!sqliteService.db) {
        await sqliteService.initialize();
      }

      const pendingReceipts = await sqliteService.getPendingReadReceipts();
      
      if (pendingReceipts.length === 0) {
        return;
      }

      console.log(`Syncing ${pendingReceipts.length} pending read receipts`);

      // Use batch operation for efficiency
      const batch = writeBatch(firestore);
      
      pendingReceipts.forEach(receipt => {
        const chatRef = doc(firestore, 'chats', receipt.chatId);
        batch.update(chatRef, {
          [`readStatus.${receipt.userId}`]: {
            userId: receipt.userId,
            userName: receipt.userName,
            userPhotoURL: receipt.userPhotoURL || null,
            lastReadMessageId: receipt.messageId,
            lastReadAt: serverTimestamp()
          }
        });
      });

      await batch.commit();
      
      // Remove synced receipts from queue
      await sqliteService.clearPendingReadReceipts();
      
      console.log('Synced all pending read receipts');
    } catch (error) {
      console.error('Error syncing pending read receipts:', error);
    }
  }

  /**
   * Start automatic sync when network is available
   */
  static startAutoSync(): () => void {
    let syncInterval: NodeJS.Timeout | null = null;
    let networkUnsubscribe: (() => void) | null = null;

    const performSync = async () => {
      try {
        const networkState = await NetInfo.fetch();
        if (networkState.isConnected) {
          await this.syncPendingReadReceipts();
        }
      } catch (error) {
        console.error('Error in auto sync:', error);
      }
    };

    // Perform initial sync
    performSync();

    // Set up periodic sync
    syncInterval = setInterval(performSync, 30000); // Every 30 seconds

    // Listen for network changes
    networkUnsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        performSync();
      }
    });

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
      if (networkUnsubscribe) {
        networkUnsubscribe();
      }
    };
  }
}
