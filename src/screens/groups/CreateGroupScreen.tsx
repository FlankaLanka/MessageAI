import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { GroupService } from '../../services/groups';
import { User } from '../../types';
import UserSearchModal from '../../components/UserSearchModal';

interface CreateGroupScreenProps {
  onNavigateBack: () => void;
  onGroupCreated: (groupId: string) => void;
}

export default function CreateGroupScreen({ onNavigateBack, onGroupCreated }: CreateGroupScreenProps) {
  const { user } = useStore();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Get screen dimensions for responsive design
  const { height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a group');
      return;
    }

    setIsCreating(true);
    try {
      // Get participant IDs from selected users
      const participantIds = selectedUsers.map(user => user.uid);

      const groupId = await GroupService.createGroup(
        groupName.trim(),
        description.trim(),
        user.uid,
        participantIds
      );

      // Navigate immediately to the new group chat
      // This ensures consistent behavior across web and Expo Go
      onGroupCreated(groupId);
      onNavigateBack();
      
      // Show success message (non-blocking)
      // Use a timeout to ensure the navigation happens first
      setTimeout(() => {
        Alert.alert('Success', 'Group created successfully!');
      }, 200);
    } catch (error: any) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUserSelect = (user: User) => {
    const isSelected = selectedUsers.some(selected => selected.uid === user.uid);
    if (isSelected) {
      // Remove user from selection
      setSelectedUsers(prev => prev.filter(selected => selected.uid !== user.uid));
    } else {
      // Add user to selection
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.uid !== userId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isSmallScreen && styles.scrollContentSmall
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
            <TouchableOpacity onPress={onNavigateBack} style={[styles.backButton, isSmallScreen && styles.backButtonSmall]}>
              <Text style={[styles.backButtonText, isSmallScreen && styles.backButtonTextSmall]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isSmallScreen && styles.headerTitleSmall]}>Create Group</Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Group Name *</Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
              editable={!isCreating}
              maxLength={50}
            />

            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, isSmallScreen && styles.inputSmall]}
              placeholder="Enter group description (optional)"
              value={description}
              onChangeText={setDescription}
              editable={!isCreating}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Add Members</Text>
            
            <TouchableOpacity
              style={[styles.searchButton, isSmallScreen && styles.searchButtonSmall]}
              onPress={() => setShowUserSearch(true)}
              disabled={isCreating}
            >
              <Text style={[styles.searchButtonText, isSmallScreen && styles.searchButtonTextSmall]}>
                + Search and Add Members
              </Text>
            </TouchableOpacity>

            {selectedUsers.length > 0 && (
              <View style={[styles.selectedUsersContainer, isSmallScreen && styles.selectedUsersContainerSmall]}>
                <View style={styles.selectedUsersHeader}>
                  <Text style={[styles.selectedUsersTitle, isSmallScreen && styles.selectedUsersTitleSmall]}>
                    Selected Members ({selectedUsers.length})
                  </Text>
                  <View style={styles.selectedCountBadge}>
                    <Text style={[styles.selectedCountText, isSmallScreen && styles.selectedCountTextSmall]}>
                      {selectedUsers.length}
                    </Text>
                  </View>
                </View>
                <View style={styles.selectedUsersList}>
                  {selectedUsers.map((user) => (
                    <View key={user.uid} style={[styles.selectedUserItem, isSmallScreen && styles.selectedUserItemSmall]}>
                      <View style={styles.selectedUserInfo}>
                        <Text style={[styles.selectedUserName, isSmallScreen && styles.selectedUserNameSmall]}>
                          {user.displayName || `${user.firstName} ${user.lastName}`}
                        </Text>
                        <Text style={[styles.selectedUserEmail, isSmallScreen && styles.selectedUserEmailSmall]}>
                          {user.email}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeUser(user.uid)}
                        disabled={isCreating}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.createButton,
                (!groupName.trim() || isCreating) && styles.createButtonDisabled,
                isSmallScreen && styles.createButtonSmall
              ]}
              onPress={handleCreateGroup}
              disabled={!groupName.trim() || isCreating}
            >
              <Text style={[styles.createButtonText, isSmallScreen && styles.createButtonTextSmall]}>
                {isCreating ? 'Creating...' : 'Create Group'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.noteText, isSmallScreen && styles.noteTextSmall]}>
              Note: Group members will be notified when the group is created.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <UserSearchModal
        visible={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onUserSelect={handleUserSelect}
        selectedUsers={selectedUsers}
        title="Add Group Members"
        multiSelect={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  scrollContentSmall: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerSmall: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 32,
    justifyContent: 'center',
  },
  backButtonSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    minHeight: 28,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  backButtonTextSmall: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  headerTitleSmall: {
    fontSize: 20,
    marginLeft: 12,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  labelSmall: {
    fontSize: 14,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
  },
  inputSmall: {
    padding: 12,
    fontSize: 14,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  helpTextSmall: {
    fontSize: 11,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    minHeight: 50,
    justifyContent: 'center',
  },
  createButtonSmall: {
    padding: 12,
    marginTop: 20,
    minHeight: 44,
  },
  createButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonTextSmall: {
    fontSize: 14,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  noteTextSmall: {
    fontSize: 11,
    marginTop: 12,
  },
  searchButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  searchButtonSmall: {
    padding: 12,
    minHeight: 44,
  },
  searchButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonTextSmall: {
    fontSize: 14,
  },
  selectedUsersContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedUsersContainerSmall: {
    padding: 12,
    marginTop: 12,
  },
  selectedUsersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedUsersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    flex: 1,
  },
  selectedUsersTitleSmall: {
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
  selectedCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedCountTextSmall: {
    fontSize: 10,
  },
  selectedUsersList: {
    maxHeight: 120,
  },
  selectedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedUserItemSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  selectedUserInfo: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedUserNameSmall: {
    fontSize: 12,
  },
  selectedUserEmail: {
    fontSize: 12,
    color: '#666',
  },
  selectedUserEmailSmall: {
    fontSize: 11,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
