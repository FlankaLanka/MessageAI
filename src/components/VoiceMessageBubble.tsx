import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService, AudioPlaybackStatus } from '../services/audio';
import { MediaService } from '../services/media';

interface VoiceMessageBubbleProps {
  audioUrl: string;
  duration: number;
  isOwnMessage: boolean;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  currentTime: number;
}

export default function VoiceMessageBubble({
  audioUrl,
  duration,
  isOwnMessage,
  onPlay,
  onPause,
  isPlaying,
  currentTime
}: VoiceMessageBubbleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localAudioUri, setLocalAudioUri] = useState<string | null>(null);
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
});
