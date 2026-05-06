import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { HelpCircle, Book, MessageSquare, Info } from 'lucide-react-native';

export default function HelpScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const HelpItem = ({ label, sublabel, icon: Icon }: any) => (
    <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
          <Icon size={20} color={colors.tint} />
        </View>
        <View style={styles.textColumn}>
          <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.itemSub, { color: colors.tabIconDefault }]}>{sublabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
          <Text style={[styles.title, { color: colors.text }]}>Support</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>We're here to help you wander better</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <HelpItem 
            label="FAQ" 
            sublabel="Common questions and answers"
            icon={Book}
          />
          <HelpItem 
            label="Contact Support" 
            sublabel="Get in touch with our team"
            icon={MessageSquare}
          />
          <HelpItem 
            label="App Info" 
            sublabel="Version, terms and conditions"
            icon={Info}
          />
        </View>
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
});
