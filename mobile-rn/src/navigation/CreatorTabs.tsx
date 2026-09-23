import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, font, shadows } from '../utils/theme';
import HomeScreen from '../screens/creator/HomeScreen';
import DiagnoseScreen from '../screens/creator/DiagnoseScreen';
import CreateScreen from '../screens/creator/CreateScreen';
import TrendsScreen from '../screens/creator/TrendsScreen';
import ProfileScreen from '../screens/creator/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function CreatorTabs() {
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Icon name="home-variant" size={size} color={color} /> }} />
      <Tab.Screen name="Diagnose" component={DiagnoseScreen} options={{ title: 'Diagnose', tabBarIcon: ({ color, size }) => <Icon name="chart-bar" size={size} color={color} /> }} />
      <Tab.Screen name="Create" component={CreateScreen} options={{ title: 'Create', tabBarIcon: ({ color, size }) => <Icon name="pencil-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Trends" component={TrendsScreen} options={{ title: 'Trends', tabBarIcon: ({ color, size }) => <Icon name="trending-up" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Icon name="account-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}
