import * as Notifications from 'expo-notifications';
import api from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class PushNotificationService {
  constructor() {
    this.pushToken = null;
  }

  // Register for push notifications
  async registerForPushNotificationsAsync() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      this.pushToken = token.data;
      console.log('Push token:', this.pushToken);

      // Send token to backend
      await this.sendPushTokenToBackend(this.pushToken);

      return this.pushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Send push token to backend
  async sendPushTokenToBackend(pushToken) {
    try {
      await api.post('/profiles/push-token', { pushToken });
      console.log('Push token sent to backend');
    } catch (error) {
      console.error('Error sending push token to backend:', error);
    }
  }

  // Handle incoming notifications
  setupNotificationListener() {
    // Handle notification when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can update app state here if needed
    });

    // Handle notification when user taps on it
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Navigate to relevant screen based on notification data
      const data = response.notification.request.content.data;
      if (data && data.type === 'new_message') {
        // Navigate to messages screen or specific message
        // This would require navigation context
      }
    });

    return { notificationListener, responseListener };
  }

  // Get current push token
  getPushToken() {
    return this.pushToken;
  }
}

export default new PushNotificationService();