import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Modal, Pressable, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, Navigation, X, Car, Bike, Zap, Search } from 'lucide-react-native';
import * as Location from 'expo-location';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MapScreen = () => {
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('bike'); 
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 20.2961,
    longitude: 85.8245,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [parkingSpots, setParkingSpots] = useState([
    { id: 1, name: 'Infocity Square', distance: '--', carSlots: 5, bikeSlots: 12, evSlots: 2, price: 20, status: 'Available', color: '#22c55e', lat: 20.3429, lng: 85.8072 },
    { id: 2, name: 'Esplanade Mall', distance: '--', carSlots: 0, bikeSlots: 2, evSlots: 0, price: 40, status: 'Almost Full', color: '#f59e0b', lat: 20.2914, lng: 85.8560 },
    { id: 3, name: 'Railway Station', distance: '--', carSlots: 0, bikeSlots: 0, evSlots: 0, price: 15, status: 'Full', color: '#ef4444', lat: 20.2662, lng: 85.8437 },
  ]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission denied');
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setRegion({ latitude, longitude, latitudeDelta: 0.03, longitudeDelta: 0.03 });

      const updatedSpots = parkingSpots.map(spot => ({
        ...spot,
        distance: `${calculateDistance(latitude, longitude, spot.lat, spot.lng)} km`
      }));
      setParkingSpots(updatedSpots);
      setLoading(false);
    })();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const centerOnUser = () => {
    if (userLocation) setRegion({ ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  // Move map to spot without opening availability window immediately
  const focusOnSpot = (loc) => {
    setRegion({
      latitude: loc.lat,
      longitude: loc.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    });
  };

  const filteredSpots = parkingSpots.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      {/* SEARCH BAR - Floating on top */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748b" />
          <TextInput 
            placeholder="Search parking area..." 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={region} showsUserLocation={true}>
          {filteredSpots.map((loc) => (
            <Marker 
              key={loc.id} 
              coordinate={{ latitude: loc.lat, longitude: loc.lng }} 
              onPress={() => setSelectedSpot(loc)} // Marker tap opens availability
            >
               <View style={[styles.customMarker, { borderColor: loc.color }]}>
                  <Text style={styles.markerText}>{loc.carSlots + loc.bikeSlots + loc.evSlots}</Text>
               </View>
            </Marker>
          ))}
        </MapView>
        
        {/* RECENTER BUTTON - Relocated to Bottom Right */}
        <TouchableOpacity style={styles.recenterBtn} onPress={centerOnUser}>
          <Navigation size={22} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Nearby Parking</Text>
        <Text style={styles.subtitle}>{filteredSpots.length} locations near you</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filteredSpots.map((loc) => (
          <TouchableOpacity key={loc.id} style={styles.card} onPress={() => focusOnSpot(loc)}>
            <View style={styles.cardMain}>
              <View style={styles.iconBox}><MapPin color="#2563eb" size={24} /></View>
              <View style={styles.details}>
                <Text style={styles.locName}>{loc.name}</Text>
                <Text style={styles.locDist}>{loc.distance} away • ₹{loc.price}/hr</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: loc.color }]} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* AVAILABILITY SLIDE-UP */}
      <Modal visible={!!selectedSpot} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedSpot(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedSpot?.name}</Text>
                <Text style={styles.modalSubtitle}>Current Availability</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedSpot(null)}><X size={24} color="#64748b" /></TouchableOpacity>
            </View>

            <View style={styles.vehicleRow}>
              {[
                { id: 'car', icon: Car, label: 'Car', count: selectedSpot?.carSlots },
                { id: 'bike', icon: Bike, label: 'Bike', count: selectedSpot?.bikeSlots },
                { id: 'ev', icon: Zap, label: 'EV', count: selectedSpot?.evSlots }
              ].map((v) => (
                <TouchableOpacity 
                  key={v.id} 
                  style={[styles.vehicleBox, selectedVehicle === v.id && styles.selectedVehicle]}
                  onPress={() => setSelectedVehicle(v.id)}
                >
                  <v.icon color={selectedVehicle === v.id ? "#fff" : "#2563eb"} size={22} />
                  <Text style={[styles.vehicleLabel, selectedVehicle === v.id && {color: '#fff'}]}>{v.label}</Text>
                  <Text style={[styles.vehicleCount, selectedVehicle === v.id && {color: '#fff'}]}>{v.count} left</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.bookBtn, (selectedSpot?.[`${selectedVehicle}Slots`] === 0) && styles.disabledBtn]}
              onPress={() => alert(`Booking...`)}
            >
              <Text style={styles.bookBtnText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    //searchContainer: { position: 'absolute', top: 60, left: 20, right: 20, zIndex: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, height: 50, borderRadius: 15, elevation: 19, shadowOpacity: 0.1 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    mapContainer: { height: SCREEN_HEIGHT * 0.40, width: '100%' },
    map: { ...StyleSheet.absoluteFillObject },
    //recenterBtn: { position: 'absolute', bottom: 50, right: 20, backgroundColor: 'white', padding: 12, borderRadius: 15, elevation: 5, zIndex: 5 },
    customMarker: { backgroundColor: 'white', padding: 5, borderRadius: 10, borderWidth: 2, minWidth: 30, alignItems: 'center' },
    markerText: { fontWeight: 'bold', fontSize: 12 },
    header: { padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
    title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },
    list: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 18, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    cardMain: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 44, height: 44, backgroundColor: '#eff6ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    details: { flex: 1, marginLeft: 15 },
    locName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    locDist: { fontSize: 12, color: '#64748b' },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    modalSubtitle: { fontSize: 14, color: '#64748b' },
    vehicleRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
    vehicleBox: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 15, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    selectedVehicle: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    vehicleLabel: { fontSize: 12, fontWeight: '700', marginTop: 5, color: '#1e293b' },
    vehicleCount: { fontSize: 10, color: '#64748b' },
    bookBtn: { backgroundColor: '#2563eb', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    disabledBtn: { backgroundColor: '#cbd5e1' }
});

export default MapScreen;