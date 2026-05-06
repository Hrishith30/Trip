import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const Section = ({ title, content }: { title: string, content: string }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionContent, { color: colors.tabIconDefault }]}>{content}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft stroke={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.lastUpdated, { color: colors.tabIconDefault }]}>Last Updated: May 5, 2026</Text>
        
        <Section 
          title="1. Acceptance of Terms"
          content="By accessing or using the Wayfarer application, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the application."
        />

        <Section 
          title="2. User Accounts"
          content="To use certain features of the application, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        />

        <Section 
          title="3. Trip Planning and Expenses"
          content="Wayfarer provides tools for trip planning and expense splitting. While we strive for accuracy, users are responsible for verifying all trip details and financial calculations."
        />

        <Section 
          title="4. Prohibited Conduct"
          content="You agree not to use the application for any unlawful purpose or in any way that could damage, disable, or impair the application's functionality."
        />

        <Section 
          title="5. Intellectual Property"
          content="The Wayfarer application and its original content, features, and functionality are owned by Wayfarer and are protected by international copyright, trademark, and other intellectual property laws."
        />

        <Section 
          title="6. Limitation of Liability"
          content="Wayfarer shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the application."
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 24,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
  },
});
