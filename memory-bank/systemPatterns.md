# MessageAI - System Patterns

## Architecture Overview
MessageAI follows a client-server architecture with Firebase as the backend and React Native as the client. The system emphasizes offline resilience, real-time synchronization, cross-platform compatibility, **AI-powered translation with cultural context detection**, and **comprehensive localization support**.

## Key Technical Decisions

### 1. React Native + Expo
- **Rationale**: Rapid development with native performance
- **Benefits**: Cross-platform codebase, hot reloading, easy deployment
- **Trade-offs**: Some native features may require custom modules

### 2. Firebase Backend
- **Auth**: Google, Email/Password, Phone verification
- **Firestore**: Primary database for messages, users, groups
- **Realtime DB**: Presence and typing indicators
- **Storage**: Image, media files, and voice messages
- **Cloud Functions**: Push notification triggers

### 3. Enhanced AI Translation System
- **OpenAI Integration**: GPT-4o for translation and cultural hints, Whisper for voice transcription
- **Enhanced Cultural Hints Detection**: Advanced AI-powered detection for slangs, idioms, and cultural references
- **Pattern Matching System**: Built-in language-specific databases for common cultural terms
- **Translation Service**: Real-time, on-demand translation with enhanced cultural context detection
- **Localization Service**: Multi-language support for 12 languages with native names
- **Pattern**: User-controlled translation preferences with inline UI and unified language settings
- **Benefits**: Advanced cultural context detection, confidence scoring, quality validation, offline translation support, real-time language switching

### 4. Smart Message Suggestions System
- **LLM Integration**: GPT-4o with function calling for intelligent suggestion generation
- **RAG Context**: Supabase Vector for conversation history and context retrieval
- **Speaker Awareness**: AI understands who is speaking and provides role-appropriate suggestions
- **Function Calling**: Structured AI responses with confidence scoring and reasoning
- **Keyboard Triggered**: Suggestions appear when keyboard opens, stable while typing
- **Top 3 Focus**: Simplified to show only the 3 most likely responses
- **Pattern**: Context-aware suggestions based on conversation flow and speaker perspective
- **Benefits**: Intelligent message completions, conversation-aware suggestions, speaker-appropriate responses

### 5. State Management with Zustand
- **Rationale**: Lightweight, TypeScript-friendly state management
- **Pattern**: Centralized store with actions and selectors
- **Benefits**: Simple API, good performance, easy testing

### 6. Platform-Specific Storage
- **Storage**: SQLite for offline message caching and queue
- **Pattern**: Local-first with sync to Firebase, Expo Go compatible
- **Benefits**: Works offline, fast local queries, data persistence, optimized for Expo Go

### 7. Expo Go Development Environment
- **Focus**: Optimized for Expo Go development and testing
- **Storage**: SQLite for offline message caching and queue
- **Gestures**: Native swipe gestures for chat management
- **Alerts**: Native Alert.alert() for user feedback
- **Pattern**: Expo Go compatible APIs and components
- **Benefits**: Fast development cycle with real device testing

### 8. Enhanced AI Translation Architecture
- **Translation Service**: Real-time, on-demand translation using OpenAI GPT-4o
- **Enhanced Cultural Context Detection**: Advanced AI-powered detection for slangs, idioms, and cultural references
- **Pattern Matching System**: Built-in language-specific databases for common cultural terms
- **Voice Transcription**: OpenAI Whisper for voice message transcription
- **Pattern**: Inline UI with translation buttons and displays within message bubbles
- **Benefits**: Advanced cultural context detection, confidence scoring, quality validation, user-controlled translation, offline support
- **Language Synchronization**: Translation language automatically syncs with user's language preference
- **Quality Control**: Hint validation, statistics, and performance metrics

### 8. Localization System
- **Localization Service**: Centralized translation management for 12 languages
- **useLocalization Hook**: Easy access to translations with parameter formatting
- **Language Selector**: Beautiful modal interface for language selection
- **Pattern**: Real-time language switching with persistent user preferences
- **Benefits**: Multi-language support, native language names, automatic UI updates

### 9. Unified Settings Architecture
- **Combined Interface**: Settings and Language Settings in single modal
- **Language Synchronization**: UI language and translation language stay in sync
- **Store Integration**: User language preference automatically updates translation language
- **Pattern**: Single settings interface with comprehensive language options
- **Benefits**: Simplified UX, synchronized preferences, cleaner interface
- **Rebranding**: Changed from "Translation Settings" to "Language Settings" for better clarity
- **Removed Features**: Eliminated auto-translate feature and redundant language selection

## Component Relationships

### Core Components
```
App
├── SafeAreaProvider
├── AuthService (Firebase Auth)
├── Store (Zustand)
├── Services
│   ├── MessageService (Firestore + SQLite)
│   ├── GroupService (Group management)
│   ├── NotificationService (Push notifications)
│   ├── SyncService (Offline sync)
│   ├── TranslationService (OpenAI translation + cultural hints)
│   ├── CulturalHintsService (Cultural context detection)
│   ├── TranslationIntegrationService (Auto-translation flow)
│   ├── NetworkService (Network detection)
│   ├── UserService (Profile management)
│   ├── MediaService (Image upload)
│   ├── PresenceService (Online status)
│   ├── DirectChatService (1-on-1 messaging)
│   ├── PlatformStorageService (Cross-platform storage)
│   ├── AudioService (Voice recording and playback)
│   └── AuthErrorHandler (Enhanced error handling)
└── Screens
    ├── AuthScreen (Login/Signup)
    ├── ChatListScreen (with swipe actions)
    ├── SimpleChatScreen (with offline indicator)
    ├── CreateGroupScreen (Group creation)
    ├── ProfileScreen (User profile editing)
    └── UserProfileView (View other users)
└── Components
    ├── BottomTabBar (Navigation)
    ├── ProfileModal (Quick profile preview)
    ├── GroupParticipantsModal (Group members)
    ├── VoiceMessageBubble (Voice message display)
    ├── VoiceRecorder (Hold-to-record button)
    └── VoiceMessagePreview (Review before sending)
    ├── AddMembersModal (Add members to groups)
    ├── OnlineIndicator (Green dot)
    └── SwipeableChatItem (Chat list with avatars)
```

### Data Flow Patterns
1. **Authentication Flow**
   - User signs in → Firebase Auth → Create/update profile → Store in Firestore
   
2. **Message Flow**
   - User types message → Optimistic UI update → Store in SQLite → Send to Firestore → Update status
   
3. **Offline Flow**
   - Network loss → Queue in SQLite → Network restore → Sync queued messages
   
4. **Group Flow**
   - Create group → Add participants → Set permissions → Sync to Firestore
   
5. **Notification Flow**
   - Message sent → Check mute status → Send push notification → Update badge
   
6. **Chat Management Flow**
   - Swipe action → Check permissions → Delete/Leave/Mute → Update UI
   
7. **Swipe Gesture Flow**
   - Swipe left → Show mute button → Handle mute/unmute action
   - Swipe right → Show delete/leave button → Handle deletion/leave action
   
8. **Profile Management Flow**
   - User edits profile → Validate phone uniqueness → Update Firestore → Update local state
   
9. **Image Upload Flow**
   - User selects image → Compress and upload to Firebase Storage → Update profile with URL
   
10. **AI Translation Flow**
    - Incoming message → Check user's default language → Translate with OpenAI → Display with cultural hints
    
11. **Cultural Context Detection Flow**
    - Text analysis → Identify slang/idioms → Generate explanations → Display with info buttons
    
12. **Voice Message Translation Flow**
    - Voice message → Whisper transcription → GPT-4o translation → Cultural hints → Display
   
10. **Account Deletion Flow**
    - User confirms deletion → Attempt deletion → If `auth/requires-recent-login` → Prompt for password → Re-authenticate → Delete from Firebase Auth → Mark as deleted in Firestore → Auto sign out → Redirect to login
    
11. **Direct Chat Creation Flow**
    - User taps "+ Chat" → Search modal opens → User searches for another user → User selects person → Create/find direct chat → Navigate to chat screen
    
12. **User Search Flow**
    - User types search term → Debounced search → Query Firestore for users → Fetch online status → Display results with online indicators
    
13. **Chat List Update Flow**
    - Message sent → Update store immediately → Update Firestore chat document → Real-time listener updates all clients → Chat list shows latest message
    
14. **Group Member Addition Flow**
    - Admin clicks "+" button → AddMembersModal opens → Admin searches for users → Admin selects users → Validate admin permissions → Add members to group and chat documents → Update UI with new members
    
15. **Chat Avatar Display Flow**
    - Load chat list → Check chat type → For direct chats: load other user's profile → Display profile picture or initials → For group chats: display group indicator
    
16. **Web Testing Flow**
    - Start Expo Go server (port 8081) → Start web server (port 8082) → Test with iPhone and browser → Send messages between instances → Verify real-time sync
    
17. **Web Action Flow**
    - Hover over chat item → Show action buttons → Click mute/delete/leave → Perform action → Hide buttons
    - Right-click chat item → Show action buttons → Click action → Perform action → Hide buttons
    
18. **Cross-Platform Storage Flow**
    - Detect platform (web/mobile) → Initialize appropriate storage (localStorage/SQLite) → Use unified API → Sync with Firebase

## Design Patterns

### 1. Optimistic UI Pattern
```typescript
// Send message optimistically
const sendMessage = async (message) => {
  // 1. Update UI immediately
  updateLocalState(message);
  
  // 2. Send to server
  try {
    await sendToFirestore(message);
    updateMessageStatus('sent');
  } catch (error) {
    updateMessageStatus('failed');
    queueForRetry(message);
  }
};
```

### 2. Offline Queue Pattern
```typescript
// Queue messages when offline
const queueMessage = (message) => {
  storeInSQLite(message, { status: 'queued' });
};

// Sync when online
const syncQueuedMessages = async () => {
  const queuedMessages = await getQueuedMessages();
  for (const message of queuedMessages) {
    await sendToFirestore(message);
    updateMessageStatus('sent');
  }
};
```

### 3. Real-time Subscription Pattern
```typescript
// Subscribe to message updates
useEffect(() => {
  const unsubscribe = firestore()
    .collection('messages')
    .doc(chatId)
    .collection('threads')
    .onSnapshot(handleMessageUpdate);
    
  return unsubscribe;
}, [chatId]);
```

## Data Models

### User Model
```typescript
interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL: string;
  status: 'online' | 'offline';
  lastSeen: number;
  pushToken?: string;
  createdAt: number;
  updatedAt: number;
}
```

### Message Model
```typescript
interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  chatId: string;
}
```

### Group Model
```typescript
interface Group {
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
```

### Chat Model
```typescript
interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: number;
  name?: string; // For group chats
  iconURL?: string; // For group chats
  description?: string; // For group chats
  adminIds?: string[]; // For group chats
  muted?: boolean; // Mute status
  mutedBy?: string; // Who muted the chat
  mutedAt?: number; // When it was muted
  createdAt: number;
  updatedAt: number;
}
```

## Error Handling Patterns

### 1. Network Error Handling
- Detect network status changes
- Queue messages when offline
- Retry failed operations on reconnect

### 2. Firebase Error Handling
- Handle authentication errors gracefully
- Manage Firestore permission errors
- Handle real-time connection drops

### 3. Local Storage Error Handling
- Handle SQLite write failures
- Manage storage quota issues
- Graceful degradation when offline

## Performance Patterns

### 1. Message Pagination
- Load messages in batches
- Implement infinite scroll
- Cache recent messages locally

### 2. Image Optimization
- Compress images before upload
- Use thumbnails for chat list
- Lazy load full-size images

### 3. State Optimization
- Use selectors to prevent unnecessary re-renders
- Implement message batching
- Optimize real-time subscriptions

### 4. Swipe Gesture Optimization
- Implement responsive gesture thresholds
- Use native driver for smooth animations
- Handle gesture conflicts and edge cases
- Optimize button positioning and visibility

## Recent Bug Fixes and Improvements

### 1. Authentication Error Handling
- **Pattern**: Centralized error handling with user-friendly messages
- **Implementation**: AuthErrorHandler utility with retry mechanisms
- **Benefits**: Better UX, reduced user frustration, automatic recovery

### 2. Profile Name Synchronization
- **Pattern**: Bidirectional sync between Firebase Auth and Firestore
- **Implementation**: Automatic display name updates on profile changes
- **Benefits**: Consistent user data across all systems

### 3. Elegant Account Deletion
- **Pattern**: Hard delete with message preservation
- **Implementation**: Delete user documents, update messages with "Deleted User"
- **Benefits**: Data privacy compliance, conversation continuity

### 4. Message Sync Optimization
- **Pattern**: Smart sync with existence checking
- **Implementation**: Check if message exists before creating
- **Benefits**: No duplicate messages, better offline handling

### 5. User Search Enhancement
- **Pattern**: Dual search strategy (email exact match, name prefix)
- **Implementation**: Separate queries for different search types
- **Benefits**: Accurate email searches, flexible name searches

### 6. Presence Service Completion
- **Pattern**: Missing method implementation
- **Implementation**: Added getOnlineStatus method to PresenceService
- **Benefits**: Online status indicators work properly

### 7. Search UI Debugging
- **Pattern**: Comprehensive debugging with fallback display
- **Implementation**: Console logging and debug container
- **Benefits**: Easy troubleshooting, reliable user display

### 8. Chat List Real-time Updates
- **Pattern**: Dual-update approach for immediate and real-time updates
- **Implementation**: Store updates + Firestore listeners
- **Benefits**: Instant UI feedback, cross-device synchronization

### 9. Group Member Management
- **Pattern**: Admin-only permissions with server-side validation
- **Implementation**: UI restrictions + backend permission checks
- **Benefits**: Secure member addition, proper access control

### 10. Chat List Avatar Optimization
- **Pattern**: Conditional rendering based on chat type and data availability
- **Implementation**: Profile pictures for direct chats, initials for groups
- **Benefits**: Better visual identification, consistent user experience

### 11. Web Compatibility Implementation
- **Pattern**: Platform-specific UI interactions with unified functionality
- **Implementation**: Hover/right-click for web, swipe gestures for mobile
- **Benefits**: Native-feeling interactions on each platform, no gesture conflicts

### 12. Cross-Platform Storage Architecture
- **Pattern**: Platform detection with unified storage API
- **Implementation**: localStorage for web, SQLite for mobile, same interface
- **Benefits**: Consistent offline functionality across platforms, simplified maintenance

### 13. Real-time Presence and Typing Indicators
- **Pattern**: Firebase Realtime Database for live status updates
- **Implementation**: PresenceService with typing state management and auto-timeouts
- **Benefits**: Real-time user awareness, enhanced messaging experience, automatic cleanup

### 14. Enhanced Group Creation with User Search
- **Pattern**: Modal-based user search with multi-select functionality
- **Implementation**: UserSearchModal with real-time search and online status indicators
- **Benefits**: Intuitive group creation, visual user selection, consistent with existing patterns

### 15. Database Initialization and Error Handling
- **Pattern**: Immediate initialization with proper error handling
- **Implementation**: SQLite service initialization in storage constructor with fallbacks
- **Benefits**: Prevents "Database not initialized" errors, robust offline functionality

### 16. Method Overloading for API Compatibility
- **Pattern**: Multiple method signatures with unified implementation
- **Implementation**: UserService.searchUsers with currentUserId filtering
- **Benefits**: Backward compatibility, flexible API usage, single implementation

### 17. VirtualizedList Performance Optimization
- **Pattern**: Replace FlatList with View.map for small lists in ScrollViews
- **Implementation**: Simple mapping for selected users list in group creation
- **Benefits**: Eliminates React Native warnings, better performance, cleaner code

### 18. Web Navigation Consistency
- **Pattern**: Immediate navigation with non-blocking success messages
- **Implementation**: Navigate first, then show Alert with timeout to ensure consistent behavior
- **Benefits**: Same user experience across web and mobile platforms, no navigation blocking

### 19. Self-Addition Prevention
- **Pattern**: Filter current user from search results in group creation
- **Implementation**: Pass current user ID to searchUsers method to exclude self from results
- **Benefits**: Prevents users from adding themselves to groups, cleaner user experience

### 20. Direct Chat Name Display
- **Pattern**: Show person's name instead of email for 1-on-1 chats
- **Implementation**: Use displayName or firstName+lastName with email fallback in SwipeableChatItem
- **Benefits**: More personal and user-friendly chat list display, consistent with messaging app conventions

### 21. Profile Picture Deletion
- **Pattern**: Complete profile picture removal with database cleanup
- **Implementation**: Delete from Firebase Storage and update user profile with empty photoURL
- **Benefits**: Users can remove profile pictures completely, saves storage space, maintains data consistency

### 22. Facebook Messenger-Style Read Receipts
- **Pattern**: Complete read receipt system with profile icons, real-time updates, and offline sync
- **Implementation**: 
  - ReadReceipt component with overlapping profile picture avatars
  - ReadReceiptService for real-time read status tracking
  - ReadReceiptSyncService for offline queue and sync
  - SQLite integration for offline read receipt storage
- **Benefits**: Enhanced user experience, clear communication status, visual feedback for message delivery
- **Key Features**: 
  - Profile pictures of users who have read the message
  - Only shows on user's latest read message (not all messages)
  - Real-time updates across all devices
  - Offline support with automatic sync when connection returns
  - Overlapping avatar display with "+N more" indicator
  - Batch operations for performance optimization
  - Proper handling of inverted FlatList message order
- **Technical Implementation**:
  - Firestore `readStatus` field on chat documents
  - Real-time listeners for read status updates
  - SQLite queue for offline read receipts
  - NetInfo integration for network state detection
  - Batch Firestore operations for efficiency

### 23. Authentication System Reset
- **Pattern**: Complete rebuild of authentication system for reliability
- **Implementation**: Clean, simple AuthService with direct Firebase calls and proper error handling
- **Benefits**: Eliminates rate limiting issues, ensures web/mobile compatibility, prevents authentication failures
- **Key Features**:
  - Direct Firebase calls without retry logic that causes rate limiting
  - Cross-platform alert system for web/mobile compatibility
  - Proper Firestore data validation to prevent undefined value errors
  - Clean error handling with user-friendly messages
  - Rate limiting detection and helpful error messages

### 24. Firestore Data Validation
- **Pattern**: Proper handling of optional fields to prevent undefined value errors
- **Implementation**: Conditional field inclusion using spread operator for optional fields
- **Benefits**: Prevents Firestore "invalid data" errors, ensures clean document structure
- **Example**: `...(firebaseUser.phoneNumber && { phoneNumber: firebaseUser.phoneNumber })`

### 25. Enhanced Cultural Hints Detection System
- **Pattern**: Multi-layer cultural context detection with AI and pattern matching
- **Implementation**: 
  - AI-powered detection using OpenAI GPT-4o for complex cultural context
  - Pattern matching for common terms with language-specific databases
  - Confidence scoring and quality validation for hint accuracy
  - Comprehensive service with statistics and analytics
- **Benefits**: 
  - Advanced detection of slangs, idioms, and cultural references
  - Language-specific cultural understanding
  - Quality control with validation and scoring
  - Performance optimization with intelligent caching
- **Key Features**:
  - `enhancedCulturalHintsService` for advanced cultural analysis
  - `culturalHintsService` with AI-powered generation
  - Pattern matching for English, Spanish, French with extensibility
  - Quality validation and confidence scoring
  - Comprehensive examples and usage patterns

### 26. Translation Settings Optimization
- **Pattern**: Unified language settings with simplified UX
- **Implementation**: 
  - Removed auto-translate feature for cleaner interface
  - Unified language selection eliminating redundancy
  - Rebranded "Translation Settings" to "Language Settings"
  - Single language selector for both UI and translation language
- **Benefits**: 
  - Simplified user experience
  - Eliminated confusion from duplicate settings
  - Cleaner, more intuitive interface
  - Synchronized language preferences

## Web/Mobile Compatibility Requirements

### Critical Compatibility Issues

#### 1. Alert.alert() Does NOT Work on Web
- **Problem**: React Native's Alert.alert() is iOS/Android only
- **Solution**: Use crossPlatformAlert utility with platform detection
- **Pattern**: 
  ```typescript
  // ❌ DON'T DO THIS - won't work on web
  Alert.alert('Title', 'Message', buttons);
  
  // ✅ DO THIS - works on both platforms
  showAlert('Title', 'Message');
  showErrorAlert('Error message');
  showDeleteConfirmAlert('Chat', onConfirm);
  ```

#### 2. Swipe Gestures Don't Work on Web
- **Problem**: PanGestureHandler doesn't work in browsers
- **Solution**: Use hover/right-click alternatives for web
- **Pattern**: Platform detection with different interaction methods
- **Implementation**: SwipeableChatItem has web-specific hover handlers

#### 3. Storage Systems Are Different
- **Mobile**: SQLite for offline caching
- **Web**: localStorage for offline caching
- **Solution**: PlatformStorageService abstracts the differences
- **Pattern**: Same API, different implementations

#### 4. Navigation Differences
- **Mobile**: Native navigation patterns
- **Web**: Browser navigation patterns
- **Solution**: Consistent state-based navigation
- **Pattern**: Avoid platform-specific navigation APIs

### Required Patterns for New Features

#### 1. Always Check Platform Compatibility
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-specific implementation
  window.alert('Message');
} else {
  // Mobile-specific implementation
  Alert.alert('Message');
}
```

#### 2. Use Cross-Platform Utilities
```typescript
// ✅ Use these utilities instead of direct Alert calls
import { showAlert, showErrorAlert, showSuccessAlert, showDeleteConfirmAlert } from '../utils/crossPlatformAlert';

showErrorAlert('Something went wrong');
showDeleteConfirmAlert('Chat', () => deleteChat());
```

#### 3. Test on Both Platforms
- **Web**: Test in browser with hover/click interactions
- **Mobile**: Test with swipe gestures and native alerts
- **Both**: Verify all functionality works identically

#### 4. Platform-Specific UI Components
```typescript
// Example: Different interaction methods
{Platform.OS === 'web' ? (
  <View onMouseEnter={handleHover} onContextMenu={handleRightClick}>
    {/* Web-specific UI */}
  </View>
) : (
  <PanGestureHandler onGestureEvent={handleSwipe}>
    {/* Mobile-specific UI */}
  </PanGestureHandler>
)}
```

### Common Pitfalls to Avoid

1. **Never use Alert.alert() directly** - always use crossPlatformAlert utilities
2. **Never assume gestures work on web** - provide alternative interactions
3. **Never use platform-specific storage directly** - use PlatformStorageService
4. **Never skip platform testing** - test every feature on both web and mobile
5. **Never use native-only APIs** - check Expo compatibility first

### Testing Checklist

#### Web Testing
- [ ] All alerts show browser dialogs (not React Native alerts)
- [ ] Hover interactions work for action buttons
- [ ] Right-click shows context menus
- [ ] No swipe gestures (they won't work)
- [ ] localStorage is used for offline data

#### Mobile Testing
- [ ] All alerts show native dialogs
- [ ] Swipe gestures work for actions
- [ ] No hover interactions (they won't work)
- [ ] SQLite is used for offline data
- [ ] Native performance is maintained

## Voice Messaging Architecture

### Voice Message Flow
```
User holds record button → AudioService.startRecording() → 
Local audio file created → User releases → AudioService.stopRecording() → 
VoiceMessagePreview modal → User reviews → Send → 
MediaService.uploadVoiceMessage() → Firebase Storage → 
MessageService.sendVoiceMessage() → Firestore → 
VoiceMessageBubble displays → AudioService.playAudio()
```

### Audio Service Pattern
```typescript
// AudioService handles all audio operations
class AudioService {
  // Recording
  async startRecording(): Promise<string | null>
  async stopRecording(): Promise<{uri: string, duration: number} | null>
  
  // Playback
  async playAudio(uri: string, onStatusUpdate?: Function): Promise<void>
  async pauseAudio(): Promise<void>
  async stopAudio(): Promise<void>
  
  // File Management
  async deleteRecording(uri: string): Promise<void>
  async getAudioDuration(uri: string): Promise<number>
}
```

### Expo Go Audio Handling
```typescript
// Expo Go optimized audio handling
// Download and cache locally for offline playback
const localUri = await MediaService.downloadVoiceMessage(audioUrl);
await audioService.playAudio(localUri);
```

### Database Schema for Voice Messages
```sql
-- SQLite messages table with audio fields
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  chatId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  text TEXT,
  imageUrl TEXT,
  audioUrl TEXT,           -- Firebase Storage URL
  audioDuration REAL,      -- Duration in seconds
  audioSize INTEGER,       -- File size in bytes
  timestamp INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'sending',
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
```

### Voice Message Components
```typescript
// VoiceMessageBubble - Display voice messages
interface VoiceMessageBubbleProps {
  audioUrl: string;
  duration: number;
  isOwnMessage: boolean;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  currentTime: number;
}

// VoiceRecorder - Hold-to-record button
interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string, duration: number) => void;
  onRecordingCancel: () => void;
}

// VoiceMessagePreview - Review before sending
interface VoiceMessagePreviewProps {
  visible: boolean;
  audioUri: string;
  duration: number;
  onSend: () => void;
  onCancel: () => void;
  onReRecord: () => void;
}
```

### Offline Voice Message Support
```typescript
// Offline voice message queueing
if (networkService.isOnline()) {
  // Upload to Firebase Storage first
  const audioUrl = await MediaService.uploadVoiceMessage(chatId, messageId, audioUri);
  // Send message with Firebase Storage URL
  await MessageService.sendVoiceMessage(chatId, senderId, audioUri, duration);
} else {
  // Queue locally with local file URI
  await syncService.queueMessage({
    ...message,
    audioUrl: localAudioUri, // Local file URI
    status: 'sending'
  });
}
```

### Firebase Storage Security Rules
```javascript
// Allow voice message uploads
match /voiceMessages/{chatId}/{allPaths=**} {
  allow read, write: if request.auth != null;
}
```

### Future Development Guidelines

1. **Focus on Expo Go development environment**
2. **Use native Alert.alert() for user feedback**
3. **Implement native swipe gestures for interactions**
4. **Test every feature on Expo Go before considering it complete**
5. **Use SQLite for all offline data storage**
6. **Handle audio permissions gracefully on mobile devices**
7. **Implement proper audio file cleanup and caching**
8. **Test voice messaging on real devices (microphone required)**
9. **Consider audio quality and file size optimization**
10. **Optimize for iOS and Android through Expo Go**

