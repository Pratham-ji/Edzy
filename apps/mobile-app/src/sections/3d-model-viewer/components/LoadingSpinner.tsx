/**
 * LoadingSpinner
 * Shown over the GL canvas while a 3D model is being downloaded and parsed.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  accentColor?: string;
}

export function LoadingSpinner({
  message = 'Loading 3D model…',
  accentColor = '#4F46E5',
}: LoadingSpinnerProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          { borderTopColor: accentColor, transform: [{ rotate: spin }] },
        ]}
      />
      <Text style={styles.label}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 16, 27, 0.86)',
    gap: 14,
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3.5,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  label: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
