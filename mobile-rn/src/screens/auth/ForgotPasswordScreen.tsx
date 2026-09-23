import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authApi } from '../../api/auth';
import { colors, spacing, font } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email.'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {sent ? (
          <View style={s.center}>
            <Text style={s.icon}>📧</Text>
            <Text style={s.title}>Check your email</Text>
            <Text style={s.subtitle}>
              We sent a password reset link to {email}. Follow the instructions in the email.
            </Text>
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} style={s.btn} />
          </View>
        ) : (
          <>
            <Text style={s.title}>Forgot password?</Text>
            <Text style={s.subtitle}>Enter your email and we'll send you a reset link.</Text>
            <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
            <Button title="Send Reset Link" onPress={onSubmit} loading={loading} />
            <Button title="Back to Login" onPress={() => navigation.goBack()} variant="ghost" style={s.backBtn} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  center: { alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: font.base, marginBottom: spacing.xl, lineHeight: 22 },
  btn: { marginTop: spacing.lg },
  backBtn: { marginTop: spacing.sm },
});
