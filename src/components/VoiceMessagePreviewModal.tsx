import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../hooks/useLocalization';

interface VoiceMessagePreviewModalProps {
  visible: boolean;
  audioUri: string;
  duration: number;
  onCancel: () => void;
  onReRecord: () => void;
  onSend: () => void;
}

export const VoiceMessagePreviewModal: React.FC<VoiceMessagePreviewModalProps> = ({
  visible,
  audioUri,
  duration,
  onCancel,
  onReRecord,
  onSend,
}) => {
  const { t } = useLocalization();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSending, setIsSending] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReRecord = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onReRecord();
  };

  const handleSend = async () => {
    if (isSending) return; // Prevent multiple sends
    
    setIsSending(true);
    setIsPlaying(false);
    setCurrentTime(0);
    
    try {
      await onSend();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Title */}
          <Text style={styles.title}>{t('voiceMessagePreview')}</Text>
          
          {/* Voice Playback Component */}
          <View style={styles.playbackContainer}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
            
            {/* Waveform */}
            <View style={styles.waveform}>
              {Array.from({ length: 20 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { 
                      height: Math.random() * 20 + 5,
                      backgroundColor: i < (currentTime / duration) * 20 ? '#007AFF' : '#E5E7EB'
                    }
                  ]}
                />
              ))}
            </View>
            
            {/* Time Display */}
            <Text style={styles.timeText}>
              {formatTime(currentTime)}
            </Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Ionicons name="close" size={14} color="#374151" />
              <Text style={styles.cancelButtonText} numberOfLines={1}>{t('cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reRecordButton}
              onPress={handleReRecord}
            >
              <Ionicons name="refresh" size={14} color="#fff" />
              <Text style={styles.reRecordButtonText} numberOfLines={1}>{t('reRecord')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={isSending}
            >
              <Text style={styles.sendButtonText} numberOfLines={1}>
                {isSending ? t('sending') : t('send')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: Dimensions.get('window').width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 20,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
    minWidth: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 4,
    minWidth: 70,
    flex: 1,
    maxWidth: 120,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    numberOfLines: 1,
  },
  reRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 4,
    minWidth: 70,
    flex: 1,
    maxWidth: 120,
  },
  reRecordButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    numberOfLines: 1,
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 70,
    flex: 1,
    maxWidth: 120,
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    numberOfLines: 1,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
});
