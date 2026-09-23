import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, font } from '../utils/theme';

interface Props {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  style?: ViewStyle;
  editable?: boolean;
}

export function Input({
  label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType = 'default', autoCapitalize = 'sentences',
  multiline, numberOfLines, error, style, editable = true,
}: Props) {
  return (
    <View style={[s.container, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        style={[s.input, multiline && s.multiline, error ? s.inputError : null, !editable && s.disabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: font.sm, marginBottom: spacing.xs, fontWeight: '500' },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: font.base,
    minHeight: 52,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: colors.error },
  disabled: { opacity: 0.6 },
  error: { color: colors.error, fontSize: font.sm, marginTop: spacing.xs },
});
