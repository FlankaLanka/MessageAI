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

    // Create messages table with migration support
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

    // Add audio columns if they don't exist (migration)
    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN audioUrl TEXT;`);
    } catch (error) {
      // Column already exists, ignore error
      console.log('audioUrl column already exists or error adding:', error);
    }

    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN audioDuration REAL;`);
    } catch (error) {
      // Column already exists, ignore error
      console.log('audioDuration column already exists or error adding:', error);
    }

    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN audioSize INTEGER;`);
    } catch (error) {
      // Column already exists, ignore error
      console.log('audioSize column already exists or error adding:', error);
    }

    // Add new translation structure columns (migration)
    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN originalText TEXT;`);
    } catch (error) {
      console.log('originalText column already exists or error adding:', error);
    }

    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN originalLang TEXT;`);
    } catch (error) {
      console.log('originalLang column already exists or error adding:', error);
    }

    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN translations TEXT;`);
    } catch (error) {
      console.log('translations column already exists or error adding:', error);
    }

    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN transcription TEXT;`);
    } catch (error) {
      console.log('transcription column already exists or error adding:', error);
    }

    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN transcriptionLang TEXT;`);
    } catch (error) {
      console.log('transcriptionLang column already exists or error adding:', error);
    }

    try {
      await this.db.execAsync(`ALTER TABLE messages ADD COLUMN reactions TEXT;`);
    } catch (error) {
      console.log('reactions column already exists or error adding:', error);
    }

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

    // Create cultural hints cache table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS cultural_hints_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        language TEXT NOT NULL,
        hints TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        UNIQUE(text, language)
      );
    `);

    // Create translation queue table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS translation_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        messageId TEXT NOT NULL,
        text TEXT NOT NULL,
        targetLanguage TEXT NOT NULL,
        sourceLanguage TEXT,
        isVoiceMessage INTEGER DEFAULT 0,
        audioUri TEXT,
        timestamp INTEGER NOT NULL
      );
    `);

    // Create pending reactions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_reactions (
        id TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        messageId TEXT NOT NULL,
        emoji TEXT NOT NULL,
        userId TEXT NOT NULL,
        userName TEXT NOT NULL,
        userPhotoURL TEXT,
        timestamp INTEGER NOT NULL,
        action TEXT NOT NULL
      );
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_messages_chatId ON messages(chatId);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
      CREATE INDEX IF NOT EXISTS idx_cultural_hints_lookup ON cultural_hints_cache(text, language, timestamp);
    `);

    console.log('SQLite tables created successfully');
  }

  // Message operations
  async saveMessage(message: Message) {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // First try with all columns (including audio and translation fields)
      try {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO messages 
           (id, chatId, senderId, text, imageUrl, audioUrl, audioDuration, audioSize, originalText, originalLang, translations, transcription, transcriptionLang, reactions, timestamp, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            message.id,
            message.chatId,
            message.senderId,
            message.text || null,
            message.imageUrl || null,
            message.audioUrl || null,
            message.audioDuration || null,
            message.audioSize || null,
            message.originalText || message.text || null,
            message.originalLang || null,
            message.translations ? JSON.stringify(message.translations) : null,
            message.transcription || null,
            message.transcriptionLang || null,
            message.reactions ? JSON.stringify(message.reactions) : null,
            message.timestamp,
            message.status,
            Date.now(),
            Date.now()
          ]
        );
      } catch (error) {
        // If audio columns don't exist, try without them (fallback)
        console.log('Audio columns not available, saving without audio fields:', error);
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
      }
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

      return result.map(row => {
        const message: Message = {
          id: row.id as string,
          chatId: row.chatId as string,
          senderId: row.senderId as string,
          text: row.text as string | undefined,
          imageUrl: row.imageUrl as string | undefined,
          audioUrl: (row as any).audioUrl as string | undefined,
          audioDuration: (row as any).audioDuration as number | undefined,
          audioSize: (row as any).audioSize as number | undefined,
          timestamp: row.timestamp as number,
          status: row.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
        };

        // Parse translation and cultural hint fields if they exist
        if ((row as any).originalLang) {
          message.originalLang = (row as any).originalLang as string;
        }
        if ((row as any).translations) {
          try {
            message.translations = JSON.parse((row as any).translations as string);
          } catch (error) {
            console.error('Error parsing translations JSON:', error);
          }
        }
        if ((row as any).culturalHints) {
          try {
            message.culturalHints = JSON.parse((row as any).culturalHints as string);
          } catch (error) {
            console.error('Error parsing culturalHints JSON:', error);
          }
        }
        if ((row as any).transcription) {
          message.transcription = (row as any).transcription as string;
        }
        if ((row as any).reactions) {
          try {
            message.reactions = JSON.parse((row as any).reactions as string);
          } catch (error) {
            console.error('Error parsing reactions JSON:', error);
          }
        }

        return message;
      });
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

  async updateMessageTranscription(messageId: string, transcription: string, originalLanguage?: string) {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE messages SET transcription = ?, transcriptionLang = ?, updatedAt = ? WHERE id = ?`,
        [transcription, originalLanguage || null, Date.now(), messageId]
      );
      console.log('Message transcription updated in SQLite:', messageId);
    } catch (error) {
      console.error('Error updating message transcription in SQLite:', error);
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

      return result.map(row => {
        const message: Message = {
          id: row.id as string,
          chatId: row.chatId as string,
          senderId: row.senderId as string,
          text: row.text as string | undefined,
          imageUrl: row.imageUrl as string | undefined,
          audioUrl: (row as any).audioUrl as string | undefined,
          audioDuration: (row as any).audioDuration as number | undefined,
          audioSize: (row as any).audioSize as number | undefined,
          timestamp: row.timestamp as number,
          status: row.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
        };

        // Parse translation and cultural hint fields if they exist
        if ((row as any).originalLang) {
          message.originalLang = (row as any).originalLang as string;
        }
        if ((row as any).translations) {
          try {
            message.translations = JSON.parse((row as any).translations as string);
          } catch (error) {
            console.error('Error parsing translations JSON:', error);
          }
        }
        if ((row as any).culturalHints) {
          try {
            message.culturalHints = JSON.parse((row as any).culturalHints as string);
          } catch (error) {
            console.error('Error parsing culturalHints JSON:', error);
          }
        }
        if ((row as any).transcription) {
          message.transcription = (row as any).transcription as string;
        }
        if ((row as any).reactions) {
          try {
            message.reactions = JSON.parse((row as any).reactions as string);
          } catch (error) {
            console.error('Error parsing reactions JSON:', error);
          }
        }

        return message;
      });
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

  // Reaction Queue Methods
  async queueReaction(reaction: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO pending_reactions 
         (id, chatId, messageId, emoji, userId, userName, userPhotoURL, timestamp, action)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reaction.id,
          reaction.chatId,
          reaction.messageId,
          reaction.emoji,
          reaction.userId,
          reaction.userName,
          reaction.userPhotoURL || null,
          reaction.timestamp,
          reaction.action
        ]
      );
      console.log('Reaction queued:', reaction.id);
    } catch (error) {
      console.error('Error queueing reaction:', error);
      throw error;
    }
  }

  async getPendingReactions(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM pending_reactions ORDER BY timestamp ASC'
      );
      return result;
    } catch (error) {
      console.error('Error getting pending reactions:', error);
      throw error;
    }
  }

  async clearPendingReactions(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM pending_reactions');
      console.log('All pending reactions cleared');
    } catch (error) {
      console.error('Error clearing pending reactions:', error);
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
