import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Plane, Receipt, X } from 'lucide-react-native';

export default function ActionModal() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const ActionButton = ({ icon: Icon, title, subtitle, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={28} stroke={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quick Actions</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} stroke={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <ActionButton 
          icon={Plane}
          title="Add New Trip"
          subtitle="Create a new adventure and invite friends"
          color="#6366f1"
          onPress={() => {
            router.back();
            // Future: router.push('/add-trip')
          }}
        />

        <ActionButton 
          icon={Receipt}
          title="Add New Split"
          subtitle="Record an expense and split with group"
          color="#f43f5e"
          onPress={() => {
            router.back();
            // Future: router.push('/add-split')
          }}
        />
      </View>

      <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>
        What would you like to do today?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '500',
  },
});
