import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Glasses, MessageSquareCode, CreditCard } from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  const { activeMode } = useEdzyStore();
  const isStudent = activeMode === 'STUDENT';
  const activeColor = isStudent ? colors.student.secondaryLight : colors.parent.primaryLight;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bento Grid',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
