import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { space } from '@/theme/tokens';
import { useLayout } from '@/theme/layout';
import { useContent } from '@/data/ContentProvider';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';

export default function SavedScreen() {
  const router = useRouter();
  const { products, savedIds, isSaved, toggleSaved } = useContent();
  const { columns, horizontalInset, gutter } = useLayout();
  const saved = products.filter((p) => savedIds.includes(p.id));

  return (
    <Screen padded={false} header={<Header back eyebrow="Your picks" title="Saved" />}>
      <FlatList
        key={String(columns)}
        data={saved}
        numColumns={columns}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            saved={isSaved(item.id)}
            onToggleSaved={() => toggleSaved(item.id)}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
          />
        )}
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
  list: { paddingTop: space.md, paddingBottom: space.xxl },
});
