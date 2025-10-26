import { Platform } from 'react-native';
import { Message, User } from '../types';

// Web storage interface using localStorage
class WebStorageService {
  private getStorageKey(key: string): string {
    return `messageai_${key}`;
  }

  async saveMessage(message: Message): Promise<void> {
    try {
      const key = this.getStorageKey(`message_${message.id}`);
      localStorage.setItem(key, JSON.stringify(message));
    } catch (error) {
      console.error('Error saving message to localStorage:', error);
      throw error;
    }
  }

  async getMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      const messages: Message[] = [];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.getStorageKey('message_'))) {
          const messageData = localStorage.getItem(key);
          if (messageData) {
            const message = JSON.parse(messageData) as Message;
            if (message.chatId === chatId) {
              messages.push(message);
            }
          }
        }
      }

      // Sort by timestamp and apply limit/offset
      return messages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting messages from localStorage:', error);
      return [];
    }
  }

  async updateMessageStatus(messageId: string, status: Message['status']): Promise<void> {
    try {
      const key = this.getStorageKey(`message_${messageId}`);
      const messageData = localStorage.getItem(key);
      if (messageData) {
        const message = JSON.parse(messageData) as Message;
        message.status = status;
        localStorage.setItem(key, JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error updating message status in localStorage:', error);
      throw error;
    }
  }

  async getQueuedMessages(): Promise<Message[]> {
    try {
      const messages: Message[] = [];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.getStorageKey('message_'))) {
          const messageData = localStorage.getItem(key);
          if (messageData) {
            const message = JSON.parse(messageData) as Message;
            if (message.status === 'sending' || message.status === 'failed') {
              messages.push(message);
            }
          }
        }
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error getting queued messages from localStorage:', error);
      return [];
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const key = this.getStorageKey(`user_${user.uid}`);
      localStorage.setItem(key, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
      throw error;
    }
  }

  async getUser(uid: string): Promise<User | null> {
    try {
      const key = this.getStorageKey(`user_${uid}`);
      const userData = localStorage.getItem(key);
      if (userData) {
        return JSON.parse(userData) as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return null;
    }
  }

  async saveChat(chat: any): Promise<void> {
    try {
      const key = this.getStorageKey(`chat_${chat.id}`);
      localStorage.setItem(key, JSON.stringify(chat));
    } catch (error) {
      console.error('Error saving chat to localStorage:', error);
      throw error;
    }
  }

  async getChats(): Promise<any[]> {
    try {
      const chats: any[] = [];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.getStorageKey('chat_'))) {
          const chatData = localStorage.getItem(key);
          if (chatData) {
            chats.push(JSON.parse(chatData));
          }
        }
      }

      return chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    } catch (error) {
      console.error('Error getting chats from localStorage:', error);
      return [];
    }
  }

  async clearOldMessages(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.getStorageKey('message_'))) {
          const messageData = localStorage.getItem(key);
          if (messageData) {
            const message = JSON.parse(messageData) as Message;
            if (message.timestamp < cutoffTime && message.status === 'sent') {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
    }
  }

  async deleteChatFromCache(chatId: string): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.getStorageKey('message_')) || key.startsWith(this.getStorageKey('chat_'))) {
          const data = localStorage.getItem(key);
          if (data) {
            const item = JSON.parse(data);
            if (item.chatId === chatId || item.id === chatId) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error deleting chat from localStorage cache:', error);
      throw error;
    }
  }

  async removeUserFromChat(chatId: string, userId: string): Promise<void> {
    try {
      const key = this.getStorageKey(`chat_${chatId}`);
      const chatData = localStorage.getItem(key);
      if (chatData) {
        const chat = JSON.parse(chatData);
        if (chat.participants) {
          chat.participants = chat.participants.filter((id: string) => id !== userId);
          localStorage.setItem(key, JSON.stringify(chat));
        }
      }
    } catch (error) {
      console.error('Error removing user from chat cache:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    // localStorage doesn't need explicit closing
  }
}

// Platform-specific storage service
class PlatformStorageService {
  private webStorage: WebStorageService;
  private sqliteService: any;

  constructor() {
    this.webStorage = new WebStorageService();
    
    // Dynamically import SQLite service for React Native
    if (Platform.OS !== 'web') {
      this.initializeSQLite();
    }
  }

  private async initializeSQLite() {
    try {
      const { sqliteService } = await import('./sqlite');
      this.sqliteService = sqliteService;
      // Initialize the SQLite service immediately
      await this.sqliteService.initialize();
    } catch (error) {
      console.error('Error importing SQLite service:', error);
    }
  }

  async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    if (this.sqliteService) {
      await this.sqliteService.initialize();
    }
  }

  async saveMessage(message: Message): Promise<void> {
    if (Platform.OS === 'web') {
      return this.webStorage.saveMessage(message);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.saveMessage(message);
    }
    
    throw new Error('Storage service not initialized');
  }

  async getMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    if (Platform.OS === 'web') {
      return this.webStorage.getMessages(chatId, limit, offset);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.getMessages(chatId, limit, offset);
    }
    
    return [];
  }

  async updateMessageStatus(messageId: string, status: Message['status']): Promise<void> {
    if (Platform.OS === 'web') {
      return this.webStorage.updateMessageStatus(messageId, status);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.updateMessageStatus(messageId, status);
    }
  }

  async getQueuedMessages(): Promise<Message[]> {
    if (Platform.OS === 'web') {
      return this.webStorage.getQueuedMessages();
    }
    
    if (this.sqliteService) {
      return this.sqliteService.getQueuedMessages();
    }
    
    return [];
  }

  async saveUser(user: User): Promise<void> {
    if (Platform.OS === 'web') {
      return this.webStorage.saveUser(user);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.saveUser(user);
    }
  }

  async getUser(uid: string): Promise<User | null> {
    if (Platform.OS === 'web') {
      return this.webStorage.getUser(uid);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.getUser(uid);
    }
    
    return null;
  }

  async saveChat(chat: any): Promise<void> {
    if (Platform.OS === 'web') {
      return this.webStorage.saveChat(chat);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.saveChat(chat);
    }
  }

  async getChats(): Promise<any[]> {
    if (Platform.OS === 'web') {
      return this.webStorage.getChats();
    }
    
    if (this.sqliteService) {
      return this.sqliteService.getChats();
    }
    
    return [];
  }

  async clearOldMessages(daysToKeep: number = 30): Promise<void> {
    if (Platform.OS === 'web') {
      return this.webStorage.clearOldMessages(daysToKeep);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.clearOldMessages(daysToKeep);
    }
  }

  async deleteChatFromCache(chatId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return this.webStorage.deleteChatFromCache(chatId);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.deleteChatFromCache(chatId);
    }
  }

  async removeUserFromChat(chatId: string, userId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return this.webStorage.removeUserFromChat(chatId, userId);
    }
    
    if (this.sqliteService) {
      return this.sqliteService.removeUserFromChat(chatId, userId);
    }
  }

  async close(): Promise<void> {
    if (Platform.OS === 'web') {
      return this.webStorage.close();
    }
    
    if (this.sqliteService) {
      return this.sqliteService.close();
    }
  }
}

export const platformStorageService = new PlatformStorageService();
export default platformStorageService;
