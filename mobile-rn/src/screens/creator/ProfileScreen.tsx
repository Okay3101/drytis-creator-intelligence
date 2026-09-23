import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../store/auth';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, font, radius } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

export default function CreatorProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<Nav>();

  const onLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { authApi } = await import('../../api/auth');
              await authApi.deleteAccount();
              await signOut();
            } catch {
              Alert.alert('Error', 'Could not delete account. Please contact support.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <Text style={s.title}>Profile</Text>

      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Creator</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Account</Text>
      <Card>
        {[
          { label: 'Edit Profile', icon: '✏️', screen: 'EditProfile' },
          { label: 'Change Password', icon: '🔒', screen: 'ChangePassword' },
          { label: 'Notifications', icon: '🔔', screen: 'NotificationPrefs' },
          { label: 'Support', icon: '💬', screen: 'Support' },
          { label: 'Reel Readiness', icon: '🎬', screen: 'Readiness' },
        ].map((item, i, arr) => (
          <TouchableOpacity
            key={item.label}
            style={[s.menuItem, i < arr.length - 1 && s.menuItemBorder]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.menuChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Button title="Sign Out" onPress={onLogout} variant="secondary" style={s.logoutBtn} />
      <Button title="Delete Account" onPress={onDeleteAccount} variant="danger" style={s.deleteBtn} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text, marginBottom: spacing.xl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: font.xxl, color: colors.white, fontWeight: '800' },
  name: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  email: { fontSize: font.base, color: colors.textMuted, marginTop: spacing.xs },
  badge: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.primaryLight },
  badgeText: { color: colors.primary, fontSize: font.sm, fontWeight: '700' },
  sectionTitle: { fontSize: font.base, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: font.base, color: colors.text, fontWeight: '500' },
  menuChevron: { fontSize: font.xl, color: colors.textMuted },
  logoutBtn: { marginTop: spacing.xl },
  deleteBtn: { marginTop: spacing.sm, marginBottom: spacing.xl },
});
