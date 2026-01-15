import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, PermissionsAndroid, Platform } from 'react-native';
// import WifiP2P from 'react-native-wifi-p2p'; // Uncomment when library is installed

const WiFiP2PComponent = () => {
  const [peers, setPeers] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isWifiEnabled, setIsWifiEnabled] = useState(false);

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

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Wi-Fi Direct P2P - AnunciosLoc
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Status: {isWifiEnabled ? 'Wi-Fi P2P Ativo' : 'Wi-Fi P2P Inativo'}
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

      <Text style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
        Nota: Esta é uma implementação placeholder. Instale 'react-native-wifi-p2p' para funcionalidade completa.
      </Text>
    </View>
  );
};

export default WiFiP2PComponent;
    // WifiP2P.stopPeerDiscovery();
    setDiscovering(false);
  };

  const connectToPeer = async (peer) => {
    try {
      // Placeholder for connection
      // await WifiP2P.connect(peer.deviceAddress);
      Alert.alert('Conectado', `Conectado a ${peer.deviceName}`);
      setConnected(true);
    } catch (error) {
      console.error('Error connecting to peer:', error);
      Alert.alert('Erro', 'Falha ao conectar');
    }
  };

  const sendMessage = async (message) => {
    if (!connected) {
      Alert.alert('Erro', 'Não conectado a nenhum dispositivo');
      return;
    }

    try {
      // Placeholder for sending message
      // await WifiP2P.sendData(message);
      Alert.alert('Sucesso', 'Mensagem enviada via Wi-Fi P2P');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erro', 'Falha ao enviar mensagem');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Wi-Fi Direct P2P - AnunciosLoc
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Status: {connected ? 'Conectado' : 'Desconectado'}
      </Text>

      <Button
        title={discovering ? "Parar Descoberta" : "Iniciar Descoberta de Peers"}
        onPress={discovering ? stopDiscovery : startDiscovery}
      />

      <Text style={{ marginTop: 20, marginBottom: 10 }}>
        Peers descobertos: {peers.length}
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
            <View>
              <Text style={{ fontWeight: 'bold' }}>
                {item.deviceName}
              </Text>
              <Text>{item.deviceAddress}</Text>
            </View>
            <Button
              title="Conectar"
              onPress={() => connectToPeer(item)}
            />
          </View>
        )}
      />

      {connected && (
        <View style={{ marginTop: 20 }}>
          <Button
            title="Enviar Mensagem de Teste"
            onPress={() => sendMessage('Olá via Wi-Fi P2P!')}
          />
        </View>
      )}

      <Text style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
        Nota: Esta é uma implementação placeholder. Requer biblioteca react-native-wifi-p2p para funcionalidade completa.
      </Text>
    </View>
  );
};

export default WiFiP2PComponent;