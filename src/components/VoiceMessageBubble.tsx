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
import { audioService, AudioPlaybackStatus } from '../services/audio';
import { MediaService } from '../services/media';
import { Message, Translation } from '../types';
import { simpleTranslationService } from '../services/simpleTranslation';
import { useLocalization } from '../hooks/useLocalization';
import { useStore } from '../store/useStore';

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
  senderPhotoURL
}: VoiceMessageBubbleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localAudioUri, setLocalAudioUri] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AudioPlaybackStatus>({
    isPlaying: false,
    positionMillis: 0,
    durationMillis: duration * 1000,
    progress: 0
  });
  
  // Transcription state
  const [showTranscription, setShowTranscription] = useState(false);
  
  // Voice translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  
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

  const handleVoiceTranslation = async () => {
    if (!message?.transcription) {
      setTranslationError(t('noTranscriptionAvailable'));
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const result = await simpleTranslationService.translateText(
        message.transcription,
        defaultTranslationLanguage // Use user's default translation language
      );
      setTranslation(result.translation.text);
      setShowTranslation(true);
    } catch (error) {
      console.error('Voice translation error:', error);
      setTranslationError(t('translationFailed'));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCloseTranslation = () => {
    setShowTranslation(false);
    setTranslation(null);
    setTranslationError(null);
  };


  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownContainer : styles.otherContainer
    ]}>
      <TouchableOpacity
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
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
        
        <View style={styles.content}>
          {/* Waveform visualization (simplified) */}
          <View style={styles.waveform}>
            {Array.from({ length: 20 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height: Math.random() * 20 + 5,
                    backgroundColor: isOwnMessage ? '#fff' : '#007AFF',
                    opacity: playbackStatus.progress > i / 20 ? 1 : 0.3
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
      </TouchableOpacity>

      {/* Voice Message Actions - Inline within the bubble */}
      <View style={styles.voiceActionsContainer}>
        <View style={styles.voiceActionsRow}>
          {/* Transcription Button - Only show if transcription exists */}
          {message?.transcription && (
            <TouchableOpacity
              style={styles.inlineActionButton}
              onPress={handleShowTranscription}
            >
              <Ionicons name="text" size={14} color="#666" />
              <Text style={styles.inlineActionText}>{t('viewTranscription')}</Text>
            </TouchableOpacity>
          )}
          
          {/* Translation Button - Always show */}
          <TouchableOpacity
            style={[
              styles.inlineActionButton,
              styles.translateButton,
              isTranslating && styles.translationButtonDisabled,
              !message?.transcription && styles.translationButtonNoTranscription
            ]}
            onPress={handleVoiceTranslation}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Ionicons name="language" size={14} color="#3B82F6" />
            )}
            <Text style={styles.inlineActionText}>
              {isTranslating ? t('translating') : t('translate')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* No Transcription Message */}
        {!message?.transcription && (
          <Text style={styles.noTranscriptionText}>
            {t('noTranscriptionAvailable')}
          </Text>
        )}
        
        {/* Translation Error */}
        {translationError && (
          <Text style={styles.translationError}>{translationError}</Text>
        )}
        
        {/* Inline Translation Display */}
        {showTranslation && translation && (
          <View style={[
            styles.inlineTranslation,
            isOwnMessage ? styles.ownInlineTranslation : styles.otherInlineTranslation
          ]}>
            <View style={styles.translationHeader}>
              <Text style={[
                styles.translationLabel,
                isOwnMessage ? styles.ownTranslationLabel : styles.otherTranslationLabel
              ]}>
                EN
              </Text>
              <TouchableOpacity 
                onPress={handleCloseTranslation}
                style={styles.closeTranslationButton}
              >
                <Text style={[
                  styles.closeTranslationText,
                  isOwnMessage ? styles.ownCloseText : styles.otherCloseText
                ]}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[
              styles.translationText,
              isOwnMessage ? styles.ownTranslationText : styles.otherTranslationText
            ]}>
              {translation}
            </Text>
          </View>
        )}
      </View>

      {/* Transcription Modal */}
      <Modal
        visible={showTranscription}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTranscription(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Voice Transcription</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTranscription(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.transcriptionContent}>
              {message?.transcription}
            </Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: 4,
  },
  ownContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 20,
    marginBottom: 4,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  transcriptionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111827',
    padding: 20,
  },
});
