# MessageAI - Development Tasks

> This task breakdown is designed for **Cursor** AI-assisted development.
> Each section represents a major milestone. Build vertically — one complete feature at a time.

---

## 1. Project Setup ✅
- [x] Initialize Expo project: `npx create-expo-app MessageAI`
- [x] Install dependencies:
  ```bash
  npm install firebase expo-router expo-notifications expo-image-picker expo-sqlite zustand react-native-gifted-chat
  ```
- [x] Configure TypeScript and `.env` for Firebase keys.
- [x] Set up Firebase project: enable Auth, Firestore, Storage, Realtime DB.
- [x] Connect Expo app to Firebase config.

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
- [ ] Implement typing indicators:
  - `/typing/{chatId}/{uid}: true/false`
- [ ] Display "User is typing…" in chat header.

---

## 6. Push Notifications ✅
- [x] Set up Expo Notifications.
- [x] Request permissions on app launch.
- [x] Store device push tokens in `/users/{uid}/pushToken`.
- [x] Send notifications via Expo API when new message is received.
- [x] Verify notification shows in foreground.

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

## 8. Chat Management ✅
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

## 9. Deployment & Testing
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
- [ ] Build production binary:
  ```bash
  npx eas build --platform ios
  npx eas build --platform android
  ```
- [ ] Share Expo Go QR for live testing.

---

## 10. Polish & Documentation
- [x] Add timestamps, message read receipts.
- [x] Implement profile screen (profile edit, logout, account deletion).
- [x] Document setup instructions in `README.md`.
- [ ] Add typing indicators
- [ ] Implement presence indicators for all users
