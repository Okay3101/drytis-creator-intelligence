import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/auth';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, font, radius, shadows } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

const MENU_ITEMS = [
  { label: 'Edit Profile', icon: 'account-edit-outline', screen: 'BrandEditProfile' },
  { label: 'Change Password', icon: 'lock-outline', screen: 'BrandChangePassword' },
  { label: 'Support', icon: 'chat-outline', screen: 'BrandSupport' },
];

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
        <View style={s.avatarOuter}>
          <View style={s.avatarHighlight} />
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Brand</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Account</Text>
      <Card>
        {MENU_ITEMS.map((item, i, arr) => (
          <TouchableOpacity
            key={item.label}
            style={[s.menuItem, i < arr.length - 1 && s.menuBorder]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={s.menuIconWell}>
              <Icon name={item.icon} size={18} color={colors.primary} />
            </View>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Icon name="chevron-right" size={18} color={colors.textDim} />
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
  avatarOuter: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1, borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md, overflow: 'hidden',
    ...shadows.raised,
  },
  avatarHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.95)' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: font.xxl, color: colors.white, fontWeight: '800' },
  name: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  email: { fontSize: font.base, color: colors.textMuted, marginTop: spacing.xs },
  badge: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: 'rgba(217,119,6,0.2)' },
  badgeText: { color: '#D97706', fontSize: font.sm, fontWeight: '700' },

  sectionTitle: { fontSize: font.base, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIconWell: {
    width: 34, height: 34, borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(254,91,172,0.15)',
  },
  menuLabel: { flex: 1, fontSize: font.base, color: colors.text, fontWeight: '500' },
  logoutBtn: { marginTop: spacing.xl, marginBottom: spacing.xl },
});
