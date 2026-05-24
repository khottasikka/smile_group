import React, { useContext } from 'react'; // Added useContext
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { ShieldCheck, Info, X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { UserContext } from '../UserContext'; // Added Context Import

const QRScreen = ({ navigation }) => {
  const { user } = useContext(UserContext); // Get real user data

  // Dynamic QR data based on registration
  const qrData = JSON.stringify({
    vehicle: user?.vehicleBrand || "Not Registered",
    plate: user?.vehicleNo || "N/A",
    userId: user?.name || "Guest",
    timestamp: new Date().toISOString()
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.closeBtn} 
        onPress={() => navigation.goBack()}
      >
        <X size={24} color="#64748b" />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.header}>
          <ShieldCheck color="#22c55e" size={28} />
          <Text style={styles.headerTitle}>Verified Entry Pass</Text>
        </View>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={220}
            color="#0f172a"
            backgroundColor="transparent"
          />
        </View>

        {/* Dynamically shows the Plate Number registered by the user */}
        <Text style={styles.vehicleNo}>{user?.vehicleNo || 'XX-00-XX-0000'}</Text>
        
        {/* Personalized instruction */}
        <Text style={styles.instruction}>
          Hey {user?.name || 'User'}, scan this code at the gate sensor to enter or exit.
        </Text>

        <View style={styles.infoBox}>
          <Info size={18} color="#2563eb" />
          <Text style={styles.infoText}>Valid until 11:59 PM today</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', padding: 20 },
  closeBtn: { position: 'absolute', top: 50, right: 30, zIndex: 10 }, 
  card: { backgroundColor: '#ffffff', borderRadius: 30, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  qrContainer: { padding: 20, backgroundColor: '#f8fafc', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  vehicleNo: { fontSize: 24, fontWeight: '900', color: '#0f172a', letterSpacing: 1 },
  instruction: { textAlign: 'center', color: '#64748b', marginTop: 15, lineHeight: 22 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 30, backgroundColor: '#eff6ff', padding: 12, borderRadius: 12 },
  infoText: { color: '#2563eb', fontWeight: '600', fontSize: 14 }
});

export default QRScreen;