import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { scriptsApi, Script } from '../../api/scripts';
import { colors, spacing, font, radius } from '../../utils/theme';

type Step = 'form' | 'result';

export default function CreateScreen() {
  const [step, setStep] = useState<Step>('form');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [duration, setDuration] = useState('60');
  const [voiceoverMode, setVoiceoverMode] = useState(false);
  const [includeHooks, setIncludeHooks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<Script | null>(null);
  const [reviseInstruction, setReviseInstruction] = useState('');
  const [revising, setRevising] = useState(false);

  const tones = ['casual', 'professional', 'funny', 'educational', 'inspirational'];

  const onGenerate = async () => {
    if (!topic.trim()) { Alert.alert('Required', 'Please enter a topic.'); return; }
    setLoading(true);
    try {
      const { data } = await scriptsApi.generate({
        topic: topic.trim(),
        tone,
        duration_seconds: parseInt(duration) || 60,
        voiceover_mode: voiceoverMode,
        include_hooks: includeHooks,
      });
      setScript(data.data);
      setStep('result');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not generate script.');
    } finally {
      setLoading(false);
    }
  };

  const onRevise = async () => {
    if (!script || !reviseInstruction.trim()) return;
    setRevising(true);
    try {
      const { data } = await scriptsApi.revise(script.id, { instruction: reviseInstruction.trim() });
      setScript(data.data);
      setReviseInstruction('');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not revise script.');
    } finally {
      setRevising(false);
    }
  };

  if (step === 'result' && script) {
    return (
      <ScrollView style={s.scroll} contentContainerStyle={s.container}>
        <View style={s.resultHeader}>
          <TouchableOpacity onPress={() => { setStep('form'); setScript(null); }}>
            <Text style={s.backText}>← New Script</Text>
          </TouchableOpacity>
          <Text style={s.resultTitle}>Your Script</Text>
        </View>

        <Card title="Hook 🎣">
          <Text style={s.scriptText}>{script.hook}</Text>
        </Card>
        <Card title="Body 📝">
          <Text style={s.scriptText}>{script.body}</Text>
        </Card>
        <Card title="Call to Action 📣">
          <Text style={s.scriptText}>{script.cta}</Text>
        </Card>

        <Card title="Revise Script">
          <Input
            value={reviseInstruction}
            onChangeText={setReviseInstruction}
            placeholder="e.g. Make it funnier, add more data points..."
            multiline
            numberOfLines={3}
          />
          <Button title="Revise" onPress={onRevise} loading={revising} variant="secondary" />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <Text style={s.title}>Script Generator</Text>
      <Text style={s.subtitle}>AI-powered scripts tailored to your style</Text>

      <Input
        label="Topic / Idea"
        value={topic}
        onChangeText={setTopic}
        placeholder="e.g. 5 morning habits that changed my life"
        multiline
        numberOfLines={2}
      />

      <Text style={s.fieldLabel}>Tone</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.toneRow}>
        {tones.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.toneChip, tone === t && s.toneChipActive]}
            onPress={() => setTone(t)}
          >
            <Text style={[s.toneText, tone === t && s.toneTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Input label="Duration (seconds)" value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="60" />

      <View style={s.toggleRow}>
        <View style={s.toggleInfo}>
          <Text style={s.toggleLabel}>Voiceover Mode</Text>
          <Text style={s.toggleSub}>Optimized for narration over footage</Text>
        </View>
        <Switch value={voiceoverMode} onValueChange={setVoiceoverMode} trackColor={{ true: colors.primary }} />
      </View>

      <View style={s.toggleRow}>
        <View style={s.toggleInfo}>
          <Text style={s.toggleLabel}>Include Hooks</Text>
          <Text style={s.toggleSub}>Add attention-grabbing opening hooks</Text>
        </View>
        <Switch value={includeHooks} onValueChange={setIncludeHooks} trackColor={{ true: colors.primary }} />
      </View>

      <Button title="Generate Script" onPress={onGenerate} loading={loading} style={s.generateBtn} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: font.base, color: colors.textMuted, marginBottom: spacing.xl },
  fieldLabel: { fontSize: font.sm, fontWeight: '500', color: colors.textMuted, marginBottom: spacing.sm },
  toneRow: { marginBottom: spacing.md },
  toneChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surfaceAlt, marginRight: spacing.sm,
  },
  toneChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  toneText: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600' },
  toneTextActive: { color: colors.primary },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  toggleInfo: { flex: 1, marginRight: spacing.md },
  toggleLabel: { fontSize: font.base, fontWeight: '600', color: colors.text },
  toggleSub: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  generateBtn: { marginTop: spacing.md },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  backText: { color: colors.primary, fontSize: font.base },
  resultTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  scriptText: { fontSize: font.base, color: colors.text, lineHeight: 26 },
});
