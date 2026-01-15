import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { locationService } from '../../services/api';

const { width, height } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 38.736946,
  longitude: -9.142685,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const GoogleMapComponent = ({ 
  locations = [], 
  userLocation = null,
  onMapPress = null,
  draggableMarker = false,
  markerCoordinate = null,
  style = {},
  showControls = true
}) => {
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);

  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation]);

  const handleCenterOnUser = () => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={[styles.mapContainer, style]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomControlEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        onPress={onMapPress}
        cacheEnabled={true}
        loadingEnabled={true}
        loadingIndicatorColor="#FF6B35"
        loadingBackgroundColor="#F8F9FA"
      >
        {/* Marcador arrastável para novo local */}
        {markerCoordinate && markerCoordinate.latitude && markerCoordinate.longitude && (
          <Marker
            coordinate={markerCoordinate}
            draggable={draggableMarker}
            onDragEnd={onMapPress}
          >
            <View style={styles.draggableMarker}>
              <Icon name="map-marker" size={24} color="#FF6B35" />
            </View>
          </Marker>
        )}

        {/* Locais salvos */}
        {locations.map((location) => (
          location.latitude && location.longitude ? (
            <React.Fragment key={location.id}>
              <Marker
                coordinate={{
                  latitude: parseFloat(location.latitude),
                  longitude: parseFloat(location.longitude)
                }}
                title={location.name || 'Local'}
                description={`Raio: ${location.radius || 0}m`}
              >
                <View style={styles.savedLocationMarker}>
                  <Icon name="map-marker" size={18} color="#FFFFFF" />
                </View>
              </Marker>
              <Circle
                center={{
                  latitude: parseFloat(location.latitude),
                  longitude: parseFloat(location.longitude)
                }}
                radius={location.radius || 50}
                strokeColor="#FF6B35"
                fillColor="rgba(255, 107, 53, 0.2)"
                strokeWidth={2}
              />
            </React.Fragment>
          ) : null
        ))}
      </MapView>

      {showControls && userLocation && userLocation.latitude && userLocation.longitude && (
        <TouchableOpacity
          style={styles.centerButton}
          onPress={handleCenterOnUser}
        >
          <Icon name="crosshairs-gps" size={20} color="#FF6B35" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function LocationsScreen({ user }) {
  const [locations, setLocations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'gps',
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
    radius: 50,
    wifi_ssid: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    loadLocations();
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permissão de localização negada');
        setIsTracking(false);
        return;
      }

      const locationOptions = {
        accuracy: Location.Accuracy.Balanced,
      };

      try {
        const currentLocation = await Location.getCurrentPositionAsync(locationOptions);
        setUserLocation(currentLocation.coords);
        setIsTracking(true);
        
        setNewLocation(prev => ({
          ...prev,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        }));
      } catch (error) {
        console.log('Error getting initial location:', error);
        setLocationError('Erro ao obter localização inicial');
      }
    } catch (error) {
      console.log('Error starting location tracking:', error);
      setLocationError('Erro no serviço de localização');
      setIsTracking(false);
    }
  };

  const loadLocations = async () => {
    try {
      const result = await locationService.getUserLocations(user.id);
      if (result.success) {
        setLocations(result.data || []);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.log('Error loading locations:', error);
      setLocations([]);
      Alert.alert('Erro', 'Não foi possível carregar as localizações');
    } finally {
      setIsLoading(false);
    }
  };

  const [editingId, setEditingId] = useState(null);

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o local');
      return;
    }

    try {
      // Map to backend shape
      const payload = {
        nome: newLocation.name.trim(),
        descricao: newLocation.description || null,
        tipo: newLocation.type === 'gps' ? 'GPS' : 'WIFI',
      };

      if (payload.tipo === 'GPS') {
        payload.coordenadas = {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          raio_metros: newLocation.radius
        };
      } else {
        payload.coordenadas = newLocation.ssids || [];
      }

      let result;
      if (editingId) {
        result = await locationService.updateLocation(editingId, payload);
      } else {
        result = await locationService.create(payload);
      }

      if (result.success) {
        await loadLocations();
        setShowAddModal(false);
        setEditingId(null);
        resetNewLocation();
        Alert.alert('Sucesso', editingId ? 'Local actualizado com sucesso!' : 'Local adicionado com sucesso!');
      }
    } catch (error) {
      console.log('Error adding/updating location:', error);
      Alert.alert('Erro', error.message || 'Não foi possível adicionar/atualizar o local');
    }
  };

  const deleteLocation = async (locationId) => {
    Alert.alert(
      'Confirmar Eliminação',
      'Tem a certeza que pretende eliminar este local?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await locationService.deleteLocation(locationId);
              if (result.success) {
                setLocations(prev => prev.filter(loc => loc.id !== locationId));
                Alert.alert('Sucesso', 'Local eliminado com sucesso!');
              }
            } catch (error) {
              console.log('Error deleting location:', error);
              Alert.alert('Erro', error.message || 'Não foi possível eliminar o local');
            }
          }
        }
      ]
    );
  };

  const showLocationDetails = (location) => {
    setSelectedLocation(location);
    setShowDetailModal(true);
  };

  const openInGoogleMaps = (location) => {
    if (location && location.latitude && location.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
      Linking.openURL(url).catch(err => {
        Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
      });
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    if (coordinate && coordinate.latitude && coordinate.longitude) {
      setNewLocation(prev => ({
        ...prev,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      }));
    }
  };

  const resetNewLocation = () => {
    setNewLocation({
      name: '',
      description: '',
      type: 'gps',
      latitude: userLocation ? userLocation.latitude : DEFAULT_REGION.latitude,
      longitude: userLocation ? userLocation.longitude : DEFAULT_REGION.longitude,
      radius: 50,
      ssids: []
    });
    setEditingId(null);
  };

  const useCurrentLocation = () => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setNewLocation(prev => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      }));
      Alert.alert('Sucesso', 'Localização atual definida!');
    } else {
      Alert.alert('Aviso', 'Localização não disponível');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screenLoadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.screenLoadingText}>A carregar locais...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status da Localização */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardTitle}>Estado do GPS</Text>
            <View style={[
              styles.statusIndicator,
              isTracking && !locationError ? styles.statusActive : styles.statusError
            ]}>
              <Text style={styles.statusText}>
                {isTracking && !locationError ? '● ATIVO' : '● INATIVO'}
              </Text>
            </View>
          </View>
          
          {locationError ? (
            <View style={styles.errorStatus}>
              <Icon name="alert-circle" size={20} color="#E17055" />
              <Text style={styles.errorStatusText}>{locationError}</Text>
            </View>
          ) : !isTracking ? (
            <View style={styles.loadingStatus}>
              <ActivityIndicator size="small" color="#FF6B35" />
              <Text style={styles.loadingStatusText}>A obter localização...</Text>
            </View>
          ) : userLocation ? (
            <View style={styles.successStatus}>
              <Icon name="check-circle" size={20} color="#00B894" />
              <Text style={styles.successStatusText}>
                {`GPS Ativo - ${(userLocation.latitude || 0).toFixed(4)}, ${(userLocation.longitude || 0).toFixed(4)}`}
              </Text>
            </View>
          ) : (
            <View style={styles.loadingStatus}>
              <ActivityIndicator size="small" color="#FF6B35" />
              <Text style={styles.loadingStatusText}>A inicializar GPS...</Text>
            </View>
          )}
        </View>

        {/* Mapa Principal */}
        <View style={styles.mapCard}>
          <Text style={styles.cardTitle}>Mapa em Tempo Real</Text>
          <Text style={styles.cardSubtitle}>
            Sua localização atualiza automaticamente com Google Maps
          </Text>
          
          <View style={styles.mainMapContainer}>
            <GoogleMapComponent 
              locations={locations}
              userLocation={userLocation}
              showControls={true}
            />
          </View>
          
          <Text style={styles.mapFooter}>
            {`📍 ${locations.length} locais salvos • Google Maps ativo`}
          </Text>
        </View>

        {/* Lista de Locais */}
        <View style={styles.locationsCard}>
          <View style={styles.locationsHeader}>
            <Text style={styles.cardTitle}>Meus Locais</Text>
            <Text style={styles.locationsCount}>{`(${locations.length})`}</Text>
          </View>
          
          {locations.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="map-marker-radius" size={48} color="#DFE6E9" />
              <Text style={styles.emptyStateText}>Nenhum local adicionado</Text>
              <Text style={styles.emptyStateSubtext}>
                Toque no botão abaixo para adicionar seu primeiro local
              </Text>
            </View>
          ) : (
            locations.map((location) => (
              <View key={location.id} style={styles.locationItem}>
                <View style={styles.locationContent}>
                  <Text style={styles.locationName}>{location.name || 'Local sem nome'}</Text>
                  <View style={styles.locationDetails}>
                    <Icon name="crosshairs-gps" size={14} color="#636E72" />
                    <Text style={styles.locationCoordinates}>
                      {`${(parseFloat(location.latitude) || 0).toFixed(6)}, ${(parseFloat(location.longitude) || 0).toFixed(6)}`}
                    </Text>
                  </View>
                  <View style={styles.locationMeta}>
                    <Text style={styles.locationRadius}>{`Raio: ${location.radius || 0}m`}</Text>
                    <Text style={styles.locationType}>{`Tipo: ${location.type}`}</Text>
                  </View>
                </View>
                
                <View style={styles.locationActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => showLocationDetails(location)}
                  >
                    <Icon name="eye" size={20} color="#3498DB" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openInGoogleMaps(location)}
                  >
                    <Icon name="google-maps" size={20} color="#34A853" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => deleteLocation(location.id)}
                  >
                    <Icon name="delete" size={20} color="#E17055" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Botão Adicionar Local */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Icon name="plus" size={20} color="#FFF" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Adicionar Novo Local</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Adicionar Local */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          resetNewLocation();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Local</Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                resetNewLocation();
              }}>
                <Icon name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nome do local (ex: Minha Casa, Trabalho)"
                  value={newLocation.name}
                  onChangeText={(text) => setNewLocation({...newLocation, name: text})}
                  placeholderTextColor="#636E72"
                />

                <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 8, alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.typeButton, newLocation.type === 'gps' && styles.typeButtonActive]}
                    onPress={() => setNewLocation({ ...newLocation, type: 'gps' })}
                  >
                    <Text style={[styles.typeButtonText, newLocation.type === 'gps' && styles.typeButtonTextActive]}>GPS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, newLocation.type === 'wifi' && styles.typeButtonActive, { marginLeft: 8 }]}
                    onPress={() => setNewLocation({ ...newLocation, type: 'wifi' })}
                  >
                    <Text style={[styles.typeButtonText, newLocation.type === 'wifi' && styles.typeButtonTextActive]}>WIFI</Text>
                  </TouchableOpacity>
                </View>

                {newLocation.type === 'wifi' && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#636E72', marginBottom: 8, fontWeight: '600' }}>SSIDs (Wi‑Fi)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput
                        style={{ flex: 1, borderWidth: 1, borderColor: '#DFE6E9', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FFF' }}
                        placeholder="Inserir SSID"
                        placeholderTextColor="#999"
                        value={newLocation._ssidTemp || ''}
                        onChangeText={(text) => setNewLocation({ ...newLocation, _ssidTemp: text })}
                      />
                      <TouchableOpacity
                        style={{ marginLeft: 8, backgroundColor: '#FF6B35', padding: 12, borderRadius: 8 }}
                        onPress={() => {
                          const v = (newLocation._ssidTemp || '').trim();
                          if (!v) return;
                          setNewLocation(prev => ({ ...prev, ssids: [...(prev.ssids || []), v], _ssidTemp: '' }));
                        }}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>Adicionar</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                      {(newLocation.ssids || []).map((s, idx) => (
                        <View key={idx} style={{ backgroundColor: '#F1F2F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ marginRight: 8, color: '#2D3436' }}>{s}</Text>
                          <TouchableOpacity onPress={() => setNewLocation(prev => ({ ...prev, ssids: prev.ssids.filter(x => x !== s) }))}>
                            <Icon name="close" size={16} color="#636E72" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Posição no Mapa</Text>
                  <TouchableOpacity 
                    style={styles.useLocationButton}
                    onPress={useCurrentLocation}
                  >
                    <Icon name="crosshairs-gps" size={16} color="#FF6B35" />
                    <Text style={styles.useLocationText}>Usar Minha Localização</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.mapInputContainer}>
                  <GoogleMapComponent 
                    locations={[]}
                    userLocation={userLocation}
                    onMapPress={handleMapPress}
                    draggableMarker={true}
                    markerCoordinate={{
                      latitude: newLocation.latitude,
                      longitude: newLocation.longitude
                    }}
                    showControls={false}
                  />
                </View>

                <View style={styles.coordinatesDisplay}>
                  <Text style={styles.coordinatesLabel}>Coordenadas Selecionadas:</Text>
                  <Text style={styles.coordinatesValue}>
                    {`${(newLocation.latitude || 0).toFixed(6)}, ${(newLocation.longitude || 0).toFixed(6)}`}
                  </Text>
                </View>

                <View style={styles.radiusSelector}>
                  <Text style={styles.radiusLabel}>Raio de alcance (metros)</Text>
                  <View style={styles.radiusControls}>
                    <Text style={styles.radiusValue}>
                      {`${newLocation.radius || 0}m`}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.radiusOptions}>
                        {[20, 50, 100, 200, 500].map((radius) => (
                          <TouchableOpacity
                            key={radius}
                            style={[
                              styles.radiusOption,
                              newLocation.radius === radius && styles.radiusOptionSelected
                            ]}
                            onPress={() => setNewLocation({
                              ...newLocation,
                              radius
                            })}
                          >
                            <Text style={[
                              styles.radiusOptionText,
                              newLocation.radius === radius && styles.radiusOptionTextSelected
                            ]}>
                              {`${radius}m`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.instructions}>
                  <Icon name="information" size={16} color="#636E72" />
                  <Text style={styles.instructionsText}>
                    Toque no mapa para definir a posição ou arraste o marcador
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetNewLocation();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddLocation}
              >
                <Text style={styles.confirmButtonText}>{editingId ? 'Atualizar Local' : 'Adicionar Local'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Detalhes do Local */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedLocation?.name || 'Detalhes do Local'}</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Icon name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailMapContainer}>
              <GoogleMapComponent 
                locations={selectedLocation ? [selectedLocation] : []}
                userLocation={userLocation}
                showControls={false}
              />
            </View>
            
            <View style={styles.locationDetails}>
              <View style={styles.detailItem}>
                <Icon name="crosshairs-gps" size={20} color="#636E72" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Coordenadas GPS</Text>
                  <Text style={styles.detailValue}>
                    {`${(parseFloat(selectedLocation?.latitude) || 0).toFixed(6)}, ${(parseFloat(selectedLocation?.longitude) || 0).toFixed(6)}`}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon name="radius" size={20} color="#636E72" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Raio de Alcance</Text>
                  <Text style={styles.detailValue}>{`${selectedLocation?.radius || 0} metros`}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon name="map-marker" size={20} color="#636E72" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>{selectedLocation?.type || 'gps'}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailFooter}>
              <TouchableOpacity
                style={styles.mapsButton}
                onPress={() => selectedLocation && openInGoogleMaps(selectedLocation)}
              >
                <Icon name="google-maps" size={20} color="#FFF" />
                <Text style={styles.mapsButtonText}>Abrir no Google Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapsButton, { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DFE6E9', marginLeft: 8 }]}
                onPress={() => {
                  // Start edit flow
                  if (!selectedLocation) return;
                  const loc = selectedLocation;
                  const tipo = (loc.tipo || loc.type || 'GPS').toString().toUpperCase();
                  const isWifi = tipo === 'WIFI';

                  const coords = loc.coordenadas || {};
                  const ssids = Array.isArray(coords) ? coords.map(c => (c.ssid || c)) : (loc.ssids || []);

                  setNewLocation({
                    name: loc.nome || loc.name || '',
                    description: loc.descricao || loc.description || '',
                    type: isWifi ? 'wifi' : 'gps',
                    latitude: (coords && coords.latitude) || loc.latitude || DEFAULT_REGION.latitude,
                    longitude: (coords && coords.longitude) || loc.longitude || DEFAULT_REGION.longitude,
                    radius: (coords && coords.raio_metros) || loc.radius || 50,
                    ssids: ssids || [],
                    _ssidTemp: ''
                  });
                  setEditingId(loc.id);
                  setShowDetailModal(false);
                  setShowAddModal(true);
                }}
              >
                <Icon name="pencil" size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Estilos mantidos do código anterior...
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  screenLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  screenLoadingText: {
    marginTop: 12,
    color: '#636E72',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  mapCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  locationsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#636E72',
    fontSize: 14,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationsCount: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 16,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
  },
  statusError: {
    backgroundColor: 'rgba(225, 112, 85, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
  },
  errorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(225, 112, 85, 0.1)',
    borderRadius: 8,
  },
  successStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderRadius: 8,
  },
  loadingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 8,
  },
  errorStatusText: {
    color: '#E17055',
    marginLeft: 8,
    fontSize: 14,
  },
  successStatusText: {
    color: '#00B894',
    marginLeft: 8,
    fontSize: 14,
  },
  loadingStatusText: {
    color: '#FF6B35',
    marginLeft: 8,
    fontSize: 14,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mainMapContainer: {
    height: 300,
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapInputContainer: {
    height: 200,
    marginBottom: 12,
  },
  detailMapContainer: {
    flex: 1,
    minHeight: 300,
  },
  savedLocationMarker: {
    backgroundColor: '#3498DB',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  draggableMarker: {
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  centerButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#636E72',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    color: '#636E72',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 4,
  },
  locationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontWeight: 'bold',
    color: '#2D3436',
    fontSize: 16,
    marginBottom: 6,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationCoordinates: {
    color: '#636E72',
    fontSize: 12,
    marginLeft: 6,
  },
  locationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRadius: {
    color: '#636E72',
    fontSize: 12,
  },
  locationType: {
    color: '#636E72',
    fontSize: 11,
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  detailModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    margin: 20,
    marginTop: 50,
    flex: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE6E9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  modalScrollView: {
    maxHeight: 500,
  },
  modalBody: {
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    marginBottom: 16,
    color: '#2D3436',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#2D3436',
    fontWeight: '600',
    fontSize: 16,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  useLocationText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  coordinatesDisplay: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  coordinatesLabel: {
    color: '#636E72',
    fontSize: 12,
    marginBottom: 4,
  },
  coordinatesValue: {
    color: '#2D3436',
    fontSize: 14,
    fontWeight: '600',
  },
  radiusSelector: {
    marginBottom: 20,
  },
  radiusLabel: {
    color: '#636E72',
    fontSize: 14,
    marginBottom: 8,
  },
  radiusControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radiusValue: {
    color: '#2D3436',
    fontWeight: '600',
    marginRight: 12,
    fontSize: 14,
    minWidth: 50,
  },
  radiusOptions: {
    flexDirection: 'row',
  },
  radiusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginRight: 8,
  },
  radiusOptionSelected: {
    backgroundColor: '#FF6B35',
  },
  radiusOptionText: {
    color: '#2D3436',
    fontWeight: '600',
    fontSize: 12,
  },
  radiusOptionTextSelected: {
    color: '#FFF',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsText: {
    color: '#636E72',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#DFE6E9',
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#DFE6E9',
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#2D3436',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    marginLeft: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  locationDetails: {
    padding: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    color: '#636E72',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: '#2D3436',
    fontSize: 14,
    fontWeight: '600',
  },
  detailFooter: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#DFE6E9',
  },
  mapsButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapsButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  mapFooter: {
    color: '#636E72',
    fontSize: 12,
    textAlign: 'center',
  },
});