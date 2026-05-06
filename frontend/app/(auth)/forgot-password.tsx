import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleReset = () => {
    // Simulate sending reset email
    setIsSent(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Immersive Background Decorations */}
      <View style={[styles.bgCircle, { top: -100, right: -50, backgroundColor: colors.tint + '15' }]} />
      <View style={[styles.bgCircle, { bottom: -150, left: -100, backgroundColor: colors.accent + '10' }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} stroke={colors.text} />
          </TouchableOpacity>

          {!isSent ? (
            <>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
                <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
                  Enter your email and we'll send you a link to get back into your account.
                </Text>
              </View>

              <View style={styles.form}>
                <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
                  <Mail size={18} stroke={colors.tabIconDefault} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Email Address"
                    placeholderTextColor={colors.tabIconDefault}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.mainButton, { backgroundColor: colors.tint }]}
                  onPress={handleReset}
                >
                  <Text style={styles.buttonText}>Send Link</Text>
                  <ArrowRight size={20} stroke="#fff" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.successContent}>
              <View style={[styles.successIcon, { backgroundColor: colors.secondary + '20' }]}>
                <ShieldCheck size={40} stroke={colors.secondary} />
              </View>
              <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>Check Your Email</Text>
              <Text style={[styles.subtitle, { color: colors.tabIconDefault, textAlign: 'center' }]}>
                We've sent a password reset link to {email}.
              </Text>
              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: colors.tint, width: '100%', marginTop: 32 }]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>Remembered your password? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.footerLink, { color: colors.tint }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  backBtn: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  mainButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
