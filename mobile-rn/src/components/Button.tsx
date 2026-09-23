import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, radius, spacing, font } from '../utils/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style, textStyle }: Props) {
  const vs = variant === 'primary' ? s.primary
    : variant === 'secondary' ? s.secondary
    : variant === 'danger' ? s.danger
    : s.ghost;
  const ts = variant === 'primary' ? s.primaryText
    : variant === 'ghost' ? s.ghostText
    : variant === 'danger' ? s.dangerText
    : s.secondaryText;

  return (
    <TouchableOpacity
      style={[s.base, vs, (disabled || loading) && s.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} size="small" />
      ) : (
        <Text style={[s.text, ts, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  disabled: { opacity: 0.5 },
  text: { fontSize: font.base, fontWeight: '600' },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.text },
  ghostText: { color: colors.primary },
  dangerText: { color: colors.white },
});
