import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRestaurant } from '../context/RestaurantContext';
import { RootStackParamList, CATEGORIES, Dish, OrderItem } from '../types';
import { colors, formatCurrency, spacing, shadows } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';

type OrderScreenRouteProp = RouteProp<RootStackParamList, 'Order'>;
type OrderScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

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

export const OrderScreen: React.FC = () => {
  const route = useRoute<OrderScreenRouteProp>();
  const navigation = useNavigation<OrderScreenNavProp>();
  const { tableNumber } = route.params;

  const { dishes, getActiveOrderByTable, saveTableOrder } = useRestaurant();
  const activeOrder = getActiveOrderByTable(tableNumber);

  const [selectedItems, setSelectedItems] = useState<{ [dishId: string]: number }>(() => {
    const initialMap: { [dishId: string]: number } = {};
    if (activeOrder && activeOrder.items) {
      activeOrder.items.forEach(item => {
        initialMap[item.dishId] = item.quantity;
      });
    }
    return initialMap;
  });

  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('Tất cả');

  const filteredDishes = useMemo(() => {
    if (selectedCategoryTab === 'Tất cả') {
      return dishes;
    }
    return dishes.filter(d => d.category === selectedCategoryTab);
  }, [dishes, selectedCategoryTab]);

  const handleIncrease = (dish: Dish) => {
    if (!dish.available) {
      Alert.alert('Hết món', `Món "${dish.name}" hiện đang hết hàng, không thể chọn!`);
      return;
    }
    setSelectedItems(prev => ({
      ...prev,
      [dish.id]: (prev[dish.id] || 0) + 1,
    }));
  };

  const handleDecrease = (dishId: string) => {
    setSelectedItems(prev => {
      const currentQty = prev[dishId] || 0;
      if (currentQty <= 1) {
        const copy = { ...prev };
        delete copy[dishId];
        return copy;
      }
      return {
        ...prev,
        [dishId]: currentQty - 1,
      };
    });
  };

  const subtotal = useMemo(() => {
    let total = 0;
    Object.entries(selectedItems).forEach(([dishId, qty]) => {
      const dish = dishes.find(d => d.id === dishId);
      if (dish && qty > 0) {
        total += dish.price * qty;
      }
    });
    return total;
  }, [selectedItems, dishes]);

  const totalQuantity = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, q) => sum + q, 0);
  }, [selectedItems]);

  const getOrderItemsArray = (): OrderItem[] => {
    return Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([dishId, quantity]) => ({ dishId, quantity }));
  };

  const handleSaveOrder = () => {
    const items = getOrderItemsArray();
    saveTableOrder(tableNumber, items);

    if (items.length > 0) {
      Alert.alert('Thành công', `Đã lưu gọi món cho Bàn ${tableNumber}!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Thông báo', `Bàn ${tableNumber} đã xoá hết món và trở về trạng thái trống!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleProceedToPayment = () => {
    const items = getOrderItemsArray();
    if (items.length === 0) {
      Alert.alert('Thông báo', 'Hoá đơn chưa có món nào để thanh toán!');
      return;
    }

    const savedOrder = saveTableOrder(tableNumber, items);
    if (savedOrder) {
      navigation.navigate('Payment', { orderId: savedOrder.id });
    }
  };

  return (
    <View style={styles.container}>
      {/* Banner thông tin bàn */}
      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.tableTitle}>Bàn {tableNumber}</Text>
          <Text style={styles.tableSubtitle}>
            {activeOrder ? 'Đang phục vụ (gọi thêm món)' : 'Bàn mới bắt đầu gọi món'}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalQuantity} món đã chọn</Text>
        </View>
      </View>

      {/* Tabs danh mục món với emoji */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['Tất cả', ...CATEGORIES]}
          keyExtractor={item => item}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => {
            const isSelected = selectedCategoryTab === item;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setSelectedCategoryTab(item)}
              >
                <Text style={styles.tabEmoji}>{getCategoryEmoji(item)}</Text>
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Danh sách món ăn với hình ảnh */}
      <FlatList
        data={filteredDishes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.dishListContent}
        renderItem={({ item }) => {
          const quantity = selectedItems[item.id] || 0;
          const isOutOfStock = !item.available;

          return (
            <View style={[styles.dishItem, isOutOfStock && styles.dishItemDisabled]}>
              {/* Hình ảnh món */}
              <View style={styles.imageContainer}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={[styles.dishThumb, isOutOfStock && styles.imageFaded]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.dishThumbPlaceholder, isOutOfStock && styles.imageFaded]}>
                    <Text style={styles.thumbEmoji}>{getCategoryEmoji(item.category)}</Text>
                  </View>
                )}
                {isOutOfStock && (
                  <View style={styles.outOfStockTag}>
                    <Text style={styles.outOfStockTagText}>Hết</Text>
                  </View>
                )}
              </View>

              {/* Thông tin món */}
              <View style={styles.dishInfo}>
                <Text style={[styles.dishName, isOutOfStock && styles.textDisabled]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.dishPrice, isOutOfStock && styles.textDisabled]}>
                  {formatCurrency(item.price)}
                </Text>
              </View>

              {/* Nút tăng/giảm (+ / −) */}
              <View style={styles.counterRow}>
                {quantity > 0 ? (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.counterBtnMinus}
                      onPress={() => handleDecrease(item.id)}
                    >
                      <Text style={styles.counterBtnMinusText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                  </>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.counterBtnPlus,
                    isOutOfStock && styles.counterBtnDisabled,
                  ]}
                  onPress={() => handleIncrease(item)}
                  disabled={isOutOfStock}
                >
                  <Text style={[styles.counterBtnPlusText, isOutOfStock && styles.textDisabled]}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="🍽️"
            title="Không có món ăn"
            description="Không tìm thấy món ăn nào trong danh mục này."
          />
        }
      />

      {/* Footer bar */}
      <View style={styles.footer}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Tạm tính:</Text>
          <Text style={styles.subtotalValue}>{formatCurrency(subtotal)}</Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn]}
            activeOpacity={0.7}
            onPress={handleSaveOrder}
          >
            <Text style={styles.saveBtnText}>Lưu gọi món</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.payBtn,
              totalQuantity === 0 && styles.payBtnDisabled,
            ]}
            activeOpacity={0.7}
            onPress={handleProceedToPayment}
            disabled={totalQuantity === 0}
          >
            <Text style={styles.payBtnText}>Thanh toán ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.card,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  tableSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  tabsContainer: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabEmoji: {
    fontSize: 13,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  dishListContent: {
    padding: spacing.md,
    paddingBottom: 130,
  },
  dishItem: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dishItemDisabled: {
    opacity: 0.55,
    backgroundColor: '#F9F9F9',
  },
  imageContainer: {
    width: 68,
    height: 68,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  dishThumb: {
    width: '100%',
    height: '100%',
  },
  dishThumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbEmoji: {
    fontSize: 26,
  },
  imageFaded: {
    opacity: 0.4,
  },
  outOfStockTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockTagText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  dishInfo: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  textDisabled: {
    color: colors.textMuted,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  counterBtnMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  counterBtnMinusText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: -2,
  },
  counterBtnPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  counterBtnPlusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: -2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.floating,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subtotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  saveBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  payBtn: {
    backgroundColor: colors.secondary,
    ...shadows.card,
  },
  payBtnDisabled: {
    backgroundColor: '#A5D6A7',
    opacity: 0.6,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
