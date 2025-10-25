# MessageAI - System Architecture

```mermaid
flowchart TD

subgraph Client["📱 React Native (Expo)"]
  UI[UI Components (Custom Chat, Profile, Screens)]
  State[Zustand Store]
  Navigation[Bottom Tab Navigation]
  SQLite[Expo SQLite Local Cache]
  Notif[Expo Notifications]
  ImagePicker[Expo Image Picker]
  ProfileSystem[Profile Management System]
  VoiceSystem[Voice Messaging System]
  ReadReceipts[Read Receipts System]
  DirectChat[1-on-1 Chat System]
  TranslationSystem[AI Translation System]
  LocalizationSystem[Localization System]
  SmartSuggestions[Smart Message Suggestions]
  ImageUpload[Image Upload System]
  MessageReactions[Message Reactions System]
  VoiceTranscription[Voice Message Transcription]
  VoiceTranslation[Voice Message Translation]
end

subgraph Firebase["🔥 Firebase Backend"]
  Auth[Auth: Google, Email]
  Firestore[Firestore: Messages, Groups, Users, Read Status, Reactions]
  Realtime[Realtime DB: Presence, Typing]
  Storage[Storage: Profile Images, Voice Messages, Chat Images]
  CloudFuncs[Cloud Functions: Notification triggers]
end

subgraph AI["🤖 AI Services"]
  OpenAI[OpenAI GPT-4o: Translation, Cultural Hints, Smart Suggestions]
  Whisper[OpenAI Whisper: Voice Transcription]
  SupabaseVector[Supabase Vector: RAG Context Storage]
end

subgraph Device["📲 User Device"]
  ExpoGo[Expo Go App Runtime]
end

UI --> State
State --> Firestore
State --> SQLite
Firestore <--> Realtime
Firestore <--> Storage
Auth --> Firestore
UI --> Notif
UI --> Auth
UI --> Firestore
UI --> Storage
UI --> ImagePicker
UI --> ProfileSystem
UI --> VoiceSystem
UI --> ReadReceipts
UI --> DirectChat
UI --> TranslationSystem
UI --> LocalizationSystem
UI --> SmartSuggestions
UI --> ImageUpload
UI --> MessageReactions
Notif --> CloudFuncs
CloudFuncs --> Firestore
VoiceSystem --> Storage
ReadReceipts --> Firestore
DirectChat --> Firestore
TranslationSystem --> OpenAI
TranslationSystem --> Whisper
SmartSuggestions --> OpenAI
SmartSuggestions --> SupabaseVector
ImageUpload --> Storage
MessageReactions --> Firestore

ExpoGo --> UI
UI -->|Send message| Firestore
Firestore -->|Realtime update| UI
Firestore -->|Trigger| CloudFuncs
CloudFuncs -->|Push message event| Notif

UI -->|Set status| Realtime
Realtime -->|Track typing| UI
SQLite -->|Cache messages| UI
Firestore -->|Sync queued msgs| SQLite
ImagePicker -->|Upload image| Storage
Storage -->|Profile picture URL| Firestore
```

## Data Model Summary

### `/users/{uid}`
```ts
{
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL: string;
  firstName: string;
  lastName: string;
  status: "online" | "offline";
  lastSeen: number;
  pushToken?: string;
  isDeleted?: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### `/messages/{chatId}/threads/{messageId}`
```ts
{
  senderId: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  audioSize?: number;
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
}
```

### `/groups/{groupId}`
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

### `/status/{uid}`
```ts
{
  state: "online" | "offline";
  lastSeen: number;
}
```

### `/typing/{chatId}/{uid}`
```ts
true | false
```

### `/chats/{chatId}/readStatus`
```ts
{
  [userId: string]: {
    lastReadMessageId: string;
    lastReadTime: number;
    readBy: string[];
  }
}
```

## Data Flow Summary
1. User logs in → Auth creates profile → Firestore stores user data.  
2. User sends message → Added to Firestore → UI updates optimistically.  
3. If offline → message stored in SQLite → queued → resent on reconnect.  
4. Firestore triggers Cloud Function → sends Expo push notification.  
5. Presence & typing states update in Realtime DB instantly.  
6. Messages sync to local cache for offline access.
7. **Profile Management**: User edits profile → Image upload to Storage → Update Firestore → Update UI.
8. **Account Deletion**: User deletes account → Soft delete in Firestore → Sign out → Redirect to login.
9. **Profile Viewing**: Tap profile picture → Load user data → Show profile modal → Navigate to full profile.
10. **Online Status**: User goes online/offline → Update Realtime DB → Show green dot on profile pictures.
11. **Voice Messaging**: User records voice → AudioService handles recording → Upload to Firebase Storage → Send message with audio URL → VoiceMessageBubble displays → AudioService plays back.
12. **Read Receipts**: User reads message → Update readStatus in Firestore → Show profile pictures of readers → Real-time updates across devices.
13. **Typing Indicators**: User types → Update typing status in Realtime DB → Show animated triple dots with user name → Auto-timeout after inactivity.
14. **1-on-1 Chat**: User searches for contact → UserSearchModal displays results → Create direct chat → Navigate to chat screen.
15. **Local Notifications**: Message sent → Trigger local notification → Show notification (with known bug: senders receive their own notifications).
16. **AI Translation**: User sends message → TranslationService calls OpenAI → Generate translation + cultural hints → Display inline translation UI → Store in RAG context.
17. **Smart Suggestions**: Keyboard opens → SmartSuggestionsService calls OpenAI with RAG context → Generate 3 suggestions → Display in suggestion bar → User taps to send.
18. **Image Upload**: User selects image → ImagePickerButton opens gallery → Image preview in text input → Send image message → Upload to Firebase Storage → Display in chat.
19. **Message Reactions**: User long-presses message → ReactionPicker opens → User selects emoji → Add reaction to Firestore → Display reaction overlay → Real-time updates.
20. **Localization**: User changes language → LocalizationService updates UI → All text updates to selected language → Cultural hints generate in user's language.

## AI & Localization Features

### AI Translation System
- **OpenAI GPT-4o**: Powers translation, cultural hints, and smart suggestions
- **Cultural Context Detection**: Identifies slang, idioms, and cultural references
- **Language Localization**: Cultural hints explanations in user's interface language
- **RAG Integration**: Supabase Vector stores conversation context for better translations
- **Robust JSON Parsing**: Enhanced parsing with fallback handling for AI responses

### Smart Message Suggestions
- **Speaker-Aware Context**: AI understands who is speaking and provides appropriate suggestions
- **RAG-Powered**: Uses conversation history from Supabase Vector for context
- **Function Calling**: Structured AI responses with confidence scoring
- **Keyboard-Triggered**: Appears when keyboard opens, stable while typing

### Image Upload & Message Reactions
- **iMessage-Style Interface**: Inline image preview with optional text
- **Firebase Storage**: Secure image upload with proper security rules
- **Facebook Messenger-Style Reactions**: Long-press to react with emojis
- **Real-time Updates**: Reactions sync across all devices instantly

### Comprehensive Localization
- **Multi-language Support**: English, Spanish, and Chinese Simplified
- **Native Language Names**: Language selector shows native names
- **Persistent Settings**: Language choice saved to user profile and AsyncStorage
- **Real-time Switching**: UI updates immediately when language changes
- **Cultural Hints Localization**: Explanations generated in user's language

## Deployment ✅ COMPLETE
- **Development**: `npx expo start` → run via Expo Go  
- **Production**: EAS Update → Permanent cloud deployment
- **Project Dashboard**: https://expo.dev/accounts/flankalanka/projects/messageai
- **Project ID**: 77451125-bd51-4544-a31b-f3a691623332
- **Shareable Links**: Permanent links via EAS Update system
- **Cross-Platform**: iOS, Android, and Web bundles deployed
- **No Local Server**: App runs independently without development server
- **Real-time Updates**: Push updates instantly via `eas update --auto`

### Firebase Backend Services
- **Auth**: Google and Email authentication
- **Firestore**: Messages, Groups, Users, Read Status, Reactions
- **Realtime DB**: Presence and typing indicators
- **Storage**: Profile images, voice messages, chat images
- **Security Rules**: Proper access control for all collections

### EAS Update System
- **Automatic Updates**: Push code changes without app store approval
- **Bundle Management**: Optimized bundles for each platform
- **Asset Handling**: Fonts, images, and static assets
- **Version Control**: Runtime version management
- **Rollback Support**: Easy rollback to previous versions
