import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ErrorBoundary from './ErrorBoundary';

interface Transaction {
  id: number;
  category: string;
  date: string;
  amount: string;
  type: 'expense' | 'income';
  icon: string;
}

interface RecentTransactionsSectionProps {
  className?: string;
}

const RecentTransactionsSection: React.FC<RecentTransactionsSectionProps> = ({ className }) => {
  const [selectedFilter, setSelectedFilter] = useState('Monthly');
  const [loading, setLoading] = useState(false);

  // Mock transaction data - in production this would come from API
  const transactions: Transaction[] = [
    {
      id: 1,
      category: 'Home Decor',
      date: 'May 14',
      amount: '$125.00',
      type: 'expense',
      icon: '🏠',
    },
    {
      id: 2,
      category: 'Healthcare',
      date: 'May 13',
      amount: '$220.50',
      type: 'expense',
      icon: '🏥',
    },
    {
      id: 3,
      category: 'Transportation',
      date: 'May 12',
      amount: '$45.00',
      type: 'expense',
      icon: '🚗',
    },
    {
      id: 4,
      category: 'Utilities',
      date: 'May 11',
      amount: '$157.75',
      type: 'expense',
      icon: '⚡',
    },
    {
      id: 5,
      category: 'Subscriptions',
      date: 'May 10',
      amount: '$15.99',
      type: 'expense',
      icon: '📱',
    },
  ];

  const filters = ['Monthly', 'Weekly', 'Quarterly'];

  const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.8}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: `${transaction.type === 'expense' ? '#EF4444' : '#10B981'}15` }]}>
          <Text style={styles.transactionIconText}>{transaction.icon}</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionCategory}>{transaction.category}</Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: transaction.type === 'expense' ? '#EF4444' : '#10B981' },
        ]}
      >
        {transaction.type === 'expense' ? '-' : '+'}{transaction.amount}
      </Text>
    </TouchableOpacity>
  );

  const EmptyState: React.FC = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIconContainer}>
        <Text style={styles.emptyStateIcon}>📝</Text>
      </View>
      <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyStateText}>Start by adding your first transaction!</Text>
    </View>
  );

  return (
    <ErrorBoundary>
      <View style={[styles.section, className && { marginHorizontal: 0 }]}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Transactions</Text>
            <View style={styles.headerActions}>
              <View style={styles.filterGroup}>
                {filters.map((filter) => (
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
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>Loading transactions...</Text>
              </View>
            ) : transactions.length === 0 ? (
              <EmptyState />
            ) : (
              <ScrollView
                style={styles.transactionsList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  filterGroup: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 2,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  viewAllButton: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionsList: {
    maxHeight: 320,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#9CA3AF',
    opacity: 0.8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 28,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default RecentTransactionsSection; 