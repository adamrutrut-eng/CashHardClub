import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { space } from '@/theme/tokens';
import { useLayout } from '@/theme/layout';
import { useContent } from '@/data/ContentProvider';
import type { Product } from '@/data/types';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';

/** FlatList never pads a short final row, so `flex: 1` cards there would stretch. Pad to a full row. */
function padToColumns(items: Product[], columns: number): Product[] {
  const missing = (columns - (items.length % columns)) % columns;
  if (missing === 0) return items;
  return [...items, ...Array.from({ length: missing }, (_, i) => ({ id: `__pad${i}` }) as Product)];
}

export default function SavedScreen() {
  const router = useRouter();
  const { products, savedIds, isSaved, toggleSaved } = useContent();
  const { columns, horizontalInset, gutter } = useLayout();
  const saved = products.filter((p) => savedIds.includes(p.id));
  const data = React.useMemo(() => padToColumns(saved, columns), [products, savedIds, columns]);

  return (
    <Screen padded={false} header={<Header back eyebrow="Your picks" title="Saved" />}>
      <FlatList
        key={String(columns)}
        data={data}
        numColumns={columns}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => {
          if (item.id.startsWith('__pad')) return <View style={styles.spacer} />;
          return (
          <ProductCard
            product={item}
            saved={isSaved(item.id)}
            onToggleSaved={() => toggleSaved(item.id)}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
          />
          );
        }}
        columnWrapperStyle={{ gap: gutter - 4, paddingHorizontal: horizontalInset }}
        contentContainerStyle={[styles.list, { gap: gutter - 4 }]}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: horizontalInset, paddingTop: space.lg }}>
            <EmptyState icon="heart-outline" title="Nothing saved yet" body="Tap the heart on any piece to keep it here. Saved pieces stay on this phone — no account needed." action={{ label: 'Browse the vault', onPress: () => router.replace('/') }} />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: { flex: 1 },
  list: { paddingTop: space.md, paddingBottom: space.xxl },
});
