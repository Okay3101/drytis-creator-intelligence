import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { instagramApi, InstagramAccount } from '../../api/instagram';
import { readinessApi, ReelReadiness } from '../../api/readiness';
import { colors, spacing, font } from '../../utils/theme';

type Step = 'setup' | 'uploading' | 'result';

export default function ReadinessScreen() {
  const navigation = useNavigation();
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [step, setStep] = useState<Step>('setup');
  const [result, setResult] = useState<ReelReadiness | null>(null);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<ReelReadiness[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    instagramApi.getAccounts().then(({ data }) => {
      setAccounts(data.data);
      if (data.data.length > 0) setSelectedAccount(data.data[0].id);
    }).catch(() => {});

    readinessApi.history().then(({ data }) => setHistory(data.data)).catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const pickAndCheck = async () => {
    if (!selectedAccount) { Alert.alert('Required', 'Select an Instagram account first.'); return; }

    launchImageLibrary({ mediaType: 'video', quality: 1 }, async (response) => {
      if (response.didCancel || !response.assets?.[0]) return;

      setUploading(true);
      setStep('uploading');
      try {
        const asset = response.assets[0];
        const formData = new FormData();
        formData.append('file', { uri: asset.uri, name: 'reel.mp4', type: 'video/mp4' } as any);

        let uploadId: number | undefined;
        try {
          const uploadResp = await readinessApi.uploadMedia(formData);
          uploadId = uploadResp.data.upload_id;
        } catch {}

        const { data } = await readinessApi.submit({
          upload_id: uploadId,
          instagram_account_id: selectedAccount,
        });
        setResult(data.data);
        setStep('result');
      } catch (err: any) {
        Alert.alert('Error', err?.response?.data?.message ?? 'Analysis failed.');
        setStep('setup');
      } finally {
        setUploading(false);
      }
    });
  };

  if (step === 'uploading') {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={s.uploadingText}>Analyzing your reel...</Text>
        <Text style={s.uploadingSub}>This may take a minute</Text>
      </View>
    );
  }

  if (step === 'result' && result) {
    const scoreColor = (result.score ?? 0) >= 70 ? colors.success : (result.score ?? 0) >= 40 ? colors.warning : colors.error;
    return (
      <ScrollView style={s.scroll} contentContainerStyle={s.container}>
        <View style={s.resultHeader}>
          <TouchableOpacity onPress={() => { setStep('setup'); setResult(null); }}>
            <Text style={s.backText}>← Check Another</Text>
          </TouchableOpacity>
          <Text style={s.resultTitle}>Reel Readiness</Text>
        </View>

        <Card style={s.scoreCard}>
          <Text style={s.scoreLabel}>Readiness Score</Text>
          <Text style={[s.scoreValue, { color: scoreColor }]}>{result.score ?? '—'}</Text>
          <Text style={s.scoreMax}>/100</Text>
        </Card>

        {result.issues.length > 0 && (
          <Card title="Issues Found ⚠️">
            {result.issues.map((issue, i) => (
              <View key={i} style={s.item}>
                <View style={[s.dot, { backgroundColor: colors.error }]} />
                <Text style={s.itemText}>{issue}</Text>
              </View>
            ))}
          </Card>
        )}

        {result.suggestions.length > 0 && (
          <Card title="Suggestions 💡">
            {result.suggestions.map((suggestion, i) => (
              <View key={i} style={s.item}>
                <View style={[s.dot, { backgroundColor: colors.primary }]} />
                <Text style={s.itemText}>{suggestion}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <Text style={s.title}>Reel Readiness</Text>
      <Text style={s.subtitle}>Check your reel before publishing</Text>

      {accounts.length > 0 && (
        <Card title="Instagram Account">
          {accounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={s.accOption}
              onPress={() => setSelectedAccount(acc.id)}
            >
              <View style={[s.radioCircle, selectedAccount === acc.id && s.radioActive]} />
              <Text style={s.accOptionText}>@{acc.username}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      <Button title="Select Reel & Analyze" onPress={pickAndCheck} loading={uploading} />

      {!loadingHistory && history.length > 0 && (
        <>
          <Text style={s.historyTitle}>Previous Checks</Text>
          {history.slice(0, 5).map((h) => (
            <Card key={h.id} style={s.historyCard}>
              <View style={s.historyRow}>
                <Text style={s.historyDate}>{new Date(h.created_at).toLocaleDateString()}</Text>
                {h.score != null && (
                  <Text style={[s.historyScore, { color: h.score >= 70 ? colors.success : h.score >= 40 ? colors.warning : colors.error }]}>
                    {h.score}/100
                  </Text>
                )}
              </View>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, gap: spacing.md },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: font.base, color: colors.textMuted, marginBottom: spacing.xl },
  uploadingText: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  uploadingSub: { fontSize: font.base, color: colors.textMuted },
  accOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  accOptionText: { fontSize: font.base, color: colors.text },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  backText: { color: colors.primary, fontSize: font.base },
  resultTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  scoreCard: { alignItems: 'center', paddingVertical: spacing.xl },
  scoreLabel: { fontSize: font.sm, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.sm },
  scoreValue: { fontSize: 56, fontWeight: '800', lineHeight: 64 },
  scoreMax: { fontSize: font.base, color: colors.textMuted },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  itemText: { flex: 1, fontSize: font.base, color: colors.text, lineHeight: 22 },
  historyTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  historyCard: { marginBottom: spacing.xs },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  historyDate: { fontSize: font.base, color: colors.textMuted },
  historyScore: { fontSize: font.base, fontWeight: '700' },
});
