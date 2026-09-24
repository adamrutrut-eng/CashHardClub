import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, space } from '@/theme/tokens';
import { dateParts, formatPrice } from '@/lib/format';
import type { ClubEvent } from '@/data/types';
import { T } from './T';

export function statusLabel(e: ClubEvent): string {
  switch (e.status) {
    case 'on-sale':
      return e.price != null ? `Tickets ${formatPrice(e.price)}` : 'Tickets on sale';
    case 'free':
      return 'Free entry';
    case 'sold-out':
      return 'Sold out';
    case 'past':
      return e.kind === 'drop' ? 'Dropped' : 'Past event';
    default:
      return e.kind === 'drop' ? 'Drop announced' : 'Announced';
  }
}

export function EventCard({ event, onPress, compact }: { event: ClubEvent; onPress: () => void; compact?: boolean }) {
  const d = dateParts(event.start);
  const where = [event.venue, event.city].filter(Boolean).join(' · ');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${d.full}${where ? `, ${where}` : ''}`}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}
    >
      {!compact && event.image ? (
        <Image source={{ uri: event.image }} style={styles.image} contentFit="cover" transition={250} cachePolicy="memory-disk" />
      ) : null}
      <View style={[styles.body, compact && styles.bodyCompact]}>
        <View style={styles.date}>
          <T variant="title" style={styles.day}>
            {d.valid ? d.day : '—'}
          </T>
          <T variant="eyebrow" style={styles.month}>
            {d.valid ? d.month : 'TBA'}
          </T>
        </View>
        <View style={styles.text}>
          <T variant="eyebrow" numberOfLines={1} style={styles.status}>
            {statusLabel(event)}
          </T>
          <T variant="heading" numberOfLines={2}>
            {event.name}
          </T>
          {where ? (
            <T variant="small" numberOfLines={1} style={styles.where}>
              {where}
            </T>
          ) : null}
          {d.valid && !compact ? (
            <T variant="small" numberOfLines={1}>
              {d.weekday} · {d.time}
            </T>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  compact: { borderColor: colors.lineSoft },
  pressed: { borderColor: 'rgba(200,160,74,0.55)' },
  image: { width: '100%', aspectRatio: 16 / 10, backgroundColor: '#050505' },
  body: { flexDirection: 'row', gap: space.lg, padding: space.lg },
  bodyCompact: { padding: space.md },
  date: { width: 52, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.line, paddingRight: space.md },
  day: { fontSize: 24, lineHeight: 28, color: colors.accentHover },
  month: { marginTop: 2 },
  text: { flex: 1, gap: 3 },
  status: { color: colors.accent },
  where: { color: colors.body },
});
