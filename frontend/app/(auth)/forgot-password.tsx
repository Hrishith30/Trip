import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  useColorScheme, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ArrowRight, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = cleaned;
    setOtp(updated);
    if (cleaned && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = () => {
    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otp.join('').length < 6) {
      Alert.alert('Incomplete', 'Please enter all 6 digits of the OTP.');
      return;
    }
    setStep('password');
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      Alert.alert('Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    setStep('success');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.bgCircle, { top: -80, right: -60, backgroundColor: colors.tint + '15' }]} />
      <View style={[styles.bgCircle, { bottom: -120, left: -80, backgroundColor: colors.tint + '0A' }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>



            {/* ── STEP 1: Email ── */}
            {step === 'email' && (
              <>
                <View style={[styles.header, { alignItems: 'center' }]}>
                  <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>Forgot Password?</Text>
                  <Text style={[styles.subtitle, { color: colors.tabIconDefault, textAlign: 'center' }]}>
                    No worries. Enter your email and we'll send you a 6-digit OTP.
                  </Text>
                </View>
                <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Email Address"
                    placeholderTextColor={colors.tabIconDefault}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.tint }]} onPress={handleSendOtp}>
                  <Text style={styles.btnText}>Send OTP</Text>
                  <ArrowRight size={18} stroke="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <>
                <View style={[styles.header, { alignItems: 'center' }]}>
                  <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>Enter OTP</Text>
                  <Text style={[styles.subtitle, { color: colors.tabIconDefault, textAlign: 'center' }]}>
                    We sent a 6-digit code to{' '}
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{email}</Text>
                  </Text>
                </View>

                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={ref => { otpRefs.current[i] = ref; }}
                      style={[
                        styles.otpBox,
                        {
                          color: colors.text,
                          borderColor: digit ? colors.tint : colors.border,
                          backgroundColor: digit ? colors.tint + '0F' : colors.card,
                        }
                      ]}
                      value={digit}
                      onChangeText={v => handleOtpChange(v, i)}
                      onKeyPress={e => handleOtpKeyPress(e, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectionColor={colors.tint}
                    />
                  ))}
                </View>

                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.tint }]} onPress={handleVerifyOtp}>
                  <Text style={styles.btnText}>Verify OTP</Text>
                  <ArrowRight size={18} stroke="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendBtn} onPress={() => setOtp(['', '', '', '', '', ''])}>
                  <Text style={[styles.resendText, { color: colors.tabIconDefault }]}>
                    Didn't receive it?{' '}
                    <Text style={{ color: colors.tint, fontWeight: '700' }}>Resend</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 3: New Password ── */}
            {step === 'password' && (
              <>
                <View style={[styles.header, { alignItems: 'center' }]}>
                  <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>New Password</Text>
                  <Text style={[styles.subtitle, { color: colors.tabIconDefault, textAlign: 'center' }]}>
                    Create a strong password for your account.
                  </Text>
                </View>

                <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                  <Lock size={16} stroke={colors.tabIconDefault} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="New Password"
                    placeholderTextColor={colors.tabIconDefault}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                  />
                  <TouchableOpacity onPress={() => setShowNew(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showNew ? <EyeOff size={18} stroke={colors.tabIconDefault} /> : <Eye size={18} stroke={colors.tabIconDefault} />}
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, { borderColor: colors.border, marginTop: 16 }]}>
                  <Lock size={16} stroke={colors.tabIconDefault} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.tabIconDefault}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showConfirm ? <EyeOff size={18} stroke={colors.tabIconDefault} /> : <Eye size={18} stroke={colors.tabIconDefault} />}
                  </TouchableOpacity>
                </View>

                {confirmPassword.length > 0 && (
                  <Text style={[styles.matchHint, { color: newPassword === confirmPassword ? '#22c55e' : '#ef4444' }]}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </Text>
                )}

                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.tint, marginTop: 28 }]} onPress={handleResetPassword}>
                  <Text style={styles.btnText}>Reset Password</Text>
                  <ArrowRight size={18} stroke="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 4: Success ── */}
            {step === 'success' && (
              <View style={styles.successView}>
                <View style={[styles.successCircle, { backgroundColor: '#22c55e15' }]}>
                  <CheckCircle2 size={64} stroke="#22c55e" />
                </View>
                <Text style={[styles.title, { color: colors.text, textAlign: 'center', marginTop: 28 }]}>
                  Password Reset!
                </Text>
                <Text style={[styles.subtitle, { color: colors.tabIconDefault, textAlign: 'center', marginTop: 8 }]}>
                  Your password has been successfully updated. You can now sign in with your new password.
                </Text>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.tint, marginTop: 40, width: '100%' }]}
                  onPress={() => router.replace('/login')}
                >
                  <Text style={styles.btnText}>Go to Login</Text>
                  <ArrowRight size={18} stroke="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Footer */}
            {step !== 'success' && (
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>Remembered it? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={[styles.footerLink, { color: colors.tint }]}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  flex: { flex: 1 },
  bgCircle: { position: 'absolute', width: 350, height: 350, borderRadius: 175 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  inner: { width: '100%', maxWidth: 400, alignSelf: 'center' },



  header: { marginBottom: 32 },
  iconBadge: {},
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 8, lineHeight: 22 },

  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },

  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 32 },
  otpBox: {
    width: 48, height: 56, borderRadius: 14,
    borderWidth: 1.5, fontSize: 22, fontWeight: '800',
  },

  btn: {
    height: 56, borderRadius: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 10, marginTop: 20,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resendBtn: { alignItems: 'center', marginTop: 20 },
  resendText: { fontSize: 14 },

  matchHint: { fontSize: 13, fontWeight: '600', marginTop: 8, marginLeft: 4 },

  successView: { alignItems: 'center', paddingVertical: 20 },
  successCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 36 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '800' },
});
