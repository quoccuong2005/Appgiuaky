import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRestaurant } from '../context/RestaurantContext';
import { Dish, DishSection, RootStackParamList, CATEGORIES } from '../types';
import { DishCard } from '../components/DishCard';
import { HeaderInfo } from '../components/HeaderInfo';
import { EmptyState } from '../components/EmptyState';
import { colors, spacing, shadows } from '../constants/theme';

type MenuScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MenuScreen: React.FC = () => {
  const navigation = useNavigation<MenuScreenNavigationProp>();
  const {
    dishes,
    totalDishesCount,
    occupiedTablesCount,
    toggleDishAvailability,
    deleteDish,
  } = useRestaurant();

  // Nhóm món ăn theo loại (SectionList)
  const sections: DishSection[] = CATEGORIES.map(category => ({
    title: category,
    data: dishes.filter(dish => dish.category === category),
  })).filter(section => section.data.length > 0);

  // Xử lý xoá món ăn khi nhấn giữ (Câu 3)
  const handleLongPressDish = (dish: Dish) => {
    Alert.alert(
      'Xác nhận xoá món',
      `Bạn có chắc chắn muốn xoá món "${dish.name}" khỏi thực đơn không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => {
            const result = deleteDish(dish.id);
            if (!result.success) {
              // Báo lỗi bằng Alert nếu món đang có trong hoá đơn đang phục vụ
              Alert.alert('Không thể xoá', result.message || 'Món ăn không thể xoá!');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Mở form sửa món khi bấm vào dòng món ăn (Câu 2)
  const handlePressDish = (dish: Dish) => {
    navigation.navigate('DishForm', { dish });
  };

  return (
    <View style={styles.container}>
      {/* Đầu màn hình: Hiển thị tổng số món và số bàn có khách (Câu 1) */}
      <HeaderInfo
        totalDishes={totalDishesCount}
        occupiedTables={occupiedTablesCount}
        totalTables={10}
      />

      {/* Nút "+ Thêm món" mở màn hình form (Câu 2) */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('DishForm', {})}
        >
          <Text style={styles.addButtonText}>+ Thêm món mới</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách thực đơn bằng SectionList nhóm theo loại món (Câu 1) */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            onToggleAvailability={toggleDishAvailability}
            onPress={handlePressDish}
            onLongPress={handleLongPressDish}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="Thực đơn trống"
            description="Chưa có món ăn nào trong thực đơn. Hãy thêm món mới!"
            actionText="+ Thêm món ngay"
            onAction={() => navigation.navigate('DishForm', {})}
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
  topActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
});
