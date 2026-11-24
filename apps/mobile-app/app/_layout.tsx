import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, StatusBar as RNStatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEdzyStore } from '@/store/useEdzyStore';
import { lightTheme, darkTheme } from '@/theme/colors';

export default function RootLayout() {
  const { isAuthenticated, themeMode } = useEdzyStore();
  const isDark = themeMode === 'dark';
  const activeTheme = isDark ? darkTheme : lightTheme;
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'android') {
      (RNStatusBar as any).setBackgroundColor?.('transparent', true);
      (RNStatusBar as any).setTranslucent?.(true);
    }
  }, []);

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
      <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: activeTheme.surface,
            },
            headerTintColor: activeTheme.text.primary,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
              color: activeTheme.text.primary,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: activeTheme.background,
            },
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="study/roadmap"
            options={{
              title: 'CBSE Chapter Roadmap',
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
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
