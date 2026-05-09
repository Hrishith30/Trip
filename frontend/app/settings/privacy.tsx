import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Lock, Trash2, Key, X, CheckCircle2, Eye, EyeOff, Users } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../constants/Config';

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, deleteAccount, updateProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1: Send OTP, 2: Verify & Change
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestOTP = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      
      if (response.ok) {
        setOtpStep(2);
        setOtpModalVisible(true);
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndChange = async () => {
    if (!otpCode || !newPassword) {
      Alert.alert("Error", "Please enter the OTP and your new password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user?.email, 
          otp: otpCode, 
          new_password: newPassword 
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Password changed successfully!");
        setOtpModalVisible(false);
        setOtpStep(1);
        setOtpCode('');
        setNewPassword('');
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Failed to verify OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteAccount();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            } finally {
              setIsLoading(false);
            }
          } 
        }
      ]
    );
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
          <Text style={[styles.title, { color: colors.text }]}>Security</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Manage your account safety</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleRequestOTP}
          >
            <View style={styles.btnLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
                <Key size={20} color={colors.tint} />
              </View>
              <Text style={[styles.btnText, { color: colors.text }]}>Change Password</Text>
            </View>
            <Lock size={18} color={colors.tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.btnLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ef444415' }]}>
                <Trash2 size={20} color="#ef4444" />
              </View>
              <Text style={[styles.btnText, { color: colors.text }]}>Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { marginTop: 40 }]}>
          <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>Live Map Presence</Text>
          <View style={[styles.visibilityContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(['all', 'friends', 'none'] as const).map((pref) => (
              <TouchableOpacity
                key={pref}
                style={[
                  styles.visibilityOption,
                  user?.visibilityPreference === pref && { backgroundColor: colors.tint }
                ]}
                onPress={() => updateProfile({ visibilityPreference: pref })}
              >
                <Text style={[
                  styles.visibilityText,
                  { color: user?.visibilityPreference === pref ? '#fff' : colors.text }
                ]}>
                  {pref === 'all' ? 'Everyone' : pref.charAt(0).toUpperCase() + pref.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.helperText, { color: colors.tabIconDefault }]}>
            Controls who can see your live location on the Explore map.
          </Text>
        </View>

        <Modal
          visible={otpModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setOtpModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Enter OTP</Text>
                <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
                  <X size={24} color={colors.tabIconDefault} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.modalSub, { color: colors.tabIconDefault }]}>
                We've sent a code to {user?.email}. Check your terminal!
              </Text>

              <View style={styles.modalForm}>
                <TextInput
                  style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="6-Digit OTP"
                  placeholderTextColor={colors.tabIconDefault}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                
                <View style={[styles.passwordContainer, { borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.modalInputNoBorder, { color: colors.text }]}
                    placeholder="New Password"
                    placeholderTextColor={colors.tabIconDefault}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? <EyeOff size={20} color={colors.tabIconDefault} /> : <Eye size={20} color={colors.tabIconDefault} />}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.tint }]}
                  onPress={handleVerifyAndChange}
                >
                  <Text style={styles.submitBtnText}>Verify & Update</Text>
                  <CheckCircle2 size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },

  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 15, marginTop: 4, fontWeight: '600', textAlign: 'center' },
  section: { width: '100%' },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  btnLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: '800' },
  modalSub: { fontSize: 15, lineHeight: 22, marginBottom: 32 },
  modalForm: { gap: 16 },
  modalInput: { height: 56, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, fontWeight: '600' },
  passwordContainer: { 
    height: 56, 
    borderWidth: 1.5, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingRight: 12
  },
  modalInputNoBorder: { 
    flex: 1,
    height: '100%',
    paddingHorizontal: 20, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  eyeIcon: {
    padding: 8,
  },
  submitBtn: { height: 56, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 999
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingLeft: 4,
  },
  visibilityContainer: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
    lineHeight: 18,
  }
});
