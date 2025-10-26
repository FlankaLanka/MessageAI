import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Dimensions,
  Image,
  Modal,
  Keyboard,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Message, User, Chat } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { MessageService } from '../../api/messages';
import { UserService } from '../../api/users';
import { GroupService } from '../../api/groups';
import { useNetworkState } from '../../api/network';
import { presenceService, TypingData } from '../../api/presence';
import OnlineIndicator from '../../components/OnlineIndicator';
import TypingIndicator from '../../components/TypingIndicator';
import ProfileModal from '../../components/ProfileModal';
import AddMembersModal from '../../components/AddMembersModal';
import GroupMembersModal from '../../components/GroupMembersModal';
import ReadReceipt from '../../components/ReadReceipt';
import VoiceRecorder from '../../components/VoiceRecorder';
import VoiceMessageBubble from '../../components/VoiceMessageBubble';
import { VoiceMessagePreviewModal } from '../../components/VoiceMessagePreviewModal';
import ImagePickerButton from '../../components/ImagePickerButton';
import ReactionPicker from '../../components/ReactionPicker';
import ReactionDisplay from '../../components/ReactionDisplay';
import { ReactionButton } from '../../components/ReactionButton';
import { TranslationButton } from '../../components/TranslationButton';
import { TranslatedMessageDisplay } from '../../components/TranslatedMessageDisplay';
import { TranslationIndicator } from '../../components/TranslationIndicator';
import { SmartSuggestions } from '../../components/SmartSuggestions';
import { voiceTranslationService } from '../../api/voiceTranslation';
import { ReadReceiptService, UserReadStatus } from '../../api/readReceipts';
import { audioService } from '../../api/audio';
import { supabaseVectorService } from '../../api/supabaseVector';
import { ReactionService } from '../../api/reactions';
import { MessageReaction } from '../../types';
import * as Haptics from 'expo-haptics';
import { MediaService } from '../../api/media';

interface SimpleChatScreenProps {
  chatId: string;
  onNavigateBack: () => void;
  onNavigateToUserProfile: (userId: string) => void;
}

export default function SimpleChatScreen({ chatId, onNavigateBack, onNavigateToUserProfile }: SimpleChatScreenProps) {
  const { t } = useLocalization();
  const { 
    user, 
    addMessage, 
    updateMessage, 
    updateChatLastMessage,
    defaultTranslationLanguage,
    translationMode
  } = useStore();
  
  // Use local state for messages instead of global state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [groupParticipants, setGroupParticipants] = useState<User[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [readStatus, setReadStatus] = useState<Record<string, UserReadStatus>>({});
  const [messageTranslations, setMessageTranslations] = useState<Record<string, { 
    text: string; 
    language: string; 
    culturalHints?: any[]; 
    intelligentProcessing?: any;
  }>>({});
  const [translatingMessages, setTranslatingMessages] = useState<Set<string>>(new Set());
  
  // Smart suggestions state
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [isSuggestionsMode, setIsSuggestionsMode] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Image selection state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Timer state for showing "sending" indicator after 1 second
  const [showSendingIndicators, setShowSendingIndicators] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  const waveAnimations = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;
  
  // Text input ref for focusing
  const textInputRef = useRef<TextInput>(null);
  
  // Timer effect for showing "sending" indicator after 1 second
  useEffect(() => {
    const optimisticMessages = messages.filter(msg => msg.isOptimistic);
    const currentOptimisticIds = new Set(optimisticMessages.map(msg => msg.id));
    
    // Clean up timers and indicators for messages that are no longer optimistic
    timersRef.current.forEach((timer, messageId) => {
      if (!currentOptimisticIds.has(messageId)) {
        clearTimeout(timer);
        timersRef.current.delete(messageId);
      }
    });
    
    // Clean up sending indicators for messages that are no longer optimistic
    setShowSendingIndicators(prev => {
      const newSet = new Set(prev);
      for (const id of prev) {
        if (!currentOptimisticIds.has(id)) {
          newSet.delete(id);
        }
      }
      return newSet;
    });
    
    // Set timers for new optimistic messages that don't already have timers
    optimisticMessages.forEach(msg => {
      if (!timersRef.current.has(msg.id)) {
        console.log('⏰ Setting timer for optimistic message:', msg.id, 'type:', msg.audioUrl ? 'voice' : msg.imageUrl ? 'image' : 'text');
        const timer = setTimeout(() => {
          console.log('⏰ Timer fired for message:', msg.id, 'adding to sending indicators');
          setShowSendingIndicators(prev => new Set(prev).add(msg.id));
          timersRef.current.delete(msg.id);
        }, 1000);
        timersRef.current.set(msg.id, timer);
      }
    });
  }, [messages]);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);
  
  // Translation handlers
  const handleTranslationComplete = (
    messageId: string, 
    translation: string, 
    language: string, 
    culturalHints?: any[], 
    intelligentProcessing?: any
  ) => {
    setMessageTranslations(prev => ({
      ...prev,
      [messageId]: { 
        text: translation, 
        language, 
        culturalHints, 
        intelligentProcessing 
      }
    }));
  };

  const handleCloseTranslation = (messageId: string) => {
    setMessageTranslations(prev => {
      const newTranslations = { ...prev };
      delete newTranslations[messageId];
      return newTranslations;
    });
  };

  // Voice messages use the same translation handler as text messages
  // No need for a separate wrapper function
  
  // Voice recording state
  const [recordedAudio, setRecordedAudio] = useState<{uri: string, duration: number} | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  
  // Reaction state
  const [messageReactions, setMessageReactions] = useState<Record<string, MessageReaction[]>>({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  const networkState = useNetworkState();

  // Get screen dimensions for responsive design
  const { height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;

  const autoTranslateMessages = async (messages: Message[], currentUser: User) => {
    if (translationMode !== 'auto' && translationMode !== 'auto-advanced') return;

    // Add a small delay to prevent rapid-fire translation requests
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      // Import translation services
      const { simpleTranslationService } = await import('../../api/simpleTranslation');
      const { enhancedTranslationService } = await import('../../api/enhancedTranslation');
      
      // Filter out optimistic messages and messages that need translation
      const messagesToTranslate = messages.filter(msg => 
        !msg.isOptimistic && // Exclude optimistic messages
        msg.senderId !== currentUser.uid && 
        (msg.text || msg.audioUrl) && // Include both text and voice messages
        !messageTranslations[msg.id] &&
        !msg.text?.startsWith('[') // Don't translate system messages
      );

      // Translate messages in parallel with a small delay to prevent overwhelming the system
      const translateMessage = async (message: Message, index: number) => {
        // Add a small delay to prevent overwhelming the translation service
        await new Promise(resolve => setTimeout(resolve, index * 100));
        
        // Mark message as being translated
        setTranslatingMessages(prev => new Set([...prev, message.id]));
        
        try {
          if (message.audioUrl && !message.text) {
            // Voice message - treat transcription exactly like regular text message
            
            // Create a text message from the transcription for translation
            const textMessage: Message = {
              ...message,
              text: message.transcription || '' // Use transcription as text
            };
            
            if (enhancedTranslationService.isAvailable()) {
              const result = await enhancedTranslationService.translateMessage(
                textMessage,
                defaultTranslationLanguage,
                {
                  useRAG: true,
                  useCulturalHints: true,
                  useSimpleTranslation: true,
                  contextLimit: 10,
                  confidenceThreshold: 0.6
                }
              );
              
              
              setMessageTranslations(prev => ({
                ...prev,
                [message.id]: {
                  text: result.translation,
                  language: defaultTranslationLanguage,
                  culturalHints: result.culturalHints || [],
                  intelligentProcessing: result.intelligentProcessing || null
                }
              }));
            }
          } else if (translationMode === 'auto-advanced') {
            // Use enhanced translation with cultural hints for auto-advanced mode
            if (enhancedTranslationService.isAvailable()) {
              const result = await enhancedTranslationService.translateMessage(
                message,
                defaultTranslationLanguage,
                {
                  useRAG: true,
                  useCulturalHints: true,
                  useSimpleTranslation: true,
                  contextLimit: 10,
                  confidenceThreshold: 0.6
                }
              );
              
              // Store the enhanced translation
              setMessageTranslations(prev => ({
                ...prev,
                [message.id]: {
                  text: result.translation,
                  language: defaultTranslationLanguage,
                  culturalHints: result.culturalHints || [],
                  intelligentProcessing: result.intelligentProcessing
                }
              }));
              
              // Remove from translating set
              setTranslatingMessages(prev => {
                const newSet = new Set(prev);
                newSet.delete(message.id);
                return newSet;
              });
            } else {
              // Fallback to simple translation with cultural hints
              const result = await simpleTranslationService.translateWithCulturalHints(
                message.text || '', 
                defaultTranslationLanguage
              );
              
              setMessageTranslations(prev => ({
                ...prev,
                [message.id]: {
                  text: result.translation,
                  language: defaultTranslationLanguage,
                  culturalHints: result.culturalHints,
                  intelligentProcessing: undefined
                }
              }));
              
              // Remove from translating set
              setTranslatingMessages(prev => {
                const newSet = new Set(prev);
                newSet.delete(message.id);
                return newSet;
              });
            }
          } else {
            // Use simple translation for auto mode
            const translation = await simpleTranslationService.translateText(
              message.text || '', 
              defaultTranslationLanguage
            );
            
            // Store the simple translation
            setMessageTranslations(prev => ({
              ...prev,
              [message.id]: {
                text: translation,
                language: defaultTranslationLanguage,
                culturalHints: [],
                intelligentProcessing: undefined
              }
            }));
            
            // Remove from translating set
            setTranslatingMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.id);
              return newSet;
            });
          }
        } catch (error) {
          console.error(`Error auto-translating message ${message.id}:`, error);
          // Remove from translating set on error
          setTranslatingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(message.id);
            return newSet;
          });
        }
      };
      
      // Process all translations in parallel
      await Promise.allSettled(
        messagesToTranslate.map((message, index) => translateMessage(message, index))
      );
    } catch (error) {
      console.error('Error in auto-translation:', error);
    }
  };

  // Helper function to replace optimistic messages with real ones
  const replaceOptimisticMessages = (
    currentMessages: Message[], 
    newMessages: Message[]
  ): Message[] => {
    const optimisticMessages = currentMessages.filter(m => m.isOptimistic);
    const existingRealMessages = currentMessages.filter(m => !m.isOptimistic);
    
    console.log('🔄 INDIVIDUAL Processing message replacement:', {
      currentTotal: currentMessages.length,
      optimistic: optimisticMessages.length,
      existingReal: existingRealMessages.length,
      newFromFirebase: newMessages.length
    });
    
    // Create a map of existing real messages for quick lookup
    const existingRealMap = new Map(existingRealMessages.map(m => [m.id, m]));
    
    // Find messages that are truly new (not in our existing real messages)
    const trulyNewMessages = newMessages.filter(msg => !existingRealMap.has(msg.id));
    
    console.log('🆕 INDIVIDUAL Truly new messages:', trulyNewMessages.length);
    
    // Debug: Log available optimistic messages
    console.log('🔍 INDIVIDUAL Available optimistic messages:', optimisticMessages.map(opt => ({
      id: opt.id,
      optimisticId: opt.optimisticId,
      text: opt.text,
      timestamp: opt.timestamp
    })));
    
    // For each truly new message, check if it replaces an optimistic one INDIVIDUALLY
    const replacedOptimisticIds = new Set<string>();
    const processedNewMessages: Message[] = [];
    
    // Process each new message individually to ensure one-to-one replacement
    // Track processed messages to prevent duplicates
    const processedMessageIds = new Set<string>();
    
    for (const newMsg of trulyNewMessages) {
      // Skip if we've already processed this message
      if (processedMessageIds.has(newMsg.id)) {
        console.log('⚠️ INDIVIDUAL Skipping duplicate message:', newMsg.id);
        continue;
      }
      processedMessageIds.add(newMsg.id);
      // Debug: Log the new message data to see what fields are available
      console.log('🔍 INDIVIDUAL New message from Firebase:', {
        id: newMsg.id,
        optimisticId: (newMsg as any).optimisticId,
        senderId: newMsg.senderId,
        text: newMsg.text,
        timestamp: newMsg.timestamp,
        allFields: Object.keys(newMsg)
      });
      
      // Check if this new message has an optimisticId that matches any optimistic message
      // Only match optimistic messages that haven't already been replaced
      const matchingOptimistic = optimisticMessages.find(opt => 
        opt.optimisticId === (newMsg as any).optimisticId && 
        !replacedOptimisticIds.has(opt.id) // Don't replace already replaced messages
      );
      
      if (matchingOptimistic) {
        console.log('🔄 INDIVIDUAL Replacing optimistic message with real message:', {
          optimisticId: matchingOptimistic.id,
          realId: newMsg.id,
          optimisticKey: (newMsg as any).optimisticId,
          text: newMsg.text,
          timestamp: newMsg.timestamp
        });
        // Mark this SPECIFIC optimistic message for removal
        replacedOptimisticIds.add(matchingOptimistic.id);
        processedNewMessages.push(newMsg);
      } else {
        console.log('❌ INDIVIDUAL No matching optimistic message found for:', {
          newMsgId: newMsg.id,
          newMsgOptimisticId: (newMsg as any).optimisticId,
          availableOptimisticIds: optimisticMessages.map(opt => opt.optimisticId),
          alreadyReplaced: Array.from(replacedOptimisticIds)
        });
        // This is a genuinely new message, not replacing an optimistic one
        processedNewMessages.push(newMsg);
      }
    }
    
    // Keep optimistic messages that weren't replaced
    const remainingOptimistic = optimisticMessages.filter(
      m => !replacedOptimisticIds.has(m.id)
    );
    
    // Combine: new real messages + remaining optimistic messages
    // Only include existing real messages if there are new messages from Firebase
    // This prevents old messages from persisting when opening a new chat
    const allMessages = [
      ...processedNewMessages,
      ...remainingOptimistic
    ];
    
    // If there are new messages from Firebase, also include existing real messages
    // This ensures we don't lose messages when Firebase sends updates
    if (processedNewMessages.length > 0) {
      allMessages.unshift(...existingRealMessages);
    }
    
    console.log('📊 INDIVIDUAL Message replacement stats:', {
      totalOptimistic: optimisticMessages.length,
      replaced: replacedOptimisticIds.size,
      remaining: remainingOptimistic.length,
      finalTotal: allMessages.length,
      replacedIds: Array.from(replacedOptimisticIds)
    });
    
    // Sort by timestamp descending (newest first)
    return allMessages.sort((a, b) => b.timestamp - a.timestamp);
  };

  // Load chat info when component mounts
  useEffect(() => {
    if (!user) return;
    
    console.log('🚀 SimpleChatScreen mounted for chat:', chatId);
    
    // Set this chat as active to prevent notifications while user is viewing it
    MessageService.setActiveChat(chatId);
    
    loadChatInfo();
  }, [chatId, user]);

  useEffect(() => {
    if (!user) return;

    // Load initial messages first
    const loadInitialMessages = async () => {
      try {
        console.log('📥 Loading initial messages for chat:', chatId);
        const initialMessages = await MessageService.getMessages(chatId);
        console.log('📥 Loaded initial messages:', initialMessages.length);
        setMessages(initialMessages);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading initial messages:', error);
        setIsLoading(false);
      }
    };

    loadInitialMessages();

    // Set up real-time listener for messages with offline support
    console.log('🔄 Setting up message listener in SimpleChatScreen for chat:', chatId);
    
    const unsubscribe = MessageService.onMessagesUpdate(chatId, async (newMessages) => {
      console.log('📨 Message listener callback triggered:', { 
        chatId, 
        newMessageCount: newMessages.length,
        currentMessageCount: messages.length 
      });
      
      // If we already have messages loaded and Firebase returns 0 messages,
      // this might be a temporary disconnection - don't clear existing messages
      if (messages.length > 0 && newMessages.length === 0) {
        console.log('📨 Firebase returned 0 messages but we have local messages - keeping local messages');
        return;
      }
      
      // Only clear messages if this is truly a new chat (no messages loaded yet)
      if (messages.length === 0 && newMessages.length === 0) {
        console.log('🧹 No messages found for new chat');
        setIsLoading(false);
        return;
      }
      
      // Filter and replace optimistic messages with real ones ONE BY ONE
      // This ensures each optimistic message is replaced individually when its Firebase data arrives
      console.log('🔄 INDIVIDUAL Processing batch of', newMessages.length, 'messages from Firebase');
      let currentMessages = messages;
      
      // Process each new message individually to ensure one-by-one replacement
      for (let i = 0; i < newMessages.length; i++) {
        const singleNewMessage = newMessages[i];
        console.log(`🔄 INDIVIDUAL Processing message ${i + 1}/${newMessages.length}:`, {
          id: singleNewMessage.id,
          optimisticId: (singleNewMessage as any).optimisticId,
          text: singleNewMessage.text?.substring(0, 50)
        });
        
        // Replace optimistic messages one at a time
        currentMessages = replaceOptimisticMessages(currentMessages, [singleNewMessage]);
        
        console.log(`✅ INDIVIDUAL After processing message ${i + 1}:`, {
          total: currentMessages.length,
          optimistic: currentMessages.filter(m => m.isOptimistic).length,
          real: currentMessages.filter(m => !m.isOptimistic).length
        });
      }
      
      const processedMessages = currentMessages;
      
      console.log('📨 INDIVIDUAL Final processed messages:', { 
        chatId, 
        processedCount: processedMessages.length,
        optimisticCount: processedMessages.filter(m => m.isOptimistic).length,
        realCount: processedMessages.filter(m => !m.isOptimistic).length
      });
      
      setMessages(processedMessages);
      setIsLoading(false);
      
      // Only process real messages (not optimistic) for translation/transcription
      const realMessages = processedMessages.filter(m => !m.isOptimistic);
      
      // Mark real messages as read immediately (non-blocking)
      markMessagesAsRead(realMessages).catch(error => {
        console.error('Error marking messages as read:', error);
      });
      
      // Auto-translate only real messages
      if ((translationMode === 'auto' || translationMode === 'auto-advanced') && user) {
        autoTranslateMessages(realMessages, user).catch(error => {
          console.error('Background translation error:', error);
        });
      }
      
      // Store real messages in Supabase Vector (background, non-blocking)
      realMessages
        .filter(m => m.text)
        .forEach(message => {
          supabaseVectorService.storeMessage(chatId, message.text!, {
            senderId: message.senderId,
            senderName: message.senderName,
            timestamp: message.timestamp
          }).catch(error => {
            console.warn('Failed to store message in Supabase Vector:', error);
          });
        });
    });

    // Set up typing indicators subscription
    const unsubscribeTyping = presenceService.subscribeToTypingIndicators(chatId, (typingData) => {
      setTypingUsers(typingData);
    });

    // Set up read status subscription
    const unsubscribeReadStatus = ReadReceiptService.subscribeToReadStatus(chatId, (newReadStatus: Record<string, UserReadStatus>) => {
      setReadStatus(newReadStatus);
    });

    // Start read receipt sync service
    const stopSync = ReadReceiptService.startAutoSync();

    // Set up reaction subscriptions for visible messages
    const reactionUnsubscribers: (() => void)[] = [];
    
    const setupReactionSubscriptions = (messages: Message[]) => {
      // Clean up existing subscriptions
      reactionUnsubscribers.forEach(unsub => unsub());
      reactionUnsubscribers.length = 0;
      
      // Subscribe to reactions for visible messages
      messages.slice(0, 20).forEach(message => { // Limit to first 20 messages for performance
        const unsubscribe = ReactionService.onReactionsUpdate(
          chatId,
          message.id,
          (reactions) => {
            setMessageReactions(prev => ({
              ...prev,
              [message.id]: reactions
            }));
          }
        );
        reactionUnsubscribers.push(unsubscribe);
      });
    };

    // Set up initial reaction subscriptions
    setupReactionSubscriptions(messages);

    return () => {
      unsubscribe();
      unsubscribeTyping();
      unsubscribeReadStatus();
      stopSync();
      // Clean up reaction subscriptions
      reactionUnsubscribers.forEach(unsub => unsub());
      
      // Clear active chat when user navigates away
      MessageService.setActiveChat(null);
    };
  }, [chatId, user, setMessages]);

  // Set up reaction subscriptions when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const reactionUnsubscribers: (() => void)[] = [];
      
      // Subscribe to reactions for visible messages (limit to prevent memory issues)
      const visibleMessages = messages.slice(0, 20);
      visibleMessages.forEach((message: Message) => {
        const unsubscribe = ReactionService.onReactionsUpdate(
          chatId,
          message.id,
          (reactions) => {
            setMessageReactions(prev => ({
              ...prev,
              [message.id]: reactions
            }));
          }
        );
        reactionUnsubscribers.push(unsubscribe);
      });

      return () => {
        reactionUnsubscribers.forEach(unsub => unsub());
      };
    }
  }, [messages, chatId]);

  const markMessagesAsRead = async (messages: Message[]) => {
    if (!user || messages.length === 0) return;
    
    try {
      // Get the latest message from other users (in inverted FlatList, newest is at index 0)
      const latestMessage = messages
        .filter(msg => msg.senderId !== user.uid && msg.status !== 'sending' && msg.status !== 'failed')
        [0]; // Get the first message (newest) from the inverted list
      
      if (latestMessage) {
        // Mark the latest message as read using the new read receipt system
        await ReadReceiptService.markMessagesAsRead(
          chatId,
          latestMessage.id,
          user.uid,
          user.displayName,
          user.photoURL
        );
        
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const loadChatInfo = async () => {
    try {
      // Load chat details
      const chatData = await MessageService.getUserChats(user!.uid);
      const currentChat = chatData.find(c => c.id === chatId);
      
      if (currentChat) {
        setChat(currentChat);
        
        if (currentChat.type === 'direct') {
          // For direct chat, find the other user
          const otherUserId = currentChat.participants.find(id => id !== user!.uid);
          if (otherUserId) {
            const otherUserData = await UserService.getUserProfile(otherUserId);
            setOtherUser(otherUserData);
            
            // Subscribe to other user's presence
            if (otherUserData) {
              presenceService.subscribeToUserPresence(otherUserId, (presence) => {
                setIsOnline(presence.state === 'online');
              });
            }
          }
        } else if (currentChat.type === 'group') {
          // For group chat, load all participants
          const participants = await UserService.getUsersByIds(currentChat.participants);
          setGroupParticipants(participants);
        }
      }
    } catch (error) {
      console.error('Error loading chat info:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !user) return;

    const messageText = newMessage.trim();
    
    // Clear input immediately for better UX
    setNewMessage('');
    setSelectedImage(null);

    try {
      let optimisticMessage: Message;
      
      if (selectedImage) {
        // Send optimistic image message (returns immediately)
        optimisticMessage = await MessageService.sendImageMessage(
          chatId,
          user.uid,
          selectedImage,
          messageText || undefined, // Send text if provided, otherwise undefined
          user.displayName,
          user.photoURL
        );
      } else {
        // Send optimistic text message (returns immediately)
        optimisticMessage = await MessageService.sendMessage(
          chatId, 
          user.uid, 
          messageText, 
          user.displayName, 
          user.photoURL
        );
      }
      
      // Add optimistic message to local state immediately
      setMessages(prev => [...prev, optimisticMessage].sort((a, b) => b.timestamp - a.timestamp));
      // Don't update chat last message for optimistic messages - they're temporary
      
      // Background operations (non-blocking)
      // Stop typing indicator in background (don't await)
      presenceService.setTypingStatus(chatId, user.uid, user.displayName, false).catch(error => {
        console.warn('Error stopping typing indicator:', error);
      });
      
      // Don't store optimistic messages in Supabase Vector
      // Real message will be stored when it arrives via listener
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(t('error'), t('failedToSendMessage'));
    }
  };

  // Voice recording handlers
  const handleVoiceRecordingComplete = (audioUri: string, duration: number) => {
    setRecordedAudio({ uri: audioUri, duration });
    setShowPreviewModal(true);
  };

  const handleVoiceRecordingCancel = () => {
    setRecordedAudio(null);
    setShowPreviewModal(false);
  };


  const handleSendVoiceMessage = async () => {
    if (!recordedAudio || !user) return;
    
    try {
      // Send optimistic voice message (returns immediately)
      const optimisticMessage = await MessageService.sendVoiceMessage(
        chatId,
        user.uid,
        recordedAudio.uri,
        recordedAudio.duration,
        user.displayName,
        user.photoURL
      );
      
      // Add optimistic message to local state immediately
      setMessages(prev => [...prev, optimisticMessage].sort((a, b) => b.timestamp - a.timestamp));
      // Don't update chat last message for optimistic messages - they're temporary
      
      // Clear the recorded audio
      setRecordedAudio(null);
      setShowPreviewModal(false);
      
      // Background operations (non-blocking)
      // Don't store optimistic messages in Supabase Vector
      // Real message will be stored when it arrives via listener
      
    } catch (error) {
      console.error('Error sending voice message:', error);
      Alert.alert(t('error'), t('failedToSendVoiceMessage'));
    }
  };

  // Image message handlers
  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  // Reaction handlers
  const handleMessageLongPress = async (messageId: string) => {
    if (!user) return;
    
    // Add haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available on this platform
    }
    
    setSelectedMessageId(messageId);
    setShowReactionPicker(true);
  };

  const handleReactionSelect = async (emoji: string) => {
    if (!user || !selectedMessageId) return;
    
    try {
      const currentReactions = messageReactions[selectedMessageId] || [];
      const userReaction = currentReactions.find(r => r.userId === user.uid);
      
      if (userReaction && userReaction.emoji === emoji) {
        // Remove reaction if same emoji
        await ReactionService.removeReaction(chatId, selectedMessageId, user.uid);
      } else {
        // Add or change reaction
        await ReactionService.addReaction(
          chatId,
          selectedMessageId,
          emoji,
          user.uid,
          user.displayName,
          user.photoURL
        );
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      Alert.alert(t('error'), t('failedToAddReaction'));
    }
  };

  const handleDirectReactionPress = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      const currentReactions = messageReactions[messageId] || [];
      const userReaction = currentReactions.find(r => r.userId === user.uid);
      
      if (userReaction && userReaction.emoji === emoji) {
        // Remove reaction if same emoji
        await ReactionService.removeReaction(chatId, messageId, user.uid);
      } else {
        // Add or change reaction
        await ReactionService.addReaction(
          chatId,
          messageId,
          emoji,
          user.uid,
          user.displayName,
          user.photoURL
        );
      }
    } catch (error) {
      console.error('Error handling direct reaction:', error);
      Alert.alert(t('error'), t('failedToAddReaction'));
    }
  };

  const handleReactionPickerClose = () => {
    setShowReactionPicker(false);
    setSelectedMessageId(null);
  };

  const handlePlayVoiceMessage = async (messageId: string, audioUrl: string) => {
    try {
      // Stop any currently playing audio
      if (playingMessageId && playingMessageId !== messageId) {
        await audioService.stopAudio();
      }
      
      setPlayingMessageId(messageId);
      // The actual playback will be handled by VoiceMessageBubble
    } catch (error) {
      console.error('Error playing voice message:', error);
    }
  };

  const handlePauseVoiceMessage = async () => {
    try {
      await audioService.pauseAudio();
      setPlayingMessageId(null);
    } catch (error) {
      console.error('Error pausing voice message:', error);
    }
  };

  const handleTextChange = async (text: string) => {
    setNewMessage(text);
    
    if (!user) return;
    
    // Set typing indicator when user starts typing (non-blocking)
    if (text.trim().length > 0) {
      presenceService.setTypingStatus(chatId, user.uid, user.displayName, true).catch(error => {
        console.warn('Error setting typing indicator:', error);
      });
    } else {
      // Stop typing when text is empty (non-blocking)
      presenceService.setTypingStatus(chatId, user.uid, user.displayName, false).catch(error => {
        console.warn('Error stopping typing indicator:', error);
      });
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setNewMessage(suggestion);
    // Exit suggestions mode but don't automatically bring up keyboard
    setIsSuggestionsMode(false);
    setShowSmartSuggestions(false);
    // Let user decide when to focus the text input
  };


  // Focus text input to bring up keyboard
  const focusTextInput = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  // Toggle between keyboard and suggestions mode
  const toggleSuggestionsMode = () => {
    if (!isSuggestionsMode) {
      // Switching to suggestions mode - hide keyboard and show suggestions
      Keyboard.dismiss();
      setIsSuggestionsMode(true);
      setShowSmartSuggestions(true);
    } else {
      // Switching back to keyboard mode - hide suggestions only
      setIsSuggestionsMode(false);
      setShowSmartSuggestions(false);
      // Don't automatically focus the text input - let user decide
    }
  };


  // Note: Removed keyboard dismissal of smart suggestions
  // Smart suggestions can now stay open when keyboard is shown

  // Recording timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      // Start wave animations
      const animateWaves = () => {
        waveAnimations.forEach((anim, index) => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1,
                duration: 300 + index * 100,
                useNativeDriver: false,
              }),
              Animated.timing(anim, {
                toValue: 0.3,
                duration: 300 + index * 100,
                useNativeDriver: false,
              }),
            ])
          ).start();
        });
      };
      
      animateWaves();
      
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);
    } else {
      setRecordingDuration(0);
      // Stop wave animations
      waveAnimations.forEach(anim => {
        anim.stopAnimation();
        anim.setValue(0.3);
      });
    }
    return () => clearInterval(interval);
  }, [isRecording, waveAnimations]);

  const renderHeader = () => {
    if (!chat) return null;

    if (chat.type === 'direct' && otherUser) {
      return (
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <TouchableOpacity onPress={onNavigateBack} style={[styles.backButton, isSmallScreen && styles.backButtonSmall]}>
            <Text style={[styles.backButtonText, isSmallScreen && styles.backButtonTextSmall]}>← {t('back')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileSection}
            onPress={() => setShowProfileModal(true)}
          >
            <View style={styles.profilePictureContainer}>
              {otherUser.photoURL ? (
                <Image source={{ uri: otherUser.photoURL }} style={styles.profilePicture} />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Text style={styles.placeholderText}>
                    {otherUser.firstName?.charAt(0) || otherUser.lastName?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
              <OnlineIndicator isOnline={isOnline} size={12} showOffline={true} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isSmallScreen && styles.profileNameSmall]}>
                {otherUser.displayName || `${otherUser.firstName} ${otherUser.lastName}`}
              </Text>
              <Text style={[styles.profileStatus, isSmallScreen && styles.profileStatusSmall]}>
                {isOnline ? t('online') : t('offline')}
              </Text>
            </View>
          </TouchableOpacity>
          
          {!networkState.isConnected && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
      );
    } else if (chat.type === 'group') {
      return (
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <TouchableOpacity onPress={onNavigateBack} style={[styles.backButton, isSmallScreen && styles.backButtonSmall]}>
            <Text style={[styles.backButtonText, isSmallScreen && styles.backButtonTextSmall]}>← {t('back')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileSection}
            onPress={() => {
              setShowGroupModal(true);
            }}
          >
            <View style={styles.groupProfileContainer}>
              {groupParticipants.slice(0, 3).map((participant, index) => (
                <View key={participant.uid} style={[styles.groupProfilePicture, { zIndex: 3 - index }]}>
                  {participant.photoURL ? (
                    <Image source={{ uri: participant.photoURL }} style={styles.groupProfilePicture} />
                  ) : (
                    <View style={[styles.groupPlaceholderAvatar, { backgroundColor: `hsl(${participant.uid.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }]}>
                      <Text style={styles.groupPlaceholderText}>
                        {participant.firstName?.charAt(0) || participant.lastName?.charAt(0) || '?'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {groupParticipants.length > 3 && (
                <View style={styles.moreIndicator}>
                  <Text style={styles.moreIndicatorText}>+{groupParticipants.length - 3}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isSmallScreen && styles.profileNameSmall]}>
                {chat.name || t('groupChat')}
              </Text>
              <Text style={[styles.profileStatus, isSmallScreen && styles.profileStatusSmall]}>
                {groupParticipants.length} members
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Add Members Button - Admin Only */}
          {user && chat.adminIds?.includes(user.uid) && (
            <TouchableOpacity 
              style={[styles.addMembersButton, isSmallScreen && styles.addMembersButtonSmall]}
              onPress={() => setShowAddMembersModal(true)}
            >
              <Text style={[styles.addMembersButtonText, isSmallScreen && styles.addMembersButtonTextSmall]}>+</Text>
            </TouchableOpacity>
          )}
          
          {!networkState.isConnected && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.uid;
    const isGroupChat = chat?.type === 'group';
    const senderName = item.senderName || t('unknownUser');
    
    
    // Get read receipts for this message
    const readReceipts = ReadReceiptService.getReadReceiptsForMessage(
      item.id,
      readStatus,
      user?.uid || '',
      messages,
      isGroupChat
    );
    
    // Debug: Log read receipts for group chats
    if (isGroupChat && readReceipts.length > 0) {
        // console.log('Read receipts:', readReceipts.map(r => r.userName));
    }
    
    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}
      >
        {isGroupChat && !isOwnMessage && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        
        {/* Voice Message Bubble */}
        {item.audioUrl ? (
          <>
            <VoiceMessageBubble
              audioUrl={item.audioUrl}
              duration={item.audioDuration || 0}
              isOwnMessage={isOwnMessage}
              onPlay={() => handlePlayVoiceMessage(item.id, item.audioUrl!)}
              onPause={() => handlePauseVoiceMessage()}
              isPlaying={playingMessageId === item.id}
              currentTime={0}
              message={item}
              senderName={isGroupChat ? senderName : undefined}
              senderPhotoURL={item.senderPhotoURL}
              chatMessages={messages} // Pass chat context for RAG analysis
              messageTranslations={messageTranslations}
              onTranslationComplete={handleTranslationComplete}
              onCloseTranslation={handleCloseTranslation}
              onReactionPress={handleMessageLongPress}
            />
          </>
        ) : item.imageUrl ? (
          /* Image Message Bubble */
          <View style={[
            styles.messageWrapper,
            isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper
          ]}>
            <View style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownBubble : styles.otherBubble
            ]}>
              {/* Image */}
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.messageImage}
                resizeMode="cover"
                onError={(error) => {
                  console.error('Image load error:', error);
                }}
                onLoad={() => {
                }}
              />
              
              {/* Text below image if present */}
              {item.text && (
                <Text style={[
                  styles.messageText,
                  isOwnMessage ? styles.ownText : styles.otherText,
                  styles.imageText
                ]}>
                  {item.text}
                </Text>
              )}
              
              {/* Enhanced Inline Translation for image messages */}
              {item.text && messageTranslations[item.id] && (
                <TranslatedMessageDisplay
                  translation={messageTranslations[item.id].text}
                  language={messageTranslations[item.id].language}
                  isOwn={isOwnMessage}
                  onClose={() => handleCloseTranslation(item.id)}
                  culturalHints={messageTranslations[item.id].culturalHints}
                  intelligentProcessing={messageTranslations[item.id].intelligentProcessing}
                />
              )}
              
              <View style={styles.messageBottomRow}>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
                {/* Show "sending..." indicator for optimistic image messages after 1 second */}
                {item.isOptimistic && showSendingIndicators.has(item.id) && (
                  <Text style={[styles.sendingIndicator, isOwnMessage ? styles.ownSendingIndicator : styles.otherSendingIndicator]}>
                    sending...
                  </Text>
                )}
                {/* Translation button for text portion only */}
                {item.text && !messageTranslations[item.id] && !item.isOptimistic && (
                  <TranslationButton
                    messageId={item.id}
                    originalText={item.text}
                    onTranslationComplete={handleTranslationComplete}
                    isOwn={isOwnMessage}
                    message={item}
                    chatMessages={messages}
                  />
                )}
              </View>
              
              {/* Reaction Button */}
              <ReactionButton
                onPress={() => handleMessageLongPress(item.id)}
                isOwn={isOwnMessage}
              />
            </View>
          </View>
        ) : (
          /* Text Message Bubble */
          <View style={[
            styles.messageWrapper,
            isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper
          ]}>
            <View style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownBubble : styles.otherBubble
            ]}>
              {/* Original Message */}
              <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownText : styles.otherText
              ]}>
                {item.text}
              </Text>
              
              {/* Enhanced Inline Translation */}
              {messageTranslations[item.id] && (
                <TranslatedMessageDisplay
                  translation={messageTranslations[item.id].text}
                  language={messageTranslations[item.id].language}
                  isOwn={isOwnMessage}
                  onClose={() => handleCloseTranslation(item.id)}
                  culturalHints={messageTranslations[item.id].culturalHints}
                  intelligentProcessing={messageTranslations[item.id].intelligentProcessing}
                />
              )}
              
              <View style={styles.messageBottomRow}>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
                {/* Show "sending..." indicator for optimistic messages after 1 second */}
                {item.isOptimistic && showSendingIndicators.has(item.id) && (
                  <Text style={[styles.sendingIndicator, isOwnMessage ? styles.ownSendingIndicator : styles.otherSendingIndicator]}>
                    sending...
                  </Text>
                )}
                {/* Enhanced Translation Button - Inline */}
                {!messageTranslations[item.id] && !item.isOptimistic && (
                  <TranslationButton
                    messageId={item.id}
                    originalText={item.text || ''}
                    onTranslationComplete={handleTranslationComplete}
                    isOwn={isOwnMessage}
                    message={item}
                    chatMessages={messages}
                  />
                )}
              </View>
              
              {/* Reaction Button */}
              <ReactionButton
                onPress={() => handleMessageLongPress(item.id)}
                isOwn={isOwnMessage}
              />
            </View>
          </View>
        )}
        
        {/* Translation Indicator for auto modes */}
        <TranslationIndicator 
          isOwn={isOwnMessage}
          isTranslating={translatingMessages.has(item.id)}
          isAdvanced={translationMode === 'auto-advanced'}
        />

        {/* Message Reactions */}
        {messageReactions[item.id] && messageReactions[item.id].length > 0 && (
          <ReactionDisplay
            reactions={messageReactions[item.id]}
            currentUserId={user?.uid || ''}
            onReactionPress={(emoji) => handleDirectReactionPress(item.id, emoji)}
          />
        )}

        {/* Facebook Messenger-style Read Receipt with profile icons - now below reactions */}
        <ReadReceipt 
          readReceipts={readReceipts} 
          isOwnMessage={isOwnMessage}
          maxAvatars={isGroupChat ? 5 : 3}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled={true}
        >
        {renderHeader()}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          inverted
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        <TypingIndicator 
          typingUsers={typingUsers} 
          isVisible={typingUsers.length > 0} 
        />

        {/* Smart Suggestions */}
        <SmartSuggestions
          currentMessage={newMessage}
          chatId={chatId}
          recentMessages={messages.filter((m: Message) => m.chatId === chatId)}
          currentUserId={user?.uid || ''}
          currentUserName={user?.displayName || 'User'}
          onSuggestionSelect={handleSuggestionSelect}
          onClose={() => {
            setShowSmartSuggestions(false);
            setIsSuggestionsMode(false);
            // Don't automatically bring up keyboard when closing suggestions
          }}
          visible={showSmartSuggestions}
          otherUserLanguage={otherUser?.defaultLanguage}
          isDirectChat={chat?.type === 'direct'}
          userLanguage={defaultTranslationLanguage}
          isSuggestionsMode={isSuggestionsMode}
        />

        <View style={styles.inputContainer}>
          {/* Top Row - Three Buttons */}
          <View style={styles.topButtonRow}>
            <TouchableOpacity 
              style={styles.topButton}
              onPress={async () => {
                try {
                  const result = await MediaService.pickImage();
                  if (result) {
                    handleImageSelected(result);
                  }
                } catch (error) {
                  console.error('Error picking image:', error);
                }
              }}
            >
              <Ionicons name="camera" size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.topButton,
                isRecording && styles.recordingButton
              ]}
              onPress={() => {
                // Trigger voice recording using the same logic as VoiceRecorder
                const { audioService } = require('../../api/audio');
                if (isRecording) {
                  // Stop recording
                  audioService.stopRecording().then((result: any) => {
                    if (result && result.uri) {
                      handleVoiceRecordingComplete(result.uri, result.duration || 0);
                    }
                    setIsRecording(false);
                  }).catch((error: any) => {
                    console.error('Error stopping recording:', error);
                    setIsRecording(false);
                  });
                } else {
                  // Start recording
                  audioService.startRecording().then(() => {
                    setIsRecording(true);
                  }).catch((error: any) => {
                    console.error('Error starting recording:', error);
                  });
                }
              }}
            >
              {isRecording ? (
                <View style={styles.recordingWaves}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.wave,
                        {
                          backgroundColor: '#FF3B30',
                          opacity: waveAnimations[i],
                          transform: [{
                            scaleY: waveAnimations[i].interpolate({
                              inputRange: [0.3, 1],
                              outputRange: [0.5, 1.5],
                            })
                          }]
                        }
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <Ionicons name="mic" size={20} color="#8E8E93" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.topButton,
                showSmartSuggestions && styles.topButtonActive
              ]}
              onPress={toggleSuggestionsMode}
            >
              <Ionicons 
                name={isSuggestionsMode ? "keypad" : "bulb"} 
                size={20} 
                color={showSmartSuggestions ? "#007AFF" : "#8E8E93"} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Bottom Row - Full Width Typing Bar */}
          <View style={styles.typingBarContainer}>
            {/* Selected Image Preview */}
            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.selectedImagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TextInput
              ref={textInputRef}
              style={styles.typingBar}
              value={newMessage}
              onChangeText={handleTextChange}
              placeholder={selectedImage ? t('addMessage') : t('typeMessage')}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() && !selectedImage) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() && !selectedImage}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording... {Math.floor(recordingDuration)}s
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Profile Modal for Direct Chat */}
      {otherUser && (
        <ProfileModal
          visible={showProfileModal}
          user={otherUser}
          isOnline={isOnline}
          onClose={() => setShowProfileModal(false)}
          onViewFullProfile={() => {
            setShowProfileModal(false);
            onNavigateToUserProfile(otherUser.uid);
          }}
          onMessage={() => setShowProfileModal(false)}
        />
      )}

      {/* Group Members Modal - Centered */}
      {chat?.type === 'group' && (
        <GroupMembersModal
          visible={showGroupModal}
          participants={groupParticipants}
          admins={chat.adminIds || []}
          currentUserId={user?.uid || ''}
          onClose={() => setShowGroupModal(false)}
          onUserPress={(participant) => {
            setShowGroupModal(false);
            onNavigateToUserProfile(participant.uid);
          }}
        />
      )}

      {/* Add Members Modal */}
      {chat?.type === 'group' && (
        <AddMembersModal
          visible={showAddMembersModal}
          groupId={chat.id}
          currentUserId={user?.uid || ''}
          existingParticipants={chat.participants}
          onClose={() => setShowAddMembersModal(false)}
          onMembersAdded={(newMembers) => {
            // Update the group participants list
            setGroupParticipants(prev => [...prev, ...newMembers]);
            setShowAddMembersModal(false);
          }}
        />
      )}

      {/* Voice Message Preview Modal */}
      {recordedAudio && (
        <VoiceMessagePreviewModal
          visible={showPreviewModal}
          audioUri={recordedAudio.uri}
          duration={recordedAudio.duration}
          onSend={handleSendVoiceMessage}
          onCancel={handleVoiceRecordingCancel}
          onReRecord={() => {
            setRecordedAudio(null);
            setShowPreviewModal(false);
          }}
        />
      )}


      {/* Reaction Picker Modal */}
      <ReactionPicker
        visible={showReactionPicker}
        onReactionSelect={handleReactionSelect}
        onClose={handleReactionPickerClose}
        messageId={selectedMessageId || ''}
        currentReactions={selectedMessageId ? (messageReactions[selectedMessageId] || []).filter(r => r.userId === user?.uid).map(r => r.emoji) : []}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 50,
  },
  headerSmall: {
    paddingVertical: 8,
    minHeight: 44,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  headerTitleSmall: {
    fontSize: 16,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    marginLeft: 8,
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    position: 'relative', // Allow absolute positioning of reaction button
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sendingIndicator: {
    fontSize: 11,
    fontStyle: 'italic',
    marginLeft: 8,
    marginTop: 4,
  },
  ownSendingIndicator: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherSendingIndicator: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  topButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 40,
  },
  topButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  typingBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typingBar: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  suggestionsToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  suggestionsToggleButtonActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    maxHeight: 120,
    minHeight: 48,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recordingButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  recordingWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  wave: {
    width: 3,
    height: 8,
    marginHorizontal: 1,
    borderRadius: 1.5,
    opacity: 0.7,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
    alignSelf: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  offlineIndicator: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileNameSmall: {
    fontSize: 14,
  },
  profileStatus: {
    fontSize: 12,
    color: '#666',
  },
  profileStatusSmall: {
    fontSize: 10,
  },
  groupProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  groupProfilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupPlaceholderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupPlaceholderText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  moreIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreIndicatorText: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  addMembersButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addMembersButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  addMembersButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addMembersButtonTextSmall: {
    fontSize: 16,
  },
  // New styles for inline translation
  messageWrapper: {
    marginVertical: 2,
  },
  ownMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  // Inline translation styles
  inlineTranslation: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  ownInlineTranslation: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  otherInlineTranslation: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  translationLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  ownTranslationLabel: {
    color: '#BFDBFE',
  },
  otherTranslationLabel: {
    color: '#6B7280',
  },
  closeTranslationButton: {
    padding: 2,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTranslationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ownCloseText: {
    color: '#BFDBFE',
  },
  otherCloseText: {
    color: '#6B7280',
  },
  translationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  ownTranslationText: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  otherTranslationText: {
    color: '#374151',
  },
  // Image message styles
  messageImage: {
    width: 250,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  imageText: {
    marginTop: 4,
  },
  // Selected image preview styles
  selectedImageContainer: {
    position: 'relative',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  selectedImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});
