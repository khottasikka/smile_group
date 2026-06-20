import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, PanResponder, Animated, Platform, Linking } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, X, ArrowRight, ExternalLink } from 'lucide-react-native';
import * as Location from 'expo-location';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72; 

const MapScreen = () => {
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null); 
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedLocationForGrid, setSelectedLocationForGrid] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('2h'); 
  const [selectedFloor, setSelectedFloor] = useState('G');
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 20.2961,
    longitude: 85.8245,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Slide to Pay Animation Config
  const slideX = useRef(new Animated.Value(0)).current;
  const SLIDE_MAX = SCREEN_WIDTH - 116; 

  // Gesture Bottom Sheet Animation Values
  const sheetY = useRef(new Animated.Value(SHEET_HEIGHT)).current; 
  const bgOpacity = useRef(new Animated.Value(0)).current;

  const [parkingSpots] = useState([
    { 
      id: 1, 
      name: 'Infocity Square', 
      zone: 'A', 
      distance: '5.6 km', 
      price: 20, 
      floors: {
        'G': ['O', 'O', 'R', 'O', 'O', 'A', 'O', 'O', 'O', 'R', 'O', 'R', 'A', 'A', 'O', 'A', 'A', 'O'],
        'P1': ['A', 'A', 'O', 'O', 'R', 'R', 'O', 'A', 'A', 'O', 'O', 'O'],
        'P2': ['A', 'A', 'A', 'A', 'A', 'A', 'O', 'O']
      },
      lat: 20.3534, 
      lng: 85.8166, 
      status: 'Open', 
      color: '#10b981' 
    },
    { 
      id: 2, 
      name: 'Esplanade Mall', 
      zone: 'B', 
      distance: '2.9 km', 
      price: 40, 
      floors: {
        'G': ['O', 'R', 'O', 'O', 'A', 'O', 'R', 'O', 'O', 'O'],
        'P1': ['O', 'O', 'O', 'O', 'A', 'A', 'A', 'A', 'R', 'O'],
        'P2': ['A', 'A', 'A', 'A', 'O', 'O', 'O', 'O', 'O', 'O']
      },
      lat: 20.2914, 
      lng: 85.8560, 
      status: 'Reserved', 
      color: '#facc15' 
    },
    { 
      id: 3, 
      name: 'Railway Station', 
      zone: 'C', 
      distance: '5.8 km', 
      price: 15, 
      grid: ['O', 'O', 'O', 'O', 'O', 'O'], 
      lat: 20.2662, 
      lng: 85.8437, 
      status: 'Full', 
      color: '#ef4444' 
    },
    { 
      id: 4, 
      name: 'KIIT Campus 6', 
      zone: 'D', 
      distance: '4.2 km', 
      price: 20, 
      floors: {
        'G': ['A', 'A', 'O', 'R', 'A', 'O', 'O', 'A'],
        'P1': ['O', 'O', 'O', 'O', 'A', 'A', 'A', 'A']
      },
      lat: 20.3515, 
      lng: 85.8198, 
      status: 'Open', 
      color: '#10b981' 
    },
    { 
      id: 5, 
      name: 'Patia Station Rd', 
      zone: 'E', 
      distance: '4.8 km', 
      price: 25, 
      floors: {
        'G': ['O', 'R', 'O', 'R', 'O', 'O'],
        'P1': ['A', 'A', 'O', 'O', 'O', 'O']
      },
      lat: 20.3458, 
      lng: 85.8202, 
      status: 'Reserved', 
      color: '#facc15' 
    },
    { 
      id: 6, 
      name: 'Jayadev Vihar', 
      zone: 'F', 
      distance: '1.2 km', 
      price: 30, 
      grid: ['O', 'O', 'O', 'O', 'R', 'A', 'A', 'O', 'O', 'O', 'O', 'O'], 
      lat: 20.3012, 
      lng: 85.8234, 
      status: 'Full', 
      color: '#ef4444' 
    },
    { 
      id: 7, 
      name: 'Master Canteen', 
      zone: 'G', 
      distance: '6.1 km', 
      price: 20, 
      floors: {
        'G': ['A', 'A', 'A', 'O', 'R', 'A', 'O', 'O'],
        'P1': ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A']
      },
      lat: 20.2644, 
      lng: 85.8401, 
      status: 'Open', 
      color: '#10b981' 
    },
    { 
      id: 8, 
      name: 'DLF Cybercity', 
      zone: 'H', 
      distance: '6.7 km', 
      price: 35, 
      grid: ['O', 'O', 'R', 'O', 'A', 'A', 'O', 'R', 'A', 'O'], 
      lat: 20.3582, 
      lng: 85.8131, 
      status: 'Open', 
      color: '#10b981' 
    }
  ]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setRegion({ latitude, longitude, latitudeDelta: 0.03, longitudeDelta: 0.03 });
      setSelectedLocationForGrid(parkingSpots[0]);
      setLoading(false);
    })();
  }, []);

  // Bottom Sheet Control Timings
  const openBottomSheet = (spot, computedSlotId = null) => {
    setSelectedSpot(spot);
    
    if (!computedSlotId) {
      const activeGrid = spot.floors ? spot.floors[selectedFloor] : spot.grid;
      const firstAvailableIndex = activeGrid ? activeGrid.findIndex(cell => cell === 'A') : -1;
      if (firstAvailableIndex !== -1) {
        const row = String.fromCharCode(65 + Math.floor(firstAvailableIndex / 4));
        const col = (firstAvailableIndex % 4) + 1;
        setSelectedSlotId(spot.floors ? `${selectedFloor}-${row}${col}` : `${row}${col}`);
      } else {
        setSelectedSlotId(spot.floors ? `${selectedFloor}-A1` : `${spot.zone}01`);
      }
    } else {
      setSelectedSlotId(computedSlotId);
    }

    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeBottomSheet = () => {
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      })
    ]).start(() => {
      setSelectedSpot(null);
      slideX.setValue(0);
    });
  };

  // Bottom Sheet Drag Gestures Configuration
  const sheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SHEET_HEIGHT * 0.3 || gestureState.vy > 0.5) {
          closeBottomSheet();
        } else {
          Animated.spring(sheetY, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Google Maps Deep Linking Logic
  const openGoogleMapsNavigation = (destLat, destLng) => {
    if (!userLocation) {
      alert("Current location not available yet.");
      return;
    }
    const { latitude, longitude } = userLocation;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destLat},${destLng}&travelmode=driving`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          alert("Could not launch Google Maps directly.");
        }
      })
      .catch((err) => console.error('An error occurred loading navigation', err));
  };

  const focusOnSpot = (loc) => {
    setSelectedLocationForGrid(loc);
    setSelectedFloor('G'); 
    setRegion({
      latitude: loc.lat,
      longitude: loc.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02
    });
  };

  // Pay Slider Draggable Gestures Configuration
  const payPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= SLIDE_MAX) {
          slideX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SLIDE_MAX * 0.85) {
          Animated.timing(slideX, {
            toValue: SLIDE_MAX,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            alert(`Booking Successful for Slot ${selectedSlotId}! QR Entry Ticket Generated.`);
            closeBottomSheet();
          });
        } else {
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#2563eb" /></View>;

  const hourlyRate = selectedSpot?.price || 40;
  const multiplier = selectedDuration === '1h' ? 1 : selectedDuration === '2h' ? 2 : selectedDuration === '3h' ? 3 : 4;
  const parkingFee = hourlyRate * multiplier;
  const platformFee = 15.00;
  const totalPayable = parkingFee + platformFee;

  // Generate dynamic routing path points
  const getRouteCoordinates = () => {
    if (!userLocation || !selectedLocationForGrid) return [];
    return [
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: (userLocation.latitude + selectedLocationForGrid.lat) / 2 + 0.002, longitude: (userLocation.longitude + selectedLocationForGrid.lng) / 2 - 0.002 },
      { latitude: selectedLocationForGrid.lat, longitude: selectedLocationForGrid.lng }
    ];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* Core Top Map Block View */}
        <View style={styles.mapContainer}>
          <MapView 
            provider={PROVIDER_GOOGLE} 
            style={styles.map} 
            region={region} 
            showsUserLocation={true}
            toolbarEnabled={true}
          >
            {parkingSpots.map((loc) => (
              <Marker 
                key={loc.id} 
                coordinate={{ latitude: loc.lat, longitude: loc.lng }} 
                onPress={() => openBottomSheet(loc)}
              >
                <View style={[styles.customMarker, selectedLocationForGrid?.id === loc.id && styles.activeMarkerBorder, { borderColor: loc.color }]}>
                  <MapPin size={16} color={loc.color} fill={loc.color} />
                </View>
              </Marker>
            ))}

            {/* Dynamic Routing Route Overlay Line */}
            {userLocation && selectedLocationForGrid && (
              <Polyline
                coordinates={getRouteCoordinates()}
                strokeColor="#2563eb"
                strokeWidth={4}
                lineDashPattern={[0]}
                geodesic={true}
              />
            )}
          </MapView>
        </View>

        {/* Live Grid Interactive Board Section */}
        {selectedLocationForGrid && (
          <View style={styles.gridCard}>
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridMainTitle}>
                {selectedLocationForGrid.name} — Floor {selectedLocationForGrid.floors ? selectedFloor : 'G'}
              </Text>
              <Text style={styles.gridDistanceText}>{selectedLocationForGrid.distance}</Text>
            </View>

            {/* Split Architectural Flex Layout */}
            <View style={styles.architectureSplitRow}>
              <View style={styles.matrixFlexWrapper}>
                <View style={styles.matrixContainer}>
                  {(() => {
                    const activeGrid = selectedLocationForGrid.floors 
                      ? selectedLocationForGrid.floors[selectedFloor] 
                      : selectedLocationForGrid.grid;

                    return activeGrid?.map((cell, index) => {
                      const itemsPerRow = 4;
                      const rowIndex = Math.floor(index / itemsPerRow);
                      const colIndex = (index % itemsPerRow) + 1;
                      const rowLetter = String.fromCharCode(65 + rowIndex); 
                      const slotLabel = `${rowLetter}${colIndex}`;
                      const unifiedSlotId = selectedLocationForGrid.floors ? `${selectedFloor}-${slotLabel}` : slotLabel;

                      return (
                        <TouchableOpacity 
                          key={index} 
                          disabled={cell !== 'A'}
                          onPress={() => openBottomSheet(selectedLocationForGrid, unifiedSlotId)}
                          style={[
                            styles.gridNode, 
                            cell === 'A' && styles.nodeOpen,
                            cell === 'R' && styles.nodeReserved,
                            cell === 'O' && styles.nodeOccupied
                          ]} 
                        >
                          <Text style={[
                            styles.nodeText,
                            cell === 'A' && { color: '#10b981' },
                            cell === 'R' && { color: '#b45309' },
                            cell === 'O' && { color: '#ef4444' }
                          ]}>
                            {slotLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    });
                  })()}
                </View>
              </View>

              {/* Architectural Sleek Vertical Tier Picker Column */}
              {selectedLocationForGrid.floors && (
                <View style={styles.verticalFloorBar}>
                  {Object.keys(selectedLocationForGrid.floors).reverse().map((floor) => (
                    <TouchableOpacity
                      key={floor}
                      style={[styles.floorPill, selectedFloor === floor && styles.activeFloorPill]}
                      onPress={() => setSelectedFloor(floor)}
                    >
                      <Text style={[styles.floorPillText, selectedFloor === floor && styles.activeFloorPillText]}>
                        {floor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Micro Grid Legend Identifiers */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.legendIndicator, styles.nodeOpen]} /><Text style={styles.legendLabelText}>Open</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendIndicator, styles.nodeReserved]} /><Text style={styles.legendLabelText}>Reserved</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendIndicator, styles.nodeOccupied]} /><Text style={styles.legendLabelText}>Occupied</Text></View>
            </View>
          </View>
        )}

        {/* Nearby Structured List Hub */}
        <View style={styles.listSection}>
          {parkingSpots.map((loc) => (
            <TouchableOpacity key={loc.id} style={[styles.listCardItem, selectedLocationForGrid?.id === loc.id && styles.activeListCardItem]} onPress={() => focusOnSpot(loc)}>
              <View style={styles.cardInternalFlex}>
                <View style={styles.locationPinSquare}>
                  <MapPin color={selectedLocationForGrid?.id === loc.id ? "#2563eb" : "#64748b"} size={20} />
                </View>
                <View style={styles.middleMeta}>
                  <Text style={styles.locationCardTitle}>{loc.name}</Text>
                  <Text style={styles.locationCardSubtitle}>{loc.distance}  •  ₹{loc.price}/hr</Text>
                </View>
                <View style={[styles.statusIndicatorDot, { backgroundColor: loc.color }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* GESTURE DRIVEN BOTTOM SHEET LAYOUT */}
      {selectedSpot && (
        <Animated.View style={[styles.sheetOverlay, { opacity: bgOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeBottomSheet} />
          
          <Animated.View 
            style={[styles.sheetContent, { transform: [{ translateY: sheetY }] }]}
          >
            {/* Smooth Top Gesture Notch Drag Handle Bar */}
            <View style={styles.dragHandleContainer} {...sheetPanResponder.panHandlers}>
              <View style={styles.dragNotchNode} />
            </View>

            {/* Header Identity Row */}
            <View style={styles.modalTopControlRow}>
              <View>
                <Text style={styles.modalLocationName}>{selectedSpot?.name || 'ESPLANADE MALL'}</Text>
                <Text style={styles.modalZoneMetaText}>ZONE {selectedSpot?.zone || 'B'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <TouchableOpacity 
                  style={styles.navigationCircleBadge} 
                  onPress={() => openGoogleMapsNavigation(selectedSpot.lat, selectedSpot.lng)}
                >
                  <ExternalLink size={18} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeCircleBadge} onPress={closeBottomSheet}>
                  <X size={20} color="#1e293b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Target Dedicated Slot Node Indicator */}
            <View style={styles.slotSelectedBigCard}>
              <Text style={styles.slotSelectedTitleText}>{selectedSlotId} <Text style={styles.inlineMutedText}>SELECTED SLOT</Text></Text>
            </View>

            <Text style={styles.innerSectionLabels}>DURATION</Text>

            {/* Segmented Timeline Time Picker Buttons */}
            <View style={styles.durationSelectorRow}>
              {['1h', '2h', '3h', 'Custom'].map((time) => (
                <TouchableOpacity 
                  key={time} 
                  style={[styles.durationPillNode, selectedDuration === time && styles.activeDurationPill]}
                  onPress={() => setSelectedDuration(time)}
                >
                  <Text style={[styles.durationNodeText, selectedDuration === time && styles.activeDurationNodeText]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comprehensive Checkout Pricing Card Statement Layout */}
            <View style={styles.pricingReceiptCard}>
              <View style={styles.receiptLineRow}>
                <Text style={styles.receiptLabelDark}>Parking  •  {selectedDuration} × ₹{hourlyRate}</Text>
                <Text style={styles.receiptValueDark}>₹{parkingFee.toFixed(2)}</Text>
              </View>
              <View style={styles.receiptLineRow}>
                <Text style={styles.receiptLabelDark}>Platform fee</Text>
                <Text style={styles.receiptValueDark}>₹{platformFee.toFixed(2)}</Text>
              </View>
              
              <View style={styles.receiptDividerLine} />

              <View style={styles.receiptLineRow}>
                <Text style={styles.totalPayableBoldText}>Total payable</Text>
                <View style={styles.boldPriceInlineFlex}>
                  <Text style={styles.boldPriceIntegerText}>₹{Math.floor(totalPayable)}</Text>
                  <Text style={styles.boldPriceDecimalText}>.{(totalPayable % 1).toFixed(2).split('.')[1]}</Text>
                </View>
              </View>
            </View>

            {/* SLIDE TO PAY DRAGGABLE MODULE */}
            <View style={styles.slideTrackContainer}>
              <Text style={styles.trackPlaceholderBackgroundText}>Slide to pay & get ticket</Text>
              
              <Animated.View 
                style={[styles.slideDragHandleNode, { transform: [{ translateX: slideX }] }]}
                {...payPanResponder.panHandlers}
              >
                <ArrowRight size={20} color="#ffffff" />
              </Animated.View>
            </View>

            <Text style={styles.bottomSecuredMetaLabel}>WALLET BALANCE ₹500.00  •  INSTANT QR TICKET</Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { paddingBottom: 30 },
  
  // Map Components Layer
  mapContainer: { height: SCREEN_HEIGHT * 0.38, width: '100%', position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  customMarker: { backgroundColor: '#ffffff', padding: 8, borderRadius: 12, borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  activeMarkerBorder: { scaleX: 1.1, scaleY: 1.1, shadowOpacity: 0.3 },

  // Matrix Live Grid Layout Block
  gridCard: { backgroundColor: '#ffffff', marginHorizontal: 24, marginTop: -20, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: '#edf2f7', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  gridHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  gridMainTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  gridDistanceText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  matrixContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  gridNode: { width: (SCREEN_WIDTH - 134) / 4, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  nodeText: { fontSize: 11, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  nodeOpen: { backgroundColor: '#e6fbf2', borderWidth: 1, borderColor: '#10b981' },
  nodeReserved: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#facc15', opacity: 0.6 },
  nodeOccupied: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#ef4444', opacity: 0.4 },
  
  // Multi-Floor Layout Split Styles
  architectureSplitRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  matrixFlexWrapper: { flex: 1 },
  verticalFloorBar: { width: 42, backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  floorPill: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  activeFloorPill: { backgroundColor: '#ffffff', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  floorPillText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  activeFloorPillText: { color: '#0f172a', fontWeight: '900' },

  // Legend Styling
  legendRow: { flexDirection: 'row', gap: 16, justifyContent: 'flex-start' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendIndicator: { width: 12, height: 12, borderRadius: 4 },
  legendLabelText: { fontSize: 11, fontWeight: '700', color: '#64748b' },

  // Base Structured Row Cards Layout
  listSection: { paddingHorizontal: 24, marginTop: 16 },
  listCardItem: { backgroundColor: '#ffffff', borderRadius: 22, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#edf2f7' },
  activeListCardItem: { borderColor: '#2563eb', borderWidth: 1.5 },
  cardInternalFlex: { flexDirection: 'row', alignItems: 'center' },
  locationPinSquare: { width: 44, height: 44, backgroundColor: '#f1f5f9', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  middleMeta: { flex: 1, marginLeft: 16 },
  locationCardTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  locationCardSubtitle: { fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 2 },
  statusIndicatorDot: { width: 8, height: 8, borderRadius: 4 },

  // Gesture Bottom Sheet Styles Architecture
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end', zIndex: 999 },
  sheetContent: { height: SHEET_HEIGHT, backgroundColor: '#ffffff', borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  dragHandleContainer: { width: '100%', alignItems: 'center', paddingVertical: 12 },
  dragNotchNode: { width: 48, height: 5, backgroundColor: '#cbd5e1', borderRadius: 3 },
  
  modalTopControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalLocationName: { fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
  modalZoneMetaText: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 2 },
  closeCircleBadge: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 50 },
  navigationCircleBadge: { backgroundColor: '#e0e7ff', padding: 9, borderRadius: 50 },
  
  slotSelectedBigCard: { marginBottom: 16 },
  slotSelectedTitleText: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  inlineMutedText: { fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5 },
  innerSectionLabels: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 10 },
  
  // Timelines Selection Segments Node
  durationSelectorRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  durationPillNode: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  activeDurationPill: { backgroundColor: '#ffffff', borderColor: '#facc15', borderWidth: 2 },
  durationNodeText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  activeDurationNodeText: { color: '#0f172a', fontWeight: '800' },

  // Pricing Invoice Receipt Block layout
  pricingReceiptCard: { backgroundColor: '#f8fafc', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  receiptLineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  receiptLabelDark: { fontSize: 13, fontWeight: '600', color: '#475569' },
  receiptValueDark: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  receiptDividerLine: { borderWidth: 0.5, borderColor: '#e2e8f0', borderStyle: 'dashed', marginVertical: 10 },
  totalPayableBoldText: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  boldPriceInlineFlex: { flexDirection: 'row', alignItems: 'baseline' },
  boldPriceIntegerText: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  boldPriceDecimalText: { fontSize: 14, fontWeight: '700', color: '#64748b' },

  // Slide Engine Draggable Elements
  slideTrackContainer: { height: 62, backgroundColor: '#f1f5f9', borderRadius: 20, padding: 4, justifyContent: 'center', position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
  trackPlaceholderBackgroundText: { position: 'absolute', width: '100%', textAlign: 'center', color: '#64748b', fontSize: 14, fontWeight: '700', zIndex: 0 },
  slideDragHandleNode: { width: 54, height: 54, backgroundColor: '#facc15', borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#facc15', shadowOpacity: 0.3, shadowRadius: 4, zIndex: 1 },
  bottomSecuredMetaLabel: { textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, marginTop: 14 }
});

export default MapScreen;