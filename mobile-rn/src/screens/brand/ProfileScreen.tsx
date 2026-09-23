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

export default function BrandProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<Nav>();

  const onLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <Text style={s.title}>Brand Profile</Text>

      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Brand</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Account</Text>
      <Card>
        {[
          { label: 'Edit Profile', emoji: '✏️', screen: 'BrandEditProfile' },
          { label: 'Change Password', emoji: '🔒', screen: 'BrandChangePassword' },
          { label: 'Support', emoji: '💬', screen: 'BrandSupport' },
        ].map((item, i, arr) => (
          <TouchableOpacity
            key={item.label}
            style={[s.menuItem, i < arr.length - 1 && s.menuBorder]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <Text style={s.menuEmoji}>{item.emoji}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Button title="Sign Out" onPress={onLogout} variant="secondary" style={s.logoutBtn} />
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
  badge: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: '#fef3c7' },
  badgeText: { color: '#d97706', fontSize: font.sm, fontWeight: '700' },
  sectionTitle: { fontSize: font.base, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuEmoji: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: font.base, color: colors.text, fontWeight: '500' },
  chevron: { fontSize: font.xl, color: colors.textMuted },
  logoutBtn: { marginTop: spacing.xl, marginBottom: spacing.xl },
});
