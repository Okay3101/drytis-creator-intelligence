import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { api } from '../../api/client';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, font, radius } from '../../utils/theme';

type CampaignDetailRoute = RouteProp<{ CampaignDetail: { id: number } }, 'CampaignDetail'>;

interface Application {
  id: number;
  creator_name: string;
  creator_followers: number | null;
  status: string;
  applied_at: string;
}

interface CampaignDetail {
  id: number;
  title: string;
  description: string;
  status: string;
  budget: number | null;
  niche: string | null;
  deliverables: string | null;
  applications: Application[];
}

export default function CampaignDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<CampaignDetailRoute>();
  const { id } = route.params;
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'applications'>('overview');

  useEffect(() => {
    api.get<{ data: CampaignDetail }>(`/brand/campaigns/${id}`)
      .then(({ data }) => setCampaign(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApplicant = async (appId: number, action: 'approve' | 'reject') => {
    try {
      await api.post(`/brand/campaigns/${id}/applications/${appId}/${action}`);
      const { data } = await api.get<{ data: CampaignDetail }>(`/brand/campaigns/${id}`);
      setCampaign(data.data);
    } catch {
      Alert.alert('Error', 'Could not update application.');
    }
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }
  if (!campaign) {
    return <View style={s.center}><Text style={s.errorText}>Campaign not found.</Text></View>;
  }

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title} numberOfLines={1}>{campaign.title}</Text>
      </View>

      <View style={s.tabRow}>
        {(['overview', 'applications'] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'applications' ? ` (${campaign.applications?.length ?? 0})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.container}>
        {tab === 'overview' ? (
          <>
            <Card title="Description">
              <Text style={s.bodyText}>{campaign.description}</Text>
            </Card>
            {campaign.budget != null && (
              <Card title="Budget">
                <Text style={s.bodyText}>${campaign.budget}</Text>
              </Card>
            )}
            {campaign.deliverables && (
              <Card title="Deliverables">
                <Text style={s.bodyText}>{campaign.deliverables}</Text>
              </Card>
            )}
            {campaign.niche && (
              <Card title="Niche">
                <Text style={s.bodyText}>{campaign.niche}</Text>
              </Card>
            )}
          </>
        ) : (
          (campaign.applications ?? []).length === 0 ? (
            <Card>
              <Text style={s.emptyText}>No applications yet.</Text>
            </Card>
          ) : (
            (campaign.applications ?? []).map((app) => (
              <Card key={app.id}>
                <View style={s.appRow}>
                  <View style={s.appAvatar}>
                    <Text style={s.appAvatarText}>{app.creator_name?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={s.appInfo}>
                    <Text style={s.appName}>{app.creator_name}</Text>
                    {app.creator_followers != null && (
                      <Text style={s.appMeta}>{app.creator_followers.toLocaleString()} followers</Text>
                    )}
                  </View>
                  <View style={[s.statusBadge, app.status === 'approved' ? s.approved : app.status === 'rejected' ? s.rejected : s.pending]}>
                    <Text style={s.statusText}>{app.status}</Text>
                  </View>
                </View>
                {app.status === 'pending' && (
                  <View style={s.actionRow}>
                    <Button title="Approve" onPress={() => handleApplicant(app.id, 'approve')} style={s.approveBtn} />
                    <Button title="Reject" onPress={() => handleApplicant(app.id, 'reject')} variant="danger" style={s.rejectBtn} />
                  </View>
                )}
              </Card>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  errorText: { color: colors.textMuted, fontSize: font.base },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, paddingTop: spacing.xl + spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backText: { color: colors.primary, fontSize: font.base },
  title: { flex: 1, fontSize: font.lg, fontWeight: '700', color: colors.text },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: font.base },
  tabTextActive: { color: colors.primary },
  container: { padding: spacing.lg },
  bodyText: { fontSize: font.base, color: colors.text, lineHeight: 24 },
  emptyText: { color: colors.textMuted, fontSize: font.base },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  appAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  appAvatarText: { color: colors.primary, fontWeight: '700', fontSize: font.base },
  appInfo: { flex: 1 },
  appName: { fontSize: font.base, fontWeight: '700', color: colors.text },
  appMeta: { fontSize: font.sm, color: colors.textMuted },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  approved: { backgroundColor: '#dcfce7' },
  rejected: { backgroundColor: '#fee2e2' },
  pending: { backgroundColor: colors.surfaceAlt },
  statusText: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  approveBtn: { flex: 1 },
  rejectBtn: { flex: 1 },
});
