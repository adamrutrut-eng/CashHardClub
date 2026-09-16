import React, { useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { useLayout } from '@/theme/layout';
import { useContent } from '@/data/ContentProvider';
import type { Product } from '@/data/types';
import { coolBrowser, warmBrowser } from '@/lib/browser';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Wordmark } from '@/components/Wordmark';
import { ProductCard } from '@/components/ProductCard';
import { AlertsBanner } from '@/components/AlertsBanner';
import { EmptyState } from '@/components/EmptyState';

function ShopHeader({ count, savedCount, offline }: { count: number; savedCount: number; offline: boolean }) {
  const router = useRouter();
  const { horizontalInset } = useLayout();
  return (
    <View style={[styles.header, { paddingHorizontal: horizontalInset }]}>
      <View style={styles.topRow}>
        <Wordmark size="sm" />
        <Pressable
          onPress={() => router.push('/saved')}
          accessibilityRole="button"
          accessibilityLabel={`Saved pieces, ${savedCount}`}
          hitSlop={8}
          style={({ pressed }) => [styles.savedBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name={savedCount ? 'heart' : 'heart-outline'} size={22} color={colors.accent} />
          {savedCount ? (
            <View style={styles.savedCount}>
              <T variant="small" style={styles.savedCountText}>
                {savedCount}
              </T>
            </View>
          ) : null}
        </Pressable>
      </View>
      <T variant="eyebrow" style={styles.eyebrow}>
        The vault collection · {count} {count === 1 ? 'piece' : 'pieces'}
      </T>
      <T variant="display" accessibilityRole="header">
        The Vault
      </T>
      <T style={styles.sub}>
        Limited pieces in black, white and gold. Tap a piece for sizes, colors and the story — checkout completes on the official store.
      </T>
      {offline ? (
        <View style={styles.offline}>
          <Ionicons name="cloud-offline-outline" size={14} color={colors.dim} />
          <T variant="small">Showing the last saved catalog — pull down to refresh.</T>
        </View>
      ) : null}
      <AlertsBanner />
    </View>
  );
}

export default function ShopScreen() {
  const { products, status, refresh, isSaved, toggleSaved, savedIds } = useContent();
  const { columns, horizontalInset, gutter } = useLayout();
  const router = useRouter();

  useEffect(() => {
    warmBrowser();
    return coolBrowser;
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      saved={isSaved(item.id)}
      onToggleSaved={() => toggleSaved(item.id)}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
    />
  );

  return (
    <Screen padded={false}>
      <FlatList
        key={String(columns)}
        data={products}
        numColumns={columns}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        columnWrapperStyle={{ gap: gutter - 4, paddingHorizontal: horizontalInset }}
        contentContainerStyle={[styles.list, { gap: gutter - 4 }]}
        ListHeaderComponent={<ShopHeader count={products.length} savedCount={savedIds.length} offline={status === 'offline'} />}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: horizontalInset }}>
            <EmptyState title="The vault is being restocked" body="Pull down to refresh, or check the official store." />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={status === 'refreshing'}
            onRefresh={refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surface2}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.md, paddingBottom: space.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  savedBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  savedCount: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  savedCountText: { color: colors.accentInk, fontSize: 10, lineHeight: 12 },
  eyebrow: { marginTop: space.xl },
  sub: { marginTop: space.md, maxWidth: 560 },
  offline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
  list: { paddingBottom: space.xxl },
});
