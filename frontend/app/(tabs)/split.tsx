import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Wallet, ArrowUpRight, ArrowDownLeft, Receipt, Users } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';

export default function SplitScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PullToRefreshCar scrollY={scrollY} />

      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Balance Summary Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.tint }]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Wallet stroke="#fff" size={20} />
          </View>
          <Text style={styles.balanceAmount}>+$185.00</Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStatItem}>
              <ArrowUpRight stroke="#fff" size={16} />
              <Text style={styles.balanceStatText}>You are owed $240</Text>
            </View>
            <View style={styles.balanceStatItem}>
              <ArrowDownLeft stroke="#fff" size={16} />
              <Text style={styles.balanceStatText}>You owe $55</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Receipt stroke={colors.tint} size={20} />
            <Text style={[styles.actionText, { color: colors.text }]}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Users stroke={colors.secondary} size={20} />
            <Text style={[styles.actionText, { color: colors.text }]}>Settle Up</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Balances</Text>
        
        {/* Group Items */}
        <TouchableOpacity style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.groupInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.tint }]}>SA</Text>
            </View>
            <View>
              <Text style={[styles.groupName, { color: colors.text }]}>Swiss Alps Adventure</Text>
              <Text style={[styles.groupMembers, { color: colors.tabIconDefault }]}>4 members</Text>
            </View>
          </View>
          <View style={styles.groupBalance}>
            <Text style={[styles.oweText, { color: colors.secondary }]}>you are owed</Text>
            <Text style={[styles.oweAmount, { color: colors.secondary }]}>$120.00</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.groupInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>PB</Text>
            </View>
            <View>
              <Text style={[styles.groupName, { color: colors.text }]}>Paris Break</Text>
              <Text style={[styles.groupMembers, { color: colors.tabIconDefault }]}>2 members</Text>
            </View>
          </View>
          <View style={styles.groupBalance}>
            <Text style={[styles.oweText, { color: colors.accent }]}>you owe</Text>
            <Text style={[styles.oweAmount, { color: colors.accent }]}>$35.00</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.expenseItem, { borderBottomColor: colors.border }]}>
            <View style={styles.expenseLeft}>
              <View style={styles.dateBox}>
                <Text style={[styles.dateMonth, { color: colors.tabIconDefault }]}>JUL</Text>
                <Text style={[styles.dateDay, { color: colors.text }]}>{14 + i}</Text>
              </View>
              <View>
                <Text style={[styles.expenseTitle, { color: colors.text }]}>Hotel Bellevue</Text>
                <Text style={[styles.expenseSub, { color: colors.tabIconDefault }]}>Paid by you</Text>
              </View>
            </View>
            <View style={styles.expenseRight}>
              <Text style={[styles.expenseYouLent, { color: colors.tabIconDefault }]}>you lent</Text>
              <Text style={[styles.expenseAmount, { color: colors.secondary }]}>$45.00</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 100,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    gap: 16,
  },
  balanceStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceStatText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  groupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  groupName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  groupMembers: {
    fontSize: 12,
    marginTop: 2,
  },
  groupBalance: {
    alignItems: 'flex-end',
  },
  oweText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  oweAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateBox: {
    alignItems: 'center',
    width: 40,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateDay: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  expenseSub: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseYouLent: {
    fontSize: 11,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
