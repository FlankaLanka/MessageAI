import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { PanGestureHandler, State, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Chat, User } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { DirectChatService } from '../services/directChat';

interface SwipeableChatItemProps {
  chat: Chat;
  user: User | null;
  onPress: () => void;
  onDelete: () => void;
  onLeave: () => void;
  isSmallScreen?: boolean;
}

export default function SwipeableChatItem({
  chat,
  user,
  onPress,
  onDelete,
  onLeave,
  isSmallScreen = false
}: SwipeableChatItemProps) {
  const { t } = useLocalization();
  const translateX = useRef(new Animated.Value(0)).current;
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [showWebActions, setShowWebActions] = useState(false);
  const isGroup = chat.type === 'group';
  const participantCount = chat.participants?.length || 0;
  const isUserAdmin = user && chat.adminIds?.includes(user.uid);

  // Get display name - for direct chats, get other user's name
  const displayName = React.useMemo(() => {
    if (isGroup) {
      return chat.name || t('createGroup');
    } else {
      // For direct chats, use other user's display name or fallback to email
      return otherUser?.displayName || otherUser?.firstName + ' ' + otherUser?.lastName || otherUser?.email || t('messages');
    }
  }, [isGroup, chat.name, otherUser?.displayName, otherUser?.firstName, otherUser?.lastName, otherUser?.email]);

  // Load other user info for direct chats
  useEffect(() => {
    if (!isGroup && user && chat.participants) {
      const otherUserId = chat.participants.find(id => id !== user.uid);
      if (otherUserId) {
        DirectChatService.getOtherParticipant(chat.id, user.uid)
          .then(setOtherUser)
          .catch(error => {
            console.error('Error loading other user:', error);
          });
      }
    }
  }, [chat.id, chat.participants, user, isGroup]);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      if (translationX > 80 || velocityX > 300) {
        // Swipe right - show delete/leave action
        Animated.spring(translateX, {
          toValue: 100,
          useNativeDriver: true,
        }).start();
      } else {
        // Return to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };


  const handleDelete = () => {
    console.log('Delete button clicked on web for chat:', chat.id);
    console.log('Chat type:', chat.type, 'Is group:', isGroup, 'Is user admin:', isUserAdmin);
    resetPosition();
    setShowWebActions(false);
    console.log('Calling onDelete prop...');
    onDelete();
  };

  const handleLeave = () => {
    console.log('Leave button clicked on web');
    resetPosition();
    setShowWebActions(false);
    onLeave();
  };

  // Web-specific handlers
  const handleWebRightClick = (e: any) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      setShowWebActions(true);
    }
  };

  const handleWebMouseEnter = () => {
    if (Platform.OS === 'web') {
      console.log('Mouse entered chat item on web for chat:', chat.id);
      console.log('Setting showWebActions to true');
      setShowWebActions(true);
    }
  };

  const handleWebMouseLeave = () => {
    if (Platform.OS === 'web') {
      console.log('Mouse left chat item on web');
      setShowWebActions(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Right Background Actions (Delete/Leave) */}
      <View style={styles.rightBackgroundActions}>
        {(!isGroup || isUserAdmin) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        
        {isGroup && !isUserAdmin && (
          <TouchableOpacity
            style={[styles.actionButton, styles.leaveButton]}
            onPress={handleLeave}
          >
            <Text style={styles.actionButtonText}>👋</Text>
            <Text style={styles.actionButtonLabel}>Leave</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Chat Item */}
      {Platform.OS === 'web' ? (
        <View
          style={[
            styles.chatItem,
            showWebActions && styles.chatItemWithActions
          ]}
          onMouseEnter={handleWebMouseEnter}
          onMouseLeave={handleWebMouseLeave}
          onContextMenu={handleWebRightClick}
        >
          <TouchableOpacity
            style={styles.chatContent}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, isGroup && styles.groupAvatar]}>
              {!isGroup && otherUser?.photoURL ? (
                <Image source={{ uri: otherUser.photoURL }} style={styles.profilePicture} />
              ) : (
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              )}
              {isGroup && (
                <View style={styles.groupIndicator}>
                  <Text style={styles.groupIndicatorText}>G</Text>
                </View>
              )}
            </View>
            
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>
                  {displayName}
                </Text>
                {isGroup && (
                  <Text style={styles.participantCount}>
                    {participantCount} members
                  </Text>
                )}
              </View>
              
              <Text style={styles.lastMessage} numberOfLines={1}>
                {chat.lastMessage?.text || t('noMessagesYet')}
              </Text>
            </View>
            
            <View style={styles.chatMeta}>
              <Text style={styles.timestamp}>
                {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString() : ''}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Web Action Buttons */}
          {showWebActions && Platform.OS === 'web' && (
            <View style={styles.webActionButtons}>
              {console.log('Rendering web action buttons for chat:', chat.id, 'showWebActions:', showWebActions)}
              
              {(!isGroup || isUserAdmin) && (
                <TouchableOpacity
                  style={[styles.webActionButton, styles.webDeleteButton]}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Text style={styles.webDeleteButtonText}>✕</Text>
                </TouchableOpacity>
              )}
              
              {isGroup && !isUserAdmin && (
                <TouchableOpacity
                  style={[styles.webActionButton, styles.webLeaveButton]}
                  onPress={handleLeave}
                  activeOpacity={0.7}
                >
                  <Text style={styles.webActionButtonText}>👋</Text>
                  <Text style={styles.webActionButtonLabel}>Leave</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : (
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleStateChange}
          activeOffsetX={[-10, 10]}
          failOffsetY={[-5, 5]}
        >
          <Animated.View
            style={[
              styles.chatItem,
              { transform: [{ translateX }] }
            ]}
          >
            <TouchableOpacity
              style={styles.chatContent}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, isGroup && styles.groupAvatar]}>
                {!isGroup && otherUser?.photoURL ? (
                  <Image source={{ uri: otherUser.photoURL }} style={styles.profilePicture} />
                ) : (
                  <Text style={styles.avatarText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                )}
                {isGroup && (
                  <View style={styles.groupIndicator}>
                    <Text style={styles.groupIndicatorText}>G</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>
                    {displayName}
                  </Text>
                  {isGroup && (
                    <Text style={styles.participantCount}>
                      {participantCount} members
                    </Text>
                  )}
                </View>
                
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage?.text || t('noMessagesYet')}
                </Text>
              </View>
              
              <View style={styles.chatMeta}>
                <Text style={styles.timestamp}>
                  {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString() : ''}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  rightBackgroundActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
    width: 100,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  leaveButton: {
    backgroundColor: '#007aff',
  },
  actionButtonText: {
    fontSize: 20,
    marginBottom: 2,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtonLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  chatItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  participantCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  chatMeta: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  // Web-specific styles
  chatItemWithActions: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  webActionButtons: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  webActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    cursor: 'pointer',
  },
  webDeleteButton: {
    backgroundColor: '#ff3b30',
  },
  webLeaveButton: {
    backgroundColor: '#007aff',
  },
  webActionButtonText: {
    fontSize: 18,
    marginBottom: 2,
  },
  webDeleteButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  webActionButtonLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
