import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Animated, Image, ScrollView, Dimensions, PanResponder, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { TrendingUp, Users, MapPin, Calendar, ArrowRight, Receipt, Plane, Sparkles, Compass, Plus } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Traveler';

  const scrollY = useRef(new Animated.Value(0)).current;
  const isAtTop = useRef(true);
  const [refreshing, setRefreshing] = useState(false);


  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Platform.OS === 'android' && isAtTop.current && gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          scrollY.setValue(-gestureState.dy * 0.8);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          handleRefresh();
        }
        Animated.spring(scrollY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8
        }).start();
      },
    })
  ).current;

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate data fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Rise & Wander';
    if (hour >= 12 && hour < 17) return 'Peak Adventure';
    if (hour >= 17 && hour < 21) return 'Golden Hour';
    return 'Under the Stars';
  };

  const getDaysToGo = (dateStr: string) => {
    const today = new Date();
    const tripDate = new Date(dateStr);
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7 && diffDays > 0) {
      return `${diffDays} DAYS TO GO`;
    }
    return 'UPCOMING';
  };

  const QuickAction = ({ icon: Icon, label, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: colors.background, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        isAtTop.current = event.nativeEvent.contentOffset.y <= 0;
      }
    }
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <PullToRefreshCar scrollY={scrollY} />
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
          style={{ backgroundColor: colors.background }}
          onScroll={handleScroll}
          onScrollEndDrag={(e) => {
            if (e.nativeEvent.contentOffset.y < -100 && !refreshing) {
              handleRefresh();
            }
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={true}
        >
        {/* Cinematic Header */}
        <View style={styles.heroHeader}>
          <View style={[styles.profileHub, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.hubLeft}>
              <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>{getGreeting()}</Text>
              <Text style={[styles.name, { color: colors.text }]}>{userName}!</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
              <Image
                source={{ uri: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }}
                style={styles.avatar}
              />
              <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Adventure Header */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Adventure</Text>
          <TouchableOpacity 
            style={styles.headerActionBtn} 
            onPress={() => router.push('/trips')}
          >
            <Text style={[styles.seeAll, { color: colors.tint }]}>See All</Text>
            <ArrowRight size={14} color={colors.tint} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.heroCard}
          activeOpacity={0.9}
          onPress={() => router.push('/trips?openItinerary=1')}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadge}>
              <Sparkles size={14} color="#fff" />
              <Text style={styles.heroBadgeText}>{getDaysToGo('2026-07-15')}</Text>
            </View>

            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.heroTitle}>Swiss Alps</Text>
                <Text style={styles.heroSub}>Adventure in Zermatt</Text>
              </View>
              <View style={styles.heroAction}>
                <ArrowRight size={20} color="#000" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={[styles.sectionTitleRow, { marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trip Essentials</Text>
          <TouchableOpacity 
            style={[styles.headerActionBtn, { backgroundColor: colors.tint + '15' }]} 
            onPress={() => router.push('/trips?addNew=1')}
          >
            <Plus size={14} color={colors.tint} strokeWidth={3} />
            <Text style={[styles.seeAll, { color: colors.tint, marginLeft: 4 }]}>New Trip</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionGrid}>
          <QuickAction icon={Receipt} label="Split Bill" color="#10b981" onPress={() => router.push('/split')} />
          <QuickAction icon={MapPin} label="Nearby" color="#ec4899" onPress={() => router.push('/explore')} />
          <QuickAction icon={Calendar} label="Plans" color="#f59e0b" onPress={() => router.push('/trips')} />
          <QuickAction icon={Compass} label="Find" color="#0ea5e9" onPress={() => router.push('/explore')} />
        </View>


      </Animated.ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  heroHeader: { paddingTop: 10, paddingHorizontal: 24, paddingBottom: 24 },
  profileHub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderRadius: 32, borderWidth: 1.5, elevation: 12, shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  hubLeft: { flex: 1 },
  greeting: { fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  name: { fontSize: 28, fontWeight: '900', marginTop: 2, letterSpacing: -0.5 },
  profileBtn: { width: 54, height: 54, borderRadius: 20, padding: 2 },
  avatar: { width: '100%', height: '100%', borderRadius: 18 },
  statusIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },



  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  headerActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  seeAll: { fontSize: 13, fontWeight: '800' },

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
  actionCard: { width: (width - 60) / 2, margin: 6, padding: 20, borderRadius: 24, alignItems: 'center', gap: 12, borderWidth: 1.5, elevation: 8, shadowOpacity: 0.06, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  actionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 14, fontWeight: '700' },



});
