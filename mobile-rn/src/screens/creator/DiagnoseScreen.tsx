import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { instagramApi, InstagramAccount, Diagnosis } from '../../api/instagram';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, spacing, font, radius } from '../../utils/theme';

type Tab = 'accounts' | 'diagnosis';

export default function DiagnoseScreen() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selected, setSelected] = useState<InstagramAccount | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [tab, setTab] = useState<Tab>('accounts');
  const [loading, setLoading] = useState(true);
  const [diagLoading, setDiagLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);

  const loadAccounts = async () => {
    try {
      const { data } = await instagramApi.getAccounts();
      setAccounts(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadAccounts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  };

  const selectAccount = async (acc: InstagramAccount) => {
    setSelected(acc);
    setTab('diagnosis');
    setDiagLoading(true);
    setDiagnosis(null);
    try {
      const { data } = await instagramApi.getDiagnosis(acc.id);
      setDiagnosis(data.data);
    } catch {}
    setDiagLoading(false);
  };

  const triggerSync = async () => {
    if (!selected) return;
    setSyncing(selected.id);
    try {
      await instagramApi.sync(selected.id);
      Alert.alert('Analysis started', 'This may take a few minutes. Check back soon.');
    } catch {
      Alert.alert('Error', 'Could not start analysis. Please try again.');
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <Text style={s.title}>Content Diagnosis</Text>
        {tab === 'diagnosis' && (
          <TouchableOpacity onPress={() => setTab('accounts')}>
            <Text style={s.back}>← Accounts</Text>
          </TouchableOpacity>
        )}
      </View>

      {tab === 'accounts' ? (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {accounts.length === 0 ? (
            <Card>
              <Text style={s.emptyTitle}>No Instagram accounts connected</Text>
              <Text style={s.emptySub}>Connect a professional Instagram account to get your content diagnosis.</Text>
              <Button
                title="Connect Demo Account"
                onPress={async () => {
                  try {
                    await instagramApi.connectDemo();
                    loadAccounts();
                  } catch (err: any) {
                    Alert.alert('Error', err?.response?.data?.message ?? 'Failed to connect.');
                  }
                }}
              />
            </Card>
          ) : (
            accounts.map((acc) => (
              <TouchableOpacity key={acc.id} onPress={() => selectAccount(acc)} activeOpacity={0.8}>
                <Card>
                  <View style={s.accRow}>
                    <View style={s.accDot} />
                    <View style={s.accInfo}>
                      <Text style={s.accName}>@{acc.username}</Text>
                      {acc.followers_count != null && (
                        <Text style={s.accMeta}>{acc.followers_count.toLocaleString()} followers</Text>
                      )}
                    </View>
                    <Text style={s.chevron}>›</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView style={s.scroll} contentContainerStyle={s.container}>
          <Text style={s.accHeader}>@{selected?.username}</Text>
          {diagLoading ? (
            <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
          ) : diagnosis ? (
            <>
              <ScoreCard score={diagnosis.score} />
              <DiagSection title="Strengths 💪" items={diagnosis.strengths} color={colors.success} />
              <DiagSection title="Weaknesses ⚠️" items={diagnosis.weaknesses} color={colors.warning} />
              <DiagSection title="Recommendations 🎯" items={diagnosis.recommendations} color={colors.primary} />
              <Card>
                <Text style={s.summaryLabel}>Summary</Text>
                <Text style={s.summaryText}>{diagnosis.summary}</Text>
              </Card>
              <Button title="Refresh Analysis" onPress={triggerSync} loading={syncing === selected?.id} variant="secondary" />
            </>
          ) : (
            <Card>
              <Text style={s.emptyTitle}>No diagnosis yet</Text>
              <Text style={s.emptySub}>Run an analysis to get AI-powered insights on your content health.</Text>
              <Button title="Start Analysis" onPress={triggerSync} loading={syncing === selected?.id} />
            </Card>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function ScoreCard({ score }: { score: number }) {
  const color = score >= 70 ? colors.success : score >= 40 ? colors.warning : colors.error;
  return (
    <Card style={s.scoreCard}>
      <Text style={s.scoreLabel}>Content Health Score</Text>
      <Text style={[s.scoreValue, { color }]}>{score}</Text>
      <Text style={s.scoreMax}>/100</Text>
    </Card>
  );
}

function DiagSection({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <Card>
      <Text style={s.diagTitle}>{title}</Text>
      {items.map((item, i) => (
        <View key={i} style={s.diagItem}>
          <View style={[s.diagDot, { backgroundColor: color }]} />
          <Text style={s.diagText}>{item}</Text>
        </View>
      ))}
    </Card>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  container: { padding: spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, paddingTop: spacing.xl + spacing.lg,
    backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  back: { color: colors.primary, fontSize: font.base },
  accRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  accDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success },
  accInfo: { flex: 1 },
  accName: { fontSize: font.base, fontWeight: '700', color: colors.text },
  accMeta: { fontSize: font.sm, color: colors.textMuted },
  chevron: { fontSize: font.xl, color: colors.textMuted },
  accHeader: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontSize: font.base, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.md },
  scoreCard: { alignItems: 'center', paddingVertical: spacing.xl },
  scoreLabel: { fontSize: font.sm, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.sm },
  scoreValue: { fontSize: 56, fontWeight: '800', lineHeight: 64 },
  scoreMax: { fontSize: font.base, color: colors.textMuted },
  diagTitle: { fontSize: font.base, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  diagItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.xs },
  diagDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  diagText: { flex: 1, fontSize: font.base, color: colors.textMuted, lineHeight: 22 },
  summaryLabel: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.xs },
  summaryText: { fontSize: font.base, color: colors.text, lineHeight: 24 },
});
