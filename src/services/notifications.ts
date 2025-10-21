import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { firestore } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    try {
      console.log('Initializing notifications...');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted. Push notifications will not work.');
        return;
      }
      
      console.log('Notification permissions granted.');

      // Get push token
      if (Device.isDevice) {
        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                           process.env.EXPO_PROJECT_ID || 
                           'messageai-bc582';
          
          // Check if we have a valid project ID (not the placeholder)
          if (projectId === '00000000-0000-0000-0000-000000000000' || projectId === 'messageai-bc582') {
            console.log('Using placeholder project ID. Push notifications will not work in production.');
            console.log('To enable push notifications, create a proper Expo project and update the project ID.');
            return;
          }
          
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          });
          this.expoPushToken = token.data;
          console.log('Push token:', this.expoPushToken);
        } catch (error) {
          console.error('Error getting push token:', error);
          console.log('Push notifications will not work without a valid project ID.');
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      console.log('Notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing notifications:', error);
      // Don't throw error - let app continue without notifications
    }
  }

  async getPushToken(): Promise<string | null> {
    if (!this.expoPushToken) {
      await this.initialize();
    }
    return this.expoPushToken;
  }

  async updateUserPushToken(userId: string, token: string) {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        pushToken: token,
        updatedAt: Date.now()
      });
      console.log('Push token updated for user:', userId);
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  }

  async sendNotification(
    title: string,
    body: string,
    data?: any,
    sound: boolean = true
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: sound ? 'default' : undefined,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async sendMessageNotification(
    chatId: string,
    senderName: string,
    messageText: string,
    chatName?: string
  ) {
    try {
      const title = chatName || senderName;
      const body = `${senderName}: ${messageText}`;
      
      await this.sendNotification(title, body, {
        chatId,
        type: 'message'
      });
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }

  async sendGroupNotification(
    groupId: string,
    senderName: string,
    messageText: string,
    groupName: string
  ) {
    try {
      const title = groupName;
      const body = `${senderName}: ${messageText}`;
      
      await this.sendNotification(title, body, {
        chatId: groupId,
        type: 'group_message'
      });
    } catch (error) {
      console.error('Error sending group notification:', error);
    }
  }

  async checkIfChatIsMuted(chatId: string, userId: string): Promise<boolean> {
    try {
      const chatRef = doc(firestore, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        return false;
      }

      const chatData = chatSnap.data();
      
      // Check if user has muted this chat
      if (chatData.mutedBy === userId && chatData.muted === true) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking mute status:', error);
      return false;
    }
  }

  async muteChat(chatId: string, userId: string) {
    try {
      const chatRef = doc(firestore, 'chats', chatId);
      await updateDoc(chatRef, {
        muted: true,
        mutedBy: userId,
        mutedAt: Date.now(),
        updatedAt: Date.now()
      });
      console.log('Chat muted:', chatId);
    } catch (error) {
      console.error('Error muting chat:', error);
      throw error;
    }
  }

  async unmuteChat(chatId: string, userId: string) {
    try {
      const chatRef = doc(firestore, 'chats', chatId);
      await updateDoc(chatRef, {
        muted: false,
        mutedBy: null,
        mutedAt: null,
        updatedAt: Date.now()
      });
      console.log('Chat unmuted:', chatId);
    } catch (error) {
      console.error('Error unmuting chat:', error);
      throw error;
    }
  }

  // Listen for notification responses
  addNotificationResponseListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Listen for notifications received while app is running
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Get notification permissions status
  async getPermissionsStatus() {
    return await Notifications.getPermissionsAsync();
  }

  // Send ping notification for testing
  async sendPingNotification() {
    try {
      await this.sendNotification(
        'Ping Test',
        'This is a test notification from MessageAI',
        { type: 'ping_test' },
        true
      );
      console.log('Ping notification sent successfully');
    } catch (error) {
      console.error('Error sending ping notification:', error);
      throw error;
    }
  }

  // Send local notification for message received
  async sendLocalMessageNotification(
    senderName: string,
    messageText: string,
    messageType: 'text' | 'voice' | 'image' = 'text',
    chatName?: string
  ) {
    try {
      console.log('Sending local message notification...');
      
      // Prepare notification content
      const title = chatName || senderName;
      const body = `${senderName}: ${this.formatMessageForNotification(messageText, messageType)}`;
      
      // Send local notification
      await this.sendNotification(title, body, {
        type: 'message',
        messageType,
        senderName
      });
      
      console.log('Local message notification sent successfully');
    } catch (error) {
      console.error('Error sending local message notification:', error);
    }
  }

  // Format message content for notification display
  private formatMessageForNotification(text: string, messageType: 'text' | 'voice' | 'image'): string {
    switch (messageType) {
      case 'voice':
        return '🎤 Voice message';
      case 'image':
        return '📷 Image';
      case 'text':
      default:
        return text;
    }
  }

  // Test local notification for Expo Go
  async testLocalNotification() {
    try {
      console.log('Testing local notification...');
      
      await this.sendNotification(
        'MessageAI Test',
        'This is a test local notification from MessageAI!',
        { type: 'test', timestamp: Date.now() },
        true
      );
      
      console.log('Local notification test sent successfully');
      return true;
    } catch (error) {
      console.error('Error testing local notification:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
