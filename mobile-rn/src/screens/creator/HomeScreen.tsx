import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/auth';
import { instagramApi, InstagramAccount } from '../../api/instagram';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, font, shadows } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

const QUICK_ACTIONS = [
  { label: 'Content Diagnosis', icon: 'chart-bar', screen: 'Diagnose' },
  { label: 'Script Generator', icon: 'pencil-outline', screen: 'Create' },
  { label: 'Reel\nReadiness', icon: 'play-circle-outline', screen: 'Readiness' },
  { label: 'Trends', icon: 'trending-up', screen: 'Trends' },
];

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
          <Text style={s.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
          <Text style={s.sub}>Your creator dashboard</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatorTabs', { screen: 'Profile' })}
          style={s.avatarBtn}
          activeOpacity={0.8}
        >
          <View style={s.avatarHighlight} />
          <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {accounts.length === 0 ? (
        <Card style={s.connectCard}>
          <Icon name="instagram" size={32} color={colors.primary} style={s.connectIcon} />
          <Text style={s.connectTitle}>Connect your Instagram</Text>
          <Text style={s.connectSub}>Link a professional Instagram account to start getting AI-powered insights.</Text>
          <Button title="Connect Instagram" onPress={() => navigation.navigate('CreatorTabs', { screen: 'Diagnose' })} />
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
        {QUICK_ACTIONS.map((item) => (
          <View key={item.label} style={s.actionItem}>
            <TouchableOpacity
              style={s.actionCircleOuter}
              onPress={() => {
                if (item.screen === 'Readiness') {
                  navigation.navigate('Readiness');
                } else {
                  navigation.navigate('CreatorTabs', { screen: item.screen });
                }
              }}
              // activeOpacity={0.78}
            >
              <View >
                <Icon name={item.icon} size={26} color={colors.primary} />
              </View>
            </TouchableOpacity>
            <Text style={s.actionLabel}>{item.label}</Text>
          </View>
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
          <Icon name="instagram" size={18} color={colors.primary} />
        </View>
        <View style={s.accInfo}>
          <Text style={s.accName}>@{account.username}</Text>
          {account.followers_count != null && (
            <Text style={s.accFollowers}>{account.followers_count.toLocaleString()} followers</Text>
          )}
        </View>
        <Icon name="chevron-right" size={18} color={colors.textDim} />
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
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.primaryDark,
    borderTopColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    ...shadows.button,
  },
  avatarHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: font.md },

  sectionTitle: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.8 },

  connectCard: { marginBottom: spacing.xl, alignItems: 'center' },
  connectIcon: { marginBottom: spacing.sm },
  connectTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  connectSub: { fontSize: font.base, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.md, textAlign: 'center' },

  actionsGrid: { flexDirection: 'row', marginBottom: spacing.xl, justifyContent: 'space-between' },
  actionItem: { flex: 1, alignItems: 'center', gap: spacing.sm, maxWidth: 80 },
  actionCircleOuter: {
    width: 72, height: 72, borderRadius: 50,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.bg,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  actionCircleHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 36, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  actionCircleInner: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(159,161,255,0.2)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCircleShadow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(0,0,0,0.08)',
  },
  actionLabel: { fontSize: font.xs ?? 11, fontWeight: '600', color: colors.text, textAlign: 'center', lineHeight: 15, flexWrap: 'wrap' },

  accCard: { marginBottom: spacing.sm },
  accRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  accAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(254,91,172,0.2)',
  },
  accInfo: { flex: 1 },
  accName: { fontSize: font.base, fontWeight: '700', color: colors.text },
  accFollowers: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
});
