import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Animated, Image, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { TrendingUp, Users, Search, Bell, MapPin, Calendar, ArrowRight, Receipt, Plane } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';

export default function Dashboard() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const StatCard = ({ icon: Icon, value, label, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon stroke={color} size={20} />
      </View>
      <View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>{label}</Text>
      </View>
    </View>
  );

  const ExpenseItem = ({ title, sub, amount, type }: any) => (
    <View style={[styles.expenseItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.expenseIcon, { backgroundColor: colors.border + '50' }]}>
        <Receipt size={18} stroke={colors.icon} />
      </View>
      <View style={styles.expenseMain}>
        <Text style={[styles.expenseTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.expenseSub, { color: colors.tabIconDefault }]}>{sub}</Text>
      </View>
      <Text style={[styles.expenseAmount, { color: type === 'gain' ? colors.secondary : colors.accent }]}>
        {type === 'gain' ? '+' : '-'}${amount}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PullToRefreshCar scrollY={scrollY} />

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>{getGreeting()},</Text>
              <Text style={[styles.name, { color: colors.text }]}>Hrishith!</Text>
            </View>
            <TouchableOpacity style={[styles.profileButton, { borderColor: colors.border }]}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }} 
                style={styles.avatar} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Search size={20} stroke={colors.tabIconDefault} />
            <Text style={[styles.searchPlaceholder, { color: colors.tabIconDefault }]}>Search trips or expenses...</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon={TrendingUp} 
            value="$240.00" 
            label="Total Owed" 
            color={colors.secondary} 
          />
          <StatCard 
            icon={Plane} 
            value="2" 
            label="Upcoming" 
            color={colors.tint} 
          />
        </View>

        {/* Featured Active Trip */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Trip</Text>
          <TouchableOpacity>
            <Text style={{ color: colors.tint, fontWeight: '600' }}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.featuredTrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.tripImage} 
          />
          <View style={styles.tripOverlay}>
            <View style={styles.tripBadge}>
              <Text style={styles.tripBadgeText}>In 3 days</Text>
            </View>
            <View style={styles.tripDetails}>
              <Text style={styles.featuredTripName}>Summer in Switzerland</Text>
              <View style={styles.tripMeta}>
                <View style={styles.metaItem}>
                  <MapPin size={14} stroke="#fff" />
                  <Text style={styles.metaText}>Zermatt</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={14} stroke="#fff" />
                  <Text style={styles.metaText}>4 Friends</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recent Expenses Feed */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24, marginBottom: 16 }]}>Recent Activity</Text>
        <View style={[styles.expenseList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ExpenseItem title="Dinner at Zermatt" sub="Split with 4 people" amount="45.00" type="loss" />
          <ExpenseItem title="Train Tickets" sub="Paid by Hrishith" amount="120.00" type="gain" />
          <ExpenseItem title="Ski Rental" sub="Personal expense" amount="30.00" type="loss" />
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={[styles.viewMoreText, { color: colors.tabIconDefault }]}>View All Activity</Text>
            <ArrowRight size={16} stroke={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuredTrip: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  tripOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    justifyContent: 'space-between',
  },
  tripBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tripBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tripDetails: {
    justifyContent: 'flex-end',
  },
  featuredTripName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  expenseList: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseMain: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  expenseSub: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
