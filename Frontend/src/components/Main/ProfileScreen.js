import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { profileService, messageService, locationService } from '../services/api';

export default function ProfileScreen({ user, onLogout }) {
  const [profileData, setProfileData] = useState(user);
  const [profileKeys, setProfileKeys] = useState([]);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState({ key: '', value: '' });
  const [stats, setStats] = useState({
    messagesSent: 0,
    messagesReceived: 0,
    locationsCreated: 0
  });

  useEffect(() => {
    loadProfileData();
    loadStats();
  }, []);

  const loadProfileData = async () => {
    try {
      const result = await profileService.getUserProfile(user.id);
      if (result.success) {
        setProfileKeys(result.data?.keys || []);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Carregar estatísticas de mensagens enviadas
      const sentResult = await messageService.getSentMessages(user.id);
      const messagesSent = sentResult.success ? (sentResult.data?.length || 0) : 0;

      // Carregar estatísticas de mensagens recebidas
      const receivedResult = await messageService.getUserMessages(user.id);
      const messagesReceived = receivedResult.success ? (receivedResult.data?.length || 0) : 0;

      // Carregar estatísticas de localizações
      const locationsResult = await locationService.getUserLocations(user.id);
      const locationsCreated = locationsResult.success ? (locationsResult.data?.length || 0) : 0;

      setStats({
        messagesSent,
        messagesReceived,
        locationsCreated
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddKey = async () => {
    if (!newKey.key || !newKey.value) {
      Alert.alert('Erro', 'Por favor, preencha ambos os campos');
      return;
    }

    try {
      const result = await profileService.addKeyValue(user.id, newKey.key, newKey.value);
      if (result.success) {
        setProfileKeys([...profileKeys, { key: newKey.key, value: newKey.value }]);
        setShowKeyModal(false);
        setNewKey({ key: '', value: '' });
        Alert.alert('Sucesso', 'Chave adicionada com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const deleteKey = async (keyToDelete) => {
    Alert.alert(
      'Eliminar Chave',
      'Tem a certeza que pretende eliminar esta chave?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await profileService.removeKey(user.id, keyToDelete);
              if (result.success) {
                setProfileKeys(profileKeys.filter(k => k.key !== keyToDelete));
                Alert.alert('Sucesso', 'Chave eliminada com sucesso!');
              }
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Profile Info Card */}
        <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3436', marginBottom: 16 }}>Meu Perfil</Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#636E72', fontSize: 14, marginBottom: 4 }}>Username</Text>
            <Text style={{ color: '#2D3436', fontSize: 16, fontWeight: '600' }}>@{profileData.username}</Text>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#636E72', fontSize: 14, marginBottom: 4 }}>ID</Text>
            <Text style={{ color: '#2D3436', fontSize: 16, fontWeight: '600' }}>{profileData.id}</Text>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#636E72', fontSize: 14, marginBottom: 4 }}>Data de Registo</Text>
            <Text style={{ color: '#2D3436', fontSize: 16, fontWeight: '600' }}>
              {formatDate(profileData.created_at)}
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3436', marginBottom: 16 }}>Estatísticas</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{ backgroundColor: '#FF6B35', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="send" size={24} color="#FFF" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3436' }}>{stats.messagesSent}</Text>
              <Text style={{ fontSize: 12, color: '#636E72' }}>Enviadas</Text>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{ backgroundColor: '#3498DB', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="email" size={24} color="#FFF" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3436' }}>{stats.messagesReceived}</Text>
              <Text style={{ fontSize: 12, color: '#636E72' }}>Recebidas</Text>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{ backgroundColor: '#2ECC71', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="map-marker" size={24} color="#FFF" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3436' }}>{stats.locationsCreated}</Text>
              <Text style={{ fontSize: 12, color: '#636E72' }}>Locais</Text>
            </View>
          </View>
        </View>

        {/* Profile Keys Card */}
        <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3436' }}>Chaves de Perfil</Text>
            <TouchableOpacity onPress={() => setShowKeyModal(true)}>
              <Icon name="plus" size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          {profileKeys.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Icon name="key-variant" size={48} color="#DFE6E9" />
              <Text style={{ color: '#636E72', textAlign: 'center', marginTop: 12 }}>
                Nenhuma chave adicionada
              </Text>
              <Text style={{ color: '#636E72', textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                Adicione chaves para personalizar o recebimento de mensagens
              </Text>
            </View>
          ) : (
            profileKeys.map((keyItem, index) => (
              <View key={index} style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F2F6',
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#2D3436', fontWeight: '600' }}>{keyItem.key}</Text>
                  <Text style={{ color: '#636E72', fontSize: 14 }}>{keyItem.value}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteKey(keyItem.key)}>
                  <Icon name="delete" size={20} color="#E17055" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={{ backgroundColor: '#DFE6E9', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 32 }}
          onPress={onLogout}
        >
          <Text style={{ color: '#2D3436', fontSize: 16, fontWeight: 'bold' }}>🚪 Terminar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Key Modal */}
      <Modal
        visible={showKeyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowKeyModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3436' }}>
                Adicionar Chave de Perfil
              </Text>
              <TouchableOpacity onPress={() => setShowKeyModal(false)}>
                <Icon name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>Chave</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#DFE6E9', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FFF' }}
                placeholder="ex: profissao, interesses, idade"
                value={newKey.key}
                onChangeText={(text) => setNewKey({...newKey, key: text})}
              />
            </View>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>Valor</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#DFE6E9', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FFF' }}
                placeholder="ex: estudante, tecnologia, 25"
                value={newKey.value}
                onChangeText={(text) => setNewKey({...newKey, value: text})}
              />
            </View>
            
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 16, backgroundColor: '#DFE6E9', borderRadius: 8, marginRight: 8, alignItems: 'center' }}
                onPress={() => setShowKeyModal(false)}
              >
                <Text style={{ color: '#2D3436', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 16, backgroundColor: '#FF6B35', borderRadius: 8, marginLeft: 8, alignItems: 'center' }}
                onPress={handleAddKey}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}