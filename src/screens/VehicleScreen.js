import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, RefreshControl
} from 'react-native';
import { Plus, Bike, ShieldCheck, X, Car, Trash2, ChevronRight, Activity, Calendar, FileText, AlertCircle } from 'lucide-react-native';
import { UserContext } from '../UserContext';

const VehicleScreen = () => {
  const { user, updateVehicles } = useContext(UserContext);
  const [vehicles, setVehicles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [newModel, setNewModel] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('Motorcycle');

  useEffect(() => {
    if (user) {
      if (user.vehicles && user.vehicles.length > 0) {
        setVehicles(user.vehicles);
      } else if (user.vehicleNo) {
        const initialVehicle = {
          id: 'primary-reg',
          model: user.vehicleBrand || 'My Vehicle',
          plate: user.vehicleNo,
          type: user.vehicleType || 'Car',
          isPrimary: true,
          fastagBalance: '₹450',
          insuranceNo: 'INS-99281-2026',
          pucExpiry: '12 Nov 2026',
          regDate: '15 Dec 2025'
        };
        const updatedList = [initialVehicle];
        setVehicles(updatedList);
        if (typeof updateVehicles === 'function') {
          updateVehicles(updatedList);
        }
      }
    }
  }, [user?.vehicles]);

  // Pull to Refresh Handler
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Document Expiry Evaluator 
  const checkExpiryStatus = (dateStr) => {
    if (!dateStr) return { isCritical: false, text: 'Active', color: '#10b981' };
    
    // Parse Date Strings like '12 Nov 2026' or '24 Jan 2027' safely
    const expiryTimestamp = Date.parse(dateStr);
    if (isNaN(expiryTimestamp)) return { isCritical: false, text: 'Active', color: '#10b981' };

    const expiry = new Date(expiryTimestamp);
    const today = new Date(); // Normalized against active global timeline (June 2026)
    const diffTime = expiry - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      return { isCritical: true, text: 'Expired', color: '#ef4444' };
    }
    if (daysLeft <= 30) {
      return { isCritical: true, text: `Expires in ${daysLeft}d`, color: '#f59e0b' };
    }
    return { isCritical: false, text: 'Active', color: '#10b981' };
  };

  // Primary Status Context Synchronization
  const handleSetPrimary = (id) => {
    const reorderedVehicles = vehicles.map(v => ({
      ...v,
      isPrimary: v.id === id
    })).sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

    setVehicles(reorderedVehicles);
    if (typeof updateVehicles === 'function') {
      updateVehicles(reorderedVehicles);
    }
  };

  const formatIndianPlate = (text) => {
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let result = "";
    for (let i = 0; i < cleaned.length; i++) {
      if (i === 2) result += "-";
      if (i === 4) result += "-";
      if (i === 6 && isNaN(cleaned[5])) {
          result += "-";
      } else if (i === 5 && !isNaN(cleaned[5])) {
          result += "-";
      }
      result += cleaned[i];
    }
    return result.slice(0, 13);
  };

  const handleAddVehicle = () => {
    if (!newModel || !newPlate) {
      Alert.alert("Error", "Please enter both model and plate number.");
      return;
    }

    const plateRegex = /^[A-Z]{2}-[0-9]{2}-[A-Z]{1,2}-[0-9]{4}$/;
    if (!plateRegex.test(newPlate)) {
      Alert.alert("Invalid Format", "Example: OD-02-F-9901");
      return;
    }

    const newVehicle = {
      id: Math.random().toString(),
      model: newModel,
      plate: newPlate,
      type: newType,
      isPrimary: vehicles.length === 0,
      fastagBalance: '₹0',
      insuranceNo: `INS-${Math.floor(10000 + Math.random() * 90000)}-2026`,
      pucExpiry: '15 Jul 2026', // Triggers warning logic natively within 30 days of June 21, 2026
      regDate: '21 Jun 2026'
    };

    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    if (typeof updateVehicles === 'function') {
      updateVehicles(updatedVehicles);
    }

    setNewModel('');
    setNewPlate('');
    setModalVisible(false);
  };

  const confirmDelete = (id, model) => {
    Alert.alert(
      "Remove Vehicle",
      `Are you sure you want to remove the ${model}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          onPress: () => {
            const remainingVehicles = vehicles.filter(v => v.id !== id);
            // If we removed the primary vehicle, set the next inline as primary
            if (remainingVehicles.length > 0 && !remainingVehicles.some(v => v.isPrimary)) {
              remainingVehicles[0].isPrimary = true;
            }
            setVehicles(remainingVehicles);
            if (typeof updateVehicles === 'function') {
              updateVehicles(remainingVehicles);
            }
          },
          style: "destructive" 
        }
      ]
    );
  };

  const handleOpenDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Garage</Text>
          <Text style={styles.subtitle}>{vehicles.length} Vehicle{vehicles.length !== 1 ? 's' : ''} registered</Text>
        </View>
        <TouchableOpacity 
          style={styles.addCircle} 
          onPress={() => setModalVisible(true)}
          disabled={vehicles.length >= 3}
        >
          <Plus color="#0f172a" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#facc15" colors={["#facc15"]} />
        }
      >
        {vehicles.map((item) => {
          const pucStatus = checkExpiryStatus(item.pucExpiry);

          return (
            <TouchableOpacity 
              key={item.id} 
              activeOpacity={0.9}
              style={styles.vehicleCard}
              onLongPress={() => {
                if (!item.isPrimary) {
                  Alert.alert("Set Primary", `Make ${item.model} your primary vehicle?`, [
                    { text: "Cancel", style: "cancel" },
                    { text: "Set Primary", onPress: () => handleSetPrimary(item.id) }
                  ]);
                }
              }}
            >
              {/* Header Alignment */}
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  {item.type === 'Motorcycle' || item.type === 'Bike' ? (
                    <Bike size={13} color="#facc15" />
                  ) : (
                    <Car size={13} color="#facc15" />
                  )}
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
                
                <View style={styles.headerActionGroup}>
                  {item.isPrimary && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>PRIMARY</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => confirmDelete(item.id, item.model)} hitSlop={12}>
                    <Trash2 size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Central Typography Identifiers */}
              <View style={styles.cardBody}>
                 <View style={{ flex: 1 }}>
                  <Text style={styles.modelText}>{item.model}</Text>
                  <Text style={styles.plateText}>{item.plate}</Text>
                 </View>
                 <ChevronRight size={18} color="#94a3b8" />
              </View>

              {/* Interactive Fastag Status Strip */}
              <View style={styles.fastagRow}>
                <Text style={styles.fastagLabel}>FASTag Balance</Text>
                <Text style={styles.fastagValue}>{item.fastagBalance}</Text>
              </View>

              <View style={styles.divider} />

              {/* Dynamic Status Segment */}
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  {pucStatus.isCritical ? (
                    <AlertCircle size={16} color={pucStatus.color} />
                  ) : (
                    <ShieldCheck size={16} color={pucStatus.color} />
                  )}
                  <Text style={[styles.statusText, { color: pucStatus.color }]}>
                    PUC {pucStatus.text}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleOpenDetails(item)}>
                  <Text style={styles.manageText}>Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
        
        <Text style={styles.hint}>
          {vehicles.length < 3 ? `You can add ${3 - vehicles.length} more vehicle(s). Long-press card to set primary.` : "Maximum vehicle limit reached. Long-press card to set primary."}
        </Text>
      </ScrollView>

      {/* Add New Vehicle Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Vehicle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={10}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
                <TouchableOpacity 
                    style={[styles.typeBtn, newType === 'Motorcycle' && styles.typeBtnActive]}
                    onPress={() => setNewType('Motorcycle')}
                >
                    <Bike size={18} color={newType === 'Motorcycle' ? '#0f172a' : '#64748b'} />
                    <Text style={[styles.typeBtnText, newType === 'Motorcycle' && styles.typeBtnTextActive]}>Motorcycle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.typeBtn, newType === 'Car' && styles.typeBtnActive]}
                    onPress={() => setNewType('Car')}
                >
                    <Car size={18} color={newType === 'Car' ? '#0f172a' : '#64748b'} />
                    <Text style={[styles.typeBtnText, newType === 'Car' && styles.typeBtnTextActive]}>Car</Text>
                </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Model (e.g. Triumph Speed 400)" 
              value={newModel}
              onChangeText={setNewModel}
              placeholderTextColor="#94a3b8"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Plate (e.g. JH-01-AC-9272)" 
              value={newPlate}
              onChangeText={(text) => setNewPlate(formatIndianPlate(text))}
              autoCapitalize="characters"
              placeholderTextColor="#94a3b8"
              maxLength={13}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddVehicle}>
              <Text style={styles.saveBtnText}>Save to Garage</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Live Operational Vehicle Details Modal */}
      <Modal visible={detailsModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.detailsContentHeight]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedVehicle?.model || 'Vehicle Documents'}</Text>
                <Text style={styles.modalSubtitleText}>{selectedVehicle?.plate}</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)} hitSlop={10} style={styles.closeDetailsCircle}>
                <X color="#0f172a" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailRowItem}>
                <View style={styles.detailIconContainer}>
                  <FileText size={18} color="#facc15" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabelText}>INSURANCE POLICY NO.</Text>
                  <Text style={styles.detailValueText}>{selectedVehicle?.insuranceNo || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailRowItem}>
                <View style={styles.detailIconContainer}>
                  <Activity size={18} color={checkExpiryStatus(selectedVehicle?.pucExpiry).color} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabelText}>PUC EMISSION EXPIRY</Text>
                  <Text style={styles.detailValueText}>{selectedVehicle?.pucExpiry || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailRowItem}>
                <View style={styles.detailIconContainer}>
                  <Calendar size={18} color="#2563eb" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabelText}>REGISTRATION DATE</Text>
                  <Text style={styles.detailValueText}>{selectedVehicle?.regDate || 'N/A'}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    marginBottom: 24 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#0f172a',
    letterSpacing: -0.5
  },
  subtitle: { 
    fontSize: 14, 
    color: '#64748b', 
    fontWeight: '600',
    marginTop: 2
  },
  addCircle: { 
    backgroundColor: '#facc15', 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4 
  },
  vehicleCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 28, 
    padding: 20, 
    marginHorizontal: 24,
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#edf2f7',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16 
  },
  typeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#fef9c3', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10 
  },
  typeText: { 
    fontSize: 11, 
    color: '#854d0e', 
    fontWeight: '800' 
  },
  headerActionGroup: {
    flexDirection: 'row', 
    gap: 14, 
    alignItems: 'center'
  },
  activeBadge: { 
    backgroundColor: '#e6fbf2', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  activeText: { 
    fontSize: 10, 
    color: '#10b981', 
    fontWeight: '800', 
    letterSpacing: 0.5
  },
  cardBody: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12
  },
  modelText: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#0f172a',
    letterSpacing: -0.3
  },
  plateText: { 
    fontSize: 15, 
    color: '#64748b', 
    fontWeight: '700', 
    marginTop: 2 
  },
  fastagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    marginTop: 4
  },
  fastagLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  fastagValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700'
  },
  divider: { 
    height: 1, 
    backgroundColor: '#f1f5f9', 
    marginVertical: 14 
  },
  statusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  statusItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  statusText: { 
    fontWeight: '800', 
    fontSize: 13 
  },
  manageText: { 
    color: '#2563eb', 
    fontWeight: '800', 
    fontSize: 13 
  },
  hint: { 
    textAlign: 'center', 
    color: '#94a3b8', 
    marginTop: 14, 
    fontSize: 13, 
    fontWeight: '600',
    paddingHorizontal: 24
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    paddingBottom: Platform.OS === 'ios' ? 44 : 24 
  },
  detailsContentHeight: {
    paddingBottom: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 24, 
    alignItems: 'center' 
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#0f172a' 
  },
  modalSubtitleText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 2
  },
  closeDetailsCircle: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 20
  },
  typeSelector: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  typeBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    padding: 14, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  typeBtnActive: { 
    backgroundColor: '#facc15', 
    borderColor: '#facc15' 
  },
  typeBtnText: { 
    fontWeight: '700', 
    color: '#64748b',
    fontSize: 14
  },
  typeBtnTextActive: { 
    color: '#0f172a' 
  },
  input: { 
    backgroundColor: '#f8fafc', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#0f172a', 
    borderWidth: 1, 
    borderColor: '#edf2f7' 
  },
  saveBtn: { 
    backgroundColor: '#0f172a', 
    padding: 16, 
    borderRadius: 18, 
    alignItems: 'center', 
    marginTop: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  saveBtnText: { 
    color: '#ffffff', 
    fontWeight: '900', 
    fontSize: 16 
  },
  detailRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#edf2f7'
  },
  detailTextContainer: {
    flex: 1
  },
  detailLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5
  },
  detailValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2
  }
});

export default VehicleScreen;