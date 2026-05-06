import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Animated, Dimensions, ScrollView, TextInput, Pressable, PanResponder, Modal } from 'react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { Play, Pause, SkipForward, SkipBack, Repeat, Shuffle, ListMusic, Heart, Search, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const TRACKS = [
  { id: '1', title: 'Wanderlust Anthem', artist: 'The Wayfarers', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&auto=format&fit=crop', duration: 230 },
  { id: '2', title: 'Mountain High', artist: 'Alpine Echo', cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500&auto=format&fit=crop', duration: 185 },
  { id: '3', title: 'City Lights', artist: 'Urban Nomad', cover: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=500&auto=format&fit=crop', duration: 210 },
  { id: '4', title: 'Ocean Breeze', artist: 'Coastal Soul', cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop', duration: 195 },
];

const PLAYLISTS = [
  { id: '1', title: 'Road Trip Vibes', tracks: 42, cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=300&auto=format&fit=crop' },
  { id: '2', title: 'Beach Sunset', tracks: 28, cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop' },
  { id: '3', title: 'Parisian Cafe', tracks: 15, cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=300&auto=format&fit=crop' },
];

export default function MusicScreen() {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set(['1']));
  const [likedSongsModalVisible, setLikedSongsModalVisible] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  
  const currentTrack = TRACKS[currentTrackIndex];
  const isCurrentTrackLiked = likedTrackIds.has(currentTrack.id);

  const toggleLike = (id: string) => {
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Progress simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying && !isSeeking) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            handleNext(true);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrackIndex, isSeeking]);

  const progressBarWidthRef = useRef(0);
  const durationRef = useRef(currentTrack.duration);
  const dragStartTimeRef = useRef(0);

  useEffect(() => {
    durationRef.current = currentTrack.duration;
  }, [currentTrack.duration]);



  const handleNext = (isAuto = false) => {
    if (isRepeat && isAuto) {
      setCurrentTime(0);
      return;
    }

    if (isShuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * TRACKS.length));
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    }
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const filteredPlaylists = PLAYLISTS.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayTime = isSeeking ? seekTime : currentTime;
  const progressPercent = (displayTime / currentTrack.duration) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <PullToRefreshCar scrollY={scrollY} />
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        onScrollEndDrag={(e) => { if (e.nativeEvent.contentOffset.y < -100 && !refreshing) handleRefresh(); }}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Travel Music</Text>
          <TouchableOpacity onPress={() => setLikedSongsModalVisible(true)}>
            <Heart size={26} color={likedTrackIds.size > 0 ? '#ef4444' : colors.text} fill={likedTrackIds.size > 0 ? '#ef4444' : 'transparent'} />
          </TouchableOpacity>
        </View>

        {/* Music Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Search size={20} color={colors.tabIconDefault} />
            <TextInput
              placeholder="Search playlists or artists..."
              placeholderTextColor={colors.tabIconDefault}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={colors.tabIconDefault} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Featured Player Card */}
        <View style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={{ uri: currentTrack.cover }} style={styles.coverArt} />
          <View style={[styles.trackInfo, { marginBottom: 32 }]}>
            <View style={styles.trackMain}>
              <Text style={[styles.trackTitle, { color: colors.text }]}>{currentTrack.title}</Text>
              <Text style={[styles.trackArtist, { color: colors.tabIconDefault }]}>
                {currentTrack.artist}  •  {formatTime(currentTime)} / {formatTime(currentTrack.duration)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => toggleLike(currentTrack.id)}>
              <Heart size={26} fill={isCurrentTrackLiked ? '#ef4444' : 'transparent'} color={isCurrentTrackLiked ? '#ef4444' : colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
              <Shuffle size={20} color={isShuffle ? colors.tint : colors.tabIconDefault} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handlePrev}>
              <SkipBack size={32} fill={colors.text} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.playBtn, { backgroundColor: colors.tint }]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause size={28} fill="#fff" color="#fff" />
              ) : (
                <Play size={28} fill="#fff" color="#fff" style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleNext()}>
              <SkipForward size={32} fill={colors.text} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)}>
              <Repeat size={20} color={isRepeat ? colors.tint : colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Playlists */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {searchQuery ? 'Search Results' : 'Your Playlists'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistRow}>
            {filteredPlaylists.map((p) => (
              <TouchableOpacity key={p.id} style={styles.playlistCard}>
                <Image source={{ uri: p.cover }} style={styles.playlistCover} />
                <Text style={[styles.playlistTitle, { color: colors.text }]}>{p.title}</Text>
                <Text style={[styles.playlistTracks, { color: colors.tabIconDefault }]}>{p.tracks} Tracks</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.ScrollView>
      {/* Liked Songs Modal */}
      <Modal
        visible={likedSongsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLikedSongsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.modalHeartIcon, { backgroundColor: '#ef444415' }]}>
                  <Heart size={20} color="#ef4444" fill="#ef4444" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Liked Songs</Text>
              </View>
              <TouchableOpacity onPress={() => setLikedSongsModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {TRACKS.filter(t => likedTrackIds.has(t.id)).length > 0 ? (
                TRACKS.filter(t => likedTrackIds.has(t.id)).map((track) => (
                  <TouchableOpacity 
                    key={track.id} 
                    style={styles.likedTrackItem}
                    onPress={() => {
                      const idx = TRACKS.findIndex(t => t.id === track.id);
                      setCurrentTrackIndex(idx);
                      setCurrentTime(0);
                      setIsPlaying(true);
                      setLikedSongsModalVisible(false);
                    }}
                  >
                    <Image source={{ uri: track.cover }} style={styles.likedTrackCover} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.likedTrackTitle, { color: colors.text }]}>{track.title}</Text>
                      <Text style={[styles.likedTrackArtist, { color: colors.tabIconDefault }]}>{track.artist}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleLike(track.id)} style={{ padding: 8 }}>
                      <Heart size={20} color="#ef4444" fill="#ef4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyLiked}>
                  <Heart size={48} color={colors.border} />
                  <Text style={[styles.emptyLikedText, { color: colors.tabIconDefault }]}>No liked songs yet.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 15, paddingHorizontal: 15, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '500' },
  playerCard: { margin: 20, padding: 24, borderRadius: 32, borderWidth: 1, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
  coverArt: { width: '100%', height: width - 120, borderRadius: 24, marginBottom: 24 },
  trackInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  trackMain: { flex: 1 },
  trackTitle: { fontSize: 22, fontWeight: '900' },
  trackArtist: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  progressContainer: { marginBottom: 28 },
  progressBarWrapper: { height: 30, justifyContent: 'center', position: 'relative' },
  progressBar: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  seekerHandle: { position: 'absolute', width: 16, height: 16, borderRadius: 8, borderWidth: 3, marginLeft: -8, zIndex: 20 },
  timeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { fontSize: 12, fontWeight: '700' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  playBtn: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  section: { marginTop: 10, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '800', paddingHorizontal: 20, marginBottom: 15 },
  playlistRow: { paddingHorizontal: 20, gap: 16 },
  playlistCard: { width: 140 },
  playlistCover: { width: 140, height: 140, borderRadius: 20, marginBottom: 10 },
  playlistTitle: { fontSize: 15, fontWeight: '700' },
  playlistTracks: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  // Liked Songs Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  modalHeartIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  likedTrackItem: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  likedTrackCover: { width: 56, height: 56, borderRadius: 12 },
  likedTrackTitle: { fontSize: 16, fontWeight: '700' },
  likedTrackArtist: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  emptyLiked: { alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 16 },
  emptyLikedText: { fontSize: 16, fontWeight: '600' },
});
