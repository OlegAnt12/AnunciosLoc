import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import notificationService from '../../services/notificationService';
import { useNotifications } from '../../contexts/NotificationsContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { count, refreshCount, markAllRead } = useNotifications();

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications(100);
      if (res && res.data && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.log('Erro ao carregar notificações:', error);
      Alert.alert('Erro', 'Não foi possível carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      await load();
      Alert.alert('Sucesso', 'Todas as notificações marcadas como lidas');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar todas como lidas');
    }
  };

  const handleMarkItem = async (item) => {
    try {
      await notificationService.markAsRead(item.id);
      await load();
      refreshCount();
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
      Alert.alert('Erro', 'Não foi possível marcar como lida');
    }
  };

  const handleDeleteItem = async (item) => {
    Alert.alert('Eliminar notificação', 'Tem a certeza que pretende remover esta notificação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await notificationService.deleteNotification(item.id);
          await load();
          refreshCount();
          Alert.alert('Sucesso', 'Notificação removida');
        } catch (error) {
          console.error('Erro ao remover notificação:', error);
          Alert.alert('Erro', 'Não foi possível remover a notificação');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Icon name="bell-ring-outline" size={20} color="#FF6B35" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>{item.mensagem_titulo || 'Notificação'}</Text>
          <Text style={styles.details}>{item.detalhes || ''}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.time}>{item.timestamp}</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity onPress={() => handleMarkItem(item)} style={{ marginRight: 8 }}>
            <Text style={{ color: '#2D3436', fontWeight: '600' }}>Marcar como lida</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteItem(item)}>
            <Icon name="delete" size={18} color="#E17055" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAll}>
          <Text style={styles.markAllText}>Marcar todas como lidas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#636E72' }}>Nenhuma notificação</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3436' },
  markAllButton: { backgroundColor: '#FF6B35', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  markAllText: { color: '#FFF', fontWeight: '600' },
  item: { backgroundColor: '#FFF', padding: 12, marginBottom: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  title: { fontWeight: '600', color: '#2D3436' },
  details: { color: '#636E72', marginTop: 4 },
  time: { color: '#A8B3B8', fontSize: 12 }
});