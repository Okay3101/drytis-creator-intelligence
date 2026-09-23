import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authApi } from '../../api/auth';
import { useAuth } from '../../store/auth';
import { colors, spacing, font, radius, shadows } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.login({ email: email.trim(), password });
      await signIn(data.token, data.user);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Login failed.');
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
          <Text style={s.subtitle}>Creator Intelligence</Text>
        </View>

        <View style={s.formCard}>
          <View style={s.formCardHighlight} />
          <Text style={s.title}>Welcome back</Text>
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.forgotRow}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
          <Button title="Sign In" onPress={onLogin} loading={loading} />
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={s.footerLink}>Sign up</Text>
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
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primaryGlow,
  },

  header: { alignItems: 'center', marginBottom: spacing.xxl, zIndex: 1 },
  logoPlate: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.raised,
  },
  logoHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(255,255,255,0.95)',
  },
  logoShadowLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(0,0,0,0.08)',
  },
  logo: {
    fontSize: 38, fontWeight: '800', color: colors.primary, letterSpacing: 2,
    textShadowColor: colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: { fontSize: font.sm, color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },

  formCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.raised,
  },
  formCardHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(255,255,255,0.95)',
  },
  title: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  forgotRow: { alignItems: 'flex-end', marginBottom: spacing.lg, marginTop: -spacing.xs },
  forgotText: { color: colors.primary, fontSize: font.sm },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  footerText: { color: colors.textMuted, fontSize: font.base },
  footerLink: { color: colors.primary, fontSize: font.base, fontWeight: '700' },
});
