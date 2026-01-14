import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import notificationService from '@/services/notificationService';
import { useIsFocused } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/contexts/NotificationsContext';

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(50);
      setItems(res.data || []);
    } catch (err) {
      console.log('Erro ao obter notificações', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused]);

  const { refreshCount, setCount } = useNotifications();

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setItems((s) => s.filter((it) => it.id !== id));
      // update global count
      setCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.log('Erro ao eliminar notificação', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Optimistically remove or mark as read locally
      setItems((s) => s.filter((it) => it.id !== id));
      setCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.log('Erro ao marcar como lida', err);
    }
  };

  return (
    <ThemedView style={styles.container}>
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
                <IconSymbol name="checkmark.circle" size={22} color={Colors[colorScheme ?? 'light'].tint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <IconSymbol name="trash" size={22} color="#D9534F" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  itemLeft: {
    flex: 1,
    gap: 4,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    padding: 6,
  },
});
