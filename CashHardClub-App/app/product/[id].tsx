import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors, space } from '@/theme/tokens';
import { useLayout } from '@/theme/layout';
import { useContent } from '@/data/ContentProvider';
import type { Product } from '@/data/types';
import { openInAppBrowser } from '@/lib/browser';
import { formatPrice, imageAt } from '@/lib/format';
import { shareLink } from '@/lib/social';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { T } from '@/components/T';
import { Chip } from '@/components/Chip';
import { GoldButton } from '@/components/GoldButton';
import { EmptyState } from '@/components/EmptyState';
import { badgeFor } from '@/components/ProductCard';

/** render = a digitally generated image (not a photo); every video page is a generated motion preview. */
type Page = { kind: 'image'; uri: string; render?: boolean } | { kind: 'video' };

function fileName(url: string) {
  return url.split('?')[0].split('/').pop()?.toLowerCase() ?? url;
}

function buildPages(product: Product | undefined): Page[] {
  if (!product) return [];
  const pages: Page[] = [{ kind: 'image', uri: imageAt(product.img, 1500) }];
  const seen = new Set([fileName(product.img)]);
  for (const g of product.gallery) {
    const key = fileName(g);
    if (seen.has(key)) continue;
    seen.add(key);
    pages.push({ kind: 'image', uri: g });
  }
  if (product.cut) pages.push({ kind: 'image', uri: product.cut, render: true });
  if (product.loop) pages.push({ kind: 'video' });
  return pages;
}

/** Visible caption on generated imagery (clear of the page dots and the Sold-out box). */
function RenderTag() {
  return (
    <View pointerEvents="none" style={styles.renderTag}>
      <T variant="label">DIGITAL RENDER</T>
    </View>
  );
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { productById, isSaved, toggleSaved } = useContent();
  const product = productById(String(id ?? ''));
  const { width, height, horizontalInset, readingWidth, isTablet } = useLayout();
  const [active, setActive] = useState(0);
  // Motion previews stay still under Reduce Motion until the user taps play (and can always be paused).
  const [reduceMotion, setReduceMotion] = useState(false);
  const [override, setOverride] = useState<boolean | null>(null);
  const shouldPlay = override ?? !reduceMotion;
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const heroWidth = Math.min(width, 760);
  const heroHeight = Math.min(Math.round(heroWidth * 1.15), Math.round(height * 0.62));
  const pages = useMemo(() => buildPages(product), [product]);
  const motionIndex = pages.findIndex((p) => p.kind === 'video');

  const player = useVideoPlayer(product?.loop ?? null, (p) => {
    p.loop = true;
    p.muted = true;
  });
  useEffect(() => {
    if (motionIndex < 0) return;
    if (active === motionIndex && shouldPlay) player.play();
    else player.pause();
  }, [active, motionIndex, player, shouldPlay]);

  if (!product) {
    return (
      <Screen scroll bottomInset header={<Header back />}>
        <EmptyState title="Not in the vault" body="That piece isn't available right now." action={{ label: 'Back to the shop', onPress: () => router.replace('/') }} />
      </Screen>
    );
  }

  const saved = isSaved(product.id);
  const badge = badgeFor(product);
  const onSale = !!product.was && product.was > product.price;
  const hasRenders = !!product.cut || !!product.loop;
  const pageLabel = (p: Page, i: number) =>
    `${product.name}, ${p.kind === 'video' ? 'computer-generated motion preview' : p.render ? 'computer-generated render' : 'photo'}, ${i + 1} of ${pages.length}`;
  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActive(Math.max(0, Math.min(pages.length - 1, Math.round(e.nativeEvent.contentOffset.x / heroWidth))));
  };

  return (
    <Screen
      scroll
      padded={false}
      bottomInset
      header={
        <Header
          back
          eyebrow={product.bay}
          right={
            <Pressable
              onPress={() => shareLink(product.name, product.url)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Share this piece"
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </Pressable>
          }
        />
      }
    >
      <View style={[styles.hero, { width: heroWidth, height: heroHeight, alignSelf: 'center' }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          accessibilityLabel={hasRenders ? `${product.name} gallery: photos and digital renders` : `${product.name} photos, ${pages.length} pages`}
        >
          {pages.map((page, i) =>
            page.kind === 'image' ? (
              <View key={i} style={{ width: heroWidth, height: heroHeight }} accessible accessibilityRole="image" accessibilityLabel={pageLabel(page, i)}>
                <Image source={{ uri: page.uri }} style={styles.fill} contentFit={page.uri.endsWith('.png') ? 'contain' : 'cover'} transition={250} cachePolicy="memory-disk" />
                {page.render ? <RenderTag /> : null}
              </View>
            ) : (
              <Pressable
                key={i}
                style={{ width: heroWidth, height: heroHeight }}
                onPress={() => setOverride(!shouldPlay)}
                accessibilityRole="button"
                accessibilityLabel={`${pageLabel(page, i)}. ${shouldPlay ? 'Double-tap to pause' : 'Double-tap to play'}`}
              >
                <VideoView player={player} style={styles.fill} contentFit="cover" nativeControls={false} allowsPictureInPicture={false} />
                <RenderTag />
                <View pointerEvents="none" style={styles.playGlyph}>
                  <Ionicons name={shouldPlay ? 'pause' : 'play'} size={18} color={colors.text} />
                </View>
              </Pressable>
            ),
          )}
        </ScrollView>
        {pages.length > 1 ? (
          <View style={styles.dots} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {pages.map((page, i) => (
              <View key={i} style={[styles.dot, i === active && styles.dotActive, page.kind === 'video' && styles.dotVideo]} />
            ))}
          </View>
        ) : null}
        {product.soldOut ? (
          <View style={styles.soldOut}>
            <T variant="label">Sold out</T>
          </View>
        ) : null}
      </View>
      {hasRenders ? (
        <T variant="small" style={[styles.renderNote, { paddingHorizontal: horizontalInset }]}>
          Some gallery images are digital renders for illustration. Store photos show the product; color and print may look
          slightly different on screen.
        </T>
      ) : null}

      <View style={[styles.body, { paddingHorizontal: horizontalInset, width: isTablet ? readingWidth + horizontalInset * 2 : '100%', alignSelf: 'center' }]}>
        <T variant="title" accessibilityRole="header">
          {product.name}
        </T>
        <View style={styles.priceRow} accessible accessibilityLabel={`Price ${formatPrice(product.price)}${badge ? `, ${badge}` : ''}`}>
          <T variant="price" style={styles.price}>
            {formatPrice(product.price)}
          </T>
          {onSale ? (
            <T variant="muted" style={styles.was}>
              {formatPrice(product.was as number)}
            </T>
          ) : null}
          {badge ? <Chip label={badge} selected /> : null}
        </View>
        <T variant="small" style={styles.priceNote}>
          Final price, sizes and availability are shown at checkout on the official store.
        </T>
        {product.desc ? <T style={styles.desc}>{product.desc}</T> : null}

        {product.sizes.length > 0 ? (
          <>
            <T variant="eyebrow" accessibilityRole="header" style={styles.sectionLabel}>
              Sizes
            </T>
            <View style={styles.chips}>
              {product.sizes.map((s) => (
                <Chip key={s} label={s} />
              ))}
            </View>
          </>
        ) : null}
        {product.colors.length > 0 ? (
          <>
            <T variant="eyebrow" accessibilityRole="header" style={styles.sectionLabel}>
              Colors
            </T>
            <View style={styles.chips}>
              {product.colors.map((c) => (
                <Chip key={c} label={c} />
              ))}
            </View>
          </>
        ) : null}

        {product.soldOut ? (
          <>
            <GoldButton label="Sold out" disabled style={styles.buy} />
            <GoldButton label="View on the official store" variant="outline" icon="open-outline" onPress={() => openInAppBrowser(product.url)} style={styles.secondary} />
          </>
        ) : (
          <GoldButton
            label="Buy on the official store"
            icon="bag-handle-outline"
            onPress={() => openInAppBrowser(product.url)}
            style={styles.buy}
            accessibilityHint="Opens the official store in an in-app browser to choose size and check out"
          />
        )}
        <T variant="small" center style={styles.note}>
          Size and color are chosen at checkout. Prices, stock and product details are set by CASH HARD CLUB on its official
          store, where checkout completes securely. Taxes and shipping are calculated at checkout.
        </T>

        <View style={styles.actions}>
          <GoldButton
            variant="outline"
            compact
            icon={saved ? 'heart' : 'heart-outline'}
            label={saved ? 'Saved' : 'Save'}
            onPress={() => toggleSaved(product.id)}
            style={styles.action}
          />
          <GoldButton variant="outline" compact icon="share-outline" label="Share" onPress={() => shareLink(product.name, product.url)} style={styles.action} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { backgroundColor: '#050505', overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: colors.accent },
  dotVideo: { width: 14 },
  soldOut: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderWidth: 1,
    borderColor: colors.line,
  },
  renderTag: { position: 'absolute', left: 14, bottom: 34, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4 },
  playGlyph: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  renderNote: { marginTop: space.md, alignSelf: 'center', width: '100%', maxWidth: 760 },
  body: { paddingTop: space.xl },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm, flexWrap: 'wrap' },
  price: { fontSize: 18, lineHeight: 24 },
  was: { textDecorationLine: 'line-through' },
  priceNote: { marginTop: space.xs },
  desc: { marginTop: space.lg },
  sectionLabel: { marginTop: space.xl, marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  buy: { marginTop: space.xxl },
  secondary: { marginTop: space.md },
  note: { marginTop: space.md },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
  action: { flex: 1 },
});
