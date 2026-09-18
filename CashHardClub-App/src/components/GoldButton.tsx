import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, GOLD_GRADIENT, radius } from '@/theme/tokens';
import { T } from './T';
import { tap } from '@/lib/haptics';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface GoldButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  icon?: IconName;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

/** The website's gold-foil .btn, as a native button with a ≥48pt touch target. */
export function GoldButton({
  label,
  onPress,
  variant = 'solid',
  disabled,
  icon,
  compact,
  style,
  accessibilityHint,
}: GoldButtonProps) {
  const solid = variant === 'solid';
  const fg = solid ? colors.accentInk : colors.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.btn,
        compact && styles.compact,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {solid ? (
        <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.inner}>
        {icon ? <Ionicons name={icon} size={16} color={fg} style={styles.icon} /> : null}
        <T variant="label" style={{ color: fg }} numberOfLines={1}>
          {label}
        </T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2c176',
    paddingHorizontal: 18,
  },
  compact: { minHeight: 44, paddingHorizontal: 14 },
  outline: { borderColor: colors.accent, backgroundColor: 'transparent' },
  ghost: { borderColor: 'transparent', backgroundColor: 'transparent' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { marginTop: -1 },
  pressed: { transform: [{ translateY: 1 }], opacity: 0.92 },
  disabled: { opacity: 0.75 },
});
