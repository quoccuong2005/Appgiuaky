import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { MenuScreen } from './MenuScreen';
import { TableGridScreen } from './TableGridScreen';
import { colors, spacing, shadows } from '../constants/theme';

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'tables'>('tables');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Thanh chuyển đổi Tab (Thực đơn / Sơ đồ bàn) */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tables' && styles.tabButtonActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab('tables')}
          >
            <Text style={[styles.tabIcon]}>🪑</Text>
            <Text
              style={[
                styles.tabTitle,
                activeTab === 'tables' && styles.tabTitleActive,
              ]}
            >
              Sơ đồ bàn (10 bàn)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'menu' && styles.tabButtonActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab('menu')}
          >
            <Text style={[styles.tabIcon]}>📖</Text>
            <Text
              style={[
                styles.tabTitle,
                activeTab === 'menu' && styles.tabTitleActive,
              ]}
            >
              Thực đơn món
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nội dung Tab */}
        <View style={styles.content}>
          {activeTab === 'tables' ? <TableGridScreen /> : <MenuScreen />}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.card,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTitleActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
