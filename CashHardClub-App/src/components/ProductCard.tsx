import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { formatPrice, imageAt } from '@/lib/format';
import { tap } from '@/lib/haptics';
import type { Product } from '@/data/types';
import { T } from './T';

interface ProductCardProps {
  product: Product;
  saved: boolean;
  onPress: () => void;
  onToggleSaved: () => void;
}

export function badgeFor(product: Product): string | null {
  if (product.soldOut) return null;
  if (/1 of 1/i.test(product.bay ?? '')) return '1 of 1';
  if (product.limited || /limited/i.test(product.bay ?? '')) return 'Limited';
  if (product.was && product.was > product.price) return 'Sale';
  return null;
}

export const ProductCard = React.memo(function ProductCard({ product, saved, onPress, onToggleSaved }: ProductCardProps) {
  const badge = badgeFor(product);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}${product.soldOut ? ', sold out' : ''}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: imageAt(product.img, 750) }}
          style={styles.image}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          recyclingKey={product.id}
          accessibilityIgnoresInvertColors
        />
        {product.soldOut ? (
          <View style={styles.soldOut}>
            <T variant="label">Sold out</T>
          </View>
        ) : null}
        {badge ? (
          <View style={styles.badge}>
            <T variant="eyebrow" style={styles.badgeText}>
              {badge}
            </T>
          </View>
        ) : null}
        <Pressable
          onPress={() => {
            tap();
            onToggleSaved();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved' : 'Save this piece'}
          style={({ pressed }) => [styles.heart, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? colors.accent : colors.text} />
        </Pressable>
      </View>
      {product.bay ? (
        <T variant="eyebrow" numberOfLines={1} style={styles.bay}>
          {product.bay}
        </T>
      ) : null}
      <T variant="heading" numberOfLines={2} style={styles.name}>
        {product.name}
      </T>
      <View style={styles.priceRow}>
        <T variant="price">{formatPrice(product.price)}</T>
        {product.was && product.was > product.price ? (
          <T variant="small" style={styles.was}>
            {formatPrice(product.was)}
          </T>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
  },
  pressed: { borderColor: 'rgba(200,160,74,0.55)', transform: [{ translateY: -1 }] },
  imageWrap: { width: '100%', aspectRatio: 0.8, backgroundColor: '#050505', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  soldOut: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 1,
    borderColor: colors.line,
  },
  badgeText: { fontSize: 9, letterSpacing: 2.4, color: colors.accentHover },
  heart: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bay: { marginTop: space.md, fontSize: 9.5, letterSpacing: 2.4 },
  name: { marginTop: 4, minHeight: 40 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 },
  was: { textDecorationLine: 'line-through' },
});
