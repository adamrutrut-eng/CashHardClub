import React, { type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';
import { useLayout } from '@/theme/layout';
import { Grain } from './Grain';

interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a ScrollView (default: plain flex container for lists). */
  scroll?: boolean;
  /** Apply the responsive horizontal inset (default true). */
  padded?: boolean;
  /** Add the bottom safe-area inset (use on stack screens that have no tab bar). */
  bottomInset?: boolean;
  header?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: ViewStyle;
}

/** Safe-area aware screen shell: black background, top inset, optional scroll, grain overlay. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  bottomInset = false,
  header,
  refreshing,
  onRefresh,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { horizontalInset } = useLayout();
  const paddingBottom = (bottomInset ? insets.bottom : 0) + 32;
  const paddingHorizontal = padded ? horizontalInset : 0;

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top }} />
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[{ paddingHorizontal, paddingBottom }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
                progressBackgroundColor={colors.surface2}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, { paddingHorizontal }, contentStyle]}>{children}</View>
      )}
      <Grain />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
});
