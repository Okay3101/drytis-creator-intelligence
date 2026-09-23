import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, font } from '../utils/theme';
import HomeScreen from '../screens/creator/HomeScreen';
import DiagnoseScreen from '../screens/creator/DiagnoseScreen';
import CreateScreen from '../screens/creator/CreateScreen';
import TrendsScreen from '../screens/creator/TrendsScreen';
import ProfileScreen from '../screens/creator/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function CreatorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: font.sm - 1, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tab.Screen name="Diagnose" component={DiagnoseScreen} options={{ title: 'Diagnose', tabBarIcon: ({ focused }) => <TabIcon emoji="🔬" focused={focused} /> }} />
      <Tab.Screen name="Create" component={CreateScreen} options={{ title: 'Create', tabBarIcon: ({ focused }) => <TabIcon emoji="✍️" focused={focused} /> }} />
      <Tab.Screen name="Trends" component={TrendsScreen} options={{ title: 'Trends', tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }} />
    </Tab.Navigator>
  );
}
