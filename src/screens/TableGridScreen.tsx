import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRestaurant } from '../context/RestaurantContext';
import { RootStackParamList } from '../types';
import { TableCard } from '../components/TableCard';
import { HeaderInfo } from '../components/HeaderInfo';
import { colors, spacing, shadows } from '../constants/theme';

type TableGridNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 10 bàn cố định (từ Bàn 1 đến Bàn 10 theo đề bài)
const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);

export const TableGridScreen: React.FC = () => {
  const navigation = useNavigation<TableGridNavigationProp>();
  const {
    dishes,
    orders,
    occupiedTablesCount,
    totalDishesCount,
    getActiveOrderByTable,
  } = useRestaurant();

  const handleTablePress = (tableNumber: number) => {
    // Mở màn hình gọi món cho bàn đã chọn (Câu 4)
    navigation.navigate('Order', { tableNumber });
  };

  return (
    <View style={styles.container}>
      {/* Thông tin đầu màn hình (Câu 1) */}
      <HeaderInfo
        totalDishes={totalDishesCount}
        occupiedTables={occupiedTablesCount}
        totalTables={10}
      />

      <View style={styles.subHeader}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.secondaryLight, borderColor: colors.secondary }]} />
            <Text style={styles.legendText}>Bàn trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FFF8F1', borderColor: colors.primary }]} />
            <Text style={styles.legendText}>Đang phục vụ</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('BillHistory')}
        >
          <Text style={styles.historyButtonText}>📜 Lịch sử HĐ</Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị 10 bàn dạng lưới bằng FlatList với numColumns (Câu 4) */}
      <FlatList
        data={TABLES}
        keyExtractor={item => `table_${item}`}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => {
          const activeOrder = getActiveOrderByTable(item);
          return (
            <TableCard
              tableNumber={item}
              order={activeOrder}
              dishes={dishes}
              onPress={handleTablePress}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  historyButton: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  gridContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
