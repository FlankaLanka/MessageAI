import { Platform } from 'react-native';

// Web-compatible alert implementation
const webAlert = (title: string, message?: string, buttons?: Array<{text: string, style?: 'default' | 'cancel' | 'destructive', onPress?: () => void}>) => {
  if (Platform.OS !== 'web') {
    throw new Error('webAlert should only be used on web platform');
  }

  const fullMessage = message ? `${title}\n\n${message}` : title;
  
  if (buttons && buttons.length > 0) {
    // For multiple buttons, we'll use a simple confirm dialog
    // This is a simplified version - in a real app you might want a custom modal
    const hasCancel = buttons.some(btn => btn.style === 'cancel');
    const confirmButton = buttons.find(btn => btn.style !== 'cancel') || buttons[0];
    
    if (hasCancel && confirmButton) {
      const result = window.confirm(fullMessage);
      if (result && confirmButton.onPress) {
        confirmButton.onPress();
      } else if (!result) {
        const cancelButton = buttons.find(btn => btn.style === 'cancel');
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      // Single button or no cancel button
      const result = window.confirm(fullMessage);
      if (result && confirmButton && confirmButton.onPress) {
        confirmButton.onPress();
      }
    }
  } else {
    // Simple alert
    window.alert(fullMessage);
  }
};

// Cross-platform alert function
export const crossPlatformAlert = (title: string, message?: string, buttons?: Array<{text: string, style?: 'default' | 'cancel' | 'destructive', onPress?: () => void}>) => {
  if (Platform.OS === 'web') {
    return webAlert(title, message, buttons);
  } else {
    // For mobile platforms, we'll need to import Alert from react-native
    // This will be handled in the component files
    throw new Error('Use Alert.alert for mobile platforms');
  }
};

export default crossPlatformAlert;
