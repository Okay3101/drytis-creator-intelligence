import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, font, shadows } from '../utils/theme';

interface Props {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ title, children, style }: Props) {
  return (
    <View style={[s.outer, style]}>
      <View style={s.card}>
        <View style={s.topHighlight} />
        {title ? <Text style={s.title}>{title}</Text> : null}
        {children}
        <View style={s.bottomShadow} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    ...shadows.card,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(255,255,255,0.95)',
  },
  bottomShadow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(0,0,0,0.07)',
  },
  title: {
    color: colors.text,
    fontSize: font.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
});
