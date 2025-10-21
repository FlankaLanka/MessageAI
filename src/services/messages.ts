import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  deleteDoc,
  setDoc,
  arrayRemove
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Message, Chat } from '../types';
import { syncService } from './sync';
import { networkService } from './network';

// Helper function to safely convert Firestore timestamp to milliseconds
const safeToMillis = (timestamp: any): number => {
  if (!timestamp) return Date.now();
  if (typeof timestamp === 'number') return timestamp;
  if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }
  return Date.now();
};

export class MessageService {
  // Send a message with offline support
  static async sendMessage(chatId: string, senderId: string, text: string, senderName?: string, senderPhotoURL?: string): Promise<Message> {
    const messageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: Message = {
      id: messageId,
      chatId,
      senderId,
      text,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    // Only add senderName and senderPhotoURL if they have values
    if (senderName) {
      message.senderName = senderName;
    }
    if (senderPhotoURL) {
      message.senderPhotoURL = senderPhotoURL;
    }

    try {
      if (networkService.isOnline()) {
        // Online: Send to Firestore immediately
        const messageData: any = {
          senderId,
          text,
          timestamp: serverTimestamp(),
          status: 'sending',
          chatId,
        };
        
        // Only add senderName and senderPhotoURL if they have values
        if (senderName) {
          messageData.senderName = senderName;
        }
        if (senderPhotoURL) {
          messageData.senderPhotoURL = senderPhotoURL;
        }

        const docRef = await addDoc(collection(firestore, 'messages', chatId, 'threads'), messageData);
        
        // Update local message with server ID
        const sentMessage: Message = {
          ...message,
          id: docRef.id,
          status: 'sent'
        };

        // Save to local storage
        await syncService.queueMessage(sentMessage);

        // Update chat document with latest message info
        await this.updateChatLastMessage(chatId, sentMessage);

        // Update status to sent after a short delay
        setTimeout(async () => {
          try {
            await updateDoc(doc(firestore, 'messages', chatId, 'threads', docRef.id), {
              status: 'sent'
            });
          } catch (error) {
            console.error('Error updating message status:', error);
          }
        }, 1000);

        return sentMessage;
      } else {
        // Offline: Queue for later sync
        console.log('Offline: Queueing message for later sync');
        await syncService.queueMessage(message);
        return message;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark as failed and queue for retry
      const failedMessage: Message = {
        ...message,
        status: 'failed'
      };
      await syncService.queueMessage(failedMessage);
      throw error;
    }
  }

  // Get messages with offline support
  static async getMessages(chatId: string): Promise<Message[]> {
    try {
      if (networkService.isOnline()) {
        // Online: Get from Firestore
        const messagesRef = collection(firestore, 'messages', chatId, 'threads');
        const q = query(messagesRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            ...data,
            timestamp: safeToMillis(data.timestamp),
          } as Message);
        });

        // Also save to local storage for offline access
        for (const message of messages) {
          await syncService.queueMessage(message);
        }

        return messages;
      } else {
        // Offline: Get from local storage
        console.log('Offline: Getting messages from local storage');
        return await syncService.getOfflineMessages(chatId);
      }
    } catch (error) {
      console.error('Error getting messages:', error);
      // Fallback to local storage
      try {
        return await syncService.getOfflineMessages(chatId);
      } catch (fallbackError) {
        console.error('Error getting offline messages:', fallbackError);
        return [];
      }
    }
  }

  // Listen to messages in real-time with offline support
  static onMessagesUpdate(chatId: string, callback: (messages: Message[]) => void) {
    // First, get offline messages
    syncService.getOfflineMessages(chatId).then(offlineMessages => {
      if (offlineMessages.length > 0) {
        callback(offlineMessages);
      }
    });

    // Then set up real-time listener if online
    if (networkService.isOnline()) {
      const messagesRef = collection(firestore, 'messages', chatId, 'threads');
      const q = query(messagesRef, orderBy('timestamp', 'desc'));

      return onSnapshot(q, async (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            ...data,
            timestamp: safeToMillis(data.timestamp),
          } as Message);
        });

        // Save to local storage
        for (const message of messages) {
          await syncService.queueMessage(message);
        }

        callback(messages);
      }, (error) => {
        console.error('Error listening to messages:', error);
        // Fallback to offline messages
        syncService.getOfflineMessages(chatId).then(callback);
      });
    } else {
      // Offline: Return offline messages
      return () => {}; // No-op unsubscribe
    }
  }

  // Create a new chat
  static async createChat(participants: string[], name?: string): Promise<string> {
    try {
      const chatData = {
        type: participants.length > 2 ? 'group' : 'direct',
        participants,
        name: name || null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, 'chats'), chatData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // Get user's chats
  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const chatsRef = collection(firestore, 'chats');
      const q = query(chatsRef);
      const snapshot = await getDocs(q);
      
      const chats: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants?.includes(userId)) {
          chats.push({
            id: doc.id,
            type: data.type,
            participants: data.participants,
            name: data.name,
            lastMessage: data.lastMessage,
            lastMessageTime: data.lastMessageTime,
            iconURL: data.iconURL,
            adminIds: data.adminIds,
            muted: data.muted,
            mutedBy: data.mutedBy,
            mutedAt: data.mutedAt,
            createdAt: safeToMillis(data.createdAt),
            createdBy: data.createdBy,
            updatedAt: safeToMillis(data.updatedAt),
          } as Chat);
        }
      });
      
      return chats;
    } catch (error) {
      console.error('Error getting user chats:', error);
      throw error;
    }
  }

  // Update message status
  static async updateMessageStatus(chatId: string, messageId: string, status: Message['status']) {
    try {
      await updateDoc(doc(firestore, 'messages', chatId, 'threads', messageId), {
        status
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }

  // Sync an existing message (for offline sync)
  static async syncExistingMessage(message: Message): Promise<Message> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot sync message while offline');
      }

      // Check if message already exists in Firestore
      const messageRef = doc(firestore, 'messages', message.chatId, 'threads', message.id);
      const messageSnap = await getDoc(messageRef);
      
      if (messageSnap.exists()) {
        // Message already exists, just update its status
        await updateDoc(messageRef, { 
          status: 'sent',
          updatedAt: serverTimestamp()
        });
        
        return {
          ...message,
          status: 'sent'
        };
      } else {
        // Message doesn't exist, create it
        const messageData: any = {
          senderId: message.senderId,
          text: message.text,
          timestamp: serverTimestamp(),
          status: 'sent',
          chatId: message.chatId,
        };
        
        // Only add senderName and senderPhotoURL if they have values
        if (message.senderName) {
          messageData.senderName = message.senderName;
        }
        if (message.senderPhotoURL) {
          messageData.senderPhotoURL = message.senderPhotoURL;
        }

        await setDoc(messageRef, messageData);
        
        const sentMessage = {
          ...message,
          status: 'sent'
        };

        // Update chat document with latest message info
        await this.updateChatLastMessage(message.chatId, sentMessage);
        
        return sentMessage;
      }
    } catch (error) {
      console.error('Error syncing existing message:', error);
      throw error;
    }
  }

  // Update chat document with latest message info
  static async updateChatLastMessage(chatId: string, message: Message): Promise<void> {
    try {
      const chatRef = doc(firestore, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          text: message.text,
          senderId: message.senderId,
          senderName: message.senderName,
          timestamp: message.timestamp
        },
        lastMessageTime: message.timestamp,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating chat last message:', error);
      // Don't throw error here as it shouldn't prevent message sending
    }
  }

  // Delete a chat
  static async deleteChat(chatId: string, userId: string): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot delete chat while offline');
      }

      // Get chat details to check permissions
      const chatRef = doc(firestore, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        throw new Error('Chat not found');
      }

      const chatData = chatSnap.data();
      
      // Check if user is participant
      if (!chatData.participants?.includes(userId)) {
        throw new Error('You are not a participant in this chat');
      }

      // For group chats, check if user is admin
      if (chatData.type === 'group') {
        if (!chatData.adminIds?.includes(userId)) {
          throw new Error('Only group admins can delete the group');
        }
      }

      // Delete the chat document
      await deleteDoc(chatRef);

      // Delete all messages in the chat
      const messagesRef = collection(firestore, 'messages', chatId, 'threads');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(firestore, 'messages', chatId, 'threads', messageDoc.id))
      );
      
      await Promise.all(deletePromises);

      // Update local cache
      await syncService.deleteChatFromCache(chatId);

      console.log('Chat deleted successfully:', chatId);
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  // Leave a chat (for group chats)
  static async leaveChat(chatId: string, userId: string): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot leave chat while offline');
      }

      const chatRef = doc(firestore, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        throw new Error('Chat not found');
      }

      const chatData = chatSnap.data();
      
      // Check if user is participant
      if (!chatData.participants?.includes(userId)) {
        throw new Error('You are not a participant in this chat');
      }

      // Remove user from participants and admins
      await updateDoc(chatRef, {
        participants: arrayRemove(userId),
        adminIds: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });

      // Update local cache
      await syncService.removeUserFromChat(chatId, userId);

      console.log('User left chat successfully:', chatId);
    } catch (error) {
      console.error('Error leaving chat:', error);
      throw error;
    }
  }
}
