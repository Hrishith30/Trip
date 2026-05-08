import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Linking } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Book, MessageSquare, Info, X, ChevronRight, FileText, Shield } from 'lucide-react-native';

const HelpItem = ({ label, sublabel, icon: Icon, onPress, colors }: any) => (
  <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]} onPress={onPress}>
    <View style={styles.itemLeft}>
      <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
        <Icon size={20} color={colors.tint} />
      </View>
      <View style={styles.textColumn}>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.itemSub, { color: colors.tabIconDefault }]}>{sublabel}</Text>
      </View>
    </View>
    <ChevronRight size={18} color={colors.border} />
  </TouchableOpacity>
);

export default function HelpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'faq' | 'support' | 'info' | 'terms' | 'privacy' | null>(null);

  const openModal = (type: 'faq' | 'support' | 'info' | 'terms' | 'privacy') => {
    setModalType(type);
    setModalVisible(true);
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'faq':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            <View style={styles.faqList}>
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I create a new trip?</Text>
                <Text style={[styles.faqAnswer, { color: colors.tabIconDefault }]}>Tap the "+" button on the dashboard to start planning your next adventure.</Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>Can I share my itinerary?</Text>
                <Text style={[styles.faqAnswer, { color: colors.tabIconDefault }]}>Yes! Open any trip and tap the Share icon to invite friends to your journey.</Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>Is Wayfarer free to use?</Text>
                <Text style={[styles.faqAnswer, { color: colors.tabIconDefault }]}>Our core trip planning features are free. Premium features coming soon!</Text>
              </View>
            </View>
          </ScrollView>
        );
      case 'support':
        return (
          <View style={styles.centeredContent}>
            <View style={[styles.largeIconBox, { backgroundColor: colors.tint + '15' }]}>
              <MessageSquare size={40} color={colors.tint} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Contact Support</Text>
            <Text style={[styles.modalText, { color: colors.tabIconDefault }]}>Our team is available to help you with any travel issues via email.</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
              onPress={() => Linking.openURL('mailto:support@wayfarer.com')}
            >
              <Text style={styles.primaryBtnText}>Email Us</Text>
            </TouchableOpacity>
          </View>
        );
      case 'info':
        return (
          <View style={styles.centeredContent}>
            <View style={[styles.largeIconBox, { backgroundColor: colors.tint + '15' }]}>
              <Info size={40} color={colors.tint} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>App Info</Text>
            <View style={styles.infoTable}>
              <View style={styles.infoRow}>
                <Text style={{ color: colors.tabIconDefault }}>Version</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>1.0.4 (Production)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={{ color: colors.tabIconDefault }}>Developer</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Wayfarer Labs</Text>
              </View>
            </View>

            <View style={styles.legalLinks}>
              <TouchableOpacity style={styles.legalLinkItem} onPress={() => openModal('terms')}>
                <FileText size={18} color={colors.tint} />
                <Text style={[styles.legalLinkText, { color: colors.tint }]}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.legalLinkItem} onPress={() => openModal('privacy')}>
                <Shield size={18} color={colors.tint} />
                <Text style={[styles.legalLinkText, { color: colors.tint }]}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'terms':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Terms of Service</Text>
            <Text style={[styles.legalFullText, { color: colors.text }]}>
              Welcome to Wayfarer. By using our service, you agree to these terms...{"\n\n"}
              1. User Conduct: You are responsible for all activity on your account.{"\n"}
              2. Content: You retain ownership of your travel data.{"\n"}
              3. Termination: We reserve the right to suspend accounts that violate our policies.{"\n\n"}
              Full terms are available at wayfarer.com/terms.
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.tint, marginTop: 24 }]} onPress={() => setModalType('info')}>
              <Text style={styles.primaryBtnText}>Back to Info</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'privacy':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Privacy Policy</Text>
            <Text style={[styles.legalFullText, { color: colors.text }]}>
              Your privacy is important to us. Here is how we handle your data:{"\n\n"}
              - Data Collection: We collect your email and name to provide our service.{"\n"}
              - Data Sharing: We never sell your personal information to third parties.{"\n"}
              - Security: We use industry-standard encryption to protect your data.{"\n\n"}
              Learn more at wayfarer.com/privacy.
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.tint, marginTop: 24 }]} onPress={() => setModalType('info')}>
              <Text style={styles.primaryBtnText}>Back to Info</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      default:
        return null;
    }
  };

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
            onPress={() => openModal('faq')}
            colors={colors}
          />
          <HelpItem
            label="Contact Support"
            sublabel="Get in touch with our team"
            icon={MessageSquare}
            onPress={() => openModal('support')}
            colors={colors}
          />
          <HelpItem
            label="App Info"
            sublabel="Version, terms and conditions"
            icon={Info}
            onPress={() => openModal('info')}
            colors={colors}
          />
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            {renderModalContent()}
          </Pressable>
        </Pressable>
      </Modal>
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 60, minHeight: 500, maxHeight: '80%' },
  closeBtn: { alignSelf: 'flex-end', padding: 8 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 24 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  centeredContent: { alignItems: 'center', width: '100%' },
  largeIconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },

  faqList: { gap: 24 },
  faqItem: { gap: 8 },
  faqQuestion: { fontSize: 16, fontWeight: '800' },
  faqAnswer: { fontSize: 14, lineHeight: 20 },

  primaryBtn: { width: '100%', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  infoTable: { width: '100%', gap: 16, marginBottom: 32 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },

  legalLinks: { 
    flexDirection: 'row', 
    width: '100%', 
    gap: 12, 
    marginTop: 8 
  },
  legalLinkItem: { 
    flex: 1, 
    alignItems: 'center', 
    gap: 8, 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  legalLinkText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  legalFullText: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
});

