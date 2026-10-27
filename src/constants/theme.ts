export const colors = {
  primary: '#E65100', // Cam đậm ngon mắt cho nhà hàng
  primaryLight: '#FFF3E0',
  primaryDark: '#BF360C',
  secondary: '#2E7D32', // Xanh lá cây cho trạng thái / bàn trống
  secondaryLight: '#E8F5E9',
  accent: '#FF9800',
  background: '#F5F6FA',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#666666',
  textMuted: '#9E9E9E',
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  danger: '#D32F2F',
  dangerLight: '#FFEBEE',
  warning: '#F57C00',
  warningLight: '#FFF8E1',
  success: '#388E3C',
  tableOccupied: '#E65100', // Bàn có khách: cam đậm nổi bật
  tableOccupiedLight: '#FFE0B2',
  tableEmpty: '#2E7D32', // Bàn trống: xanh lá
  tableEmptyLight: '#E8F8F0',
};

export const typography = {
  fontFamily: undefined, // Dùng system font chuẩn đẹp
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  floating: {
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 đ';
  }
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
};
