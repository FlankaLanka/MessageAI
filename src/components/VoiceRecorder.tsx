import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Platform,
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService, AudioRecording } from '../api/audio';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string, duration: number) => void;
  onRecordingCancel: () => void;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingCancel
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recording, setRecording] = useState<AudioRecording | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Start recording
  const startRecording = async () => {
    try {
      const hasPermission = await audioService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record voice messages.',
          [{ text: 'OK' }]
        );
        return;
      }

      await audioService.startRecording();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setRecordingDuration(0);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start duration timer
      durationInterval.current = setInterval(() => {
        if (recordingStartTime) {
          const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
          setRecordingDuration(elapsed);
        }
      }, 1000);

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate(50);
      }

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!isRecording) return;

      const audioRecording = await audioService.stopRecording();
      
      if (audioRecording) {
        setRecording(audioRecording);
        onRecordingComplete(audioRecording.uri, audioRecording.duration);
      }

      setIsRecording(false);
      setRecordingStartTime(null);
      setRecordingDuration(0);

      // Stop pulse animation
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      // Clear duration timer
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate(50);
      }

    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  // Cancel recording
  const cancelRecording = async () => {
    try {
      if (isRecording) {
        await audioService.stopRecording();
        setIsRecording(false);
        setRecordingStartTime(null);
        setRecordingDuration(0);

        // Stop pulse animation
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);

        // Clear duration timer
        if (durationInterval.current) {
          clearInterval(durationInterval.current);
          durationInterval.current = null;
        }
      }

      onRecordingCancel();
    } catch (error) {
      console.error('Error cancelling recording:', error);
    }
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (isRecording) {
        audioService.stopRecording();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordingButton
        ]}
        onPressIn={startRecording}
        onPressOut={stopRecording}
        onLongPress={stopRecording}
        delayLongPress={100}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.buttonContent,
            isRecording && { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={24}
            color={isRecording ? '#fff' : '#007AFF'}
          />
        </Animated.View>
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>
            Recording... {formatDuration(recordingDuration)}
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelRecording}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  recordButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  recordingButton: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 200,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  cancelButton: {
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
