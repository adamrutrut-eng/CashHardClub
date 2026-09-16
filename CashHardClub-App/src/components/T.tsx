import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'eyebrow'
  | 'body'
  | 'bodyStrong'
  | 'muted'
  | 'small'
  | 'label'
  | 'price';

export interface TProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
}

/**
 * Brand text. Respects Dynamic Type / Android font scaling, but caps the multiplier
 * so display type can't blow the layout apart (body up to 1.6x, display up to 1.3x).
 */
export function T({ variant = 'body', color, center, style, ...rest }: TProps) {
  const isDisplay = variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <Text
      maxFontSizeMultiplier={isDisplay ? 1.3 : 1.6}
      {...rest}
      style={[styles.base, styles[variant], color ? { color } : null, center ? styles.center : null, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: colors.body, fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  center: { textAlign: 'center' },
  display: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: colors.text,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.text, letterSpacing: 1 },
  heading: { fontFamily: fonts.displaySemi, fontSize: 15, lineHeight: 20, color: colors.text, letterSpacing: 0.6 },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  body: {},
  bodyStrong: { fontFamily: fonts.sansMedium, color: colors.text },
  muted: { color: colors.dim, fontSize: 13, lineHeight: 19 },
  small: { fontSize: 12, lineHeight: 17, color: colors.dim },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.text,
  },
  price: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 20, color: colors.accentHover, letterSpacing: 0.4 },
});
