import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { locationService } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function LiveLocationMap({ user, showUserLocation = true }) {
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 38.736946,
    longitude: -9.142685,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [locations, setLocations] = useState([]);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Solicitar permissões de localização
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permissão para aceder à localização foi negada');
          return;
        }

        // Obter localização atual
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        setUserLocation(location.coords);
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Carregar localizações do usuário
        loadUserLocations();

        // Iniciar atualizações em tempo real
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Atualizar a cada 5 segundos
            distanceInterval: 10, // Atualizar a cada 10 metros
          },
          (newLocation) => {
            const { latitude, longitude, heading } = newLocation.coords;
            setUserLocation(newLocation.coords);
            setRegion(prev => ({
              ...prev,
              latitude,
              longitude,
            }));
          }
        );

        setLocationSubscription(subscription);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Erro ao obter localização');
      }
    })();

    // Cleanup function
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const loadUserLocations = async () => {
    try {
      if (!user?.id) return;
      
      const result = await locationService.getUserLocations(user.id);
      if (result.success) {
        setLocations(result.data || []);
      }
    } catch (error) {
      console.error('Error loading user locations:', error);
    }
  };

  // Renderizar mensagem de erro se houver
  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="map-marker-off" size={48} color="#DFE6E9" />
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  // Renderizar loading enquanto obtém localização
  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="crosshairs-gps" size={48} color="#FF6B35" />
        <Text style={styles.loadingText}>A obter localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomControlEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
      >
        {/* Marcador personalizado para localização do usuário */}
        {showUserLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="A sua localização"
            description="Está aqui agora"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userLocationMarker}>
              <Icon name="navigation" size={24} color="#FF6B35" />
              <View style={styles.pulseCircle} />
            </View>
          </Marker>
        )}

        {/* Mostrar heading/direção se disponível */}
        {showUserLocation && userLocation.heading && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={userLocation.heading}
            flat={true}
          >
            <View style={styles.directionArrow}>
              <Icon name="triangle" size={16} color="#FF6B35" />
            </View>
          </Marker>
        )}

        {/* Círculo de precisão da localização */}
        {showUserLocation && userLocation.accuracy && (
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={userLocation.accuracy}
            strokeColor="rgba(0, 150, 255, 0.3)"
            fillColor="rgba(0, 150, 255, 0.1)"
            strokeWidth={1}
          />
        )}

        {/* Renderizar locais do usuário */}
        {locations.map((location) => (
          location.latitude && location.longitude && (
            <React.Fragment key={location.id}>
              <Marker
                coordinate={{
                  latitude: parseFloat(location.latitude),
                  longitude: parseFloat(location.longitude),
                }}
                title={location.name}
                description={`Raio: ${location.radius}m`}
              >
                <View style={styles.locationMarker}>
                  <Icon name="map-marker" size={20} color="#FFF" />
                </View>
              </Marker>
              <Circle
                center={{
                  latitude: parseFloat(location.latitude),
                  longitude: parseFloat(location.longitude),
                }}
                radius={location.radius}
                strokeColor="#FF6B35"
                fillColor="rgba(255,107,53,0.2)"
                strokeWidth={2}
              />
            </React.Fragment>
          )
        ))}
      </MapView>

      {/* Botão para centralizar no usuário */}
      {showUserLocation && (
        <View style={styles.controlsContainer}>
          <Text style={styles.locationInfo}>
            📍 {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
          </Text>
          {userLocation.heading && (
            <Text style={styles.locationInfo}>
              🧭 Direção: {Math.round(userLocation.heading)}°
            </Text>
          )}
          <Text style={styles.locationInfo}>
            📋 {locations.length} locais
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    color: '#636E72',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    color: '#636E72',
    fontSize: 16,
    textAlign: 'center',
  },
  userLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  pulseCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.5)',
  },
  locationMarker: {
    backgroundColor: '#FF6B35',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  locationInfo: {
    color: '#2D3436',
    fontSize: 12,
    marginBottom: 4,
  },
});