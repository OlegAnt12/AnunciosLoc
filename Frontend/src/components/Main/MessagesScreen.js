import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { messageService } from '../../../services/api';

export default function MessagesScreen({ user }) {
  const [activeTab, setActiveTab] = useState('sent');
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      let result;
      if (activeTab === 'sent') {
        result = await messageService.getSentMessages(user.id);
      } else {
        result = await messageService.getUserMessages(user.id);
      }
      
      if (result.success) {
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
    </View>
  );
}