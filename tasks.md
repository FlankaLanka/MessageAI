# MessageAI - Development Tasks

> This task breakdown is designed for **Cursor** AI-assisted development.
> Each section represents a major milestone. Build vertically — one complete feature at a time.

---

## 1. Project Setup ✅
- [x] Initialize Expo project: `npx create-expo-app MessageAI`
- [x] Install dependencies:
  ```bash
  npm install firebase expo-router expo-notifications expo-image-picker expo-sqlite zustand react-native-gifted-chat expo-av expo-haptics expo-blur @supabase/supabase-js @react-native-async-storage/async-storage
  ```
- [x] Configure TypeScript and `.env` for Firebase keys.
- [x] Set up Firebase project: enable Auth, Firestore, Storage, Realtime DB.
- [x] Connect Expo app to Firebase config.
- [x] Set up Supabase Vector for RAG context storage.

---

## 2. Authentication System ✅
- [x] Implement Firebase Auth for:
  - Google sign-in
  - Email/password login
  - ~~Phone number login (SMS verification)~~ (Removed per user request)
- [x] Add email verification flows.
- [x] Create user profile model:
  ```ts
  {
    uid: string;
    displayName: string;
    photoURL: string;
    email: string;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
    status: "online" | "offline";
    lastSeen: number;
    isDeleted?: boolean;
    pushToken?: string;
    createdAt: number;
    updatedAt: number;
  }
  ```
- [x] Store in Firestore under `/users/{uid}`.

---

## 3. Messaging Core (One-on-One) ✅
- [x] Create `SimpleChatScreen` with custom implementation (no react-native-gifted-chat).
- [x] Implement Firestore collection `/messages/{chatId}/threads`.
- [x] Add optimistic UI: render message instantly before confirmation.
- [x] Handle message states:
  - `sending`, `sent`, `delivered`, `read`
- [x] Use `expo-sqlite` for local message cache.
- [x] Implement offline queue:
  - Queue unsent messages.
  - Detect reconnect event.
  - Auto-resend pending messages.

---

## 4. Group Chats ✅
- [x] Create `/groups/{groupId}` collection:
  ```ts
  {
    id: string;
    name: string;
    iconURL?: string;
    participants: string[];
    adminIds: string[];
    createdAt: number;
    updatedAt: number;
  }
  ```
- [x] Implement group chat UI.
- [x] Add ability to invite users via ID/email/phone.
- [x] Sync messages between all participants.

---

## 5. Presence & Typing ✅
- [x] Use Firebase Realtime Database `/status/{uid}` to track:
  ```ts
  { state: "online" | "offline", lastSeen: timestamp }
  ```
- [x] Update on `onDisconnect()` and `app foreground/background`.
- [x] Implement typing indicators:
  - `/typing/{chatId}/{uid}: true/false`
- [x] Display "User is typing…" in chat header with animated triple dots and user names.

---

## 6. Push Notifications ✅ (Simplified for Expo Go)
- [x] Set up Expo Notifications.
- [x] Request permissions on app launch.
- [x] Store device push tokens in `/users/{uid}/pushToken`.
- [x] Implement local notifications for Expo Go development.
- [x] Send notifications when messages are sent (text and voice).
- [x] Add test notification feature in Profile screen.
- [x] **Known Bug**: Senders receive notifications of their own messages (needs future fix).

---

## 7. User Profile System ✅
- [x] Install expo-image-picker for profile picture uploads
- [x] Update User interface with phoneNumber and isDeleted fields
- [x] Create UserService for profile management and CRUD operations
- [x] Create MediaService for image upload to Firebase Storage
- [x] Create PresenceService using Firebase Realtime Database
- [x] Create BottomTabBar component with Messages and Profile tabs
- [x] Update App.tsx with tab navigation and presence initialization
- [x] Create ProfileScreen for editing own profile
- [x] Create UserProfileView for viewing other users' profiles
- [x] Create ProfileModal for quick profile preview in chats
- [x] Create GroupParticipantsModal for group chat member list
- [x] Create OnlineIndicator component with green dot
- [x] Update SimpleChatScreen header with profile pictures and online status
- [x] Implement soft delete functionality for user accounts
- [x] Fix "No document to update" errors for profile saving and account deletion
- [x] Add comprehensive error handling and debugging
- [x] Test profile system functionality

---

## 8. Voice Messaging ✅
- [x] Install expo-av and expo-file-system packages
- [x] Create AudioService for recording, playback, and audio file management
- [x] Add audioUrl, audioDuration, and audioSize fields to Message interface
- [x] Add audio fields to SQLite messages table schema with migration
- [x] Add sendVoiceMessage method to MessageService
- [x] Create VoiceMessageBubble component for displaying voice messages
- [x] Create VoiceRecorder component with hold-to-record functionality
- [x] Create VoiceMessagePreview modal for reviewing before sending
- [x] Integrate VoiceRecorder button into SimpleChatScreen input bar
- [x] Update renderMessage to display VoiceMessageBubble for audio messages
- [x] Add audio upload/download methods to MediaService
- [x] Update SyncService to handle offline voice message queueing
- [x] Fix Firebase Storage security rules for voice message uploads
- [x] Optimize for Expo Go development environment
- [x] Add database migration logic for audio fields

---

## 9. Read Receipts ✅
- [x] Create ReadReceipt component with overlapping profile picture avatars
- [x] Create ReadReceiptService for real-time read status tracking
- [x] Create ReadReceiptSyncService for offline queue and sync
- [x] Add SQLite integration for offline read receipt storage
- [x] Implement Facebook Messenger-style read receipts with profile icons
- [x] Add real-time updates across all devices
- [x] Add offline support with automatic sync when connection returns
- [x] Add overlapping avatar display with "+N more" indicator
- [x] Add batch operations for performance optimization
- [x] Add proper handling of inverted FlatList message order
- [x] Add Firestore `readStatus` field on chat documents
- [x] Add real-time listeners for read status updates
- [x] Add SQLite queue for offline read receipts
- [x] Add NetInfo integration for network state detection
- [x] Add batch Firestore operations for efficiency

---

## 10. 1-on-1 Chat System ✅
- [x] Create DirectChatService for 1-on-1 chat management
- [x] Create UserSearchModal for finding users to chat with
- [x] Add button to start new 1-on-1 chat in ChatListScreen
- [x] Implement user search with real-time online status
- [x] Add direct chat creation and management
- [x] Fix Firebase re-authentication requirements for account deletion
- [x] Test 1-on-1 chat creation and messaging
- [x] Remove external dependencies (react-query) for better compatibility
- [x] Add user search with email exact match and name prefix search
- [x] Add comprehensive debugging and fallback display for user search results
- [x] Add real-time chat list updates with Firestore listeners
- [x] Add proper admin permission checking for member addition
- [x] Add chat list avatars to show profile pictures for direct chats
- [x] Add direct chat name display to show person's name instead of email
- [x] Add self-addition prevention in group creation
- [x] Add deleted users filter to prevent deleted users from appearing in search

---

## 11. Chat Management ✅
- [x] Implement iPhone-style swipe-to-delete functionality
- [x] Add chat muting and unmuting
- [x] Create swipeable chat item component
- [x] Add chat deletion for direct chats
- [x] Add group leave functionality for non-admins
- [x] Add group deletion for admins
- [x] Implement proper permission checks
- [x] Refactor swipe gestures: left for mute, right for delete/leave
- [x] Improve mute button positioning and visibility
- [x] Enhance swipe gesture responsiveness and thresholds

---

## 12. Deployment & Testing ✅
- [x] Run `npx expo start` and test with two real devices.
- [x] Validate all MVP test scenarios:
  - Offline queue → reconnect
  - Background messaging
  - Rapid message bursts
  - Group sync
  - Profile picture upload and editing
  - Phone number validation
  - Account deletion
  - Profile viewing in chats
  - Online status indicators
- [x] **EAS Deployment**: Complete cloud deployment with permanent shareable links
- [x] **Project Dashboard**: Available at https://expo.dev/accounts/flankalanka/projects/messageai
- [x] **Cross-Platform Support**: iOS, Android, and Web bundles created
- [x] **Permanent Links**: App accessible without local server via EAS Update

---

## 13. Polish & Documentation
- [x] Add timestamps, message read receipts.
- [x] Implement profile screen (profile edit, logout, account deletion).
- [x] Document setup instructions in `README.md`.
- [x] Add typing indicators
- [x] Implement presence indicators for all users
- [x] Add voice messaging system
- [x] Add read receipts with profile pictures
- [x] Add 1-on-1 chat system
- [x] Add local push notifications (with known bug)
- [x] Add AI translation system with cultural context detection
- [x] Add voice message translation with OpenAI Whisper
- [x] Add cultural hints for slang, idioms, and cultural references
- [x] Add translation settings and language preferences
- [x] Add comprehensive localization for English, Spanish, and Chinese Simplified
- [x] Add smart message suggestions with speaker-aware context
- [x] Add RAG integration with Supabase Vector for conversation context
- [x] Add image upload system with iMessage-style interface
- [x] Add message reactions with Facebook Messenger-style display
- [x] Add cultural hints language localization
- [x] Add enhanced JSON parsing for cultural hints with fallback handling
- [x] Add voice message inline transcription display
- [x] Add voice message inline translation with same UI as regular text messages
- [x] Add enhanced voice translation with cultural hints and intelligent processing
- [x] Add voice translation RAG context integration
