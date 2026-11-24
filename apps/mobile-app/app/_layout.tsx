import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  const { isAuthenticated } = useEdzyStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: colors.text.primary,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
