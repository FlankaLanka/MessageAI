import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from './src/store/useStore';
import { AuthService } from './src/api/auth';
import { UserService } from './src/api/users';
import { syncService } from './src/api/sync';
import { notificationService } from './src/api/notifications';
import { presenceService } from './src/api/presence';
import { networkService } from './src/api/network';
import { localizationService } from './src/api/localization';
import AuthScreen from './src/screens/auth/AuthScreen';
import ChatListScreen from './src/screens/chat/ChatListScreen';
import SimpleChatScreen from './src/screens/chat/SimpleChatScreen';
import CreateGroupScreen from './src/screens/groups/CreateGroupScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import UserProfileView from './src/screens/profile/UserProfileView';
import BottomTabBar from './src/components/BottomTabBar';

export default function App() {
  const { isAuthenticated, setUser, setAuthenticated } = useStore();
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentTab, setCurrentTab] = useState<'messages' | 'profile'>('messages');
  const [chatId, setChatId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize services
    syncService.initialize().catch(console.error);
    notificationService.initialize().catch(console.error);
    localizationService.initialize().catch(console.error);
    
    // Initialize network service (this is critical for presence to work)
    console.log('🌐 Initializing network service');
    // Network service initializes automatically in constructor

    // Listen to authentication state changes
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Load complete user profile from Firestore
          console.log('Loading user profile for:', firebaseUser.uid);
          const userProfile = await UserService.getUserProfile(firebaseUser.uid);
          console.log('User profile loaded:', userProfile);
          
          if (userProfile) {
            // Use the complete Firestore user profile
            console.log('Setting user profile in store:', userProfile);
            setUser(userProfile);
            setAuthenticated(true);
            setCurrentScreen('chatList');
            setCurrentTab('messages');
            
            // Initialize presence service
            await presenceService.initialize(firebaseUser.uid);
            
            // Update user's push token
            const pushToken = await notificationService.getPushToken();
            if (pushToken) {
              await notificationService.updateUserPushToken(firebaseUser.uid, pushToken);
            }
          } else {
            // If no Firestore profile exists, wait a bit and try again
            // This handles race conditions where the profile is still being created
            console.log('No Firestore profile found, waiting and retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            
            const retryUserProfile = await UserService.getUserProfile(firebaseUser.uid);
            if (retryUserProfile) {
              console.log('User profile found on retry:', retryUserProfile);
              setUser(retryUserProfile);
              setAuthenticated(true);
              setCurrentScreen('chatList');
              setCurrentTab('messages');
              
              // Initialize presence service
              await presenceService.initialize(firebaseUser.uid);
              
              // Update user's push token
              const pushToken = await notificationService.getPushToken();
              if (pushToken) {
                await notificationService.updateUserPushToken(firebaseUser.uid, pushToken);
              }
            } else {
              // Only create fallback profile if we're sure one doesn't exist
              console.log('Still no Firestore profile found, creating fallback from Firebase Auth data');
              const displayName = firebaseUser.displayName || '';
              const nameParts = displayName.split(' ');
              const firstName = nameParts[0] || 'User';
              const lastName = nameParts.slice(1).join(' ') || '';
              
              // Create user profile in Firestore
              await AuthService.createUserProfile(firebaseUser, firstName, lastName);
              
              // Load the newly created profile
              const newUserProfile = await UserService.getUserProfile(firebaseUser.uid);
              if (newUserProfile) {
                setUser(newUserProfile);
                setAuthenticated(true);
                setCurrentScreen('chatList');
                setCurrentTab('messages');
                
                // Initialize presence service
                await presenceService.initialize(firebaseUser.uid);
                
                // Update user's push token
                const pushToken = await notificationService.getPushToken();
                if (pushToken) {
                  await notificationService.updateUserPushToken(firebaseUser.uid, pushToken);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to Firebase Auth user if Firestore fails
          setUser(firebaseUser as any);
          setAuthenticated(true);
          setCurrentScreen('chatList');
          setCurrentTab('messages');
        }
      } else {
        setUser(null);
        setAuthenticated(false);
        setCurrentScreen('login');
        setCurrentTab('messages');
        
        // Cleanup presence service
        await presenceService.cleanup();
      }
    });

    return unsubscribe;
  }, [setUser, setAuthenticated]);

  const navigateToChat = (chatId: string) => {
    setChatId(chatId);
    setCurrentScreen('chat');
  };

  const navigateBack = () => {
    if (currentScreen === 'userProfile') {
      setCurrentScreen('chatList');
      setViewingUserId(null);
    } else {
      setCurrentScreen('chatList');
      setChatId(null);
    }
  };

  const navigateToCreateGroup = () => {
    setCurrentScreen('createGroup');
  };

  const handleGroupCreated = (groupId: string) => {
    // Navigate directly to the new group chat
    setChatId(groupId);
    setCurrentScreen('chat');
  };

  const navigateToProfile = () => {
    setCurrentTab('profile');
    setCurrentScreen('profile');
  };

  const navigateToMessages = () => {
    setCurrentTab('messages');
    setCurrentScreen('chatList');
  };

  const navigateToUserProfile = (userId: string) => {
    setViewingUserId(userId);
    setCurrentScreen('userProfile');
  };

  const handleStartChat = (userId: string) => {
    // For now, we'll create a direct chat
    // In a real implementation, you'd need to create or find the chat
    setViewingUserId(null);
    setCurrentScreen('chatList');
    // TODO: Implement direct chat creation
  };


  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <AuthScreen />;
      case 'chatList':
        return <ChatListScreen onNavigateToChat={navigateToChat} onNavigateToCreateGroup={navigateToCreateGroup} />;
      case 'chat':
        return <SimpleChatScreen chatId={chatId!} onNavigateBack={navigateBack} onNavigateToUserProfile={navigateToUserProfile} />;
      case 'createGroup':
        return <CreateGroupScreen onNavigateBack={navigateBack} onGroupCreated={handleGroupCreated} />;
      case 'profile':
        return <ProfileScreen />;
      case 'userProfile':
        return <UserProfileView userId={viewingUserId!} onNavigateBack={navigateBack} onStartChat={handleStartChat} />;
      default:
        return <AuthScreen />;
    }
  };

  const shouldShowTabBar = () => {
    return currentScreen === 'chatList' || currentScreen === 'profile';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {renderScreen()}
        {shouldShowTabBar() && (
          <BottomTabBar
            activeTab={currentTab}
            onTabPress={(tab) => {
              if (tab === 'messages') {
                navigateToMessages();
              } else if (tab === 'profile') {
                navigateToProfile();
              }
            }}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
