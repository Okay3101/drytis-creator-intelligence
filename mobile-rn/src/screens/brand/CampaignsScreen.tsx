import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  budget: number | null;
  created_at: string;
}

export default function CampaignsScreen() {
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

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <Text style={s.title}>Campaigns</Text>
        <TouchableOpacity style={s.createBtn} onPress={() => navigation.navigate('CreateCampaign')}>
          <Text style={s.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={campaigns}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CampaignDetail', { id: item.id })}
            activeOpacity={0.85}
          >
            <Card>
              <View style={s.row}>
                <View style={s.info}>
                  <Text style={s.campTitle}>{item.title}</Text>
                  <Text style={s.campMeta}>
                    {item.applications_count} applicants
                    {item.budget ? ` · $${item.budget}` : ''}
                  </Text>
                </View>
                <View style={[s.badge, item.status === 'active' ? s.badgeActive : s.badgeDraft]}>
                  <Text style={[s.badgeText, item.status === 'active' ? s.badgeActiveText : s.badgeDraftText]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>No campaigns yet.</Text>
            <Button title="Create Campaign" onPress={() => navigation.navigate('CreateCampaign')} style={s.emptyBtn} />
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, paddingTop: spacing.xl + spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  createBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  createBtnText: { color: colors.white, fontWeight: '700', fontSize: font.sm },
  list: { padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  campTitle: { fontSize: font.base, fontWeight: '700', color: colors.text },
  campMeta: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  badgeActive: { backgroundColor: '#dcfce7' },
  badgeDraft: { backgroundColor: colors.surfaceAlt },
  badgeText: { fontSize: font.sm, fontWeight: '700' },
  badgeActiveText: { color: colors.success },
  badgeDraftText: { color: colors.textMuted },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: font.base, marginBottom: spacing.lg },
  emptyBtn: {},
});
