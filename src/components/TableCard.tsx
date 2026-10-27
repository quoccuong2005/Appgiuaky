import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Order, Dish } from '../types';
import { colors, formatCurrency, shadows, spacing } from '../constants/theme';

interface TableCardProps {
  tableNumber: number;
  order?: Order;
  dishes: Dish[];
  onPress: (tableNumber: number) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  tableNumber,
  order,
  dishes,
  onPress,
}) => {
  const isOccupied = !!order && order.status === 'Đang phục vụ' && order.items.length > 0;

  const totalItemsCount = order?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal =
    order?.items.reduce((sum, item) => {
      const dish = dishes.find(d => d.id === item.dishId);
      return sum + (dish ? dish.price * item.quantity : 0);
    }, 0) || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.card,
        isOccupied ? styles.cardOccupied : styles.cardEmpty,
      ]}
      onPress={() => onPress(tableNumber)}
    >
      <View style={styles.topRow}>
        <View style={styles.tableTitleContainer}>
          <Text style={styles.tableIcon}>{isOccupied ? '🍽️' : '🪑'}</Text>
          <Text style={[styles.tableTitle, isOccupied && styles.textOccupied]}>
            Bàn {tableNumber}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isOccupied ? styles.badgeOccupied : styles.badgeEmpty,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isOccupied ? styles.statusTextOccupied : styles.statusTextEmpty,
            ]}
          >
            {isOccupied ? 'Có khách' : 'Trống'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {isOccupied ? (
        <View style={styles.bodyOccupied}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Đã gọi:</Text>
            <Text style={styles.statValue}>{totalItemsCount} món</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tạm tính:</Text>
            <Text style={styles.subtotalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {order?.createdAt ? (
            <Text style={styles.timeText}>🕒 {order.createdAt}</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.bodyEmpty}>
          <Text style={styles.emptyActionText}>+ Chạm mở bàn</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.sm,
    borderRadius: 16,
    padding: spacing.md,
    minHeight: 130,
    justifyContent: 'space-between',
    ...shadows.card,
  },
  cardEmpty: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardOccupied: {
    backgroundColor: '#FFF7ED', // Nền cam ấm sang trọng
    borderWidth: 2,
    borderColor: colors.primary,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableIcon: {
    fontSize: 18,
  },
  tableTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  textOccupied: {
    color: colors.primaryDark,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeEmpty: {
    backgroundColor: colors.secondaryLight,
  },
  badgeOccupied: {
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextEmpty: {
    color: colors.secondary,
  },
  statusTextOccupied: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: spacing.xs,
  },
  bodyOccupied: {
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  subtotalValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  timeText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  bodyEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyActionText: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '700',
  },
});
