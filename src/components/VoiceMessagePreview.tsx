import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService, AudioPlaybackStatus } from '../api/audio';

interface VoiceMessagePreviewProps {
  visible: boolean;
  audioUri: string;
  duration: number;
  onSend: () => void;
  onCancel: () => void;
  onReRecord: () => void;
}

export default function VoiceMessagePreview({
  visible,
  audioUri,
  duration,
  onSend,
  onCancel,
  onReRecord
}: VoiceMessagePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<AudioPlaybackStatus>({
    isPlaying: false,
    positionMillis: 0,
    durationMillis: duration * 1000,
    progress: 0
  });

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
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        try {
          await audioService.playAudio(audioUri, (status) => {
            setPlaybackStatus(status);
            setIsPlaying(status.isPlaying);
          });
          setIsPlaying(true);
        } catch (error) {
          console.error('Error playing audio:', error);
          Alert.alert('Error', 'Failed to play audio preview');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Error', 'Failed to play audio preview');
    }
  };

  // Handle send
  const handleSend = async () => {
    try {
      // Stop any playing audio
      if (isPlaying) {
        await audioService.stopAudio();
      }
      onSend();
    } catch (error) {
      console.error('Error sending voice message:', error);
      Alert.alert('Error', 'Failed to send voice message');
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    try {
      // Stop any playing audio
      if (isPlaying) {
        await audioService.stopAudio();
      }
      onCancel();
    } catch (error) {
      console.error('Error cancelling voice message:', error);
    }
  };

  // Handle re-record
  const handleReRecord = async () => {
    try {
      // Stop any playing audio
      if (isPlaying) {
        await audioService.stopAudio();
      }
      onReRecord();
    } catch (error) {
      console.error('Error re-recording voice message:', error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        audioService.stopAudio();
      }
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Voice Message Preview</Text>
          
          <View style={styles.audioContainer}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#007AFF"
                />
              )}
            </TouchableOpacity>

            <View style={styles.audioInfo}>
              <Text style={styles.duration}>
                {formatDuration(duration)}
              </Text>
              
              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${playbackStatus.progress * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reRecordButton}
              onPress={handleReRecord}
            >
              <Text style={styles.reRecordButtonText}>Record Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  audioInfo: {
    flex: 1,
  },
  duration: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  reRecordButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ff9500',
    marginRight: 8,
    alignItems: 'center',
  },
  reRecordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
