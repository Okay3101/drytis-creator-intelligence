import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, View,
} from 'react-native';
import { colors, radius, spacing, font, shadows } from '../utils/theme';

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
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      style={[
        s.base,
        isPrimary && s.primary,
        isSecondary && s.secondary,
        isDanger && s.danger,
        isGhost && s.ghost,
        (disabled || loading) && s.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
    >
      {(isPrimary || isDanger || isSecondary) && <View style={s.topHighlight} />}

      {loading ? (
        <ActivityIndicator color={isGhost || isSecondary ? colors.primary : colors.white} size="small" />
      ) : (
        <Text style={[
          s.text,
          isPrimary && s.primaryText,
          isSecondary && s.secondaryText,
          isDanger && s.dangerText,
          isGhost && s.ghostText,
          textStyle,
        ]}>
          {title}
        </Text>
      )}

      {(isPrimary || isDanger) && <View style={s.bottomShadow} />}
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
    overflow: 'hidden',
    position: 'relative',
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    borderTopColor: 'rgba(255,255,255,0.3)',
    ...shadows.button,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: '#B91C1C',
    borderTopColor: 'rgba(255,255,255,0.25)',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabled: { opacity: 0.45 },
  topHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bottomShadow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(0,0,0,0.15)',
  },
  text: { fontSize: font.base, fontWeight: '700', letterSpacing: 0.3 },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.text },
  ghostText: { color: colors.primary },
  dangerText: { color: colors.white },
});
