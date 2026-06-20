import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Modal, Alert } from 'react-native';
import { CreditCard, ArrowUpRight, Plus, X, CheckCircle2 } from 'lucide-react-native';
import { UserContext } from '../UserContext';

const WalletScreen = () => {
  const { user, updateBalance } = useContext(UserContext);
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(200);

  // Convert transactions array to local state so new activity items render instantly
  const [transList, setTransList] = useState([
    { id: '1', title: 'Parking • Zone A', date: '24 APR', amount: '−₹40', type: 'expense' },
    { id: '2', title: 'Wallet Top-up', date: '22 APR', amount: '+₹500', type: 'income' },
    { id: '3', title: 'Parking • Esplanade Mall', date: '20 APR', amount: '−₹60', type: 'expense' },
  ]);

  // Safely grab balance configuration metrics from context
  const currentBalance = user?.balance !== undefined ? user.balance : 500.00;
  const balanceStr = currentBalance.toFixed(2);
  const [balanceInteger, balanceDecimal] = balanceStr.split('.');

  const handleAddMoney = () => {
    const newBalance = currentBalance + selectedAmount;
    if (typeof updateBalance === 'function') {
      updateBalance(newBalance);

      // Create a fresh transaction entry to insert into the view timeline
      const newTx = {
        id: String(Date.now()), 
        title: 'Wallet Top-up',
        date: 'TODAY',
        amount: `+₹${selectedAmount}`,
        type: 'income'
      };

      // Prepend the new transaction to the top of your recent activities array
      setTransList([newTx, ...transList]);
      setAddMoneyVisible(false);
      
      Alert.alert(
        "Top-up Successful", 
        `₹${selectedAmount} has been added to your wallet. New balance: ₹${newBalance.toFixed(2)}`
      );
    } else {
      Alert.alert("System Error", "Wallet system context provider is offline.");
    }
  };

  const handleManageMethods = () => {
    Alert.alert(
      "Payment Methods", 
      "Manage cards, UPI profiles, and auto-debit triggers seamlessly.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Screen Header Label */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleManageMethods}>
            <CreditCard size={20} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* Ticket-Stub Balance Card */}
        <View style={styles.ticketCard}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          
          <View style={styles.balanceRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.balanceIntegerText}>{balanceInteger}</Text>
            <Text style={styles.balanceDecimalText}>.{balanceDecimal}</Text>
          </View>

          {/* Ticket-Stub Perforated Dashed Line Divider */}
          <View style={styles.perforatedLine} />

          {/* Action Row Container */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.addMoneyBtn} onPress={() => setAddMoneyVisible(true)}>
              <Plus size={16} color="#0f172a" style={{ marginRight: 4 }} />
              <Text style={styles.addMoneyText}>Add money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.methodsBtn} onPress={handleManageMethods}>
              <CreditCard size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.methodsText}>Methods</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats Grid Dashboard Layer */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SPENT THIS MONTH</Text>
            <Text style={styles.statValueSpent}>₹120</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SESSIONS</Text>
            <Text style={styles.statValueSessions}>12</Text>
          </View>
        </View>

        {/* Recent Transactions Receipt-Style Container */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <View style={styles.dividerLine} />

          {transList.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={[styles.transIconBox, item.type === 'income' && styles.incomeIconBox]}>
                <ArrowUpRight size={18} color={item.type === 'income' ? '#10b981' : '#475569'} />
              </View>
              
              <View style={styles.transDetails}>
                <Text style={styles.transTitle}>{item.title}</Text>
                <Text style={styles.transDate}>{item.date}</Text>
              </View>

              <Text style={[styles.transAmount, item.type === 'income' && styles.incomeAmountText]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* QUICK ADD MONEY SLIDE-UP BOTTOM SHEET */}
      <Modal visible={addMoneyVisible} transparent animationType="slide" onRequestClose={() => setAddMoneyVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalMetaLabel}>TOP-UP ACCOUNT</Text>
                <Text style={styles.modalMainTitle}>Add Money</Text>
              </View>
              <TouchableOpacity style={styles.closeCircleBadge} onPress={() => setAddMoneyVisible(false)}>
                <X size={20} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.innerSectionLabel}>SELECT AMOUNT</Text>

            {/* Quick Presets Grid */}
            <View style={styles.presetRow}>
              {[100, 200, 500, 1000].map((amt) => (
                <TouchableOpacity 
                  key={amt} 
                  style={[styles.presetPill, selectedAmount === amt && styles.activePresetPill]}
                  onPress={() => setSelectedAmount(amt)}
                >
                  <Text style={[styles.presetText, selectedAmount === amt && styles.activePresetText]}>+₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Summary display line */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Deducted via default card</Text>
              <Text style={styles.summaryValue}>₹{selectedAmount}.00</Text>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity style={styles.confirmTopUpBtn} onPress={handleAddMoney}>
              <CheckCircle2 size={18} color="#0f172a" style={{ marginRight: 8 }} />
              <Text style={styles.confirmTopUpText}>Confirm Payment</Text>
            </TouchableOpacity>

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
  scrollContent: { 
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 40 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a'
  },
  headerIconButton: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  ticketCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 32, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#edf2f7',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3
  },
  balanceLabel: { 
    color: '#94a3b8', 
    fontSize: 11, 
    fontWeight: '800',
    letterSpacing: 0.8
  },
  balanceRow: { 
    flexDirection: 'row', 
    alignItems: 'baseline',
    marginTop: 16,
    marginBottom: 20
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 2
  },
  balanceIntegerText: { 
    color: '#0f172a', 
    fontSize: 44, 
    fontWeight: '900',
    letterSpacing: -1
  },
  balanceDecimalText: { 
    color: '#64748b', 
    fontSize: 22, 
    fontWeight: '700' 
  },
  perforatedLine: { 
    borderWidth: 0.75, 
    borderColor: '#e2e8f0', 
    borderStyle: 'dashed', 
    borderRadius: 1,
    marginBottom: 20
  },
  actionRow: { 
    flexDirection: 'row', 
    gap: 12 
  },
  addMoneyBtn: { 
    flex: 1.1, 
    backgroundColor: '#facc15', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderRadius: 18, 
    justifyContent: 'center'
  },
  addMoneyText: { 
    color: '#0f172a', 
    fontWeight: '800', 
    fontSize: 14 
  },
  methodsBtn: { 
    flex: 1, 
    backgroundColor: '#1e293b', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderRadius: 18, 
    justifyContent: 'center'
  },
  methodsText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 14 
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 16, 
    marginTop: 16 
  },
  statBox: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#edf2f7'
  },
  statLabel: { 
    color: '#94a3b8', 
    fontSize: 10, 
    fontWeight: '800',
    letterSpacing: 0.5
  },
  statValueSpent: { 
    color: '#ff6b6b', 
    fontSize: 24, 
    fontWeight: '900', 
    marginTop: 8 
  },
  statValueSessions: { 
    color: '#0f172a', 
    fontSize: 24, 
    fontWeight: '900', 
    marginTop: 8 
  },
  section: { 
    marginTop: 32 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#94a3b8',
    letterSpacing: 1
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 12,
    marginBottom: 8
  },
  transactionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9'
  },
  transIconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 14, 
    backgroundColor: '#f1f5f9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  incomeIconBox: {
    backgroundColor: '#e6fbf2'
  },
  transDetails: { 
    flex: 1, 
    marginLeft: 16 
  },
  transTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#0f172a' 
  },
  transDate: { 
    fontSize: 11, 
    color: '#94a3b8', 
    fontWeight: '700',
    marginTop: 2 
  },
  transAmount: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#0f172a' 
  },
  incomeAmountText: {
    color: '#10b981'
  },

  // Modal Slide Sheet Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.3)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 36, 
    borderTopRightRadius: 36, 
    padding: 24, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24 
  },
  modalHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 24 
  },
  modalMetaLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#94a3b8', 
    letterSpacing: 0.5 
  },
  modalMainTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#0f172a', 
    marginTop: 2 
  },
  closeCircleBadge: { 
    backgroundColor: '#f1f5f9', 
    padding: 8, 
    borderRadius: 50 
  },
  innerSectionLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#94a3b8', 
    letterSpacing: 1, 
    marginBottom: 12 
  },
  presetRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 24 
  },
  presetPill: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 14, 
    backgroundColor: '#f1f5f9', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  activePresetPill: { 
    backgroundColor: '#ffffff', 
    borderColor: '#facc15', 
    borderWidth: 2 
  },
  presetText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#475569' 
  },
  activePresetText: { 
    color: '#0f172a', 
    fontWeight: '800' 
  },
  summaryBox: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc', 
    borderRadius: 20, 
    padding: 18, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    marginBottom: 24 
  },
  summaryLabel: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#64748b' 
  },
  summaryValue: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0f172a' 
  },
  confirmTopUpBtn: { 
    backgroundColor: '#facc15', 
    height: 56, 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  confirmTopUpText: { 
    color: '#0f172a', 
    fontSize: 15, 
    fontWeight: '800' 
  }
});

export default WalletScreen;