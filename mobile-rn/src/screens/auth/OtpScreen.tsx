import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { authApi } from '../../api/auth';
import { useAuth } from '../../store/auth';
import { colors, spacing, font, radius, shadows } from '../../utils/theme';

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
      const { data } = await authApi.verifyOtp({ email, code });
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
        <View style={s.glowOrb} />

        <View style={s.panel}>
          <View style={s.panelHighlight} />
          <Text style={s.title}>Verify your email</Text>
          <Text style={s.subtitle}>Enter the 6-digit code sent to{'\n'}{email}</Text>

          <View style={s.otpRow}>
            {otp.map((digit, i) => (
              <View key={i} style={[s.digitWell, digit ? s.digitWellFilled : null]}>
                <View style={s.digitInsetTop} />
                <TextInput
                  ref={(r) => { inputs.current[i] = r; }}
                  style={s.digitInput}
                  value={digit}
                  onChangeText={(v) => handleChange(v.replace(/\D/g, '').slice(-1), i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
                <View style={s.digitInsetBottom} />
              </View>
            ))}
          </View>

          <Button title="Verify Code" onPress={onVerify} loading={loading} style={s.btn} />

          <TouchableOpacity onPress={onResend} disabled={resending} style={s.resendRow}>
            <Text style={s.resendText}>{resending ? 'Sending...' : "Didn't receive it? Resend code"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center' },

  glowOrb: {
    position: 'absolute', top: 40, alignSelf: 'center',
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: colors.primaryGlow,
  },

  panel: {
    width: '100%',
    backgroundColor: colors.surfaceRaised, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)', borderBottomColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center', overflow: 'hidden', ...shadows.raised,
  },
  panelHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.95)' },

  title: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: font.base, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },

  otpRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  digitWell: {
    width: 46, height: 54, borderRadius: radius.md,
    backgroundColor: colors.surfaceDepressed,
    borderWidth: 1, borderColor: colors.border,
    borderTopColor: 'rgba(0,0,0,0.12)', borderBottomColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  digitWellFilled: {
    borderColor: colors.primary,
    borderTopColor: 'rgba(254,91,172,0.3)',
    backgroundColor: colors.primaryLight,
  },
  digitInsetTop: { height: 1, backgroundColor: 'rgba(0,0,0,0.07)' },
  digitInsetBottom: { height: 1, backgroundColor: 'rgba(255,255,255,0.8)' },
  digitInput: {
    flex: 1, color: colors.text, fontSize: font.xl,
    fontWeight: '700', textAlign: 'center',
  },

  btn: { width: '100%' },
  resendRow: { marginTop: spacing.lg },
  resendText: { color: colors.primary, fontSize: font.sm },
  backRow: { marginTop: spacing.md },
  backText: { color: colors.textMuted, fontSize: font.sm },
});
