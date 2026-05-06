import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, useColorScheme, Animated, Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { MapPin, Calendar, ArrowRight, Plus, Trash2, Edit2, X, Sparkles, Plane, Compass, Receipt } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_TRIPS = [
  {
    id: '1',
    name: 'Swiss Alps Adventure',
    location: 'Zermatt, Switzerland',
    startDate: '2026-07-15',
    endDate: '2026-07-22',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop',
    status: 'Upcoming',
  },
  {
    id: '2',
    name: 'Paris City Break',
    location: 'Paris, France',
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop',
    status: 'Upcoming',
  }
];

import { useTheme } from '../../context/ThemeContext';

export default function TripsScreen() {
  const { isDarkMode, colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  // State Management
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [itineraryModalVisible, setItineraryModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickingDateType, setPickingDateType] = useState<'start' | 'end'>('start');
  const [tempDate, setTempDate] = useState(new Date());
  const [minPickerDate, setMinPickerDate] = useState(new Date());
  const searchTimer = useRef<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400&auto=format&fit=crop',
    status: 'Upcoming'
  });

  const performLocationSearch = async (query: string) => {
    if (query.length <= 2) {
      setLocationResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.features) {
          const formatted = data.features.map((item: any) => {
            const props = item.properties;
            const addressParts = [props.city, props.state, props.country].filter(Boolean);
            return {
              title: props.name || props.street || props.city || "Unknown",
              subtitle: addressParts.join(', ')
            };
          });
          setLocationResults(formatted);
        }
      }
    } catch (error) {
      console.log('Search error');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (text: string) => {
    setFormData(f => ({ ...f, location: text }));
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (text.length > 2) {
      searchTimer.current = setTimeout(() => {
        performLocationSearch(text);
      }, 600);
    } else {
      setLocationResults([]);
    }
  };

  const selectLocation = (item: any) => {
    setLoadingImage(true);
    const cleanLocation = item.title.split(',')[0].trim();
    setFormData(f => ({
      ...f,
      location: `${item.title}${item.subtitle ? ', ' + item.subtitle : ''}`,
      image: `https://loremflickr.com/800/600/${encodeURIComponent(cleanLocation)}/all?random=${Date.now()}`
    }));
    setLocationResults([]);
  };

  const safeDate = (dateStr: any) => {
    if (!dateStr) return null;
    // Handle YYYY-MM-DD format specifically to avoid UTC shift
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'TBD';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);

      if (Platform.OS === 'android') {
        confirmDate(selectedDate);
      }
    }
  };

  const confirmDate = (dateToConfirm: Date) => {
    // Store as local YYYY-MM-DD string to avoid UTC shifting
    const year = dateToConfirm.getFullYear();
    const month = String(dateToConfirm.getMonth() + 1).padStart(2, '0');
    const day = String(dateToConfirm.getDate()).padStart(2, '0');
    const isoString = `${year}-${month}-${day}`;

    if (pickingDateType === 'start') {
      setFormData(f => ({ ...f, startDate: isoString, endDate: '' }));
    } else {
      setFormData(f => ({ ...f, endDate: isoString }));
    }
    setShowDatePicker(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate data fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleOpenDatePicker = (type: 'start' | 'end') => {
    Keyboard.dismiss();
    setLocationResults([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let initialDate = new Date(today);
    let minDate = new Date(today);

    const existingDateStr = type === 'start' ? formData.startDate : formData.endDate;

    if (existingDateStr) {
      const parsed = safeDate(existingDateStr);
      if (parsed) {
        initialDate = parsed;
      }
    }

    // 2. Ensure return date isn't before start date
    if (type === 'end' && formData.startDate) {
      const start = safeDate(formData.startDate);
      if (start) {
        minDate = start;
        if (initialDate < start) {
          initialDate = new Date(start);
        }
      }
    }

    setPickingDateType(type);
    setTempDate(initialDate);
    setMinPickerDate(minDate);

    setTimeout(() => {
      setShowDatePicker(true);
    }, 150);
  };

  const handleOpenModal = (trip: any = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({ ...trip });
    } else {
      setEditingTrip(null);
      const now = new Date();
      const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setFormData({
        name: '',
        location: '',
        startDate: todayISO,
        endDate: '',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400&auto=format&fit=crop',
        status: 'Upcoming'
      });
    }
    setLocationResults([]);
    setShowDatePicker(false);
    setModalVisible(true);
  };

  const handleOpenItinerary = (trip: any) => {
    setSelectedTrip(trip);
    setItineraryModalVisible(true);
  };

  const handleSaveTrip = () => {
    if (!formData.name || !formData.location) {
      Alert.alert('Incomplete', 'Please fill in the trip name and location.');
      return;
    }

    if (editingTrip) {
      setTrips(prev => prev.map(t => t.id === editingTrip.id ? { ...formData, id: t.id } : t));
    } else {
      const newTrip = {
        ...formData,
        id: Date.now().toString(),
      };
      setTrips(prev => [newTrip, ...prev]);
    }
    setModalVisible(false);
  };

  const handleDeleteTrip = (id: string) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to remove this adventure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: () => {
            setTrips(prev => prev.filter(t => t.id !== id));
          }
        }
      ]
    );
  };

  const renderTrip = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={[styles.tripStatus, { color: colors.tint }]}>{item.status}</Text>
            <Text style={[styles.tripName, { color: colors.text }]}>{item.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal(item)}>
              <Edit2 size={18} color={colors.tabIconDefault} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteTrip(item.id)}>
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={14} stroke={colors.tabIconDefault} />
          <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>{item.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={14} stroke={colors.tabIconDefault} />
          <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
            {item.startDate && item.endDate
              ? `${formatDate(safeDate(item.startDate))} - ${formatDate(safeDate(item.endDate))}`
              : item.date || 'TBD'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.detailsButton, { borderTopColor: colors.border }]}
          onPress={() => handleOpenItinerary(item)}
        >
          <Text style={[styles.detailsText, { color: colors.text }]}>View Itinerary</Text>
          <ArrowRight size={16} stroke={colors.text} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <PullToRefreshCar scrollY={scrollY} />

      <Animated.FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onScrollEndDrag={(e) => {
          if (e.nativeEvent.contentOffset.y < -100 && !refreshing) {
            handleRefresh();
          }
        }}
        scrollEventThrottle={16}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>My Trips</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Manage your global adventures</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.tint + '15' }]}>
              <Sparkles size={40} color={colors.tint} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No trips yet</Text>
            <Text style={[styles.emptySub, { color: colors.tabIconDefault }]}>Start your journey by adding your first destination.</Text>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.tint }]} onPress={() => handleOpenModal()}>
              <Text style={styles.emptyBtnText}>Plan a Trip</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint, shadowColor: colors.tint }]}
        onPress={() => handleOpenModal()}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTrip ? 'Edit Adventure' : 'New Trip'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {formData.image && (
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: formData.image }}
                    style={styles.modalImage}
                    resizeMode="cover"
                    onLoadStart={() => setLoadingImage(true)}
                    onLoadEnd={() => setLoadingImage(false)}
                    onError={() => {
                      setLoadingImage(false);
                      setFormData(f => ({ ...f, image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop' }));
                    }}
                  />
                  {loadingImage && (
                    <View style={[styles.imageLoader, { backgroundColor: colors.border + '50' }]}>
                      <ActivityIndicator color={colors.tint} />
                    </View>
                  )}
                  <View style={styles.imageOverlay} />
                </View>
              )}

              <View style={styles.formItem}>
                <Text style={[styles.label, { color: colors.tabIconDefault }]}>Adventure Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Tokyo Food Tour"
                  placeholderTextColor={colors.tabIconDefault}
                  value={formData.name}
                  onChangeText={(text) => setFormData(f => ({ ...f, name: text }))}
                  onFocus={() => setShowDatePicker(false)}
                />
              </View>

              <View style={styles.formItem}>
                <Text style={[styles.label, { color: colors.tabIconDefault }]}>Location</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. Tokyo, Japan"
                    placeholderTextColor={colors.tabIconDefault}
                    value={formData.location}
                    onChangeText={handleLocationChange}
                    onFocus={() => setShowDatePicker(false)}
                  />
                  {loading && (
                    <View style={styles.loadingWrapper}>
                      <ActivityIndicator size="small" color={colors.tint} />
                    </View>
                  )}
                </View>
                {locationResults.length > 0 && (
                  <View style={[styles.resultsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {locationResults.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.resultItem, { borderBottomColor: idx === locationResults.length - 1 ? 'transparent' : colors.border }]}
                        onPress={() => selectLocation(item)}
                      >
                        <View style={[styles.resultIcon, { backgroundColor: colors.tint + '15' }]}>
                          <MapPin size={16} color={colors.tint} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                          {item.subtitle && <Text style={[styles.resultSub, { color: colors.tabIconDefault }]} numberOfLines={1}>{item.subtitle}</Text>}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formItem}>
                <Text style={[styles.label, { color: colors.tabIconDefault }]}>Trip Duration</Text>
                <View style={styles.dateRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dateSubLabel, { color: colors.tabIconDefault }]}>From</Text>
                    <TouchableOpacity
                      style={[styles.input, { borderColor: colors.border, justifyContent: 'center' }]}
                      onPress={() => handleOpenDatePicker('start')}
                    >
                      <Text style={{ color: formData.startDate ? colors.text : colors.tabIconDefault, fontSize: 14, fontWeight: '600' }}>
                        {formData.startDate ? formatDate(safeDate(formData.startDate)) : 'Departure'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dateSubLabel, { color: colors.tabIconDefault }]}>To</Text>
                    <TouchableOpacity
                      style={[styles.input, { borderColor: colors.border, justifyContent: 'center' }]}
                      onPress={() => handleOpenDatePicker('end')}
                    >
                      <Text style={{ color: formData.endDate ? colors.text : colors.tabIconDefault, fontSize: 14, fontWeight: '600' }}>
                        {formData.endDate ? formatDate(safeDate(formData.endDate)) : 'Return'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Pop-up Date Picker Modal */}
                <Modal visible={showDatePicker} transparent animationType="fade">
                  <TouchableOpacity
                    style={styles.datePickerOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <View style={[styles.datePickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={styles.pickerHeader}>
                        <Text style={[styles.pickerTitle, { color: colors.text }]}>
                          Select {pickingDateType === 'start' ? 'Departure' : 'Return'}
                        </Text>
                        <TouchableOpacity onPress={() => confirmDate(tempDate)}>
                          <Text style={{ color: colors.tint, fontWeight: '700' }}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        key={`${pickingDateType}-${minPickerDate.getTime()}`}
                        value={tempDate}
                        mode="date"
                        display="inline"
                        minimumDate={pickingDateType === 'start' ? new Date() : minPickerDate}
                        themeVariant={isDarkMode ? 'dark' : 'light'}
                        accentColor={colors.tint}
                        onChange={onDateChange}
                        style={{ width: '100%', alignSelf: 'center' }}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.tint }]}
                onPress={handleSaveTrip}
              >
                <Text style={styles.saveBtnText}>{editingTrip ? 'Update Journey' : 'Create Adventure'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Itinerary Modal */}
      <Modal visible={itineraryModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.itineraryContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedTrip?.name || 'Itinerary'}</Text>
                <Text style={[styles.modalSubtitle, { color: colors.tabIconDefault }]}>Complete Schedule</Text>
              </View>
              <TouchableOpacity onPress={() => setItineraryModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { time: '09:00 AM', event: 'Morning Flight', icon: Plane, desc: 'Flight TK123 to Zermatt' },
                { time: '01:00 PM', event: 'Hotel Check-in', icon: MapPin, desc: 'Alpine Resort & Spa' },
                { time: '04:00 PM', event: 'Local Exploration', icon: Compass, desc: 'Visit the Old Village' },
                { time: '08:00 PM', event: 'Welcome Dinner', icon: Receipt, desc: 'Traditional Swiss Fondu' }
              ].map((item, idx) => (
                <View key={idx} style={styles.itineraryItem}>
                  <View style={styles.timeline}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.tint }]} />
                    {idx !== 3 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                  </View>
                  <View style={styles.itineraryText}>
                    <Text style={[styles.itineraryTime, { color: colors.tabIconDefault }]}>{item.time}</Text>
                    <Text style={[styles.itineraryEvent, { color: colors.text }]}>{item.event}</Text>
                    <Text style={[styles.itineraryDesc, { color: colors.tabIconDefault }]}>{item.desc}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.closeItineraryBtn, { backgroundColor: colors.tint }]}
                onPress={() => setItineraryModalVisible(false)}
              >
                <Text style={styles.saveBtnText}>Got it!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 24, paddingTop: 10, paddingBottom: 100 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 4, fontWeight: '600' },
  card: { borderRadius: 32, borderWidth: 1, marginBottom: 24, overflow: 'hidden', elevation: 12, shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  cardImage: { width: '100%', height: 200 },
  cardContent: { padding: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 12 },
  tripStatus: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  tripName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { fontSize: 14, fontWeight: '600' },
  detailsButton: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailsText: { fontSize: 15, fontWeight: '800' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },

  // Modal Styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  closeBtn: { padding: 4 },
  formItem: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 56, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
  saveBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 12, elevation: 8 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },

  // Empty State
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  emptyBtn: { paddingHorizontal: 32, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  emptyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Itinerary Styles
  itineraryContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, height: '85%' },
  modalSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  itineraryItem: { flexDirection: 'row', marginBottom: 24 },
  timeline: { alignItems: 'center', marginRight: 20, width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginTop: 4, marginBottom: -20 },
  itineraryText: { flex: 1 },
  itineraryTime: { fontSize: 12, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  itineraryEvent: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  itineraryDesc: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  closeItineraryBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 40, elevation: 8 },

  inputWrapper: { position: 'relative', justifyContent: 'center' },
  loadingWrapper: { position: 'absolute', right: 16 },
  resultsContainer: { marginTop: 8, borderRadius: 16, borderWidth: 1, overflow: 'hidden', elevation: 5, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1 },
  resultIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontSize: 15, fontWeight: '700' },
  resultSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  dateRow: { flexDirection: 'row', alignItems: 'flex-end' },
  dateSubLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  datePickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  datePickerContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, borderWidth: 1, borderBottomWidth: 0 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerTitle: { fontSize: 18, fontWeight: '800' },

  modalImageContainer: { height: 200, width: '100%', borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  modalImage: { width: '100%', height: '100%' },
  imageLoader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  imageTextOverlay: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  imageOverlayText: { color: '#fff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
});
