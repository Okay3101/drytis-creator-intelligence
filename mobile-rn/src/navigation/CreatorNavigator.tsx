import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../utils/theme';
import CreatorTabs from './CreatorTabs';
import EditProfileScreen from '../screens/creator/EditProfileScreen';
import ChangePasswordScreen from '../screens/creator/ChangePasswordScreen';
import SupportScreen from '../screens/creator/SupportScreen';
import NotificationPrefsScreen from '../screens/creator/NotificationPrefsScreen';
import ReadinessScreen from '../screens/creator/ReadinessScreen';

const Stack = createNativeStackNavigator();

export default function CreatorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="CreatorTabs" component={CreatorTabs} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="NotificationPrefs" component={NotificationPrefsScreen} />
      <Stack.Screen name="Readiness" component={ReadinessScreen} />
    </Stack.Navigator>
  );
}
