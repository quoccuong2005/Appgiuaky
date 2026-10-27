import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dish, Order, OrderItem } from '../types';
import {
  loadDishesFromStorage,
  saveDishesToStorage,
  loadOrdersFromStorage,
  saveOrdersToStorage,
} from '../storage/asyncStorage';

interface RestaurantContextType {
  dishes: Dish[];
  orders: Order[];
  isLoading: boolean;
  addDish: (dish: Omit<Dish, 'id'>) => { success: boolean; message?: string };
  updateDish: (dish: Dish) => { success: boolean; message?: string };
  deleteDish: (id: string) => { success: boolean; message?: string };
  toggleDishAvailability: (id: string) => void;
  getActiveOrderByTable: (tableNumber: number) => Order | undefined;
  getOrderById: (orderId: string) => Order | undefined;
  saveTableOrder: (tableNumber: number, items: OrderItem[]) => Order | undefined;
  payOrder: (orderId: string) => void;
  getDishById: (id: string) => Dish | undefined;
  occupiedTablesCount: number;
  totalDishesCount: number;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const getCurrentTimeString = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const year = now.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khởi tạo dữ liệu từ AsyncStorage khi mở app
  useEffect(() => {
    const initData = async () => {
      try {
        const storedDishes = await loadDishesFromStorage();
        const storedOrders = await loadOrdersFromStorage();
        setDishes(storedDishes);
        setOrders(storedOrders);
      } catch (err) {
        console.error('Lỗi khi khởi tạo Context:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const getDishById = (id: string): Dish | undefined => {
    return dishes.find(d => d.id === id);
  };

  const getActiveOrderByTable = (tableNumber: number): Order | undefined => {
    return orders.find(o => o.tableNumber === tableNumber && o.status === 'Đang phục vụ');
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(o => o.id === orderId);
  };

  // Tính số bàn đang có khách (status: "Đang phục vụ")
  const occupiedTables = new Set(
    orders.filter(o => o.status === 'Đang phục vụ' && o.items.length > 0).map(o => o.tableNumber),
  );
  const occupiedTablesCount = occupiedTables.size;
  const totalDishesCount = dishes.length;

  // Thêm món ăn mới
  const addDish = (newDishData: Omit<Dish, 'id'>): { success: boolean; message?: string } => {
    const cleanName = newDishData.name.trim();

    // Kiểm tra trùng tên (không phân biệt hoa/thường)
    const isDuplicate = dishes.some(
      d => d.name.trim().toLowerCase() === cleanName.toLowerCase(),
    );
    if (isDuplicate) {
      return { success: false, message: 'Tên món ăn đã tồn tại, vui lòng chọn tên khác!' };
    }

    const newDish: Dish = {
      ...newDishData,
      id: `dish_${Date.now()}`,
      name: cleanName,
    };

    const updatedDishes = [...dishes, newDish];
    setDishes(updatedDishes);
    saveDishesToStorage(updatedDishes);
    return { success: true };
  };

  // Sửa món ăn
  const updateDish = (updatedDish: Dish): { success: boolean; message?: string } => {
    const cleanName = updatedDish.name.trim();

    // Kiểm tra trùng tên với món khác (trừ chính nó)
    const isDuplicate = dishes.some(
      d => d.id !== updatedDish.id && d.name.trim().toLowerCase() === cleanName.toLowerCase(),
    );
    if (isDuplicate) {
      return { success: false, message: 'Tên món ăn đã bị trùng với một món khác!' };
    }

    const updatedDishes = dishes.map(d =>
      d.id === updatedDish.id ? { ...updatedDish, name: cleanName } : d,
    );
    setDishes(updatedDishes);
    saveDishesToStorage(updatedDishes);
    return { success: true };
  };

  // Xoá món ăn (Câu 3)
  const deleteDish = (id: string): { success: boolean; message?: string } => {
    const dishToDelete = dishes.find(d => d.id === id);
    if (!dishToDelete) {
      return { success: false, message: 'Không tìm thấy món ăn cần xoá!' };
    }

    // Kiểm tra: Không cho xoá món đang có trong một hoá đơn "Đang phục vụ"
    const activeOrdersWithDish = orders.filter(
      order =>
        order.status === 'Đang phục vụ' &&
        order.items.some(item => item.dishId === id && item.quantity > 0),
    );

    if (activeOrdersWithDish.length > 0) {
      const tableNumbers = activeOrdersWithDish.map(o => `Bàn ${o.tableNumber}`).join(', ');
      return {
        success: false,
        message: `Món "${dishToDelete.name}" đang có trong hoá đơn đang phục vụ của ${tableNumbers}. Không thể xoá!`,
      };
    }

    const updatedDishes = dishes.filter(d => d.id !== id);
    setDishes(updatedDishes);
    saveDishesToStorage(updatedDishes);
    return { success: true };
  };

  // Bật/tắt trạng thái còn món (Câu 1 Switch)
  const toggleDishAvailability = (id: string) => {
    const updatedDishes = dishes.map(d => (d.id === id ? { ...d, available: !d.available } : d));
    setDishes(updatedDishes);
    saveDishesToStorage(updatedDishes);
  };

  // Lưu hoặc cập nhật gọi món cho bàn (Câu 4)
  const saveTableOrder = (tableNumber: number, items: OrderItem[]): Order | undefined => {
    const existingOrder = getActiveOrderByTable(tableNumber);
    const validItems = items.filter(item => item.quantity > 0);

    let updatedOrders: Order[];
    let targetOrder: Order | undefined;

    if (existingOrder) {
      if (validItems.length === 0) {
        // Nếu bỏ hết món, xoá hoá đơn phục vụ của bàn đó
        updatedOrders = orders.filter(o => o.id !== existingOrder.id);
        targetOrder = undefined;
      } else {
        // Cập nhật lại danh sách món
        targetOrder = {
          ...existingOrder,
          items: validItems,
        };
        updatedOrders = orders.map(o => (o.id === existingOrder.id ? targetOrder! : o));
      }
    } else {
      if (validItems.length > 0) {
        // Tạo hoá đơn mới
        targetOrder = {
          id: `order_${Date.now()}_tbl${tableNumber}`,
          tableNumber,
          items: validItems,
          status: 'Đang phục vụ',
          createdAt: getCurrentTimeString(),
        };
        updatedOrders = [...orders, targetOrder];
      } else {
        return undefined;
      }
    }

    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    return targetOrder;
  };

  // Thanh toán hoá đơn (Câu 5)
  const payOrder = (orderId: string) => {
    const updatedOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: 'Đã thanh toán' as const } : o,
    );
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
  };

  return (
    <RestaurantContext.Provider
      value={{
        dishes,
        orders,
        isLoading,
        addDish,
        updateDish,
        deleteDish,
        toggleDishAvailability,
        getActiveOrderByTable,
        getOrderById,
        saveTableOrder,
        payOrder,
        getDishById,
        occupiedTablesCount,
        totalDishesCount,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant phải được sử dụng bên trong RestaurantProvider');
  }
  return context;
};
