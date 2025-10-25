import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../types';
import { UserService } from '../api/users';
import { GroupService } from '../api/groups';
import { useLocalization } from '../hooks/useLocalization';

interface AddMembersModalProps {
  visible: boolean;
  groupId: string;
  currentUserId: string;
  existingParticipants: string[];
  onClose: () => void;
  onMembersAdded: (newMembers: User[]) => void;
}

export default function AddMembersModal({
  visible,
  groupId,
  currentUserId,
  existingParticipants,
  onClose,
  onMembersAdded,
}: AddMembersModalProps) {
  const { t } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Get screen dimensions for responsive design
  const { height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;

  useEffect(() => {
    if (visible && searchTerm.length > 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, visible]);

  const searchUsers = async () => {
    if (searchTerm.length < 3) return;

    setIsSearching(true);
    try {
      const users = await UserService.searchUsers(currentUserId, searchTerm);
      // Filter out users who are already participants
      const availableUsers = users.filter(
        user => !existingParticipants.includes(user.uid)
      );
      setSearchResults(availableUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.uid === user.uid);
      if (isSelected) {
        return prev.filter(u => u.uid !== user.uid);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Selection', 'Please select at least one user to add');
      return;
    }

    setIsAdding(true);
    try {
      const newMemberIds = selectedUsers.map(user => user.uid);
      
      // Add members to the group
      await GroupService.addMembersToGroup(groupId, currentUserId, newMemberIds);
      
      Alert.alert('Success', `${selectedUsers.length} member(s) added to the group`, [
        {
          text: 'OK',
          onPress: () => {
            onMembersAdded(selectedUsers);
            setSelectedUsers([]);
            setSearchTerm('');
            setSearchResults([]);
            onClose();
          }
        }
      ]);
    } catch (error: any) {
      console.error('Error adding members:', error);
      Alert.alert(t('error'), error.message || t('failedToAddMembers'));
    } finally {
      setIsAdding(false);
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some(u => u.uid === item.uid);
    
    return (
      <TouchableOpacity
        style={[
          styles.userItem,
          isSelected && styles.selectedUserItem,
          isSmallScreen && styles.userItemSmall
        ]}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            {item.photoURL ? (
              <Text style={styles.userAvatarText}>
                {item.firstName?.charAt(0) || item.lastName?.charAt(0) || '?'}
              </Text>
            ) : (
              <Text style={styles.userAvatarText}>
                {item.firstName?.charAt(0) || item.lastName?.charAt(0) || '?'}
              </Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, isSmallScreen && styles.userNameSmall]}>
              {item.displayName || `${item.firstName} ${item.lastName}`}
            </Text>
            <Text style={[styles.userEmail, isSmallScreen && styles.userEmailSmall]}>
              {item.email}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelButtonText, isSmallScreen && styles.cancelButtonTextSmall]}>
              {t('cancel')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
            {t('addMembers')}
          </Text>
          <TouchableOpacity
            onPress={handleAddMembers}
            disabled={selectedUsers.length === 0 || isAdding}
            style={[
              styles.addButton,
              (selectedUsers.length === 0 || isAdding) && styles.addButtonDisabled,
              isSmallScreen && styles.addButtonSmall
            ]}
          >
            <Text style={[
              styles.addButtonText,
              (selectedUsers.length === 0 || isAdding) && styles.addButtonTextDisabled,
              isSmallScreen && styles.addButtonTextSmall
            ]}>
              {isAdding ? t('adding') : `${t('add')} (${selectedUsers.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, isSmallScreen && styles.searchInputSmall]}
            placeholder={t('searchByEmail')}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.uid}
          renderItem={renderUser}
          style={styles.userList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isSmallScreen && styles.emptyTextSmall]}>
                {searchTerm.length < 3 
                  ? t('typeAtLeast3Characters') 
                  : isSearching 
                    ? t('searching') 
                    : t('noUsersFound')
                }
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 50,
  },
  headerSmall: {
    paddingVertical: 8,
    minHeight: 44,
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  cancelButtonTextSmall: {
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  titleSmall: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 32,
    justifyContent: 'center',
  },
  addButtonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 28,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonTextSmall: {
    fontSize: 12,
  },
  addButtonTextDisabled: {
    color: '#999',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  searchInputSmall: {
    paddingVertical: 8,
    fontSize: 14,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userItemSmall: {
    paddingVertical: 10,
  },
  selectedUserItem: {
    backgroundColor: '#f0f8ff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userNameSmall: {
    fontSize: 14,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userEmailSmall: {
    fontSize: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTextSmall: {
    fontSize: 14,
  },
});
