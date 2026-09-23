import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../store/auth';
import { api } from '../../api/client';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, font, radius } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

interface Campaign {
  id: number;
  title: string;
  status: string;
  applications_count: number;
  budget: number;
  created_at: string;
}

export default function BrandHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get<{ data: Campaign[] }>('/brand/campaigns');
      setCampaigns(data.data ?? []);
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

  const active = campaigns.filter((c) => c.status === 'active');
  const totalApplications = campaigns.reduce((sum, c) => sum + (c.applications_count ?? 0), 0);

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={s.sub}>Brand Dashboard</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        <StatCard label="Active Campaigns" value={String(active.length)} />
        <StatCard label="Total Applications" value={String(totalApplications)} />
      </View>

      <Button title="+ Create Campaign" onPress={() => navigation.navigate('CreateCampaign')} style={s.createBtn} />

      <Text style={s.sectionTitle}>Recent Campaigns</Text>
      {campaigns.length === 0 ? (
        <Card>
          <Text style={s.emptyText}>No campaigns yet. Create your first campaign to find creators.</Text>
        </Card>
      ) : (
        campaigns.slice(0, 5).map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => navigation.navigate('CampaignDetail', { id: c.id })}
            activeOpacity={0.85}
          >
            <Card>
              <View style={s.campRow}>
                <View style={s.campInfo}>
                  <Text style={s.campTitle}>{c.title}</Text>
                  <Text style={s.campMeta}>{c.applications_count} applications</Text>
                </View>
                <View style={[s.statusBadge, c.status === 'active' ? s.statusActive : s.statusDraft]}>
                  <Text style={[s.statusText, c.status === 'active' ? s.statusActiveText : s.statusDraftText]}>
                    {c.status}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  greeting: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  sub: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: font.xxl, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: font.sm, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  createBtn: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: font.base, lineHeight: 22 },
  campRow: { flexDirection: 'row', alignItems: 'center' },
  campInfo: { flex: 1 },
  campTitle: { fontSize: font.base, fontWeight: '700', color: colors.text },
  campMeta: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  statusActive: { backgroundColor: '#dcfce7' },
  statusDraft: { backgroundColor: colors.surfaceAlt },
  statusText: { fontSize: font.sm, fontWeight: '700' },
  statusActiveText: { color: colors.success },
  statusDraftText: { color: colors.textMuted },
});
