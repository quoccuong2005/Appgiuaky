import { Dish, Order } from '../types';

export const INITIAL_DISHES: Dish[] = [
  // Khai vị
  {
    id: 'dish_1',
    name: 'Gỏi ngó sen tôm thịt',
    category: 'Khai vị',
    price: 65000,
    available: true,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  },
  {
    id: 'dish_2',
    name: 'Súp cua măng tây',
    category: 'Khai vị',
    price: 45000,
    available: true,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
  },
  {
    id: 'dish_3',
    name: 'Chả giò hải sản giòn',
    category: 'Khai vị',
    price: 55000,
    available: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
  },

  // Món chính
  {
    id: 'dish_4',
    name: 'Bò lúc lắc khoai tây',
    category: 'Món chính',
    price: 120000,
    available: true,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
  },
  {
    id: 'dish_5',
    name: 'Cơm chiên hải sản',
    category: 'Món chính',
    price: 85000,
    available: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
  },
  {
    id: 'dish_6',
    name: 'Lẩu thái hải sản chua cay',
    category: 'Món chính',
    price: 250000,
    available: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
  },
  {
    id: 'dish_7',
    name: 'Gà hấp lá chanh',
    category: 'Món chính',
    price: 150000,
    available: false, // Demo trạng thái hết món
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80',
  },

  // Tráng miệng
  {
    id: 'dish_8',
    name: 'Chè hạt sen long nhãn',
    category: 'Tráng miệng',
    price: 30000,
    available: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
  },
  {
    id: 'dish_9',
    name: 'Bánh flan caramel',
    category: 'Tráng miệng',
    price: 25000,
    available: true,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80',
  },

  // Đồ uống
  {
    id: 'dish_10',
    name: 'Trà đào cam sả',
    category: 'Đồ uống',
    price: 35000,
    available: true,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  },
  {
    id: 'dish_11',
    name: 'Nước ép dưa hấu tươi',
    category: 'Đồ uống',
    price: 30000,
    available: true,
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400&q=80',
  },
  {
    id: 'dish_12',
    name: 'Bia Heineken lon',
    category: 'Đồ uống',
    price: 28000,
    available: true,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'order_table_3',
    tableNumber: 3,
    items: [
      { dishId: 'dish_4', quantity: 1 },
      { dishId: 'dish_5', quantity: 2 },
      { dishId: 'dish_10', quantity: 2 },
    ],
    status: 'Đang phục vụ',
    createdAt: '11:30 28/10/2026',
  },
];

export const FOOD_IMAGE_PRESETS: { label: string; url: string }[] = [
  { label: '🥗 Khai vị / Gỏi', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80' },
  { label: '🍲 Súp nóng', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' },
  { label: '🥩 Thịt bò / Bò lúc lắc', url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80' },
  { label: '🍚 Cơm chiên', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80' },
  { label: '🥘 Lẩu / Hải sản', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
  { label: '🍗 Thịt gà', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80' },
  { label: '🍨 Chè / Bánh flan', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80' },
  { label: '🍹 Trà / Nước ép', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
];
