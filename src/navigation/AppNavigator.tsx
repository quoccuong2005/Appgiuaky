import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { DishFormScreen } from '../screens/DishFormScreen';
import { OrderScreen } from '../screens/OrderScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { BillHistoryScreen } from '../screens/BillHistoryScreen';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={HomeScreen}
          options={{
            title: 'Quản Lý Nhà Hàng 🍽️',
          }}
        />

        <Stack.Screen
          name="DishForm"
          component={DishFormScreen}
          options={({ route }) => ({
            title: route.params?.dish ? 'Sửa Món Ăn' : 'Thêm Món Ăn',
          })}
        />

        <Stack.Screen
          name="Order"
          component={OrderScreen}
          options={({ route }) => ({
            title: `Gọi Món - Bàn ${route.params.tableNumber}`,
          })}
        />

        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            title: 'Thanh Toán Hoá Đơn',
          }}
        />

        <Stack.Screen
          name="BillHistory"
          component={BillHistoryScreen}
          options={{
            title: 'Lịch Sử Hoá Đơn Đã Thanh Toán',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
