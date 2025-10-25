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
  defaultLanguage?: string;  // User's default translation language
  translationMode?: 'manual' | 'auto' | 'advanced' | 'auto-advanced';  // User's translation mode preference
  translationCacheEnabled?: boolean;  // Whether to use translation cache
  smartSuggestionsUseRAG?: boolean;  // Whether to use RAG context for smart suggestions
  smartSuggestionsIncludeOtherLanguage?: boolean;  // Whether to include suggestions in other person's language
  createdAt: number;
  updatedAt: number;
}

// Cultural hint types
export interface CulturalHint {
  term: string;                    // The term/phrase to highlight
  type: 'slang' | 'idiom' | 'cultural' | 'reference';
  explanation: string;              // Detailed cultural context
  literalMeaning?: string;         // Optional literal translation
}

// Translation types
export interface Translation {
  lang: string;                 // Language code (e.g., 'EN', 'ZH', 'ES', 'FR')
  text: string;                 // Translated text
  culturalHints?: CulturalHint[];  // Hints for translated text
}

// Message reaction types
export interface MessageReaction {
  emoji: string;           // The emoji character (👍, ❤️, 😂, etc.)
  userId: string;          // User who reacted
  userName: string;        // Display name
  userPhotoURL?: string;   // User avatar
  timestamp: number;       // When reaction was added
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;        // Firebase Storage URL for voice messages
  audioDuration?: number;   // Duration in seconds
  audioSize?: number;       // File size in bytes
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  chatId: string;
  reactions?: MessageReaction[]; // Array of reactions on the message
  // Translation and cultural context fields
  originalLang?: string;         // Language of original message
  translations?: Translation[];  // Available translations
  culturalHints?: CulturalHint[]; // Cultural hints for original text
  transcription?: string;     // Voice message transcription
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
