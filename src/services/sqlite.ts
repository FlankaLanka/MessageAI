import * as SQLite from 'expo-sqlite';
import { Message, User } from '../types';

class SQLiteService {
  public db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    try {
      this.db = await SQLite.openDatabaseAsync('messageai.db');
      await this.createTables();
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Create messages table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        text TEXT,
        imageUrl TEXT,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'sending',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);

    // Create users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        displayName TEXT NOT NULL,
        photoURL TEXT,
        status TEXT NOT NULL DEFAULT 'offline',
        lastSeen INTEGER NOT NULL,
        pushToken TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);

    // Create pending read receipts table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_read_receipts (
        id TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        messageId TEXT NOT NULL,
        userId TEXT NOT NULL,
        userName TEXT NOT NULL,
        userPhotoURL TEXT,
        timestamp INTEGER NOT NULL
      );
    `);

    // Create chats table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT NOT NULL DEFAULT 'direct',
        participants TEXT NOT NULL,
        lastMessageId TEXT,
        lastMessageTime INTEGER,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_messages_chatId ON messages(chatId);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
    `);

    console.log('SQLite tables created successfully');
  }

  // Message operations
  async saveMessage(message: Message) {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO messages 
         (id, chatId, senderId, text, imageUrl, timestamp, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.id,
          message.chatId,
          message.senderId,
          message.text || null,
          message.imageUrl || null,
          message.timestamp,
          message.status,
          Date.now(),
          Date.now()
        ]
      );
      console.log('Message saved to SQLite:', message.id);
    } catch (error) {
      console.error('Error saving message to SQLite:', error);
      throw error;
    }
  }

  async getMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM messages 
         WHERE chatId = ? 
         ORDER BY timestamp DESC 
         LIMIT ? OFFSET ?`,
        [chatId, limit, offset]
      );

      return result.map(row => ({
        id: row.id as string,
        chatId: row.chatId as string,
        senderId: row.senderId as string,
        text: row.text as string | undefined,
        imageUrl: row.imageUrl as string | undefined,
        timestamp: row.timestamp as number,
        status: row.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
      }));
    } catch (error) {
      console.error('Error getting messages from SQLite:', error);
      throw error;
    }
  }

  async updateMessageStatus(messageId: string, status: Message['status']) {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE messages SET status = ?, updatedAt = ? WHERE id = ?`,
        [status, Date.now(), messageId]
      );
      console.log('Message status updated in SQLite:', messageId, status);
    } catch (error) {
      console.error('Error updating message status in SQLite:', error);
      throw error;
    }
  }

  async getQueuedMessages(): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM messages 
         WHERE status IN ('sending', 'failed') 
         ORDER BY timestamp ASC`
      );

      return result.map(row => ({
        id: row.id as string,
        chatId: row.chatId as string,
        senderId: row.senderId as string,
        text: row.text as string | undefined,
        imageUrl: row.imageUrl as string | undefined,
        timestamp: row.timestamp as number,
        status: row.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
      }));
    } catch (error) {
      console.error('Error getting queued messages from SQLite:', error);
      throw error;
    }
  }

  // User operations
  async saveUser(user: User) {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO users 
         (uid, email, firstName, lastName, displayName, photoURL, status, lastSeen, pushToken, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.uid,
          user.email,
          user.firstName,
          user.lastName,
          user.displayName,
          user.photoURL || null,
          user.status,
          user.lastSeen,
          user.pushToken || null,
          user.createdAt,
          user.updatedAt
        ]
      );
      console.log('User saved to SQLite:', user.uid);
    } catch (error) {
      console.error('Error saving user to SQLite:', error);
      throw error;
    }
  }

  async getUser(uid: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(
        `SELECT * FROM users WHERE uid = ?`,
        [uid]
      );

      if (!result) return null;

      return {
        uid: result.uid as string,
        email: result.email as string,
        firstName: result.firstName as string,
        lastName: result.lastName as string,
        displayName: result.displayName as string,
        photoURL: result.photoURL as string,
        status: result.status as 'online' | 'offline',
        lastSeen: result.lastSeen as number,
        pushToken: result.pushToken as string | undefined,
        createdAt: result.createdAt as number,
        updatedAt: result.updatedAt as number
      };
    } catch (error) {
      console.error('Error getting user from SQLite:', error);
      throw error;
    }
  }

  // Chat operations
  async saveChat(chat: any) {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO chats 
         (id, name, type, participants, lastMessageId, lastMessageTime, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          chat.id,
          chat.name || null,
          chat.type || 'direct',
          JSON.stringify(chat.participants || []),
          chat.lastMessageId || null,
          chat.lastMessageTime || null,
          chat.createdAt || Date.now(),
          chat.updatedAt || Date.now()
        ]
      );
      console.log('Chat saved to SQLite:', chat.id);
    } catch (error) {
      console.error('Error saving chat to SQLite:', error);
      throw error;
    }
  }

  async getChats(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM chats ORDER BY lastMessageTime DESC`
      );

      return result.map(row => ({
        id: row.id as string,
        name: row.name as string,
        type: row.type as string,
        participants: JSON.parse(row.participants as string),
        lastMessageId: row.lastMessageId as string,
        lastMessageTime: row.lastMessageTime as number,
        createdAt: row.createdAt as number,
        updatedAt: row.updatedAt as number
      }));
    } catch (error) {
      console.error('Error getting chats from SQLite:', error);
      throw error;
    }
  }

  async deleteChatFromCache(chatId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Delete chat from chats table
      await this.db.runAsync(
        `DELETE FROM chats WHERE id = ?`,
        [chatId]
      );

      // Delete all messages for this chat
      await this.db.runAsync(
        `DELETE FROM messages WHERE chatId = ?`,
        [chatId]
      );

      console.log('Chat and messages deleted from SQLite cache:', chatId);
    } catch (error) {
      console.error('Error deleting chat from SQLite cache:', error);
      throw error;
    }
  }

  // Cleanup operations
  async clearOldMessages(daysToKeep: number = 30) {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      await this.db.runAsync(
        `DELETE FROM messages WHERE timestamp < ? AND status = 'sent'`,
        [cutoffTime]
      );
      console.log('Old messages cleaned up from SQLite');
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
      throw error;
    }
  }

  // Read Receipt Queue Methods
  async queueReadReceipt(receipt: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO pending_read_receipts 
         (id, chatId, messageId, userId, userName, userPhotoURL, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          receipt.id,
          receipt.chatId,
          receipt.messageId,
          receipt.userId,
          receipt.userName,
          receipt.userPhotoURL || null,
          receipt.timestamp
        ]
      );
      console.log('Read receipt queued:', receipt.id);
    } catch (error) {
      console.error('Error queueing read receipt:', error);
      throw error;
    }
  }

  async getPendingReadReceipts(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM pending_read_receipts ORDER BY timestamp ASC'
      );
      return result;
    } catch (error) {
      console.error('Error getting pending read receipts:', error);
      throw error;
    }
  }

  async clearPendingReadReceipts(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM pending_read_receipts');
      console.log('All pending read receipts cleared');
    } catch (error) {
      console.error('Error clearing pending read receipts:', error);
      throw error;
    }
  }


  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('SQLite database closed');
    }
  }
}

export const sqliteService = new SQLiteService();
export default sqliteService;
