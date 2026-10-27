import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRestaurant } from '../context/RestaurantContext';
import { colors, formatCurrency, spacing, shadows } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';

export const BillHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { orders, dishes } = useRestaurant();

  // Lọc các hoá đơn "Đã thanh toán"
  const paidOrders = orders
    .filter(o => o.status === 'Đã thanh toán')
    .slice()
    .reverse(); // Mới nhất lên đầu

  return (
    <View style={styles.container}>
      <FlatList
        data={paidOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const subtotal = item.items.reduce((sum, orderItem) => {
            const dish = dishes.find(d => d.id === orderItem.dishId);
            return sum + (dish ? dish.price * orderItem.quantity : 0);
          }, 0);
          const totalWithVat = Math.round(subtotal * 1.08);

          return (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.tableTitle}>Bàn {item.tableNumber}</Text>
                  <Text style={styles.dateText}>🕒 {item.createdAt}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Đã thanh toán</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Danh sách món ăn đã thanh toán */}
              {item.items.map((orderItem, idx) => {
                const dish = dishes.find(d => d.id === orderItem.dishId);
                return (
                  <View key={`${orderItem.dishId}_${idx}`} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {dish?.name || 'Món ăn'}
                    </Text>
                    <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
                    <Text style={styles.itemPrice}>
                      {formatCurrency((dish?.price || 0) * orderItem.quantity)}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng cộng (gồm VAT 8%):</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalWithVat)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="🧾"
            title="Chưa có hoá đơn nào"
            description="Các hoá đơn sau khi thanh toán thành công sẽ xuất hiện tại đây."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  itemName: {
    flex: 2,
    fontSize: 13,
    color: colors.text,
  },
  itemQty: {
    flex: 0.5,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});
