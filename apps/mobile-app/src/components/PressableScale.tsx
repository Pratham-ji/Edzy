import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';

interface PressableScaleProps extends PressableProps {
  scaleTo?: number;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * PressableScale
 * Tactile Airbnb-grade press feedback with micro spring scale and opacity
 */
export function PressableScale({
  scaleTo = 0.98,
  activeOpacity = 0.94,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: scaleTo,
        friction: 7,
        tension: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: activeOpacity,
        duration: 90,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
