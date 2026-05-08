import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Alert, ActivityIndicator } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // AuthContext handles navigation via useEffect
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Immersive Background Decorations */}
      <View style={[styles.bgCircle, { top: -50, right: -100, backgroundColor: colors.tint + '15' }]} />
      <View style={[styles.bgCircle, { bottom: -100, left: -150, backgroundColor: colors.secondary + '10' }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          centerContent={true}
        >
          <View style={styles.innerContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
                Sign in to continue planning your trips
              </Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
                <Mail size={16} stroke={colors.tabIconDefault} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email Address"
                  placeholderTextColor={colors.tabIconDefault}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
                <Lock size={16} stroke={colors.tabIconDefault} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={colors.tabIconDefault}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {showPassword
                    ? <EyeOff size={18} stroke={colors.tabIconDefault} />
                    : <Eye size={18} stroke={colors.tabIconDefault} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={[styles.forgotText, { color: colors.tint }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <ArrowRight size={18} stroke="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>New here? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={[styles.footerLink, { color: colors.tint }]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 40,
    justifyContent: 'center',
  },
  innerContent: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  bgCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 10,
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1.2,
    gap: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '700',
  },
  mainButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
