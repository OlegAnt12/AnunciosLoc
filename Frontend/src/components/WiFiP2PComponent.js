import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, PermissionsAndroid, Platform, TextInput } from 'react-native';
// import WifiP2P from 'react-native-wifi-p2p'; // Uncomment when library is installed
import { useAuth } from '../contexts/AuthContext';

const WiFiP2PComponent = () => {
  const [peers, setPeers] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedPeer, setConnectedPeer] = useState(null);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [messageToSend, setMessageToSend] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    initializeWifiP2P();
  }, []);

  const initializeWifiP2P = async () => {
    try {
      // Request necessary permissions for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE,
          PermissionsAndroid.PERMISSIONS.CHANGE_WIFI_STATE,
        ]);

        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert('Permissões necessárias', 'Permissões de localização e Wi-Fi são necessárias para Wi-Fi Direct');
          return;
        }
      }

      // Initialize Wi-Fi P2P (would use library when installed)
      // WifiP2P.initialize();
      // WifiP2P.setDeviceName('AnunciosLoc_Device');

      console.log('Wi-Fi P2P initialized (placeholder)');
    } catch (error) {
      console.error('Error initializing Wi-Fi P2P:', error);
    }
  };

  const startPeerDiscovery = async () => {
    try {
      setIsDiscovering(true);
      setPeers([]);

      // Start peer discovery (would use library when installed)
      // await WifiP2P.discoverPeers();

      // Simulate peer discovery for demonstration
      setTimeout(() => {
        const mockPeers = [
          { deviceAddress: 'AA:BB:CC:DD:EE:01', deviceName: 'Device_1', isGroupOwner: false },
          { deviceAddress: 'AA:BB:CC:DD:EE:02', deviceName: 'Device_2', isGroupOwner: true },
          { deviceAddress: 'AA:BB:CC:DD:EE:03', deviceName: 'Device_3', isGroupOwner: false },
        ];
        setPeers(mockPeers);
        setIsDiscovering(false);
      }, 3000);

    } catch (error) {
      console.error('Error starting peer discovery:', error);
      setIsDiscovering(false);
      Alert.alert('Erro', 'Falha ao descobrir peers');
    }
  };

  const stopPeerDiscovery = async () => {
    try {
      // Stop peer discovery (would use library when installed)
      // await WifiP2P.stopPeerDiscovery();
      setIsDiscovering(false);
      console.log('Peer discovery stopped');
    } catch (error) {
      console.error('Error stopping peer discovery:', error);
    }
  };

  const connectToPeer = async (peer) => {
    try {
      // Connect to peer (would use library when installed)
      // await WifiP2P.connect(peer.deviceAddress);

      Alert.alert('Conectado', `Conectado a ${peer.deviceName}`);
      setConnected(true);
      console.log('Connected to peer:', peer);
    } catch (error) {
      console.error('Error connecting to peer:', error);
      Alert.alert('Erro', 'Falha ao conectar ao peer');
    }
  };

  const sendMessageToPeer = async (peer, message) => {
    try {
      // Send message to peer (would use library when installed)
      // await WifiP2P.sendMessage(peer.deviceAddress, message);

      Alert.alert('Mensagem enviada', `Mensagem enviada para ${peer.deviceName}`);
      console.log('Message sent to peer:', peer, message);
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
        Nota: Compartilhamento de mensagens P2P via Wi-Fi Direct. Instale 'react-native-wifi-p2p' para funcionalidade completa.
      </Text>
    </View>
  );
};

export default WiFiP2PComponent;