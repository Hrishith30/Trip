import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform, ScrollView, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Mail, Lock, User, ArrowRight, Camera, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorOpacity = React.useRef(new Animated.Value(0)).current;

  const showError = (message: string) => {
    let friendlyMsg = message;
    if (message.includes('EMAIL_EXISTS')) friendlyMsg = 'This email is already in use.';
    else if (message.includes('INVALID_EMAIL')) friendlyMsg = 'Please enter a valid email address.';
    else if (message.includes('WEAK_PASSWORD')) friendlyMsg = 'Password should be at least 6 characters.';
    else if (message.includes('OPERATION_NOT_ALLOWED')) friendlyMsg = 'Signup is currently disabled.';
    
    setError(friendlyMsg);
    Animated.sequence([
      Animated.timing(errorOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(4000),
      Animated.timing(errorOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setError(null));
  };

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showError('Permission denied to access gallery.');
      return;
    }

    // Launch the picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name) {
      showError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name, image || undefined);
      // AuthContext handles navigation via useEffect
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Immersive Background Decorations */}
      <View style={[styles.bgCircle, { top: -50, left: -100, backgroundColor: colors.tint + '15' }]} />
      <View style={[styles.bgCircle, { bottom: -100, right: -150, backgroundColor: colors.accent + '10' }]} />

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
              <Text style={[styles.title, { color: colors.text }]}>Join Wayfarer</Text>
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
                Start your travel journey today
              </Text>
            </View>

            {error && (
              <Animated.View style={[styles.errorBanner, { opacity: errorOpacity, backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}>
                <AlertCircle size={18} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <View style={styles.profileSection}>
              <TouchableOpacity
                style={[
                  styles.profileCircle,
                  {
                    backgroundColor: colors.border + '50',
                    borderWidth: image ? 0 : 1.5,
                    borderStyle: image ? 'solid' : 'dashed'
                  }
                ]}
                onPress={pickImage}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Camera size={32} stroke={colors.tabIconDefault} />
                )}
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.profileTitle, { color: colors.text }]}>Profile Photo</Text>
                <Text style={[styles.profileSub, { color: colors.tabIconDefault }]}>Help friends recognize you</Text>
              </View>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
                <User size={16} stroke={colors.tabIconDefault} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.tabIconDefault}
                  value={name}
                  onChangeText={setName}
                />
              </View>

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
                style={[styles.mainButton, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Create Account</Text>
                    <ArrowRight size={18} stroke="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.legalText, { color: colors.tabIconDefault }]}>
              By joining, you agree to our{' '}
              <Text
                style={{ fontWeight: '800', color: colors.tint }}
                onPress={() => router.push('/terms')}
              >
                Terms
              </Text>{' '}
              and{' '}
              <Text
                style={{ fontWeight: '800', color: colors.tint }}
                onPress={() => router.push('/privacy')}
              >
                Privacy Policy
              </Text>.
            </Text>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>Joined already? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.footerLink, { color: colors.tint }]}>Sign In</Text>
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
    marginBottom: 32,
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileSub: {
    fontSize: 12,
    marginTop: 2,
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
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
  legalText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 10,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
