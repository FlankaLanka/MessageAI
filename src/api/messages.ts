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
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    const optimisticMessage: Message = {
      id: optimisticId,
      chatId,
      senderId,
      text,
      timestamp: timestamp,
      status: 'sending',
      isOptimistic: true,
      optimisticId: optimisticId
    };
    
    // Only add senderName and senderPhotoURL if they have values
    if (senderName) {
      optimisticMessage.senderName = senderName;
    }
    if (senderPhotoURL) {
      optimisticMessage.senderPhotoURL = senderPhotoURL;
    }

    // Start Firebase upload in background (non-blocking)
    this.uploadMessageInBackground(optimisticMessage, chatId, senderId, text, senderName, senderPhotoURL);
    
    return optimisticMessage;
  }

  // Upload message to Firebase in background
  private static async uploadMessageInBackground(
    optimisticMessage: Message, 
    chatId: string, 
    senderId: string, 
    text: string, 
    senderName?: string, 
    senderPhotoURL?: string
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        // Offline: Queue for later sync
        await syncService.queueMessage(optimisticMessage);
        return;
      }

      // Online: Send to Firestore
      const messageData: any = {
        senderId,
        text,
        timestamp: serverTimestamp(),
        status: 'sending',
        chatId,
        optimisticId: optimisticMessage.optimisticId, // Include optimistic ID for matching
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
        ...optimisticMessage,
        id: docRef.id,
        status: 'sent',
        isOptimistic: false
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

    } catch (error) {
      console.error('Error uploading message to Firebase:', error);
      // Mark optimistic message as failed
      const failedMessage: Message = {
        ...optimisticMessage,
        status: 'failed'
      };
      await syncService.queueMessage(failedMessage);
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
    console.log('🔄 Setting up message listener for chat:', chatId);
    
    // First, get offline messages
    syncService.getOfflineMessages(chatId).then(offlineMessages => {
      console.log('📱 Offline messages loaded:', { chatId, count: offlineMessages.length });
      if (offlineMessages.length > 0) {
        console.log('📱 Calling callback with offline messages');
        callback(offlineMessages);
      } else {
        console.log('📱 No offline messages found');
      }
    });

    // Then set up real-time listener if online
    if (networkService.isOnline()) {
      console.log('🌐 Setting up Firebase listener for chat:', chatId);
      const messagesRef = collection(firestore, 'messages', chatId, 'threads');
      const q = query(messagesRef, orderBy('timestamp', 'desc'));

      return onSnapshot(q, async (snapshot) => {
        console.log('🔥 Firebase listener triggered:', { chatId, docCount: snapshot.docs.length });
        
        const messages: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const message = {
            id: doc.id,
            ...data,
            timestamp: safeToMillis(data.timestamp),
          } as Message;
          messages.push(message);
        });

        console.log('🔥 Firebase messages processed:', { chatId, count: messages.length });

        // Save to local storage
        for (const message of messages) {
          await syncService.queueMessage(message);
        }

        console.log('🔥 Calling callback with Firebase messages');
        callback(messages);
      }, (error) => {
        console.error('❌ Firebase listener error:', error);
        // Fallback to offline messages
        console.log('🔄 Falling back to offline messages');
        syncService.getOfflineMessages(chatId).then(callback);
      });
    } else {
      console.log('📱 Offline mode - no Firebase listener');
      // Offline: Return offline messages
      return () => {}; // No-op unsubscribe
    }
  }


  // Track which chat the user is currently viewing to avoid notifications for active chats
  private static currentActiveChatId: string | null = null;
  
  // Set the currently active chat (call this when user opens a chat)
  static setActiveChat(chatId: string | null) {
    this.currentActiveChatId = chatId;
  }
  
  // Check if user is currently viewing this chat
  static isUserViewingChat(chatId: string): boolean {
    return this.currentActiveChatId === chatId;
  }
  
  // Note: Push notifications removed for Expo Go compatibility
  // Use the test button in Profile screen to test notifications

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
        
        // Add optional fields if they have values
        if (message.senderName) {
          messageData.senderName = message.senderName;
        }
        if (message.senderPhotoURL) {
          messageData.senderPhotoURL = message.senderPhotoURL;
        }
        if (message.imageUrl) {
          messageData.imageUrl = message.imageUrl;
        }
        if (message.audioUrl) {
          messageData.audioUrl = message.audioUrl;
        }
        if (message.audioDuration) {
          messageData.audioDuration = message.audioDuration;
        }
        if (message.audioSize) {
          messageData.audioSize = message.audioSize;
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
      
      // Handle different message types
      let lastMessageContent: any = {
        senderId: message.senderId,
        timestamp: message.timestamp
      };

      // Only add senderName if it exists
      if (message.senderName) {
        lastMessageContent.senderName = message.senderName;
      }

      if (message.audioUrl) {
        // Voice message
        lastMessageContent = {
          ...lastMessageContent,
          type: 'voice',
          audioUrl: message.audioUrl,
          audioDuration: message.audioDuration,
          text: `🎤 Voice message (${Math.round(message.audioDuration || 0)}s)` // Display text for chat list
        };
      } else if (message.imageUrl) {
        // Image message
        lastMessageContent = {
          ...lastMessageContent,
          type: 'image',
          imageUrl: message.imageUrl,
          text: message.text ? `📷 ${message.text}` : '📷 Image'
        };
      } else {
        // Text message
        lastMessageContent = {
          ...lastMessageContent,
          type: 'text',
          text: message.text
        };
      }

      await updateDoc(chatRef, {
        lastMessage: lastMessageContent,
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

      console.log('🗑️ Starting chat deletion process:', { chatId, userId });

      // Delete all messages in the chat first
      const messagesRef = collection(firestore, 'messages', chatId, 'threads');
      const messagesSnapshot = await getDocs(messagesRef);
      
      console.log('🗑️ Found messages to delete:', messagesSnapshot.docs.length);
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(firestore, 'messages', chatId, 'threads', messageDoc.id))
      );
      
      await Promise.all(deletePromises);
      console.log('🗑️ All messages deleted from Firebase');

      // Delete the chat document
      await deleteDoc(chatRef);
      console.log('🗑️ Chat document deleted from Firebase');

      // Update local cache
      await syncService.deleteChatFromCache(chatId);
      console.log('🗑️ Chat deleted from local cache');

      console.log('✅ Chat deletion completed successfully');

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

    } catch (error) {
      console.error('Error leaving chat:', error);
      throw error;
    }
  }

  // Send an image message with offline support
  static async sendImageMessage(
    chatId: string,
    senderId: string,
    imageUri: string,
    text?: string,  // Optional text with image
    senderName?: string,
    senderPhotoURL?: string
  ): Promise<Message> {
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      chatId,
      senderId,
      text, // Optional text with image
      imageUrl: imageUri, // Local URI for immediate display
      timestamp: Date.now(),
      status: 'sending',
      isOptimistic: true,
      optimisticId: optimisticId
    };
    
    // Only add senderName and senderPhotoURL if they have values
    if (senderName) {
      optimisticMessage.senderName = senderName;
    }
    if (senderPhotoURL) {
      optimisticMessage.senderPhotoURL = senderPhotoURL;
    }

    // Start Firebase upload in background (non-blocking)
    this.uploadImageMessageInBackground(optimisticMessage, chatId, senderId, imageUri, text, senderName, senderPhotoURL);
    
    return optimisticMessage;
  }

  // Upload image message to Firebase in background
  private static async uploadImageMessageInBackground(
    optimisticMessage: Message,
    chatId: string,
    senderId: string,
    imageUri: string,
    text?: string,
    senderName?: string,
    senderPhotoURL?: string
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        // Offline: Queue for later sync
        await syncService.queueMessage(optimisticMessage);
        return;
      }

      // Online: Upload image file to Firebase Storage first
      const { MediaService } = await import('./media');
      const imageUrl = await MediaService.uploadChatImage(chatId, optimisticMessage.id, imageUri);
      
      // Update message with Firebase Storage URL
      const messageData: any = {
        senderId,
        imageUrl,
        timestamp: serverTimestamp(),
        status: 'sending',
        chatId,
        optimisticId: optimisticMessage.optimisticId, // Include optimistic ID for matching
      };
      
      // Add text if provided
      if (text) {
        messageData.text = text;
      }
      
      // Only add senderName and senderPhotoURL if they have values
      if (senderName) {
        messageData.senderName = senderName;
      }
      if (senderPhotoURL) {
        messageData.senderPhotoURL = senderPhotoURL;
      }

      const docRef = await addDoc(collection(firestore, 'messages', chatId, 'threads'), messageData);
      
      // Update local message with server ID and Firebase Storage URL
      const sentMessage: Message = {
        ...optimisticMessage,
        id: docRef.id,
        imageUrl,
        status: 'sent',
        isOptimistic: false
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
          console.error('Error updating image message status:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('Error uploading image message to Firebase:', error);
      // Mark optimistic message as failed
      const failedMessage: Message = {
        ...optimisticMessage,
        status: 'failed'
      };
      await syncService.queueMessage(failedMessage);
    }
  }

  // Send a voice message with offline support
  static async sendVoiceMessage(
    chatId: string, 
    senderId: string, 
    audioUri: string,
    duration: number,
    senderName?: string,
    senderPhotoURL?: string
  ): Promise<Message> {
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      chatId,
      senderId,
      audioUrl: audioUri, // Local URI for immediate display
      audioDuration: duration,
      timestamp: Date.now(),
      status: 'sending',
      isOptimistic: true,
      optimisticId: optimisticId
    };
    
    // Only add senderName and senderPhotoURL if they have values
    if (senderName) {
      optimisticMessage.senderName = senderName;
    }
    if (senderPhotoURL) {
      optimisticMessage.senderPhotoURL = senderPhotoURL;
    }

    // Start Firebase upload in background (non-blocking)
    this.uploadVoiceMessageInBackground(optimisticMessage, chatId, senderId, audioUri, duration, senderName, senderPhotoURL);
    
    return optimisticMessage;
  }

  // Upload voice message to Firebase in background
  private static async uploadVoiceMessageInBackground(
    optimisticMessage: Message,
    chatId: string,
    senderId: string,
    audioUri: string,
    duration: number,
    senderName?: string,
    senderPhotoURL?: string
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        // Offline: Queue for later sync
        await syncService.queueMessage(optimisticMessage);
        return;
      }

      // Online: Upload audio file to Firebase Storage first
      const { MediaService } = await import('./media');
      const audioUrl = await MediaService.uploadVoiceMessage(chatId, optimisticMessage.id, audioUri);
      
      // Get file size
      const { getInfoAsync } = await import('expo-file-system/legacy');
      const fileInfo = await getInfoAsync(audioUri);
      const audioSize = fileInfo.size || 0;

      // Update message with Firebase Storage URL
      const messageData: any = {
        senderId,
        audioUrl,
        audioDuration: duration,
        audioSize,
        timestamp: serverTimestamp(),
        status: 'sending',
        chatId,
        optimisticId: optimisticMessage.optimisticId, // Include optimistic ID for matching
      };
      
      // Only add senderName and senderPhotoURL if they have values
      if (senderName) {
        messageData.senderName = senderName;
      }
      if (senderPhotoURL) {
        messageData.senderPhotoURL = senderPhotoURL;
      }

      const docRef = await addDoc(collection(firestore, 'messages', chatId, 'threads'), messageData);
      
      // Update local message with server ID and Firebase Storage URL
      const sentMessage: Message = {
        ...optimisticMessage,
        id: docRef.id,
        audioUrl,
        audioSize,
        status: 'sent',
        isOptimistic: false
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
          console.error('Error updating voice message status:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('Error uploading voice message to Firebase:', error);
      // Mark optimistic message as failed
      const failedMessage: Message = {
        ...optimisticMessage,
        status: 'failed'
      };
      await syncService.queueMessage(failedMessage);
    }
  }
}
