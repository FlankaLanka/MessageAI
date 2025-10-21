# MessageAI - Project Brief

## Project Overview
MessageAI is a cross-platform messaging application inspired by WhatsApp, built using **React Native + Expo** with **Firebase** backend services. The project focuses on creating a robust, reliable messaging experience with real-time sync, offline queueing, and push notifications.

## Core Mission
Create a production-quality messaging app that demonstrates modern mobile development practices while providing a seamless user experience across iOS and Android platforms.

## Key Requirements
- **Real-time messaging**: One-on-one and group chat functionality
- **Offline resilience**: Messages persist and queue when offline, auto-resend on reconnect
- **Message states**: Accurate delivery tracking (sending → sent → delivered → read)
- **User authentication**: Firebase Auth with Google, email, and phone verification
- **Cross-platform**: Seamless iOS and Android support via Expo Go
- **Push notifications**: Foreground notification support
- **Presence indicators**: Online/offline status and typing indicators

## Success Criteria
✅ Reliable real-time chat on 2+ devices  
✅ Offline queue works under poor connectivity  
✅ Smooth sync and delivery states  
✅ Verified user auth and profiles  
✅ Push notifications received  
✅ Deployed & tested on both iOS + Android devices

## Technology Stack
- **Frontend**: React Native + Expo
- **Backend**: Firebase (Auth, Firestore, Storage, Realtime DB, Cloud Functions)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Local Storage**: Expo SQLite
- **UI Components**: react-native-gifted-chat
- **Notifications**: Expo Push Notifications

## Project Scope
**MVP Focus**: Core messaging functionality with reliable real-time sync
**Future Phase**: AI features (summarization, translation, assistants)
**Excluded**: Voice/video calls, reactions, replies, stickers, end-to-end encryption

## Development Approach
- Build vertically - one complete feature at a time
- Focus on reliability and offline resilience
- Test-driven development with specific test scenarios
- Production-quality code with proper error handling

