import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../utils/theme';
import BrandTabs from './BrandTabs';
import CreateCampaignScreen from '../screens/brand/CreateCampaignScreen';
import CampaignDetailScreen from '../screens/brand/CampaignDetailScreen';
import BrandEditProfileScreen from '../screens/brand/EditProfileScreen';
import BrandChangePasswordScreen from '../screens/brand/ChangePasswordScreen';
import SupportScreen from '../screens/creator/SupportScreen';

const Stack = createNativeStackNavigator();

export default function BrandNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="BrandTabs" component={BrandTabs} />
      <Stack.Screen name="CreateCampaign" component={CreateCampaignScreen} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
      <Stack.Screen name="BrandEditProfile" component={BrandEditProfileScreen} />
      <Stack.Screen name="BrandChangePassword" component={BrandChangePasswordScreen} />
      <Stack.Screen name="BrandSupport" component={SupportScreen} />
    </Stack.Navigator>
  );
}
