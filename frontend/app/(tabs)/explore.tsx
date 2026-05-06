import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, useColorScheme, TouchableOpacity, TextInput, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Search, MapPin, LocateFixed } from 'lucide-react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to see your live position on the map.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      mapRef.current?.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1500);
    })();
  }, []);

  const moveToLocation = async () => {
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
    
    mapRef.current?.animateToRegion({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
      >
        <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }}>
          <View style={[styles.marker, { backgroundColor: colors.tint }]}>
            <MapPin size={18} color="#fff" />
          </View>
        </Marker>
      </MapView>

      {/* Floating Search Bar */}
      <SafeAreaView style={styles.searchContainer} edges={['top']}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} stroke={colors.tabIconDefault} />
          <TextInput
            placeholder="Search destinations..."
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </SafeAreaView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={moveToLocation}
        >
          <LocateFixed size={24} stroke={colors.tint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  marker: { padding: 6, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
  searchContainer: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 54, borderRadius: 16, borderWidth: 1, elevation: 10 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
  fabContainer: { position: 'absolute', bottom: 40, right: 20, gap: 12 },
  fab: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});
