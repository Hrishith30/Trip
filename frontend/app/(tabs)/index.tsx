import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Animated, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { TrendingUp, Users, Search, Bell, MapPin, Calendar, ArrowRight, Receipt, Plane, Music, Play } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Rise & Wander';
    if (hour >= 12 && hour < 17) return 'Peak Adventure';
    if (hour >= 17 && hour < 21) return 'Golden Hour';
    return 'Under the Stars';
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <PullToRefreshCar scrollY={scrollY} />

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>{getGreeting()},</Text>
              <Text style={[styles.name, { color: colors.text }]}>Hrishith!</Text>
            </View>
            <TouchableOpacity style={[styles.profileButton, { borderColor: colors.border }]} onPress={() => router.push('/profile')}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }} 
                style={styles.avatar} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/explore')}
          >
            <Search size={20} stroke={colors.tabIconDefault} />
            <Text style={[styles.searchPlaceholder, { color: colors.tabIconDefault }]}>Search trips or destinations...</Text>
          </TouchableOpacity>
        </View>

        {/* Smart Widgets Section (Now only Split) */}
        <View style={styles.widgetRow}>
          <TouchableOpacity 
            style={[styles.fullWidget, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/split')}
          >
            <View style={[styles.widgetIcon, { backgroundColor: '#10b98120' }]}>
              <Receipt size={22} color="#10b981" />
            </View>
            <View style={styles.widgetMain}>
              <Text style={[styles.widgetTitle, { color: colors.text, fontSize: 16 }]}>Split Expenses</Text>
              <Text style={[styles.widgetSub, { color: colors.tabIconDefault, fontSize: 13 }]}>You are owed $240 across 3 trips</Text>
            </View>
            <ArrowRight size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <StatCard icon={Plane} value="12" label="Trips" color={colors.tint} />
          <StatCard icon={Users} value="4" label="Groups" color={colors.secondary} />
        </View>

        {/* Upcoming Trip Card */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Adventure</Text>
          <TouchableOpacity onPress={() => router.push('/trips')}>
            <Text style={[styles.seeAll, { color: colors.tint }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.tripCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/trips')}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=500&auto=format&fit=crop' }} 
            style={styles.tripImage} 
          />
          <View style={styles.tripBadge}>
            <Text style={styles.badgeText}>In 3 Days</Text>
          </View>
          <View style={styles.tripInfo}>
            <View>
              <Text style={[styles.tripName, { color: colors.text }]}>Paris, France</Text>
              <View style={styles.tripMeta}>
                <Calendar size={14} stroke={colors.tabIconDefault} />
                <Text style={[styles.metaText, { color: colors.tabIconDefault }]}>May 12 - May 18</Text>
              </View>
            </View>
            <View style={[styles.tripPrice, { backgroundColor: colors.tint }]}>
              <Text style={styles.priceText}>$1,200</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        </View>
        
        <View style={[styles.activityList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.activityItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.activityIcon, { backgroundColor: colors.secondary + '20' }]}>
              <MapPin size={18} stroke={colors.secondary} />
            </View>
            <View style={styles.activityMain}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>Destination Added</Text>
              <Text style={[styles.activitySub, { color: colors.tabIconDefault }]}>Eiffel Tower was added to Paris trip</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: colors.tint + '20' }]}>
              <TrendingUp size={18} stroke={colors.tint} />
            </View>
            <View style={styles.activityMain}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>Budget Updated</Text>
              <Text style={[styles.activitySub, { color: colors.tabIconDefault }]}>New flight prices found for Tokyo</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  widgetRow: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  fullWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
  },
  widgetIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetMain: {
    flex: 1,
  },
  widgetTitle: {
    fontWeight: '800',
  },
  widgetSub: {
    marginTop: 2,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
  },
  statIconContainer: {
    padding: 10,
    borderRadius: 14,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
  },
  tripCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 30,
  },
  tripImage: {
    width: '100%',
    height: 180,
  },
  tripBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  tripName: {
    fontSize: 20,
    fontWeight: '800',
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tripPrice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  priceText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  activityList: {
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 4,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  activityIcon: {
    padding: 10,
    borderRadius: 12,
  },
  activityMain: {
    marginLeft: 14,
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  activitySub: {
    fontSize: 13,
    marginTop: 2,
  },
});
