import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Home, BookOpen, Wallet, User } from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';

export interface FloatingGlassTabBarProps {
  state: any;
  descriptors?: any;
  navigation?: any;
  emitter?: any;
  navigateToTab?: (routeKey: string) => void;
  insets?: { top: number; bottom: number; left: number; right: number };
}

// 4 Clean Indian School Navigation Tabs (Strictly ZERO '$' icons)
const TAB_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }> }
> = {
  index: {
    label: 'Home',
    icon: Home,
  },
  syllabus: {
    label: 'Syllabus',
    icon: BookOpen,
  },
  erp: {
    label: 'Fees & Marks',
    icon: Wallet,
  },
  profile: {
    label: 'Profile',
    icon: User,
  },
};

export function FloatingGlassTabBar({
  state,
  descriptors,
  navigation,
  navigateToTab,
}: FloatingGlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const themeMode = useEdzyStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  // Filter routes to standard tabs (ignore sitemap / not-found)
  const validRoutes = (state?.routes || []).filter(
    (route: any) => !['_sitemap', '+not-found'].includes(route.name)
  );

  const routeCount = Math.max(validRoutes.length, 1);
  const innerPadding = 6;
  const tabWidth = containerWidth > 0 ? (containerWidth - innerPadding * 2) / routeCount : 0;
  const indicatorWidth = Math.max(tabWidth - 4, 0);

  useEffect(() => {
    if (tabWidth > 0) {
      Animated.spring(translateX, {
        toValue: state.index * tabWidth + innerPadding + 2,
        friction: 8,
        tension: 70,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [state?.index, tabWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
      const currentTabW = (width - innerPadding * 2) / routeCount;
      translateX.setValue(state.index * currentTabW + innerPadding + 2);
    }
  };

  const handlePress = (route: any, isFocused: boolean) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {
        // Safe fallback
      }
    }

    const event = navigation?.emit?.({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event?.defaultPrevented) {
      if (navigation?.navigate) {
        navigation.navigate(route.name);
      } else if (navigateToTab) {
        navigateToTab(route.key);
      }
    }
  };

  const bottomOffset = Math.max(insets.bottom, 12) + 8;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outerWrapper, { bottom: bottomOffset }]}
    >
      <View
        style={[
          styles.shadowContainer,
          {
            backgroundColor:
              Platform.OS === 'android'
                ? isDark
                  ? '#161B22'
                  : '#0F172A'
                : 'transparent',
          },
        ]}
        onLayout={handleLayout}
      >
        <View
          style={[
            styles.innerPill,
            {
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.14)'
                : 'rgba(255, 255, 255, 0.16)',
            },
          ]}
        >
          {/* Frosted Glass Layer */}
          <BlurView
            intensity={65}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />

          {/* Deep Obsidian Overlay to ensure 100% readability */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? 'rgba(28, 33, 43, 0.86)'
                  : 'rgba(15, 23, 42, 0.78)',
              },
            ]}
          />

          {/* Animated Sliding Highlight Pill */}
          {tabWidth > 0 && (
            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  width: indicatorWidth,
                  transform: [{ translateX }],
                },
              ]}
            />
          )}

          {/* Tab Buttons */}
          {validRoutes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name] || {
              label: route.name,
              icon: Home,
            };
            const Icon = config.icon;
            const activeColor = '#FFFFFF';
            const inactiveColor = 'rgba(255, 255, 255, 0.58)';
            const iconColor = isFocused ? activeColor : inactiveColor;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={config.label}
                activeOpacity={0.75}
                onPress={() => handlePress(route, isFocused)}
                style={styles.tabItem}
              >
                <Icon
                  size={20}
                  color={iconColor}
                  strokeWidth={isFocused ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: iconColor,
                      fontWeight: isFocused ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  shadowContainer: {
    width: '100%',
    maxWidth: 420,
    height: 64,
    borderRadius: 32,
    backgroundColor: Platform.OS === 'android' ? '#0F172A' : 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: {
        elevation: 14,
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
    }),
  },
  innerPill: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  darkOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    left: 0,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  tabItem: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: -0.2,
  },
});
