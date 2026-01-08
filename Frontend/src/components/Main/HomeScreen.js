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
import { messageService } from '../../services/api'; // CAMINHO CORRETO
import * as Location from 'expo-location';

export default function HomeScreen({ user, navigation, isDarkMode }) {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [savedMessages, setSavedMessages] = useState([]);

  const categories = [
    { name: 'Todas', icon: 'apps', color: '#FF6B35' },
    { name: 'Automóveis', icon: 'car', color: '#E74C3C' },
    { name: 'Imobiliário', icon: 'home', color: '#3498DB' },
    { name: 'Tecnologia', icon: 'laptop', color: '#9B59B6' },
    { name: 'Serviços', icon: 'tools', color: '#2ECC71' },
    { name: 'Emprego', icon: 'briefcase', color: '#F39C12' },
    { name: 'Educação', icon: 'school', color: '#1ABC9C' },
    { name: 'Desporto', icon: 'dumbbell', color: '#E67E22' },
    { name: 'Lazer', icon: 'palette', color: '#E91E63' },
  ];

  useEffect(() => {
    loadNearbyMessages();
    loadCurrentLocation();
    loadSavedMessages();
  }, []);

  useEffect(() => {
    filterMessagesByCategory();
  }, [messages, selectedCategory]);

  const loadCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Esta app precisa de acesso à localização');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadNearbyMessages = async () => {
    try {
      // Aguarda ter localização atual
      if (!currentLocation) {
        console.log('📍 Aguardando localização atual...');
        return;
      }

      console.log('📍 Buscando mensagens para localização:', currentLocation);
      
      const userLocation = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        wifi_ssids: []
      };

      const result = await messageService.getMessagesForUser(userLocation);
      
      if (result.success) {
        console.log(`✅ ${result.data?.length || 0} mensagens carregadas`);
        setMessages(result.data || []);
      } else {
        console.log('❌ API retornou erro, usando fallback local');
        loadLocalMessages();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens da API:', error);
      // Fallback para dados locais se a API falhar
      loadLocalMessages();
    }
  };

  const loadLocalMessages = async () => {
    try {
      console.log('📁 Carregando mensagens locais...');
      const messagesJSON = await AsyncStorage.getItem('anunciosloc-messages');
      const allMessages = messagesJSON ? JSON.parse(messagesJSON) : [];
      
      // Dados de exemplo para demonstração
      const sampleMessages = [
        {
          id: 1,
          title: 'Carro em bom estado',
          content: 'Vendo carro em excelente estado, baixo consumo, recentemente revisado. Ideal para cidade.',
          author_username: 'joao_silva',
          location_name: 'Lisboa Centro',
          category: 'Automóveis',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Apartamento T2',
          content: 'Apartamento T2 mobilado no centro de Lisboa. Próximo de transportes e comércio.',
          author_username: 'maria_santos',
          location_name: 'Lisboa',
          category: 'Imobiliário',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: 'Aulas de Programação',
          content: 'Dou aulas de programação para iniciantes. JavaScript, React, Node.js. Preço acessível.',
          author_username: 'carlos_tech',
          location_name: 'Online',
          category: 'Educação',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ];

      const availableMessages = allMessages.length > 0 ? 
        allMessages.filter(msg => msg.isActive !== false) : 
        sampleMessages;
      
      console.log(`📁 ${availableMessages.length} mensagens locais carregadas`);
      setMessages(availableMessages);
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens locais:', error);
    }
  };

  const loadSavedMessages = async () => {
    try {
      const savedJSON = await AsyncStorage.getItem('anunciosloc-saved-messages');
      const saved = savedJSON ? JSON.parse(savedJSON) : [];
      setSavedMessages(saved);
      console.log(`💾 ${saved.length} mensagens guardadas carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens guardadas:', error);
    }
  };

  const filterMessagesByCategory = () => {
    if (selectedCategory === 'Todas') {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(msg => msg.category === selectedCategory);
      setFilteredMessages(filtered);
    }
    console.log(`🎯 Filtro "${selectedCategory}": ${filteredMessages.length} mensagens`);
  };

  const onRefresh = async () => {
    console.log('🔄 Atualizando mensagens...');
    setRefreshing(true);
    await loadNearbyMessages();
    await loadSavedMessages();
    setRefreshing(false);
    console.log('✅ Atualização concluída');
  };

  const saveMessage = async (message) => {
    try {
      const isAlreadySaved = savedMessages.some(saved => saved.id === message.id);
      
      if (isAlreadySaved) {
        // Remover dos guardados
        const updatedSaved = savedMessages.filter(saved => saved.id !== message.id);
        setSavedMessages(updatedSaved);
        await AsyncStorage.setItem('anunciosloc-saved-messages', JSON.stringify(updatedSaved));
        Alert.alert('Sucesso', 'Mensagem removida dos guardados!');
        console.log('🗑️ Mensagem removida dos guardados');
      } else {
        // Adicionar aos guardados
        const updatedSaved = [...savedMessages, { ...message, savedAt: new Date().toISOString() }];
        setSavedMessages(updatedSaved);
        await AsyncStorage.setItem('anunciosloc-saved-messages', JSON.stringify(updatedSaved));
        Alert.alert('Sucesso', 'Mensagem guardada com sucesso!');
        console.log('💾 Mensagem guardada');
      }
    } catch (error) {
      console.error('❌ Erro ao guardar mensagem:', error);
      Alert.alert('Erro', 'Erro ao guardar mensagem');
    }
  };

  const isMessageSaved = (messageId) => {
    return savedMessages.some(saved => saved.id === messageId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Automóveis': 'car',
      'Imobiliário': 'home',
      'Tecnologia': 'laptop',
      'Serviços': 'tools',
      'Emprego': 'briefcase',
      'Educação': 'school',
      'Desporto': 'dumbbell',
      'Lazer': 'palette'
    };
    return icons[category] || 'tag';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Automóveis': '#E74C3C',
      'Imobiliário': '#3498DB',
      'Tecnologia': '#9B59B6',
      'Serviços': '#2ECC71',
      'Emprego': '#F39C12',
      'Educação': '#1ABC9C',
      'Desporto': '#E67E22',
      'Lazer': '#E91E63'
    };
    return colors[category] || '#636E72';
  };

  // Estilos dinâmicos baseados no tema
  const styles = {
    container: { 
      flex: 1, 
      backgroundColor: isDarkMode ? '#121212' : '#F8F9FA' 
    },
    welcomeCard: { 
      backgroundColor: '#FF6B35', 
      borderRadius: 16, 
      padding: 20, 
      marginBottom: 16 
    },
    filterCard: { 
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF', 
      borderRadius: 16, 
      padding: 16, 
      marginBottom: 16, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: isDarkMode ? 0.3 : 0.1, 
      shadowRadius: 3.84, 
      elevation: 3 
    },
    messagesCard: { 
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF', 
      borderRadius: 16, 
      padding: 20, 
      marginBottom: 16, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: isDarkMode ? 0.3 : 0.1, 
      shadowRadius: 3.84, 
      elevation: 3 
    },
    messageItem: { 
      padding: 16, 
      borderBottomWidth: 1, 
      borderBottomColor: isDarkMode ? '#333' : '#F1F2F6',
      marginBottom: 12,
      backgroundColor: isDarkMode ? '#2D2D2D' : '#F8F9FA',
      borderRadius: 12,
    },
    textPrimary: { 
      color: isDarkMode ? '#FFF' : '#2D3436',
      fontSize: 16
    },
    textSecondary: { 
      color: isDarkMode ? '#AAA' : '#636E72',
      fontSize: 14
    },
    categoryFilter: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: isDarkMode ? '#2D2D2D' : '#F8F9FA',
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#DFE6E9',
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryFilterSelected: {
      backgroundColor: '#FF6B35',
      borderColor: '#FF6B35',
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor={isDarkMode ? '#FFF' : '#FF6B35'}
          />
        }
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 }}>
            Bem-vindo, {user?.name || user?.username || 'Utilizador'}!
          </Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 12 }}>
            Mensagens baseadas na sua localização
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ 
              width: 8, 
              height: 8, 
              borderRadius: 4, 
              backgroundColor: '#00B894',
              marginRight: 8 
            }} />
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              {filteredMessages.length} mensagens {selectedCategory !== 'Todas' ? `em ${selectedCategory}` : 'disponíveis'}
            </Text>
          </View>

          {currentLocation && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="map-marker" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={{ color: 'rgba(255,255,255,0.9)', marginLeft: 8 }}>
                {`${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
              </Text>
            </View>
          )}
        </View>

        {/* Categories Filter */}
        <View style={styles.filterCard}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: styles.textPrimary.color, marginBottom: 12 }}>
            Filtrar por Categoria
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', paddingVertical: 4 }}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    selectedCategory === category.name 
                      ? [styles.categoryFilterSelected, { backgroundColor: category.color, borderColor: category.color }]
                      : styles.categoryFilter
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Icon 
                    name={category.icon} 
                    size={16} 
                    color={selectedCategory === category.name ? '#FFF' : category.color} 
                  />
                  <Text style={{ 
                    color: selectedCategory === category.name ? '#FFF' : styles.textPrimary.color,
                    fontWeight: '600',
                    fontSize: 14,
                    marginLeft: 6,
                  }}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Messages List */}
        <View style={styles.messagesCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: styles.textPrimary.color }}>
              {selectedCategory === 'Todas' ? 'Mensagens Próximas' : `Mensagens em ${selectedCategory}`}
            </Text>
            <TouchableOpacity onPress={onRefresh}>
              <Icon name="refresh" size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          {filteredMessages.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Icon name="tag-off" size={48} color={isDarkMode ? '#444' : '#DFE6E9'} />
              <Text style={{ color: styles.textSecondary.color, textAlign: 'center', marginTop: 12 }}>
                {selectedCategory === 'Todas' ? 'Nenhuma mensagem disponível' : `Nenhuma mensagem em ${selectedCategory}`}
              </Text>
              <Text style={{ color: styles.textSecondary.color, textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                {selectedCategory !== 'Todas' && 'Tente mudar de categoria'}
              </Text>
            </View>
          ) : (
            filteredMessages.map((message) => (
              <View key={message.id} style={styles.messageItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ 
                      backgroundColor: getCategoryColor(message.category), 
                      paddingHorizontal: 8, 
                      paddingVertical: 4, 
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Icon name={getCategoryIcon(message.category)} size={12} color="#FFF" />
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '600', marginLeft: 4 }}>
                        {message.category}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity 
                      onPress={() => saveMessage(message)}
                      style={{ marginLeft: 8 }}
                    >
                      <Icon 
                        name={isMessageSaved(message.id) ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={isMessageSaved(message.id) ? "#FF6B35" : styles.textSecondary.color} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={{ fontWeight: 'bold', color: styles.textPrimary.color, marginBottom: 8, fontSize: 16 }}>
                  {message.title}
                </Text>

                <Text style={{ color: styles.textPrimary.color, marginBottom: 12, lineHeight: 20, fontSize: 15 }}>
                  {message.content}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="account" size={14} color={styles.textSecondary.color} />
                    <Text style={{ color: styles.textSecondary.color, fontSize: 12, marginLeft: 4 }}>
                      {message.author_username}
                    </Text>
                  </View>
                  <Text style={{ color: styles.textSecondary.color, fontSize: 12 }}>
                    {formatTime(message.created_at)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Icon name="map-marker" size={14} color={styles.textSecondary.color} />
                  <Text style={{ color: styles.textSecondary.color, fontSize: 12, marginLeft: 4 }}>
                    {message.location_name}
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