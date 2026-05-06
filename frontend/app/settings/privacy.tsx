import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Lock, Share2 } from 'lucide-react-native';

const ToggleItem = ({ label, sublabel, icon: Icon, value, onValueChange, colors }: any) => (
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

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [settings, setSettings] = useState({
    profile: true,
    location: false,
    analytics: true,
  });

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
          <Text style={[styles.title, { color: colors.text }]}>Security</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Control how your data is shared</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleItem 
            label="Public Profile" 
            sublabel="Allow others to find you"
            icon={Eye}
            value={settings.profile}
            onValueChange={(v: boolean) => setSettings(s => ({ ...s, profile: v }))}
            colors={colors}
          />
          <ToggleItem 
            label="Location Sharing" 
            sublabel="Real-time trip tracking"
            icon={Lock}
            value={settings.location}
            onValueChange={(v: boolean) => setSettings(s => ({ ...s, location: v }))}
            colors={colors}
          />
          <ToggleItem 
            label="Usage Analytics" 
            sublabel="Help us improve Wayfarer"
            icon={Share2}
            value={settings.analytics}
            onValueChange={(v: boolean) => setSettings(s => ({ ...s, analytics: v }))}
            colors={colors}
          />
        </View>

        <TouchableOpacity style={[styles.dangerBtn, { borderColor: '#ef4444' }]}>
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 15, marginTop: 4, fontWeight: '600', textAlign: 'center' },
  card: { borderRadius: 24, padding: 20, borderWidth: 1 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textColumn: { flex: 1 },
  itemLabel: { fontSize: 16, fontWeight: '700' },
  itemSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  dangerBtn: { marginTop: 40, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  dangerText: { color: '#ef4444', fontSize: 16, fontWeight: '800' },
});
