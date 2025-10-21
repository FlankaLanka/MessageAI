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
end

subgraph Firebase["🔥 Firebase Backend"]
  Auth[Auth: Google, Email]
  Firestore[Firestore: Messages, Groups, Users]
  Realtime[Realtime DB: Presence, Typing]
  Storage[Storage: Profile Images]
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
Notif --> CloudFuncs
CloudFuncs --> Firestore

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

## Deployment
- Development: `npx expo start` → run via Expo Go  
- Staging/Production: `npx eas build` → TestFlight / Play Store  
- Firebase project handles:
  - Auth  
  - Firestore + Storage  
  - Realtime presence  
  - Cloud Functions for notifications
