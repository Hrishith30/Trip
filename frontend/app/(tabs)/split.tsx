import React, { useRef, useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Wallet, ArrowUpRight, ArrowDownLeft, Receipt, Users, Plus, X, Coffee, Plane, Home, Car, MoreHorizontal, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: 'Food' | 'Transport' | 'Hotel' | 'Activities' | 'Other';
  paidBy: 'You' | 'Other';
  lent: number;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', title: 'Hotel Bellevue', amount: 450.00, date: '2026-07-15', category: 'Hotel', paidBy: 'You', lent: 225.00 },
  { id: '2', title: 'Mountain Cafe', amount: 60.00, date: '2026-07-16', category: 'Food', paidBy: 'Other', lent: -30.00 },
  { id: '3', title: 'Zermatt Train', amount: 120.00, date: '2026-07-17', category: 'Transport', paidBy: 'You', lent: 60.00 },
];

export default function SplitScreen() {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Reset scroll position when screen is focused
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      
      return () => {
        // Also reset when leaving to ensure it's at top for next time
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      };
    }, [])
  );
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [modalVisible, setModalVisible] = useState(false);
  const [settleModalVisible, setSettleModalVisible] = useState(false);
  
  // Form State
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Food' as Expense['category'],
    paidBy: 'You' as Expense['paidBy']
  });

  const totals = useMemo(() => {
    let owed = 0;
    let owe = 0;
    expenses.forEach(e => {
      if (e.lent > 0) owed += e.lent;
      else owe += Math.abs(e.lent);
    });
    return { owed, owe, total: owed - owe };
  }, [expenses]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount) {
      Alert.alert('Missing Info', 'Please enter a title and amount.');
      return;
    }

    const amountNum = parseFloat(newExpense.amount);
    const lent = newExpense.paidBy === 'You' ? amountNum / 2 : -(amountNum / 2);

    const expense: Expense = {
      id: Date.now().toString(),
      title: newExpense.title,
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      category: newExpense.category,
      paidBy: newExpense.paidBy,
      lent: lent
    };

    setExpenses([expense, ...expenses]);
    setModalVisible(false);
    setNewExpense({ title: '', amount: '', category: 'Food', paidBy: 'You' });
  };

  const handleSettleUp = () => {
    Alert.alert(
      'Settle All Debts',
      `You are about to settle your net balance of $${Math.abs(totals.total).toFixed(2)}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Settle Up', 
          onPress: () => {
            setExpenses([]);
            setSettleModalVisible(false);
            Alert.alert('Success', 'All balances have been settled!');
          } 
        }
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return <Coffee size={18} color={colors.tint} />;
      case 'Transport': return <Car size={18} color={colors.tint} />;
      case 'Hotel': return <Home size={18} color={colors.tint} />;
      case 'Activities': return <Plane size={18} color={colors.tint} />;
      default: return <MoreHorizontal size={18} color={colors.tint} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <PullToRefreshCar scrollY={scrollY} />

      <Animated.ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        onScrollEndDrag={(e) => { if (e.nativeEvent.contentOffset.y < -100 && !refreshing) handleRefresh(); }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Split Bills</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Manage shared travel costs</Text>
        </View>

        {/* Balance Summary Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.tint }]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Wallet stroke="#fff" size={20} />
          </View>
          <Text style={styles.balanceAmount}>
            {totals.total >= 0 ? '+' : '-'}${Math.abs(totals.total).toFixed(2)}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStatItem}>
              <ArrowUpRight stroke="#fff" size={16} />
              <Text style={styles.balanceStatText}>You are owed ${totals.owed.toFixed(0)}</Text>
            </View>
            <View style={styles.balanceStatItem}>
              <ArrowDownLeft stroke="#fff" size={16} />
              <Text style={styles.balanceStatText}>You owe ${totals.owe.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setModalVisible(true)}
          >
            <Receipt stroke={colors.tint} size={20} />
            <Text style={[styles.actionText, { color: colors.text }]}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleSettleUp}
          >
            <CheckCircle2 stroke={colors.secondary} size={20} />
            <Text style={[styles.actionText, { color: colors.text }]}>Settle Up</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
        {expenses.length > 0 ? expenses.map((expense) => (
          <View key={expense.id} style={[styles.expenseItem, { borderBottomColor: colors.border }]}>
            <View style={styles.expenseLeft}>
              <View style={[styles.categoryBox, { backgroundColor: colors.tint + '15' }]}>
                {getCategoryIcon(expense.category)}
              </View>
              <View>
                <Text style={[styles.expenseTitle, { color: colors.text }]}>{expense.title}</Text>
                <Text style={[styles.expenseSub, { color: colors.tabIconDefault }]}>
                  {expense.paidBy === 'You' ? 'Paid by you' : 'Paid by others'}
                </Text>
              </View>
            </View>
            <View style={styles.expenseRight}>
              <Text style={[styles.expenseYouLent, { color: colors.tabIconDefault }]}>
                {expense.lent > 0 ? 'you lent' : 'you owe'}
              </Text>
              <Text style={[styles.expenseAmount, { color: expense.lent > 0 ? colors.secondary : colors.accent }]}>
                ${Math.abs(expense.lent).toFixed(2)}
              </Text>
            </View>
          </View>
        )) : (
          <View style={styles.emptyState}>
            <Receipt size={48} color={colors.border} />
            <Text style={{ color: colors.tabIconDefault, marginTop: 12, fontWeight: '600' }}>No expenses yet</Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formItem}>
                <Text style={[styles.label, { color: colors.tabIconDefault }]}>Description</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="What was it for?"
                  placeholderTextColor={colors.tabIconDefault}
                  value={newExpense.title}
                  onChangeText={(text) => setNewExpense(f => ({ ...f, title: text }))}
                />
              </View>

              <View style={styles.formItem}>
                <Text style={[styles.label, { color: colors.tabIconDefault }]}>Amount ($)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.tabIconDefault}
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense(f => ({ ...f, amount: text }))}
                />
              </View>

              <Text style={[styles.label, { color: colors.tabIconDefault }]}>Category</Text>
              <View style={styles.categoryRow}>
                {(['Food', 'Transport', 'Hotel', 'Activities', 'Other'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryBtn, { borderColor: colors.border }, newExpense.category === cat && { backgroundColor: colors.tint, borderColor: colors.tint }]}
                    onPress={() => setNewExpense(f => ({ ...f, category: cat }))}
                  >
                    <Text style={[styles.categoryText, { color: newExpense.category === cat ? '#fff' : colors.text }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.tabIconDefault, marginTop: 24 }]}>Who paid?</Text>
              <View style={styles.payerRow}>
                <TouchableOpacity
                  style={[styles.payerBtn, { borderColor: colors.border }, newExpense.paidBy === 'You' && { backgroundColor: colors.tint, borderColor: colors.tint }]}
                  onPress={() => setNewExpense(f => ({ ...f, paidBy: 'You' }))}
                >
                  <Text style={{ color: newExpense.paidBy === 'You' ? '#fff' : colors.text, fontWeight: '700' }}>You paid</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.payerBtn, { borderColor: colors.border }, newExpense.paidBy === 'Other' && { backgroundColor: colors.tint, borderColor: colors.tint }]}
                  onPress={() => setNewExpense(f => ({ ...f, paidBy: 'Other' }))}
                >
                  <Text style={{ color: newExpense.paidBy === 'Other' ? '#fff' : colors.text, fontWeight: '700' }}>Someone else paid</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.tint }]} onPress={handleAddExpense}>
                <Text style={styles.saveBtnText}>Save Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 10 },
  header: { marginBottom: 32, alignItems: 'flex-start' },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, textAlign: 'left' },
  subtitle: { fontSize: 15, marginTop: 4, fontWeight: '600', textAlign: 'left' },
  balanceCard: { padding: 24, borderRadius: 24, marginBottom: 24, elevation: 12, shadowOpacity: 0.3, shadowRadius: 15 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
  balanceStats: { flexDirection: 'row', gap: 16 },
  balanceStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  balanceStatText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 18, borderWidth: 1 },
  actionText: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  expenseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  expenseLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  categoryBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  expenseTitle: { fontSize: 15, fontWeight: '700' },
  expenseSub: { fontSize: 13, marginTop: 2 },
  expenseRight: { alignItems: 'flex-end' },
  expenseYouLent: { fontSize: 11, fontWeight: '500' },
  expenseAmount: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  formItem: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { height: 56, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  categoryText: { fontSize: 13, fontWeight: '700' },
  payerRow: { flexDirection: 'row', gap: 10 },
  payerBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  saveBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 32, marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  emptyState: { alignItems: 'center', padding: 60 },
});
