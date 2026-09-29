import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { useLayout } from '@/theme/layout';
import { useContent } from '@/data/ContentProvider';
import { SUPPORT_EMAIL, SUPPORT_URL } from '@/data/content';
import { isPast } from '@/data/events';
import { openInAppBrowser } from '@/lib/browser';
import { dateParts, formatPrice } from '@/lib/format';
import { openDirections, openEmail, shareLink } from '@/lib/social';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { T } from '@/components/T';
import { Chip } from '@/components/Chip';
import { GoldButton } from '@/components/GoldButton';
import { EmptyState } from '@/components/EmptyState';
import { statusLabel } from '@/components/EventCard';

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { eventById } = useContent();
  const event = eventById(String(id ?? ''));
  const { width, horizontalInset, readingWidth, isTablet } = useLayout();

  if (!event) {
    return (
      <Screen scroll bottomInset header={<Header back />}>
        <EmptyState icon="calendar-outline" title="Event not found" body="It may have been removed from the calendar." action={{ label: 'Back to events', onPress: () => router.replace('/events') }} />
      </Screen>
    );
  }

  const d = dateParts(event.start);
  const end = event.end ? dateParts(event.end) : null;
  const where = [event.venue, event.address, event.city].filter(Boolean).join(', ');
  const past = isPast(event);
  const isEvent = event.kind === 'event';
  const canBuy = !!event.url && !past && (event.status === 'on-sale' || event.status === 'free');
  const halted = event.status === 'cancelled' || event.status === 'postponed';
  const showAccess = isEvent && !past && event.status !== 'cancelled';
  const heroWidth = Math.min(width, 760);

  return (
    <Screen
      scroll
      padded={false}
      bottomInset
      header={
        <Header
          back
          eyebrow={event.kind === 'drop' ? 'Drop' : 'Event'}
          right={
            event.url ? (
              <Pressable onPress={() => shareLink(event.name, event.url as string)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Share this event" style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}>
                <Ionicons name="share-outline" size={22} color={colors.text} />
              </Pressable>
            ) : null
          }
        />
      }
    >
      {event.image ? (
        <Image
          source={{ uri: event.image }}
          style={[styles.hero, { width: heroWidth, alignSelf: 'center' }]}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          accessible
          accessibilityRole="image"
          accessibilityLabel={event.imageAlt ?? `${event.name} poster`}
        />
      ) : null}

      <View style={[styles.body, { paddingHorizontal: horizontalInset, width: isTablet ? readingWidth + horizontalInset * 2 : '100%', alignSelf: 'center' }]}>
        <Chip label={statusLabel(event)} selected />
        <T variant="title" accessibilityRole="header" style={styles.name}>
          {event.name}
        </T>

        <View style={styles.facts}>
          <View style={styles.fact}>
            <Ionicons name="calendar-outline" size={18} color={colors.accent} />
            <View style={styles.factText}>
              <T variant="bodyStrong">{d.full}</T>
              {end?.valid ? <T variant="small">Until {end.full}</T> : null}
            </View>
          </View>
          {where ? (
            <View style={styles.fact}>
              <Ionicons name="location-outline" size={18} color={colors.accent} />
              <View style={styles.factText}>
                <T variant="bodyStrong">{event.venue ?? where}</T>
                {event.venue && (event.address || event.city) ? <T variant="small">{[event.address, event.city].filter(Boolean).join(', ')}</T> : null}
              </View>
            </View>
          ) : null}
          {isEvent ? (
            <View style={styles.fact}>
              <Ionicons name="ticket-outline" size={18} color={colors.accent} />
              <View style={styles.factText}>
                <T variant="bodyStrong">{event.price != null ? (event.price === 0 ? 'Free entry' : `${formatPrice(event.price)} per ticket`) : 'Ticketed'}</T>
                <T variant="small">
                  {event.age ? `${event.age} · Valid government-issued photo ID required at the door` : 'Age policy set by the venue — check before you buy'}
                </T>
                {event.price != null && event.price > 0 ? <T variant="small">Sales tax, if any, is added at checkout.</T> : null}
              </View>
            </View>
          ) : null}
          {showAccess ? (
            <Pressable
              onPress={() => openEmail(SUPPORT_EMAIL, `Accessibility – ${event.name}`)}
              accessibilityRole="button"
              accessibilityHint="Opens your email app"
              style={({ pressed }) => [styles.fact, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="accessibility-outline" size={18} color={colors.accent} />
              <View style={styles.factText}>
                <T variant="small" style={styles.accessText}>
                  {event.access ?? "Accessibility or accommodation questions? Email us before you buy and we'll check with the venue."}
                </T>
              </View>
            </Pressable>
          ) : null}
        </View>

        {event.summary ? <T style={styles.summary}>{event.summary}</T> : null}
        {event.details ? <T style={styles.details}>{event.details}</T> : null}

        {canBuy ? (
          <GoldButton
            label={event.status === 'free' ? 'Reserve on the official store' : 'Get tickets'}
            icon="ticket-outline"
            onPress={() => openInAppBrowser(event.url as string)}
            style={styles.buy}
            accessibilityHint="Opens the official store in an in-app browser to complete checkout"
          />
        ) : halted ? (
          <GoldButton label={event.status === 'cancelled' ? 'Cancelled' : 'Postponed'} disabled style={styles.buy} />
        ) : event.status === 'sold-out' ? (
          <GoldButton label="Sold out" disabled style={styles.buy} />
        ) : event.url && past ? (
          <GoldButton label="View on the official store" variant="outline" icon="open-outline" onPress={() => openInAppBrowser(event.url as string)} style={styles.buy} />
        ) : !past ? (
          <View style={styles.announced}>
            <T variant="small" center>
              Tickets aren't on sale yet. Turn on drop alerts in the Alerts tab to hear when they are.
            </T>
          </View>
        ) : null}
        {canBuy && isEvent ? (
          <T variant="small" center style={styles.note}>
            {event.status === 'free'
              ? "Reservations are made on the official store. Entry is at the venue's discretion."
              : (event.terms ??
                `Tickets are sold by CASH HARD CLUB through the official store and are subject to the ticket terms and refund policy shown at checkout. Hosted at ${event.venue ?? 'the venue'}: venue rules, ID checks and bar service are the venue's, and the venue may refuse entry.`)}
          </T>
        ) : null}
        {halted && isEvent ? (
          <View style={styles.note}>
            <T variant="small" center>
              {`This event has been ${event.status === 'cancelled' ? 'cancelled' : 'postponed'}. Ticket holders: see the ticket terms on the official store or email us with your order number.`}
            </T>
            <Pressable onPress={() => openInAppBrowser(SUPPORT_URL)} accessibilityRole="link" hitSlop={8} style={styles.supportLink}>
              <T variant="small" center style={styles.linkText}>
                Support
              </T>
            </Pressable>
          </View>
        ) : null}

        {where && event.kind !== 'drop' ? (
          <GoldButton variant="outline" compact icon="navigate-outline" label="Directions" onPress={() => openDirections(where)} style={styles.directions} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { aspectRatio: 16 / 10, backgroundColor: '#050505' },
  body: { paddingTop: space.xl, alignItems: 'flex-start' },
  name: { marginTop: space.md, alignSelf: 'stretch' },
  facts: { marginTop: space.xl, gap: space.md, alignSelf: 'stretch' },
  fact: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  factText: { flex: 1 },
  summary: { marginTop: space.xl, alignSelf: 'stretch' },
  details: { marginTop: space.md, alignSelf: 'stretch' },
  buy: { marginTop: space.xxl, alignSelf: 'stretch' },
  note: { marginTop: space.md, alignSelf: 'stretch' },
  accessText: { color: colors.body },
  supportLink: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: space.md },
  linkText: { color: colors.accent, textDecorationLine: 'underline' },
  announced: { marginTop: space.xxl, alignSelf: 'stretch', borderWidth: 1, borderColor: colors.lineSoft, padding: space.lg },
  directions: { marginTop: space.lg, alignSelf: 'stretch' },
});
