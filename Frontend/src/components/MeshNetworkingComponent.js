import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { relayService } from '../services/relayService';

const MeshNetworkingComponent = () => {
  const [bleManager] = useState(new BleManager());
  const [meshNodes, setMeshNodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentNodeId] = useState(Math.random().toString(36).substring(7));

  useEffect(() => {
    initializeMeshNode();
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  const initializeMeshNode = async () => {
    try {
      // Add current device as mesh node
      await relayService.addMeshNode({
        id: currentNodeId,
        name: `Device_${currentNodeId.slice(0, 6)}`,
        position: { latitude: 0, longitude: 0 }, // Would get from GPS
        capabilities: ['relay', 'storage']
      });

      // Load existing mesh nodes
      const nodes = await relayService.getMeshNetworkNodes();
      setMeshNodes(nodes);
    } catch (error) {
      console.error('Error initializing mesh node:', error);
    }
  };

  const startMeshDiscovery = async () => {
    setIsScanning(true);
    try {
      // Discover nearby devices via BLE
      bleManager.startDeviceScan(null, null, async (error, device) => {
        if (error) {
          console.error(error);
          setIsScanning(false);
          return;
        }

        // Add discovered device to mesh network
        const nodeId = `ble_${device.id}`;
        await relayService.addMeshNode({
          id: nodeId,
          name: device.name || `BLE_${device.id.slice(0, 6)}`,
          position: { latitude: 0, longitude: 0 }, // Would estimate based on signal strength
          capabilities: ['relay']
        });

        // Update connections
        const currentNode = meshNodes.find(n => n.id === currentNodeId);
        if (currentNode && !currentNode.connections.includes(nodeId)) {
          const updatedConnections = [...currentNode.connections, nodeId];
          await relayService.updateNodeConnections(currentNodeId, updatedConnections);
        }

        // Refresh mesh nodes
        const updatedNodes = await relayService.getMeshNetworkNodes();
        setMeshNodes(updatedNodes);
      });

      // Stop scanning after 15 seconds
      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }, 15000);
    } catch (error) {
      console.error('Error starting mesh discovery:', error);
      setIsScanning(false);
    }
  };

  const calculateRoute = async (targetNodeId) => {
    try {
      const route = await relayService.calculateRoute(currentNodeId, targetNodeId);
      if (route) {
        Alert.alert('Rota Calculada', `Rota: ${route.join(' -> ')}`);
      } else {
        Alert.alert('Erro', 'Nenhuma rota encontrada');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      Alert.alert('Erro', 'Falha ao calcular rota');
    }
  };

  const sendMessageViaMesh = async (targetNodeId, message) => {
    try {
      await relayService.queueMessageForRelay({
        content: message,
        from: currentNodeId,
        timestamp: new Date().toISOString()
      }, targetNodeId);

      // Process relay queue
      await relayService.processRelayQueue();

      Alert.alert('Sucesso', 'Mensagem enfileirada para retransmissão mesh');
    } catch (error) {
      console.error('Error sending mesh message:', error);
      Alert.alert('Erro', 'Falha ao enviar mensagem mesh');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Rede Mesh BLE - AnunciosLoc
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Nó Atual: {currentNodeId.slice(0, 8)}...
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Nós na Rede: {meshNodes.length}
      </Text>

      <Button
        title={isScanning ? "Parar Descoberta" : "Iniciar Descoberta Mesh"}
        onPress={isScanning ? () => bleManager.stopDeviceScan() : startMeshDiscovery}
      />

      <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>
        Nós da Rede Mesh:
      </Text>

      <FlatList
        data={meshNodes}
        keyExtractor={(item) => item.id}
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
                {item.name}
              </Text>
              <Text>ID: {item.id.slice(0, 8)}...</Text>
              <Text>Conexões: {item.connections?.length || 0}</Text>
              <Text>Última vez visto: {new Date(item.lastSeen).toLocaleTimeString()}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Button
                title="Calcular Rota"
                onPress={() => calculateRoute(item.id)}
              />
              <Button
                title="Enviar Msg"
                onPress={() => sendMessageViaMesh(item.id, 'Olá via Mesh!')}
              />
            </View>
          </View>
        )}
      />

      <Text style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
        Nota: Esta implementação usa BLE para formar uma rede mesh básica.
        Em produção, seria integrada com algoritmos de roteamento mais sofisticados.
      </Text>
    </View>
  );
};

export default MeshNetworkingComponent;