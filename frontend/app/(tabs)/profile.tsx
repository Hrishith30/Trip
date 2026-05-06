import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, useColorScheme, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PullToRefreshCar } from '../../components/PullToRefreshCar';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scrollY = useRef(new Animated.Value(0)).current;

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PullToRefreshCar scrollY={scrollY} />

      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
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
          <ProfileItem icon={Settings} label="Settings" />
          <ProfileItem icon={Bell} label="Notifications" />
          <ProfileItem icon={Shield} label="Privacy & Security" />
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

        <Text style={styles.version}>Version 1.0.0</Text>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
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
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  editButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 40,
  },
});
