import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useRestaurant } from '../context/RestaurantContext';
import { Category, RootStackParamList } from '../types';
import { FOOD_IMAGE_PRESETS } from '../storage/initialData';
import { CategorySelector } from '../components/CategorySelector';
import { colors, spacing, shadows } from '../constants/theme';

type DishFormRouteProp = RouteProp<RootStackParamList, 'DishForm'>;

export const DishFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<DishFormRouteProp>();
  const { addDish, updateDish } = useRestaurant();

  const editingDish = route.params?.dish;
  const isEditing = !!editingDish;

  // Form states
  const [name, setName] = useState<string>(editingDish?.name || '');
  const [category, setCategory] = useState<Category>(editingDish?.category || 'Món chính');
  const [price, setPrice] = useState<string>(
    editingDish?.price ? editingDish.price.toString() : '',
  );
  const [image, setImage] = useState<string>(
    editingDish?.image || FOOD_IMAGE_PRESETS[2].url,
  );

  // Error states
  const [nameError, setNameError] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');

  const validate = (): boolean => {
    let isValid = true;
    setNameError('');
    setPriceError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Tên món ăn không được để trống!');
      isValid = false;
    }

    const parsedPrice = parseInt(price, 10);
    if (!price.trim()) {
      setPriceError('Giá món không được để trống!');
      isValid = false;
    } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setPriceError('Giá bán phải là số lớn hơn 0!');
      isValid = false;
    } else if (parsedPrice % 1000 !== 0) {
      setPriceError('Giá bán phải là bội số của 1.000 VNĐ (ví dụ: 30000, 45000)!');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const parsedPrice = parseInt(price.trim(), 10);

    if (isEditing && editingDish) {
      const result = updateDish({
        ...editingDish,
        name: name.trim(),
        category,
        price: parsedPrice,
        image: image.trim(),
      });

      if (!result.success) {
        setNameError(result.message || 'Lỗi khi cập nhật món!');
        return;
      }

      Alert.alert('Thành công', `Đã cập nhật món "${name.trim()}"!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      const result = addDish({
        name: name.trim(),
        category,
        price: parsedPrice,
        available: true,
        image: image.trim(),
      });

      if (!result.success) {
        setNameError(result.message || 'Lỗi khi thêm món!');
        return;
      }

      Alert.alert('Thành công', `Đã thêm món "${name.trim()}" vào thực đơn!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            {isEditing ? 'Sửa thông tin món ăn' : 'Thêm món ăn mới'}
          </Text>

          {/* Khung xem trước hình ảnh món ăn */}
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80' }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.previewOverlay}>
              <Text style={styles.previewTag}>Xem trước hình ảnh</Text>
            </View>
          </View>

          {/* Chọn ảnh nhanh từ Preset */}
          <Text style={styles.label}>Chọn ảnh mẫu món ăn:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {FOOD_IMAGE_PRESETS.map((preset, idx) => {
              const isSelected = image === preset.url;
              return (
                <TouchableOpacity
                  key={`preset_${idx}`}
                  style={[styles.presetItem, isSelected && styles.presetItemSelected]}
                  activeOpacity={0.7}
                  onPress={() => setImage(preset.url)}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Ô nhập tên món */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Tên món ăn <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, !!nameError && styles.inputError]}
              placeholder="Ví dụ: Bò lúc lắc, Trà đào..."
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={text => {
                setName(text);
                if (nameError) setNameError('');
              }}
              autoCapitalize="sentences"
            />
            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
          </View>

          {/* Chọn loại món bằng nút bấm (Câu 2) */}
          <CategorySelector
            label="Loại món ăn"
            selectedCategory={category}
            onSelectCategory={cat => setCategory(cat)}
          />

          {/* Ô nhập giá món */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Giá bán (VNĐ) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, !!priceError && styles.inputError]}
              placeholder="Ví dụ: 45000, 120000..."
              placeholderTextColor={colors.textMuted}
              value={price}
              onChangeText={text => {
                const numericOnly = text.replace(/[^0-9]/g, '');
                setPrice(numericOnly);
                if (priceError) setPriceError('');
              }}
              keyboardType="numeric"
            />
            <Text style={styles.hint}>Lưu ý: Giá phải lớn hơn 0 và là bội số của 1.000</Text>
            {!!priceError && <Text style={styles.errorText}>{priceError}</Text>}
          </View>

          {/* Nút Lưu */}
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.7}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Lưu thay đổi' : '+ Thêm vào thực đơn'}
            </Text>
          </TouchableOpacity>

          {/* Nút Huỷ */}
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewTag: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  presetScroll: {
    marginBottom: spacing.md,
  },
  presetItem: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetItemSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  presetTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.card,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
