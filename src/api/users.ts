import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from './firebase';
import { User } from '../types';
import { AuthService } from './auth';

export class UserService {
  // Get user profile by UID
  static async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userRef = doc(firestore, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid: userSnap.id,
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
          defaultLanguage: data.defaultLanguage || 'EN',
          translationMode: data.translationMode || 'manual',
          translationCacheEnabled: data.translationCacheEnabled !== undefined ? data.translationCacheEnabled : true,
          smartSuggestionsUseRAG: data.smartSuggestionsUseRAG !== undefined ? data.smartSuggestionsUseRAG : true,
          smartSuggestionsIncludeOtherLanguage: data.smartSuggestionsIncludeOtherLanguage !== undefined ? data.smartSuggestionsIncludeOtherLanguage : true,
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', uid);
      
      // Check if document exists first
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // Create the document if it doesn't exist
        await setDoc(userRef, {
          uid,
          email: updates.email || '',
          firstName: updates.firstName || '',
          lastName: updates.lastName || '',
          displayName: updates.displayName || '',
          photoURL: updates.photoURL || '',
          phoneNumber: updates.phoneNumber || '',
          status: 'offline',
          lastSeen: Date.now(),
          isDeleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        return;
      }
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(userRef, updateData);
      
      // Sync display name with Firebase Auth if it was updated
      if (updates.displayName) {
        await AuthService.syncDisplayNameWithProfile(uid, updates.displayName);
        
        // Update senderName in all existing messages from this user
        await this.updateMessagesSenderName(uid, updates.displayName);
      }
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Check if phone number is available
  static async checkPhoneNumberAvailable(phoneNumber: string, excludeUid?: string): Promise<boolean> {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
      const snapshot = await getDocs(q);
      
      // If no results, phone number is available
      if (snapshot.empty) return true;
      
      // If we have results, check if it's the same user (for updates)
      if (excludeUid) {
        const isSameUser = snapshot.docs.some(doc => doc.id === excludeUid);
        return isSameUser;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking phone number availability:', error);
      throw error;
    }
  }

  // Search users by name or email (with current user filtering)
  static async searchUsers(currentUserId: string, searchTerm: string): Promise<User[]>;
  static async searchUsers(searchTerm: string): Promise<User[]>;
  static async searchUsers(currentUserIdOrSearchTerm: string, searchTerm?: string): Promise<User[]> {
    // Determine if we have two parameters (currentUserId, searchTerm) or one (searchTerm)
    const actualSearchTerm = searchTerm || currentUserIdOrSearchTerm;
    const currentUserId = searchTerm ? currentUserIdOrSearchTerm : undefined;
    
    try {
      
      // Search by email (case-insensitive)
      // Since Firestore doesn't support case-insensitive queries directly,
      // we'll search for both lowercase and original case
      const emailQuery = query(collection(firestore, 'users'), where('email', '==', actualSearchTerm.toLowerCase()));
      const emailSnapshot = await getDocs(emailQuery);
      
      // Also search for original case in case the email was stored with different casing
      const emailQueryOriginal = query(collection(firestore, 'users'), where('email', '==', actualSearchTerm));
      const emailSnapshotOriginal = await getDocs(emailQueryOriginal);
      
      const users: User[] = [];
      const userIds = new Set<string>();
      
      // Process lowercase email results
      emailSnapshot.forEach((doc) => {
        if (!userIds.has(doc.id)) {
          const data = doc.data();
          // Skip deleted users
          if (data.isDeleted) return;
          
          users.push({
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
          } as User);
          userIds.add(doc.id);
        }
      });
      
      // Process original case email results
      emailSnapshotOriginal.forEach((doc) => {
        if (!userIds.has(doc.id)) {
          const data = doc.data();
          // Skip deleted users
          if (data.isDeleted) return;
          
          users.push({
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
          } as User);
          userIds.add(doc.id);
        }
      });
      
      // Filter out current user if provided
      const filteredUsers = currentUserId 
        ? users.filter(user => user.uid !== currentUserId)
        : users;
      
      return filteredUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get multiple users by UIDs
  static async getUsersByIds(uids: string[]): Promise<User[]> {
    try {
      const users: User[] = [];
      
      // Firestore doesn't support 'in' queries with more than 10 items
      // So we'll batch them
      const batchSize = 10;
      for (let i = 0; i < uids.length; i += batchSize) {
        const batch = uids.slice(i, i + batchSize);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('__name__', 'in', batch));
        const snapshot = await getDocs(q);
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Skip deleted users
          if (data.isDeleted) return;
          
          users.push({
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
          } as User);
        });
      }
      
      return users;
    } catch (error) {
      console.error('Error getting users by IDs:', error);
      throw error;
    }
  }

  // Delete user account (both Firestore and Firebase Auth)
  static async deleteUserAccount(uid: string, currentUser: any): Promise<void> {
    try {
      
      // Check for deletion cooldown (prevent rapid deletion attempts)
      const cooldownKey = `deletion_attempt_${uid}`;
      const lastAttempt = await AsyncStorage.getItem(cooldownKey);
      const now = Date.now();
      const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
      
      if (lastAttempt && (now - parseInt(lastAttempt)) < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - (now - parseInt(lastAttempt))) / 1000 / 60);
        throw new Error(`Please wait ${remainingTime} minutes before attempting account deletion again. This helps prevent accidental deletions.`);
      }
      
      // Record this deletion attempt
      await AsyncStorage.setItem(cooldownKey, now.toString());
      
      // First, delete from Firebase Authentication
      if (currentUser && currentUser.uid === uid) {
        try {
          await deleteUser(currentUser);
        } catch (authError: any) {
          console.error('Firebase Auth deletion error:', authError);
          
          // Handle specific Firebase Auth errors
          if (authError.code === 'auth/requires-recent-login') {
            throw new Error('Please sign in again before deleting your account. This is required for security reasons.');
          } else if (authError.code === 'auth/user-not-found') {
          } else {
            throw new Error(`Authentication deletion failed: ${authError.message}`);
          }
        }
      } else {
      }
      
      // Hard delete user document from Firestore
      const userRef = doc(firestore, 'users', uid);
      
      // Check if document exists first
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await deleteDoc(userRef);
      } else {
      }
      
      // Update all messages where this user was the sender to show "Deleted User"
      await this.updateMessagesForDeletedUser(uid);
      
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  }

  // Create or update user profile
  static async createOrUpdateUserProfile(userData: User): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', userData.uid);
      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  }

  // Ensure user document exists (fallback method)
  static async ensureUserDocumentExists(uid: string, email: string): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          email,
          firstName: 'User',
          lastName: '',
          displayName: 'User',
          photoURL: '',
          phoneNumber: '',
          status: 'offline',
          lastSeen: Date.now(),
          isDeleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error ensuring user document exists:', error);
      throw error;
    }
  }

  // Update all messages from a deleted user to show "Deleted User"
  static async updateMessagesForDeletedUser(deletedUserId: string): Promise<void> {
    try {
      
      // Get all chats where this user was a participant
      const chatsQuery = query(
        collection(firestore, 'chats'),
        where('participants', 'array-contains', deletedUserId)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      
      // For each chat, update messages from the deleted user
      for (const chatDoc of chatsSnapshot.docs) {
        const chatId = chatDoc.id;
        
        // Get all messages in this chat
        const messagesRef = collection(firestore, 'messages', chatId, 'threads');
        const messagesQuery = query(messagesRef, where('senderId', '==', deletedUserId));
        const messagesSnapshot = await getDocs(messagesQuery);
        
        
        // Update each message to show "Deleted User"
        const updatePromises = messagesSnapshot.docs.map(messageDoc => {
          const messageRef = doc(firestore, 'messages', chatId, 'threads', messageDoc.id);
          return updateDoc(messageRef, {
            senderName: 'Deleted User',
            senderPhotoURL: '',
            updatedAt: serverTimestamp(),
          });
        });
        
        await Promise.all(updatePromises);
      }
      
    } catch (error) {
      console.error('Error updating messages for deleted user:', error);
      // Don't throw error - this is not critical for account deletion
    }
  }

  // Update senderName in all existing messages from a user
  static async updateMessagesSenderName(userId: string, newDisplayName: string): Promise<void> {
    try {
      
      // Get all chats where this user was a participant
      const chatsQuery = query(
        collection(firestore, 'chats'),
        where('participants', 'array-contains', userId)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      
      // For each chat, update messages from this user
      for (const chatDoc of chatsSnapshot.docs) {
        const chatId = chatDoc.id;
        
        // Get all messages in this chat from this user
        const messagesRef = collection(firestore, 'messages', chatId, 'threads');
        const messagesQuery = query(messagesRef, where('senderId', '==', userId));
        const messagesSnapshot = await getDocs(messagesQuery);
        
        
        // Update each message with new senderName
        const updatePromises = messagesSnapshot.docs.map(messageDoc => {
          const messageRef = doc(firestore, 'messages', chatId, 'threads', messageDoc.id);
          return updateDoc(messageRef, {
            senderName: newDisplayName,
            updatedAt: serverTimestamp(),
          });
        });
        
        await Promise.all(updatePromises);
      }
      
    } catch (error) {
      console.error('Error updating messages senderName:', error);
      // Don't throw error - this is not critical for profile updates
    }
  }
}
