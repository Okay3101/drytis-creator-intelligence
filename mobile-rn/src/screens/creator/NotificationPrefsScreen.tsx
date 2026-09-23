import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { accountApi } from '../../api/account';
import { colors, spacing, font } from '../../utils/theme';

const PREFS = [
  { key: 'diagnosis_complete', label: 'Diagnosis Complete', desc: 'When your content analysis finishes' },
  { key: 'trend_alerts', label: 'Trend Alerts', desc: 'New trends matching your niche' },
  { key: 'campaign_updates', label: 'Campaign Updates', desc: 'New campaigns and application status' },
  { key: 'support_replies', label: 'Support Replies', desc: 'When support responds to you' },
  { key: 'weekly_insights', label: 'Weekly Insights', desc: 'Weekly performance summary' },
];

export default function NotificationPrefsScreen() {
  const navigation = useNavigation();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const defaults: Record<string, boolean> = {};
    PREFS.forEach((p) => { defaults[p.key] = true; });
    setPrefs(defaults);
  }, []);

  const onSave = async () => {
    setLoading(true);
    try {
      await accountApi.updateNotificationPrefs(prefs);
      Alert.alert('Saved', 'Notification preferences updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <Text style={s.title}>Notifications</Text>
      <Card>
        {PREFS.map((pref, i) => (
          <View key={pref.key} style={[s.row, i < PREFS.length - 1 && s.rowBorder]}>
            <View style={s.rowInfo}>
              <Text style={s.rowLabel}>{pref.label}</Text>
              <Text style={s.rowDesc}>{pref.desc}</Text>
            </View>
            <Switch
              value={prefs[pref.key] ?? true}
              onValueChange={(v) => setPrefs((prev) => ({ ...prev, [pref.key]: v }))}
              trackColor={{ true: colors.primary }}
            />
          </View>
        ))}
      </Card>
      <Button title="Save" onPress={onSave} loading={loading} />
      <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  title: { fontSize: font.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: font.base, fontWeight: '600', color: colors.text },
  rowDesc: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
});
