import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import OnlineIndicator from './OnlineIndicator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface GroupMembersModalProps {
  visible: boolean;
  participants: User[];
  admins: string[];
  currentUserId: string;
  onClose: () => void;
  onUserPress: (user: User) => void;
}

export default function GroupMembersModal({
  visible,
  participants,
  admins,
  currentUserId,
  onClose,
  onUserPress,
}: GroupMembersModalProps) {
  const { t } = useLocalization();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('groupMembers')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Members List */}
          <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
            {participants.map((participant) => {
              const isAdmin = admins.includes(participant.uid);
              const isCurrentUser = participant.uid === currentUserId;
              const isOnline = participant.status === 'online';

              return (
                <TouchableOpacity
                  key={participant.uid}
                  style={styles.memberItem}
                  onPress={() => onUserPress(participant)}
                >
                  <View style={styles.memberAvatar}>
                    {participant.photoURL ? (
                      <Image source={{ uri: participant.photoURL }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {participant.firstName?.[0] || participant.displayName?.[0] || '?'}
                        </Text>
                      </View>
                    )}
                    <OnlineIndicator isOnline={isOnline} size={12} />
                  </View>

                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>
                        {participant.displayName || `${participant.firstName} ${participant.lastName}`.trim()}
                        {isCurrentUser && ` (${t('you')})`}
                      </Text>
                      {isAdmin && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>{t('admin')}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberStatus}>
                      {isOnline ? t('online') : t('offline')}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.memberCount}>
              {participants.length} {participants.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>
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
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  membersList: {
    maxHeight: screenHeight * 0.4,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  memberStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});


