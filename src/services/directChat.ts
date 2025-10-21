import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { User } from '../types';

export interface DirectChat {
  id: string;
  participants: string[];
  createdAt: number;
  updatedAt: number;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
  };
}

export class DirectChatService {
  // Create a new direct chat between two users
  static async createDirectChat(user1Id: string, user2Id: string): Promise<string> {
    try {
      console.log('Creating direct chat between:', user1Id, 'and', user2Id);
      
      // Check if direct chat already exists
      const existingChat = await this.findDirectChat(user1Id, user2Id);
      if (existingChat) {
        console.log('Direct chat already exists:', existingChat.id);
        return existingChat.id;
      }
      
      // Create new direct chat
      const chatId = `direct_${user1Id}_${user2Id}_${Date.now()}`;
      const chatRef = doc(firestore, 'chats', chatId);
      
      const chatData = {
        id: chatId,
        type: 'direct',
        participants: [user1Id, user2Id],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(chatRef, chatData);
      console.log('Direct chat created successfully:', chatId);
      
      return chatId;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      throw error;
    }
  }
  
  // Find existing direct chat between two users
  static async findDirectChat(user1Id: string, user2Id: string): Promise<DirectChat | null> {
    try {
      const chatsRef = collection(firestore, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'direct'),
        where('participants', 'array-contains', user1Id)
      );
      
      const snapshot = await getDocs(q);
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.participants.includes(user2Id)) {
          return {
            id: docSnap.id,
            participants: data.participants,
            createdAt: data.createdAt?.toMillis() || Date.now(),
            updatedAt: data.updatedAt?.toMillis() || Date.now(),
            lastMessage: data.lastMessage,
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding direct chat:', error);
      throw error;
    }
  }
  
  // Get all direct chats for a user
  static async getUserDirectChats(userId: string): Promise<DirectChat[]> {
    try {
      const chatsRef = collection(firestore, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'direct'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const chats: DirectChat[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          participants: data.participants,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
          lastMessage: data.lastMessage,
        });
      });
      
      return chats;
    } catch (error) {
      console.error('Error getting user direct chats:', error);
      throw error;
    }
  }
  
  // Search for users to start a chat with
  static async searchUsers(currentUserId: string, searchTerm: string): Promise<User[]> {
    try {
      if (!searchTerm.trim()) {
        return [];
      }
      
      console.log('Searching for users with term:', searchTerm);
      const usersRef = collection(firestore, 'users');
      const searchLower = searchTerm.toLowerCase();
      
      // For email searches, use exact match
      if (searchTerm.includes('@')) {
        const emailQuery = query(usersRef, where('email', '==', searchTerm));
        const emailSnapshot = await getDocs(emailQuery);
        
        const users: User[] = [];
        emailSnapshot.forEach(doc => {
          const data = doc.data();
          const user: User = {
            uid: doc.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: data.displayName,
            photoURL: data.photoURL || '',
            phoneNumber: data.phoneNumber,
            status: data.status || 'offline',
            lastSeen: data.lastSeen || Date.now(),
            pushToken: data.pushToken,
            isDeleted: data.isDeleted || false,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          };
          
          if (!user.isDeleted && user.uid !== currentUserId) {
            users.push(user);
          }
        });
        
        console.log('Email search results:', users.length);
        return users;
      }
      
      // For name searches, use prefix matching
      const queries = [
        query(usersRef, where('displayName', '>=', searchTerm), where('displayName', '<=', searchTerm + '\uf8ff')),
        query(usersRef, where('firstName', '>=', searchTerm), where('firstName', '<=', searchTerm + '\uf8ff')),
        query(usersRef, where('lastName', '>=', searchTerm), where('lastName', '<=', searchTerm + '\uf8ff')),
      ];
      
      const allResults = await Promise.all(
        queries.map(q => getDocs(q))
      );
      
      const userMap = new Map<string, User>();
      
      allResults.forEach(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          const user: User = {
            uid: doc.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: data.displayName,
            photoURL: data.photoURL || '',
            phoneNumber: data.phoneNumber,
            status: data.status || 'offline',
            lastSeen: data.lastSeen || Date.now(),
            pushToken: data.pushToken,
            isDeleted: data.isDeleted || false,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          };
          
          // Filter out deleted users and current user
          if (!user.isDeleted && user.uid !== currentUserId) {
            userMap.set(user.uid, user);
          }
        });
      });
      
      const results = Array.from(userMap.values());
      console.log('Name search results:', results.length);
      return results;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
  
  // Get the other participant in a direct chat
  static async getOtherParticipant(chatId: string, currentUserId: string): Promise<User | null> {
    try {
      const chatRef = doc(firestore, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        return null;
      }
      
      const data = chatSnap.data();
      const otherUserId = data.participants.find((id: string) => id !== currentUserId);
      
      if (!otherUserId) {
        return null;
      }
      
      // Get user profile
      const userRef = doc(firestore, 'users', otherUserId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      const userData = userSnap.data();
      return {
        uid: userSnap.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName,
        photoURL: userData.photoURL || '',
        phoneNumber: userData.phoneNumber,
        status: userData.status || 'offline',
        lastSeen: userData.lastSeen || Date.now(),
        pushToken: userData.pushToken,
        isDeleted: userData.isDeleted || false,
        createdAt: userData.createdAt || Date.now(),
        updatedAt: userData.updatedAt || Date.now(),
      };
    } catch (error) {
      console.error('Error getting other participant:', error);
      throw error;
    }
  }
}
