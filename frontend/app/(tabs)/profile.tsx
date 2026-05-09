import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated, Switch, PanResponder, Platform, Alert, Modal, Pressable } from 'react-native';
import { Settings, Shield, HelpCircle, LogOut, ChevronRight, User, Moon, Pencil, X } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDarkMode, colors } = useTheme();
  const { user, logout, updateProfile, uploadProfilePhoto } = useAuth();


  
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const isAtTop = useRef(true);
  const [refreshing, setRefreshing] = useState(false);
  const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop';

  useFocusEffect(
    useCallback(() => {
      // Reset scroll position when screen is focused
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      
      return () => {
        // Also reset when leaving to ensure it's at top for next time
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      };
    }, [])
  );

  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newPhoto = result.assets[0].uri;
      
      try {
        await uploadProfilePhoto(newPhoto);
      } catch (error: any) {
        Alert.alert('Upload Failed', error.message || 'Could not upload your photo to the cloud.');
      }
    }

  };


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

  const handlePlaceholderPress = (feature: string) => {
    Alert.alert(
      feature,
      `The ${feature} module is currently in development for v1.1. Stay tuned!`,
      [{ text: 'Great!' }]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate data fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const ProfileItem = ({ icon: Icon, label, onPress, color }: any) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: (color || colors.tint) + '15' }]}>
          <Icon size={20} stroke={color || colors.tint} />
        </View>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <ChevronRight size={18} stroke={colors.tabIconDefault} />
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
        <Animated.ScrollView 
          ref={scrollRef}
          contentContainerStyle={styles.content}
          onScroll={handleScroll}
          onScrollEndDrag={(e) => {
            if (e.nativeEvent.contentOffset.y < -100 && !refreshing) {
              handleRefresh();
            }
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={true}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Your travel identity</Text>
            </View>
            <TouchableOpacity 
              style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/settings/personal')}
            >
              <Settings size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => setImagePreviewVisible(true)}
              >
                <View style={[styles.avatarContainer, { borderColor: colors.tint }]}>
                  <Image 
                    source={{ uri: user?.photoURL || defaultAvatar }} 
                    style={styles.avatar} 
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editAvatarBtn, { backgroundColor: colors.tint }]}
                onPress={pickImage}
              >
                <Pencil size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.displayName || user?.email?.split('@')[0] || 'Traveler'}</Text>
            <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>{user?.email}</Text>
          </View>

          {/* Image Preview Modal */}
          <Modal
            visible={imagePreviewVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setImagePreviewVisible(false)}
          >
            <Pressable 
              style={styles.previewOverlay} 
              onPress={() => setImagePreviewVisible(false)}
            >
              <TouchableOpacity 
                style={styles.previewCloseBtn}
                onPress={() => setImagePreviewVisible(false)}
              >
                <X size={30} color="#fff" />
              </TouchableOpacity>
              <Image 
                source={{ uri: user?.photoURL || defaultAvatar }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            </Pressable>
          </Modal>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>Account</Text>
            <ProfileItem icon={User} label="Personal Information" onPress={() => router.push('/settings/personal')} />
            <ProfileItem icon={Shield} label="Privacy & Security" onPress={() => router.push('/settings/privacy')} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>Appearance</Text>
            <View style={[styles.themeSelector, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
              {(['light', 'auto', 'dark'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeOption,
                    themeMode === mode && { backgroundColor: colors.card, elevation: 4, shadowOpacity: 0.1, shadowRadius: 10 }
                  ]}
                  onPress={async () => {
                    setThemeMode(mode);
                    try {
                      await updateProfile({ themePreference: mode });
                    } catch (e) {
                      console.error("Failed to save theme preference", e);
                    }
                  }}
                >
                  <Text style={[
                    styles.themeText,
                    { color: themeMode === mode ? colors.tint : colors.tabIconDefault }
                  ]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>


          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>Support</Text>
            <ProfileItem icon={HelpCircle} label="Help Center" onPress={() => router.push('/settings/help')} />
            <ProfileItem 
              icon={LogOut} 
              label="Log Out" 
              color="#ef4444" 
              onPress={logout} 
            />
          </View>

          <Text style={styles.version}>Wayfarer v1.0.0</Text>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: '600',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarContainer: {
    padding: 4,
    borderWidth: 2,
    borderRadius: 60,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  editButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 40,
  },
  themeSelector: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 18,
    gap: 4,
    marginTop: 8,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 10,
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
});
