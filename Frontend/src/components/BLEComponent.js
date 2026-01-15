import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const BLEComponent = () => {
  const [bleManager] = useState(new BleManager());
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  const startScan = () => {
    setScanning(true);
    setDevices([]);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        setScanning(false);
        return;
      }

      // Adicionar dispositivo à lista se não existir
      setDevices(prevDevices => {
        if (!prevDevices.find(d => d.id === device.id)) {
          return [...prevDevices, device];
        }
        return prevDevices;
      });
    });

    // Parar scan após 10 segundos
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  const stopScan = () => {
    bleManager.stopDeviceScan();
    setScanning(false);
  };

  const connectToDevice = async (device) => {
    try {
      const connectedDevice = await bleManager.connectToDevice(device.id);
      console.log('Conectado a:', connectedDevice.name);
      // Aqui você pode implementar descoberta de serviços e características
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Descoberta BLE - AnunciosLoc
      </Text>

      <Button
        title={scanning ? "Parar Scan" : "Iniciar Scan BLE"}
        onPress={scanning ? stopScan : startScan}
      />

      <Text style={{ marginTop: 20, marginBottom: 10 }}>
        Dispositivos encontrados: {devices.length}
      </Text>

      <FlatList
        data={devices}
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
            <View>
              <Text style={{ fontWeight: 'bold' }}>
                {item.name || 'Dispositivo sem nome'}
              </Text>
              <Text>{item.id}</Text>
              <Text>RSSI: {item.rssi}</Text>
            </View>
            <Button
              title="Conectar"
              onPress={() => connectToDevice(item)}
            />
          </View>
        )}
      />
    </View>
  );
};

export default BLEComponent;