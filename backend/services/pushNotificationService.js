const { Expo, ExpoPushMessage, ExpoPushToken } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

class PushNotificationService {
  constructor() {
    this.expo = expo;
  }

  // Send a push notification to a single user
  async sendPushNotification(pushToken, title, body, data = {}) {
    try {
      // Check that the push token is valid
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return false;
      }

      // Construct a message
      const message = {
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
      };

      // Send the message
      const ticket = await this.expo.sendPushNotificationsAsync([message]);
      console.log('Push notification sent:', ticket);

      return ticket;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send push notifications to multiple users
  async sendPushNotificationsToUsers(userTokens, title, body, data = {}) {
    try {
      // Create the messages that you want to send to clients
      let messages = [];

      for (let pushToken of userTokens) {
        // Check that the push token is valid
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(`Push token ${pushToken} is not a valid Expo push token`);
          continue;
        }

        // Construct a message
        messages.push({
          to: pushToken,
          sound: 'default',
          title: title,
          body: body,
          data: data,
        });
      }

      // Send the messages
      let chunks = this.expo.chunkPushNotifications(messages);
      let tickets = [];

      for (let chunk of chunks) {
        try {
          let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending chunk:', error);
        }
      }

      console.log(`Push notifications sent to ${tickets.length} users`);
      return tickets;
    } catch (error) {
      console.error('Error sending push notifications:', error);
      return [];
    }
  }

  // Get push tokens for users in a location
  async getPushTokensForLocation(locationId) {
    const db = require('../config/database');
    try {
      const [rows] = await db.query(`
        SELECT DISTINCT u.push_token
        FROM utilizadores u
        JOIN localizacoes_utilizador lu ON u.id = lu.utilizador_id
        WHERE lu.data_registo >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        AND lu.utilizador_id IN (
          SELECT utilizador_id FROM matching_localizacao
          WHERE local_id = ? AND data_matching >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
        )
        AND u.push_token IS NOT NULL
      `, [locationId]);

      return rows.map(row => row.push_token).filter(token => token);
    } catch (error) {
      console.error('Error getting push tokens:', error);
      return [];
    }
  }

  // Notify users about a new message in their location
  async notifyNewMessage(messageId, locationId, messageTitle) {
    try {
      const pushTokens = await this.getPushTokensForLocation(locationId);

      if (pushTokens.length === 0) {
        console.log('No push tokens found for location');
        return 0;
      }

      const title = 'Nova Mensagem';
      const body = `Nova mensagem: ${messageTitle}`;
      const data = { messageId, locationId, type: 'new_message' };

      await this.sendPushNotificationsToUsers(pushTokens, title, body, data);

      return pushTokens.length;
    } catch (error) {
      console.error('Error notifying new message:', error);
      return 0;
    }
  }

  // Notify user about location update or other actions
  async notifyUserAction(userId, title, body, data = {}) {
    const db = require('../config/database');
    try {
      const [rows] = await db.query('SELECT push_token FROM utilizadores WHERE id = ?', [userId]);

      if (rows.length === 0 || !rows[0].push_token) {
        console.log('No push token found for user');
        return false;
      }

      const pushToken = rows[0].push_token;
      await this.sendPushNotification(pushToken, title, body, data);

      return true;
    } catch (error) {
      console.error('Error notifying user action:', error);
      return false;
    }
  }
}

module.exports = new PushNotificationService();