# MessageAI - Project Brief

## Project Overview
MessageAI is a cross-platform messaging application inspired by WhatsApp, built using **React Native + Expo** with **Firebase** backend services and **OpenAI** AI translation capabilities. The project focuses on creating a robust, reliable messaging experience with real-time sync, offline queueing, push notifications, **AI-powered translation with cultural context detection**, and **comprehensive localization support**.

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
- **Enhanced AI Translation**: Advanced translation with sophisticated cultural context detection
- **Voice Translation**: Voice message transcription and translation with inline UI
- **Advanced Cultural Understanding**: Multi-layer detection of slangs, idioms, and cultural references with AI and pattern matching
- **Localization**: Multi-language support for 12 languages with native names
- **Real-time Language Switching**: UI updates immediately when language changes
- **Persistent Language Settings**: Language choice saved to user profile
- **Voice Message Inline Transcription**: Voice transcriptions display automatically inside the voice bubble
- **Voice Message Inline Translation**: Voice translations use the same UI and functionality as regular text messages

## Success Criteria
✅ Reliable real-time chat on 2+ devices  
✅ Offline queue works under poor connectivity  
✅ Smooth sync and delivery states  
✅ Verified user auth and profiles  
✅ Push notifications received  
✅ Deployed & tested on both iOS + Android devices
✅ Enhanced AI translation works with advanced cultural context detection
✅ Voice messages transcribed and translated
✅ Advanced cultural hints detected and displayed with confidence scoring
✅ Translation settings functional
✅ Localization system supports 12 languages
✅ Real-time language switching works
✅ Persistent language settings functional
✅ Inline translation UI integrated
✅ Voice translation with inline UI
✅ Combined settings interface working
✅ Translation language sync with user preferences
✅ Unified LanguageSelector with comprehensive settings
✅ Voice message inline transcription and translation
✅ Enhanced voice translation with cultural hints and intelligent processing
✅ Voice translation RAG context integration

## Technology Stack
- **Frontend**: React Native + Expo
- **Backend**: Firebase (Auth, Firestore, Storage, Realtime DB, Cloud Functions)
- **AI Services**: OpenAI (GPT-4o, Whisper, TTS)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Local Storage**: Expo SQLite
- **UI Components**: react-native-gifted-chat
- **Notifications**: Expo Push Notifications

## Project Scope
**MVP Focus**: Core messaging functionality with reliable real-time sync, AI translation, and localization
**Current Phase**: Enhanced AI translation features with advanced cultural context detection and comprehensive localization
**Future Phase**: Advanced AI features (summarization, assistants, RAG)
**Known Issues**: Voice transcription bug - voice messages show "No transcription available"
**Excluded**: Voice/video calls, reactions, replies, stickers, end-to-end encryption

## Development Approach
- Build vertically - one complete feature at a time
- Focus on reliability and offline resilience
- Test-driven development with specific test scenarios
- Production-quality code with proper error handling

