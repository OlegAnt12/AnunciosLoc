import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { muleService } from '../../services/muleService';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function MulesScreen() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await muleService.getAssignments();
      if (res && res.success) setAssignments(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
      Alert.alert('Erro', error.message || 'Falha ao carregar atribuições');
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id) => {
    Alert.alert('Aceitar atribuição', 'Deseja aceitar esta atribuição e marcar como entregue?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceitar', onPress: async () => {
        try {
          const res = await muleService.acceptAssignment(id);
          if (res && res.success) {
            Alert.alert('Sucesso', 'Atribuição aceite');
            setAssignments(assignments.filter(a => a.assignment_id !== id));
          }
        } catch (error) {
          console.error('Erro ao aceitar:', error);
          Alert.alert('Erro', error.message || 'Falha ao aceitar atribuição');
        }
      }}
    ]);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Atribuições de Mula</Text>
      {assignments.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Icon name="truck-check" size={48} color="#DFE6E9" />
          <Text style={{ color: '#636E72', marginTop: 12 }}>Nenhuma atribuição pendente</Text>
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={item => String(item.assignment_id)}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#FFF', padding: 12, marginBottom: 12, borderRadius: 12 }}>
              <Text style={{ fontWeight: '700', marginBottom: 6 }}>{item.titulo}</Text>
              <Text style={{ color: '#636E72', marginBottom: 6 }}>{item.local_nome} • Prioridade: {item.prioridade}</Text>
              <Text numberOfLines={2} style={{ marginBottom: 8 }}>{item.conteudo}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => accept(item.assignment_id)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#FF6B35', borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Aceitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}