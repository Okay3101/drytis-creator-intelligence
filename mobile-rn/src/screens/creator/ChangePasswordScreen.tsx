import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { accountApi } from '../../api/account';
import { colors, spacing, font } from '../../utils/theme';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!current || !next || !confirm) { Alert.alert('Required', 'Please fill in all fields.'); return; }
    if (next !== confirm) { Alert.alert('Mismatch', 'New passwords do not match.'); return; }
    if (next.length < 8) { Alert.alert('Too short', 'Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await accountApi.updatePassword({ current_password: current, password: next, password_confirmation: confirm });
      Alert.alert('Updated', 'Your password has been changed.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Change Password</Text>
        <Input label="Current password" value={current} onChangeText={setCurrent} secureTextEntry />
        <Input label="New password" value={next} onChangeText={setNext} secureTextEntry />
        <Input label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        <Button title="Update Password" onPress={onSave} loading={loading} />
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  title: { fontSize: font.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.xl },
});
