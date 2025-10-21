import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Group, GroupParticipant, GroupInvitation, Chat, User } from '../types';
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

export class GroupService {
  // Create a new group
  static async createGroup(
    name: string, 
    description: string, 
    creatorId: string, 
    participantIds: string[]
  ): Promise<string> {
    try {
      const groupData: Omit<Group, 'id'> = {
        name,
        description,
        iconURL: '',
        participants: [creatorId, ...participantIds],
        admins: [creatorId],
        createdAt: Date.now(),
        createdBy: creatorId,
        updatedAt: Date.now(),
        lastActivity: Date.now()
      };

      // Create group in Firestore
      const groupRef = await addDoc(collection(firestore, 'groups'), {
        ...groupData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      // Create corresponding chat
      const chatData: Omit<Chat, 'id'> = {
        type: 'group',
        participants: groupData.participants,
        name: groupData.name,
        description: groupData.description,
        iconURL: groupData.iconURL,
        adminIds: groupData.admins,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const chatRef = await addDoc(collection(firestore, 'chats'), {
        ...chatData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Save to local storage
      if (networkService.isOnline()) {
        await syncService.syncChatData({
          id: chatRef.id,
          ...chatData
        });
      }

      console.log('Group created successfully:', groupRef.id);
      return groupRef.id;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Get user's groups
  static async getUserGroups(userId: string): Promise<Group[]> {
    try {
      if (networkService.isOnline()) {
        const groupsRef = collection(firestore, 'groups');
        
        // Use a simple query without orderBy to avoid index issues
        const q = query(groupsRef, where('participants', 'array-contains', userId));
        const snapshot = await getDocs(q);
        const groups: Group[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          groups.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            iconURL: data.iconURL,
            participants: data.participants,
            admins: data.admins,
            createdAt: safeToMillis(data.createdAt),
            createdBy: data.createdBy,
            updatedAt: safeToMillis(data.updatedAt),
            lastActivity: safeToMillis(data.lastActivity)
          });
        });

        // Sort in memory to avoid index requirements
        groups.sort((a, b) => b.lastActivity - a.lastActivity);
        return groups;
      } else {
        // Offline: Get from local storage
        console.log('Offline: Getting groups from local storage');
        const chats = await syncService.getOfflineChats();
        return chats
          .filter(chat => chat.type === 'group')
          .map(chat => ({
            id: chat.id,
            name: chat.name || 'Group',
            description: chat.description,
            iconURL: chat.iconURL,
            participants: chat.participants,
            admins: chat.adminIds || [],
            createdAt: chat.createdAt,
            createdBy: chat.participants[0] || '',
            updatedAt: chat.updatedAt,
            lastActivity: chat.lastMessageTime || chat.updatedAt
          }))
          .sort((a, b) => b.lastActivity - a.lastActivity);
      }
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  // Get group details
  static async getGroup(groupId: string): Promise<Group | null> {
    try {
      if (networkService.isOnline()) {
        const groupRef = doc(firestore, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);
        
        if (!groupSnap.exists()) {
          return null;
        }

        const data = groupSnap.data();
        return {
          id: groupSnap.id,
          name: data.name,
          description: data.description,
          iconURL: data.iconURL,
          participants: data.participants,
          admins: data.admins,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          createdBy: data.createdBy,
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
          lastActivity: data.lastActivity?.toMillis() || Date.now()
        };
      } else {
        // Offline: Get from local storage
        const chat = await syncService.getOfflineChats().then(chats => 
          chats.find(chat => chat.id === groupId)
        );
        
        if (!chat || chat.type !== 'group') {
          return null;
        }

        return {
          id: chat.id,
          name: chat.name || 'Group',
          description: chat.description,
          iconURL: chat.iconURL,
          participants: chat.participants,
          admins: chat.adminIds || [],
          createdAt: chat.createdAt,
          createdBy: chat.participants[0] || '',
          updatedAt: chat.updatedAt,
          lastActivity: chat.lastMessageTime || chat.updatedAt
        };
      }
    } catch (error) {
      console.error('Error getting group:', error);
      throw error;
    }
  }

  // Add members to group (with admin permission check)
  static async addMembersToGroup(
    groupId: string,
    currentUserId: string,
    newMemberIds: string[]
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot add members while offline');
      }

      // Get group details to check admin permissions
      const groupRef = doc(firestore, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupSnap.data();
      
      // Check if current user is admin
      if (!groupData.admins?.includes(currentUserId)) {
        throw new Error('Only group admins can add members');
      }

      // Add new members to group
      await updateDoc(groupRef, {
        participants: arrayUnion(...newMemberIds),
        updatedAt: serverTimestamp()
      });

      // Update corresponding chat
      const chatRef = doc(firestore, 'chats', groupId);
      await updateDoc(chatRef, {
        participants: arrayUnion(...newMemberIds),
        updatedAt: serverTimestamp()
      });

      console.log('Members added to group:', groupId);
    } catch (error) {
      console.error('Error adding members to group:', error);
      throw error;
    }
  }

  // Add participants to group
  static async addParticipants(
    groupId: string, 
    participantIds: string[], 
    addedBy: string
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot add participants while offline');
      }

      const groupRef = doc(firestore, 'groups', groupId);
      await updateDoc(groupRef, {
        participants: arrayUnion(...participantIds),
        updatedAt: serverTimestamp()
      });

      // Update corresponding chat
      const chatRef = doc(firestore, 'chats', groupId);
      await updateDoc(chatRef, {
        participants: arrayUnion(...participantIds),
        updatedAt: serverTimestamp()
      });

      console.log('Participants added to group:', groupId);
    } catch (error) {
      console.error('Error adding participants:', error);
      throw error;
    }
  }

  // Remove participants from group
  static async removeParticipants(
    groupId: string, 
    participantIds: string[], 
    removedBy: string
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot remove participants while offline');
      }

      const groupRef = doc(firestore, 'groups', groupId);
      await updateDoc(groupRef, {
        participants: arrayRemove(...participantIds),
        admins: arrayRemove(...participantIds),
        updatedAt: serverTimestamp()
      });

      // Update corresponding chat
      const chatRef = doc(firestore, 'chats', groupId);
      await updateDoc(chatRef, {
        participants: arrayRemove(...participantIds),
        adminIds: arrayRemove(...participantIds),
        updatedAt: serverTimestamp()
      });

      console.log('Participants removed from group:', groupId);
    } catch (error) {
      console.error('Error removing participants:', error);
      throw error;
    }
  }

  // Update group details
  static async updateGroup(
    groupId: string, 
    updates: Partial<Pick<Group, 'name' | 'description' | 'iconURL'>>
  ): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot update group while offline');
      }

      const groupRef = doc(firestore, 'groups', groupId);
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update corresponding chat
      const chatRef = doc(firestore, 'chats', groupId);
      await updateDoc(chatRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('Group updated:', groupId);
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  // Leave group
  static async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot leave group while offline');
      }

      const groupRef = doc(firestore, 'groups', groupId);
      await updateDoc(groupRef, {
        participants: arrayRemove(userId),
        admins: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });

      // Update corresponding chat
      const chatRef = doc(firestore, 'chats', groupId);
      await updateDoc(chatRef, {
        participants: arrayRemove(userId),
        adminIds: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });

      console.log('User left group:', groupId);
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Delete group
  static async deleteGroup(groupId: string, userId: string): Promise<void> {
    try {
      if (!networkService.isOnline()) {
        throw new Error('Cannot delete group while offline');
      }

      // Check if user is admin
      const group = await this.getGroup(groupId);
      if (!group || !group.admins.includes(userId)) {
        throw new Error('Only group admins can delete the group');
      }

      // Delete group
      const groupRef = doc(firestore, 'groups', groupId);
      await deleteDoc(groupRef);

      // Delete corresponding chat
      const chatRef = doc(firestore, 'chats', groupId);
      await deleteDoc(chatRef);

      console.log('Group deleted:', groupId);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Listen to group updates
  static onGroupUpdate(groupId: string, callback: (group: Group | null) => void) {
    if (networkService.isOnline()) {
      const groupRef = doc(firestore, 'groups', groupId);
      
      return onSnapshot(groupRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const group: Group = {
            id: doc.id,
            name: data.name,
            description: data.description,
            iconURL: data.iconURL,
            participants: data.participants,
            admins: data.admins,
            createdAt: safeToMillis(data.createdAt),
            createdBy: data.createdBy,
            updatedAt: safeToMillis(data.updatedAt),
            lastActivity: safeToMillis(data.lastActivity)
          };
          callback(group);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error listening to group updates:', error);
        callback(null);
      });
    } else {
      // Offline: Return cached group
      this.getGroup(groupId).then(callback);
      return () => {}; // No-op unsubscribe
    }
  }
}
