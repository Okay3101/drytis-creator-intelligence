import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { colors, spacing, font, radius } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

export default function CreateCampaignScreen() {
  const navigation = useNavigation<Nav>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [niche, setNiche] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');

  const onCreate = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Required', 'Please fill in title and description.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/brand/campaigns', {
        title: title.trim(),
        description: description.trim(),
        budget: parseFloat(budget) || null,
        niche: niche.trim() || null,
        deliverables: deliverables.trim() || null,
        min_followers: parseInt(minFollowers) || null,
      });
      Alert.alert('Created!', 'Your campaign has been published.', [
        { text: 'OK', onPress: () => navigation.navigate('BrandTabs', { screen: 'Campaigns' }) },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not create campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Create Campaign</Text>

        <View style={s.modeRow}>
          {(['basic', 'advanced'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[s.modeBtn, mode === m && s.modeBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[s.modeBtnText, mode === m && s.modeBtnTextActive]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Campaign Title" value={title} onChangeText={setTitle} placeholder="e.g. Summer Collection Launch" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Describe your campaign..." multiline numberOfLines={4} />
        <Input label="Budget ($)" value={budget} onChangeText={setBudget} keyboardType="numeric" placeholder="500" />

        {mode === 'advanced' && (
          <>
            <Input label="Niche / Category" value={niche} onChangeText={setNiche} placeholder="e.g. fitness, fashion, food" />
            <Input label="Deliverables" value={deliverables} onChangeText={setDeliverables} placeholder="e.g. 2 Instagram Reels, 3 Stories" multiline numberOfLines={3} />
            <Input label="Min. Followers" value={minFollowers} onChangeText={setMinFollowers} keyboardType="numeric" placeholder="10000" />
          </>
        )}

        <Button title="Publish Campaign" onPress={onCreate} loading={loading} style={s.submitBtn} />
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  title: { fontSize: font.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.xl },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  modeBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surfaceAlt },
  modeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  modeBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: font.base },
  modeBtnTextActive: { color: colors.primary },
  submitBtn: { marginTop: spacing.md },
});
