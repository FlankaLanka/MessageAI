import { Message } from '../types';
import { platformStorageService } from './storage';
import { networkService } from './network';
import { MessageService } from './messages';
import { ReactionService } from './reactions';
import { firestore } from './firebase';

class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.initialize();
  }

  public async initialize() {
    try {
      // Initialize platform-specific storage
      await platformStorageService.initialize();
      
      // Start sync monitoring
      this.startSyncMonitoring();
      
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }

  private startSyncMonitoring() {
    // Check for queued messages every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncQueuedMessages();
    }, 30000);

    // Listen for network state changes
    networkService.subscribe((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.syncQueuedMessages();
      }
    });
  }

  async queueMessage(message: Message) {
    try {
      console.log('💾 Queueing message to cache:', { 
        id: message.id, 
        chatId: message.chatId, 
        text: message.text?.substring(0, 50) + '...',
        timestamp: message.timestamp 
      });
      await platformStorageService.saveMessage(message);
      console.log('💾 Message queued successfully');
    } catch (error) {
      console.error('Error queueing message:', error);
      throw error;
    }
  }

  async syncQueuedMessages() {
    if (this.isSyncing || !networkService.isOnline()) {
      return;
    }

    this.isSyncing = true;
    this.retryCount = 0;

    try {
      const queuedMessages = await platformStorageService.getQueuedMessages();
      
      if (queuedMessages.length === 0) {
        return;
      }


      for (const message of queuedMessages) {
        try {
          await this.syncMessage(message);
        } catch (error) {
          console.error(`Error syncing message ${message.id}:`, error);
          // Mark as failed if we've exceeded retry limit
          if (this.retryCount >= this.maxRetries) {
            await platformStorageService.updateMessageStatus(message.id, 'failed');
          }
        }
      }

      // Sync queued reactions
      await this.syncQueuedReactions();

    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncMessage(message: Message) {
    try {
      // Handle image messages that need upload
      if (message.imageUrl && !message.imageUrl.startsWith('http')) {
        // This is a local image URI that needs to be uploaded
        const { MediaService } = await import('./media');
        const uploadedImageUrl = await MediaService.uploadChatImage(
          message.chatId,
          message.id,
          message.imageUrl
        );
        
        // Update message with uploaded image URL
        const updatedMessage = {
          ...message,
          imageUrl: uploadedImageUrl
        };
        
        // Sync the updated message
        const sentMessage = await MessageService.syncExistingMessage(updatedMessage);
        await platformStorageService.saveMessage(sentMessage);
      } else {
        // Regular message sync
        const sentMessage = await MessageService.syncExistingMessage(message);
        await platformStorageService.saveMessage(sentMessage);
      }
      
    } catch (error) {
      console.error(`Error syncing message ${message.id}:`, error);
      this.retryCount++;
      throw error;
    }
  }

  private async syncQueuedReactions() {
    try {
      await ReactionService.syncQueuedReactions();
    } catch (error) {
      console.error('Error syncing queued reactions:', error);
    }
  }

  async syncUserData(user: any) {
    try {
      if (!networkService.isOnline()) {
        await platformStorageService.saveUser(user);
        return;
      }

      // Save to both local and remote
      await platformStorageService.saveUser(user);
    } catch (error) {
      console.error('Error syncing user data:', error);
      throw error;
    }
  }

  async syncChatData(chat: any) {
    try {
      if (!networkService.isOnline()) {
        await platformStorageService.saveChat(chat);
        return;
      }

      // Save to both local and remote
      await platformStorageService.saveChat(chat);
    } catch (error) {
      console.error('Error syncing chat data:', error);
      throw error;
    }
  }

  async getOfflineMessages(chatId: string): Promise<Message[]> {
    try {
      console.log('🔍 Getting offline messages for chat:', chatId);
      const messages = await platformStorageService.getMessages(chatId);
      console.log('🔍 Offline messages found:', messages.length);
      return messages;
    } catch (error) {
      console.error('Error getting offline messages:', error);
      return [];
    }
  }

  async getOfflineChats() {
    try {
      return await platformStorageService.getChats();
    } catch (error) {
      console.error('Error getting offline chats:', error);
      return [];
    }
  }

  async getOfflineUser(uid: string) {
    try {
      return await platformStorageService.getUser(uid);
    } catch (error) {
      console.error('Error getting offline user:', error);
      return null;
    }
  }

  async clearOldData() {
    try {
      await platformStorageService.clearOldMessages();
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }

  async deleteChatFromCache(chatId: string) {
    try {
      await platformStorageService.deleteChatFromCache(chatId);
    } catch (error) {
      console.error('Error deleting chat from cache:', error);
      throw error;
    }
  }

  async removeUserFromChat(chatId: string, userId: string) {
    try {
      await platformStorageService.removeUserFromChat(chatId, userId);
    } catch (error) {
      console.error('Error removing user from chat cache:', error);
      throw error;
    }
  }

  async forceSync() {
    await this.syncQueuedMessages();
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();
export default syncService;
