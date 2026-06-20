import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Platform, FlatList, LayoutAnimation } from 'react-native';
import { Bell, Car, Power, Plus, ShieldAlert, QrCode, MapPin } from 'lucide-react-native';
import { UserContext } from '../UserContext'; 
import { MOCK_DB } from '../mockData'; 

const HomeScreen = ({ navigation }) => {
  const { user, updateBalance } = useContext(UserContext);
  const { activeSession: initialSession } = MOCK_DB;
  
  const [isActive, setIsActive] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(11520); // 3h 12m
  const [currentBill, setCurrentBill] = useState(180.14);

  // Dynamic Notification Panel States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Parking Session Active',
      description: 'Your Triumph Speed 400 has 45 mins left in Zone A.',
      time: 'Just now',
      unread: true,
    },
    {
      id: '2',
      title: 'Payment Successful',
      description: '₹250.00 deducted for parking valet booking.',
      time: '2 hours ago',
      unread: false,
    },
    {
      id: '3',
      title: 'HSRP Verified',
      description: 'Vehicle plate verification sync complete with RTO data.',
      time: 'Yesterday',
      unread: false,
    },
  ]);

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

  const toggleNotificationPanel = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Clear unread flag indicators on view panel opening trigger
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    }
  };

  const extendSession = () => {
    Alert.alert("Session Extended", "Added 30 minutes to your current slot allocation.");
  };

  const endSession = () => {
    Alert.alert(
      "End Parking Session?",
      `Final amount: ₹${currentBill.toFixed(2)} will be deducted from your wallet.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Pay & Exit", 
          onPress: () => {
            const newBalance = (user?.balance || 0) - currentBill;
            if (typeof updateBalance === 'function') {
              updateBalance(newBalance);
              setIsActive(false);
              Alert.alert("Success", "Payment processed. Safe riding!");
            } else {
              Alert.alert("Error", "Wallet system is offline. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const formatElapsed = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Splitting bill integer and decimal to match premium typography styling
  const billStr = currentBill.toFixed(2);
  const [billInteger, billDecimal] = billStr.split('.');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>GOOD MORNING</Text>
            <Text style={styles.userName}>{user?.name || 'kalakand'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={toggleNotificationPanel}>
            <Bell size={22} color="#1e293b" fill={notifications.some(n => n.unread) ? "#1e293b" : "none"} />
            {notifications.some(n => n.unread) && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>

        {/* Floating Premium Notification Center Dropdown Container */}
        {showNotifications && (
          <View style={styles.notificationDropdown}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Alerts & Notifications</Text>
              <TouchableOpacity onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowNotifications(false);
              }}>
                <Text style={styles.clearLinkText}>Dismiss</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.notificationCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardTimeText}>{item.time}</Text>
                  </View>
                  <Text style={styles.cardDescText}>{item.description}</Text>
                </View>
              )}
            />
          </View>
        )}

        {/* Vehicle Badge Pill */}
        <View style={styles.vehiclePill}>
          <Car size={16} color="#475569" style={styles.vehicleIcon} />
          <Text style={styles.vehicleNoText}>{user?.vehicleNo || 'JH 01 AC 9272'}</Text>
          <Text style={styles.pillDivider}>•</Text>
          <Text style={styles.vehicleModelText}>
            {user?.vehicleBrand && user?.vehicleModel ? `${user.vehicleBrand} ${user.vehicleModel}` : 'B  340i'}
          </Text>
        </View>

        {/* Main Session Card Area */}
        {isActive ? (
          <View style={styles.mainCard}>
            
            {/* Top Row Status indicators */}
            <View style={styles.cardHeader}>
              <View style={styles.liveStatusRow}>
                <View style={styles.greenIndicatorDot} />
                <Text style={styles.liveText}>LIVE PARKING</Text>
              </View>
              <Text style={styles.zoneText}>ZONE {initialSession.zone || 'A'}  •  PREMIUM</Text>
            </View>

            {/* Big Slot Display */}
            <View style={styles.slotContainer}>
              <Text style={styles.slotMainText}>Slot {initialSession.slotId || 'A14'}</Text>
            </View>

            {/* Visual Dashed Divider Line */}
            <View style={styles.dashedLine} />

            {/* Metrics Layer */}
            <View style={styles.metricsRow}>
              
              {/* Circular Elapsed Indicator Mock */}
              <View style={styles.timerRingOuter}>
                <View style={styles.timerRingProgress}>
                  <Text style={styles.elapsedTimeText}>{formatElapsed(secondsElapsed)}</Text>
                  <Text style={styles.elapsedLabelText}>ELAPSED</Text>
                </View>
              </View>

              {/* Financial Metrics */}
              <View style={styles.chargesContainer}>
                <Text style={styles.chargesLabel}>CURRENT CHARGES</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <Text style={styles.priceInteger}>{billInteger}</Text>
                  <Text style={styles.priceDecimal}>.{billDecimal}</Text>
                </View>
              </View>
            </View>

            {/* Dual Actions Controls */}
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.extendButton} onPress={extendSession}>
                <Plus size={16} color="#1e293b" style={{ marginRight: 4 }} />
                <Text style={styles.extendButtonText}>Extend 30m</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.endButton} onPress={endSession}>
                <Power size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.endButtonText}>End session</Text>
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.warningCircle}>
              <ShieldAlert size={36} color="#64748b" />
            </View>
            <Text style={styles.emptyTitle}>No Active Session</Text>
            <Text style={styles.emptySubtitle}>Tap map navigation to lock a secure space</Text>
            <TouchableOpacity 
              style={styles.findSlotAction}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.findSlotActionText}>Find available spaces</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Utility Grid Actions Section */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('Entry Pass')}
          >
            <View style={styles.actionIconContainer}>
              <QrCode size={22} color="#eab308" />
            </View>
            <Text style={styles.actionCardTitle}>Entry pass</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('Map')}
          >
            <View style={styles.actionIconContainer}>
              <MapPin size={22} color="#eab308" />
            </View>
            <Text style={styles.actionCardTitle}>Find slot</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 40 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  greeting: { 
    fontSize: 12, 
    color: '#94a3b8', 
    fontWeight: '700', 
    letterSpacing: 1.5 
  },
  userName: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#0f172a',
    marginTop: 2
  },
  notificationButton: { 
    backgroundColor: '#f1f5f9', 
    padding: 12, 
    borderRadius: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  notificationDot: { 
    position: 'absolute', 
    top: 10, 
    right: 12, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#ff6b6b' 
  },
  
  // Premium Overlay Droplist System Layout
  notificationDropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#edf2f7',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 5
  },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  dropdownTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  clearLinkText: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  notificationCard: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  cardTimeText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  cardDescText: { fontSize: 13, color: '#475569', lineHeight: 18 },

  vehiclePill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f1f5f9', 
    alignSelf: 'flex-start',
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 14, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  vehicleIcon: { 
    marginRight: 8 
  },
  vehicleNoText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#334155', 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  pillDivider: { 
    marginHorizontal: 8, 
    color: '#94a3b8' 
  },
  vehicleModelText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#475569' 
  },
  mainCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 32, 
    padding: 24, 
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#edf2f7'
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16
  },
  liveStatusRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  greenIndicatorDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#10b981', 
    marginRight: 6 
  },
  liveText: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#10b981', 
    letterSpacing: 0.5 
  },
  zoneText: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#64748b' 
  },
  slotContainer: { 
    marginBottom: 20 
  },
  slotMainText: { 
    fontSize: 48, 
    fontWeight: '900', 
    color: '#0f172a', 
    letterSpacing: -1 
  },
  dashedLine: { 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderStyle: 'dashed', 
    borderRadius: 1,
    marginBottom: 24 
  },
  metricsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 28
  },
  timerRingOuter: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 6, 
    borderColor: '#e2e8f0', 
    borderTopColor: '#facc15', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  timerRingProgress: { 
    alignItems: 'center' 
  },
  elapsedTimeText: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0f172a' 
  },
  elapsedLabelText: { 
    fontSize: 9, 
    fontWeight: '700', 
    color: '#94a3b8', 
    letterSpacing: 0.5, 
    marginTop: 1 
  },
  chargesContainer: { 
    alignItems: 'flex-end',
    flex: 1
  },
  chargesLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#94a3b8', 
    letterSpacing: 0.8,
    marginBottom: 4
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'baseline' 
  },
  currencySymbol: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#0f172a',
    marginRight: 2
  },
  priceInteger: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#0f172a' 
  },
  priceDecimal: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#64748b' 
  },
  controlsRow: { 
    flexDirection: 'row', 
    gap: 12 
  },
  extendButton: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: '#f1f5f9', 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 18, 
    paddingVertical: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  extendButtonText: { 
    color: '#1e293b', 
    fontWeight: '700', 
    fontSize: 14 
  },
  endButton: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: '#ff6b6b', 
    borderRadius: 18, 
    paddingVertical: 16, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  endButtonText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 14 
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#edf2f7',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  actionIconContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  emptyCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 32, 
    padding: 32, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderStyle: 'dashed' 
  },
  warningCircle: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#f1f5f9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0f172a', 
    marginBottom: 6 
  },
  emptySubtitle: { 
    fontSize: 13, 
    color: '#94a3b8', 
    textAlign: 'center', 
    marginBottom: 24, 
    paddingHorizontal: 20 
  },
  findSlotAction: { 
    backgroundColor: '#2563eb', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 14 
  },
  findSlotActionText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 14 
  }
});

export default HomeScreen;