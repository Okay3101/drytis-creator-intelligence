import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { colors, spacing, font, radius } from '../../utils/theme';

interface Trend {
  id: number;
  title: string;
  description: string;
  category: string;
  virality_score: number;
  personalized_score?: number;
}

export default function TrendsScreen() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Trend | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get<{ data: Trend[] }>('/trends');
      setTrends(data.data ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const useTrend = async (trend: Trend) => {
    try {
      await api.post(`/trends/${trend.id}/use`);
      Alert.alert('Added!', `"${trend.title}" has been added to your script generator.`);
    } catch {
      Alert.alert('Error', 'Could not use this trend right now.');
    }
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (selected) {
    return (
      <ScrollView style={s.scroll} contentContainerStyle={s.container}>
        <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
          <Text style={s.backText}>← Trends</Text>
        </TouchableOpacity>
        <Text style={s.detailTitle}>{selected.title}</Text>
        <View style={s.badges}>
          <View style={s.badge}><Text style={s.badgeText}>{selected.category}</Text></View>
          <View style={[s.badge, s.badgePrimary]}>
            <Text style={[s.badgeText, s.badgePrimaryText]}>🔥 {selected.virality_score}/100</Text>
          </View>
        </View>
        <Card>
          <Text style={s.descText}>{selected.description}</Text>
        </Card>
        <Button title="Use This Trend" onPress={() => useTrend(selected)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <Text style={s.title}>Trends</Text>
      <Text style={s.subtitle}>Personalized trends for your niche</Text>

      {trends.length === 0 ? (
        <Card>
          <Text style={s.emptyText}>No trends available yet. Connect your Instagram account for personalized trends.</Text>
        </Card>
      ) : (
        trends.map((trend) => (
          <TouchableOpacity key={trend.id} onPress={() => setSelected(trend)} activeOpacity={0.85}>
            <Card>
              <View style={s.trendRow}>
                <View style={s.trendInfo}>
                  <Text style={s.trendTitle}>{trend.title}</Text>
                  <Text style={s.trendCategory}>{trend.category}</Text>
                </View>
                <View style={s.scoreBox}>
                  <Text style={s.scoreNum}>{trend.virality_score}</Text>
                  <Text style={s.scoreLabel}>score</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: font.base, color: colors.textMuted, marginBottom: spacing.xl },
  trendRow: { flexDirection: 'row', alignItems: 'center' },
  trendInfo: { flex: 1 },
  trendTitle: { fontSize: font.base, fontWeight: '700', color: colors.text },
  trendCategory: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  scoreBox: { alignItems: 'center' },
  scoreNum: { fontSize: font.lg, fontWeight: '800', color: colors.primary },
  scoreLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  emptyText: { fontSize: font.base, color: colors.textMuted, lineHeight: 22 },
  backBtn: { marginBottom: spacing.md },
  backText: { color: colors.primary, fontSize: font.base },
  detailTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  badges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  badge: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.full, backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.border,
  },
  badgePrimary: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  badgeText: { fontSize: font.sm, color: colors.textMuted, fontWeight: '600' },
  badgePrimaryText: { color: colors.primary },
  descText: { fontSize: font.base, color: colors.text, lineHeight: 24 },
});
