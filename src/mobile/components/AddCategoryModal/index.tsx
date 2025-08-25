import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDemoMode } from '../../../../contexts/DemoModeContext';
import { budgetCategoryService } from '../../../../services/budgetCategoryService';
import { BudgetCategory } from '../../../../types/budget';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryAdded: (category: BudgetCategory) => void;
  transactionType?: 'expense' | 'income';
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ 
  visible, 
  onClose, 
  onCategoryAdded,
  transactionType = 'expense'
}) => {
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [selectedRingColor, setSelectedRingColor] = useState('#047857');
  const [frequency, setFrequency] = useState('monthly');
  const [strategy, setStrategy] = useState('zero-based');
  const [loading, setLoading] = useState(false);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    primary: '#10B981',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    danger: '#EF4444',
  } : {
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#10B981',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    danger: '#EF4444',
  };

  const categoryColors = [
    { bg: '#10B981', ring: '#047857', name: 'Green' },
    { bg: '#3B82F6', ring: '#1E40AF', name: 'Blue' },
    { bg: '#F59E0B', ring: '#D97706', name: 'Amber' },
    { bg: '#EF4444', ring: '#DC2626', name: 'Red' },
    { bg: '#8B5CF6', ring: '#7C3AED', name: 'Purple' },
    { bg: '#EC4899', ring: '#DB2777', name: 'Pink' },
    { bg: '#06B6D4', ring: '#0891B2', name: 'Cyan' },
    { bg: '#84CC16', ring: '#65A30D', name: 'Lime' },
  ];

  const frequencies = ['monthly', 'quarterly', 'annual', 'custom'];
  const strategies = ['zero-based', 'ai-powered', 'envelope', 'rolling'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (!budgetLimit.trim() || isNaN(parseFloat(budgetLimit))) {
      Alert.alert('Error', 'Please enter a valid budget limit');
      return;
    }

    setLoading(true);
    try {
      const newCategory: Omit<BudgetCategory, 'id'> = {
        name: name.trim(),
        percentage: 0,
        limit: parseFloat(budgetLimit),
        spent: 0,
        remaining: parseFloat(budgetLimit),
        bgColor: selectedColor,
        ringColor: selectedRingColor,
        subcategories: [],
        is_active: true,
        status: 'not_set',
        display_order: 0,
        description: description.trim() || undefined,
        frequency,
        strategy,
        category_type: transactionType,
        start_date: new Date().toISOString(),
      };

      const createdCategory = await budgetCategoryService.createCategory(newCategory, isDemo);
      
      onCategoryAdded(createdCategory);
      handleClose();
      
      Alert.alert('Success', `${transactionType === 'income' ? 'Income' : 'Expense'} category created successfully!`);
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setBudgetLimit('');
    setSelectedColor('#10B981');
    setSelectedRingColor('#047857');
    setFrequency('monthly');
    setStrategy('zero-based');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Add {transactionType === 'income' ? 'Income' : 'Expense'} Category
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Category Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder={`Enter ${transactionType} category name`}
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Optional description"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* Budget Limit */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Budget Limit <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.amountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={budgetLimit}
                onChangeText={(text) => {
                  // Only allow numbers and one decimal point
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  const parts = numericValue.split('.');
                  if (parts.length > 2) {
                    setBudgetLimit(parts[0] + '.' + parts.slice(1).join(''));
                  } else {
                    setBudgetLimit(numericValue);
                  }
                }}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Category Color</Text>
            <View style={styles.colorGrid}>
              {categoryColors.map((colorOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: colorOption.bg },
                    selectedColor === colorOption.bg && styles.selectedColorOption
                  ]}
                  onPress={() => {
                    setSelectedColor(colorOption.bg);
                    setSelectedRingColor(colorOption.ring);
                  }}
                >
                  {selectedColor === colorOption.bg && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Budget Frequency</Text>
            <View style={styles.optionGrid}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    frequency === freq && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setFrequency(freq)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: frequency === freq ? 'white' : colors.text }
                  ]}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Strategy */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Budget Strategy</Text>
            <View style={styles.optionGrid}>
              {strategies.map((strat) => (
                <TouchableOpacity
                  key={strat}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    strategy === strat && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setStrategy(strat)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: strategy === strat ? 'white' : colors.text }
                  ]}>
                    {strat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Creating...' : 'Create Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    paddingTop: 14,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 32,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AddCategoryModal;
