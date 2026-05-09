import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, useColorScheme, Animated, Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, PanResponder } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { MapPin, Calendar, ArrowRight, Plus, Trash2, Edit2, X, Sparkles, Plane, Compass, Receipt, Clock, PlusCircle, CheckCircle2, Circle, ListTodo } from 'lucide-react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import CustomDatePicker from '../../components/CustomDatePicker';
import CustomTimePicker from '../../components/CustomTimePicker';
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
    itinerary: [
      { id: '1', time: '09:00 AM', event: 'Morning Flight', icon: 'Plane', desc: 'Flight TK123 to Zermatt', completed: false },
      { id: '2', time: '01:00 PM', event: 'Hotel Check-in', icon: 'MapPin', desc: 'Alpine Resort & Spa', completed: false }
    ],
    checklist: [
      { id: '1', text: 'Pack snow boots', completed: false },
      { id: '2', text: 'Check passport', completed: true }
    ]
  },
  {
    id: '2',
    name: 'Paris City Break',
    location: 'Paris, France',
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop',
    status: 'Upcoming',
    itinerary: [
      { id: '1', time: '11:00 AM', event: 'Eiffel Tower', icon: 'Sparkles', desc: 'Guided tour at the summit', completed: false }
    ],
    checklist: []
  }
];

import { useTheme } from '../../context/ThemeContext';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ItineraryItem {
  id: string;
  time: string;
  event: string;
  icon: string;
  desc: string;
  date?: string;
  completed?: boolean;
}

interface Trip {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  image: string;
  status: string;
  itinerary: ItineraryItem[];
  checklist: ChecklistItem[];
}

export default function TripsScreen() {
  const { isDarkMode, colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const isAtTop = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // Reset scroll position when screen is focused
      scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
      
      return () => {
        // Also reset when leaving to ensure it's at top for next time
        scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
      };
    }, [])
  );

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

  // State Management
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [itineraryModalVisible, setItineraryModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'checklist'>('itinerary');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickingDateType, setPickingDateType] = useState<'start' | 'end'>('start');
  const [tempDate, setTempDate] = useState(new Date());
  const [minPickerDate, setMinPickerDate] = useState(new Date());
  const params = useLocalSearchParams();
  const searchTimer = useRef<any>(null);

  const getDaysToGo = (dateStr: string) => {
    const today = new Date();
    const tripDate = safeDate(dateStr);
    if (!tripDate) return 'UPCOMING';
    
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7 && diffDays > 0) {
      return `${diffDays} DAYS TO GO`;
    }
    return 'UPCOMING';
  };

  useEffect(() => {
    console.log('Trips Params:', params);
    if (params.openItinerary === '1') {
      const swissTrip = trips.find(t => t.id === '1');
      if (swissTrip) {
        handleOpenItinerary(swissTrip);
        router.setParams({ openItinerary: undefined });
      }
    } else if (params.addNew === '1') {
      handleOpenModal();
      router.setParams({ addNew: undefined });
    }
  }, [params.openItinerary, params.addNew]);

  // Itinerary Form State
  const [itineraryFormVisible, setItineraryFormVisible] = useState(false);
  const [editingItineraryItem, setEditingItineraryItem] = useState<any>(null);
  const [itineraryFormData, setItineraryFormData] = useState<Omit<ItineraryItem, 'id'>>({
    event: '',
    time: '09:00 AM',
    date: '',
    desc: '',
    icon: 'Plane',
    completed: false
  });
  const [showActivityDatePicker, setShowActivityDatePicker] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Trip, 'id'>>({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400&auto=format&fit=crop',
    status: 'Upcoming',
    itinerary: [],
    checklist: []
  });
  const [checklistInput, setChecklistInput] = useState('');
  const [itineraryChecklistInput, setItineraryChecklistInput] = useState('');
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const [editingChecklistItemId, setEditingChecklistItemId] = useState<string | null>(null);

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

  const getStableTime = (timeStr?: string) => {
    const d = new Date();
    if (!timeStr) {
      d.setHours(9, 0, 0, 0);
      return d;
    }
    try {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      d.setHours(hours, minutes, 0, 0);
    } catch (e) {
      d.setHours(9, 0, 0, 0);
    }
    return d;
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    if (selectedTime) {
      let hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
      setItineraryFormData(f => ({ ...f, time: formatted }));
    }
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
    } else if (pickingDateType === 'end') {
      setFormData(f => ({ ...f, endDate: isoString }));
    } else {
      setItineraryFormData(f => ({ ...f, date: isoString }));
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

  const handleOpenDatePicker = (type: 'start' | 'end' | 'activity') => {
    Keyboard.dismiss();
    setLocationResults([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let initialDate = new Date(today);
    let minDate = new Date(today);
    let maxDate: Date | undefined = undefined;

    if (type === 'activity') {
      initialDate = safeDate(itineraryFormData.date) || safeDate(selectedTrip.startDate) || new Date();
      minDate = safeDate(selectedTrip.startDate) || new Date();
      maxDate = safeDate(selectedTrip.endDate) || undefined;
    } else {
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
    }

    setPickingDateType(type as any);
    setTempDate(initialDate);
    setMinPickerDate(minDate);

    if (type === 'activity') {
      setShowActivityDatePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleOpenModal = (trip: any = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        ...trip,
        itinerary: trip.itinerary || [],
        checklist: trip.checklist || []
      });
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
        status: 'Upcoming',
        itinerary: [],
        checklist: []
      });
    }
    setLocationResults([]);
    setShowDatePicker(false);
    setModalVisible(true);
  };

  const handleOpenItinerary = (trip: any) => {
    setSelectedTrip(trip);
    setActiveTab('itinerary');
    setItineraryModalVisible(true);
    setShowChecklistInput(false);
    setItineraryChecklistInput('');
    setEditingChecklistItemId(null);
  };

  const handleOpenActivityForm = (activity: any = null) => {
    if (activity) {
      setEditingItineraryItem(activity);
      setItineraryFormData({
        event: activity.event || '',
        time: activity.time || '09:00 AM',
        date: activity.date || selectedTrip?.startDate || '',
        desc: activity.desc || '',
        icon: activity.icon || 'Plane',
        completed: !!activity.completed
      });
    } else {
      setEditingItineraryItem(null);
      setItineraryFormData({
        event: '',
        time: '09:00 AM',
        date: selectedTrip?.startDate || '',
        desc: '',
        icon: 'Plane',
        completed: false
      });
    }
    Keyboard.dismiss();
    setItineraryFormVisible(true);
  };

  const handleSaveActivity = () => {
    if (!itineraryFormData.event) {
      Alert.alert('Incomplete', 'Please enter an event name.');
      return;
    }

    Keyboard.dismiss();
    const updatedItinerary = [...(selectedTrip.itinerary || [])];
    if (editingItineraryItem) {
      const idx = updatedItinerary.findIndex(i => i.id === editingItineraryItem.id);
      updatedItinerary[idx] = { ...itineraryFormData, id: editingItineraryItem.id };
    } else {
      updatedItinerary.push({
        ...itineraryFormData,
        id: Date.now().toString()
      });
    }

    const updatedTrip = { ...selectedTrip, itinerary: updatedItinerary };
    setSelectedTrip(updatedTrip);
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    setItineraryFormVisible(false);
  };

  const handleDeleteActivity = (activityId: string) => {
    const updatedItinerary = selectedTrip.itinerary.filter((i: any) => i.id !== activityId);
    const updatedTrip = { ...selectedTrip, itinerary: updatedItinerary };
    setSelectedTrip(updatedTrip);
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const handleToggleActivityComplete = (activityId: string) => {
    const updatedItinerary = selectedTrip.itinerary.map((i: any) =>
      i.id === activityId ? { ...i, completed: !i.completed } : i
    );
    const updatedTrip = { ...selectedTrip, itinerary: updatedItinerary };
    setSelectedTrip(updatedTrip);
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const handleAddChecklistItem = () => {
    if (!checklistInput.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: checklistInput.trim(),
      completed: false
    };
    setFormData(f => ({ ...f, checklist: [...(f.checklist || []), newItem] }));
    setChecklistInput('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setFormData(f => ({ ...f, checklist: f.checklist.filter((i: any) => i.id !== id) }));
  };

  const handleToggleChecklistItem = (id: string) => {
    const updatedChecklist = selectedTrip.checklist.map((i: any) =>
      i.id === id ? { ...i, completed: !i.completed } : i
    );
    const updatedTrip = { ...selectedTrip, checklist: updatedChecklist };
    setSelectedTrip(updatedTrip);
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const handleAddItineraryChecklistItem = () => {
    if (!itineraryChecklistInput.trim()) return;

    let updatedChecklist;
    if (editingChecklistItemId) {
      updatedChecklist = selectedTrip.checklist.map((i: any) =>
        i.id === editingChecklistItemId ? { ...i, text: itineraryChecklistInput.trim() } : i
      );
    } else {
      const newItem = {
        id: Date.now().toString(),
        text: itineraryChecklistInput.trim(),
        completed: false
      };
      updatedChecklist = [...(selectedTrip.checklist || []), newItem];
    }

    const updatedTrip = { ...selectedTrip, checklist: updatedChecklist };
    setSelectedTrip(updatedTrip);
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    setItineraryChecklistInput('');
    setEditingChecklistItemId(null);
  };

  const handleDeleteItineraryChecklistItem = (id: string) => {
    const updatedChecklist = selectedTrip.checklist.filter((i: any) => i.id !== id);
    const updatedTrip = { ...selectedTrip, checklist: updatedChecklist };
    setSelectedTrip(updatedTrip);
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const handleEditChecklistItem = (item: any) => {
    setItineraryChecklistInput(item.text);
    setEditingChecklistItemId(item.id);
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
            <Text style={[styles.tripStatus, { color: colors.tint }]}>{getDaysToGo(item.startDate)}</Text>
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
        <Animated.FlatList
          ref={scrollRef}
          data={trips}
          renderItem={renderTrip}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onScroll={handleScroll}
          onScrollEndDrag={(e) => {
            if (e.nativeEvent.contentOffset.y < -100 && !refreshing) {
              handleRefresh();
            }
          }}
          scrollEventThrottle={16}
          overScrollMode="never"
          bounces={true}
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
        activeOpacity={0.8}
      >
        <Plus size={32} color="#fff" strokeWidth={2.5} />
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

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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
              </View>

              <View style={styles.formItem}>
                <Text style={[styles.label, { color: colors.tabIconDefault }]}>Trip Checklist</Text>
                <View style={[styles.inputWrapper, { marginBottom: 12 }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, paddingRight: 50 }]}
                    placeholder="Add item (e.g. Pack chargers)"
                    placeholderTextColor={colors.tabIconDefault}
                    value={checklistInput}
                    onChangeText={setChecklistInput}
                    onSubmitEditing={handleAddChecklistItem}
                  />
                  <TouchableOpacity
                    style={[styles.addChecklistBtn, { backgroundColor: colors.tint }]}
                    onPress={handleAddChecklistItem}
                    activeOpacity={0.7}
                  >
                    <Plus size={22} color="#fff" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {formData.checklist && formData.checklist.length > 0 && (
                  <View style={styles.checklistPreview}>
                    {formData.checklist.map((item: any) => (
                      <View key={item.id} style={[styles.checklistEntry, { borderColor: colors.border }]}>
                        <Text style={[styles.checklistEntryText, { color: colors.text }]}>{item.text}</Text>
                        <TouchableOpacity onPress={() => handleRemoveChecklistItem(item.id)}>
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
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

        {/* ── Trip Date Picker ── */}
        <CustomDatePicker
          visible={showDatePicker}
          title={pickingDateType === 'start' ? 'Select Departure' : 'Select Return'}
          value={tempDate}
          minimumDate={pickingDateType === 'end' ? minPickerDate : null}
          maximumDate={null}
          onClose={() => setShowDatePicker(false)}
          onConfirm={(d) => confirmDate(d)}
          accentColor={colors.tint}
          textColor={colors.text}
          bgColor={colors.card}
          borderColor={colors.border}
          mutedColor={colors.tabIconDefault}
        />
      </Modal>

      {/* Itinerary Modal */}
      <Modal visible={itineraryModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.itineraryContent, { backgroundColor: colors.card }]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              {itineraryFormVisible ? (
                /* Activity Editor View (Integrated) */
                <View style={{ flex: 1 }}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); setItineraryFormVisible(false); }} style={styles.backBtn}>
                      <X size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { color: colors.text, flex: 1, marginLeft: 12 }]}>
                      {editingItineraryItem ? 'Edit Activity' : 'Add Activity'}
                    </Text>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                  >
                    <View style={styles.formItem}>
                      <Text style={[styles.label, { color: colors.tabIconDefault }]}>Activity Name</Text>
                      <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g. Visit Louvre Museum"
                        placeholderTextColor={colors.tabIconDefault}
                        value={itineraryFormData.event}
                        onChangeText={(text) => setItineraryFormData(f => ({ ...f, event: text }))}
                      />
                    </View>

                    <View style={styles.dateRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.tabIconDefault }]}>Day</Text>
                        <TouchableOpacity
                          style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                          onPress={() => { Keyboard.dismiss(); setShowActivityDatePicker(true); }}
                        >
                          <Calendar size={16} color={colors.tint} />
                          <Text style={{ color: itineraryFormData.date ? colors.text : colors.tabIconDefault, fontSize: 13, fontWeight: '700', flex: 1 }} numberOfLines={1}>
                            {itineraryFormData.date ? formatDate(safeDate(itineraryFormData.date)) : 'Select Day'}
                          </Text>
                        </TouchableOpacity>


                      </View>
                      <View style={{ width: 12 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.tabIconDefault }]}>Time</Text>
                        <TouchableOpacity
                          style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                          onPress={() => setShowTimePicker(true)}
                        >
                          <Clock size={16} color={colors.tint} />
                          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{itineraryFormData.time}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>


                    <View style={[styles.formItem, { marginTop: 16 }]}>
                      <Text style={[styles.label, { color: colors.tabIconDefault }]}>Description</Text>
                      <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.border, height: 100, paddingTop: 12 }]}
                        placeholder="Summary of the activity..."
                        placeholderTextColor={colors.tabIconDefault}
                        multiline
                        value={itineraryFormData.desc}
                        onChangeText={(text) => setItineraryFormData(f => ({ ...f, desc: text }))}
                      />
                    </View>

                    <View style={styles.formItem}>
                      <Text style={[styles.label, { color: colors.tabIconDefault }]}>Category</Text>
                      <View style={styles.categoryRow}>
                        {[
                          { id: 'Plane', icon: Plane, label: 'Travel' },
                          { id: 'MapPin', icon: MapPin, label: 'Visit' },
                          { id: 'Sparkles', icon: Sparkles, label: 'Feature' },
                          { id: 'Compass', icon: Compass, label: 'Explore' }
                        ].map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.categoryBtn,
                              { borderColor: colors.border },
                              itineraryFormData.icon === cat.id && { backgroundColor: colors.tint, borderColor: colors.tint }
                            ]}
                            onPress={() => setItineraryFormData(f => ({ ...f, icon: cat.id }))}
                          >
                            <cat.icon size={20} color={itineraryFormData.icon === cat.id ? '#fff' : colors.tabIconDefault} />
                            <Text style={[styles.categoryLabel, { color: itineraryFormData.icon === cat.id ? '#fff' : colors.tabIconDefault }]}>{cat.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.saveBtn, { backgroundColor: colors.tint }]}
                      onPress={handleSaveActivity}
                    >
                      <Text style={styles.saveBtnText}>{editingItineraryItem ? 'Update Activity' : 'Add to Itinerary'}</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              ) : (
                /* Itinerary List View */
                <>
                  <View style={styles.itineraryHeaderRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>{selectedTrip?.name || 'Trip Details'}</Text>
                      <Text style={[styles.modalSubtitle, { color: colors.tabIconDefault }]} numberOfLines={1}>{selectedTrip?.location}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setItineraryModalVisible(false)} 
                      style={styles.closeBtn}
                    >
                      <X size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.tabBar, { backgroundColor: colors.border + '30' }]}>
                    <TouchableOpacity 
                      style={[styles.tab, activeTab === 'itinerary' && { backgroundColor: colors.card, elevation: 4 }]}
                      onPress={() => setActiveTab('itinerary')}
                    >
                      <Compass size={18} color={activeTab === 'itinerary' ? colors.tint : colors.tabIconDefault} />
                      <Text style={[styles.tabText, { color: activeTab === 'itinerary' ? colors.text : colors.tabIconDefault }]}>Timeline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.tab, activeTab === 'checklist' && { backgroundColor: colors.card, elevation: 4 }]}
                      onPress={() => setActiveTab('checklist')}
                    >
                      <ListTodo size={18} color={activeTab === 'checklist' ? colors.tint : colors.tabIconDefault} />
                      <Text style={[styles.tabText, { color: activeTab === 'checklist' ? colors.text : colors.tabIconDefault }]}>Checklist</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 40 }}
                  >
                    {activeTab === 'itinerary' ? (
                      <>
                        <View style={styles.sectionHeaderRow}>
                          <Text style={[styles.sectionLabel, { color: colors.tabIconDefault }]}>ITINERARY</Text>
                          <TouchableOpacity 
                            onPress={() => handleOpenActivityForm()}
                            style={[styles.miniAddBtn, { backgroundColor: colors.tint + '15' }]}
                          >
                            <Plus size={16} color={colors.tint} strokeWidth={3} />
                            <Text style={[styles.miniAddText, { color: colors.tint }]}>Add Activity</Text>
                          </TouchableOpacity>
                        </View>

                        {(selectedTrip?.itinerary || []).map((item: any, idx: number) => {
                          const IconComp = item.icon === 'Plane' ? Plane : item.icon === 'MapPin' ? MapPin : item.icon === 'Sparkles' ? Sparkles : Compass;
                          const isCompleted = !!item.completed;

                          return (
                            <TouchableOpacity
                              key={item.id}
                              style={styles.itineraryItem}
                              activeOpacity={0.8}
                              onPress={() => handleToggleActivityComplete(item.id)}
                            >
                              <View style={styles.timeline}>
                                <View style={[
                                  styles.timelineIconContainer,
                                  {
                                    backgroundColor: isCompleted ? colors.background : colors.tint,
                                    borderColor: isCompleted ? colors.border : colors.tint,
                                  }
                                ]}>
                                  <IconComp size={16} color={isCompleted ? colors.tabIconDefault : '#fff'} />
                                </View>
                                {idx !== (selectedTrip.itinerary.length - 1) && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                              </View>
                              <View style={[
                                styles.itineraryCard,
                                {
                                  backgroundColor: isCompleted ? 'rgba(0,0,0,0.02)' : colors.background,
                                  borderColor: colors.border,
                                  opacity: isCompleted ? 0.6 : 1
                                }
                              ]}>
                                <View style={styles.itineraryText}>
                                  <View style={styles.itineraryHeader}>
                                    <View>
                                      <Text style={[
                                        styles.itineraryTime,
                                        { color: isCompleted ? colors.tabIconDefault : colors.tint },
                                        isCompleted && { textDecorationLine: 'line-through' }
                                      ]}>{item.time}</Text>
                                      {item.date && (
                                        <Text style={[styles.itineraryDate, { color: colors.tabIconDefault }]}>
                                          {formatDate(safeDate(item.date))}
                                        </Text>
                                      )}
                                    </View>
                                    <View style={styles.itineraryActions}>
                                      <TouchableOpacity onPress={() => handleOpenActivityForm(item)} style={{ padding: 4 }}>
                                        <Edit2 size={16} color={colors.tabIconDefault} />
                                      </TouchableOpacity>
                                      <TouchableOpacity onPress={() => handleDeleteActivity(item.id)} style={{ padding: 4 }}>
                                        <Trash2 size={16} color="#ef4444" />
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                  <View style={styles.eventRow}>
                                    <Text style={[
                                      styles.itineraryEvent,
                                      { color: colors.text },
                                      isCompleted && { textDecorationLine: 'line-through', color: colors.tabIconDefault }
                                    ]}>{item.event}</Text>
                                  </View>
                                  <Text style={[styles.itineraryDesc, { color: colors.tabIconDefault }]}>{item.desc}</Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                        {(!selectedTrip?.itinerary || selectedTrip.itinerary.length === 0) && (
                          <View style={styles.emptyItinerary}>
                            <Compass size={48} color={colors.border} />
                            <Text style={[styles.emptyItineraryText, { color: colors.tabIconDefault }]}>No activities planned yet.</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <>
                        <View style={styles.sectionHeaderRow}>
                          <Text style={[styles.sectionLabel, { color: colors.tabIconDefault }]}>PREPARATION</Text>
                        </View>

                        <View style={[styles.quickAddChecklist, { borderColor: colors.border, marginTop: 4 }]}>
                          <TextInput
                            style={[styles.quickAddInput, { color: colors.text }]}
                            placeholder={editingChecklistItemId ? "Edit item..." : "Add to checklist..."}
                            placeholderTextColor={colors.tabIconDefault}
                            value={itineraryChecklistInput}
                            onChangeText={setItineraryChecklistInput}
                            onSubmitEditing={handleAddItineraryChecklistItem}
                          />
                          <TouchableOpacity 
                            onPress={handleAddItineraryChecklistItem}
                            style={[styles.quickAddBtn, { backgroundColor: colors.tint }]}
                            activeOpacity={0.9}
                          >
                            {editingChecklistItemId ? (
                              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>SAVE</Text>
                            ) : (
                              <Plus size={24} color="#fff" strokeWidth={3} />
                            )}
                          </TouchableOpacity>
                        </View>

                        {(selectedTrip?.checklist || []).map((item: any) => (
                          <View key={item.id} style={[styles.checklistItemCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <TouchableOpacity
                              style={styles.checklistItem}
                              onPress={() => handleToggleChecklistItem(item.id)}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.checkCircle, { borderColor: item.completed ? colors.tint : colors.border, backgroundColor: item.completed ? colors.tint : 'transparent' }]}>
                                {item.completed && <CheckCircle2 size={14} color="#fff" />}
                              </View>
                              <Text style={[
                                styles.checklistItemText,
                                { color: colors.text, flex: 1 },
                                item.completed && { textDecorationLine: 'line-through', color: colors.tabIconDefault, opacity: 0.7 }
                              ]}>
                                {item.text}
                              </Text>
                            </TouchableOpacity>
                            <View style={styles.checklistActions}>
                              <TouchableOpacity onPress={() => handleEditChecklistItem(item)} style={styles.checklistActionBtn}>
                                <Edit2 size={16} color={colors.tabIconDefault} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteItineraryChecklistItem(item.id)} style={styles.checklistActionBtn}>
                                <Trash2 size={16} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                        {(!selectedTrip?.checklist || selectedTrip.checklist.length === 0) && (
                          <View style={styles.emptyChecklist}>
                            <ListTodo size={48} color={colors.border} />
                            <Text style={[styles.emptyChecklistText, { color: colors.tabIconDefault }]}>No tasks yet.</Text>
                          </View>
                        )}
                      </>
                    )}
                  </ScrollView>
                </>
              )}
            </KeyboardAvoidingView>
          </View>
        </View>

        {/* ── Activity Date Picker ── */}
        <CustomDatePicker
          visible={showActivityDatePicker}
          title="Select Activity Day"
          value={safeDate(itineraryFormData.date) || safeDate(selectedTrip?.startDate) || new Date()}
          minimumDate={safeDate(selectedTrip?.startDate)}
          maximumDate={safeDate(selectedTrip?.endDate)}
          onClose={() => setShowActivityDatePicker(false)}
          onConfirm={(d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            setItineraryFormData(f => ({ ...f, date: `${y}-${m}-${day}` }));
            setShowActivityDatePicker(false);
          }}
          accentColor={colors.tint}
          textColor={colors.text}
          bgColor={colors.card}
          borderColor={colors.border}
          mutedColor={colors.tabIconDefault}
        />

        {/* ── Activity Time Picker ── */}
        <CustomTimePicker
          visible={showTimePicker}
          value={getStableTime(itineraryFormData.time)}
          onClose={() => setShowTimePicker(false)}
          onChange={onTimeChange}
          accentColor={colors.tint}
          textColor={colors.text}
          bgColor={colors.card}
          borderColor={colors.border}
        />

        {/* Activity Time Picker */}
      </Modal>

      </View>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  closeBtn: { padding: 4 },
  backBtn: { padding: 4 },
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
  itineraryContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, height: '90%' },
  itineraryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  addActivityBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  addActivityText: { fontSize: 14, fontWeight: '800' },
  itineraryCard: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 8 },
  itineraryActions: { flexDirection: 'row', gap: 12 },
  eventRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  categoryRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 8 },
  categoryBtn: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, borderWidth: 1 },
  categoryLabel: { fontSize: 13, fontWeight: '700' },
  activityFormContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, height: '80%' },
  doneTimeBtn: { alignSelf: 'flex-end', marginTop: 10, padding: 10 },
  pickerBtn: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 },
  emptyItinerary: { alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 },
  emptyItineraryText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  modalSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  itineraryItem: { flexDirection: 'row', marginBottom: 12 },
  timeline: { alignItems: 'center', marginRight: 12, width: 32, paddingTop: 2 },
  timelineIconContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, zIndex: 2 },
  timelineLine: { width: 2, flex: 1, marginTop: -4, marginBottom: -16 },
  itineraryText: { flex: 1 },
  itineraryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itineraryTime: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  itineraryDate: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  itineraryEvent: { fontSize: 17, fontWeight: '900' },
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

  datePickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  datePickerPopup: { width: '100%', maxWidth: 380, borderRadius: 24, borderWidth: 1, overflow: 'hidden', paddingHorizontal: 4, paddingBottom: 12 },
  datePickerContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, borderWidth: 1, borderBottomWidth: 0 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14, borderBottomWidth: 1 },
  pickerTitle: { fontSize: 17, fontWeight: '800' },

  modalImageContainer: { height: 200, width: '100%', borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  modalImage: { width: '100%', height: '100%' },
  imageLoader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  imageTextOverlay: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  imageOverlayText: { color: '#fff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },

  addChecklistBtn: { position: 'absolute', right: 6, width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  checklistPreview: { gap: 8 },
  checklistEntry: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderRadius: 12 },
  checklistEntryText: { fontSize: 14, fontWeight: '500' },

  itineraryChecklist: { marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, paddingVertical: 12 },
  checklistItemText: { fontSize: 16, fontWeight: '700' },
  checklistItemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, elevation: 2, shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checklistActions: { flexDirection: 'row', gap: 4 },
  checklistActionBtn: { padding: 8, borderRadius: 10 },

  quickAddChecklist: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingLeft: 18, borderWidth: 1, borderRadius: 24, marginBottom: 16, gap: 12 },
  quickAddInput: { flex: 1, fontSize: 15, fontWeight: '700' },
  quickAddBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },

  // Split Section Styles
  tabBar: { flexDirection: 'row', padding: 4, borderRadius: 16, marginBottom: 24, gap: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  tabText: { fontSize: 14, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  miniAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  miniAddText: { fontSize: 12, fontWeight: '800' },

  checklistModalPopup: { width: '92%', height: '75%', borderRadius: 36, padding: 24, paddingBottom: 28, borderWidth: 1, elevation: 20, shadowOpacity: 0.25, shadowRadius: 25, shadowOffset: { width: 0, height: 10 } },
  checklistModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingHorizontal: 4 },

  emptyChecklist: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyChecklistIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyChecklistText: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  emptyChecklistSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
});
