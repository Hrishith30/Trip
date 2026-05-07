import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Animated, Dimensions, ScrollView, TextInput, Modal, Platform, StatusBar } from 'react-native';
import { Play, Pause, SkipForward, SkipBack, Heart, Search, X, ChevronDown, MoreHorizontal, ArrowRight, Sparkles, Music, Shuffle, Repeat, Repeat1 } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const MOCK_TRACKS = [
  { id: '1', title: 'Late Night Drive', artist: 'Neon Lights', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500', color: '#6366f1' },
  { id: '2', title: 'Sunset Boulevard', artist: 'The Dreamers', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500', color: '#ec4899' },
  { id: '3', title: 'Urban Echo', artist: 'City Pulse', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500', color: '#8b5cf6' },
  { id: '4', title: 'Electric Soul', artist: 'Future Retro', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=500', color: '#06b6d4' },
  { id: '5', title: 'Golden Hour', artist: 'Amber Sky', cover: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=500', color: '#f59e0b' },
  { id: '6', title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500', color: '#3b82f6' },
  { id: '7', title: 'Starboy', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500', color: '#ef4444' },
  { id: '8', title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500', color: '#f59e0b' },
  { id: '9', title: 'Levitating', artist: 'Dua Lipa', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=500', color: '#ec4899' },
  { id: '10', title: 'Heat Waves', artist: 'Glass Animals', cover: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=500', color: '#8b5cf6' },
  { id: '11', title: 'Circle', artist: 'Post Malone', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500', color: '#3b82f6' },
  { id: '12', title: 'Sunflower', artist: 'Post Malone', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500', color: '#ef4444' },
  { id: '13', title: 'Mood', artist: '24kGoldn', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500', color: '#f59e0b' },
  { id: '14', title: 'Stay', artist: 'The Kid LAROI', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=500', color: '#ec4899' },
  { id: '15', title: 'Peaches', artist: 'Justin Bieber', cover: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=500', color: '#8b5cf6' },
  { id: '16', title: 'Bad Habits', artist: 'Ed Sheeran', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500', color: '#3b82f6' },
  { id: '17', title: 'Shivers', artist: 'Ed Sheeran', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500', color: '#ef4444' },
  { id: '18', title: 'Cold Heart', artist: 'Elton John', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500', color: '#f59e0b' },
  { id: '19', title: 'Easy On Me', artist: 'Adele', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=500', color: '#ec4899' },
  { id: '20', title: 'Ghost', artist: 'Justin Bieber', cover: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=500', color: '#8b5cf6' },
];

const LANGUAGES = ['Telugu', 'Hindi', 'English', 'Tamil', 'Global'];

export default function MusicScreen() {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentTrack, setCurrentTrack] = useState(MOCK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState<string[]>(['1', '3']);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [likedModalVisible, setLikedModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('Telugu');
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');

  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredTracks = MOCK_TRACKS.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLike = (id: string) => {
    setLikedSongs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#ffffff' }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        >
          {/* Cinematic Header - Matching Index Page */}
          <View style={styles.heroHeader}>
            <View style={styles.headerTop}>
              <View style={styles.hubLeft}>
                <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>ROADMIX</Text>
                <Text style={[styles.name, { color: colors.text }]}>Now Playing</Text>
              </View>

              <TouchableOpacity
                style={styles.topHeartBtn}
                onPress={() => setLikedModalVisible(true)}
              >
                <Heart size={26} color="#ef4444" fill="#ef4444" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.searchBtn, { backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff', borderColor: colors.border, borderWidth: 1.5, marginTop: 20, paddingHorizontal: 16, width: '100%', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 }]}
              onPress={() => setSearchVisible(true)}
            >
              <Search size={20} color={colors.tabIconDefault} />
              <Text style={{ color: colors.tabIconDefault, fontWeight: '600', marginLeft: 12 }}>Search tracks...</Text>
            </TouchableOpacity>
          </View>

          {/* Language Selector */}
          <View style={styles.languageContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageInner}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setActiveLanguage(lang)}
                  style={[
                    styles.languageChip,
                    activeLanguage === lang ? { backgroundColor: colors.tint } : { backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff', borderColor: colors.border, borderWidth: 1.5 }
                  ]}
                >
                  <Text style={[styles.languageText, activeLanguage === lang ? { color: '#fff' } : { color: colors.text }]}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Featured Hero Card - Matching Index Page */}
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Currently Playing</Text>
          </View>

          <TouchableOpacity
            style={styles.heroCard}
            activeOpacity={0.9}
            onPress={() => setPlayerModalVisible(true)}
          >
            <Image source={{ uri: currentTrack.cover }} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <View style={styles.heroBadge}>
                <Music size={14} color="#fff" />
                <Text style={styles.heroBadgeText}>{isPlaying ? 'PLAYING' : 'PAUSED'}</Text>
              </View>

              <View style={styles.heroBottom}>
                <View>
                  <Text style={styles.heroTitle}>{currentTrack.title}</Text>
                  <Text style={styles.heroSub}>{currentTrack.artist}</Text>
                </View>
                <TouchableOpacity
                  style={styles.heroAction}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={20} color="#000" /> : <Play size={20} color="#000" fill="#000" style={{ marginLeft: 3 }} />}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Trending List - Matching Action Cards style */}
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{activeLanguage} Songs</Text>
          </View>

          <View style={styles.trackGrid}>
            {filteredTracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackCard, { backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff', borderColor: colors.border }]}
                onPress={() => {
                  setCurrentTrack(track);
                  setIsPlaying(true);
                }}
              >
                <Image source={{ uri: track.cover }} style={styles.trackThumb} />
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>{track.title}</Text>
                  <Text style={[styles.trackArtist, { color: colors.tabIconDefault }]} numberOfLines={1}>{track.artist}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleLike(track.id)} style={styles.trackLike}>
                  <Heart
                    size={24}
                    color={likedSongs.includes(track.id) ? '#ef4444' : colors.tabIconDefault}
                    fill={likedSongs.includes(track.id) ? '#ef4444' : 'transparent'}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Modal visible={searchVisible} animationType="fade" transparent={true}>
          <View style={[styles.searchOverlay, { backgroundColor: colors.background + 'F0', paddingTop: insets.top }]}>
            <View style={styles.searchHeader}>
              <View style={[styles.searchBar, { backgroundColor: colors.border + '50' }]}>
                <Search size={20} color={colors.tabIconDefault} />
                <TextInput
                  placeholder="Search music..."
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
              <TouchableOpacity onPress={() => setSearchVisible(false)}>
                <Text style={[styles.cancelText, { color: colors.tint }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 24 }}>
              {filteredTracks.map(track => (
                <TouchableOpacity
                  key={track.id + '_search'}
                  style={styles.searchResult}
                  onPress={() => {
                    setCurrentTrack(track);
                    setIsPlaying(true);
                    setSearchVisible(false);
                  }}
                >
                  <Image source={{ uri: track.cover }} style={styles.searchThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.searchTitle, { color: colors.text }]}>{track.title}</Text>
                    <Text style={[styles.searchArtist, { color: colors.tabIconDefault }]}>{track.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleLike(track.id)} style={{ padding: 10 }}>
                    <Heart
                      size={26}
                      color={likedSongs.includes(track.id) ? '#ef4444' : colors.tabIconDefault}
                      fill={likedSongs.includes(track.id) ? '#ef4444' : 'transparent'}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>

        {/* Liked Songs Library Modal */}
        <Modal visible={likedModalVisible} animationType="slide" transparent={true}>
          <View style={[styles.searchOverlay, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={styles.searchHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>LIBRARY</Text>
                <Text style={[styles.name, { color: colors.text, fontSize: 24 }]}>Liked Songs</Text>
              </View>
              <TouchableOpacity onPress={() => setLikedModalVisible(false)} style={styles.closeBtn}>
                <X size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 24 }}>
              {MOCK_TRACKS.filter(track => likedSongs.includes(track.id)).length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 100 }}>
                  <Heart size={60} color={colors.border} />
                  <Text style={{ color: colors.tabIconDefault, fontSize: 16, fontWeight: '700', marginTop: 20 }}>No liked songs yet</Text>
                </View>
              ) : (
                MOCK_TRACKS.filter(track => likedSongs.includes(track.id)).map(track => (
                  <TouchableOpacity
                    key={track.id + '_liked'}
                    style={styles.searchResult}
                    onPress={() => {
                      setCurrentTrack(track);
                      setIsPlaying(true);
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
                ))
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Floating Mini Player - Matching Profile Hub style */}
        <View style={styles.miniPlayerWrapper}>
          <TouchableOpacity
            style={[styles.miniPlayer, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => setPlayerModalVisible(true)}
          >
            <Image source={{ uri: currentTrack.cover }} style={styles.miniAvatar} />
            <View style={styles.miniContent}>
              <Text style={[styles.miniName, { color: colors.text }]} numberOfLines={1}>{currentTrack.title}</Text>
              <Text style={[styles.miniSub, { color: colors.tabIconDefault }]}>{currentTrack.artist}</Text>
            </View>
            <TouchableOpacity
              style={[styles.miniPlayBtn, { backgroundColor: colors.tint }]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={20} color="#fff" /> : <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />}
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Full Player Modal */}
        <Modal visible={playerModalVisible} animationType="slide">
        <View style={[styles.fullPlayer, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={{ flex: 1 }}>
              <View style={styles.fullHeader}>
                <TouchableOpacity onPress={() => setPlayerModalVisible(false)} style={styles.closeBtn}>
                  <ChevronDown size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.fullHeaderText, { color: colors.tabIconDefault }]}>PLAYING NOW</Text>
                <View style={{ width: 32 }} />
              </View>

              <View style={styles.fullContent}>
                <View style={[styles.fullArtworkWrapper, { shadowColor: currentTrack.color }]}>
                  <Image source={{ uri: currentTrack.cover }} style={styles.fullCover} />
                </View>

                <View style={styles.fullMeta}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fullTitle, { color: colors.text }]}>{currentTrack.title}</Text>
                    <Text style={[styles.fullArtist, { color: colors.tabIconDefault }]}>{currentTrack.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleLike(currentTrack.id)}>
                    <Heart
                      size={40}
                      color={likedSongs.includes(currentTrack.id) ? '#ef4444' : colors.text}
                      fill={likedSongs.includes(currentTrack.id) ? '#ef4444' : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.fullProgress}>
                  <View style={[styles.fullProgressBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.fullProgressFill, { width: '45%', backgroundColor: colors.tint }]} />
                  </View>
                  <View style={styles.fullTimeRow}>
                    <Text style={[styles.fullTime, { color: colors.tabIconDefault }]}>1:42</Text>
                    <Text style={[styles.fullTime, { color: colors.tabIconDefault }]}>3:50</Text>
                  </View>
                </View>

                <View style={styles.fullControls}>
                  <TouchableOpacity onPress={() => setIsShuffling(!isShuffling)}>
                    <Shuffle size={24} color={isShuffling ? colors.tint : colors.tabIconDefault} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity><SkipBack size={40} color={colors.text} fill={colors.text} /></TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.fullPlayBtn, { backgroundColor: colors.text }]} 
                    onPress={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause size={40} color={colors.background} fill={colors.background} />
                    ) : (
                      <Play size={40} color={colors.background} fill={colors.background} style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity><SkipForward size={40} color={colors.text} fill={colors.text} /></TouchableOpacity>

                  <TouchableOpacity onPress={() => setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none')}>
                    {repeatMode === 'one' ? (
                      <Repeat1 size={24} color={colors.tint} />
                    ) : (
                      <Repeat size={24} color={repeatMode === 'all' ? colors.tint : colors.tabIconDefault} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  heroHeader: { paddingTop: 10, paddingHorizontal: 24, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hubLeft: { flex: 1 },
  greeting: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  name: { fontSize: 28, fontWeight: '900', marginTop: 2, letterSpacing: -0.5 },
  searchBtn: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center' },
  topHeartBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(128,128,128,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 16 },

  languageContainer: { marginBottom: 32 },
  languageInner: { paddingHorizontal: 24, gap: 10 },
  languageChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  languageText: { fontSize: 14, fontWeight: '800' },

  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  headerActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  seeAll: { fontSize: 13, fontWeight: '800' },

  heroCard: { marginHorizontal: 24, height: 260, borderRadius: 32, overflow: 'hidden', marginBottom: 32, elevation: 20, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', padding: 24, justifyContent: 'space-between' },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', marginTop: 4 },
  heroAction: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },

  trackGrid: { paddingHorizontal: 24, gap: 12 },
  trackCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 24, borderWidth: 1.5, elevation: 8, shadowOpacity: 0.06, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  trackThumb: { width: 56, height: 56, borderRadius: 16 },
  trackInfo: { flex: 1, marginLeft: 16, gap: 4 },
  trackTitle: { fontSize: 16, fontWeight: '800' },
  trackArtist: { fontSize: 13, fontWeight: '600' },
  trackLike: { padding: 8 },

  // Mini Player
  miniPlayerWrapper: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  miniPlayer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 24, borderWidth: 1.5, elevation: 15, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  miniAvatar: { width: 44, height: 44, borderRadius: 14 },
  miniContent: { flex: 1, marginLeft: 16 },
  miniName: { fontSize: 15, fontWeight: '800' },
  miniSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  miniPlayBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Full Player
  fullPlayer: { flex: 1 },
  fullHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  fullHeaderText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  closeBtn: { padding: 4 },
  fullContent: { flex: 1, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center' },
  fullArtworkWrapper: { elevation: 25, shadowOpacity: 0.4, shadowRadius: 40, shadowOffset: { width: 0, height: 20 }, marginBottom: 40 },
  fullCover: { width: width - 80, height: width - 80, borderRadius: 32 },
  fullMeta: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 30 },
  fullTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  fullArtist: { fontSize: 20, fontWeight: '600', marginTop: 5 },
  fullProgress: { width: '100%', marginBottom: 40 },
  fullProgressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fullProgressFill: { height: '100%' },
  fullTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  fullTime: { fontSize: 12, fontWeight: '800' },
  fullControls: { flexDirection: 'row', alignItems: 'center', gap: 40 },
  fullPlayBtn: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowOpacity: 0.2, shadowRadius: 15 },

  // Search
  searchOverlay: { flex: 1 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, gap: 16 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 54, borderRadius: 16, gap: 12 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  cancelText: { fontSize: 16, fontWeight: '700' },
  searchResult: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  searchThumb: { width: 60, height: 60, borderRadius: 14 },
  searchTitle: { fontSize: 16, fontWeight: '800' },
  searchArtist: { fontSize: 13, fontWeight: '600', marginTop: 2 },
});
