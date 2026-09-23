import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { authApi } from '../../api/auth';
import { useAuth } from '../../store/auth';
import { colors, spacing, font, radius } from '../../utils/theme';

type Nav = NativeStackNavigationProp<any>;
type OtpRoute = RouteProp<{ Otp: { email: string } }, 'Otp'>;

export default function OtpScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<OtpRoute>();
  const { email } = route.params;
  const { signIn } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<any[]>([]);

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const onVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Invalid code', 'Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp({ email, otp: code });
      await signIn(data.token, data.user);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp({ email });
      Alert.alert('Sent', 'A new code has been sent to your email.');
    } catch {
      Alert.alert('Error', 'Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        <Text style={s.title}>Verify your email</Text>
        <Text style={s.subtitle}>Enter the 6-digit code sent to{'\n'}{email}</Text>

        <View style={s.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => { inputs.current[i] = r; }}
              style={[s.otpInput, digit ? s.otpFilled : null]}
              value={digit}
              onChangeText={(v) => handleChange(v.replace(/\D/g, '').slice(-1), i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button title="Verify" onPress={onVerify} loading={loading} style={s.btn} />

        <TouchableOpacity onPress={onResend} disabled={resending} style={s.resendRow}>
          <Text style={s.resendText}>{resending ? 'Sending...' : "Didn't receive it? Resend code"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: font.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: font.base, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  otpRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  otpInput: {
    width: 48, height: 56, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    color: colors.text, fontSize: font.xl,
    textAlign: 'center', fontWeight: '700',
  },
  otpFilled: { borderColor: colors.primary },
  btn: { width: '100%' },
  resendRow: { marginTop: spacing.lg },
  resendText: { color: colors.primary, fontSize: font.sm },
  backRow: { marginTop: spacing.md },
  backText: { color: colors.textMuted, fontSize: font.sm },
});
