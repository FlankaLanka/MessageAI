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
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useLocalization } from '../../hooks/useLocalization';
import { AuthService } from '../../api/auth';
import { MessageService } from '../../api/messages';
import { DirectChatService } from '../../api/directChat';
import { notificationService } from '../../api/notifications';
import { Chat, User } from '../../types';
import SwipeableChatItem from '../../components/SwipeableChatItem';
import UserSearchModal from '../../components/UserSearchModal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../api/firebase';
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
      
      // Create or find existing direct chat
      const chatId = await DirectChatService.createDirectChat(user.uid, selectedUser.uid);
      
      // Navigate to the chat
      onNavigateToChat(chatId);
      
      // Close the user search modal
      setShowUserSearch(false);
      
    } catch (error) {
      console.error('Error starting direct chat:', error);
      showErrorAlert('Failed to start chat. Please try again.');
    }
  };


  const handleDeleteChat = async (chat: Chat) => {
    if (!user) return;

    
    const isGroup = chat.type === 'group';
    const itemType = isGroup ? 'Group' : 'Chat';
    
    const performDelete = async () => {
      try {
        // Delete the chat (works for both direct and group chats)
        await MessageService.deleteChat(chat.id, user.uid);

        // Refresh chats
        const allChats = await MessageService.getUserChats(user.uid);
        const sortedChats = allChats.sort((a, b) => 
          (b.lastMessageTime || b.updatedAt) - (a.lastMessageTime || a.updatedAt)
        );

        setChats(sortedChats);
        
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


  const renderChat = ({ item }: { item: Chat }) => {
    return (
      <SwipeableChatItem
        chat={item}
        user={user}
        onPress={() => onNavigateToChat(item.id)}
        onDelete={() => handleDeleteChat(item)}
        onLeave={() => handleLeaveChat(item)}
        isSmallScreen={isSmallScreen}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>{t('messages')}</Text>
            <View style={[styles.headerButtons, isSmallScreen && styles.headerButtonsSmall]}>
              <TouchableOpacity 
                onPress={() => setShowUserSearch(true)} 
                style={[styles.newChatButton, isSmallScreen && styles.newChatButtonSmall]}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={isSmallScreen ? 18 : 20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onNavigateToCreateGroup} 
                style={[styles.createGroupButton, isSmallScreen && styles.createGroupButtonSmall]}
                activeOpacity={0.7}
              >
                <Ionicons name="people" size={isSmallScreen ? 18 : 20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSignOut} 
                style={[styles.signOutButton, isSmallScreen && styles.signOutButtonSmall]}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out" size={isSmallScreen ? 18 : 20} color="#FFFFFF" />
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
            <Text style={styles.emptyText}>{t('noChatsYet')}</Text>
            <Text style={styles.emptySubtext}>{t('startConversation')}</Text>
          </View>
        }
      />
      
      {/* User Search Modal for starting direct chats */}
      <UserSearchModal
        visible={showUserSearch}
        selectedUsers={[]}
        onClose={() => setShowUserSearch(false)}
        onUserSelect={handleStartDirectChat}
        title={t('searchUsers')}
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
    width: 40,
    height: 40,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    marginLeft: 4,
  },
  signOutTextSmall: {
    fontSize: 10,
  },
  newChatButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newChatButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
        width: 40,
        height: 40,
        backgroundColor: '#10B981',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        shadowColor: '#10B981',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
      createGroupButtonSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
