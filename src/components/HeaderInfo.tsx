import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, shadows } from '../constants/theme';

interface HeaderInfoProps {
  totalDishes: number;
  occupiedTables: number;
  totalTables?: number;
}

export const HeaderInfo: React.FC<HeaderInfoProps> = ({
  totalDishes,
  occupiedTables,
  totalTables = 10,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.badgeContainer}>
        <View style={styles.dot} />
        <Text style={styles.text}>
          <Text style={styles.boldText}>{totalDishes} món</Text>
          <Text style={styles.separator}> · </Text>
          <Text style={styles.boldText}>
            {occupiedTables}/{totalTables} bàn có khách
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: 12,
    ...shadows.card,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: 14,
    color: colors.text,
  },
  boldText: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  separator: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
