import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Animated, Dimensions, ScrollView, TextInput, Modal, StatusBar, PanResponder, ActivityIndicator } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Play, Pause, SkipForward, SkipBack, Heart, Search, X, ChevronDown, Sparkles, Music, Shuffle, Repeat, Repeat1, MoreVertical } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

const LANGUAGES = ['Telugu', 'Hindi', 'English', 'Tamil', 'Global'];

export default function MusicScreen() {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tracks, setTracks] = useState<any[]>([]);
  const [feedTracks, setFeedTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [searchFilter, setSearchFilter] = useState<'Songs' | 'Albums'>('Songs');
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [likedModalVisible, setLikedModalVisible] = useState(false);
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [selectedAlbumTracks, setSelectedAlbumTracks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('Telugu');
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [currentTime, setCurrentTime] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(width - 64);
  const lastLoadTime = useRef<number>(0);
  const currentTrackRef = useRef<any>(null);
  const scrubStartProgress = useRef(0); // progress (0-1) at the moment scrub begins
  const isScrubRef = useRef(false);     // ref mirror of isScrubbing for interval closure
  const loadingTrackId = useRef<string | null>(null);

  // New Expo Audio Player
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  // Get machine IP dynamically for mobile connectivity
  const getBackendUrl = () => {
    const host = Constants.expoConfig?.hostUri?.split(':').shift() || 'localhost';
    return `http://${host}:8000`;
  };

  const fetchTracks = useCallback(async (lang: string, filterType: string) => {
    setLoading(true);
    try {
      const baseUrl = getBackendUrl();
      let response;
      if (filterType === 'Albums') {
        response = await fetch(`${baseUrl}/search?q=Trending%20${lang}%20albums&filter=albums`);
      } else {
        response = await fetch(`${baseUrl}/tracks?language=${lang}`);
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setFeedTracks(data);
        setTracks(prev => prev.length === 0 ? data : prev);
        if (!status.playing && filterType === 'Songs') {
          setCurrentTrack(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
    } finally {
      setLoading(false);
    }
  }, [status.playing]);

  useEffect(() => {
    // Configure audio mode for proper playback on iOS/Android
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });
      } catch (e) {
        console.error("Error setting audio mode:", e);
      }
    };
    configureAudio();
  }, []);

  useEffect(() => {
    fetchTracks(activeLanguage, searchFilter);
  }, [activeLanguage, searchFilter, fetchTracks]);

  // Live Search logic calling the backend
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const baseUrl = getBackendUrl();
        const filterStr = searchFilter === 'Albums' ? 'albums' : 'songs';
        const response = await fetch(`${baseUrl}/search?q=${encodeURIComponent(searchQuery)}&filter=${filterStr}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchFilter]);

  const handleItemClick = async (item: any, contextQueue: any[] = feedTracks) => {
    if (item.type === 'album') {
      setLoading(true);
      try {
        const baseUrl = getBackendUrl();
        const response = await fetch(`${baseUrl}/album/${item.id}`);
        const albumTracks = await response.json();
        if (albumTracks && albumTracks.length > 0) {
          setSelectedAlbum(item);
          setSelectedAlbumTracks(albumTracks);
          setSearchVisible(false);
          setTimeout(() => setAlbumModalVisible(true), 50);
        }
      } catch(e) {
        console.error("Error fetching album tracks:", e);
      } finally {
        setLoading(false);
      }
    } else {
      // It's a song
      setTracks(contextQueue);
      setCurrentTrack(item);
      loadAndPlayTrack(item);
      setSearchVisible(false);
      if (searchVisible) {
        setSearchQuery('');
      }
    }
  };

  const filteredTracks = feedTracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chunkedTracks = [];
  for (let i = 0; i < filteredTracks.length; i += 4) {
    chunkedTracks.push(filteredTracks.slice(i, i + 4));
  }

  const toggleLike = (id: string) => {
    setLikedSongs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Keep ref in sync with state for PanResponder closures
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const skipTrack = useCallback((direction: 'next' | 'prev') => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    let nextIndex;

    if (isShuffling) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      if (direction === 'next') {
        nextIndex = (currentIndex + 1) % tracks.length;
      } else {
        nextIndex = (currentIndex - 1 + tracks.length) % tracks.length;
      }
    }

    setCurrentTrack(tracks[nextIndex]);
    loadAndPlayTrack(tracks[nextIndex]);
  }, [tracks, currentTrack, isShuffling]);

  const togglePlayback = () => {
    console.log("Toggle playback called. Current state:", status.playing, "Duration:", status.duration);
    if (!currentTrack) return;

    // If no song is loaded yet, load it and play
    if (status.duration === 0) {
      loadAndPlayTrack(currentTrack);
    } else {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  const loadAndPlayTrack = async (trackArg: any) => {
    let track = trackArg;
    loadingTrackId.current = track.id;
    try {
      setLoading(true);
      const baseUrl = getBackendUrl();
      console.log(`Fetching stream for: ${track.title} (${track.id})`);
      const streamResponse = await fetch(`${baseUrl}/stream/${track.id}`);
      const { url, headers, duration } = await streamResponse.json();
      
      if (loadingTrackId.current !== track.id) {
        console.log(`Aborting setup for ${track.id} as a newer track is loading`);
        return;
      }
      
      console.log(`Received stream URL and headers. Duration: ${duration}`);
      
      // Update track duration in state so progress bar and time display are correct
      if (duration) {
        const updatedTrack = { ...track, duration };
        setCurrentTrack(updatedTrack);
        track = updatedTrack; // use updated reference for the rest of this function
      }

      // Use object format with headers for maximum compatibility
      await player.replace({ uri: url, headers });
      
      if (loadingTrackId.current !== track.id) return;
      
      lastLoadTime.current = Date.now(); // record load time to guard auto-skip
      setCurrentTime(0);
      progressAnim.setValue(0);
      
      // Wait a tiny bit for the player to initialize the new source
      setTimeout(() => {
        if (loadingTrackId.current === track.id) {
          player.play();
          console.log("Player.play() called");
        }
      }, 200);
    } catch (error) {
      console.error("Error loading track:", error);
    } finally {
      if (loadingTrackId.current === track.id) {
        setLoading(false);
      }
    }
  };

  // Sync current time for timer display and progress bar only
  useEffect(() => {
    if (!isScrubbing) {
      setCurrentTime(status.currentTime);
    }
  }, [status.currentTime, isScrubbing]);

  // Dedicated track-end handler with cooldown guard
  useEffect(() => {
    const msSinceLoad = Date.now() - lastLoadTime.current;
    const hasPlayed = msSinceLoad > 4000;
    const trackDuration = currentTrack?.duration || 0;
    const isNearEnd = trackDuration > 0 && status.currentTime > 0 &&
                      status.currentTime >= trackDuration * 0.99;
    
    if (hasPlayed && isNearEnd) {
      if (repeatMode === 'one') {
        player.seekTo(0);
        player.play();
      } else {
        skipTrack('next');
      }
    }
  }, [status.currentTime, currentTrack, repeatMode, skipTrack]);

  // High-frequency update for smooth progress while playing
  useEffect(() => {
    let interval: any;
    if (status.playing && !isScrubRef.current) {
      interval = setInterval(() => {
        if (!isScrubRef.current) {
          setCurrentTime(player.currentTime);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status.playing, player]);

  // Animate progress bar using backend duration as source of truth
  useEffect(() => {
    if (isScrubbing) return;
    const trackDuration = currentTrack?.duration || 230;
    const progress = trackDuration > 0 ? Math.min(1, currentTime / trackDuration) : 0;
    
    Animated.timing(progressAnim, {
      toValue: isNaN(progress) ? 0 : progress,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [currentTime, isScrubbing, currentTrack, progressAnim]);

  const formatTime = (seconds: number) => {
    const totalSecs = Math.floor(seconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        progressAnim.stopAnimation((currentValue) => {
          scrubStartProgress.current = currentValue;
        });
        isScrubRef.current = true;
        setIsScrubbing(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const bw = barWidth.current;
        const progress = Math.max(0, Math.min(1,
          scrubStartProgress.current + gestureState.dx / bw
        ));
        progressAnim.setValue(progress);

        const dur = currentTrackRef.current?.duration || 230;
        setCurrentTime(progress * dur);
      },
      onPanResponderRelease: (_, gestureState) => {
        const bw = barWidth.current;
        const progress = Math.max(0, Math.min(1,
          scrubStartProgress.current + gestureState.dx / bw
        ));
        const dur = currentTrackRef.current?.duration || 230;
        const seekTime = progress * dur;

        player.seekTo(seekTime);
        setCurrentTime(seekTime);
        isScrubRef.current = false;
        setIsScrubbing(false);
      },
      onPanResponderTerminate: () => {
        isScrubRef.current = false;
        setIsScrubbing(false);
      },
    })
  ).current;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#ffffff' }]}>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? colors.background : '#ffffff' }} edges={['top']}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: isDarkMode ? colors.background : '#ffffff' }}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.logoText, { color: colors.text }]}>ROADMIX</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => setSearchVisible(true)} style={{ padding: 8 }}>
                <Search size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLikedModalVisible(true)} style={{ padding: 8, marginLeft: 8 }}>
                <Heart size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang}
                onPress={() => setActiveLanguage(lang)}
                style={[
                  styles.chip,
                  activeLanguage === lang ? { backgroundColor: colors.text, borderColor: colors.text } : { backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f5', borderColor: isDarkMode ? '#333' : '#e5e5e5' }
                ]}
              >
                <Text style={[styles.chipText, activeLanguage === lang ? { color: isDarkMode ? colors.background : '#ffffff' } : { color: colors.text }]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipContainer, { marginTop: -12, marginBottom: 24 }]}>
            <TouchableOpacity 
              style={[styles.chip, searchFilter === 'Songs' ? { backgroundColor: colors.text, borderColor: colors.text } : { backgroundColor: 'transparent', borderColor: colors.tabIconDefault }]}
              onPress={() => setSearchFilter('Songs')}
            >
              <Text style={[styles.chipText, searchFilter === 'Songs' ? { color: isDarkMode ? colors.background : '#ffffff' } : { color: colors.text }]}>Songs</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chip, searchFilter === 'Albums' ? { backgroundColor: colors.text, borderColor: colors.text } : { backgroundColor: 'transparent', borderColor: colors.tabIconDefault }]}
              onPress={() => setSearchFilter('Albums')}
            >
              <Text style={[styles.chipText, searchFilter === 'Albums' ? { color: isDarkMode ? colors.background : '#ffffff' } : { color: colors.text }]}>Albums</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Section: Listen again */}
          {filteredTracks.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Listen again</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                {filteredTracks.slice(0, 6).map(track => (
                  <TouchableOpacity key={track.id} style={styles.listenAgainCard} onPress={() => handleItemClick(track)}>
                    <Image source={{ uri: track.cover }} style={styles.listenAgainImage} />
                    <Text style={[styles.listenAgainTitle, { color: colors.text }]} numberOfLines={2}>{track.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section: Quick picks */}
          {chunkedTracks.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionSubtitle, { color: colors.tabIconDefault }]}>START RADIO FROM A SONG</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick picks</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent} snapToInterval={width * 0.85 + 16} decelerationRate="fast">
                {chunkedTracks.map((chunk, idx) => (
                  <View key={idx} style={styles.quickPicksColumn}>
                    {chunk.map(track => (
                      <TouchableOpacity key={track.id} style={styles.quickPickItem} onPress={() => handleItemClick(track)}>
                        <Image source={{ uri: track.cover }} style={styles.quickPickImage} />
                        <View style={styles.quickPickInfo}>
                          <Text style={[styles.quickPickTitle, { color: colors.text }]} numberOfLines={1}>{track.title}</Text>
                          <Text style={[styles.quickPickArtist, { color: colors.tabIconDefault }]} numberOfLines={1}>{track.artist}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section: Recommended */}
          {filteredTracks.length > 6 && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for you</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                {filteredTracks.slice(6).map(track => (
                  <TouchableOpacity key={track.id} style={styles.recommendedCard} onPress={() => handleItemClick(track)}>
                    <Image source={{ uri: track.cover }} style={styles.recommendedImage} />
                    <Text style={[styles.recommendedTitle, { color: colors.text }]} numberOfLines={1}>{track.title}</Text>
                    <Text style={[styles.recommendedArtist, { color: colors.tabIconDefault }]} numberOfLines={1}>{track.artist}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Search Modal */}
        <Modal visible={searchVisible} animationType="fade" transparent={true}>
          <View style={[styles.searchOverlay, { backgroundColor: isDarkMode ? colors.background : '#ffffff', paddingTop: insets.top }]}>
            <View style={styles.searchHeader}>
              <View style={[styles.searchBar, { backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f5' }]}>
                <Search size={20} color={colors.tabIconDefault} />
                <TextInput
                  placeholder={`Search songs, albums...`}
                  placeholderTextColor={colors.tabIconDefault}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={20} color={colors.tabIconDefault} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => setSearchVisible(false)} style={{ padding: 4 }}>
                <X size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 16 }}>
              {isSearching ? (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <ActivityIndicator size="large" color={colors.text} />
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map(item => (
                  <TouchableOpacity
                    key={item.id + '_search'}
                    style={styles.searchResult}
                    onPress={() => handleItemClick(item)}
                  >
                    <Image source={{ uri: item.cover }} style={styles.searchThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.searchTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.searchArtist, { color: colors.tabIconDefault }]} numberOfLines={1}>{item.type === 'album' ? 'Album • ' : 'Song • '}{item.artist}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : null}
            </ScrollView>
          </View>
        </Modal>

        {/* Liked Songs Library Modal */}
        <Modal visible={likedModalVisible} animationType="slide" transparent={true}>
          <View style={[styles.searchOverlay, { backgroundColor: isDarkMode ? colors.background : '#ffffff', paddingTop: insets.top }]}>
            <View style={[styles.fullHeader, { paddingHorizontal: 16 }]}>
              <TouchableOpacity onPress={() => setLikedModalVisible(false)} style={styles.closeBtn}>
                <ChevronDown size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.logoText, { color: colors.text, fontSize: 20 }]}>Liked Songs</Text>
              <View style={{ width: 44 }} />
            </View>

            <ScrollView style={{ paddingHorizontal: 16 }}>
              {tracks.filter(track => likedSongs.includes(track.id)).map(track => (
                <TouchableOpacity
                  key={track.id + '_liked'}
                  style={styles.searchResult}
                  onPress={() => {
                    setCurrentTrack(track);
                    loadAndPlayTrack(track);
                    setLikedModalVisible(false);
                  }}
                >
                  <Image source={{ uri: track.cover }} style={styles.searchThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.searchTitle, { color: colors.text }]}>{track.title}</Text>
                    <Text style={[styles.searchArtist, { color: colors.tabIconDefault }]}>{track.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleLike(track.id)} style={{ padding: 10 }}>
                    <Heart size={22} color="#ef4444" fill="#ef4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>

        {/* Album View Modal */}
        <Modal visible={albumModalVisible} animationType="slide" transparent={true}>
          <View style={[styles.searchOverlay, { backgroundColor: isDarkMode ? colors.background : '#ffffff', paddingTop: insets.top }]}>
            <View style={[styles.fullHeader, { paddingHorizontal: 16 }]}>
              <TouchableOpacity onPress={() => setAlbumModalVisible(false)} style={styles.closeBtn}>
                <ChevronDown size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.logoText, { color: colors.text, fontSize: 18, flex: 1, textAlign: 'center' }]} numberOfLines={1}>{selectedAlbum?.title}</Text>
              <View style={{ width: 44 }} />
            </View>

            <ScrollView style={{ paddingHorizontal: 16 }}>
              {selectedAlbum && (
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <Image source={{ uri: selectedAlbum.cover }} style={{ width: 160, height: 160, borderRadius: 8, marginBottom: 16 }} />
                  <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }} numberOfLines={1}>{selectedAlbum.title}</Text>
                  <Text style={{ color: colors.tabIconDefault, fontSize: 16, marginTop: 4 }}>{selectedAlbum.artist}</Text>
                  
                  <TouchableOpacity 
                    style={{ backgroundColor: colors.text, paddingHorizontal: 40, paddingVertical: 12, borderRadius: 24, marginTop: 20, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                      setTracks(selectedAlbumTracks);
                      setCurrentTrack(selectedAlbumTracks[0]);
                      loadAndPlayTrack(selectedAlbumTracks[0]);
                      setAlbumModalVisible(false);
                      setSearchVisible(false);
                    }}
                  >
                    <Play size={20} color={isDarkMode ? colors.background : '#ffffff'} fill={isDarkMode ? colors.background : '#ffffff'} />
                    <Text style={{ color: isDarkMode ? colors.background : '#ffffff', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>Play All</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedAlbumTracks.map((track, index) => (
                <TouchableOpacity
                  key={track.id + '_album'}
                  style={styles.searchResult}
                  onPress={() => {
                    setTracks(selectedAlbumTracks);
                    setCurrentTrack(track);
                    loadAndPlayTrack(track);
                    setAlbumModalVisible(false);
                    setSearchVisible(false);
                  }}
                >
                  <Text style={{ color: colors.tabIconDefault, fontSize: 16, fontWeight: '600', width: 24 }}>{index + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.searchTitle, { color: colors.text }]} numberOfLines={1}>{track.title}</Text>
                    <Text style={[styles.searchArtist, { color: colors.tabIconDefault }]} numberOfLines={1}>{track.artist}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 80 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* Floating Mini Player - YT Music Style */}
        {currentTrack && (
          <View style={styles.miniPlayerWrapper}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.miniPlayer, { backgroundColor: isDarkMode ? '#212121' : '#f5f5f5' }]}
              onPress={() => setPlayerModalVisible(true)}
            >
              <View style={styles.miniPlayerInner}>
                <Image source={{ uri: currentTrack.cover }} style={styles.miniAvatar} />
                <View style={styles.miniContent}>
                  <Text style={[styles.miniName, { color: colors.text }]} numberOfLines={1}>{currentTrack.title}</Text>
                  <Text style={[styles.miniSub, { color: colors.tabIconDefault }]} numberOfLines={1}>{currentTrack.artist}</Text>
                </View>
                <TouchableOpacity style={styles.miniControlBtn} onPress={togglePlayback} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    status.playing ? <Pause size={24} color={colors.text} fill={colors.text} /> : <Play size={24} color={colors.text} fill={colors.text} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniControlBtn} onPress={() => skipTrack('next')}>
                  <SkipForward size={24} color={colors.text} fill={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.miniProgressBarContainer}>
                <Animated.View style={[
                  styles.miniProgressBar,
                  {
                    width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: colors.text,
                  }
                ]} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Full Player Modal - YT Music Style */}
        <Modal visible={playerModalVisible} animationType="slide">
          {currentTrack && (
            <View style={[styles.fullPlayer, { backgroundColor: isDarkMode ? colors.background : '#ffffff', paddingTop: insets.top, paddingBottom: insets.bottom }]}>
              <View style={styles.fullHeader}>
                <TouchableOpacity onPress={() => setPlayerModalVisible(false)} style={styles.closeBtn}>
                  <ChevronDown size={28} color={colors.text} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.fullHeaderSub, { color: colors.tabIconDefault }]}>PLAYING FROM RADIO</Text>
                  <Text style={[styles.fullHeaderText, { color: colors.text }]}>{activeLanguage} Mix</Text>
                </View>
                <View style={{ width: 44 }} />
              </View>

              <View style={styles.fullContent}>
                <View style={styles.fullArtworkWrapper}>
                  <Image source={{ uri: currentTrack.cover }} style={styles.fullCover} />
                </View>

                <View style={styles.fullMeta}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <Text style={[styles.fullTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{currentTrack.title}</Text>
                    <Text style={[styles.fullArtist, { color: colors.tabIconDefault }]} numberOfLines={1} ellipsizeMode="tail">{currentTrack.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleLike(currentTrack.id)}>
                    <Heart
                      size={28}
                      color={likedSongs.includes(currentTrack.id) ? colors.text : colors.text}
                      fill={likedSongs.includes(currentTrack.id) ? colors.text : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.fullProgress}>
                  <View
                    {...panResponder.panHandlers}
                    style={[styles.fullProgressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
                    onLayout={(e) => { barWidth.current = e.nativeEvent.layout.width; }}
                  >
                    <Animated.View style={[
                      styles.fullProgressFill,
                      {
                        width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                        backgroundColor: colors.text,
                      }
                    ]} />
                    <Animated.View style={[
                      styles.progressKnob,
                      {
                        left: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, barWidth.current - 12]
                        }),
                        backgroundColor: colors.text,
                      }
                    ]} />
                  </View>
                  <View style={styles.fullTimeRow}>
                    <Text style={[styles.fullTime, { color: colors.tabIconDefault }]}>{formatTime(currentTime)}</Text>
                    <Text style={[styles.fullTime, { color: colors.tabIconDefault }]}>{formatTime(currentTrack?.duration || 230)}</Text>
                  </View>
                </View>

                <View style={styles.fullControls}>
                  <TouchableOpacity onPress={() => setIsShuffling(!isShuffling)}>
                    <Shuffle size={24} color={isShuffling ? colors.text : colors.tabIconDefault} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => skipTrack('prev')}>
                    <SkipBack size={36} color={colors.text} fill={colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.fullPlayBtn, { backgroundColor: colors.text }]}
                    onPress={togglePlayback}
                  >
                    {status.playing ? (
                      <Pause size={36} color={isDarkMode ? colors.background : '#ffffff'} fill={isDarkMode ? colors.background : '#ffffff'} />
                    ) : (
                      <Play size={36} color={isDarkMode ? colors.background : '#ffffff'} fill={isDarkMode ? colors.background : '#ffffff'} style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => skipTrack('next')}>
                    <SkipForward size={36} color={colors.text} fill={colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none')}>
                    {repeatMode === 'one' ? (
                      <Repeat1 size={24} color={colors.text} />
                    ) : (
                      <Repeat size={24} color={repeatMode === 'all' ? colors.text : colors.tabIconDefault} />
                    )}
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          )}
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 160 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  logoText: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },

  chipContainer: { paddingHorizontal: 16, marginBottom: 24, flexGrow: 0, height: 40 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, height: 36, justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '600' },

  sectionContainer: { marginBottom: 32 },
  sectionSubtitle: { fontSize: 11, fontWeight: '700', paddingHorizontal: 16, letterSpacing: 1, marginBottom: 4 },
  sectionTitle: { fontSize: 24, fontWeight: '800', paddingHorizontal: 16, marginBottom: 16 },
  horizontalScrollContent: { paddingHorizontal: 16, gap: 16 },

  listenAgainCard: { width: 110 },
  listenAgainImage: { width: 110, height: 110, borderRadius: 8, marginBottom: 8 },
  listenAgainTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18 },

  quickPicksColumn: { width: width * 0.85, gap: 12 },
  quickPickItem: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  quickPickImage: { width: 48, height: 48, borderRadius: 4 },
  quickPickInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  quickPickTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  quickPickArtist: { fontSize: 13, fontWeight: '500' },

  recommendedCard: { width: 140 },
  recommendedImage: { width: 140, height: 140, borderRadius: 8, marginBottom: 8 },
  recommendedTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  recommendedArtist: { fontSize: 13, fontWeight: '500' },

  // Mini Player
  miniPlayerWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  miniPlayer: { width: '100%' },
  miniPlayerInner: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingRight: 8 },
  miniAvatar: { width: 40, height: 40, borderRadius: 4 },
  miniContent: { flex: 1, marginLeft: 12 },
  miniName: { fontSize: 14, fontWeight: '700' },
  miniSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  miniControlBtn: { padding: 12 },
  miniProgressBarContainer: { height: 2, width: '100%', backgroundColor: 'rgba(128,128,128,0.2)' },
  miniProgressBar: { height: '100%' },

  // Full Player Modal
  fullPlayer: { flex: 1 },
  fullHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  fullHeaderSub: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  fullHeaderText: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  closeBtn: { padding: 8 },
  fullContent: { flex: 1, paddingHorizontal: 32 },
  fullArtworkWrapper: { width: '100%', aspectRatio: 1, marginTop: 20, marginBottom: 40, justifyContent: 'center', alignItems: 'center' },
  fullCover: { width: '100%', height: '100%', borderRadius: 8 },
  fullMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  fullTitle: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  fullArtist: { fontSize: 16, fontWeight: '500' },
  
  fullProgress: { width: '100%', marginBottom: 30 },
  fullProgressBar: { height: 4, borderRadius: 2 },
  fullProgressFill: { height: '100%', borderRadius: 2 },
  progressKnob: { position: 'absolute', width: 12, height: 12, borderRadius: 6, top: -4 },
  fullTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  fullTime: { fontSize: 12, fontWeight: '600' },
  
  fullControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  fullPlayBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },

  // Search
  searchOverlay: { flex: 1 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 24, gap: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  cancelText: { fontSize: 16, fontWeight: '600' },
  searchResult: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 10 },
  searchThumb: { width: 48, height: 48, borderRadius: 4 },
  searchTitle: { fontSize: 16, fontWeight: '600' },
  searchArtist: { fontSize: 14, marginTop: 2 },
});
