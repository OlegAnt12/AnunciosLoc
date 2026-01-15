import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { muleService } from '../../services/muleService';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function MulesScreen() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [capacity, setCapacity] = useState(10);
  const [active, setActive] = useState(true);
  const [tab, setTab] = useState('assignments'); // assignments or config

  useEffect(() => {
    loadAssignments();
    loadConfig();
    loadStats();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await muleService.getAssignments();
      if (res && res.success) setAssignments(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const res = await muleService.getConfig();
      if (res && res.success) {
        setConfig(res.data || null);
        if (res.data) {
          setCapacity(res.data.capacity || 10);
          setActive(res.data.ativo !== undefined ? res.data.ativo : true);
        }
      }
    } catch (error) {
      console.error('Erro ao obter config:', error);
    }
  };

  const loadStats = async () => {
    try {
      const res = await muleService.getStats();
      if (res && res.success) setStats(res.data || null);
    } catch (error) {
      console.error('Erro ao obter stats:', error);
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

  const saveConfig = async () => {
    try {
      const res = await muleService.updateConfig({ capacity: parseInt(capacity, 10), active });
      if (res && res.success) {
        Alert.alert('Sucesso', 'Configuração de mula atualizada');
        loadConfig();
      }
    } catch (error) {
      console.error('Erro ao salvar config:', error);
      Alert.alert('Erro', error.message || 'Falha ao salvar configuração');
    }
  };

  const unregister = async () => {
    Alert.alert('Remover configuração', 'Deseja remover a configuração de mula?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try {
          const res = await muleService.unregister();
          if (res && res.success) {
            Alert.alert('Sucesso', 'Configuração removida');
            setConfig(null); setCapacity(10); setActive(true);
          }
        } catch (error) {
          console.error('Erro ao remover config:', error);
          Alert.alert('Erro', error.message || 'Falha ao remover configuração');
        }
      }}
    ]);
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Tab selector */}
      <View style={{ flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#DFE6E9' }}>
        <TouchableOpacity onPress={() => setTab('assignments')} style={{ flex: 1, padding: 12, borderBottomWidth: tab === 'assignments' ? 3 : 0, borderBottomColor: '#FF6B35' }}>
          <Text style={{ textAlign: 'center', fontWeight: tab === 'assignments' ? '700' : '400', color: tab === 'assignments' ? '#FF6B35' : '#636E72' }}>Atribuições</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('config')} style={{ flex: 1, padding: 12, borderBottomWidth: tab === 'config' ? 3 : 0, borderBottomColor: '#FF6B35' }}>
          <Text style={{ textAlign: 'center', fontWeight: tab === 'config' ? '700' : '400', color: tab === 'config' ? '#FF6B35' : '#636E72' }}>Configuração</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {tab === 'assignments' ? (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Atribuições Pendentes</Text>
            {assignments.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Icon name="truck-check" size={48} color="#DFE6E9" />
                <Text style={{ color: '#636E72', marginTop: 12 }}>Nenhuma atribuição pendente</Text>
              </View>
            ) : (
              <FlatList
                data={assignments}
                keyExtractor={item => String(item.assignment_id)}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={{ backgroundColor: '#FFF', padding: 12, marginBottom: 12, borderRadius: 12 }}>
                    <Text style={{ fontWeight: '700', marginBottom: 6 }}>{item.titulo}</Text>
                    <Text style={{ color: '#636E72', marginBottom: 6 }}>{item.local_nome} • P: {item.prioridade}</Text>
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
          </>
        ) : (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Configuração de Mula</Text>

            {/* Stats Card */}
            {stats && (
              <View style={{ backgroundColor: '#FFF', padding: 16, marginBottom: 16, borderRadius: 12 }}>
                <Text style={{ fontWeight: '700', marginBottom: 12, color: '#FF6B35' }}>Estatísticas</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#2D3436' }}>{stats.total_assignments || 0}</Text>
                    <Text style={{ color: '#636E72', fontSize: 12 }}>Total</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#27AE60' }}>{stats.delivered || 0}</Text>
                    <Text style={{ color: '#636E72', fontSize: 12 }}>Entregues</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#F39C12' }}>{stats.pending || 0}</Text>
                    <Text style={{ color: '#636E72', fontSize: 12 }}>Pendentes</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Config Form */}
            <View style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12 }}>
              <Text style={{ marginBottom: 8, fontWeight: '600' }}>Capacidade (mensagens)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setCapacity(Math.max(1, capacity - 1))} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FF6B35', borderRadius: 6 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>−</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', marginHorizontal: 16 }}>{capacity}</Text>
                <TouchableOpacity onPress={() => setCapacity(capacity + 1)} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FF6B35', borderRadius: 6 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setActive(!active)} style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: active ? '#FF6B35' : '#DFE6E9', justifyContent: 'center', alignItems: 'center' }}>
                  {active && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
                </TouchableOpacity>
                <Text style={{ marginLeft: 8 }}>{active ? 'Mula Ativa' : 'Mula Inativa'}</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={saveConfig} style={{ flex: 1, paddingVertical: 12, backgroundColor: '#FF6B35', borderRadius: 8, marginRight: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={unregister} style={{ flex: 1, paddingVertical: 12, backgroundColor: '#E74C3C', borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}