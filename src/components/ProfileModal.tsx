import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../types';
import OnlineIndicator from './OnlineIndicator';

interface ProfileModalProps {
  visible: boolean;
  user: User | null;
  isOnline: boolean;
  onClose: () => void;
  onViewFullProfile: () => void;
  onMessage: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;

export default function ProfileModal({
  visible,
  user,
  isOnline,
  onClose,
  onViewFullProfile,
  onMessage,
}: ProfileModalProps) {
  if (!user) return null;

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onClose },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={[styles.modal, isSmallScreen && styles.modalSmall]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.profilePicture} />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Text style={styles.placeholderText}>
                    {user.firstName?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
              <OnlineIndicator isOnline={isOnline} size={16} animated />
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
              <Text style={[styles.userStatus, isSmallScreen && styles.userStatusSmall]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={onMessage}
              >
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onViewFullProfile}
              >
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                  View Full Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: screenWidth - 40,
    maxWidth: 400,
    alignItems: 'center',
  },
  modalSmall: {
    padding: 16,
    margin: 16,
    width: screenWidth - 32,
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  userNameSmall: {
    fontSize: 20,
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
    marginBottom: 4,
  },
  userPhoneSmall: {
    fontSize: 14,
  },
  userStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  userStatusSmall: {
    fontSize: 12,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#333',
  },
});
