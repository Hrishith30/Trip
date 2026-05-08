import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, User, Mail, CheckCircle2, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../constants/Config';

const InfoField = ({ label, value, onChangeText, icon: Icon, colors }: any) => (
  <View style={[styles.fieldContainer, { borderBottomColor: colors.border }]}>
    <View style={styles.labelRow}>
      <Icon size={16} color={colors.tabIconDefault} />
      <Text style={[styles.label, { color: colors.tabIconDefault }]}>{label}</Text>
    </View>
    <TextInput
      style={[styles.input, { color: colors.text }]}
      value={value}
      onChangeText={onChangeText}
      editable={true}
    />
  </View>
);

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  // OTP State for Email Change
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSave = async () => {
    // Check if email has changed
    const emailChanged = email.toLowerCase() !== user?.email?.toLowerCase();

    if (emailChanged) {
      // If email changed, we need OTP verification
      requestEmailOTP();
      return;
    }

    // Otherwise, just update the name
    setIsSaving(true);
    try {
      await updateProfile({ displayName: name });
      Alert.alert("Success", "Your name has been updated.");
      router.back();
    } catch (error: any) {
      Alert.alert("Save Failed", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const requestEmailOTP = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      
      if (response.ok) {
        setOtpModalVisible(true);
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network request failed");
    } finally {
      setIsSaving(false);
    }
  };

  const verifyEmailChange = async () => {
    if (!otpCode) {
      Alert.alert("Error", "Please enter the OTP code");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uid: user?.uid,
          old_email: user?.email,
          new_email: email,
          otp: otpCode
        }),
      });

      if (response.ok) {
        // Now update the name too if it was changed
        await updateProfile({ displayName: name, email: email });
        
        Alert.alert("Success", "Email and Profile updated successfully!");
        setOtpModalVisible(false);
        router.back();
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Verification failed");
      }
    } catch (error) {
      Alert.alert("Error", "Network request failed");
    } finally {
      setIsSaving(false);
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
          <Text style={[styles.title, { color: colors.text }]}>Personal Info</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Update your account details</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

          <InfoField label="Full Name" value={name} onChangeText={setName} icon={User} colors={colors} />
          <InfoField label="Email Address" value={email} onChangeText={setEmail} icon={Mail} colors={colors} />
        </View>


        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.tint, opacity: isSaving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>

        {/* Email OTP Modal */}
        <Modal
          visible={otpModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setOtpModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Email Change</Text>
                <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
                  <X size={24} color={colors.tabIconDefault} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.modalSub, { color: colors.tabIconDefault }]}>
                Security Check: We've sent a code to your CURRENT email ({user?.email}) to authorize this change.
              </Text>

              <TextInput
                style={[styles.otpInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="6-Digit Code"
                placeholderTextColor={colors.tabIconDefault}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity 
                style={[styles.verifyBtn, { backgroundColor: colors.tint }]}
                onPress={verifyEmailChange}
              >
                <Text style={styles.verifyBtnText}>Verify & Update Email</Text>
                <CheckCircle2 size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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

  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  changePhotoText: { fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 24 },
  fieldContainer: { paddingVertical: 16, borderBottomWidth: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  input: { fontSize: 16, fontWeight: '700', padding: 0 },
  saveButton: { height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 32, padding: 32, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalSub: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  otpInput: { height: 56, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 20, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  verifyBtn: { height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
