import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import OnlineIndicator from './OnlineIndicator';

interface GroupParticipantsModalProps {
  visible: boolean;
  participants: User[];
  admins: string[];
  currentUserId: string;
  onClose: () => void;
  onUserPress: (user: User) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;

export default function GroupParticipantsModal({
  visible,
  participants,
  admins,
  currentUserId,
  onClose,
  onUserPress,
}: GroupParticipantsModalProps) {
  const { t } = useLocalization();
  const renderParticipant = ({ item }: { item: User }) => {
    const isAdmin = admins.includes(item.uid);
    const isCurrentUser = item.uid === currentUserId;
    const isOnline = item.status === 'online';

    return (
      <TouchableOpacity
        style={styles.participantItem}
        onPress={() => onUserPress(item)}
        disabled={isCurrentUser}
      >
        <View style={styles.participantLeft}>
          <View style={styles.profilePictureContainer}>
            {item.photoURL ? (
              <Image source={{ uri: item.photoURL }} style={styles.profilePicture} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>
                  {item.firstName?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <OnlineIndicator isOnline={isOnline} size={12} />
          </View>
          
          <View style={styles.participantInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.participantName, isSmallScreen && styles.participantNameSmall]}>
                {item.displayName || `${item.firstName} ${item.lastName}`}
              </Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            <Text style={[styles.participantStatus, isSmallScreen && styles.participantStatusSmall]}>
              {isOnline ? t('online') : t('offline')}
            </Text>
          </View>
        </View>
        
        {!isCurrentUser && (
          <Text style={styles.arrow}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={[styles.modal, isSmallScreen && styles.modalSmall]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
                Group Members ({participants.length})
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Participants List */}
            <FlatList
              data={participants}
              keyExtractor={(item) => item.uid}
              renderItem={renderParticipant}
              style={styles.participantsList}
              showsVerticalScrollIndicator={false}
            />
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
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
    paddingBottom: 20,
  },
  modalSmall: {
    maxHeight: screenHeight * 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  titleSmall: {
    fontSize: 16,
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
  participantsList: {
    flex: 1,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePictureContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  participantNameSmall: {
    fontSize: 14,
  },
  adminBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  participantStatus: {
    fontSize: 14,
    color: '#666',
  },
  participantStatusSmall: {
    fontSize: 12,
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
});
