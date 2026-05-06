import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, useColorScheme, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { MapPin, Calendar, ArrowRight } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';

const TRIPS = [
  {
    id: '1',
    name: 'Swiss Alps Adventure',
    location: 'Zermatt, Switzerland',
    date: 'July 15 - 22, 2026',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop',
    status: 'Upcoming',
  },
  {
    id: '2',
    name: 'Paris City Break',
    location: 'Paris, France',
    date: 'August 10 - 14, 2026',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop',
    status: 'Upcoming',
  },
  {
    id: '3',
    name: 'Tokyo Food Tour',
    location: 'Tokyo, Japan',
    date: 'October 5 - 15, 2026',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=400&auto=format&fit=crop',
    status: 'Draft',
  },
];

export default function TripsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scrollY = useRef(new Animated.Value(0)).current;

  const renderTrip = ({ item }: { item: typeof TRIPS[0] }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.tripStatus, { color: colors.tint }]}>{item.status}</Text>
          <Text style={[styles.tripName, { color: colors.text }]}>{item.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MapPin size={14} stroke={colors.tabIconDefault} />
          <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>{item.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Calendar size={14} stroke={colors.tabIconDefault} />
          <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>{item.date}</Text>
        </View>

        <TouchableOpacity style={[styles.detailsButton, { borderTopColor: colors.border }]}>
          <Text style={[styles.detailsText, { color: colors.text }]}>View Itinerary</Text>
          <ArrowRight size={16} stroke={colors.text} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PullToRefreshCar scrollY={scrollY} />
      
      <Animated.FlatList
        data={TRIPS}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>My Trips</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Plan your next adventure</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  tripStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
  },
  detailsButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
