import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EdzySplashScreenProps {
  onFinish?: () => void;
}

export const EdzySplashScreen: React.FC<EdzySplashScreenProps> = ({ onFinish }) => {
  // Animation drivers
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  // Visual mark spring & opacity
  const emblemScale = useRef(new Animated.Value(0.7)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;

  // Ambient glow pulse
  const glowScale = useRef(new Animated.Value(0.85)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  // Typography stagger
  const wordmarkY = useRef(new Animated.Value(18)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;

  const taglineY = useRef(new Animated.Value(10)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Progress line
  const progressAnim = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Ambient glow looping breathe
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 0.9,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    // 2. Coordinated entry animation sequence
    Animated.parallel([
      // Emblem spring in
      Animated.spring(emblemScale, {
        toValue: 1,
        tension: 65,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(emblemOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),

      // Wordmark slides up smoothly
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(wordmarkY, {
            toValue: 0,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(wordmarkOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Tagline slides up slightly after
      Animated.sequence([
        Animated.delay(340),
        Animated.parallel([
          Animated.timing(taglineY, {
            toValue: 0,
            duration: 440,
            useNativeDriver: true,
          }),
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(footerOpacity, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Loading progress bar fill
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // 3. Exit transition at ~2.1 seconds total
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(containerScale, {
          toValue: 1.04,
          duration: 380,
          useNativeDriver: true,
        }),
      ]).start(() => {
        glowLoop.stop();
        onFinish?.();
      });
    }, 2100);

    return () => {
      clearTimeout(timer);
      glowLoop.stop();
    };
  }, [onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity: containerOpacity,
          transform: [{ scale: containerScale }],
        },
      ]}
    >
      {/* Layered ambient depth rings */}
      <View style={StyleSheet.absoluteFill}>
        {/* Deep ambient dark indigo background */}
        <View style={styles.deepBackdrop} />

        {/* Pulsing ambient glow sphere */}
        <Animated.View
          style={[
            styles.ambientGlow,
            {
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
        />
        <View style={styles.ambientGlowInner} />
      </View>

      {/* Center Hero Block */}
      <View style={styles.centerContent}>
        {/* Emblem Squircle */}
        <Animated.View
          style={[
            styles.emblemContainer,
            {
              opacity: emblemOpacity,
              transform: [{ scale: emblemScale }],
            },
          ]}
        >
          <Svg width={84} height={84} viewBox="0 0 84 84">
            <Defs>
              <LinearGradient id="squircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.32" />
                <Stop offset="100%" stopColor="#4338CA" stopOpacity="0.48" />
              </LinearGradient>
              <LinearGradient id="symbolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor="#E0E7FF" />
              </LinearGradient>
            </Defs>

            {/* Glowing squircle surface */}
            <Rect
              x={2}
              y={2}
              width={80}
              height={80}
              rx={24}
              fill="url(#squircleGrad)"
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth={1.5}
            />

            {/* Stylized Modern EDZY Monogram ("E" + "Z" overlapping ribbon geometry) */}
            <G fill="url(#symbolGrad)">
              {/* E top horizontal bar */}
              <Rect x={22} y={24} width={26} height={6} rx={3} />
              {/* E middle horizontal bar */}
              <Rect x={22} y={35} width={18} height={5.5} rx={2.75} />
              {/* E bottom horizontal bar */}
              <Rect x={22} y={46} width={26} height={6} rx={3} />
              {/* E vertical spine */}
              <Rect x={22} y={24} width={6.5} height={28} rx={3.25} />

              {/* Z dynamic crossing stroke */}
              <Path
                d="M51 25.5 H62 L44 56 H33 L51 25.5Z"
                fill="#818CF8"
                opacity={0.88}
              />
              {/* Top Z bar accent */}
              <Rect x={44} y={24} width={18} height={5.5} rx={2.75} />
              {/* Bottom Z bar accent */}
              <Rect x={36} y={46.5} width={26} height={6} rx={3} />

              {/* Sparkle spark */}
              <Circle cx={61} cy={27} r={2} fill="#FDE047" />
            </G>
          </Svg>
        </Animated.View>

        {/* Wordmark */}
        <Animated.View
          style={{
            opacity: wordmarkOpacity,
            transform: [{ translateY: wordmarkY }],
          }}
        >
          <Text style={styles.brandTitle}>EDZY</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineY }],
            marginTop: 6,
          }}
        >
          <Text style={styles.brandTagline}>Education Made Easy for Gen-Z</Text>
        </Animated.View>
      </View>

      {/* Bottom Loading Indicator & Signature */}
      <View style={styles.bottomContainer}>
        {/* Shimmer progress track */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        {/* Footer Authority Pill */}
        <Animated.View style={{ opacity: footerOpacity, marginTop: 16 }}>
          <Text style={styles.footerText}>Smart School OS • India</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#312E81', // Deep Royal Indigo
  },
  deepBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1E1B4B',
  },
  ambientGlow: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.22,
    left: (SCREEN_WIDTH - 360) / 2,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#4338CA',
  },
  ambientGlowInner: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.32,
    left: (SCREEN_WIDTH - 240) / 2,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#4F46E5',
    opacity: 0.35,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emblemContainer: {
    width: 84,
    height: 84,
    borderRadius: 24,
    marginBottom: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 54 : 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressTrack: {
    width: 140,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.55)',
    textTransform: 'uppercase',
  },
});
