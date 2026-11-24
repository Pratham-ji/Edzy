import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingGlassTabBar } from '@/components/FloatingGlassTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="syllabus"
        options={{
          title: 'Syllabus',
        }}
      />
      <Tabs.Screen
        name="erp"
        options={{
          title: 'Fees & Marks',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
