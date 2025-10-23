import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from './firebase';
import { MessageReaction } from '../types';
import { networkService } from './network';
import { sqliteService } from './sqlite';

export class ReactionService {
  // Add or update user's reaction on a message
  static async addReaction(
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string,
    userName: string,
    userPhotoURL?: string
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        // Queue reaction for offline sync
        await this.queueReaction(chatId, messageId, emoji, userId, userName, userPhotoURL, 'add');
        return;
      }

      const messageRef = doc(firestore, 'messages', chatId, 'threads', messageId);
      
      // First, remove any existing reaction from this user
      await this.removeReaction(chatId, messageId, userId);
      
      // Add the new reaction
      const reaction: MessageReaction = {
        emoji,
        userId,
        userName,
        userPhotoURL,
        timestamp: Date.now()
      };

      await updateDoc(messageRef, {
        reactions: arrayUnion(reaction),
        updatedAt: serverTimestamp()
      });

      console.log('Reaction added successfully:', emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  // Remove user's reaction from a message
  static async removeReaction(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        // Queue reaction removal for offline sync
        await this.queueReaction(chatId, messageId, '', userId, '', '', 'remove');
        return;
      }

      const messageRef = doc(firestore, 'messages', chatId, 'threads', messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        throw new Error('Message not found');
      }

      const messageData = messageSnap.data();
      const reactions = messageData.reactions || [];
      
      // Find the user's reaction to remove
      const userReaction = reactions.find((r: MessageReaction) => r.userId === userId);
      
      if (userReaction) {
        await updateDoc(messageRef, {
          reactions: arrayRemove(userReaction),
          updatedAt: serverTimestamp()
        });
        
        console.log('Reaction removed successfully');
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  // Get all reactions for a message
  static async getReactions(
    chatId: string,
    messageId: string
  ): Promise<MessageReaction[]> {
    try {
      const messageRef = doc(firestore, 'messages', chatId, 'threads', messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        return [];
      }

      const messageData = messageSnap.data();
      return messageData.reactions || [];
    } catch (error) {
      console.error('Error getting reactions:', error);
      return [];
    }
  }

  // Subscribe to reaction changes (real-time)
  static onReactionsUpdate(
    chatId: string,
    messageId: string,
    callback: (reactions: MessageReaction[]) => void
  ): () => void {
    if (!networkService.isOnline()) {
      // Return offline reactions from cache
      this.getOfflineReactions(chatId, messageId).then(callback);
      return () => {}; // No-op unsubscribe
    }

    const messageRef = doc(firestore, 'messages', chatId, 'threads', messageId);
    
    return onSnapshot(messageRef, (doc) => {
      if (doc.exists()) {
        const messageData = doc.data();
        const reactions = messageData.reactions || [];
        callback(reactions);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to reactions:', error);
      // Fallback to offline reactions
      this.getOfflineReactions(chatId, messageId).then(callback);
    });
  }

  // Queue reaction for offline sync
  private static async queueReaction(
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string,
    userName: string,
    userPhotoURL: string | undefined,
    action: 'add' | 'remove'
  ): Promise<void> {
    try {
      const reactionId = `${messageId}_${userId}_${Date.now()}`;
      
      await sqliteService.queueReaction({
        id: reactionId,
        chatId,
        messageId,
        emoji,
        userId,
        userName,
        userPhotoURL,
        timestamp: Date.now(),
        action
      });
      
      console.log('Reaction queued for offline sync:', action);
    } catch (error) {
      console.error('Error queueing reaction:', error);
      throw error;
    }
  }

  // Get reactions from offline cache
  private static async getOfflineReactions(
    chatId: string,
    messageId: string
  ): Promise<MessageReaction[]> {
    try {
      // This would need to be implemented in sqliteService
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting offline reactions:', error);
      return [];
    }
  }

  // Sync queued reactions when back online
  static async syncQueuedReactions(): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        return;
      }

      const pendingReactions = await sqliteService.getPendingReactions();
      
      for (const reaction of pendingReactions) {
        try {
          if (reaction.action === 'add') {
            await this.addReaction(
              reaction.chatId,
              reaction.messageId,
              reaction.emoji,
              reaction.userId,
              reaction.userName,
              reaction.userPhotoURL
            );
          } else if (reaction.action === 'remove') {
            await this.removeReaction(
              reaction.chatId,
              reaction.messageId,
              reaction.userId
            );
          }
        } catch (error) {
          console.error('Error syncing reaction:', error);
          // Continue with other reactions
        }
      }

      // Clear synced reactions
      await sqliteService.clearPendingReactions();
      console.log('Queued reactions synced successfully');
    } catch (error) {
      console.error('Error syncing queued reactions:', error);
    }
  }
}
