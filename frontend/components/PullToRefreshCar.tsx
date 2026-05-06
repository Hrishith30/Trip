import React from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Top-View Car Component
const TopViewCar = ({ color = '#9ca3af' }) => (
  <View style={styles.carChassis}>
    {/* Wheels */}
    <View style={[styles.wheel, styles.wheelTL]} />
    <View style={[styles.wheel, styles.wheelTR]} />
    <View style={[styles.wheel, styles.wheelBL]} />
    <View style={[styles.wheel, styles.wheelBR]} />

    {/* Body */}
    <View style={[styles.carBody, { backgroundColor: color }]}>
      <View style={styles.windshield} />
      <View style={styles.roof} />
      <View style={styles.rearWindow} />
      <View style={styles.mirrorL} />
      <View style={styles.mirrorR} />
    </View>
  </View>
);

// Custom Smoke Line Component
const SmokeTrail = ({ opacity }: { opacity: any }) => (
  <Animated.View style={[styles.smokeCluster, { opacity }]}>
    <View style={[styles.smokeLine, { height: 15, opacity: 0.6 }]} />
    <View style={[styles.smokeLine, { height: 25, opacity: 0.4, marginHorizontal: 4 }]} />
    <View style={[styles.smokeLine, { height: 10, opacity: 0.5 }]} />
  </Animated.View>
);

interface PullToRefreshCarProps {
  scrollY: Animated.Value;
}

export const PullToRefreshCar: React.FC<PullToRefreshCarProps> = ({ scrollY }) => {
  const carTranslateYTop = scrollY.interpolate({
    inputRange: [-150, 0],
    outputRange: [120, -60], // Moved output range down so it stays closer to the content
    extrapolate: 'clamp',
  });

  const smokeOpacity = scrollY.interpolate({
    inputRange: [-100, -30, 0],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[
      styles.verticalCarContainer,
      {
        opacity: smokeOpacity,
        transform: [{ translateY: carTranslateYTop }]
      }
    ]}>
      <TopViewCar />
      <View style={{ marginTop: 0 }}>
        <SmokeTrail opacity={smokeOpacity} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  verticalCarContainer: {
    position: 'absolute',
    left: (SCREEN_WIDTH / 2) - 16,
    alignItems: 'center',
    zIndex: 5,
    width: 32,
  },
  smokeCluster: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 30,
    justifyContent: 'center',
  },
  smokeLine: {
    width: 2,
    backgroundColor: '#9ca3af',
    borderRadius: 1,
  },
  carChassis: {
    width: 32,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carBody: {
    width: 28,
    height: 50,
    borderRadius: 6,
    padding: 2,
  },
  wheel: {
    position: 'absolute',
    width: 6,
    height: 10,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  wheelTL: { top: 8, left: 0 },
  wheelTR: { top: 8, right: 0 },
  wheelBL: { bottom: 8, left: 0 },
  wheelBR: { bottom: 8, right: 0 },
  windshield: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 8,
    borderRadius: 2,
  },
  roof: {
    width: '100%',
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 2,
  },
  rearWindow: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 2,
    borderRadius: 1,
  },
  mirrorL: {
    position: 'absolute',
    width: 5,
    height: 3,
    backgroundColor: '#9ca3af',
    left: -4,
    top: 18,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 1,
    transform: [{ rotate: '-60deg' }],
  },
  mirrorR: {
    position: 'absolute',
    width: 5,
    height: 3,
    backgroundColor: '#9ca3af',
    right: -4,
    top: 18,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 1,
    transform: [{ rotate: '60deg' }],
  }
});
