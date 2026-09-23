import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, font } from '../utils/theme';
import BrandHomeScreen from '../screens/brand/HomeScreen';
import CampaignsScreen from '../screens/brand/CampaignsScreen';
import BrandProfileScreen from '../screens/brand/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function BrandTabs() {
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
      <Tab.Screen name="BrandHome" component={BrandHomeScreen} options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tab.Screen name="Campaigns" component={CampaignsScreen} options={{ title: 'Campaigns', tabBarIcon: ({ focused }) => <TabIcon emoji="📢" focused={focused} /> }} />
      <Tab.Screen name="BrandProfile" component={BrandProfileScreen} options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon emoji="🏢" focused={focused} /> }} />
    </Tab.Navigator>
  );
}
