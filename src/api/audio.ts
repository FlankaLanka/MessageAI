import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export interface AudioRecording {
  uri: string;
  duration: number;
  size: number;
}

export interface AudioPlaybackStatus {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  progress: number; // 0 to 1
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isRecording = false;
  private isPlaying = false;
  private playbackStatus: AudioPlaybackStatus = {
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    progress: 0
  };

  // Initialize audio service with proper routing
  async initialize(): Promise<void> {
    try {
      // Set initial audio mode for playback through speakers
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false, // CRITICAL: Play through speakers, not earpiece
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
      console.log('🔊 Audio service initialized for speaker playback');
    } catch (error) {
      console.error('Error initializing audio service:', error);
    }
  }

  // Ensure audio plays through speakers (call this before any playback)
  async ensureSpeakerPlayback(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false, // CRITICAL: Play through speakers, not earpiece
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
    } catch (error) {
      console.error('Error setting speaker playback:', error);
    }
  }

  // Request microphone permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  // Start audio recording
  async startRecording(): Promise<void> {
    try {
      if (this.isRecording) {
        return;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false, // Use speakers for recording feedback
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      // Create recording instance
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      this.recording = recording;
      this.isRecording = true;

    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  // Stop audio recording and return file info
  async stopRecording(): Promise<AudioRecording | null> {
    try {
      if (!this.recording || !this.isRecording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = await this.getAudioDuration(uri);

      this.recording = null;
      this.isRecording = false;

      // Reset audio mode to default for playback
      await this.ensureSpeakerPlayback();

      return {
        uri,
        duration,
        size: fileInfo.size || 0
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  // Get audio duration from file
  async getAudioDuration(uri: string): Promise<number> {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      const status = await sound.getStatusAsync();
      const duration = status.isLoaded ? status.durationMillis || 0 : 0;
      await sound.unloadAsync();
      return Math.round(duration / 1000); // Convert to seconds
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0;
    }
  }

  // Play audio file
  async playAudio(uri: string, onStatusUpdate?: (status: AudioPlaybackStatus) => void): Promise<void> {
    try {
      if (this.isPlaying) {
        await this.pauseAudio();
      }

      // Ensure audio plays through speakers
      await this.ensureSpeakerPlayback();

      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      
      // Set up status update listener
      if (onStatusUpdate) {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            const playbackStatus: AudioPlaybackStatus = {
              isPlaying: status.isPlaying || false,
              positionMillis: status.positionMillis || 0,
              durationMillis: status.durationMillis || 0,
              progress: status.durationMillis ? (status.positionMillis || 0) / status.durationMillis : 0
            };
            this.playbackStatus = playbackStatus;
            onStatusUpdate(playbackStatus);
          }
        });
      }

      await sound.playAsync();
      this.sound = sound;
      this.isPlaying = true;

    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  // Pause audio playback
  async pauseAudio(): Promise<void> {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw error;
    }
  }

  // Resume audio playback
  async resumeAudio(): Promise<void> {
    try {
      if (this.sound && !this.isPlaying) {
        await this.sound.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
      throw error;
    }
  }

  // Stop audio playback
  async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
        this.playbackStatus = {
          isPlaying: false,
          positionMillis: 0,
          durationMillis: 0,
          progress: 0
        };
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw error;
    }
  }

  // Seek to specific position
  async seekTo(positionMillis: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
      }
    } catch (error) {
      console.error('Error seeking audio:', error);
      throw error;
    }
  }

  // Get current playback status
  getPlaybackStatus(): AudioPlaybackStatus {
    return this.playbackStatus;
  }

  // Check if currently playing
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Check if currently recording
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Delete audio file
  async deleteAudioFile(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Error deleting audio file:', error);
      throw error;
    }
  }

  // Compress audio file (basic implementation)
  async compressAudio(uri: string, quality: number = 0.8): Promise<string> {
    try {
      // For now, return the original URI
      // In a production app, you might want to implement actual compression
      // using a library like react-native-audio-recorder-player or similar
      return uri;
    } catch (error) {
      console.error('Error compressing audio:', error);
      return uri;
    }
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    try {
      if (this.isRecording && this.recording) {
        await this.stopRecording();
      }
      if (this.isPlaying && this.sound) {
        await this.stopAudio();
      }
    } catch (error) {
      console.error('Error cleaning up audio service:', error);
    }
  }
}

export const audioService = new AudioService();
export default audioService;
