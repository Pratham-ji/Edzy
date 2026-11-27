import React, { useCallback, useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, StatusBar as RNStatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useEdzyStore } from '@/store/useEdzyStore';
import { useAppTheme } from '@/theme/colors';
import { EdzySplashScreen } from '@/components/EdzySplashScreen';

// Keep native Royal Indigo splash visible until the matching React Native animated splash paints
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isAuthenticated } = useEdzyStore();
  const { theme, isDark } = useAppTheme();
  const [showSplash, setShowSplash] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  const hideNativeSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      (RNStatusBar as any).setBackgroundColor?.('transparent', true);
      (RNStatusBar as any).setTranslucent?.(true);
    }
    const fallbackTimer = setTimeout(hideNativeSplash, 250);
    return () => clearTimeout(fallbackTimer);
  }, [hideNativeSplash]);

  useEffect(() => {
    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return (
    <SafeAreaProvider>
      <View
        onLayout={hideNativeSplash}
        style={[
          styles.container,
          { backgroundColor: showSplash ? '#312E81' : theme.canvas },
        ]}
      >
        <StatusBar
          style={showSplash ? 'light' : isDark ? 'light' : 'dark'}
        />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.surface,
            },
            headerTintColor: theme.textPrimary,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
              color: theme.textPrimary,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: theme.canvas,
            },
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="study/roadmap"
            options={{
              title: 'Study Roadmap',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="study/ar-lab"
            options={{
              title: '3D Visual Lab',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="study/tutor"
            options={{
              title: 'AI Doubt Tutor',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="erp/fees"
            options={{
              title: 'Fee Passbook & Receipts',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="erp/marks"
            options={{
              title: 'Exam Report Card',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>

        {/* 60fps Native-driver animated launch overlay */}
        {showSplash && <EdzySplashScreen onFinish={() => setShowSplash(false)} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
