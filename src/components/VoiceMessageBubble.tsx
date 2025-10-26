import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService, AudioPlaybackStatus } from '../api/audio';
import { MediaService } from '../api/media';
import { Message, Translation } from '../types';
import { simpleTranslationService } from '../api/simpleTranslation';
import { voiceTranslationService } from '../api/voiceTranslation';
import { useLocalization } from '../hooks/useLocalization';
import { useStore } from '../store/useStore';
import { TranslationButton } from './TranslationButton';
import { TranslatedMessageDisplay } from './TranslatedMessageDisplay';
import { ReactionButton } from './ReactionButton';

interface VoiceMessageBubbleProps {
  audioUrl: string;
  duration: number;
  isOwnMessage: boolean;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  currentTime: number;
  // Message support
  message?: Message;
  senderName?: string;
  senderPhotoURL?: string;
  chatMessages?: Message[]; // For RAG context
  messageTranslations?: { [messageId: string]: any }; // Translation state
  onTranslationComplete?: (messageId: string, translation: string, language: string, culturalHints?: any[], intelligentProcessing?: any) => void; // Translation callback
  onCloseTranslation?: (messageId: string) => void; // Close translation callback
  onReactionPress?: (messageId: string) => void; // Reaction callback
}

export default function VoiceMessageBubble({
  audioUrl,
  duration,
  isOwnMessage,
  onPlay,
  onPause,
  isPlaying,
  currentTime,
  message,
  senderName,
  senderPhotoURL,
  chatMessages = [],
  messageTranslations = {},
  onTranslationComplete,
  onCloseTranslation,
  onReactionPress
}: VoiceMessageBubbleProps) {
  
  // CRITICAL: Block all network calls for optimistic messages
  // Only block if it's truly optimistic (not just sending status)
  const isOptimisticMessage = message?.isOptimistic === true;
  if (isOptimisticMessage) {
    console.log('🎤 BLOCKING all network calls for optimistic voice message:', message.id);
  }
  const [isLoading, setIsLoading] = useState(false);
  const [localAudioUri, setLocalAudioUri] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AudioPlaybackStatus>({
    isPlaying: false,
    positionMillis: 0,
    durationMillis: duration * 1000,
    progress: 0
  });
  
  // Transcription state - show by default if transcription exists
  const [showTranscription, setShowTranscription] = useState(false);
  
  // Local transcription state to track when transcription is completed
  const [localTranscription, setLocalTranscription] = useState<string | null>(message?.transcription || null);
  
  // Debug logging
  useEffect(() => {
  }, [message?.transcription, localTranscription, message?.text, message?.id, showTranscription]);
  
  const { t } = useLocalization();
  const { defaultTranslationLanguage } = useStore();

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioService.pauseAudio();
        onPause();
      } else {
        // Check if audioUrl is a local file or Firebase Storage URL
        const isLocalFile = audioUrl.startsWith('file://') || audioUrl.startsWith('/');
        
        if (isLocalFile) {
          // It's already a local file, play directly
          await audioService.playAudio(audioUrl, (status) => {
            setPlaybackStatus(status);
          });
          onPlay();
        } else {
          // It's a Firebase Storage URL, download first
          if (!localAudioUri) {
            setIsLoading(true);
            try {
              const localUri = await MediaService.downloadVoiceMessage(audioUrl);
              setLocalAudioUri(localUri);
              await audioService.playAudio(localUri, (status) => {
                setPlaybackStatus(status);
              });
              onPlay();
            } catch (error) {
              console.error('Error downloading audio:', error);
              Alert.alert('Error', 'Failed to download audio message');
            } finally {
              setIsLoading(false);
            }
          } else {
            await audioService.playAudio(localAudioUri, (status) => {
              setPlaybackStatus(status);
            });
            onPlay();
          }
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio message');
    }
  };

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (isPlaying) {
        audioService.stopAudio();
      }
    };
  }, []);

  // Auto-transcribe voice message when component mounts
  // IMPORTANT: Don't transcribe optimistic messages (they're still being uploaded)
  useEffect(() => {
    const autoTranscribe = async () => {
      // CRITICAL: Block all network calls for optimistic messages
      if (isOptimisticMessage) {
        console.log('🎤 BLOCKING transcription for optimistic message:', message.id);
        return;
      }
      
      // Also block if message is still being sent (not yet synced)
      // Only block if it's a local file AND still sending
      if (message?.status === 'sending' && message?.audioUrl?.startsWith('file://')) {
        console.log('🎤 BLOCKING transcription for local file (still sending):', message.id);
        return;
      }
      
      // Skip if we already have transcription
      if (localTranscription) {
        return;
      }
      
      // Skip if message doesn't have audio URL
      if (!message || !message.audioUrl) {
        return;
      }
      
      // Skip if audio URL is a local file (not yet uploaded to Firebase)
      if (message.audioUrl.startsWith('file://')) {
        console.log('🎤 BLOCKING transcription for local file (not yet uploaded):', message.id);
        return;
      }
      
      // For recently synced messages, add a small delay to ensure audio is fully available
      const messageAge = Date.now() - message.timestamp;
      if (messageAge < 5000) { // If message is less than 5 seconds old (likely just synced)
        console.log('🎤 Message recently synced, waiting 2 seconds before transcription:', message.id);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      try {
        console.log('🎤 Starting transcription for message:', message.id);
        const result = await voiceTranslationService.transcribeVoiceMessage(message);
        
        // Update local transcription state
        setLocalTranscription(result.text);
        console.log('🎤 Transcription completed for message:', message.id);
      } catch (error) {
        console.error('🎤 Auto-transcription failed:', error);
        // Don't show error to user, just log it
      }
    };

    autoTranscribe();
  }, [message?.id, message?.audioUrl, message?.status, isOptimisticMessage, localTranscription]);

  // Auto-show transcription when it becomes available
  useEffect(() => {
    if (localTranscription && !showTranscription) {
      setShowTranscription(true);
    }
  }, [localTranscription, showTranscription]);

  // Update message object when transcription becomes available
  useEffect(() => {
    if (localTranscription && message && !message.text) {
      
      // Update the message object to include the transcription as text
      message.text = localTranscription;
    }
  }, [localTranscription, message]);

  // Manual transcription trigger for synced messages (offline-sent messages that are now synced)
  useEffect(() => {
    const triggerTranscriptionForSyncedMessage = async () => {
      console.log('🎤 Checking transcription trigger for message:', {
        id: message?.id,
        audioUrl: message?.audioUrl,
        isFirebaseUrl: message?.audioUrl?.startsWith('https://firebasestorage.googleapis.com/'),
        hasTranscription: !!localTranscription,
        isOptimistic: isOptimisticMessage,
        status: message?.status
      });
      
      // Check if this is a synced message that needs transcription
      if (message?.audioUrl?.startsWith('https://firebasestorage.googleapis.com/') && 
          !localTranscription && 
          !isOptimisticMessage &&
          message?.status === 'sent') {
        console.log('🎤 Manual transcription trigger for synced message:', message.id);
        
        try {
          const result = await voiceTranslationService.transcribeVoiceMessage(message);
          setLocalTranscription(result.text);
          console.log('🎤 Manual transcription completed for synced message:', message.id);
        } catch (error) {
          console.error('🎤 Manual transcription failed for synced message:', error);
        }
      } else {
        console.log('🎤 Transcription trigger conditions not met for message:', message?.id);
      }
    };

    triggerTranscriptionForSyncedMessage();
  }, [message?.id, message?.audioUrl, message?.status, isOptimisticMessage, localTranscription]);

  // Update current time from props
  useEffect(() => {
    if (currentTime > 0) {
      setPlaybackStatus(prev => ({
        ...prev,
        positionMillis: currentTime * 1000,
        progress: currentTime / duration
      }));
    }
  }, [currentTime, duration]);

  // Translation handlers
  const handleShowTranscription = () => {
    setShowTranscription(true);
  };




  return (
    <View style={[
      styles.messageWrapper,
      isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper
    ]}>
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble
      ]}>
        {/* Voice Controls Row */}
        <View style={styles.voiceControlsRow}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            style={[
              styles.playButton,
              isOwnMessage ? styles.ownPlayButton : styles.otherPlayButton
            ]}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator 
                size="small" 
                color={isOwnMessage ? '#fff' : '#007AFF'} 
              />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color={isOwnMessage ? '#fff' : '#007AFF'}
              />
            )}
          </TouchableOpacity>
          
          {/* Waveform visualization (longer) */}
          <View style={styles.waveform}>
            {Array.from({ length: 40 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height: Math.random() * 25 + 8,
                    backgroundColor: isOwnMessage ? '#fff' : '#007AFF',
                    opacity: playbackStatus.progress > i / 40 ? 1 : 0.3
                  }
                ]}
              />
            ))}
          </View>
          
          {/* Duration display */}
          <Text style={[
            styles.duration,
            isOwnMessage ? styles.ownDuration : styles.otherDuration
          ]}>
            {formatDuration(duration)}
          </Text>
        </View>
        
        {/* Transcription - treated exactly like regular text message */}
        {localTranscription && (
          <>
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownText : styles.otherText
            ]}>
              {localTranscription}
            </Text>
            
            {/* Enhanced Inline Translation - same as text messages */}
            {message && messageTranslations[message.id] && (
              <TranslatedMessageDisplay
                translation={messageTranslations[message.id].text}
                language={messageTranslations[message.id].language}
                isOwn={isOwnMessage}
                onClose={() => onCloseTranslation?.(message.id)}
                culturalHints={messageTranslations[message.id].culturalHints}
                intelligentProcessing={messageTranslations[message.id].intelligentProcessing}
              />
            )}
          </>
        )}
        
        {/* Message Bottom Row - same as text messages */}
        <View style={styles.messageBottomRow}>
          <Text style={styles.timestamp}>
            {new Date(message?.timestamp || Date.now()).toLocaleTimeString()}
          </Text>
          {/* Show "sending..." indicator for optimistic voice messages */}
          {message?.isOptimistic && (
            <Text style={[styles.sendingIndicator, isOwnMessage ? styles.ownSendingIndicator : styles.otherSendingIndicator]}>
              sending...
            </Text>
          )}
          {/* Translation Button - same as text messages */}
          {message && localTranscription && !messageTranslations[message.id] && (
            <>
              <TranslationButton
                messageId={message.id}
                originalText={localTranscription}
                onTranslationComplete={onTranslationComplete || (() => {})}
                isOwn={isOwnMessage}
                message={{
                  ...message,
                  text: localTranscription, // Use transcription as the text content
                  // Keep original message type to preserve voice message detection
                }}
                chatMessages={chatMessages}
              />
            </>
          )}
        </View>
        
        {/* Reaction Button - same as text messages */}
        {message && (
          <ReactionButton
            onPress={() => {
              // Handle reaction button press - same as text messages
              onReactionPress?.(message.id);
            }}
            isOwn={isOwnMessage}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Message wrapper styles - same as text messages
  messageWrapper: {
    marginVertical: 2,
  },
  ownMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
  },
  voiceControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownPlayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  otherPlayButton: {
    backgroundColor: '#F3F4F6',
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
  },
  // Text message styles - same as text messages
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#000000',
  },
  messageBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8, // Add bottom margin for reaction button spacing
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
    marginBottom: 4,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },
  ownDuration: {
    color: '#fff',
  },
  otherDuration: {
    color: '#666',
  },
  // Sending indicator styles
  sendingIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  ownSendingIndicator: {
    color: '#fff',
    opacity: 0.8,
  },
  otherSendingIndicator: {
    color: '#666',
    opacity: 0.8,
  },
  // Inline voice actions styles
  voiceActionsContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  voiceActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  inlineActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
  },
  translateButton: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
  },
  inlineActionText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  translationButtonDisabled: {
    opacity: 0.6,
  },
  translationButtonNoTranscription: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  translationError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    textAlign: 'center',
  },
  noTranscriptionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
