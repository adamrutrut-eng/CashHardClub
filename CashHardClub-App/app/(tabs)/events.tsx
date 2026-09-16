import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { useContent } from '@/data/ContentProvider';
import { splitEvents } from '@/data/events';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Wordmark } from '@/components/Wordmark';
import { EventCard } from '@/components/EventCard';
import { EmptyState } from '@/components/EmptyState';

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={styles.section}>
      <T variant="eyebrow">{label}</T>
      <View style={styles.rule} />
    </View>
  );
}

export default function EventsScreen() {
  const { events, status, refresh } = useContent();
  const router = useRouter();
  const { upcoming, past } = useMemo(() => splitEvents(events), [events]);

  return (
    <Screen scroll refreshing={status === 'refreshing'} onRefresh={refresh}>
      <View style={styles.header}>
        <Wordmark size="sm" />
        <T variant="eyebrow" style={styles.eyebrow}>
          Events & tickets
        </T>
        <T variant="display" accessibilityRole="header">
          The Calendar
        </T>
        <T style={styles.sub}>
          Nights, pop-ups and drops. Tickets sell through the official store — drop alerts hear about them first.
        </T>
      </View>

      <SectionLabel label="Upcoming" />
      {upcoming.length > 0 ? (
        <View style={styles.stack}>
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} onPress={() => router.push({ pathname: '/event/[id]', params: { id: e.id } })} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="calendar-outline"
          title="Nothing on the calendar yet"
          body="The next event or drop is announced here — and by push first, if your alerts are on."
          action={{ label: 'Turn on drop alerts', icon: 'notifications-outline', onPress: () => router.navigate('/alerts') }}
        />
      )}

      {past.length > 0 ? (
        <>
          <SectionLabel label="Past" />
          <View style={styles.stack}>
            {past.map((e) => (
              <EventCard key={e.id} event={e} compact onPress={() => router.push({ pathname: '/event/[id]', params: { id: e.id } })} />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.md },
  eyebrow: { marginTop: space.xl },
  sub: { marginTop: space.md, maxWidth: 560 },
  section: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.xxl, marginBottom: space.md },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  stack: { gap: space.md },
});
