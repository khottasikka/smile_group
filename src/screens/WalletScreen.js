import React, { useContext } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Dimensions 
} from 'react-native';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, History } from 'lucide-react-native';
// 1. Import the Context
import { UserContext } from '../UserContext';

const WalletScreen = () => {
  // 2. Consume the UserContext
  const { user } = useContext(UserContext);

  const transactions = [
    { id: '1', title: 'Parking - Zone A', date: '24 April', amount: '-₹40', type: 'expense' },
    { id: '2', title: 'Wallet Top-up', date: '22 April', amount: '+₹500', type: 'income' },
    { id: '3', title: 'Parking - Mall Mall', date: '20 April', amount: '-₹60', type: 'expense' },
    { id: '4', title: 'Parking - Hospital', date: '18 April', amount: '-₹20', type: 'expense' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          {/* 3. Updated to show dynamic user name */}
          <Text style={styles.balanceLabel}>{user.name}'s Balance</Text>
          {/* 4. Updated to show dynamic balance from context */}
          <Text style={styles.balanceAmount}>₹{user.balance}.00</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.iconCircle}><Plus size={20} color="#2563eb" /></View>
              <Text style={styles.actionText}>Add Money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.iconCircle}><CreditCard size={20} color="#2563eb" /></View>
              <Text style={styles.actionText}>Methods</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <ArrowUpRight size={20} color="#22c55e" />
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>₹120</Text>
          </View>
          <View style={styles.statBox}>
            <History size={20} color="#2563eb" />
            <Text style={styles.statLabel}>Sessions</Text>
            <Text style={styles.statValue}>12</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
          </View>

          {transactions.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={[styles.transIcon, { backgroundColor: item.type === 'expense' ? '#fee2e2' : '#dcfce7' }]}>
                {item.type === 'expense' ? <ArrowUpRight size={18} color="#ef4444" /> : <ArrowDownLeft size={18} color="#22c55e" />}
              </View>
              <View style={styles.transDetails}>
                <Text style={styles.transTitle}>{item.title}</Text>
                <Text style={styles.transDate}>{item.date}</Text>
              </View>
              <Text style={[styles.transAmount, { color: item.type === 'expense' ? '#0f172a' : '#22c55e' }]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  balanceCard: { backgroundColor: '#2563eb', borderRadius: 30, padding: 25, elevation: 8, shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 15 },
  balanceLabel: { color: '#bfdbfe', fontSize: 16, fontWeight: '600' },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginVertical: 10 },
  actionRow: { flexDirection: 'row', gap: 15, marginTop: 15 },
  actionBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, gap: 10 },
  iconCircle: { backgroundColor: '#fff', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', marginTop: 5 },
  statValue: { color: '#0f172a', fontSize: 18, fontWeight: '800', marginTop: 2 },
  section: { marginTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  viewAll: { color: '#2563eb', fontWeight: '700' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 12 },
  transIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transDetails: { flex: 1, marginLeft: 15 },
  transTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  transDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: '800' }
});

export default WalletScreen;