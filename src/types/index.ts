export type Category = 'Khai vị' | 'Món chính' | 'Tráng miệng' | 'Đồ uống';

export const CATEGORIES: Category[] = ['Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống'];

export interface Dish {
  id: string;
  name: string;
  category: Category;
  price: number;
  available: boolean;
  image?: string; // URL hình ảnh món ăn
}

export interface OrderItem {
  dishId: string;
  quantity: number;
}

export type OrderStatus = 'Đang phục vụ' | 'Đã thanh toán';

export interface Order {
  id: string;
  tableNumber: number; // 1 -> 10
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string; // "hh:mm dd/mm/yyyy"
}

export interface DishSection {
  title: Category;
  data: Dish[];
}

export type RootStackParamList = {
  MainTabs: undefined;
  DishForm: { dish?: Dish };
  Order: { tableNumber: number };
  Payment: { orderId: string };
  BillHistory: undefined;
};
