import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation } from '@react-navigation/native';

interface RecentTransactionsSectionProps {
  className?: string;
}

// Define transaction types
interface Transaction {
  id: number | string;
  description: string;
  isRecurring?: boolean;
  account: string;
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  category: string;
  subcategory?: string;
  note?: string;
  icon: string;
  date: string;
  tags?: string[];
}

// Define grouped transactions type
interface GroupedTransactions {
  [date: string]: {
    income: number;
    expense: number;
    transfer: number;
    transactions: Transaction[];
  };
}

// Mock transaction data matching the images
const mockTransactions: Transaction[] = [
  // August 6, 2025
  {
    id: 1,
    description: 'Debt Repayment S...',
    type: 'expense',
    amount: '150.00',
    category: 'Save',
    subcategory: 'Debt Repayment Savings',
    account: 'bank',
    icon: 'credit-card',
    date: '2025-08-06',
    note: 'Saving to pay off debt',
    tags: ['Save', 'Debt Repayment Savings'],
  },
  {
    id: 2,
    description: 'Debt Repayment S...',
    type: 'expense',
    amount: '150.00',
    category: 'Save',
    subcategory: 'Debt Repayment Savings',
    account: 'bank',
    icon: 'credit-card',
    date: '2025-08-06',
    note: 'Saving to pay off debt',
    tags: ['Save', 'Debt Repayment Savings'],
  },
  {
    id: 3,
    description: 'Groceries',
    type: 'expense',
    amount: '130.50',
    category: 'Needs',
    subcategory: 'Groceries',
    account: 'bank',
    icon: 'shopping-basket',
    date: '2025-08-06',
    note: 'Weekly groceries',
    tags: ['Needs', 'Groceries'],
  },
  // August 5, 2025
  {
    id: 4,
    description: 'Rent Payment',
    type: 'expense',
    amount: '920.00',
    category: 'Needs',
    subcategory: 'Housing',
    account: 'bank',
    icon: 'home',
    date: '2025-08-05',
    note: 'Monthly rent payment',
    tags: ['Needs', 'Housing'],
  },
  // August 4, 2025
  {
    id: 5,
    description: 'Rent Payment Rec...',
    type: 'income',
    amount: '15178.00',
    category: 'Income',
    subcategory: 'Rental Income',
    account: 'Axis Bank',
    icon: 'receipt',
    date: '2025-08-04',
    note: 'UPI/P2A/50948358150/YASH JAT/Sta...',
    tags: ['Income', 'Rental'],
  },
  {
    id: 6,
    description: 'Credit Card Autop...',
    type: 'expense',
    amount: '910.00',
    category: 'Needs',
    subcategory: 'Credit Card',
    account: 'HDFC Bank',
    icon: 'receipt',
    date: '2025-08-04',
    note: 'CC 000461787XXXXXX5634 AUTOPA...',
    tags: ['Needs', 'Credit Card'],
  },
  {
    id: 7,
    description: 'Credit Card Autop...',
    type: 'expense',
    amount: '5424.00',
    category: 'Needs',
    subcategory: 'Credit Card',
    account: 'HDFC Bank',
    icon: 'receipt',
    date: '2025-08-04',
    note: 'CC 000526873XXXXXX7622 AUTOPA...',
    tags: ['Needs', 'Credit Card'],
  },
  // August 2, 2025
  {
    id: 8,
    description: 'Freelance Payment',
    type: 'income',
    amount: '1200.00',
    category: 'Income',
    subcategory: 'Freelance',
    account: 'IDFC FIRST Bank',
    icon: 'briefcase',
    date: '2025-08-02',
    note: 'UPI/MOB/10247422647282/Freelance',
    tags: ['Income', 'Freelance'],
  },
  {
    id: 9,
    description: 'App Ticket',
    type: 'expense',
    amount: '200.00',
    category: 'Wants',
    subcategory: 'Entertainment',
    account: 'IDFC FIRST Bank',
    icon: 'receipt',
    date: '2025-08-02',
    note: 'UPI/MOB/10247422647282/App ticket',
    tags: ['Wants', 'Entertainment'],
  },
  {
    id: 10,
    description: 'UPI Deposit',
    type: 'income',
    amount: '600.00',
    category: 'Income',
    subcategory: 'Transfer',
    account: 'IDFC FIRST Bank',
    icon: 'receipt',
    date: '2025-08-02',
    note: 'UPI/MOB/10247422647282/UPI',
    tags: ['Income', 'Transfer'],
  },
  {
    id: 11,
    description: 'Food',
    type: 'expense',
    amount: '100.00',
    category: 'Needs',
    subcategory: 'Food',
    account: 'IDFC FIRST Bank',
    icon: 'receipt',
    date: '2025-08-02',
    note: 'UPI/MOB/54045107152244/Food',
    tags: ['Needs', 'Food'],
  },
  {
    id: 12,
    description: 'Room',
    type: 'expense',
    amount: '1200.00',
    category: 'Needs',
    subcategory: 'Housing',
    account: 'IDFC FIRST Bank',
    icon: 'receipt',
    date: '2025-08-02',
    note: 'UPI/MOB/54045107152217/Room',
    tags: ['Needs', 'Housing'],
  },
  {
    id: 13,
    description: 'Ice',
    type: 'expense',
    amount: '30.00',
    category: 'Wants',
    subcategory: 'Food',
    account: 'IDFC FIRST Bank',
    icon: 'receipt',
    date: '2025-08-02',
    note: 'UPI/MOB/83243614547868/Ice',
    tags: ['Wants', 'Food'],
  },
];

// Group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransactions => {
  const grouped: GroupedTransactions = {};
  
  transactions.forEach(transaction => {
    const date = transaction.date;
    if (!grouped[date]) {
      grouped[date] = {
        income: 0,
        expense: 0,
        transfer: 0,
        transactions: [],
      };
    }
    
    grouped[date].transactions.push(transaction);
    
    const amount = parseFloat(transaction.amount);
    switch (transaction.type) {
      case 'income':
        grouped[date].income += amount;
        break;
      case 'expense':
        grouped[date].expense += amount;
        break;
      case 'transfer':
        grouped[date].transfer += amount;
        break;
    }
  });
  
  return grouped;
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

// Transaction Group Component
const TransactionGroup: React.FC<{
  date: string;
  dayData: {
    income: number;
    expense: number;
    transfer: number;
    transactions: Transaction[];
  };
  onEditTransaction: (id: number | string) => void;
  onDeleteTransaction: (id: number | string) => void;
}> = ({ date, dayData, onEditTransaction, onDeleteTransaction }) => {
  const { isDark } = useTheme();
  
  const colors = isDark ? {
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    card: '#1F2937',
  } : {
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
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

  const getDaySummaryColor = () => {
    if (dayData.expense > dayData.income) return '#EF4444'; // Red if expense > income
    if (dayData.income > dayData.expense) return '#10B981'; // Green if income > expense
    return '#3B82F6'; // Blue if equal or transfer dominant
  };

  const getIconName = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      'credit-card': '💳',
      'shopping-basket': '🛒',
      'home': '🏠',
      'receipt': '📄',
      'briefcase': '💼',
      'utensils': '🍽️',
      'car': '🚗',
      'gamepad': '🎮',
      'shopping-bag': '🛍️',
      'heartbeat': '❤️',
      'bolt': '⚡',
    };
    return iconMap[icon] || '📊';
  };

  return (
    <View style={[styles.transactionGroup, { borderBottomColor: colors.border }]}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {formatDate(date)}
        </Text>
        <View style={styles.dateSummary}>
          {dayData.income > 0 && (
            <Text style={[styles.summaryText, { color: '#10B981' }]}>
              ↓+{formatCurrency(dayData.income)}
            </Text>
          )}
          {dayData.expense > 0 && (
            <Text style={[styles.summaryText, { color: '#EF4444' }]}>
              ↑-{formatCurrency(dayData.expense)}
            </Text>
          )}
          {dayData.transfer > 0 && (
            <Text style={[styles.summaryText, { color: '#3B82F6' }]}>
              ⇌ {formatCurrency(dayData.transfer)}
            </Text>
          )}
        </View>
      </View>

      {/* Transactions */}
      {dayData.transactions.map((transaction) => (
        <TouchableOpacity
          key={transaction.id}
          style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onEditTransaction(transaction.id)}
          onLongPress={() => {
            Alert.alert(
              'Delete Transaction',
              'Are you sure you want to delete this transaction?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDeleteTransaction(transaction.id) }
              ]
            );
          }}
        >
          <View style={styles.transactionLeft}>
            <View style={styles.transactionIcon}>
              <Text style={styles.transactionIconText}>{getIconName(transaction.icon)}</Text>
            </View>
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionDescription, { color: colors.text }]} numberOfLines={1}>
                {transaction.description}
              </Text>
              <Text style={[styles.transactionAccount, { color: colors.textSecondary }]}>
                {transaction.account}
              </Text>
              {transaction.note && (
                <Text style={[styles.transactionNote, { color: colors.textSecondary }]} numberOfLines={1}>
                  {transaction.note}
                </Text>
              )}
              {transaction.tags && transaction.tags.length > 0 && (
                <View style={styles.transactionTags}>
                  {transaction.tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: '#10B98120' }]}>
                      <Text style={[styles.tagText, { color: '#10B981' }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
              {transaction.type === 'income' ? '+' : '-'}{transaction.amount}
            </Text>
            <View style={styles.transactionActions}>
              {transaction.isRecurring && (
                <View style={styles.recurringIndicator}>
                  <Text style={styles.recurringText}>🔄</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEditTransaction(transaction.id)}
              >
                <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDeleteTransaction(transaction.id)}
              >
                <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const RecentTransactionsSection: React.FC<RecentTransactionsSectionProps> = ({
  className = "",
}) => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    const filtered = mockTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (selectedFilter.toLowerCase()) {
        case 'this week':
          return diffDays <= 7;
        case 'monthly':
          return diffDays <= 30;
        case 'quarterly':
          return diffDays <= 90;
        case 'this year':
          return diffDays <= 365;
        default:
          return true;
      }
    });
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredTransactions = getFilteredTransactions();
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleEditTransaction = useCallback((transactionId: number | string) => {
    // In a real app, this would open an edit dialog
    Alert.alert('Edit Transaction', `Edit transaction ${transactionId}`);
  }, []);

  const handleDeleteTransaction = useCallback(async (transactionId: number | string) => {
    // In a real app, this would delete from the database
    Alert.alert('Delete Transaction', `Transaction ${transactionId} deleted successfully`);
  }, []);

  const handleViewAll = () => {
    // Navigate to Transactions page
    navigation.navigate('Transactions' as never);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Recent Transactions</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Filter */}
            <Dropdown
              value={selectedFilter}
              options={['This Week', 'Monthly', 'Quarterly', 'This Year']}
              onValueChange={handleFilterChange}
              placeholder="Select period"
            />

            {/* View All Button */}
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={[styles.viewAllText, { color: '#10B981' }]}>View all</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
            </View>
          ) : Object.keys(groupedTransactions).length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>📄</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Transactions Yet</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Start by adding your first transaction!
              </Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.transactionsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {Object.entries(groupedTransactions).map(([date, dayData]) => (
                <TransactionGroup
                  key={date}
                  date={date}
                  dayData={dayData}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
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
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionsList: {
    maxHeight: 450,
  },
  transactionGroup: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateSummary: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#F3F4F6',
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
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionAccount: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionNote: {
    fontSize: 11,
    marginBottom: 4,
  },
  transactionTags: {
    flexDirection: 'row',
    gap: 4,
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
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recurringIndicator: {
    alignItems: 'center',
  },
  recurringText: {
    fontSize: 10,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
});

export default RecentTransactionsSection; 