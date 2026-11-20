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
      // Redirect unauthenticated users to the college-ERP style login screen
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users to the master Bento dashboard
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
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
            title: 'CBSE Class 10 Roadmap',
            headerBackTitle: 'Dashboard',
          }}
        />
        <Stack.Screen
          name="study/ar-lab"
          options={{
            title: '16:9 Spatial AR Lab',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="study/tutor"
          options={{
            title: 'Socratic AI Tutor',
            headerBackTitle: 'Study',
          }}
        />
        <Stack.Screen
          name="erp/fees"
          options={{
            title: 'Fee Passbook & Receipts',
            headerBackTitle: 'ERP',
          }}
        />
        <Stack.Screen
          name="erp/marks"
          options={{
            title: 'CBSE Exam Performance',
            headerBackTitle: 'ERP',
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
