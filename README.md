# MessageAI

A cross-platform messaging app built with React Native + Expo and Firebase.

## Features

- Real-time messaging with offline support
- Firebase authentication (Google, Email, Phone)
- Group chats
- Push notifications
- Cross-platform (iOS & Android)

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Auth, Firestore, Storage, Realtime DB)
- **State Management**: Zustand
- **Navigation**: React Navigation
- **UI**: react-native-gifted-chat

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Expo CLI: `npm install -g @expo/cli`
- Firebase CLI: `npm install -g firebase-tools`

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication, Firestore, Storage, and Realtime Database
   - Copy your Firebase config to `.env`

4. Start the development server:
   ```bash
   npx expo start
   ```

### Firebase Configuration

Create a `.env` file with your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/       # Screen components
│   ├── auth/      # Authentication screens
│   ├── chat/      # Chat screens
│   └── settings/  # Settings screens
├── services/      # Firebase and API services
├── store/         # Zustand state management
├── types/        # TypeScript type definitions
└── utils/         # Utility functions
```

## Development

- **Build vertically**: Complete one feature at a time
- **Test on real devices**: Use Expo Go for testing
- **Offline-first**: Always consider offline scenarios
- **Cross-platform**: Test on both iOS and Android

## Next Steps

1. Set up Firebase project and configuration
2. Implement authentication flow
3. Build core messaging functionality
4. Add offline support
5. Implement group chats
6. Add push notifications
