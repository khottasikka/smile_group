import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Calendar, Clock, IndianRupee } from 'lucide-react-native';

const HistoryScreen = () => {
  const historyData = [
    { id: '1', zone: 'Esplanade Mall', date: '21 April 2026', duration: '2h 15m', cost: 60 },
    { id: '2', zone: 'Infocity Square', date: '19 April 2026', duration: '5h 40m', cost: 120 },
    { id: '3', zone: 'Railway Station', date: '18 April 2026', duration: '1h 10m', cost: 30 },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.zoneText}>{item.zone}</Text>
        <Text style={styles.costText}>₹{item.cost}</Text>
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Calendar size={14} color="#64748b" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={14} color="#64748b" />
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Parking History</Text>
      <FlatList
        data={historyData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', padding: 20, paddingBottom: 0 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  zoneText: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  costText: { fontSize: 16, fontWeight: '800', color: '#2563eb' },
  detailsRow: { flexDirection: 'row', gap: 15 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 13, color: '#64748b' }
});

export default HistoryScreen;