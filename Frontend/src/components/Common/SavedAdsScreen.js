import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function SavedAdsScreen({ user }) {
  const [savedMessages, setSavedMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavedMessages();
  }, []);

  const loadSavedMessages = async () => {
    try {
      const savedJSON = await AsyncStorage.getItem('anunciosloc-saved-messages');
      const saved = savedJSON ? JSON.parse(savedJSON) : [];
      setSavedMessages(saved);
    } catch (error) {
      console.error('Error loading saved messages:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedMessages();
    setRefreshing(false);
  };

  const removeSavedMessage = async (messageId) => {
    Alert.alert(
      'Remover dos Guardados',
      'Tem a certeza que pretende remover esta mensagem dos guardados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedSaved = savedMessages.filter(msg => msg.id !== messageId);
              setSavedMessages(updatedSaved);
              await AsyncStorage.setItem('anunciosloc-saved-messages', JSON.stringify(updatedSaved));
              Alert.alert('Sucesso', 'Mensagem removida dos guardados!');
            } catch (error) {
              console.error('Error removing saved message:', error);
              Alert.alert('Erro', 'Erro ao remover mensagem');
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

  const formatSavedDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3436', marginBottom: 16 }}>Mensagens Guardadas</Text>
          
          {savedMessages.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Icon name="bookmark-outline" size={48} color="#DFE6E9" />
              <Text style={{ color: '#636E72', textAlign: 'center', marginTop: 12 }}>
                Nenhuma mensagem guardada
              </Text>
              <Text style={{ color: '#636E72', textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                Guarde mensagens interessantes para as ver mais tarde
              </Text>
            </View>
          ) : (
            savedMessages.map((message) => (
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
                  </View>
                  <TouchableOpacity onPress={() => removeSavedMessage(message.id)}>
                    <Icon name="bookmark" size={20} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
                
                <Text style={{ color: '#2D3436', marginBottom: 12, lineHeight: 20 }}>
                  {message.content}
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#636E72', fontSize: 12 }}>
                    Por: {message.author_username}
                  </Text>
                  <Text style={{ color: '#636E72', fontSize: 12 }}>
                    {formatDateTime(message.created_at)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="bookmark" size={12} color="#FF6B35" />
                    <Text style={{ color: '#FF6B35', fontSize: 10, marginLeft: 4 }}>
                      Guardado em {formatSavedDate(message.savedAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}