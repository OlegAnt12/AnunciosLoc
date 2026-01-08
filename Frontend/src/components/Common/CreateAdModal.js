import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { messageService, locationService } from '../services/api';
import * as Location from 'expo-location';

export default function CreateAdModal({ visible, onClose, onMessageSent, user }) {
  const [messageData, setMessageData] = useState({
    title: '',
    content: '',
    location_id: '',
    policy_type: 'public',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 dias
    policy_rules: []
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (visible) {
      loadUserLocations();
      getCurrentLocation();
    }
  }, [visible]);

  const loadUserLocations = async () => {
    try {
      const result = await locationService.getUserLocations(user.id);
      if (result.success) {
        setLocations(result.data || []);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleCreateMessage = async () => {
    if (!messageData.title || !messageData.content || !messageData.location_id) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const result = await messageService.create({
        ...messageData,
        author_id: user.id
      });

      if (result.success) {
        Alert.alert('Sucesso', 'Mensagem criada com sucesso!');
        onMessageSent();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating message:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMessageData({
      title: '',
      content: '',
      location_id: '',
      policy_type: 'public',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      policy_rules: []
    });
  };

  const addPolicyRule = () => {
    setMessageData(prev => ({
      ...prev,
      policy_rules: [...prev.policy_rules, { key: '', value: '' }]
    }));
  };

  const updatePolicyRule = (index, field, value) => {
    setMessageData(prev => ({
      ...prev,
      policy_rules: prev.policy_rules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const removePolicyRule = (index) => {
    setMessageData(prev => ({
      ...prev,
      policy_rules: prev.policy_rules.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' }}>
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#DFE6E9' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3436' }}>Criar Nova Mensagem</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
            <View style={{ padding: 20 }}>
              {/* Título */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>Título *</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#DFE6E9', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FFF' }}
                  placeholder="Título da mensagem"
                  value={messageData.title}
                  onChangeText={(text) => setMessageData({...messageData, title: text})}
                />
              </View>

              {/* Conteúdo */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>Conteúdo *</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#DFE6E9', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FFF', minHeight: 100, textAlignVertical: 'top' }}
                  placeholder="Conteúdo da mensagem"
                  multiline
                  value={messageData.content}
                  onChangeText={(text) => setMessageData({...messageData, content: text})}
                />
              </View>

              {/* Localização */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>Localização *</Text>
                {locations.length === 0 ? (
                  <Text style={{ color: '#636E72', fontStyle: 'italic' }}>
                    Nenhuma localização disponível. Crie uma localização primeiro.
                  </Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row' }}>
                      {locations.map((location) => (
                        <TouchableOpacity
                          key={location.id}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: messageData.location_id === location.id ? '#FF6B35' : '#F8F9FA',
                            borderRadius: 8,
                            marginRight: 8,
                            borderWidth: 1,
                            borderColor: messageData.location_id === location.id ? '#FF6B35' : '#DFE6E9',
                          }}
                          onPress={() => setMessageData({...messageData, location_id: location.id})}
                        >
                          <Text style={{ 
                            color: messageData.location_id === location.id ? '#FFF' : '#2D3436',
                            fontWeight: '600',
                            fontSize: 14,
                          }}>
                            {location.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>

              {/* Tipo de Política */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>Tipo de Política</Text>
                <View style={{ flexDirection: 'row' }}>
                  {['public', 'whitelist', 'blacklist'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={{
                        flex: 1,
                        padding: 12,
                        backgroundColor: messageData.policy_type === type ? '#FF6B35' : '#F8F9FA',
                        borderRadius: 8,
                        marginHorizontal: 4,
                        alignItems: 'center'
                      }}
                      onPress={() => setMessageData({...messageData, policy_type: type})}
                    >
                      <Text style={{ 
                        color: messageData.policy_type === type ? '#FFF' : '#2D3436',
                        fontWeight: '600',
                        fontSize: 12,
                      }}>
                        {type === 'public' ? 'Público' : type === 'whitelist' ? 'Lista Branca' : 'Lista Negra'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Regras de Política (apenas para whitelist/blacklist) */}
              {(messageData.policy_type === 'whitelist' || messageData.policy_type === 'blacklist') && (
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#2D3436', fontWeight: '600' }}>Regras de Política</Text>
                    <TouchableOpacity onPress={addPolicyRule} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="plus" size={16} color="#FF6B35" />
                      <Text style={{ color: '#FF6B35', fontWeight: '600', marginLeft: 4 }}>Adicionar Regra</Text>
                    </TouchableOpacity>
                  </View>

                  {messageData.policy_rules.map((rule, index) => (
                    <View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
                      <TextInput
                        style={{ flex: 1, borderWidth: 1, borderColor: '#DFE6E9', borderRadius: 8, padding: 8, marginRight: 8, fontSize: 14 }}
                        placeholder="Chave"
                        value={rule.key}
                        onChangeText={(text) => updatePolicyRule(index, 'key', text)}
                      />
                      <TextInput
                        style={{ flex: 1, borderWidth: 1, borderColor: '#DFE6E9', borderRadius: 8, padding: 8, marginRight: 8, fontSize: 14 }}
                        placeholder="Valor"
                        value={rule.value}
                        onChangeText={(text) => updatePolicyRule(index, 'value', text)}
                      />
                      <TouchableOpacity onPress={() => removePolicyRule(index)}>
                        <Icon name="delete" size={20} color="#E17055" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Botão Criar */}
              <TouchableOpacity
                style={{ 
                  backgroundColor: loading ? '#FFA07A' : '#FF6B35', 
                  padding: 16, 
                  borderRadius: 8, 
                  alignItems: 'center',
                  marginTop: 8,
                }}
                onPress={handleCreateMessage}
                disabled={loading}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                  {loading ? 'A criar...' : 'Criar Mensagem'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}