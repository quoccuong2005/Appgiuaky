import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRestaurant } from '../context/RestaurantContext';
import { RootStackParamList } from '../types';
import { colors, formatCurrency, spacing, shadows } from '../constants/theme';

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentScreenRouteProp>();
  const navigation = useNavigation<PaymentScreenNavProp>();
  const { orderId } = route.params;

  const { getOrderById, dishes, payOrder } = useRestaurant();
  const order = getOrderById(orderId);

  const [customerPaid, setCustomerPaid] = useState<string>('');

  const billDetails = useMemo(() => {
    if (!order || !order.items) {
      return {
        itemsWithDetail: [],
        subtotal: 0,
        vat: 0,
        total: 0,
      };
    }

    const itemsWithDetail = order.items.map(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      const name = dish ? dish.name : 'Món không tồn tại';
      const unitPrice = dish ? dish.price : 0;
      const totalItemPrice = unitPrice * item.quantity;
      return {
        dishId: item.dishId,
        name,
        image: dish?.image,
        quantity: item.quantity,
        unitPrice,
        totalItemPrice,
      };
    });

    const subtotal = itemsWithDetail.reduce((sum, item) => sum + item.totalItemPrice, 0);
    const vat = Math.round(subtotal * 0.08); // VAT 8%
    const total = subtotal + vat;

    return {
      itemsWithDetail,
      subtotal,
      vat,
      total,
    };
  }, [order, dishes]);

  const customerPaidNumber = parseInt(customerPaid.replace(/[^0-9]/g, ''), 10) || 0;
  const changeAmount = customerPaidNumber - billDetails.total;
  const isPaidEnough = customerPaidNumber >= billDetails.total;
  const hasItems = billDetails.itemsWithDetail.length > 0;

  const quickCashOptions = useMemo(() => {
    const total = billDetails.total;
    if (total <= 0) return [];
    const roundUpTo50k = Math.ceil(total / 50000) * 50000;
    const roundUpTo100k = Math.ceil(total / 100000) * 100000;
    const roundUpTo500k = Math.ceil(total / 500000) * 500000;
    const set = new Set([total, roundUpTo50k, roundUpTo100k, roundUpTo500k]);
    return Array.from(set).filter(amount => amount >= total).slice(0, 4);
  }, [billDetails.total]);

  const handleConfirmPayment = () => {
    if (!hasItems) {
      Alert.alert('Lỗi', 'Hoá đơn không có món nào để thanh toán!');
      return;
    }

    if (!isPaidEnough) {
      Alert.alert(
        'Chưa đủ tiền',
        `Số tiền khách đưa (${formatCurrency(
          customerPaidNumber,
        )}) còn thiếu ${formatCurrency(
          Math.abs(changeAmount),
        )} so với tổng hoá đơn!`,
      );
      return;
    }

    Alert.alert(
      'Xác nhận thanh toán',
      `Xác nhận thanh toán cho Bàn ${order?.tableNumber}?\nTổng cộng: ${formatCurrency(
        billDetails.total,
      )}\nTiền thừa trả khách: ${formatCurrency(changeAmount)}`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'default',
          onPress: () => {
            if (order) {
              payOrder(order.id);
              Alert.alert(
                'Thanh toán thành công 🎉',
                `Đã thanh toán hoá đơn Bàn ${order.tableNumber}.\nTiền thừa thối khách: ${formatCurrency(
                  changeAmount,
                )}\nBàn đã trở về trạng thái trống!`,
                [
                  {
                    text: 'Về sơ đồ bàn',
                    onPress: () => {
                      if (navigation.canGoBack()) {
                        navigation.popToTop();
                      } else {
                        navigation.navigate('MainTabs');
                      }
                    },
                  },
                ],
              );
            }
          },
        },
      ],
    );
  };

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin hoá đơn!</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Card hoá đơn */}
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <Text style={styles.restaurantName}>NHÀ HÀNG HỌC VIỆN</Text>
            <Text style={styles.billTitle}>HOÁ ĐƠN THANH TOÁN</Text>
            <View style={styles.infoRow}>
              <Text style={styles.billMeta}>Bàn: <Text style={styles.boldText}>{order.tableNumber}</Text></Text>
              <Text style={styles.billMeta}>Mã HĐ: <Text style={styles.boldText}>{order.id.slice(-6)}</Text></Text>
            </View>
            <Text style={styles.billDate}>Thời gian: {order.createdAt}</Text>
          </View>

          <View style={styles.dashedDivider} />

          {/* Bảng chi tiết từng món */}
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colName]}>Món</Text>
            <Text style={[styles.th, styles.colQty]}>SL</Text>
            <Text style={[styles.th, styles.colPrice]}>Đơn giá</Text>
            <Text style={[styles.th, styles.colTotal]}>T.Tiền</Text>
          </View>

          {billDetails.itemsWithDetail.map((item, index) => (
            <View key={`${item.dishId}_${index}`} style={styles.tableRow}>
              <View style={styles.colNameContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.miniThumb} resizeMode="cover" />
                ) : null}
                <Text style={[styles.td, styles.colNameText]} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colPrice]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.td, styles.colTotal, styles.boldText]}>
                {formatCurrency(item.totalItemPrice)}
              </Text>
            </View>
          ))}

          <View style={styles.dashedDivider} />

          {/* Tổng kết tiền */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(billDetails.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thuế VAT (8%):</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(billDetails.vat)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TỔNG CỘNG:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(billDetails.total)}
              </Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Nhập số tiền khách đưa */}
          <View style={styles.paymentSection}>
            <Text style={styles.inputSectionTitle}>Tiền khách đưa (VNĐ):</Text>
            <TextInput
              style={[
                styles.cashInput,
                customerPaidNumber > 0 && !isPaidEnough && styles.cashInputWarning,
                isPaidEnough && styles.cashInputSuccess,
              ]}
              placeholder="Nhập số tiền khách đưa..."
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={customerPaid}
              onChangeText={text => setCustomerPaid(text.replace(/[^0-9]/g, ''))}
            />

            {/* Nút gợi ý tiền chẵn */}
            <View style={styles.quickOptionsRow}>
              {quickCashOptions.map(amount => (
                <TouchableOpacity
                  key={`quick_${amount}`}
                  style={styles.quickOptionBtn}
                  activeOpacity={0.7}
                  onPress={() => setCustomerPaid(amount.toString())}
                >
                  <Text style={styles.quickOptionText}>{formatCurrency(amount)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tiền thừa */}
            <View
              style={[
                styles.changeBox,
                isPaidEnough ? styles.changeBoxSuccess : styles.changeBoxWarning,
              ]}
            >
              <Text style={styles.changeLabel}>
                {customerPaidNumber === 0
                  ? 'Chưa nhập tiền khách đưa'
                  : isPaidEnough
                  ? 'Tiền thừa thối khách:'
                  : 'Còn thiếu:'}
              </Text>
              <Text
                style={[
                  styles.changeValue,
                  isPaidEnough ? styles.changeValueSuccess : styles.changeValueWarning,
                ]}
              >
                {customerPaidNumber === 0
                  ? '0 đ'
                  : formatCurrency(Math.abs(changeAmount))}
              </Text>
            </View>
          </View>
        </View>

        {/* Nút xác nhận thanh toán */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (!isPaidEnough || !hasItems) && styles.confirmBtnDisabled,
          ]}
          activeOpacity={0.7}
          onPress={handleConfirmPayment}
          disabled={!isPaidEnough || !hasItems}
        >
          <Text style={styles.confirmBtnText}>
            ✓ XÁC NHẬN THANH TOÁN
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelBtnText}>Quay lại chỉnh sửa gọi món</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  backBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  billCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  billHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  billTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.xs,
  },
  billMeta: {
    fontSize: 13,
    color: colors.text,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
  billDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderColor: '#CFD8DC',
    borderStyle: 'dashed',
    marginVertical: spacing.md,
  },
  tableHead: {
    flexDirection: 'row',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  th: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  colNameContainer: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
    gap: 6,
  },
  miniThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  colNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  td: {
    fontSize: 13,
    color: colors.text,
  },
  colName: {
    flex: 3,
  },
  colQty: {
    flex: 0.8,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1.8,
    textAlign: 'right',
  },
  colTotal: {
    flex: 2,
    textAlign: 'right',
  },
  summaryContainer: {
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  paymentSection: {
    marginTop: spacing.xs,
  },
  inputSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cashInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cashInputWarning: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  cashInputSuccess: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  quickOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  quickOptionBtn: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  changeBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeBoxSuccess: {
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  changeBoxWarning: {
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  changeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  changeValueSuccess: {
    color: colors.secondary,
  },
  changeValueWarning: {
    color: colors.danger,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  confirmBtnDisabled: {
    backgroundColor: '#BDBDBD',
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
