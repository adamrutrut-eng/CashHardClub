import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
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

type Page = { kind: 'image'; uri: string } | { kind: 'video' };

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
  if (product.cut) pages.push({ kind: 'image', uri: product.cut });
  if (product.loop) pages.push({ kind: 'video' });
  return pages;
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { productById, isSaved, toggleSaved } = useContent();
  const product = productById(String(id ?? ''));
  const { width, height, horizontalInset, readingWidth, isTablet } = useLayout();
  const [active, setActive] = useState(0);

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
    if (active === motionIndex) player.play();
    else player.pause();
  }, [active, motionIndex, player]);

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
          accessibilityLabel={`${product.name} photos, ${pages.length} pages`}
        >
          {pages.map((page, i) => (
            <View key={i} style={{ width: heroWidth, height: heroHeight }}>
              {page.kind === 'image' ? (
                <Image source={{ uri: page.uri }} style={styles.fill} contentFit={page.uri.endsWith('.png') ? 'contain' : 'cover'} transition={250} cachePolicy="memory-disk" />
              ) : (
                <VideoView player={player} style={styles.fill} contentFit="cover" nativeControls={false} allowsPictureInPicture={false} />
              )}
            </View>
          ))}
        </ScrollView>
        {pages.length > 1 ? (
          <View style={styles.dots} pointerEvents="none">
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

      <View style={[styles.body, { paddingHorizontal: horizontalInset, width: isTablet ? readingWidth + horizontalInset * 2 : '100%', alignSelf: 'center' }]}>
        <T variant="title" accessibilityRole="header">
          {product.name}
        </T>
        <View style={styles.priceRow}>
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
        {product.desc ? <T style={styles.desc}>{product.desc}</T> : null}

        {product.sizes.length > 0 ? (
          <>
            <T variant="eyebrow" style={styles.sectionLabel}>
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
            <T variant="eyebrow" style={styles.sectionLabel}>
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
          Size and color are chosen at checkout. Checkout completes securely on the official CASH HARD CLUB store.
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
  body: { paddingTop: space.xl },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm, flexWrap: 'wrap' },
  price: { fontSize: 18, lineHeight: 24 },
  was: { textDecorationLine: 'line-through' },
  desc: { marginTop: space.lg },
  sectionLabel: { marginTop: space.xl, marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  buy: { marginTop: space.xxl },
  secondary: { marginTop: space.md },
  note: { marginTop: space.md },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
  action: { flex: 1 },
});
