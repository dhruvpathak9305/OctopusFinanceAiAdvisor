import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';

// Mock data for budget categories
const mockBudgetData = {
  expense: [
    {
      name: 'Needs',
      percentage: 60,
      color: '#10B981',
      amount: 1800,
      limit: 3000,
      icon: 'home',
    },
    {
      name: 'Wants',
      percentage: 30,
      color: '#F59E0B',
      amount: 900,
      limit: 3000,
      icon: 'heart',
    },
    {
      name: 'Save',
      percentage: 10,
      color: '#3B82F6',
      amount: 300,
      limit: 3000,
      icon: 'piggy-bank',
    },
  ],
  income: [
    {
      name: 'Side Income',
      percentage: 25,
      color: '#F59E0B',
      amount: 500,
      limit: 2000,
      icon: 'carrot',
    },
    {
      name: 'Earned Income',
      percentage: 80,
      color: '#3B82F6',
      amount: 4000,
      limit: 5000,
      icon: 'briefcase',
    },
    {
      name: 'Passive Income',
      percentage: 15,
      color: '#8B5CF6',
      amount: 300,
      limit: 2000,
      icon: 'chart-line',
    },
    {
      name: 'Government & Benefits',
      percentage: 0,
      color: '#06B6D4',
      amount: 0,
      limit: 1000,
      icon: 'building',
    },
    {
      name: 'Windfall Income',
      percentage: 0,
      color: '#10B981',
      amount: 0,
      limit: 500,
      icon: 'gift',
    },
    {
      name: 'Reimbursements',
      percentage: 0,
      color: '#3B82F6',
      amount: 0,
      limit: 300,
      icon: 'receipt',
    },
  ],
  all: [
    // Expense categories
    {
      name: 'Needs',
      percentage: 60,
      color: '#10B981',
      amount: 1800,
      limit: 3000,
      icon: 'home',
      type: 'expense',
    },
    {
      name: 'Wants',
      percentage: 30,
      color: '#F59E0B',
      amount: 900,
      limit: 3000,
      icon: 'heart',
      type: 'expense',
    },
    {
      name: 'Save',
      percentage: 10,
      color: '#3B82F6',
      amount: 300,
      limit: 3000,
      icon: 'piggy-bank',
      type: 'expense',
    },
    // Income categories
    {
      name: 'Side Income',
      percentage: 25,
      color: '#F59E0B',
      amount: 500,
      limit: 2000,
      icon: 'carrot',
      type: 'income',
    },
    {
      name: 'Earned Income',
      percentage: 80,
      color: '#3B82F6',
      amount: 4000,
      limit: 5000,
      icon: 'briefcase',
      type: 'income',
    },
    {
      name: 'Passive Income',
      percentage: 15,
      color: '#8B5CF6',
      amount: 300,
      limit: 2000,
      icon: 'chart-line',
      type: 'income',
    },
    {
      name: 'Government & Benefits',
      percentage: 0,
      color: '#06B6D4',
      amount: 0,
      limit: 1000,
      icon: 'building',
      type: 'income',
    },
    {
      name: 'Windfall Income',
      percentage: 0,
      color: '#10B981',
      amount: 0,
      limit: 500,
      icon: 'gift',
      type: 'income',
    },
    {
      name: 'Reimbursements',
      percentage: 0,
      color: '#3B82F6',
      amount: 0,
      limit: 300,
      icon: 'receipt',
      type: 'income',
    },
  ],
};

type TimePeriod = 'monthly' | 'quarterly' | 'yearly';
type BudgetType = 'expense' | 'income' | 'all';

interface BudgetProgressSectionProps {
  className?: string;
}

// Circular Progress Component
const CircularProgress: React.FC<{
  percentage: number;
  color: string;
  size?: number;
}> = ({ percentage, color, size = 60 }) => {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.circularProgress, { width: size, height: size }]}>
      <View style={[styles.circularProgressTrack, { width: size, height: size, borderRadius: size / 2 }]} />
      <View
        style={[
          styles.circularProgressFill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: '-90deg' }],
          }
        ]}
      />
      <View style={styles.circularProgressText}>
        <Text style={[styles.circularProgressPercentage, { color }]}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

// Dropdown Component
const Dropdown: React.FC<{
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, options, onValueChange, placeholder }) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const colors = isDark ? {
    background: '#374151',
    text: '#FFFFFF',
    border: '#4B5563',
  } : {
    background: '#F3F4F6',
    text: '#111827',
    border: '#D1D5DB',
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.dropdownButton, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
          {value || placeholder}
        </Text>
        <Text style={[styles.dropdownArrow, { color: colors.text }]}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={[styles.dropdownMenu, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dropdownItem,
                value === option && { backgroundColor: '#10B98120' }
              ]}
              onPress={() => {
                onValueChange(option);
                setIsOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                {option}
              </Text>
              {value === option && (
                <Text style={styles.dropdownCheckmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const BudgetProgressSection: React.FC<BudgetProgressSectionProps> = ({ className = "" }) => {
  const { isDark } = useTheme();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [typeFilter, setTypeFilter] = useState<BudgetType>('expense');
  const [activeBudgetSubcategory, setActiveBudgetSubcategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    filterBackground: '#374151',
  } : {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    filterBackground: '#F3F4F6',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleSubcategories = (index: number) => {
    setActiveBudgetSubcategory(activeBudgetSubcategory === index ? null : index);
  };

  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period as TimePeriod);
    setActiveBudgetSubcategory(null);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type as BudgetType);
    setActiveBudgetSubcategory(null);
  };

  const getIconName = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      'home': '🏠',
      'heart': '❤️',
      'piggy-bank': '💰',
      'carrot': '🥕',
      'briefcase': '💼',
      'chart-line': '📈',
      'building': '🏛️',
      'gift': '🎁',
      'receipt': '📄',
    };
    return iconMap[icon] || '📊';
  };

  const getCurrentCategories = () => {
    return mockBudgetData[typeFilter] || [];
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading budget data...
        </Text>
      </View>
    );
  }

  const currentCategories = getCurrentCategories();

  return (
    <View style={styles.container}>
      {/* Header with Filters */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Budget Progress</Text>
        <View style={styles.filters}>
          {/* Type Filter */}
          <Dropdown
            value={typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
            options={['Expense', 'Income', 'All']}
            onValueChange={(value) => handleTypeFilterChange(value.toLowerCase())}
            placeholder="Type"
          />

          {/* Time Period Filter */}
          <Dropdown
            value={timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
            options={['Monthly', 'Quarterly', 'Yearly']}
            onValueChange={(value) => handleTimePeriodChange(value.toLowerCase())}
            placeholder="Period"
          />
        </View>
      </View>

      {/* Budget Categories Grid */}
      <View style={styles.categoriesGrid}>
        {currentCategories.map((category, index) => (
          <TouchableOpacity
            key={`${category.name}-${index}`}
            style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => toggleSubcategories(index)}
          >
            {/* Category Icon */}
            <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
              <Text style={styles.categoryIconText}>{getIconName(category.icon)}</Text>
            </View>

            {/* Category Name */}
            <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>
              {category.name}
            </Text>

            {/* Circular Progress */}
            <CircularProgress
              percentage={category.percentage}
              color={category.color}
              size={50}
            />

            {/* Amount Info */}
            <Text style={[styles.categoryAmount, { color: colors.textSecondary }]}>
              {formatCurrency(category.amount)} / {formatCurrency(category.limit)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subcategory Details */}
      {activeBudgetSubcategory !== null && currentCategories[activeBudgetSubcategory] && (
        <View style={[styles.subcategoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.subcategoryHeader}>
            <View style={styles.subcategoryTitle}>
              <View style={[styles.subcategoryColor, { backgroundColor: currentCategories[activeBudgetSubcategory].color }]} />
              <Text style={[styles.subcategoryTitleText, { color: colors.text }]}>
                {currentCategories[activeBudgetSubcategory].name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setActiveBudgetSubcategory(null)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.subcategoryContent}>
            <Text style={[styles.subcategoryText, { color: colors.textSecondary }]}>
              Detailed information for {currentCategories[activeBudgetSubcategory].name} category.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  dropdownButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dropdownCheckmark: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  categoryAmount: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  circularProgress: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressTrack: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  circularProgressFill: {
    position: 'absolute',
  },
  circularProgressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressPercentage: {
    fontSize: 10,
    fontWeight: '700',
  },
  subcategoryCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subcategoryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  subcategoryTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subcategoryContent: {
    paddingTop: 8,
  },
  subcategoryText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default BudgetProgressSection; 