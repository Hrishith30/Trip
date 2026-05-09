import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Animated, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plane } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // Standard React Native Animated API (more stable for this environment)
  const logoPosition = useRef(new Animated.Value(0)).current; // 0 = center, 1 = top
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isImageLoaded) {
      // Sequence animation
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          // 1. Initial pause
          Animated.delay(300),
          // 2. Move logo up
          Animated.spring(logoPosition, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }),
          // 3. Fade in footer
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ]).start();
    }
  }, [isImageLoaded]);

  const translateY = logoPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT / 2 - 120, 160],
  });

  const scale = logoPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [1.2, 1],
  });

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop' }}
      style={styles.container}
      onLoad={() => setIsImageLoaded(true)}
    >
      <Animated.View style={[styles.overlay, { opacity: containerOpacity }]}>
        {/* Animated Logo */}
        <Animated.View style={[
          styles.animatedLogoContainer,
          { transform: [{ translateY }, { scale }] }
        ]}>
          <View style={styles.logoContainer}>
            <Plane size={60} stroke="#fff" />
            <Text style={styles.logoText}>Wayfarer</Text>
          </View>
        </Animated.View>

        {/* Animated Footer Content */}
        <Animated.View style={[
          styles.footerContainer,
          { opacity: contentOpacity }
        ]}>
          <View style={styles.footer}>
            <Text style={styles.title}>Explore the world with friends</Text>
            <Text style={styles.subtitle}>
              Plan trips, track shared expenses, and make memories that last a lifetime.
            </Text>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#6366f1' }]}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  animatedLogoContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: 1,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
  footer: {},
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    marginBottom: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
