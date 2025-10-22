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
end

subgraph Firebase["🔥 Firebase Backend"]
  Auth[Auth: Google, Email]
  Firestore[Firestore: Messages, Groups, Users, Read Status]
  Realtime[Realtime DB: Presence, Typing]
  Storage[Storage: Profile Images, Voice Messages]
  CloudFuncs[Cloud Functions: Notification triggers]
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
Notif --> CloudFuncs
CloudFuncs --> Firestore
VoiceSystem --> Storage
ReadReceipts --> Firestore
DirectChat --> Firestore

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

## Deployment
- Development: `npx expo start` → run via Expo Go  
- Staging/Production: `npx eas build` → TestFlight / Play Store  
- Firebase project handles:
  - Auth  
  - Firestore + Storage (including voice messages)
  - Realtime presence and typing
  - Cloud Functions for notifications
  - Read receipts tracking
- **Known Issues**:
  - Local notifications: Senders receive notifications of their own messages (needs future fix)
  - Voice messaging: Requires real device testing for microphone permissions
