import React, { useState, useContext, useEffect } from 'react'; // Added useContext, useEffect
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Plus, Bike, ShieldCheck, X, Car, Trash2, ChevronRight } from 'lucide-react-native';
import { UserContext } from '../UserContext'; // Import your context

const VehicleScreen = () => {
  const { user } = useContext(UserContext); // Access the registered vehicle
  const [vehicles, setVehicles] = useState([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('Motorcycle');

  // Load the registered vehicle from Context on startup
  useEffect(() => {
    if (user && user.vehicleNo) {
      const initialVehicle = {
        id: 'primary-reg',
        model: user.vehicleBrand || 'My Vehicle',
        plate: user.vehicleNo,
        type: user.vehicleType || 'Car',
        isPrimary: true
      };
      setVehicles([initialVehicle]);
    }
  }, [user]);

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
      isPrimary: vehicles.length === 0
    };

    setVehicles([...vehicles, newVehicle]);
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
          onPress: () => setVehicles(vehicles.filter(v => v.id !== id)),
          style: "destructive" 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {vehicles.map((item) => (
          <View key={item.id} style={styles.vehicleCard}>
            <View style={styles.cardHeader}>
              <View style={styles.typeBadge}>
                {item.type === 'Motorcycle' || item.type === 'Bike' ? <Bike size={14} color="#2563eb" /> : <Car size={14} color="#2563eb" />}
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
              
              <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                {item.isPrimary && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeText}>Primary</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => confirmDelete(item.id, item.model)} hitSlop={10}>
                  <Trash2 size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardBody}>
               <View>
                <Text style={styles.modelText}>{item.model}</Text>
                <Text style={styles.plateText}>{item.plate}</Text>
               </View>
               <ChevronRight size={20} color="#cbd5e1" />
            </View>

            <View style={styles.divider} />

            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <ShieldCheck size={16} color="#22c55e" />
                <Text style={styles.statusText}>Insurance Active</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.manageText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        <Text style={styles.hint}>
          {vehicles.length < 3 ? `You can add ${3 - vehicles.length} more vehicle(s).` : "Maximum vehicle limit reached."}
        </Text>
      </ScrollView>

      {/* Modal remains the same */}
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
                    <Bike size={20} color={newType === 'Motorcycle' ? '#fff' : '#64748b'} />
                    <Text style={[styles.typeBtnText, newType === 'Motorcycle' && styles.typeBtnTextActive]}>Motorcycle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.typeBtn, newType === 'Car' && styles.typeBtnActive]}
                    onPress={() => setNewType('Car')}
                >
                    <Car size={20} color={newType === 'Car' ? '#fff' : '#64748b'} />
                    <Text style={[styles.typeBtnText, newType === 'Car' && styles.typeBtnTextActive]}>Car</Text>
                </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Model (e.g. Scorpio N)" 
              value={newModel}
              onChangeText={setNewModel}
              placeholderTextColor="#94a3b8"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Plate (e.g. OD-02-F-9901)" 
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
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  addCircle: { backgroundColor: '#2563eb', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  vehicleCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  typeText: { fontSize: 12, color: '#2563eb', fontWeight: '800' },
  activeBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  activeText: { fontSize: 11, color: '#166534', fontWeight: '800', textTransform: 'uppercase' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modelText: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  plateText: { fontSize: 16, color: '#64748b', fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { color: '#22c55e', fontWeight: '700', fontSize: 13 },
  manageText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },
  hint: { textAlign: 'center', color: '#94a3b8', marginTop: 10, fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  typeBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeBtnText: { fontWeight: '700', color: '#64748b' },
  typeBtnTextActive: { color: '#fff' },
  input: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 14, marginBottom: 12, fontSize: 16, fontWeight: '600', color: '#0f172a', borderWidth: 1, borderColor: '#f1f5f9' },
  saveBtn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});

export default VehicleScreen;