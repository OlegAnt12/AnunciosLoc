import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import notificationService from '@/services/notificationService';
import { useNotifications } from '@/contexts/NotificationsContext';

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setCount } = useNotifications();

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(50);
      setItems(data || []);
      // Use the unread count endpoint for accurate badge
      const cntRes = await notificationService.getCount();
      setCount(cntRes?.count || 0);
    } catch (err) {
      console.log('Erro ao obter notificações', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setItems((s) => s.filter((it) => it.id !== id));
      // refresh accurate count
      const cntRes = await notificationService.getCount();
      setCount(cntRes.data?.count || 0);
    } catch (err) {
      console.log('Erro ao eliminar notificação', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setItems((s) => s.filter((it) => it.id !== id));
      // refresh accurate count
      const cntRes = await notificationService.getCount();
      setCount(cntRes.data?.count || 0);
    } catch (err) {
      console.log('Erro ao marcar como lida', err);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Notificações</ThemedText>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={<ThemedText>Nenhuma notificação</ThemedText>}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <ThemedText type="defaultSemiBold">{item.mensagem_titulo || 'Sem título'}</ThemedText>
              <ThemedText type="small">{item.detalhes || item.local_nome || ''}</ThemedText>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => handleMarkRead(item.id)} style={styles.actionBtn}>
                <ThemedText>Marcar lida</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <ThemedText style={{ color: '#D9534F' }}>Eliminar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemLeft: { flex: 1, gap: 4 },
  itemActions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  actionBtn: { padding: 6 },
});
