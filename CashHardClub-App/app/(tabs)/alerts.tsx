import React, { useState } from 'react';
import { Linking, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { PRIVACY_URL } from '@/data/content';
import { openInAppBrowser } from '@/lib/browser';
import { success, tap } from '@/lib/haptics';
import { useInterests, usePushState } from '@/lib/push';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Wordmark } from '@/components/Wordmark';
import { Chip } from '@/components/Chip';
import { GoldButton } from '@/components/GoldButton';
import { Row } from '@/components/Row';

export default function AlertsScreen() {
  const push = usePushState();
  const [interests, setInterest] = useInterests();
  const [busy, setBusy] = useState(false);

  const enabled = push.enabled;
  const denied = push.available && push.configured && push.loaded && !push.permission && !push.canRequest;

  const onToggle = async (next: boolean) => {
    if (busy) return;
    setBusy(true);
    tap();
    try {
      if (next) {
        const ok = await push.enable();
        if (ok) success();
      } else {
        await push.disable();
      }
    } finally {
      setBusy(false);
    }
  };

  const statusText = !push.available
    ? 'Available in the installed app'
    : !push.configured
      ? 'Not available right now'
      : !push.loaded
        ? 'Checking…'
        : enabled
          ? 'On — you hear first.'
          : 'Off — turn on to be first.';

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Wordmark size="sm" />
        <T variant="eyebrow" style={styles.eyebrow}>
          Push notifications
        </T>
        <T variant="display" accessibilityRole="header">
          Drop Alerts
        </T>
        <T style={styles.sub}>
          When a new piece lands in the vault or an event goes on sale, alerts go out first — before Instagram. We only send
          when something drops.
        </T>
      </View>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.iconRing}>
            <Ionicons name={enabled ? 'notifications' : 'notifications-off-outline'} size={20} color={colors.accent} />
          </View>
          <View style={styles.cardText}>
            <T variant="heading">Drop alerts</T>
            <T variant="small">{statusText}</T>
          </View>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            disabled={busy || !push.available || !push.configured || !push.loaded}
            trackColor={{ true: colors.accent, false: '#3a3a3a' }}
            thumbColor={enabled ? colors.text : '#cfcfcf'}
            ios_backgroundColor="#3a3a3a"
            accessibilityLabel="Drop alerts"
            accessibilityHint="Sends a notification when a new piece or event drops"
          />
        </View>
        <T variant="small" style={styles.consent}>
          By turning this on you agree to receive promotional notifications from CASH HARD CLUB about new pieces and events.
          Switch it off here any time, or in your phone's notification settings.
        </T>
      </View>

      {denied ? (
        <View style={styles.notice}>
          <T variant="bodyStrong">Notifications are turned off for Cash Hard Club in your phone's settings.</T>
          <T variant="small" style={styles.noticeBody}>
            Allow notifications there, then come back and flip the switch.
          </T>
          <GoldButton label="Open settings" variant="outline" compact icon="settings-outline" onPress={() => Linking.openSettings()} style={styles.noticeBtn} />
        </View>
      ) : null}

      {!push.available ? (
        <View style={styles.notice}>
          <T variant="small">
            Push notifications run in the installed app (development build, TestFlight or the store version), not inside
            Expo Go. Everything else works here.
          </T>
        </View>
      ) : null}

      <T variant="eyebrow" style={styles.sectionLabel}>
        What you'll hear about
      </T>
      <View style={styles.chips}>
        <Chip label="New drops" selected={interests.drops} dimmed={!enabled} onPress={() => setInterest('drops', !interests.drops)} />
        <Chip label="Events & tickets" selected={interests.events} dimmed={!enabled} onPress={() => setInterest('events', !interests.events)} />
      </View>
      <T variant="small" style={styles.hint}>
        Pick what matters to you. We never send more than a drop deserves.
      </T>

      <View style={styles.links}>
        <Row
          icon="shield-checkmark-outline"
          title="Privacy policy"
          subtitle="What the app collects (very little) and why"
          onPress={() => openInAppBrowser(PRIVACY_URL)}
          external
          last
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.md },
  eyebrow: { marginTop: space.xl },
  sub: { marginTop: space.md, maxWidth: 560 },
  card: { marginTop: space.xl, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: space.lg },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  iconRing: { width: 40, height: 40, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 2 },
  consent: { marginTop: space.md },
  notice: { marginTop: space.md, borderWidth: 1, borderColor: colors.lineSoft, padding: space.lg, backgroundColor: colors.surface },
  noticeBody: { marginTop: 4 },
  noticeBtn: { marginTop: space.md, alignSelf: 'flex-start' },
  sectionLabel: { marginTop: space.xxl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  hint: { marginTop: space.md },
  links: { marginTop: space.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lineSoft },
});
