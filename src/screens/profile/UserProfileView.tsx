import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../../types';
import { UserService } from '../../services/users';
import { useLocalization } from '../../hooks/useLocalization';
import OnlineIndicator from '../../components/OnlineIndicator';
import { presenceService } from '../../services/presence';

interface UserProfileViewProps {
  userId: string;
  onNavigateBack: () => void;
  onStartChat: (userId: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;

export default function UserProfileView({ userId, onNavigateBack, onStartChat }: UserProfileViewProps) {
  const { t } = useLocalization();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  // Subscribe to real-time presence updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = presenceService.subscribeToUserPresence(
      user.uid,
      (presenceData) => {
        setIsOnline(presenceData.state === 'online');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await UserService.getUserProfile(userId);
      setUser(userProfile);
      
      if (userProfile) {
        // Set initial status from profile, but real-time updates will come from presence subscription
        setIsOnline(userProfile.status === 'online');
        
        // Also get real-time presence status immediately
        try {
          const currentPresence = await presenceService.getUserPresence(userProfile.uid);
          if (currentPresence) {
            setIsOnline(currentPresence.state === 'online');
          }
        } catch (presenceError) {
          console.log('Could not get real-time presence, using profile status:', presenceError);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = () => {
    if (user) {
      onStartChat(user.uid);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('userNotFound')}</Text>
          <TouchableOpacity onPress={onNavigateBack} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>{t('goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (user.isDeleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.deletedContainer}>
          <View style={styles.deletedAvatar}>
            <Text style={styles.deletedAvatarText}>?</Text>
          </View>
          <Text style={styles.deletedName}>{t('deletedUser')}</Text>
          <Text style={styles.deletedText}>{t('userDeletedAccount')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isSmallScreen && styles.scrollContentSmall]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePictureContainer}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profilePicture} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>
                  {user.firstName?.charAt(0) || user.lastName?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <OnlineIndicator isOnline={isOnline} size={16} animated />
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isSmallScreen && styles.userNameSmall]}>
            {user.displayName || `${user.firstName} ${user.lastName}`}
          </Text>
          
          <Text style={[styles.userEmail, isSmallScreen && styles.userEmailSmall]}>
            {user.email}
          </Text>
          
          {user.phoneNumber && (
            <Text style={[styles.userPhone, isSmallScreen && styles.userPhoneSmall]}>
              {user.phoneNumber}
            </Text>
          )}
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, isOnline ? styles.statusOnline : styles.statusOffline]} />
            <Text style={[
              styles.statusText, 
              isSmallScreen && styles.statusTextSmall,
              isOnline ? styles.statusTextOnline : styles.statusTextOffline
            ]}>
              {isOnline ? t('online') : t('offline')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleStartChat}
          >
            <Text style={styles.messageButtonText}>{t('sendMessage')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deletedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deletedAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  deletedAvatarText: {
    fontSize: 40,
    color: '#666',
  },
  deletedName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  deletedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  scrollContentSmall: {
    paddingVertical: 16,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  userNameSmall: {
    fontSize: 24,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userEmailSmall: {
    fontSize: 14,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  userPhoneSmall: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#ccc',
  },
  statusText: {
    fontSize: 16,
  },
  statusTextSmall: {
    fontSize: 14,
  },
  statusTextOnline: {
    color: '#4CAF50', // Green for online
  },
  statusTextOffline: {
    color: '#9E9E9E', // Gray for offline
  },
  actions: {
    gap: 16,
  },
  messageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
