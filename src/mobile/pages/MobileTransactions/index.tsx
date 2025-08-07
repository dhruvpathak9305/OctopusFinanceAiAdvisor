import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../contexts/ThemeContext';
import DateSelector from '../../components/DateSelector';
import SearchModal from '../../components/SearchModal';

interface MobileTransactionsProps {
  className?: string;
}

interface SearchData {
  text: string;
  amount: string;
  category: string;
  date: string;
}

const MobileTransactions: React.FC<MobileTransactionsProps> = ({ className = "" }) => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState("Jun 2025");
  const [selectedSort, setSelectedSort] = useState("Oldest First");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const colors = isDark ? {
    background: '#0B1426',
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

  // Mock summary data
  const summaryData = {
    income: 0.00,
    expenses: 7750.49,
    net: -7750.49,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Dropdown Component for sorting
  const Dropdown: React.FC<{
    value: string;
    options: string[];
    onValueChange: (value: string) => void;
    placeholder?: string;
  }> = ({ value, options, onValueChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[styles.dropdownButton, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}
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
          <View style={[styles.dropdownMenu, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  value === option && { backgroundColor: '#F59E0B20' }
                ]}
                onPress={() => {
                  onValueChange(option);
                  setIsOpen(false);
                  console.log('Selected sort option:', option);
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = () => {
    console.log('Opening search modal');
    setIsSearchVisible(true);
  };

  const handleSearchClose = () => {
    console.log('Closing search modal');
    setIsSearchVisible(false);
  };

  const handleSearchSubmit = (searchData: SearchData) => {
    console.log('Search submitted:', searchData);
    Alert.alert('Search Results', `Found transactions matching: ${searchData.text}`);
  };

  const handleMoreOptions = () => {
    Alert.alert('More Options', 'More options menu will be implemented');
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    console.log('Filter changed to:', filter);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    console.log('Sort changed to:', sort);
  };

  // Get tag color based on category
  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'needs':
        return { background: '#EF444420', text: '#EF4444' }; // Red for essential needs
      case 'wants':
        return { background: '#F59E0B20', text: '#F59E0B' }; // Orange for wants
      case 'save':
        return { background: '#10B98120', text: '#10B981' }; // Green for savings
      case 'food':
        return { background: '#8B5CF620', text: '#8B5CF6' }; // Purple for food
      case 'bills':
        return { background: '#3B82F620', text: '#3B82F6' }; // Blue for bills
      case 'entertainment':
        return { background: '#EC489920', text: '#EC4899' }; // Pink for entertainment
      default:
        return { background: '#6B728020', text: '#6B7280' }; // Gray for others
    }
  };

  // Mock transaction data for the transactions page
  const mockTransactions = [
    {
      id: 1,
      date: '2025-08-07',
      transactions: [
        {
          id: '1-1',
          title: 'Side Hustle Savings',
          source: 'bank',
          tags: ['Save', 'Side Hustle Savings'],
          description: 'Saving from side business',
          amount: -350,
          type: 'expense',
          icon: '🎨',
        },
        {
          id: '1-2',
          title: 'Side Hustle Savings',
          source: 'bank',
          tags: ['Save', 'Side Hustle Savings'],
          description: 'Saving from side business',
          amount: -350,
          type: 'expense',
          icon: '🎨',
        },
        {
          id: '1-3',
          title: 'Food',
          source: 'bank',
          tags: ['Needs', 'Food'],
          description: 'Dinner at restaurant',
          amount: -45,
          type: 'expense',
          icon: '🍴',
        },
      ],
      summary: { income: 0, expense: 745, transfer: 0 }
    },
    {
      id: 2,
      date: '2025-08-06',
      transactions: [
        {
          id: '2-1',
          title: 'Debt Repayment Savings',
          source: 'bank',
          tags: ['Save', 'Debt Repayment Savings'],
          description: 'Saving to pay off debt',
          amount: -150,
          type: 'expense',
          icon: '💰',
        },
        {
          id: '2-2',
          title: 'Debt Repayment Savings',
          source: 'bank',
          tags: ['Save', 'Debt Repayment Savings'],
          description: 'Saving to pay off debt',
          amount: -15,
          type: 'expense',
          icon: '💰',
        },
      ],
      summary: { income: 0, expense: 430.50, transfer: 0 }
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return '#10B981';
      case 'expense':
        return '#EF4444';
      case 'transfer':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSearch} style={styles.headerButton}>
            <Text style={[styles.headerIcon, { color: colors.text }]}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMoreOptions} style={styles.headerButton}>
            <Text style={[styles.headerIcon, { color: colors.text }]}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
        <View style={styles.filtersRow}>
          <DateSelector
            value={selectedFilter}
            onValueChange={handleFilterChange}
            placeholder="Select month"
          />
          <Dropdown
            value={selectedSort}
            options={['Oldest First', 'Newest First', 'Largest Amount', 'Smallest Amount', 'Transfer', 'Income', 'Expense', 'ALL']}
            onValueChange={handleSortChange}
            placeholder="Sort by"
          />
        </View>
      </View>

      {/* Summary Cards - Compact 1x3 Layout */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.background }]}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#10B98115', borderColor: '#10B98130' }]}>
            <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Income</Text>
            <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
              +{formatCurrency(summaryData.income)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#EF444415', borderColor: '#EF444430' }]}>
            <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
              -{formatCurrency(summaryData.expenses)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#3B82F615', borderColor: '#3B82F630' }]}>
            <Text style={[styles.summaryLabel, { color: '#3B82F6' }]}>Net</Text>
            <Text style={[styles.summaryAmount, { color: '#3B82F6' }]}>
              {formatCurrency(summaryData.net)}
            </Text>
          </View>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView 
        style={styles.transactionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {mockTransactions.map((dayGroup) => (
          <View key={dayGroup.id} style={styles.dayGroup}>
            {/* Date Header with Summary */}
            <View style={styles.dateHeader}>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(dayGroup.date)}
              </Text>
              <View style={styles.dateSummary}>
                {dayGroup.summary.income > 0 && (
                  <Text style={[styles.summaryText, { color: '#10B981' }]}>
                    ↓+{formatCurrencyCompact(dayGroup.summary.income)}
                  </Text>
                )}
                {dayGroup.summary.expense > 0 && (
                  <Text style={[styles.summaryText, { color: '#EF4444' }]}>
                    ↑-{formatCurrencyCompact(dayGroup.summary.expense)}
                  </Text>
                )}
                {dayGroup.summary.transfer > 0 && (
                  <Text style={[styles.summaryText, { color: '#3B82F6' }]}>
                    ⇌ {formatCurrencyCompact(dayGroup.summary.transfer)}
                  </Text>
                )}
              </View>
            </View>

            {/* Transactions */}
            {dayGroup.transactions.map((transaction) => (
              <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(transaction.type)}20` }]}>
                    <Text style={[styles.transactionIconText, { color: getTransactionColor(transaction.type) }]}>
                      {transaction.icon}
                    </Text>
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionTitle, { color: colors.text }]}>
                      {transaction.title}
                    </Text>
                    <Text style={[styles.transactionSource, { color: colors.textSecondary }]}>
                      {transaction.source}
                    </Text>
                    <View style={styles.transactionTags}>
                      {transaction.tags.map((tag, index) => {
                        const tagColors = getTagColor(tag);
                        return (
                          <View key={index} style={[styles.tag, { backgroundColor: tagColors.background }]}>
                            <Text style={[styles.tagText, { color: tagColors.text }]}>
                              {tag}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    <Text style={[styles.transactionDescription, { color: colors.textSecondary }]}>
                      {transaction.description}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </Text>
                  <View style={styles.transactionActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={[styles.actionIcon, { color: '#F59E0B' }]}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Search Modal */}
      <SearchModal
        visible={isSearchVisible}
        onClose={handleSearchClose}
        onSearch={handleSearchSubmit}
      />
    </SafeAreaView>
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  headerIcon: {
    fontSize: 20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
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
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateSummary: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionSource: {
    fontSize: 12,
    marginBottom: 4,
  },
  transactionTags: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  transactionDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
});

export default MobileTransactions; 