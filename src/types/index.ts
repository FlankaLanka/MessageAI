// User types
export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL: string;
  phoneNumber?: string;
  status: 'online' | 'offline';
  lastSeen: number;
  pushToken?: string;
  isDeleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  chatId: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  description?: string;
  iconURL?: string;
  participants: string[];
  admins: string[];
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  lastActivity: number;
}

// Group participant with role
export interface GroupParticipant {
  uid: string;
  role: 'admin' | 'member';
  joinedAt: number;
  addedBy?: string;
}

// Group invitation
export interface GroupInvitation {
  id: string;
  groupId: string;
  invitedBy: string;
  invitedUser: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  expiresAt: number;
}

// Presence types
export interface Presence {
  state: 'online' | 'offline';
  lastSeen: number;
}

// Chat types
export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: number;
  name?: string; // For group chats
  iconURL?: string; // For group chats
  adminIds?: string[]; // For group chats
  muted?: boolean; // Mute status
  mutedBy?: string; // Who muted the chat
  mutedAt?: number; // When it was muted
  lastReadMessageId?: string; // ID of the latest message read by the current user
  createdAt: number;
  updatedAt: number;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Chat: { chatId: string };
  ChatList: undefined;
  Settings: undefined;
  GroupCreate: undefined;
  Profile: undefined;
  UserProfile: { userId: string };
};
