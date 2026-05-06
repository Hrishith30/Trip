import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, useColorScheme, TouchableOpacity, TextInput, Alert, Dimensions, Linking, Platform, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Search, MapPin, LocateFixed, Clock, X, Share2, CornerUpRight, Star, TrendingUp, Compass, Map as MapIcon, Plus } from 'lucide-react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mapRef = useRef<MapView>(null);
  const searchTimer = useRef<any>(null);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destination, setDestination] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      const initialRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(initialRegion);
      mapRef.current?.animateToRegion(initialRegion, 1500);
    })();
  }, []);

  const performSearch = async (text: string) => {
    const query = text.trim();
    if (query.length <= 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    setShowSuggestions(true);
    
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=15`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const formattedResults = data.features.map((item: any, index: number) => {
            const props = item.properties;
            const addressParts = [props.city, props.state, props.country].filter(Boolean);
            return {
              id: `p-${index}-${props.osm_id || Math.random()}`,
              title: props.name || props.street || props.city || "Unknown Location",
              subtitle: addressParts.join(', ') || "Global Location",
              type: props.osm_value || props.type || 'place',
              coordinate: {
                latitude: item.geometry.coordinates[1],
                longitude: item.geometry.coordinates[0],
              }
            };
          });
          setSuggestions(formattedResults);
        } else {
          setSuggestions([]);
        }
      }
    } catch (error) {
      console.log('Search connection error');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    
    if (text.length > 2) {
      searchTimer.current = setTimeout(() => {
        performSearch(text);
      }, 600); 
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const selectDestination = (item: any) => {
    setDestination(item);
    setSearchText(item.title);
    setShowSuggestions(false);
    mapRef.current?.animateToRegion({
      ...item.coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1500);
  };

  const startNavigation = () => {
    if (!destination) return;
    const { latitude, longitude } = destination.coordinate;
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  const moveToLocation = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      mapRef.current?.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Could not get current location.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        onRegionChangeComplete={(r) => setRegion(r)}
        onPanDrag={() => Keyboard.dismiss()}
        onPress={(e) => {
          Keyboard.dismiss();
          // Extra sensitivity check for Android
          if (e.nativeEvent && e.nativeEvent.coordinate) {
            setDestination({ 
              id: 'custom-' + Date.now(), 
              title: 'Pinned Location', 
              coordinate: e.nativeEvent.coordinate, 
              type: 'Selected' 
            });
            setShowSuggestions(false);
          }
        }}
        onLongPress={(e) => {
          Keyboard.dismiss();
          if (e.nativeEvent && e.nativeEvent.coordinate) {
            setDestination({ 
              id: 'custom-' + Date.now(), 
              title: 'Pinned Location', 
              coordinate: e.nativeEvent.coordinate, 
              type: 'Selected' 
            });
            setShowSuggestions(false);
          }
        }}
        onPoiClick={(e) => {
          Keyboard.dismiss();
          // Instant pinning for buildings/landmarks
          setDestination({
            id: 'poi-' + e.nativeEvent.placeId,
            title: e.nativeEvent.name,
            coordinate: e.nativeEvent.coordinate,
            type: 'Point of Interest'
          });
          setShowSuggestions(false);
        }}
        initialRegion={region}
        customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
      >
        {destination && (
          <Marker 
            coordinate={destination.coordinate}
            anchor={{ x: 0.5, y: 1 }}
          >
            <MapPin size={32} color="#ef4444" fill="#ef444420" strokeWidth={2.5} />
          </Marker>
        )}
      </MapView>

      <SafeAreaView style={styles.searchContainer} edges={['top']}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} stroke={colors.tabIconDefault} />
          <TextInput
            placeholder="Search any building or street..."
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchText}
            onChangeText={handleSearchTextChange}
            onFocus={() => searchText.length > 2 && setShowSuggestions(true)}
          />
          {loading ? (
            <ActivityIndicator size="small" color={colors.tint} />
          ) : searchText.length > 0 ? (
            <TouchableOpacity onPress={() => { setSearchText(''); setShowSuggestions(false); }}>
              <X size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          ) : null}
        </View>

        {showSuggestions && (
          <View style={[styles.suggestionsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.listHeader}>
              <TrendingUp size={14} color={colors.tabIconDefault} />
              <Text style={[styles.listHeaderText, { color: colors.tabIconDefault }]}>
                {loading ? 'Searching World...' : 'Search Results'}
              </Text>
            </View>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="always"
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => selectDestination(item)}
                >
                  <View style={[styles.suggestIcon, { backgroundColor: colors.tint + '15' }]}>
                    <MapIcon size={18} color={colors.tint} />
                  </View>
                  <View style={styles.suggestText}>
                    <Text style={[styles.suggestTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.suggestSub, { color: colors.tabIconDefault }]} numberOfLines={1}>{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => !loading && (
                <View style={styles.emptyContainer}>
                  <Text style={{ color: colors.tabIconDefault }}>No results found</Text>
                </View>
              )}
            />
          </View>
        )}
      </SafeAreaView>

      {destination && (
        <View style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.headerMain}>
              <View style={styles.typeRow}>
                <TrendingUp size={14} color={colors.tint} />
                <Text style={[styles.typeText, { color: colors.tint }]}>{destination.type || 'Location'}</Text>
              </View>
              <Text style={[styles.destTitle, { color: colors.text }]} numberOfLines={1}>{destination.title}</Text>
              <Text style={[styles.destSub, { color: colors.tabIconDefault }]} numberOfLines={1}>{destination.subtitle}</Text>
            </View>
            <TouchableOpacity onPress={() => setDestination(null)} style={styles.closeBtn}>
              <X size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.tint }]} onPress={startNavigation}>
              <CornerUpRight size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Go Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.border + '30' }]}>
              <Share2 size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.fabContainer, { bottom: destination ? 220 : 40 }]}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={moveToLocation}>
          <LocateFixed size={24} stroke={colors.tint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const darkMapStyle = [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }];

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  searchContainer: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 10, zIndex: 100 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 54, borderRadius: 16, borderWidth: 1, elevation: 10 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
  suggestionsList: { marginTop: 8, borderRadius: 20, borderWidth: 1, maxHeight: 350, overflow: 'hidden', elevation: 15 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingLeft: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  listHeaderText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 16 },
  suggestIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  suggestText: { flex: 1 },
  suggestTitle: { fontSize: 16, fontWeight: '700' },
  suggestSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  routeCard: { position: 'absolute', bottom: 20, left: 20, right: 20, padding: 20, borderRadius: 28, borderWidth: 1, elevation: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  headerMain: { flex: 1 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  typeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  destTitle: { fontSize: 20, fontWeight: '800' },
  destSub: { fontSize: 13, marginTop: 2 },
  closeBtn: { padding: 4 },
  actionRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 1, height: 54, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  fabContainer: { position: 'absolute', right: 20, gap: 12 },
  fab: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  emptyContainer: { padding: 20, alignItems: 'center' },
  crosshairContainer: { position: 'absolute', top: '50%', left: '50%', marginTop: -10, marginLeft: -10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  crosshairLine: { backgroundColor: 'rgba(0,0,0,0.3)', position: 'absolute' },
});
