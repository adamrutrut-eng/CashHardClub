import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, space } from '@/theme/tokens';
import { usePushState } from '@/lib/push';
import { T } from './T';
import { GoldButton } from './GoldButton';

const KEY = 'chc.alerts.banner.dismissed.v1';

/** Soft, dismissible nudge shown on the shop until alerts are on. Never triggers the OS prompt itself. */
export function AlertsBanner() {
  const push = usePushState();
  const router = useRouter();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => setDismissed(v === '1'))
      .catch(() => setDismissed(false));
  }, []);

  if (dismissed !== false || !push.available || !push.configured || !push.loaded || push.enabled) return null;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.row}>
        <Ionicons name="notifications-outline" size={18} color={colors.accent} />
        <T variant="bodyStrong" style={styles.title}>
          Drop alerts are off
        </T>
        <Pressable
          onPress={() => {
            setDismissed(true);
            AsyncStorage.setItem(KEY, '1').catch(() => {});
          }}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <Ionicons name="close" size={18} color={colors.dim} />
        </Pressable>
      </View>
      <T variant="small" style={styles.body}>
        Be first when a new piece or event drops. You choose — turn it on in one tap, off any time.
      </T>
      <GoldButton label="Turn on drop alerts" variant="outline" compact onPress={() => router.navigate('/alerts')} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: space.lg, marginTop: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  title: { flex: 1 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { marginTop: space.sm },
  btn: { marginTop: space.md, alignSelf: 'flex-start' },
});
