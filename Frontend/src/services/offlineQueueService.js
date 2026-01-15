import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_MESSAGE_QUEUE_KEY = 'offline_message_queue';
const OFFLINE_LOCATION_QUEUE_KEY = 'offline_location_queue';

export const offlineQueueService = {
  // Offline Message Queue
  async queueMessage(messageData) {
    try {
      const queue = await this.getMessageQueue();
      const queuedMsg = {
        ...messageData,
        queuedAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(7),
      };
      queue.push(queuedMsg);
      await AsyncStorage.setItem(OFFLINE_MESSAGE_QUEUE_KEY, JSON.stringify(queue));
      return queuedMsg.id;
    } catch (error) {
      console.error('Error queuing message:', error);
      throw error;
    }
  },

  async getMessageQueue() {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_MESSAGE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading message queue:', error);
      return [];
    }
  },

  async removeFromMessageQueue(id) {
    try {
      const queue = await this.getMessageQueue();
      const filtered = queue.filter(msg => msg.id !== id);
      await AsyncStorage.setItem(OFFLINE_MESSAGE_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  },

  async clearMessageQueue() {
    try {
      await AsyncStorage.removeItem(OFFLINE_MESSAGE_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing message queue:', error);
    }
  },

  // Offline Location Queue
  async queueLocation(locationData) {
    try {
      const queue = await this.getLocationQueue();
      const queuedLoc = {
        ...locationData,
        queuedAt: new Date().toISOString(),
        tempId: Math.random().toString(36).substring(7),
      };
      queue.push(queuedLoc);
      await AsyncStorage.setItem(OFFLINE_LOCATION_QUEUE_KEY, JSON.stringify(queue));
      return queuedLoc.tempId;
    } catch (error) {
      console.error('Error queuing location:', error);
      throw error;
    }
  },

  async getLocationQueue() {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_LOCATION_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading location queue:', error);
      return [];
    }
  },

  async removeFromLocationQueue(tempId) {
    try {
      const queue = await this.getLocationQueue();
      const filtered = queue.filter(loc => loc.tempId !== tempId);
      await AsyncStorage.setItem(OFFLINE_LOCATION_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  },

  async clearLocationQueue() {
    try {
      await AsyncStorage.removeItem(OFFLINE_LOCATION_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing location queue:', error);
    }
  },

  // Batch retry (call periodically when online)
  async retryOfflineMessages(messageService) {
    try {
      const queue = await this.getMessageQueue();
      if (queue.length === 0) return { successful: 0, failed: 0 };

      let successful = 0;
      let failed = 0;

      for (const msg of queue) {
        try {
          await messageService.create(msg);
          await this.removeFromMessageQueue(msg.id);
          successful++;
        } catch (error) {
          console.warn(`Failed to retry message ${msg.id}:`, error);
          failed++;
        }
      }

      return { successful, failed, remaining: queue.length - successful };
    } catch (error) {
      console.error('Error retrying offline messages:', error);
      return { successful: 0, failed: 0, remaining: queue.length };
    }
  },

  async retryOfflineLocations(locationService) {
    try {
      const queue = await this.getLocationQueue();
      if (queue.length === 0) return { successful: 0, failed: 0 };

      let successful = 0;
      let failed = 0;

      for (const loc of queue) {
        try {
          const { tempId, queuedAt, ...locData } = loc;
          await locationService.create(locData);
          await this.removeFromLocationQueue(tempId);
          successful++;
        } catch (error) {
          console.warn(`Failed to retry location ${loc.tempId}:`, error);
          failed++;
        }
      }

      return { successful, failed, remaining: queue.length - successful };
    } catch (error) {
      console.error('Error retrying offline locations:', error);
      return { successful: 0, failed: 0, remaining: queue.length };
    }
  }
};

export default offlineQueueService;
