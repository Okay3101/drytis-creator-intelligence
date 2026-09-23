import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, font, shadows } from '../utils/theme';
import BrandHomeScreen from '../screens/brand/HomeScreen';
import CampaignsScreen from '../screens/brand/CampaignsScreen';
import BrandProfileScreen from '../screens/brand/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BrandTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceRaised,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          ...shadows.raised,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: font.sm - 1, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="BrandHome" component={BrandHomeScreen} options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Icon name="view-dashboard-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Campaigns" component={CampaignsScreen} options={{ title: 'Campaigns', tabBarIcon: ({ color, size }) => <Icon name="bullhorn-outline" size={size} color={color} /> }} />
      <Tab.Screen name="BrandProfile" component={BrandProfileScreen} options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Icon name="domain" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}
