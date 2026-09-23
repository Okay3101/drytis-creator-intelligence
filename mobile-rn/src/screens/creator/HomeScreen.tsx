import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../store/auth';
import { instagramApi, InstagramAccount } from '../../api/instagram';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, font, radius } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

export default function CreatorHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await instagramApi.getAccounts();
      setAccounts(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={s.sub}>Your creator dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CreatorTabs', { screen: 'Profile' })} style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {accounts.length === 0 ? (
        <Card style={s.connectCard}>
          <Text style={s.connectTitle}>Connect your Instagram</Text>
          <Text style={s.connectSub}>Link a professional Instagram account to start getting AI-powered insights.</Text>
          <Button title="Connect Instagram" onPress={() => navigation.navigate('CreatorTabs', { screen: 'Diagnose' })} style={s.connectBtn} />
        </Card>
      ) : (
        <>
          <Text style={s.sectionTitle}>Your Accounts</Text>
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </>
      )}

      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.actionsGrid}>
        {[
          { label: 'Content Diagnosis', emoji: '🔬', screen: 'Diagnose' },
          { label: 'Script Generator', emoji: '✍️', screen: 'Create' },
          { label: 'Reel Readiness', emoji: '🎬', screen: 'Readiness' },
          { label: 'Trends', emoji: '📈', screen: 'Trends' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={s.actionCard}
            onPress={() => {
              if (item.screen === 'Readiness') {
                navigation.navigate('Readiness');
              } else {
                navigation.navigate('CreatorTabs', { screen: item.screen });
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={s.actionEmoji}>{item.emoji}</Text>
            <Text style={s.actionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function AccountCard({ account }: { account: InstagramAccount }) {
  return (
    <Card style={s.accCard}>
      <View style={s.accRow}>
        <View style={s.accAvatar}>
          <Text style={s.accAvatarText}>@</Text>
        </View>
        <View style={s.accInfo}>
          <Text style={s.accName}>@{account.username}</Text>
          {account.followers_count != null && (
            <Text style={s.accFollowers}>{account.followers_count.toLocaleString()} followers</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  greeting: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  sub: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: font.md },
  sectionTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  connectCard: { marginBottom: spacing.xl },
  connectTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  connectSub: { fontSize: font.base, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.md },
  connectBtn: {},
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  actionCard: {
    width: '47%', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', gap: spacing.xs,
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontSize: font.sm, fontWeight: '600', color: colors.text, textAlign: 'center' },
  accCard: { marginBottom: spacing.sm },
  accRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  accAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  accAvatarText: { fontSize: font.lg, color: colors.primary, fontWeight: '700' },
  accInfo: { flex: 1 },
  accName: { fontSize: font.base, fontWeight: '700', color: colors.text },
  accFollowers: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
});
