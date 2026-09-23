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
import { colors, spacing, font, radius } from '../../utils/theme';

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
        <View style={s.header}>
          <Text style={s.logo}>drytis</Text>
          <Text style={s.subtitle}>Create your account</Text>
        </View>

        <View style={s.form}>
          <Text style={s.sectionLabel}>I am a...</Text>
          <View style={s.typeRow}>
            {(['creator', 'brand'] as AccountType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.typeBtn, accountType === t && s.typeBtnActive]}
                onPress={() => setAccountType(t)}
              >
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
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 40, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: font.base, color: colors.textMuted, marginTop: spacing.xs },
  form: { marginBottom: spacing.xl },
  sectionLabel: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600', marginBottom: spacing.sm },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  typeBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surfaceAlt, alignItems: 'center',
  },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  typeBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: font.base },
  typeBtnTextActive: { color: colors.primary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  footerText: { color: colors.textMuted, fontSize: font.base },
  footerLink: { color: colors.primary, fontSize: font.base, fontWeight: '600' },
});
