import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Animated, Dimensions, ScrollView, TextInput, Pressable, PanResponder, Modal, Platform } from 'react-native';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { Play, Pause, SkipForward, SkipBack, Repeat, Shuffle, ListMusic, Heart, Search, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

// Default placeholder if no tracks are loaded yet
const PLACEHOLDER_TRACK = {
  id: 'loading',
  title: 'Loading music...',
  artist: 'Please wait',
  cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&auto=format&fit=crop',
  duration: 0
};

const PLAYLISTS: any[] = [];

const LANGUAGES = ['All', 'Telugu', 'Hindi', 'English', 'Punjabi', 'Tamil', 'Kannada'];

export default function MusicScreen() {
  const { colors } = useTheme();

  // Connect to your live Vercel backend
  const API_URL = 'https://trip-seven-alpha.vercel.app';
  // const API_URL = 'http://192.168.1.218:8000';

  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [loading, setLoading] = useState(false);

  // Player State
  const [queue, setQueue] = useState<any[]>([]);
  const [feedTracks, setFeedTracks] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const sound = useRef<Audio.Sound | null>(null);
  const [likedTracks, setLikedTracks] = useState<any[]>([]);
  const [likedSongsModalVisible, setLikedSongsModalVisible] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  const currentTrack = queue.length > 0 && currentTrackIndex < queue.length
    ? queue[currentTrackIndex]
    : (loading ? PLACEHOLDER_TRACK : { ...PLACEHOLDER_TRACK, title: 'No tracks found', artist: 'Try another search' });
  const isCurrentTrackLiked = likedTracks.some(t => t.id === currentTrack.id);

  const fetchMusic = async (query?: string, language?: string, updateQueue: boolean = false) => {
    setLoading(true);
    const lang = language || selectedLanguage;
    try {
      // If no query, fetch latest for the language
      const q = query
        ? (lang === 'All' ? query : `${query} ${lang}`)
        : (lang === 'All' ? 'latest trending songs' : `${lang} latest songs`);
      const endpoint = `/search?q=${encodeURIComponent(q)}`;
      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();
      const results = data || [];

      if (query) {
        setSearchResults(results);
        setFeedTracks(results); // Update bottom list too
      } else {
        if (updateQueue || queue.length === 0) {
          setQueue(results);
          setCurrentTrackIndex(0);
          setCurrentTime(0);
        }
        setFeedTracks(results);
        setSearchResults([]);
      }

      return results;
    } catch (error) {
      console.error('Error fetching music:', error);
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMusic(undefined, undefined, true); // Initial load for default language
  }, []);

  const handleLanguageSelect = async (lang: string) => {
    setSelectedLanguage(lang);
    setSearchQuery('');
    setSearchResults([]);
    const results = await fetchMusic(undefined, lang, true);
    if (results && results.length > 0) {
      playSound(results[0].id);
    }
  };

  // Sound Management
  async function playSound(videoId: string) {
    console.log(`[Music] Fetching stream for: ${videoId}`);
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }

      const response = await fetch(`${API_URL}/stream/${videoId}`);
      const data = await response.json();

      if (!data.url) {
        console.error('[Music] No stream URL returned from backend');
        return;
      }

      console.log(`[Music] Playing stream: ${data.url.substring(0, 50)}...`);

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: data.url },
        { shouldPlay: true, volume: 1.0 },
        onPlaybackStatusUpdate
      );

      sound.current = newSound;

      // Explicitly call play to be certain on iOS
      await newSound.playAsync();

      if (status.isLoaded) {
        const duration = status.durationMillis ? (status.durationMillis / 1000).toFixed(1) : 'unknown';
        console.log(`[Music] Sound loaded successfully. Duration: ${duration}s`);
      }

      setIsPlaying(true);
    } catch (error) {
      console.error('[Music] Error playing sound:', error);
    }
  }

  async function togglePlayback() {
    console.log(`[Music] Toggle playback. Current track: ${currentTrack.title}`);
    if (!sound.current) {
      if (currentTrack.id !== 'loading') {
        await playSound(currentTrack.id);
      }
      return;
    }

    if (isPlaying) {
      await sound.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.current.playAsync();
      setIsPlaying(true);
    }
  }

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (!isSeeking) {
        setCurrentTime(status.positionMillis / 1000);
      }
      if (status.didJustFinish) {
        handleNext(true);
      }
    } else if (status.error) {
      console.error(`[Music] Playback error: ${status.error}`);
    }
  };

  useEffect(() => {
    // Configure audio for iOS
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  // Sync index change with sound
  useEffect(() => {
    if (isPlaying && queue.length > 0 && currentTrackIndex < queue.length) {
      playSound(queue[currentTrackIndex].id);
    }
  }, [currentTrackIndex]);

  const toggleLike = (track: any) => {
    setLikedTracks((prev) => {
      const exists = prev.find(t => t.id === track.id);
      if (exists) return prev.filter(t => t.id !== track.id);
      return [...prev, track];
    });
  };

  // Live Search Effect (Debounced)
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        fetchMusic(searchQuery);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else if (searchQuery.trim().length === 0) {
      fetchMusic(); // Reset to trending/latest if cleared
    }
  }, [searchQuery]);

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
      setCurrentTrackIndex(Math.floor(Math.random() * queue.length));
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % queue.length);
    }
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + queue.length) % queue.length);
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
            <Heart size={26} color={likedTracks.length > 0 ? '#ef4444' : colors.text} fill={likedTracks.length > 0 ? '#ef4444' : 'transparent'} />
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
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={colors.tabIconDefault} />
              </TouchableOpacity>
            )}
          </View>

          {/* Floating Search Results */}
          {searchResults.length > 0 && (
            <View style={[styles.floatingResults, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300 }}>
                {searchResults.map((track, index) => {
                  const isLiked = likedTracks.some(t => t.id === track.id);
                  return (
                    <TouchableOpacity
                      key={track.id}
                      style={styles.floatingResultItem}
                      onPress={() => {
                        const newQueue = [track, ...searchResults.filter(t => t.id !== track.id)];
                        setQueue(newQueue);
                        setCurrentTrackIndex(0);
                        setCurrentTime(0);
                        playSound(track.id);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <Image source={{ uri: track.cover }} style={styles.floatingThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.floatingTitle, { color: colors.text }]} numberOfLines={1}>{track.title}</Text>
                        <Text style={[styles.floatingArtist, { color: colors.tabIconDefault }]} numberOfLines={1}>{track.artist}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleLike(track);
                        }}
                        style={{ padding: 4 }}
                      >
                        <Heart size={20} fill={isLiked ? '#ef4444' : 'transparent'} color={isLiked ? '#ef4444' : colors.tabIconDefault} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Language Filters */}
        <View style={styles.languageContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageChip,
                  { backgroundColor: selectedLanguage === lang ? colors.tint : colors.card, borderColor: colors.border }
                ]}
                onPress={() => handleLanguageSelect(lang)}
              >
                <Text style={[
                  styles.languageText,
                  { color: selectedLanguage === lang ? '#fff' : colors.text }
                ]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
            <TouchableOpacity onPress={() => toggleLike(currentTrack)}>
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
              onPress={togglePlayback}
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

        {/* Playlists (Now Search Results / Latest Hits) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {searchQuery ? 'Search Results' : `${selectedLanguage} Latest Hits`}
          </Text>
          <View style={styles.trackList}>
            {feedTracks.map((track, index) => {
              const isActive = currentTrack.id === track.id;
              const isLiked = likedTracks.some(t => t.id === track.id);
              return (
                <TouchableOpacity
                  key={`${track.id}-${index}`}
                  style={[
                    styles.trackItem,
                    { backgroundColor: isActive ? colors.card : 'transparent' }
                  ]}
                  onPress={() => {
                    const newQueue = [track, ...feedTracks.filter(t => t.id !== track.id)];
                    setQueue(newQueue);
                    setCurrentTrackIndex(0);
                    setCurrentTime(0);
                    playSound(track.id);
                  }}
                >
                  <Image source={{ uri: track.cover }} style={styles.trackThumb} />
                  <View style={styles.trackDetails}>
                    <Text
                      style={[
                        styles.trackListTitle,
                        { color: isActive ? colors.tint : colors.text }
                      ]}
                      numberOfLines={1}
                    >
                      {track.title}
                    </Text>
                    <Text style={[styles.trackListArtist, { color: colors.tabIconDefault }]} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                  {isActive && isPlaying && (
                    <View style={styles.playingIndicator}>
                      <View style={[styles.playingBar, { height: 12, backgroundColor: colors.tint }]} />
                      <View style={[styles.playingBar, { height: 18, backgroundColor: colors.tint }]} />
                      <View style={[styles.playingBar, { height: 10, backgroundColor: colors.tint }]} />
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleLike(track);
                    }}
                    style={{ padding: 8, marginLeft: 8 }}
                  >
                    <Heart size={22} fill={isLiked ? '#ef4444' : 'transparent'} color={isLiked ? '#ef4444' : colors.tabIconDefault} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })}
            {loading && feedTracks.length === 0 && (
              <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>Finding the perfect tracks...</Text>
            )}
          </View>
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
              {likedTracks.length > 0 ? (
                likedTracks.map((track) => (
                  <TouchableOpacity
                    key={track.id}
                    style={styles.likedTrackItem}
                    onPress={() => {
                      const newQueue = [track, ...likedTracks.filter(t => t.id !== track.id)];
                      setQueue(newQueue);
                      setCurrentTrackIndex(0);
                      setCurrentTime(0);
                      playSound(track.id);
                      setLikedSongsModalVisible(false);
                    }}
                  >
                    <Image source={{ uri: track.cover }} style={styles.likedTrackCover} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.likedTrackTitle, { color: colors.text }]}>{track.title}</Text>
                      <Text style={[styles.likedTrackArtist, { color: colors.tabIconDefault }]}>{track.artist}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleLike(track)} style={{ padding: 8 }}>
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
  languageContainer: { marginBottom: 15 },
  languageRow: { paddingHorizontal: 20, gap: 10 },
  languageChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  languageText: { fontSize: 14, fontWeight: '700' },
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
  trackList: { paddingHorizontal: 20 },
  trackItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 8, gap: 12 },
  trackThumb: { width: 50, height: 50, borderRadius: 10 },
  trackDetails: { flex: 1 },
  trackListTitle: { fontSize: 16, fontWeight: '700' },
  trackListArtist: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  playingIndicator: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 20, paddingBottom: 2 },
  playingBar: { width: 3, borderRadius: 1.5 },
  loadingText: { textAlign: 'center', marginTop: 20, fontSize: 15, fontWeight: '600' },
  floatingResults: { position: 'absolute', top: 60, left: 20, right: 20, borderRadius: 20, borderWidth: 1, zIndex: 100, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, padding: 8 },
  floatingResultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12 },
  floatingThumb: { width: 40, height: 40, borderRadius: 8 },
  floatingTitle: { fontSize: 14, fontWeight: '700' },
  floatingArtist: { fontSize: 12, fontWeight: '500' },
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
