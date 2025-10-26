# MessageAI - Technical Context

## Technology Stack

### Frontend Technologies
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript development
- **Expo Router**: File-based navigation system
- **Zustand**: Lightweight state management
- **AsyncStorage**: Local data persistence
- **Expo SQLite**: Local database for offline caching
- **expo-image-picker**: Image selection from gallery/camera
- **expo-haptics**: Haptic feedback for reactions
- **expo-av**: Audio recording and playback for voice messages

### Backend Technologies
- **Firebase Auth**: User authentication and authorization
- **Cloud Firestore**: NoSQL document database
- **Firebase Realtime Database**: Real-time presence and typing
- **Firebase Storage**: File and media storage
- **Cloud Functions**: Serverless backend functions
- **Expo Push Notifications**: Mobile push notifications

### AI Translation Technologies
- **OpenAI GPT-4o**: Text translation and cultural context detection
- **OpenAI Whisper API**: Voice message transcription
- **OpenAI TTS API**: Text-to-speech for translated audio (optional)
- **Cultural Context Detection**: AI-powered slang, idiom, and cultural reference identification
- **Simple Translation Service**: Real-time, on-demand translation with OpenAI integration
- **Localization Service**: Multi-language support for English, Spanish, and Chinese Simplified
- **Translation UI Components**: Inline translation buttons and displays within message bubbles
- **Language Synchronization**: Translation language automatically syncs with user's language preference
- **Unified Settings Interface**: Combined Settings & Translation Settings in single modal
- **Store Integration**: User language preference automatically updates translation language
- **Language Persistence**: AsyncStorage for language choice across app restarts
- **Comprehensive Localization**: All screens, components, and modals fully localized

### Image Upload & Message Reactions Technologies
- **expo-image-picker**: Image selection from gallery/camera with permissions
- **Firebase Storage**: Secure image upload with security rules
- **expo-haptics**: Haptic feedback for long-press reactions
- **Message Reactions**: Facebook Messenger-style reaction display with emojis
- **Reaction Management**: Add, remove, and change reactions with real-time updates
- **Offline Support**: Image messages and reactions queue locally and sync when online
- **Enhanced Message Types**: Extended Message interface with imageUrl and reactions fields
- **SQLite Schema**: Added reactions column and pending_reactions table for offline support
- **Translation Integration**: Text portions of image messages are translated and stored in RAG

### Development Tools
- **Expo CLI**: Development and build commands
- **Firebase CLI**: Backend configuration and deployment
- **EAS Build**: Production app building
- **Expo Go**: Development testing app

## Development Setup

### Prerequisites
```bash
# Required tools
npm install -g @expo/cli
npm install -g firebase-tools
npm install -g eas-cli

# Development dependencies
npm install firebase expo-router expo-notifications expo-image-picker expo-sqlite zustand react-native-gifted-chat expo-av openai
```

### Environment Configuration
```bash
# .env file structure
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### Firebase Project Setup
1. **Authentication**
   - Enable Google, Email/Password, Phone providers
   - Configure OAuth consent screen
   - Set up phone verification

2. **Firestore Database**
   - Create collections: users, messages, groups
   - Set up security rules
   - Configure indexes for queries

3. **Realtime Database**
   - Create presence tracking structure
   - Set up typing indicators
   - Configure security rules

4. **Storage**
   - Set up image upload rules
   - Configure CORS for web access
   - Set up image optimization

5. **Cloud Functions**
   - Deploy notification triggers
   - Set up push notification service
   - Configure message processing

## Technical Constraints

### Platform Limitations
- **iOS**: App Store review requirements
- **Android**: Google Play Store policies
- **Expo**: Some native features require custom development
- **Firebase**: Rate limits and pricing considerations

### Performance Constraints
- **Network**: Offline functionality required
- **Storage**: Local SQLite storage limits
- **Memory**: Large message histories
- **Battery**: Real-time connections and background processing

### Security Considerations
- **Authentication**: Secure token management
- **Data**: Firestore security rules
- **Storage**: Image upload validation
- **Notifications**: Push token security

## Dependencies

### Core Dependencies
```json
{
  "firebase": "^10.0.0",
  "expo": "~49.0.0",
  "expo-router": "^2.0.0",
  "expo-notifications": "~0.20.0",
  "expo-image-picker": "~14.3.0",
  "expo-sqlite": "~11.3.0",
  "zustand": "^4.4.0",
  "react-native-gifted-chat": "^2.4.0"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.2.0",
  "@types/react-native": "^0.72.0",
  "typescript": "^5.0.0"
}
```

## Build and Deployment

### Development
```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Production Build
```bash
# Build for iOS
npx eas build --platform ios

# Build for Android
npx eas build --platform android

# Build for both platforms
npx eas build --platform all
```

### Firebase Deployment
```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

## Testing Strategy

### Unit Testing
- Component testing with React Native Testing Library
- State management testing with Zustand
- Firebase mocking for offline testing

### Integration Testing
- Real-time message flow testing
- Offline queue testing
- Authentication flow testing

### End-to-End Testing
- Cross-device messaging testing
- Network interruption testing
- Push notification testing

## Performance Optimization

### Bundle Size
- Tree shaking for unused code
- Dynamic imports for large components
- Image optimization and compression

### Runtime Performance
- Message pagination for large histories
- Image lazy loading
- State optimization with selectors

### Network Optimization
- Message batching
- Offline-first architecture
- Efficient real-time subscriptions

## New Utilities and Services

### Error Handling Utilities
- **AuthErrorHandler**: Centralized authentication error handling with user-friendly messages
- **RetryHandler**: Exponential backoff retry mechanism for network operations
- **Enhanced Error Messages**: Contextual error messages with actionable guidance

### Search and Discovery Services
- **DirectChatService**: 1-on-1 chat creation and management
- **Enhanced User Search**: Email exact match and name prefix search
- **Search UI Debugging**: Comprehensive debugging with fallback display

### Data Synchronization
- **Profile Name Sync**: Bidirectional sync between Firebase Auth and Firestore
- **Message Sync Optimization**: Smart sync with existence checking
- **Elegant Account Deletion**: Hard delete with message preservation

### Presence and Status
- **PresenceService.getOnlineStatus()**: Added missing method for online status checks
- **Real-time Status Updates**: Enhanced presence indicators
- **Status Debugging**: Comprehensive logging for status tracking

