import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Category } from '../types';
import { colors, spacing } from '../constants/theme';

interface CategorySelectorProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  label?: string;
  error?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  label = 'Loại món ăn',
  error,
}) => {
  const row1: Category[] = ['Khai vị', 'Món chính'];
  const row2: Category[] = ['Tráng miệng', 'Đồ uống'];

  const renderButton = (category: Category) => {
    const isSelected = selectedCategory === category;
    return (
      <TouchableOpacity
        key={category}
        activeOpacity={0.7}
        style={[
          styles.categoryButton,
          isSelected ? styles.categoryButtonSelected : styles.categoryButtonUnselected,
        ]}
        onPress={() => onSelectCategory(category)}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected ? styles.categoryTextSelected : styles.categoryTextUnselected,
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.buttonRow}>
        {row1.map(renderButton)}
      </View>
      <View style={styles.buttonRow}>
        {row2.map(renderButton)}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  categoryButtonUnselected: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextUnselected: {
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
});
