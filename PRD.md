# MessageAI - Product Requirements Document (PRD)

## 1. Overview
MessageAI is a cross-platform messaging app inspired by WhatsApp, built using **React Native + Expo** with **Firebase** backend services.  
The MVP focuses on creating a **robust, reliable messaging experience** with real-time sync, offline queueing, push notifications, **AI-powered translation features**, **image upload and message reactions**, **comprehensive localization support**, and **voice message inline transcription and translation**.  
The app now includes advanced AI translation capabilities with cultural context detection, image messaging, message reactions, multi-language support for English, Spanish, and Chinese Simplified, and voice message transcription and translation with inline UI.

---

## 2. Objectives
Create a production-quality messaging app that:
- Supports real-time one-on-one and group chat.
- Persists messages offline and automatically resends on reconnect.
- Provides accurate message delivery states (sending → sent → delivered → read).
- Includes presence, typing indicators, and media support (images, voice messages).
- Authenticates users via Firebase (Google, email, and phone verification).
- Runs seamlessly on iOS and Android through Expo Go.
- Provides AI-powered translation with cultural context detection.
- Supports image upload with iMessage-style interface.
- Enables message reactions with Facebook Messenger-style display.
- Offers comprehensive localization for English, Spanish, and Chinese Simplified.
- Includes smart message suggestions with speaker-aware context.

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
10. Push notifications (local notifications working with known bug).  
11. **User Profile Management**: Profile editing, image upload, phone validation, account deletion.
12. **iPhone-Style Interface**: Profile pictures in chat headers, group chat bubbles, online indicators.
13. **Bottom Tab Navigation**: Messages and Profile tabs with proper state management.
14. **Profile Viewing**: Tap profile pictures to view user details and start conversations.
15. **Voice Messaging**: WeChat-style voice message recording, playback, and Firebase Storage integration.
16. **Typing Indicators**: Real-time typing status with animated triple dots and user names.
17. **1-on-1 Chat System**: Direct messaging with user search and chat creation.
18. **AI Translation System**: Real-time message translation with cultural context detection.
19. **Voice Message Translation**: Automatic transcription and translation of voice messages.
20. **Cultural Hints**: Smart detection of slang, idioms, and cultural references.
21. **Translation Settings**: User preferences for auto-translate and language selection.
22. **Image Upload System**: iMessage-style image attachment with inline preview and optional text.
23. **Message Reactions**: Long-press to react with emojis, Facebook Messenger-style reaction display.
24. **Comprehensive Localization**: Multi-language support for English, Spanish, and Chinese Simplified.
25. **Smart Message Suggestions**: iPhone-style intelligent suggestions with speaker-aware context.
26. **Cultural Hints Language Localization**: Cultural hints explanations in user's interface language.
27. **Enhanced JSON Parsing**: Robust parsing for cultural hints with fallback handling.
28. **Voice Message Inline Transcription**: Voice message transcriptions display automatically inside the voice bubble.
29. **Voice Message Inline Translation**: Voice message translations use the same UI and functionality as regular text messages.
30. **Enhanced Voice Translation**: Voice transcriptions get full AI analysis with cultural hints and intelligent processing.
31. Deployment: Running on local emulator/simulator with Firebase backend (Expo Go or EAS build).

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
| 13 | Voice messaging recording and playback | Voice messages record, upload to Firebase Storage, and play back correctly |
| 14 | Voice message offline queueing | Voice messages queue locally when offline and sync when reconnected |
| 15 | Read receipts with profile pictures | Facebook Messenger-style read receipts showing who read each message |
| 16 | Typing indicators with user names | Real-time typing status with animated triple dots and user identification |
| 17 | 1-on-1 chat creation and management | User search, direct chat creation, and conversation management |
| 18 | Push notification bug (known issue) | Senders receive notifications of their own messages (needs future fix) |
| 19 | AI Translation | Messages automatically translate to user's default language (set in settings) |
| 20 | Cultural Hints | Slang and idioms show cultural context with info buttons |
| 21 | Voice Translation | Voice messages transcribe and translate with cultural hints |
| 22 | Translation Settings | User can change default language and toggle features |
| 23 | Offline Translation | Translation requests queue when offline and process when online |

---

## 5. Core Features
### Messaging
- Text, image, and voice messages  
- Real-time Firestore sync  
- Offline queue (auto-resend when reconnected)  
- Message state tracking (sending, sent, delivered, read)  
- Optimistic UI for smooth UX  
- Voice message recording and playback with Firebase Storage
- Facebook Messenger-style read receipts with profile pictures
- **AI Translation**: Real-time message translation with cultural context
- **Voice Translation**: Automatic transcription and translation of voice messages
- **Cultural Hints**: Smart detection of slang, idioms, and cultural references

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
- Typing indicator (triple dots) for active chats with user names  
- Group-level list of active users  
- Real-time typing status with animated triple dots

### Notifications
- Local notifications for Expo Go development (simplified implementation)
- Triggers when messages are sent (text and voice)
- **Known Bug**: Senders receive notifications of their own messages (needs future fix)
- Test notification feature in Profile screen

### User Interface & Navigation
- **Bottom Tab Navigation**: Messages and Profile tabs with proper state management
- **iPhone-Style Chat Headers**: Profile pictures with online indicators
- **Group Chat Bubbles**: Overlapping profile pictures for group participants
- **Profile Modals**: Quick profile preview and full profile viewing
- **Voice Message UI**: VoiceMessageBubble, VoiceRecorder, and VoiceMessagePreview components
- **1-on-1 Chat System**: User search modal and direct chat creation
- **Read Receipts UI**: Facebook Messenger-style read receipts with profile pictures
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
✅ **Voice Messaging**: WeChat-style voice messages with recording, playback, and Firebase Storage
✅ **Read Receipts**: Facebook Messenger-style read receipts with profile pictures
✅ **Typing Indicators**: Real-time typing status with animated triple dots and user names
✅ **1-on-1 Chat System**: Direct messaging with user search and chat creation
✅ **Local Notifications**: Simplified push notifications for Expo Go (with known bug)
✅ Deployed & tested on both iOS + Android devices
