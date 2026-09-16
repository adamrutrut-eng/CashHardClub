import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from './T';
import { tap } from '@/lib/haptics';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface RowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  external?: boolean;
  last?: boolean;
}

/** Settings-style list row (the website's #ledger table, made tappable). */
export function Row({ icon, title, subtitle, onPress, external, last }: RowProps) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={({ pressed }) => [styles.row, !last && styles.divider, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.text}>
        <T variant="bodyStrong" numberOfLines={1}>
          {title}
        </T>
        {subtitle ? (
          <T variant="small" numberOfLines={2}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {onPress ? (
        <Ionicons name={external ? 'open-outline' : 'chevron-forward'} size={18} color={colors.dim} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 14,
    minHeight: 56,
  },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineSoft },
  pressed: { opacity: 0.6 },
  iconWrap: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  text: { flex: 1 },
});
