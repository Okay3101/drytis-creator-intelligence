import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { accountApi } from '../../api/account';
import { useAuth } from '../../store/auth';
import { colors, spacing, font } from '../../utils/theme';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Name cannot be empty.'); return; }
    setLoading(true);
    try {
      await accountApi.updateProfile({ name: name.trim() });
      await refreshUser();
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.title}>Edit Profile</Text>
        </View>
        <Input label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
        <Input label="Email" value={user?.email ?? ''} onChangeText={() => {}} editable={false} />
        <Button title="Save Changes" onPress={onSave} loading={loading} />
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl + spacing.lg },
  header: { marginBottom: spacing.xl },
  title: { fontSize: font.xxl, fontWeight: '700', color: colors.text },
});
