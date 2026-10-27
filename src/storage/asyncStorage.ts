import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dish, Order } from '../types';
import { INITIAL_DISHES, INITIAL_ORDERS } from './initialData';

const DISHES_STORAGE_KEY = '@restaurant_dishes_v1';
const ORDERS_STORAGE_KEY = '@restaurant_orders_v1';

export const loadDishesFromStorage = async (): Promise<Dish[]> => {
  try {
    const json = await AsyncStorage.getItem(DISHES_STORAGE_KEY);
    if (json !== null) {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Tự động gắn ảnh từ INITIAL_DISHES nếu món chưa có ảnh (để tương thích ngược)
        const enriched: Dish[] = parsed.map((item: Dish) => {
          if (!item.image) {
            const foundInitial = INITIAL_DISHES.find(d => d.id === item.id || d.name === item.name);
            if (foundInitial?.image) {
              return { ...item, image: foundInitial.image };
            }
          }
          return item;
        });
        await saveDishesToStorage(enriched);
        return enriched;
      }
    }
    // Lần đầu chạy app, nạp dữ liệu mẫu
    await AsyncStorage.setItem(DISHES_STORAGE_KEY, JSON.stringify(INITIAL_DISHES));
    return INITIAL_DISHES;
  } catch (error) {
    console.error('Lỗi khi đọc danh sách món ăn từ AsyncStorage:', error);
    return INITIAL_DISHES;
  }
};

export const saveDishesToStorage = async (dishes: Dish[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(DISHES_STORAGE_KEY, JSON.stringify(dishes));
  } catch (error) {
    console.error('Lỗi khi lưu danh sách món ăn vào AsyncStorage:', error);
  }
};

export const loadOrdersFromStorage = async (): Promise<Order[]> => {
  try {
    const json = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (json !== null) {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  } catch (error) {
    console.error('Lỗi khi đọc danh sách hoá đơn từ AsyncStorage:', error);
    return INITIAL_ORDERS;
  }
};

export const saveOrdersToStorage = async (orders: Order[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Lỗi khi lưu danh sách hoá đơn vào AsyncStorage:', error);
  }
};
