import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import ErrorBoundary from './ErrorBoundary';

interface BudgetSubcategory {
  name: string;
  spent: number;
  limit: number;
}

interface BudgetCategory {
  name: string;
  percentage: number;
  color: string;
  icon: string;
  spent: number;
  limit: number;
  subcategories: BudgetSubcategory[];
}

interface BudgetProgressSectionProps {
  className?: string;
}

const BudgetProgressSection: React.FC<BudgetProgressSectionProps> = ({ className }) => {
  const [selectedFilter, setSelectedFilter] = useState('Expense');
  const [timePeriod, setTimePeriod] = useState('Monthly');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Mock budget data with subcategories - in production this would come from API
  const budgetCategories: BudgetCategory[] = [
    {
      name: 'Needs',
      percentage: 60,
      color: '#10B981',
      icon: '🏠',
      spent: 2400,
      limit: 300000,
      subcategories: [
        { name: 'Rent/Mortgage', spent: 0, limit: 50000 },
        { name: 'Utilities', spent: 0, limit: 15000 },
        { name: 'Groceries', spent: 0, limit: 20000 },
        { name: 'Transportation', spent: 0, limit: 10000 },
        { name: 'Insurance', spent: 0, limit: 8000 },
        { name: 'Healthcare', spent: 0, limit: 12000 },
        { name: 'Childcare', spent: 0, limit: 25000 },
        { name: 'Education (Tuition/Fees)', spent: 0, limit: 30000 },
        { name: 'Phone Bill', spent: 0, limit: 3000 },
        { name: 'Internet', spent: 0, limit: 2000 },
        { name: 'Debt Payments', spent: 0, limit: 15000 },
        { name: 'Loan EMI', spent: 0, limit: 20000 },
        { name: 'Electricity', spent: 0, limit: 4000 },
        { name: 'Housing', spent: 0, limit: 50000 },
        { name: 'Food', spent: 0, limit: 18000 },
        { name: 'Personal Care', spent: 0, limit: 5000 },
      ],
    },
    {
      name: 'Wants',
      percentage: 30,
      color: '#F59E0B',
      icon: '🧡',
      spent: 900,
      limit: 3000,
      subcategories: [
        { name: 'Entertainment', spent: 0, limit: 10000 },
        { name: 'Dining Out', spent: 0, limit: 8000 },
        { name: 'Shopping', spent: 0, limit: 12000 },
        { name: 'Hobbies', spent: 0, limit: 5000 },
        { name: 'Travel', spent: 0, limit: 15000 },
      ],
    },
    {
      name: 'Save',
      percentage: 10,
      color: '#3B82F6',
      icon: '💰',
      spent: 200,
      limit: 2000,
      subcategories: [
        { name: 'Emergency Fund', spent: 0, limit: 50000 },
        { name: 'Retirement', spent: 0, limit: 30000 },
        { name: 'Investments', spent: 0, limit: 25000 },
        { name: 'Vacation Fund', spent: 0, limit: 10000 },
      ],
    },
  ];

  const typeFilters = ['Expense', 'Income'];
  const periodFilters = ['Monthly', 'Quarterly'];

  const CircularProgress: React.FC<{ category: BudgetCategory }> = ({ category }) => {
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (category.spent / category.limit) * 100;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
      <TouchableOpacity 
        style={styles.budgetCard} 
        activeOpacity={0.8}
        onPress={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
      >
        <View style={styles.budgetCardIcon}>
          <Text style={styles.budgetIconText}>{category.icon}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <Svg width={size} height={size} style={styles.svg}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#374151"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={category.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.progressInner}>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
        </View>
        
        <Text style={styles.budgetCategoryName}>{category.name}</Text>
      </TouchableOpacity>
    );
  };

  const ExpandedCategoryView: React.FC<{ category: BudgetCategory }> = ({ category }) => (
    <View style={[styles.expandedView, { borderColor: category.color }]}>
      <View style={styles.expandedHeader}>
        <View style={styles.expandedTitleSection}>
          <View style={[styles.expandedColorDot, { backgroundColor: category.color }]} />
          <Text style={styles.expandedTitle}>{category.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setExpandedCategory(null)}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.subcategoriesList} showsVerticalScrollIndicator={false}>
        {category.subcategories.map((subcategory, index) => (
          <View key={index} style={styles.subcategoryItem}>
            <View style={styles.subcategoryLeft}>
              <View style={[styles.subcategoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.subcategoryName}>{subcategory.name}</Text>
            </View>
            <Text style={styles.subcategoryAmount}>
              ${subcategory.spent.toFixed(2)}
            </Text>
          </View>
        ))}
        
        <View style={styles.totalsSection}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Spent</Text>
            <Text style={styles.totalAmount}>${category.spent.toFixed(2)}</Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Limit: ${category.limit.toFixed(2)}</Text>
            <Text style={styles.limitPercentage}>
              {((category.spent / category.limit) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const expandedCategoryData = budgetCategories.find(cat => cat.name === expandedCategory);

  return (
    <ErrorBoundary>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Progress</Text>
          <View style={styles.filtersContainer}>
            <View style={styles.filterGroup}>
              {typeFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.activeFilter,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter && styles.activeFilterText,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterGroup}>
              {periodFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    timePeriod === filter && styles.activeFilter,
                  ]}
                  onPress={() => setTimePeriod(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      timePeriod === filter && styles.activeFilterText,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {expandedCategoryData ? (
          <ExpandedCategoryView category={expandedCategoryData} />
        ) : (
          <View style={styles.budgetGrid}>
            {budgetCategories.map((category, index) => (
              <CircularProgress key={index} category={category} />
            ))}
          </View>
        )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  filterGroup: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 2,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  budgetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  budgetCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    minHeight: 140,
  },
  budgetCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetIconText: {
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  progressInner: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    height: 68,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  budgetCategoryName: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Expanded view styles
  expandedView: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 2,
    borderLeftWidth: 4,
    padding: 20,
    maxHeight: 500,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  expandedTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandedColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  subcategoriesList: {
    maxHeight: 350,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  subcategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subcategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  subcategoryName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  subcategoryAmount: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  totalsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#374151',
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  limitPercentage: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

export default BudgetProgressSection; 