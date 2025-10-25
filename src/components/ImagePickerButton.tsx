import React from 'react';
import { TouchableOpacity, StyleSheet, Alert, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MediaService } from '../api/media';

interface ImagePickerButtonProps {
  onImageSelected: (imageUri: string) => void;
  disabled?: boolean;
}

export default function ImagePickerButton({ onImageSelected, disabled = false }: ImagePickerButtonProps) {
  const handlePress = () => {
    if (disabled) return;

    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async () => {
    try {
      const imageUri = await MediaService.takePhoto();
      if (imageUri) {
        onImageSelected(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    try {
      const imageUri = await MediaService.pickImage();
      if (imageUri) {
        onImageSelected(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="camera" 
        size={24} 
        color={disabled ? '#ccc' : '#007AFF'} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: '#f8f8f8',
  },
});
