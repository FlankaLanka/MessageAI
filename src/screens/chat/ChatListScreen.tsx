import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { useLocalization } from '../../hooks/useLocalization';
import { AuthService } from '../../services/auth';
import { MessageService } from '../../services/messages';
import { DirectChatService } from '../../services/directChat';
import { notificationService } from '../../services/notifications';
import { Chat, User } from '../../types';
import SwipeableChatItem from '../../components/SwipeableChatItem';
import UserSearchModal from '../../components/UserSearchModal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { showAlert, showErrorAlert, showSuccessAlert, showDeleteConfirmAlert, showLeaveConfirmAlert } from '../../utils/crossPlatformAlert';

interface ChatListScreenProps {
  onNavigateToChat: (chatId: string) => void;
  onNavigateToCreateGroup: () => void;
}

export default function ChatListScreen({ onNavigateToChat, onNavigateToCreateGroup }: ChatListScreenProps) {
  const { t } = useLocalization();
  const { user, chats, setChats, setError } = useStore();
  const [showUserSearch, setShowUserSearch] = useState(false);
  
  // Get screen dimensions for responsive design
  const { height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        // Load all chats (both direct and group chats are in the chats collection)
        const allChats = await MessageService.getUserChats(user.uid).catch(error => {
          console.warn('Error loading chats:', error);
          return []; // Return empty array on error
        });

        // Sort by last activity
        const sortedChats = allChats.sort((a, b) => 
          (b.lastMessageTime || b.updatedAt) - (a.lastMessageTime || a.updatedAt)
        );

        setChats(sortedChats);

        // Show warning if no chats found
        if (allChats.length === 0) {
          setError('No chats found. Try refreshing the app.');
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        setError('Failed to load chats. Please check your internet connection.');
      }
    };

    // Set up real-time listener for chat updates
    const chatsRef = collection(firestore, 'chats');
    const userChatsQuery = query(
      chatsRef,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(userChatsQuery, async (snapshot) => {
      try {
        const updatedChats: Chat[] = [];
        
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const chat: Chat = {
            id: doc.id,
            type: data.type,
            participants: data.participants || [],
            lastMessage: data.lastMessage,
            lastMessageTime: data.lastMessageTime,
            name: data.name,
            iconURL: data.iconURL,
            adminIds: data.adminIds,
            muted: data.muted,
            mutedBy: data.mutedBy,
            mutedAt: data.mutedAt,
            createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
            updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || Date.now()
          };
          updatedChats.push(chat);
        }

        // Sort by last activity
        const allChats = updatedChats.sort((a, b) => 
          (b.lastMessageTime || b.updatedAt) - (a.lastMessageTime || a.updatedAt)
        );

        setChats(allChats);
      } catch (error) {
        console.error('Error updating chats from real-time listener:', error);
      }
    }, (error) => {
      console.error('Error in chat listener:', error);
      // Fallback to loading chats manually
      loadChats();
    });

    // Initial load
    loadChats();

    return () => {
      unsubscribe();
    };
  }, [user, setChats, setError]);

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error: any) {
      setError(error.message);
      showErrorAlert(error.message);
    }
  };

  const handleStartDirectChat = async (selectedUser: User) => {
    if (!user) return;

    try {
      console.log('Starting direct chat with:', selectedUser.displayName);
      
      // Create or find existing direct chat
      const chatId = await DirectChatService.createDirectChat(user.uid, selectedUser.uid);
      
      // Navigate to the chat
      onNavigateToChat(chatId);
      
      // Close the user search modal
      setShowUserSearch(false);
      
      console.log('Direct chat started successfully');
    } catch (error) {
      console.error('Error starting direct chat:', error);
      showErrorAlert('Failed to start chat. Please try again.');
    }
  };


  const handleDeleteChat = async (chat: Chat) => {
    if (!user) return;

    console.log('Delete chat button clicked for chat:', chat.id, 'Type:', chat.type);
    
    const isGroup = chat.type === 'group';
    const itemType = isGroup ? 'Group' : 'Chat';
    
    const performDelete = async () => {
      console.log('Delete confirmed, proceeding with deletion...');
      try {
        // Delete the chat (works for both direct and group chats)
        console.log('Calling MessageService.deleteChat...');
        await MessageService.deleteChat(chat.id, user.uid);
        console.log('Chat deleted successfully from Firestore');

        // Refresh chats
        console.log('Refreshing chat list...');
        const allChats = await MessageService.getUserChats(user.uid);
        const sortedChats = allChats.sort((a, b) => 
          (b.lastMessageTime || b.updatedAt) - (a.lastMessageTime || a.updatedAt)
        );

        setChats(sortedChats);
        console.log('Chat list updated, showing success alert');
        
        showSuccessAlert(`${itemType} deleted successfully`);
      } catch (error: any) {
        console.error('Error deleting chat:', error);
        showErrorAlert(error.message || 'Failed to delete chat');
      }
    };

    showDeleteConfirmAlert(itemType, performDelete);
  };

  const handleLeaveChat = async (chat: Chat) => {
    if (!user) return;

    const performLeave = async () => {
      try {
        await MessageService.leaveChat(chat.id, user.uid);
        
        // Refresh chats
        const allChats = await MessageService.getUserChats(user.uid);
        const sortedChats = allChats.sort((a, b) => 
          (b.lastMessageTime || b.updatedAt) - (a.lastMessageTime || a.updatedAt)
        );

        setChats(sortedChats);
        
        showSuccessAlert('You have left the chat');
      } catch (error: any) {
        console.error('Error leaving chat:', error);
        showErrorAlert(error.message || 'Failed to leave chat');
      }
    };

    showLeaveConfirmAlert('Chat', performLeave);
  };

  const handleMuteChat = async (chat: Chat) => {
    if (!user) return;

    try {
      await notificationService.muteChat(chat.id, user.uid);
      
      // Update local chat state
      const updatedChats = chats.map(c => 
        c.id === chat.id 
          ? { ...c, muted: true, mutedBy: user.uid, mutedAt: Date.now() }
          : c
      );
      setChats(updatedChats);
      
      showSuccessAlert('Chat muted. You will not receive notifications from this chat.');
    } catch (error: any) {
      console.error('Error muting chat:', error);
      showErrorAlert(error.message || 'Failed to mute chat');
    }
  };

  const handleUnmuteChat = async (chat: Chat) => {
    if (!user) return;

    try {
      await notificationService.unmuteChat(chat.id, user.uid);
      
      // Update local chat state
      const updatedChats = chats.map(c => 
        c.id === chat.id 
          ? { ...c, muted: false, mutedBy: undefined, mutedAt: undefined }
          : c
      );
      setChats(updatedChats);
      
      showSuccessAlert('Chat unmuted. You will now receive notifications from this chat.');
    } catch (error: any) {
      console.error('Error unmuting chat:', error);
      showErrorAlert(error.message || 'Failed to unmute chat');
    }
  };

  const renderChat = ({ item }: { item: Chat }) => {
    return (
      <SwipeableChatItem
        chat={item}
        user={user}
        onPress={() => onNavigateToChat(item.id)}
        onDelete={() => handleDeleteChat(item)}
        onLeave={() => handleLeaveChat(item)}
        onMute={() => handleMuteChat(item)}
        onUnmute={() => handleUnmuteChat(item)}
        isSmallScreen={isSmallScreen}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>{t('messages')}</Text>
            <View style={[styles.headerButtons, isSmallScreen && styles.headerButtonsSmall]}>
              <TouchableOpacity onPress={() => setShowUserSearch(true)} style={[styles.newChatButton, isSmallScreen && styles.newChatButtonSmall]}>
                <Text style={[styles.newChatButtonText, isSmallScreen && styles.newChatButtonTextSmall]}>+ {t('messages')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onNavigateToCreateGroup} style={[styles.createGroupButton, isSmallScreen && styles.createGroupButtonSmall]}>
                <Text style={[styles.createGroupButtonText, isSmallScreen && styles.createGroupButtonTextSmall]}>+ {t('createGroup')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} style={[styles.signOutButton, isSmallScreen && styles.signOutButtonSmall]}>
                <Text style={[styles.signOutText, isSmallScreen && styles.signOutTextSmall]}>{t('signOut')}</Text>
              </TouchableOpacity>
            </View>
      </View>
      
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChat}
        style={styles.chatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation!</Text>
          </View>
        }
      />
      
      {/* User Search Modal for starting direct chats */}
      <UserSearchModal
        visible={showUserSearch}
        selectedUsers={[]}
        onClose={() => setShowUserSearch(false)}
        onUserSelect={handleStartDirectChat}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 60,
  },
  headerSmall: {
    paddingVertical: 12,
    minHeight: 50,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerButtonsSmall: {
    gap: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  titleSmall: {
    fontSize: 20,
  },
  signOutButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  signOutButtonSmall: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    minHeight: 28,
    minWidth: 80,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
    textAlign: 'center',
  },
  signOutTextSmall: {
    fontSize: 9,
  },
  newChatButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButtonSmall: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    minWidth: 70,
  },
  newChatButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  newChatButtonTextSmall: {
    fontSize: 10,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
      emptySubtext: {
        fontSize: 14,
        color: '#999',
      },
      createGroupButton: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: '#28a745',
        borderRadius: 6,
        minHeight: 32,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 90,
        marginRight: 6,
      },
      createGroupButtonSmall: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        minHeight: 28,
        minWidth: 80,
      },
  createGroupButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  createGroupButtonTextSmall: {
    fontSize: 9,
  },
      groupAvatar: {
        backgroundColor: '#28a745',
      },
      groupIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#fff',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#28a745',
      },
      groupIndicatorText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#28a745',
      },
      chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
      },
      participantCount: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
      },
      groupDescription: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
        fontStyle: 'italic',
      },
      chatItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      chatActions: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 4,
      },
      actionButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#f5f5f5',
        marginLeft: 4,
        minWidth: 36,
        alignItems: 'center',
        justifyContent: 'center',
      },
      actionButtonText: {
        fontSize: 16,
      },
    });
