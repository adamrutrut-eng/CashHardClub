import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { T } from './T';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  dimmed?: boolean;
}

/** The website's .chip — a thin gold-lined tag. Tappable when onPress is given. */
export function Chip({ label, selected, onPress, dimmed }: ChipProps) {
  const body = (
    <View style={[styles.chip, selected && styles.selected, dimmed && styles.dimmed]}>
      <T variant="label" style={[styles.text, selected && styles.selectedText]} numberOfLines={1}>
        {label}
      </T>
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      hitSlop={6}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(200,160,74,0.35)',
    paddingVertical: 9,
    paddingHorizontal: 13,
    minHeight: 36,
    justifyContent: 'center',
  },
  selected: { backgroundColor: 'rgba(200,160,74,0.14)', borderColor: colors.accent },
  dimmed: { opacity: 0.45 },
  text: { fontSize: 11, letterSpacing: 1.6, color: colors.body },
  selectedText: { color: colors.accentHover },
});
