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
      <View style={[s.well, error ? s.wellError : null, !editable && s.wellDisabled]}>
        <View style={s.insetTop} />
        <TextInput
          style={[s.input, multiline && s.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
        <View style={s.insetBottom} />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginBottom: spacing.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  well: {
    backgroundColor: colors.surfaceDepressed,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(0,0,0,0.12)',
    borderBottomColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 0,
  },
  wellError: { borderColor: colors.error },
  wellDisabled: { opacity: 0.5 },
  insetTop: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)' },
  insetBottom: { height: 1, backgroundColor: 'rgba(255,255,255,0.8)' },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: font.base,
    minHeight: 50,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  error: { color: colors.error, fontSize: font.sm, marginTop: spacing.xs },
});
