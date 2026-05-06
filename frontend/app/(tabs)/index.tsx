import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Animated, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { TrendingUp, Users, Bell, MapPin, Calendar, ArrowRight, Receipt, Plane, Music, Play, Sparkles } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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

  const QuickAction = ({ icon: Icon, label, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]} 
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
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
        {/* Cinematic Header */}
        <View style={styles.heroHeader}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>{getGreeting()}</Text>
              <Text style={[styles.name, { color: colors.text }]}>Hrishith!</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }} 
                style={styles.avatar} 
              />
              <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Stats Banner */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.statsScroll}
        >
          <View style={[styles.statBanner, { backgroundColor: colors.tint }]}>
            <StatCard icon={Plane} value="12" label="Global Trips" color="#fff" isDark />
            <View style={styles.statDivider} />
            <StatCard icon={Users} value="4" label="Trip Tribes" color="#fff" isDark />
            <View style={styles.statDivider} />
            <StatCard icon={MapPin} value="28" label="Places" color="#fff" isDark />
          </View>
        </ScrollView>

        {/* Featured Adventure */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Adventure</Text>
          <TouchableOpacity onPress={() => router.push('/trips')}>
            <Text style={[styles.seeAll, { color: colors.tint }]}>Itinerary</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.heroCard, { shadowColor: colors.tint }]}
          onPress={() => router.push('/trips')}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadge}>
              <Sparkles size={12} color="#fff" />
              <Text style={styles.heroBadgeText}>Next Stop: Paris</Text>
            </View>
            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.heroTitle}>The City of Lights</Text>
                <Text style={styles.heroSub}>Departure in 3 days • May 12</Text>
              </View>
              <View style={styles.heroAction}>
                <ArrowRight size={20} color={colors.tint} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: 24, marginBottom: 16 }]}>Trip Essentials</Text>
        <View style={styles.actionGrid}>
          <QuickAction icon={Receipt} label="Split Bill" color="#10b981" onPress={() => router.push('/split')} />
          <QuickAction icon={Music} label="Roadmix" color="#8b5cf6" onPress={() => router.push('/music')} />
          <QuickAction icon={Calendar} label="Plans" color="#f59e0b" onPress={() => router.push('/trips')} />
          <QuickAction icon={Bell} label="Alerts" color="#ef4444" onPress={() => {}} />
        </View>

        {/* Recent Activity Log */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Travel Log</Text>
        </View>
        
        <View style={styles.activityContainer}>
          {[
            { title: 'Paris Itinerary', sub: 'Eiffel Tower visit added', time: '2h ago', icon: MapPin, color: '#3b82f6' },
            { title: 'Tokyo Budget', sub: 'Hotel price dropped by $40', time: '5h ago', icon: TrendingUp, color: '#10b981' }
          ].map((item, idx) => (
            <View key={idx} style={[styles.activityLog, { borderBottomWidth: idx === 0 ? 1 : 0, borderBottomColor: colors.border }]}>
              <View style={[styles.logIcon, { backgroundColor: item.color + '15' }]}>
                <item.icon size={18} color={item.color} />
              </View>
              <View style={styles.logMain}>
                <Text style={[styles.logTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.logSub, { color: colors.tabIconDefault }]}>{item.sub}</Text>
              </View>
              <Text style={styles.logTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* Modern Music FAB */}
      <TouchableOpacity 
        style={[styles.musicFab, { backgroundColor: colors.tint, shadowColor: colors.tint }]}
        activeOpacity={0.8}
        onPress={() => router.push('/music')}
      >
        <Music size={24} color="#fff" />
        <View style={styles.playingPulse} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const StatCard = ({ icon: Icon, value, label, color, isDark }: any) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : color + '15' }]}>
      <Icon size={18} color={color} />
    </View>
    <View>
      <Text style={[styles.statNum, { color: isDark ? '#fff' : '#000' }]}>{value}</Text>
      <Text style={[styles.statDesc, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  heroHeader: { paddingTop: 20, paddingHorizontal: 24, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  name: { fontSize: 32, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  profileBtn: { width: 54, height: 54, borderRadius: 20, padding: 2 },
  avatar: { width: '100%', height: '100%', borderRadius: 18 },
  statusIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  
  statsScroll: { paddingLeft: 24, paddingRight: 24, marginBottom: 32 },
  statBanner: { flexDirection: 'row', padding: 16, borderRadius: 28, elevation: 12, shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800' },
  statDesc: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 15 },

  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  seeAll: { fontSize: 14, fontWeight: '700' },

  heroCard: { marginHorizontal: 24, height: 240, borderRadius: 32, overflow: 'hidden', marginBottom: 32, elevation: 20, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', padding: 24, justifyContent: 'space-between' },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginTop: 4 },
  heroAction: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18, marginBottom: 32 },
  actionCard: { width: (width - 60) / 2, margin: 6, padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center', gap: 12 },
  actionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 14, fontWeight: '700' },

  activityContainer: { marginHorizontal: 24, borderRadius: 32, borderWidth: 1, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' },
  activityLog: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  logIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  logMain: { flex: 1 },
  logTitle: { fontSize: 16, fontWeight: '700' },
  logSub: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  logTime: { fontSize: 12, color: 'rgba(0,0,0,0.4)', fontWeight: '600' },

  musicFab: { position: 'absolute', bottom: 30, right: 25, width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  playingPulse: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 34, borderWidth: 2, borderColor: '#fff', opacity: 0.3 },
});
