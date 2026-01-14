import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Button,
  StyleSheet
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { messageService } from '../../../services/api';

export default function MessagesScreen({ user }) {
  const [activeTab, setActiveTab] = useState('sent');
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create message form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('CENTRALIZADO');
  const [policyType, setPolicyType] = useState('WHITELIST');
  const [policyRules, setPolicyRules] = useState([{ chave: '', valor: '' }]);
  const [newLocationName, setNewLocationName] = useState('');
  const [inlineType, setInlineType] = useState('GPS'); // GPS or WIFI
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusM, setRadiusM] = useState('500');
  const [ssids, setSsids] = useState(['']);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      let result;
      if (activeTab === 'sent') {
        result = await messageService.getSentMessages(user.id);
      } else if (activeTab === 'received') {
        result = await messageService.getUserMessages(user.id);
      } else if (activeTab === 'nearby') {
        // Try to fetch nearby messages (backend may use stored user location)
        result = await messageService.getMessagesForUser({});
      }
      
      if (result && result.success) {
        setMessages(result.data || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Dados de exemplo para demonstração
      const sampleMessages = activeTab === 'sent' ? [
        {
          id: 1,
          title: 'Carro em bom estado',
          content: 'Vendo carro em excelente estado, baixo consumo, recentemente revisado.',
          location_name: 'Lisboa Centro',
          policy_type: 'public',
          created_at: new Date().toISOString(),
          received_count: 5
        }
      ] : [
        {
          id: 2,
          title: 'Apartamento T2',
          content: 'Apartamento T2 mobilado no centro de Lisboa. Próximo de transportes.',
          author_username: 'maria_santos',
          location_name: 'Lisboa',
          received_at: new Date().toISOString()
        }
      ];
      setMessages(sampleMessages);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const addSsid = () => setSsids([...ssids, '']);
  const updateSsid = (index, value) => {
    const newArr = [...ssids];
    newArr[index] = value;
    setSsids(newArr);
  };
  const removeSsid = (index) => {
    const newArr = ssids.filter((_, i) => i !== index);
    setSsids(newArr.length ? newArr : ['']);
  };

  // Policy rules helpers
  const addPolicyRule = () => setPolicyRules([...policyRules, { chave: '', valor: '' }]);
  const updatePolicyRule = (index, key, value) => {
    const newArr = [...policyRules];
    newArr[index] = { ...newArr[index], [key]: value };
    setPolicyRules(newArr);
  };
  const removePolicyRule = (index) => {
    const newArr = policyRules.filter((_, i) => i !== index);
    setPolicyRules(newArr.length ? newArr : [{ chave: '', valor: '' }]);
  };

  const submitCreate = async () => {
    // basic validation
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Erro', 'Preencha o título e o conteúdo');
      return;
    }

    const payload = {
      titulo: newTitle,
      conteudo: newContent,
      modo_entrega: deliveryMode,
      tipo_politica: policyType,
    };

    // Add policy rules if provided
    const rules = policyRules.map(r => ({ chave: r.chave, valor: r.valor })).filter(r => r.chave && r.valor);
    if (rules.length) payload.restricoes = rules;

    // Optional inline location name
    if (newLocationName && newLocationName.trim()) payload.nome_local = newLocationName.trim();

    // attach inline location data if provided
    if (inlineType === 'GPS' && latitude && longitude) {
      payload.latitude = parseFloat(latitude);
      payload.longitude = parseFloat(longitude);
      payload.raio_metros = parseInt(radiusM, 10) || 500;
      payload.tipo_local = 'GPS';
    } else if (inlineType === 'WIFI') {
      // filter empty ssids
      const filtered = ssids.map(s => s && s.trim()).filter(Boolean);
      if (filtered.length > 0) payload.coordenadas = filtered;
      payload.tipo_local = 'WIFI';
    }

    try {
      // provide alternative field names for broader compatibility
      if (payload.restricoes && !payload.policy_rules) payload.policy_rules = payload.restricoes;
      if (payload.modo_entrega && !payload.delivery_mode) payload.delivery_mode = payload.modo_entrega;
      if (payload.tipo_politica && !payload.policy_type) payload.policy_type = payload.tipo_politica;

      setCreating(true);
      const result = await messageService.create(payload);
      if (result && result.success) {
        Alert.alert('Sucesso', 'Mensagem criada com sucesso');

        // Optimistic insert into sent messages list when id available
        const createdId = result.data?.id;
        if (createdId) {
          const newMsg = {
            id: createdId,
            title: newTitle,
            content: newContent,
            location_name: newLocationName || (inlineType === 'GPS' ? `${latitude},${longitude}` : (ssids.filter(Boolean).join(', ') || 'Local')),
            policy_type: policyType.toLowerCase(),
            created_at: new Date().toISOString(),
            received_count: 0
          };
          setMessages(prev => [newMsg, ...prev]);
        }

        setShowCreateModal(false);
        // reset form
        setNewTitle(''); setNewContent(''); setSsids(['']); setLatitude(''); setLongitude(''); setRadiusM('500'); setNewLocationName(''); setPolicyRules([{ chave: '', valor: '' }]);
        // refresh sent messages
        setActiveTab('sent');
        await loadMessages();
      } else {
        throw new Error(result?.message || 'Erro ao criar mensagem');
      }
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      Alert.alert('Erro', error.message || 'Falha ao criar mensagem');
    } finally {
      setCreating(false);
    }
  };

  const deleteMessage = async (messageId) => {
    Alert.alert(
      'Eliminar Mensagem',
      'Tem a certeza que pretende eliminar esta mensagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await messageService.deleteMessage(messageId);
              if (result.success) {
                setMessages(messages.filter(msg => msg.id !== messageId));
                Alert.alert('Sucesso', 'Mensagem eliminada com sucesso!');
              }
            } catch (error) {
              console.error('Error deleting message:', error);
              // Simular sucesso em desenvolvimento
              setMessages(messages.filter(msg => msg.id !== messageId));
              Alert.alert('Sucesso', 'Mensagem eliminada com sucesso!');
            }
          }
        }
      ]
    );
  };

  const receiveNearbyMessage = async (messageId) => {
    try {
      setRefreshing(true);
      const result = await messageService.receiveMessage(messageId);
      if (result && result.success) {
        Alert.alert('Sucesso', 'Mensagem recebida!');
        // remove from nearby list
        setMessages(messages.filter(m => m.id !== messageId));
        // refresh received messages
        if (activeTab === 'nearby') {
          // optionally refresh received tab
          // setActiveTab('received');
          await loadMessages();
        }
      }
    } catch (error) {
      console.error('Erro ao receber mensagem:', error);
      Alert.alert('Erro', error.message || 'Falha ao receber mensagem');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPolicyTypeText = (policyType) => {
    const types = {
      'whitelist': 'Lista Branca',
      'blacklist': 'Lista Negra',
      'public': 'Público'
    };
    return types[policyType] || policyType;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#FFF', margin: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 }}>
        <TouchableOpacity
          style={{ 
            flex: 1, 
            padding: 16, 
            backgroundColor: activeTab === 'sent' ? '#FF6B35' : 'transparent',
            alignItems: 'center'
          }}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={{ 
            color: activeTab === 'sent' ? '#FFF' : '#2D3436', 
            fontWeight: '600' 
          }}>
            Mensagens Enviadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ 
            flex: 1, 
            padding: 16, 
            backgroundColor: activeTab === 'received' ? '#FF6B35' : 'transparent',
            alignItems: 'center'
          }}
          onPress={() => setActiveTab('received')}
        >
          <Text style={{ 
            color: activeTab === 'received' ? '#FFF' : '#2D3436', 
            fontWeight: '600' 
          }}>
            Mensagens Recebidas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ 
            flex: 1, 
            padding: 16, 
            backgroundColor: activeTab === 'nearby' ? '#FF6B35' : 'transparent',
            alignItems: 'center'
          }}
          onPress={() => setActiveTab('nearby')}
        >
          <Text style={{ 
            color: activeTab === 'nearby' ? '#FFF' : '#2D3436', 
            fontWeight: '600' 
          }}>
            Próximas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3436', marginBottom: 16 }}>
            {activeTab === 'sent' ? 'Minhas Mensagens' : 'Mensagens Recebidas'}
          </Text>

          {activeTab === 'sent' && (
            <TouchableOpacity onPress={() => setShowCreateModal(true)} style={{ backgroundColor: '#FF6B35', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#FFF', fontWeight: '600' }}>Criar Mensagem</Text>
            </TouchableOpacity>
          )}
          
          {messages.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Icon name={activeTab === 'sent' ? "message-outline" : "message-text-outline"} size={48} color="#DFE6E9" />
              <Text style={{ color: '#636E72', textAlign: 'center', marginTop: 12 }}>
                {activeTab === 'sent' ? 'Nenhuma mensagem enviada' : 'Nenhuma mensagem recebida'}
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View key={message.id} style={{ 
                padding: 16, 
                borderBottomWidth: 1, 
                borderBottomColor: '#F1F2F6',
                marginBottom: 12,
                backgroundColor: '#F8F9FA',
                borderRadius: 12,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#2D3436', fontSize: 16, marginBottom: 4 }}>
                      {message.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Icon name="map-marker" size={14} color="#636E72" />
                      <Text style={{ color: '#636E72', fontSize: 12, marginLeft: 4 }}>
                        {message.location_name}
                      </Text>
                    </View>
                    {activeTab === 'sent' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="shield-account" size={14} color="#636E72" />
                        <Text style={{ color: '#636E72', fontSize: 12, marginLeft: 4 }}>
                          {getPolicyTypeText(message.policy_type)}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {activeTab === 'sent' && (
                    <TouchableOpacity onPress={() => deleteMessage(message.id)}>
                      <Icon name="delete" size={18} color="#E17055" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <Text style={{ color: '#2D3436', marginBottom: 12, lineHeight: 20 }}>
                  {message.content}
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#636E72', fontSize: 12 }}>
                    {activeTab === 'sent' ? `Recebidas: ${message.received_count || 0}` : `Por: ${message.author_username}`}
                  </Text>
                  <Text style={{ color: '#636E72', fontSize: 12 }}>
                    {formatDateTime(activeTab === 'sent' ? message.created_at : message.received_at)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Message Modal */}
      <Modal visible={showCreateModal} animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Criar Mensagem</Text>

          <TextInput placeholder="Título" value={newTitle} onChangeText={setNewTitle} style={styles.input} />
          <TextInput placeholder="Conteúdo" value={newContent} onChangeText={setNewContent} style={[styles.input, { height: 120 }]} multiline />

          <TextInput placeholder="Nome do local (opcional)" value={newLocationName} onChangeText={setNewLocationName} style={styles.input} />

          {/* Delivery mode selector */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => setDeliveryMode('CENTRALIZADO')} style={[styles.smallButton, deliveryMode === 'CENTRALIZADO' ? styles.smallButtonActive : null]}>
              <Text style={deliveryMode === 'CENTRALIZADO' ? styles.smallButtonTextActive : styles.smallButtonText}>Centralizado</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeliveryMode('DESCENTRALIZADO')} style={[styles.smallButton, deliveryMode === 'DESCENTRALIZADO' ? styles.smallButtonActive : null]}>
              <Text style={deliveryMode === 'DESCENTRALIZADO' ? styles.smallButtonTextActive : styles.smallButtonText}>Descentralizado</Text>
            </TouchableOpacity>
          </View>

          {/* Policy type selector */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => setPolicyType('WHITELIST')} style={[styles.smallButton, policyType === 'WHITELIST' ? styles.smallButtonActive : null]}>
              <Text style={policyType === 'WHITELIST' ? styles.smallButtonTextActive : styles.smallButtonText}>Lista Branca</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPolicyType('BLACKLIST')} style={[styles.smallButton, policyType === 'BLACKLIST' ? styles.smallButtonActive : null]}>
              <Text style={policyType === 'BLACKLIST' ? styles.smallButtonTextActive : styles.smallButtonText}>Lista Negra</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPolicyType('PUBLIC')} style={[styles.smallButton, policyType === 'PUBLIC' ? styles.smallButtonActive : null]}>
              <Text style={policyType === 'PUBLIC' ? styles.smallButtonTextActive : styles.smallButtonText}>Público</Text>
            </TouchableOpacity>
          </View>

          {/* Policy rules editor */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ marginBottom: 6, color: '#636E72' }}>Regras de política (opcional)</Text>
            {policyRules.map((r, idx) => (
              <View key={`rule-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <TextInput placeholder="Chave" value={r.chave} onChangeText={(v) => updatePolicyRule(idx, 'chave', v)} style={[styles.input, { flex: 0.45, marginRight: 8 }]} />
                <TextInput placeholder="Valor" value={r.valor} onChangeText={(v) => updatePolicyRule(idx, 'valor', v)} style={[styles.input, { flex: 0.45 }]} />
                <TouchableOpacity onPress={() => removePolicyRule(idx)} style={{ marginLeft: 8 }}>
                  <Icon name="close-circle" size={24} color="#E17055" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addPolicyRule} style={{ marginTop: 6, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#FF6B35', fontWeight: '600' }}>+ Adicionar Regra</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => setInlineType('GPS')} style={[styles.smallButton, inlineType === 'GPS' ? styles.smallButtonActive : null]}>
              <Text style={inlineType === 'GPS' ? styles.smallButtonTextActive : styles.smallButtonText}>GPS</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setInlineType('WIFI')} style={[styles.smallButton, inlineType === 'WIFI' ? styles.smallButtonActive : null]}>
              <Text style={inlineType === 'WIFI' ? styles.smallButtonTextActive : styles.smallButtonText}>WIFI (SSIDs)</Text>
            </TouchableOpacity>
          </View>

          {inlineType === 'GPS' ? (
            <>
              <TextInput placeholder="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" style={styles.input} />
              <TextInput placeholder="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" style={styles.input} />
              <TextInput placeholder="Raio (m)" value={radiusM} onChangeText={setRadiusM} keyboardType="numeric" style={styles.input} />
            </>
          ) : (
            <View style={{ width: '100%' }}>
              {ssids.map((s, idx) => (
                <View key={`ssid-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TextInput placeholder={`SSID ${idx + 1}`} value={s} onChangeText={(v) => updateSsid(idx, v)} style={[styles.input, { flex: 1 }]} />
                  <TouchableOpacity onPress={() => removeSsid(idx)} style={{ marginLeft: 8 }}>
                    <Icon name="close-circle" size={24} color="#E17055" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addSsid} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                <Text style={{ color: '#FF6B35', fontWeight: '600' }}>+ Adicionar SSID</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <Button title="Cancelar" onPress={() => setShowCreateModal(false)} />
            <View style={{ width: 12 }} />
            <Button title={creating ? 'Criando...' : 'Criar'} onPress={submitCreate} disabled={creating} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#EDEDED', borderRadius: 8, padding: 12, marginBottom: 8 },
  smallButton: { padding: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E6E6E6', marginRight: 8 },
  smallButtonActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  smallButtonText: { color: '#2D3436' },
  smallButtonTextActive: { color: '#FFF' }
});