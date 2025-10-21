import { Platform, Alert } from 'react-native';

/**
 * Cross-platform alert utility that works on both web and mobile
 * Uses window.confirm/alert for web and React Native Alert for mobile
 */

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

/**
 * Show a simple alert message
 */
export const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    const fullMessage = message ? `${title}\n\n${message}` : title;
    window.alert(fullMessage);
  } else {
    Alert.alert(title, message);
  }
};

/**
 * Show an error alert
 */
export const showErrorAlert = (message: string) => {
  showAlert('Error', message);
};

/**
 * Show a success alert
 */
export const showSuccessAlert = (message: string) => {
  showAlert('Success', message);
};

/**
 * Show a confirmation dialog with custom buttons
 */
export const showConfirmAlert = (
  title: string,
  message: string,
  buttons: AlertButton[]
): void => {
  if (Platform.OS === 'web') {
    const fullMessage = `${title}\n\n${message}`;
    
    if (buttons.length === 0) {
      window.alert(fullMessage);
      return;
    }
    
    // Find cancel and confirm buttons
    const cancelButton = buttons.find(btn => btn.style === 'cancel');
    const confirmButton = buttons.find(btn => btn.style !== 'cancel') || buttons[0];
    
    if (cancelButton && confirmButton) {
      // Two-button dialog
      const result = window.confirm(fullMessage);
      if (result && confirmButton.onPress) {
        confirmButton.onPress();
      } else if (!result && cancelButton.onPress) {
        cancelButton.onPress();
      }
    } else if (confirmButton) {
      // Single button dialog
      const result = window.confirm(fullMessage);
      if (result && confirmButton.onPress) {
        confirmButton.onPress();
      }
    }
  } else {
    // Use React Native Alert for mobile
    Alert.alert(title, message, buttons);
  }
};

/**
 * Show a delete confirmation dialog
 */
export const showDeleteConfirmAlert = (
  itemType: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const title = `Delete ${itemType}`;
  const message = `Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone.`;
  
  showConfirmAlert(title, message, [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel
    },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: onConfirm
    }
  ]);
};

/**
 * Show a leave confirmation dialog
 */
export const showLeaveConfirmAlert = (
  itemType: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const title = `Leave ${itemType}`;
  const message = `Are you sure you want to leave this ${itemType.toLowerCase()}? You will no longer receive updates.`;
  
  showConfirmAlert(title, message, [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel
    },
    {
      text: 'Leave',
      style: 'destructive',
      onPress: onConfirm
    }
  ]);
};

/**
 * Show a generic confirmation dialog
 */
export const showGenericConfirmAlert = (
  title: string,
  message: string,
  confirmText: string = 'OK',
  cancelText: string = 'Cancel',
  onConfirm: () => void,
  onCancel?: () => void
) => {
  showConfirmAlert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel
    },
    {
      text: confirmText,
      style: 'default',
      onPress: onConfirm
    }
  ]);
};

export default {
  showAlert,
  showErrorAlert,
  showSuccessAlert,
  showConfirmAlert,
  showDeleteConfirmAlert,
  showLeaveConfirmAlert,
  showGenericConfirmAlert
};
