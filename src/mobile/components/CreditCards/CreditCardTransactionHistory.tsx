/**
 * =============================================================================
 * CREDIT CARD TRANSACTION HISTORY COMPONENT
 * =============================================================================
 * 
 * Displays transaction history for a specific credit card.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUnifiedAuth } from '../../../../contexts/UnifiedAuthContext';
import { useSubscription } from '../../../../contexts/SubscriptionContext';
import { TransactionsRepository } from '../../../../services/repositories/transactionsRepository';
import { Transaction } from '../../../../types/transactions';
import TransactionItem from '../TransactionItem';
import { networkMonitor } from '../../../../services/sync/networkMonitor';

interface CreditCardTransactionHistoryProps {
  cardId: string;
  cardName: string;
  limit?: number;
}

export const CreditCardTransactionHistory: React.FC<CreditCardTransactionHistoryProps> = ({
  cardId,
  cardName,
  limit = 50,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  const { user } = useUnifiedAuth();
  const { isPremium } = useSubscription();
  const [isOnline, setIsOnline] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const updateNetworkStatus = async () => {
      const status = await networkMonitor.getStatus();
      setIsOnline(status === 'online');
    };
    updateNetworkStatus();
    const unsubscribe = networkMonitor.addListener((status) => {
      setIsOnline(status === 'online');
    });
    return () => unsubscribe();
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const repo = new TransactionsRepository(user.id, isPremium, isOnline);
      
      // Fetch transactions for this credit card
      // Credit card transactions have source_account_id = cardId and is_credit_card = true
      // Also check source_account_name matches card name as fallback
      const cardTransactions = await repo.findAll({
        user_id: user.id,
        accountId: cardId, // This filters by source_account_id
        isCreditCard: true, // This ensures it's a credit card transaction
        limit,
        orderBy: 'date',
        orderDirection: 'DESC',
      });

      setTransactions(cardTransactions);
    } catch (err) {
      console.error('Error fetching credit card transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, cardId, isPremium, isOnline, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [fetchTransactions]);

  // Group transactions by date
  const groupTransactionsByDate = (txs: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {};
    
    txs.forEach(tx => {
      const date = new Date(tx.date);
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(tx);
    });

    return Object.entries(grouped).map(([date, txs]) => ({
      date,
      transactions: txs,
    }));
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  if (loading && transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading transactions...
          </Text>
        </View>
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchTransactions}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No transactions yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Transactions made with this card will appear here
          </Text>
        </View>
      </View>
    );
  }

  const renderDateHeader = (date: string) => (
    <View style={[styles.dateHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.dateHeaderText, { color: colors.textSecondary }]}>
        {date}
      </Text>
    </View>
  );

  const renderTransaction = (transaction: Transaction) => {
    // Transform to TransactionItem format
    const transactionItem = {
      id: transaction.id,
      name: transaction.name,
      description: transaction.description || transaction.name,
      type: transaction.type === 'expense' ? 'expense' as const : 
            transaction.type === 'income' ? 'income' as const : 'transfer' as const,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category_name || undefined,
      category_name: transaction.category_name || undefined,
      subcategory: transaction.subcategory_name || undefined,
      subcategory_name: transaction.subcategory_name || undefined,
      icon: transaction.icon || null,
      source_account_name: transaction.source_account_name || cardName,
      is_recurring: transaction.is_recurring || false,
      subcategory_color: null,
      category_ring_color: null,
      category_bg_color: null,
    };

    return (
      <TransactionItem
        transaction={transactionItem}
        colors={colors}
        onPress={() => {
          // Navigate to transaction detail if needed
          console.log('Transaction pressed:', transaction.id);
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Transaction History
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
        </Text>
      </View>

      <FlatList
        data={groupedTransactions}
        keyExtractor={(item, index) => `group-${index}`}
        renderItem={({ item }) => (
          <View>
            {renderDateHeader(item.date)}
            {item.transactions.map((tx) => (
              <View key={tx.id} style={styles.transactionWrapper}>
                {renderTransaction(tx)}
              </View>
            ))}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No transactions found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
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
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  dateHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionWrapper: {
    marginBottom: 8,
  },
});

