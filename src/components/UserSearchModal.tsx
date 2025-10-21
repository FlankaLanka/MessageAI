import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../types';
import { UserService } from '../services/users';
import { presenceService } from '../services/presence';
import { useStore } from '../store/useStore';
import OnlineIndicator from './OnlineIndicator';

interface UserSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onUserSelect: (user: User) => void;
  selectedUsers: User[];
  title?: string;
  multiSelect?: boolean;
}

export default function UserSearchModal({
  visible,
  onClose,
  onUserSelect,
  selectedUsers,
  title = 'Search Users',
  multiSelect = false,
}: UserSearchModalProps) {
  const { user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [onlineStatuses, setOnlineStatuses] = useState<Map<string, boolean>>(new Map());

  // Get screen dimensions for responsive design
  const { height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;

  useEffect(() => {
    if (visible && searchQuery.trim().length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, visible]);

  const searchUsers = async () => {
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      console.log('Searching for users with query:', searchQuery);
      
      // Search for users by email or name, excluding current user
      const users = await UserService.searchUsers(user?.uid || '', searchQuery.trim());
      console.log('Search results:', users);
      
      setSearchResults(users);
      
      // Get online statuses for all found users
      if (users.length > 0) {
        const statusMap = new Map<string, boolean>();
        const statusPromises = users.map(async (user) => {
          const isOnline = await presenceService.getOnlineStatus(user.uid);
          statusMap.set(user.uid, isOnline);
        });
        
        await Promise.all(statusPromises);
        setOnlineStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: User) => {
    if (multiSelect) {
      // For multi-select, toggle selection
      const isSelected = selectedUsers.some(selected => selected.uid === user.uid);
      if (isSelected) {
        // Remove from selection
        const updatedSelection = selectedUsers.filter(selected => selected.uid !== user.uid);
        onUserSelect(user); // This will be handled by parent to remove
      } else {
        // Add to selection
        onUserSelect(user);
      }
    } else {
      // For single select, close modal and select user
      onUserSelect(user);
      onClose();
    }
  };

  const isUserSelected = (user: User) => {
    return selectedUsers.some(selected => selected.uid === user.uid);
  };

  const renderUserItem = ({ item: user }: { item: User }) => {
    const isOnline = onlineStatuses.get(user.uid) || false;
    const isSelected = isUserSelected(user);

    return (
      <TouchableOpacity
        style={[
          styles.userItem,
          isSelected && styles.userItemSelected,
          isSmallScreen && styles.userItemSmall
        ]}
        onPress={() => handleUserSelect(user)}
      >
        <View style={styles.userInfo}>
          <View style={styles.profilePictureContainer}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profilePicture} />
            ) : (
              <View style={[styles.placeholderAvatar, { backgroundColor: `hsl(${user.uid.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }]}>
                <Text style={styles.placeholderText}>
                  {user.firstName?.charAt(0) || user.lastName?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <OnlineIndicator isOnline={isOnline} size={12} showOffline={true} />
          </View>
          
          <View style={styles.userDetails}>
            <Text style={[styles.userName, isSmallScreen && styles.userNameSmall]}>
              {user.displayName || `${user.firstName} ${user.lastName}`}
            </Text>
            <Text style={[styles.userEmail, isSmallScreen && styles.userEmailSmall]}>
              {user.email}
            </Text>
            <Text style={[styles.userStatus, isSmallScreen && styles.userStatusSmall]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
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
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, isSmallScreen && styles.closeButtonTextSmall]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isSmallScreen && styles.headerTitleSmall]}>{title}</Text>
          {multiSelect && (
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={[styles.doneButtonText, isSmallScreen && styles.doneButtonTextSmall]}>Done</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, isSmallScreen && styles.searchInputSmall]}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={searchUsers}
          />
        </View>

        {isSearching && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, isSmallScreen && styles.loadingTextSmall]}>Searching...</Text>
          </View>
        )}

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.uid}
          renderItem={renderUserItem}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery.trim().length >= 2 && !isSearching ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, isSmallScreen && styles.emptyTextSmall]}>
                  No users found for "{searchQuery}"
                </Text>
              </View>
            ) : null
          }
        />

        {multiSelect && selectedUsers.length > 0 && (
          <View style={[styles.selectedContainer, isSmallScreen && styles.selectedContainerSmall]}>
            <View style={styles.selectedCountRow}>
              <Text style={[styles.selectedCount, isSmallScreen && styles.selectedCountSmall]}>
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </Text>
              <View style={styles.selectedCountBadge}>
                <Text style={[styles.selectedCountBadgeText, isSmallScreen && styles.selectedCountBadgeTextSmall]}>
                  {selectedUsers.length}
                </Text>
              </View>
            </View>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerSmall: {
    paddingVertical: 8,
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  closeButtonTextSmall: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitleSmall: {
    fontSize: 16,
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  doneButtonTextSmall: {
    fontSize: 14,
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
  },
  searchInputSmall: {
    padding: 12,
    fontSize: 14,
    minHeight: 44,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  loadingTextSmall: {
    fontSize: 14,
  },
  resultsList: {
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
  userItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePictureContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
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
    marginBottom: 2,
  },
  userEmailSmall: {
    fontSize: 12,
  },
  userStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  userStatusSmall: {
    fontSize: 11,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTextSmall: {
    fontSize: 14,
  },
  selectedContainer: {
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedContainerSmall: {
    padding: 12,
  },
  selectedCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '700',
    flex: 1,
  },
  selectedCountSmall: {
    fontSize: 14,
  },
  selectedCountBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  selectedCountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedCountBadgeTextSmall: {
    fontSize: 10,
  },
});