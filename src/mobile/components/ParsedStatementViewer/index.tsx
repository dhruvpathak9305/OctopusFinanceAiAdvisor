import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParsedTransaction } from '../../types/bankStatement';

interface ParsedStatementViewerProps {
  transactions: ParsedTransaction[];
}

const ParsedStatementViewer: React.FC<ParsedStatementViewerProps> = ({
  transactions,
}) => {
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  const toggleExpanded = (transactionId: string) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    );
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionIcon = (type: string, category: string): string => {
    if (type === 'credit') return 'arrow-down-circle';
    if (type === 'debit') return 'arrow-up-circle';
    
    // Category-based icons
    switch (category.toLowerCase()) {
      case 'food':
      case 'restaurant':
        return 'restaurant';
      case 'transport':
      case 'gas':
        return 'car';
      case 'shopping':
        return 'bag';
      case 'entertainment':
        return 'game-controller';
      case 'health':
      case 'medical':
        return 'medical';
      case 'utilities':
        return 'flash';
      default:
        return 'card';
    }
  };

  const getTransactionColor = (type: string): string => {
    return type === 'credit' ? '#28a745' : '#dc3545';
  };

  const handleEditTransaction = (transaction: ParsedTransaction) => {
    Alert.alert(
      'Edit Transaction',
      'Edit functionality will be implemented here',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteTransaction = (transaction: ParsedTransaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: ParsedTransaction }) => {
    const isExpanded = expandedTransaction === item.id;
    const iconName = getTransactionIcon(item.type, item.category);
    const transactionColor = getTransactionColor(item.type);

    return (
      <View style={styles.transactionCard}>
        <TouchableOpacity
          style={styles.transactionHeader}
          onPress={() => toggleExpanded(item.id)}
        >
          <View style={styles.transactionIconContainer}>
            <Ionicons name={iconName} size={24} color={transactionColor} />
          </View>
          
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.date)}
            </Text>
          </View>
          
          <View style={styles.transactionAmount}>
            <Text style={[styles.amountText, { color: transactionColor }]}>
              {item.type === 'debit' ? '-' : '+'}{formatAmount(item.amount)}
            </Text>
            <Text style={styles.transactionType}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleExpanded(item.id)}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6c757d"
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{item.category}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account:</Text>
              <Text style={styles.detailValue}>{item.account}</Text>
            </View>
            
            {item.merchant && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Merchant:</Text>
                <Text style={styles.detailValue}>{item.merchant}</Text>
              </View>
            )}
            
            {item.reference && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference:</Text>
                <Text style={styles.detailValue}>{item.reference}</Text>
              </View>
            )}
            
            {item.balance && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balance:</Text>
                <Text style={styles.detailValue}>{formatAmount(item.balance)}</Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditTransaction(item)}
              >
                <Ionicons name="create-outline" size={16} color="#007AFF" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteTransaction(item)}
              >
                <Ionicons name="trash-outline" size={16} color="#dc3545" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const getSummaryStats = () => {
    const totalDebits = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCredits = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netAmount = totalCredits - totalDebits;
    
    return { totalDebits, totalCredits, netAmount };
  };

  const summaryStats = getSummaryStats();

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Debits</Text>
          <Text style={styles.summaryValueDebit}>
            {formatAmount(summaryStats.totalDebits)}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Credits</Text>
          <Text style={styles.summaryValueCredit}>
            {formatAmount(summaryStats.totalCredits)}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Net Amount</Text>
          <Text style={[
            styles.summaryValueNet,
            { color: summaryStats.netAmount >= 0 ? '#28a745' : '#dc3545' }
          ]}>
            {formatAmount(Math.abs(summaryStats.netAmount))}
            {summaryStats.netAmount >= 0 ? ' (Credit)' : ' (Debit)'}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>Transactions ({transactions.length})</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="funnel-outline" size={16} color="#6c757d" />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.transactionsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValueDebit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  summaryValueCredit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  summaryValueNet: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 4,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  expandButton: {
    padding: 4,
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
  },
  deleteButtonText: {
    color: '#dc3545',
  },
});

export default ParsedStatementViewer;

