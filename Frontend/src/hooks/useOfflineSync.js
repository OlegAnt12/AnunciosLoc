import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import { offlineQueueService } from '../services/offlineQueueService';

export const useOfflineSync = () => {
  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        // Device is back online, retry offline messages
        retryOfflineQueues();
      }
    });

    return () => unsubscribe();
  }, []);
};

const retryOfflineQueues = async () => {
  try {
    const messageResult = await offlineQueueService.retryOfflineMessages();
    const locationResult = await offlineQueueService.retryOfflineLocations();

    if (messageResult.succeeded > 0 || locationResult.succeeded > 0) {
      Alert.alert(
        'Sincronização',
        `${messageResult.succeeded} mensagens e ${locationResult.succeeded} locais sincronizados.`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  } catch (error) {
    console.error('Erro ao sincronizar offline queue:', error);
  }
};
