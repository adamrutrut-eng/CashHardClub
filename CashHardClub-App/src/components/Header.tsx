import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { useLayout } from '@/theme/layout';
import { T } from './T';
import { tap } from '@/lib/haptics';

interface HeaderProps {
  title?: string;
  eyebrow?: string;
  /** Show a back chevron (stack screens). Falls back to the shop if there is no history. */
  back?: boolean;
  right?: ReactNode;
}

export function Header({ title, eyebrow, back, right }: HeaderProps) {
  const router = useRouter();
  const { horizontalInset } = useLayout();
  const goBack = () => {
    tap();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return (
    <View style={[styles.bar, { paddingHorizontal: Math.max(horizontalInset - 8, 8) }]}>
      <View style={styles.side}>
        {back ? (
          <Pressable
            onPress={goBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.center} pointerEvents="none">
        {eyebrow ? <T variant="eyebrow" center numberOfLines={1}>{eyebrow}</T> : null}
        {title ? (
          <T variant="heading" center numberOfLines={1} style={styles.title}>
            {title}
          </T>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  side: { width: 88, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { letterSpacing: 2, textTransform: 'uppercase' },
  iconBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
