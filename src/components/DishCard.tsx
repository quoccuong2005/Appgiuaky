import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image } from 'react-native';
import { Dish } from '../types';
import { colors, formatCurrency, shadows, spacing } from '../constants/theme';

interface DishCardProps {
  dish: Dish;
  onToggleAvailability: (id: string) => void;
  onPress: (dish: Dish) => void;
  onLongPress: (dish: Dish) => void;
}

const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case 'Khai vị':
      return '🥗';
    case 'Món chính':
      return '🥩';
    case 'Tráng miệng':
      return '🍨';
    case 'Đồ uống':
      return '🍹';
    default:
      return '🍽️';
  }
};

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  onToggleAvailability,
  onPress,
  onLongPress,
}) => {
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = !dish.available;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, isOutOfStock && styles.cardUnavailable]}
      onPress={() => onPress(dish)}
      onLongPress={() => onLongPress(dish)}
      delayLongPress={500}
    >
      {/* Hình ảnh món ăn */}
      <View style={styles.imageContainer}>
        {dish.image && !imgError ? (
          <Image
            source={{ uri: dish.image }}
            style={[styles.image, isOutOfStock && styles.imageFaded]}
            onError={() => setImgError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, isOutOfStock && styles.imageFaded]}>
            <Text style={styles.placeholderEmoji}>{getCategoryEmoji(dish.category)}</Text>
          </View>
        )}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockOverlayText}>HẾT</Text>
          </View>
        )}
      </View>

      {/* Thông tin món ăn */}
      <View style={styles.content}>
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.name, isOutOfStock && styles.textMuted]}
              numberOfLines={2}
            >
              {dish.name}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {getCategoryEmoji(dish.category)} {dish.category}
              </Text>
            </View>
            {isOutOfStock && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Hết món</Text>
              </View>
            )}
          </View>

          <Text style={[styles.price, isOutOfStock && styles.textMuted]}>
            {formatCurrency(dish.price)}
          </Text>
        </View>

        {/* Cột công tắc Switch */}
        <View style={styles.switchCol}>
          <Text style={[styles.switchLabel, isOutOfStock && styles.switchLabelOff]}>
            {dish.available ? 'Còn món' : 'Hết món'}
          </Text>
          <Switch
            value={dish.available}
            onValueChange={() => onToggleAvailability(dish.id)}
            trackColor={{ false: '#CFD8DC', true: colors.primaryLight }}
            thumbColor={dish.available ? colors.primary : '#90A4AE'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginHorizontal: spacing.lg,
    marginVertical: 6,
    padding: spacing.sm,
    ...shadows.card,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardUnavailable: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
  },
  imageContainer: {
    width: 78,
    height: 78,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFaded: {
    opacity: 0.5,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockOverlayText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.md,
  },
  infoCol: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  nameRow: {
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
  },
  textMuted: {
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  outOfStockBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  switchCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  switchLabel: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  switchLabelOff: {
    color: colors.textMuted,
  },
});
