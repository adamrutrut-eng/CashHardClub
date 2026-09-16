import React from 'react';
import { StyleSheet, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function icon(outline: IconName, filled: IconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color as string} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.dim,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Shop', tabBarIcon: icon('bag-outline', 'bag') }} />
      <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: icon('calendar-outline', 'calendar') }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: icon('notifications-outline', 'notifications') }} />
      <Tabs.Screen name="club" options={{ title: 'Club', tabBarIcon: icon('diamond-outline', 'diamond') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  label: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase' },
  item: { paddingVertical: 4 },
});
