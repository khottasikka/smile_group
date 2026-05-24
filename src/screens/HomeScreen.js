import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { Wallet, Clock, MapPin, QrCode, User as UserIcon, Power, ChevronRight } from 'lucide-react-native';
import { UserContext } from '../UserContext'; 
import { MOCK_DB } from '../mockData'; 

const HomeScreen = ({ navigation }) => {
  // Pull user and updateBalance from Context
  const { user, updateBalance } = useContext(UserContext);
  
  const { activeSession: initialSession } = MOCK_DB;
  
  const [isActive, setIsActive] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(11520); 
  const [currentBill, setCurrentBill] = useState(initialSession.currentBill);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        setCurrentBill(prev => prev + 0.01);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const endSession = () => {
    Alert.alert(
      "End Parking Session?",
      `Final amount: ₹${currentBill.toFixed(2)} will be deducted from your wallet.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Pay & Exit", 
          onPress: () => {
            // SAFE CALL: Calculate new balance locally first
            const newBalance = (user?.balance || 0) - currentBill;

            // Check if updateBalance exists before calling to prevent crash
            if (typeof updateBalance === 'function') {
              updateBalance(newBalance);
              setIsActive(false);
              Alert.alert("Success", "Payment processed. Safe riding!");
            } else {
              // Fallback error message if context is still disconnected
              Alert.alert("Error", "Wallet system is offline. Please try again.");
              console.error("updateBalance is undefined in HomeScreen");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBadge}
            onPress={() => navigation.navigate('Profile')}
          >
            <UserIcon size={16} color="#2563eb" style={{marginRight: 6}} />
            <Text style={styles.vehicleText}>{user?.vehicleNo || 'No Vehicle'}</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        <TouchableOpacity 
          style={styles.walletCard}
          onPress={() => navigation.navigate('Wallet')}
          activeOpacity={0.9}
        >
          <View>
            <View style={styles.walletInfo}>
              <Wallet color="#2563eb" size={18} />
              <Text style={styles.walletLabel}>Available Balance</Text>
            </View>
            <Text style={styles.walletAmount}>
              ₹{(user?.balance || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.topUpContainer}>
            <View style={styles.topUpBtn}>
              <Text style={styles.topUpText}>Top Up</Text>
              <ChevronRight size={14} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Session Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Session</Text>
          {isActive && <View style={styles.liveIndicator} />}
        </View>

        {isActive ? (
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.statusBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.statusText}>Live Parking</Text>
              </View>
              <Text style={styles.zoneText}>{initialSession.zone}</Text>
            </View>

            <View style={styles.billContainer}>
              <Text style={styles.billLabel}>Current Charges</Text>
              <Text style={styles.billAmount}>₹{currentBill.toFixed(2)}</Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Clock size={18} color="#2563eb" />
                <View>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{formatTime(secondsElapsed)}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <MapPin size={18} color="#2563eb" />
                <View>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>Slot {initialSession.slotId}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.endBtn} onPress={endSession}>
              <Power size={18} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.endBtnText}>End Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptySessionCard}>
            <View style={styles.emptyIconCircle}>
              <MapPin size={32} color="#94a3b8" />
            </View>
            <Text style={styles.emptyText}>No active parking session</Text>
            <Text style={styles.emptySubText}>Find a safe spot to park your vehicle</Text>
            <TouchableOpacity 
              style={styles.findBtn} 
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.findBtnText}>Find a Slot</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, {marginTop: 25}]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Entry Pass')}
          >
            <View style={[styles.actionIcon, {backgroundColor: '#eff6ff'}]}>
              <QrCode color="#2563eb" size={24} />
            </View>
            <Text style={styles.actionLabel}>Entry Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Map')}
          >
            <View style={[styles.actionIcon, {backgroundColor: '#f0fdf4'}]}>
              <MapPin color="#22c55e" size={24} />
            </View>
            <Text style={styles.actionLabel}>Find Slot</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: Platform.OS === 'android' ? 10 : 0 },
  greeting: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  profileBadge: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, alignItems: 'center' },
  vehicleText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },
  walletCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25, elevation: 4, shadowColor: '#2563eb', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 10 },
  walletInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  walletLabel: { color: '#64748b', fontWeight: '600', fontSize: 12 },
  walletAmount: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  topUpBtn: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 4 },
  topUpText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  sessionCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pulseDot: { width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: 4, marginRight: 6 },
  statusText: { color: '#166534', fontSize: 11, fontWeight: '700' },
  zoneText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  billContainer: { alignItems: 'center', marginBottom: 20 },
  billLabel: { color: '#64748b', fontSize: 13, marginBottom: 2 },
  billAmount: { fontSize: 42, fontWeight: '900', color: '#0f172a' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15, marginBottom: 15 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  detailLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  detailValue: { color: '#334155', fontWeight: '700', fontSize: 14 },
  endBtn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  endBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  emptySessionCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  emptyIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emptyText: { color: '#1e293b', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySubText: { color: '#94a3b8', fontSize: 13, marginBottom: 20 },
  findBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  findBtnText: { color: '#fff', fontWeight: '700' },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, backgroundColor: '#ffffff', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  actionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontWeight: '700', color: '#475569', fontSize: 13 }
});

export default HomeScreen;