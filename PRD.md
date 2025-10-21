# MessageAI - Product Requirements Document (PRD)

## 1. Overview
MessageAI is a cross-platform messaging app inspired by WhatsApp, built using **React Native + Expo** with **Firebase** backend services.  
The MVP focuses on creating a **robust, reliable messaging experience** with real-time sync, offline queueing, and push notifications.  
AI features will be introduced in a later phase.

---

## 2. Objectives
Create a production-quality messaging app that:
- Supports real-time one-on-one and group chat.
- Persists messages offline and automatically resends on reconnect.
- Provides accurate message delivery states (sending → sent → delivered → read).
- Includes presence, typing indicators, and basic media support (images).
- Authenticates users via Firebase (Google, email, and phone verification).
- Runs seamlessly on iOS and Android through Expo Go.

---

## 3. MVP Requirements (Hard Gate)
The MVP must meet the following:

1. One-on-one chat functionality.  
2. Real-time message delivery between 2+ users.  
3. Message persistence (survives app restarts).  
4. Optimistic UI updates (messages appear instantly before confirmation).  
5. Online/offline status indicators.  
6. Message timestamps.  
7. User authentication (accounts & profiles).  
8. Group chat with 3+ participants.  
9. Message read receipts.  
10. Push notifications (foreground working).  
11. **User Profile Management**: Profile editing, image upload, phone validation, account deletion.
12. **iPhone-Style Interface**: Profile pictures in chat headers, group chat bubbles, online indicators.
13. **Bottom Tab Navigation**: Messages and Profile tabs with proper state management.
14. **Profile Viewing**: Tap profile pictures to view user details and start conversations.
15. Deployment: Running on local emulator/simulator with Firebase backend (Expo Go or EAS build).

---

## 4. Test Scenarios (Must Pass)
| # | Scenario | Expected Behavior |
|---|-----------|------------------|
| 1 | Two devices chat in real-time | Instant delivery both ways |
| 2 | One device offline → receives on reconnect | Messages delivered + correct timestamps |
| 3 | Messages sent while app backgrounded | Delivered upon reopen |
| 4 | App force-quit → reopened | History persists (via SQLite) |
| 5 | Poor network (3G / airplane toggle) | Messages queued + auto-sent later |
| 6 | Rapid-fire messages (20+) | No drops, order preserved |
| 7 | Group chat with 3+ participants | All receive messages with correct sender attribution |
| 8 | Profile picture upload and editing | Image uploads to Firebase Storage, updates in real-time |
| 9 | Phone number validation | Unique phone numbers, proper validation and error handling |
| 10 | Account deletion | Soft delete preserves messages, user marked as "Deleted User" |
| 11 | Profile viewing in chats | Tap profile pictures to view user details and start conversations |
| 12 | Online status indicators | Green dots on profile pictures show real-time online status |

---

## 5. Core Features
### Messaging
- Text & image messages  
- Real-time Firestore sync  
- Offline queue (auto-resend when reconnected)  
- Message state tracking (sending, sent, delivered, read)  
- Optimistic UI for smooth UX  

### Authentication & Profiles
- Firebase Auth: Google, Email/Password  
- User profile: `uid`, `displayName`, `photoURL`, `email`, `phoneNumber`, `status`, `lastSeen`, `firstName`, `lastName`, `isDeleted`
- **Profile Management**: Edit name, phone, profile picture with image upload
- **Phone Validation**: Unique phone numbers with availability checking
- **Account Deletion**: Soft delete with message preservation
- **Profile Viewing**: View other users' profiles with online status

### Group Chat
- Create groups (name, icon, participants)  
- Invite via ID, email, or phone number  
- Show participant list + online members  

### Presence & Typing
- Firebase Realtime DB for presence (`online/offline`)  
- Typing indicator (triple dots) for active chats  
- Group-level list of active users  

### Notifications
- Expo Push Notifications for foreground/baseline alerts  
- Triggered on new message via Cloud Function

### User Interface & Navigation
- **Bottom Tab Navigation**: Messages and Profile tabs with proper state management
- **iPhone-Style Chat Headers**: Profile pictures with online indicators
- **Group Chat Bubbles**: Overlapping profile pictures for group participants
- **Profile Modals**: Quick profile preview and full profile viewing
- **Responsive Design**: Works on all screen sizes with SafeAreaView  

---

## 6. Non-Goals (For Later)
- AI summarization, translation, or assistants.  
- Voice/video calls.  
- Reactions, replies, or stickers.  
- End-to-end encryption.

---

## 7. Success Criteria
✅ Reliable real-time chat on 2+ devices  
✅ Offline queue works under poor connectivity  
✅ Smooth sync and delivery states  
✅ Verified user auth and profiles  
✅ Push notifications received  
✅ **User Profile System**: Profile editing, image upload, phone validation, account deletion
✅ **iPhone-Style Interface**: Profile pictures, online indicators, group chat bubbles
✅ **Bottom Tab Navigation**: Messages and Profile tabs with proper state management
✅ **Profile Viewing**: Tap profile pictures to view user details and start conversations
✅ Deployed & tested on both iOS + Android devices
