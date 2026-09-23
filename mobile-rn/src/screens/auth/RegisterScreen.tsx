import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authApi, AccountType } from '../../api/auth';
import { colors, spacing, font, radius, shadows } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('creator');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({ name: name.trim(), email: email.trim(), password, account_type: accountType });
      navigation.navigate('Otp', { email: email.trim() });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.glowOrb} />

        <View style={s.header}>
          <View style={s.logoPlate}>
            <View style={s.logoHighlight} />
            <Text style={s.logo}>drytis</Text>
            <View style={s.logoShadowLine} />
          </View>
          <Text style={s.subtitle}>Create your account</Text>
        </View>

        <View style={s.formCard}>
          <View style={s.formCardHighlight} />

          <Text style={s.sectionLabel}>I am a...</Text>
          <View style={s.typeRow}>
            {(['creator', 'brand'] as AccountType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.typeBtn, accountType === t && s.typeBtnActive]}
                onPress={() => setAccountType(t)}
                activeOpacity={0.8}
              >
                <View style={s.typeBtnHighlight} />
                <Text style={[s.typeBtnText, accountType === t && s.typeBtnTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Full name" value={name} onChangeText={setName} placeholder="Jane Doe" />
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Min. 8 characters" />
          <Button title="Create Account" onPress={onRegister} loading={loading} />
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={s.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },

  glowOrb: {
    position: 'absolute', top: -60, alignSelf: 'center',
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: colors.primaryGlow,
  },

  header: { alignItems: 'center', marginBottom: spacing.xl, zIndex: 1 },
  logoPlate: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderRadius: radius.xl, backgroundColor: colors.surfaceRaised,
    borderWidth: 1, borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: spacing.sm, overflow: 'hidden', ...shadows.raised,
  },
  logoHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.95)' },
  logoShadowLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  logo: { fontSize: 38, fontWeight: '800', color: colors.primary, letterSpacing: 2, textShadowColor: colors.primaryGlow, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  subtitle: { fontSize: font.sm, color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },

  formCard: {
    backgroundColor: colors.surfaceRaised, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)', borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: spacing.xl, overflow: 'hidden', ...shadows.raised,
  },
  formCardHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.95)' },

  sectionLabel: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600', marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  typeBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)', borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: colors.surfaceDepressed, alignItems: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  typeBtnActive: {
    borderColor: colors.primary, borderTopColor: 'rgba(255,255,255,0.95)',
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primary, shadowOpacity: 0.2,
  },
  typeBtnHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.9)' },
  typeBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: font.base },
  typeBtnTextActive: { color: colors.primary },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  footerText: { color: colors.textMuted, fontSize: font.base },
  footerLink: { color: colors.primary, fontSize: font.base, fontWeight: '700' },
});
