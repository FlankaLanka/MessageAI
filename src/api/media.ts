import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export class MediaService {
  // Request camera and library permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraPermission.status === 'granted' && libraryPermission.status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Pick image from camera or library
  static async pickImage(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera and library permissions are required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  // Take photo with camera
  static async takePhoto(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission is required');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  // Upload image to Firebase Storage
  static async uploadProfilePicture(uid: string, imageUri: string): Promise<string> {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const timestamp = Date.now();
      const storageRef = ref(storage, `profilePictures/${uid}/${timestamp}.jpg`);
      
      // Upload the blob
      const snapshot = await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  // Compress image (basic implementation)
  static async compressImage(imageUri: string, quality: number = 0.8): Promise<string> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return imageUri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return imageUri;
    }
  }

  // Delete profile picture from Firebase Storage
  static async deleteProfilePicture(photoURL: string): Promise<void> {
    try {
      if (!photoURL) {
        return;
      }

      // Extract the storage path from the URL
      // Firebase Storage URLs look like: https://firebasestorage.googleapis.com/v0/b/project/o/path%2Fto%2Ffile.jpg?alt=media&token=...
      const url = new URL(photoURL);
      const pathMatch = url.pathname.match(/\/o\/(.+)/);
      
      if (!pathMatch) {
        return;
      }

      // Decode the path (URL encoded)
      const storagePath = decodeURIComponent(pathMatch[1]);
      
      // Create storage reference and delete
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      // Don't throw error - deletion should be graceful
      // The image might already be deleted or the URL might be invalid
    }
  }

  // Upload voice message to Firebase Storage
  static async uploadVoiceMessage(
    chatId: string, 
    messageId: string, 
    audioUri: string
  ): Promise<string> {
    try {
      // Convert audio file to blob
      const response = await fetch(audioUri);
      const blob = await response.blob();
      
      // Create storage reference
      const storageRef = ref(storage, `voiceMessages/${chatId}/${messageId}.m4a`);
      
      // Upload the blob
      const snapshot = await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading voice message:', error);
      throw error;
    }
  }

  // Upload chat image to Firebase Storage
  static async uploadChatImage(
    chatId: string, 
    messageId: string, 
    imageUri: string
  ): Promise<string> {
    try {
      // Convert image file to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const storageRef = ref(storage, `chatImages/${chatId}/${messageId}.jpg`);
      
      // Upload the blob
      const snapshot = await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading chat image:', error);
      throw error;
    }
  }

  // Delete voice message from Firebase Storage
  static async deleteVoiceMessage(audioUrl: string): Promise<void> {
    try {
      if (!audioUrl) {
        return;
      }

      // Extract the storage path from the URL
      const url = new URL(audioUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+)/);
      
      if (!pathMatch) {
        return;
      }

      // Decode the path (URL encoded)
      const storagePath = decodeURIComponent(pathMatch[1]);
      
      // Create storage reference and delete
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      
    } catch (error) {
      console.error('Error deleting voice message:', error);
      // Don't throw error - deletion should be graceful
    }
  }

  // Download voice message for offline playback
  static async downloadVoiceMessage(audioUrl: string): Promise<string> {
    try {
      if (!audioUrl) {
        throw new Error('No audio URL provided');
      }

      // Create local file path
      const fileName = audioUrl.split('/').pop() || 'voice_message.m4a';
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Download the file
      const downloadResult = await FileSystem.downloadAsync(audioUrl, localUri);
      
      if (downloadResult.status === 200) {
        return localUri;
      } else {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error downloading voice message:', error);
      throw error;
    }
  }
}
