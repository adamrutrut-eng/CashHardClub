import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fonts } from '@/theme/tokens';
import { T } from './T';

/** The brand wordmark — always three spaced words, always uppercase. */
export function Wordmark({ size = 'md', center }: { size?: 'sm' | 'md' | 'lg'; center?: boolean }) {
  const fontSize = size === 'lg' ? 26 : size === 'md' ? 18 : 13;
  return (
    <View style={center && styles.center}>
      <T
        variant="title"
        center={center}
        style={{ fontFamily: fonts.display, fontSize, lineHeight: fontSize * 1.25, letterSpacing: fontSize * 0.22, color: colors.accent }}
        accessibilityRole="header"
      >
        CASH HARD CLUB
      </T>
      {size !== 'sm' ? (
        <T variant="eyebrow" center={center} style={styles.est}>
          Est. MMXXIV
        </T>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  est: { marginTop: 4, color: colors.dim },
});
