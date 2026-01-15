import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, PermissionsAndroid, Platform, TextInput } from 'react-native';
// Try to import WiFi P2P libraries
let WifiP2P = null;
let WifiP2PReborn = null;

try {
  WifiP2P = require('react-native-wifi-p2p').default;
} catch (e) {
  console.log('react-native-wifi-p2p not available');
}

try {
  WifiP2PReborn = require('react-native-wifi-p2p-reborn').default;
} catch (e) {
  console.log('react-native-wifi-p2p-reborn not available');
}

import { useAuth } from '../contexts/AuthContext';

const WiFiP2PComponent = () => {
  const [peers, setPeers] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedPeer, setConnectedPeer] = useState(null);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [messageToSend, setMessageToSend] = useState('');
  const [libraryAvailable, setLibraryAvailable] = useState(null);
  const [currentLibrary, setCurrentLibrary] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeWifiP2P();
  }, []);

  const setupEventListeners = (library, libraryName) => {
    try {
      if (libraryName === 'react-native-wifi-p2p-reborn') {
        // Event listeners for reborn library
        library.on('peers', (peers) => {
          console.log('Peers found (reborn):', peers);
          setPeers(peers);
        });

        library.on('connection', (device) => {
          console.log('Connected to device (reborn):', device);
          setConnected(true);
          setConnectedPeer(device);
        });

        library.on('disconnection', () => {
          console.log('Disconnected (reborn)');
          setConnected(false);
          setConnectedPeer(null);
        });

        library.on('message', (message) => {
          console.log('Message received (reborn):', message);
          handleReceivedMessage(message);
        });

      } else if (libraryName === 'react-native-wifi-p2p') {
        // Event listeners for original library
        library.onPeersChanged((peers) => {
          console.log('Peers changed (original):', peers);
          setPeers(peers);
        });

        library.onConnectionChanged((info) => {
          console.log('Connection changed (original):', info);
          if (info.connected) {
            setConnected(true);
            setConnectedPeer(info.device);
          } else {
            setConnected(false);
            setConnectedPeer(null);
          }
        });

        library.onMessageReceived((message) => {
          console.log('Message received (original):', message);
          handleReceivedMessage(message);
        });
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  };

  const handleReceivedMessage = (message) => {
    try {
      let messageData;

      if (typeof message === 'string') {
        messageData = JSON.parse(message);
      } else if (message.data) {
        messageData = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
      } else {
        messageData = message;
      }

      if (messageData.type === 'p2p_message') {
        setReceivedMessages(prev => [...prev, messageData]);
        Alert.alert('Mensagem Recebida', `Nova mensagem de ${messageData.senderUsername}`);
      }
    } catch (error) {
      console.error('Error handling received message:', error);
    }
  };

  const startPeerDiscovery = async () => {
    try {
      setIsDiscovering(true);
      setPeers([]);

      if (libraryAvailable && currentLibrary) {
        // Use real library
        const library = currentLibrary === 'react-native-wifi-p2p-reborn' ? WifiP2PReborn : WifiP2P;

        if (currentLibrary === 'react-native-wifi-p2p-reborn') {
          await library.discoverPeers();
        } else {
          await library.startPeerDiscovery();
        }
        console.log('Peer discovery started with real library');
      } else {
        // Fallback to simulation
        console.log('Using simulation mode for peer discovery');
        setTimeout(() => {
          const mockPeers = [
            { deviceAddress: 'AA:BB:CC:DD:EE:01', deviceName: 'Device_1', isGroupOwner: false },
            { deviceAddress: 'AA:BB:CC:DD:EE:02', deviceName: 'Device_2', isGroupOwner: true },
            { deviceAddress: 'AA:BB:CC:DD:EE:03', deviceName: 'Device_3', isGroupOwner: false },
          ];
          setPeers(mockPeers);
          setIsDiscovering(false);
        }, 3000);
      }

    } catch (error) {
      console.error('Error starting peer discovery:', error);
      setIsDiscovering(false);
      Alert.alert('Erro', 'Falha ao descobrir peers');
    }
  };

  const stopPeerDiscovery = async () => {
    try {
      if (libraryAvailable && currentLibrary) {
        const library = currentLibrary === 'react-native-wifi-p2p-reborn' ? WifiP2PReborn : WifiP2P;

        if (currentLibrary === 'react-native-wifi-p2p-reborn') {
          await library.stopPeerDiscovery();
        } else {
          await library.stopPeerDiscovery();
        }
      }
      setIsDiscovering(false);
      console.log('Peer discovery stopped');
    } catch (error) {
      console.error('Error stopping peer discovery:', error);
    }
  };

  const connectToPeer = async (peer) => {
    try {
      if (libraryAvailable && currentLibrary) {
        const library = currentLibrary === 'react-native-wifi-p2p-reborn' ? WifiP2PReborn : WifiP2P;

        if (currentLibrary === 'react-native-wifi-p2p-reborn') {
          await library.connect(peer.deviceAddress);
        } else {
          await library.connect(peer.deviceAddress);
        }
        console.log('Connected to peer with real library');
      } else {
        // Simulation mode
        Alert.alert('Conectado', `Conectado a ${peer.deviceName} (simulação)`);
        setConnected(true);
        setConnectedPeer(peer);
      }
    } catch (error) {
      console.error('Error connecting to peer:', error);
      Alert.alert('Erro', 'Falha ao conectar ao peer');
    }
  };

  const sendMessageToPeer = async (peer, message) => {
    try {
      if (libraryAvailable && currentLibrary && connected) {
        const library = currentLibrary === 'react-native-wifi-p2p-reborn' ? WifiP2PReborn : WifiP2P;

        if (currentLibrary === 'react-native-wifi-p2p-reborn') {
          await library.sendMessage(message);
        } else {
          await library.sendMessage(peer.deviceAddress, message);
        }
        console.log('Message sent with real library');
      } else {
        // Simulation mode
        Alert.alert('Mensagem enviada', `Mensagem enviada para ${peer.deviceName} (simulação)`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erro', 'Falha ao enviar mensagem');
    }
  };

  const sharePublicProfile = async () => {
    if (!connected || !connectedPeer || !user) {
      Alert.alert('Erro', 'Não conectado ou usuário não autenticado');
      return;
    }

    const publicProfile = {
      id: user.id,
      username: user.username,
      location: user.location || null, // Assuming location is stored
      timestamp: new Date().toISOString(),
    };

    try {
      // Send profile to connected peer
      await sendMessageToPeer(connectedPeer, JSON.stringify({
        type: 'public_profile',
        data: publicProfile
      }));
      Alert.alert('Sucesso', 'Perfil público compartilhado');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao compartilhar perfil');
    }
  };

  const shareMessage = async () => {
    if (!connected || !connectedPeer || !user) {
      Alert.alert('Erro', 'Não conectado ou usuário não autenticado');
      return;
    }

    if (!messageToSend.trim()) {
      Alert.alert('Erro', 'Digite uma mensagem para compartilhar');
      return;
    }

    const messageData = {
      id: Date.now(), // Simple ID for demo
      senderId: user.id,
      senderUsername: user.username,
      content: messageToSend.trim(),
      timestamp: new Date().toISOString(),
      type: 'p2p_message'
    };

    try {
      // Send message to connected peer
      await sendMessageToPeer(connectedPeer, JSON.stringify(messageData));
      Alert.alert('Sucesso', 'Mensagem compartilhada via P2P');
      setMessageToSend(''); // Clear input
    } catch (error) {
      Alert.alert('Erro', 'Falha ao compartilhar mensagem');
    }
  };

  const simulateReceiveMessage = () => {
    // Simulate receiving a message for demo
    const mockMessage = {
      id: Date.now(),
      senderId: 999,
      senderUsername: 'PeerUser',
      content: 'Olá! Esta é uma mensagem P2P simulada.',
      timestamp: new Date().toISOString(),
      type: 'p2p_message'
    };
    setReceivedMessages(prev => [...prev, mockMessage]);
    Alert.alert('Mensagem Recebida', `Nova mensagem de ${mockMessage.senderUsername}`);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Mensagens P2P - Wi-Fi Direct
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Status: {connected ? 'Conectado' : 'Desconectado'}
      </Text>

      <Text style={{ marginBottom: 10, fontSize: 12, color: libraryAvailable ? '#28a745' : '#dc3545' }}>
        Biblioteca: {libraryAvailable ? `${currentLibrary} (Disponível)` : 'Simulação (Biblioteca não instalada)'}
      </Text>

      <Button
        title={isDiscovering ? "Parar Descoberta" : "Iniciar Descoberta de Peers"}
        onPress={isDiscovering ? stopPeerDiscovery : startPeerDiscovery}
      />

      <Text style={{ marginTop: 20, marginBottom: 10 }}>
        Peers encontrados: {peers.length}
      </Text>

      <FlatList
        data={peers}
        keyExtractor={(item) => item.deviceAddress}
        renderItem={({ item }) => (
          <View style={{
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold' }}>
                {item.deviceName}
              </Text>
              <Text>{item.deviceAddress}</Text>
              <Text>Group Owner: {item.isGroupOwner ? 'Sim' : 'Não'}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Button
                title="Conectar"
                onPress={() => connectToPeer(item)}
              />
              <Button
                title="Enviar Msg"
                onPress={() => sendMessageToPeer(item, 'Olá via Wi-Fi Direct!')}
              />
            </View>
          </View>
        )}
      />

      {connected && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Compartilhar Mensagens P2P
          </Text>
          
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 5 }}>
              Digite sua mensagem:
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                backgroundColor: '#fff'
              }}
              placeholder="Digite sua mensagem..."
              value={messageToSend}
              onChangeText={setMessageToSend}
              multiline
              numberOfLines={3}
            />
            <Button
              title="Enviar Mensagem P2P"
              onPress={shareMessage}
              disabled={!messageToSend.trim()}
            />
          </View>
          
          <View style={{ marginTop: 15 }}>
            <Button
              title="Simular Receber Mensagem"
              onPress={simulateReceiveMessage}
            />
          </View>
        </View>
      )}

      {receivedMessages.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Mensagens Recebidas P2P:
          </Text>
          <FlatList
            data={receivedMessages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{
                padding: 10,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                marginBottom: 10,
                backgroundColor: '#f0f8ff'
              }}>
                <Text style={{ fontWeight: 'bold', color: '#FF6B35' }}>
                  @{item.senderUsername}
                </Text>
                <Text style={{ marginTop: 5 }}>{item.content}</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                  Recebido em: {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            )}
          />
        </View>
      )}

      <Text style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
        Suporte a bibliotecas: react-native-wifi-p2p e react-native-wifi-p2p-reborn.
        {libraryAvailable ? ' Funcionalidade completa disponível.' : ' Modo simulação ativo - instale uma das bibliotecas para funcionalidade completa.'}
      </Text>
    </View>
  );
};

export default WiFiP2PComponent;