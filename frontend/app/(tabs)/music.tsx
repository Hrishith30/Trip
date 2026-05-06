import React, { useState } from 'react';
import { StyleSheet, View, Text, useColorScheme, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Play, SkipForward, SkipBack, Repeat, Shuffle, ListMusic, Heart, Search, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';

const { width } = Dimensions.get('window');

const PLAYLISTS = [
  { id: '1', title: 'Road Trip Vibes', tracks: 42, cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=300&auto=format&fit=crop' },
  { id: '2', title: 'Beach Sunset', tracks: 28, cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop' },
  { id: '3', title: 'Parisian Cafe', tracks: 15, cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=300&auto=format&fit=crop' },
];

import { useTheme } from '../../context/ThemeContext';

export default function MusicScreen() {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaylists = PLAYLISTS.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Travel Music</Text>
          <TouchableOpacity>
            <ListMusic size={24} color={colors.text} />
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
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&auto=format&fit=crop' }} 
            style={styles.coverArt} 
          />
          <View style={styles.trackInfo}>
            <View style={styles.trackMain}>
              <Text style={[styles.trackTitle, { color: colors.text }]}>Wanderlust Anthem</Text>
              <Text style={[styles.trackArtist, { color: colors.tabIconDefault }]}>The Wayfarers</Text>
            </View>
            <TouchableOpacity>
              <Heart size={24} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.tint, width: '45%' }]} />
            </View>
            <View style={styles.timeLabels}>
              <Text style={[styles.timeText, { color: colors.tabIconDefault }]}>1:45</Text>
              <Text style={[styles.timeText, { color: colors.tabIconDefault }]}>3:50</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity><Shuffle size={20} color={colors.tabIconDefault} /></TouchableOpacity>
            <TouchableOpacity><SkipBack size={32} fill={colors.text} color={colors.text} /></TouchableOpacity>
            <TouchableOpacity 
              style={[styles.playBtn, { backgroundColor: colors.tint }]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Play size={28} fill="#fff" color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity><SkipForward size={32} fill={colors.text} color={colors.text} /></TouchableOpacity>
            <TouchableOpacity><Repeat size={20} color={colors.tabIconDefault} /></TouchableOpacity>
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
            {filteredPlaylists.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>No playlists found</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>
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
  playerCard: { margin: 20, padding: 20, borderRadius: 32, borderWidth: 1, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
  coverArt: { width: '100%', height: width - 120, borderRadius: 24, marginBottom: 20 },
  trackInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  trackMain: { flex: 1 },
  trackTitle: { fontSize: 22, fontWeight: '800' },
  trackArtist: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  progressContainer: { marginBottom: 25 },
  progressBar: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  timeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { fontSize: 12, fontWeight: '600' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  playBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  section: { marginTop: 10, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '800', paddingHorizontal: 20, marginBottom: 15 },
  playlistRow: { paddingHorizontal: 20, gap: 16 },
  playlistCard: { width: 140 },
  playlistCover: { width: 140, height: 140, borderRadius: 20, marginBottom: 10 },
  playlistTitle: { fontSize: 15, fontWeight: '700' },
  playlistTracks: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  emptyText: { paddingHorizontal: 20, fontSize: 16, fontWeight: '500' },
});
