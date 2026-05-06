import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.lastUpdated, { color: colors.tabIconDefault }]}>Last Updated: May 5, 2026</Text>
        
        <Section 
          title="1. Information We Collect"
          content="We collect information you provide directly to us when you create an account, plan a trip, or share expenses. This may include your name, email address, and trip data."
        />

        <Section 
          title="2. How We Use Your Information"
          content="We use the information we collect to provide, maintain, and improve our services, to facilitate trip planning and expense sharing, and to communicate with you about your account."
        />

        <Section 
          title="3. Information Sharing"
          content="We do not share your personal information with third parties except as described in this policy, such as with trip members you invite or to comply with legal obligations."
        />

        <Section 
          title="4. Data Security"
          content="We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction."
        />

        <Section 
          title="5. Your Choices"
          content="You may update or correct your account information at any time by logging into your account settings. You can also delete your account by contacting our support team."
        />

        <Section 
          title="6. Changes to this Policy"
          content="We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy."
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
