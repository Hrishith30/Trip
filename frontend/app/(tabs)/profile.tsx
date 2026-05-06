import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated, Switch } from 'react-native';
import { Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, User, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDarkMode, colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <PullToRefreshCar scrollY={scrollY} />

      <Animated.ScrollView 
        contentContainerStyle={styles.content}
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Your travel identity</Text>
          </View>
          <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Settings size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { borderColor: colors.tint }]}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }} 
              style={styles.avatar} 
            />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>Hrishith</Text>
          <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>hrishith@example.com</Text>
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>Account</Text>
          <ProfileItem icon={User} label="Personal Information" />
          <ProfileItem icon={Bell} label="Notifications" />
          <ProfileItem icon={Shield} label="Privacy & Security" />
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
                onPress={() => setThemeMode(mode)}
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
          <ProfileItem icon={HelpCircle} label="Help Center" />
          <ProfileItem 
            icon={LogOut} 
            label="Log Out" 
            color="#ef4444" 
            onPress={() => router.replace('/(auth)/login')} 
          />
        </View>

        <Text style={styles.version}>Wayfarer v1.0.0</Text>
      </Animated.ScrollView>
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
  avatarContainer: {
    padding: 4,
    borderWidth: 2,
    borderRadius: 60,
    marginBottom: 16,
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
});
