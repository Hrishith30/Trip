import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, Bell, Plane, MessageCircle, Sparkles } from 'lucide-react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [settings, setSettings] = useState({
    push: true,
    trips: true,
    chat: false,
    offers: true,
  });

  const ToggleItem = ({ label, sublabel, icon: Icon, value, onValueChange }: any) => (
    <View style={[styles.item, { borderBottomColor: colors.border }]}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
          <Icon size={20} color={colors.tint} />
        </View>
        <View style={styles.textColumn}>
          <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.itemSub, { color: colors.tabIconDefault }]}>{sublabel}</Text>
        </View>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: colors.tint }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: 'Back',
          headerTransparent: true,
        }} 
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Alerts</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Choose what you want to hear from us</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleItem 
            label="Push Notifications" 
            sublabel="Master switch for all alerts"
            icon={Bell}
            value={settings.push}
            onValueChange={(v: boolean) => setSettings(s => ({ ...s, push: v }))}
          />
          <ToggleItem 
            label="Trip Updates" 
            sublabel="Flight changes, itinerary alerts"
            icon={Plane}
            value={settings.trips}
            onValueChange={(v: boolean) => setSettings(s => ({ ...s, trips: v }))}
          />
          <ToggleItem 
            label="Chat Messages" 
            sublabel="Alerts from your trip group"
            icon={MessageCircle}
            value={settings.chat}
            onValueChange={(v: boolean) => setSettings(s => ({ ...s, chat: v }))}
          />
          <ToggleItem 
            label="Exclusive Offers" 
            sublabel="Personalized travel deals"
            icon={Sparkles}
            value={settings.offers}
            onValueChange={(v: boolean) => setSettings(s => ({ ...s, offers: v }))}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 4, fontWeight: '600' },
  card: { borderRadius: 24, padding: 20, borderWidth: 1 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textColumn: { flex: 1 },
  itemLabel: { fontSize: 16, fontWeight: '700' },
  itemSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
});
