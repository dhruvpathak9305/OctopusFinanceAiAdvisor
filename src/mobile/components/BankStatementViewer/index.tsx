import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParsedBankStatement, BankTransaction } from '../../../../services/csvParsers/types';

interface BankStatementViewerProps {
  data: ParsedBankStatement;
  onSaveTransactions?: (transactions: BankTransaction[]) => void;
  onExport?: (data: ParsedBankStatement) => void;
}

interface SectionHeaderProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isExpanded: boolean;
  onToggle: () => void;
  count?: number;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  count 
}) => (
  <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
    <View style={styles.sectionHeaderLeft}>
      <Ionicons name={icon} size={20} color="#007AFF" />
      <Text style={styles.sectionTitle}>
        {title} {count !== undefined ? `(${count})` : ''}
      </Text>
    </View>
    <Ionicons 
      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
      size={20} 
      color="#6c757d" 
    />
  </TouchableOpacity>
);

const BankStatementViewer: React.FC<BankStatementViewerProps> = ({
  data,
  onSaveTransactions,
  onExport,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    summary: true,
    accounts: true,
    deposits: true,
    transactions: true,
    rewards: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN');
    } catch {
      return dateStr;
    }
  };

  const handleSaveTransactions = () => {
    if (onSaveTransactions && data.transactions.length > 0) {
      Alert.alert(
        'Save Transactions',
        `Save ${data.transactions.length} transactions to your database?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Save', 
            onPress: () => onSaveTransactions(data.transactions)
          }
        ]
      );
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(data);
    }
  };

  const renderCustomerInfo = () => (
    <View style={styles.section}>
      <SectionHeader
        title="Customer Information"
        icon="person-circle"
        isExpanded={expandedSections.customer}
        onToggle={() => toggleSection('customer')}
      />
      {expandedSections.customer && (
        <View style={styles.sectionContent}>
          {data.customerInfo.name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{data.customerInfo.name}</Text>
            </View>
          )}
          {data.customerInfo.customerId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer ID:</Text>
              <Text style={styles.infoValue}>{data.customerInfo.customerId}</Text>
            </View>
          )}
          {data.customerInfo.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{data.customerInfo.address}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderAccountSummary = () => (
    <View style={styles.section}>
      <SectionHeader
        title="Account Summary"
        icon="wallet"
        isExpanded={expandedSections.summary}
        onToggle={() => toggleSection('summary')}
      />
      {expandedSections.summary && (
        <View style={styles.sectionContent}>
          {data.accountSummary.statementDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Statement Date:</Text>
              <Text style={styles.infoValue}>{data.accountSummary.statementDate}</Text>
            </View>
          )}
          <View style={styles.summaryGrid}>
            {data.accountSummary.savingsBalance !== undefined && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>Savings Balance</Text>
                <Text style={[styles.summaryCardValue, { color: '#28a745' }]}>
                  {formatCurrency(data.accountSummary.savingsBalance)}
                </Text>
              </View>
            )}
            {data.accountSummary.linkedFDBalance !== undefined && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>Linked FD</Text>
                <Text style={[styles.summaryCardValue, { color: '#007AFF' }]}>
                  {formatCurrency(data.accountSummary.linkedFDBalance)}
                </Text>
              </View>
            )}
            {data.accountSummary.totalDeposits !== undefined && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>Total Deposits</Text>
                <Text style={[styles.summaryCardValue, { color: '#6f42c1' }]}>
                  {formatCurrency(data.accountSummary.totalDeposits)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.section}>
      <SectionHeader
        title="Transactions"
        icon="list"
        isExpanded={expandedSections.transactions}
        onToggle={() => toggleSection('transactions')}
        count={data.transactions.length}
      />
      {expandedSections.transactions && (
        <View style={styles.sectionContent}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionHeaderText}>Date</Text>
            <Text style={styles.transactionHeaderText}>Description</Text>
            <Text style={styles.transactionHeaderText}>Amount</Text>
            <Text style={styles.transactionHeaderText}>Balance</Text>
          </View>
          {data.transactions.slice(0, 10).map((transaction, index) => (
            <View key={index} style={styles.transactionRow}>
              <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
              <Text style={styles.transactionDescription} numberOfLines={2}>
                {transaction.particulars}
              </Text>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'credit' ? '#28a745' : '#dc3545' }
              ]}>
                {transaction.type === 'credit' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </Text>
              <Text style={styles.transactionBalance}>
                {transaction.balance ? formatCurrency(transaction.balance) : '-'}
              </Text>
            </View>
          ))}
          {data.transactions.length > 10 && (
            <Text style={styles.moreTransactionsText}>
              ... and {data.transactions.length - 10} more transactions
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderFixedDeposits = () => {
    if (!data.fixedDeposits || data.fixedDeposits.length === 0) return null;

    return (
      <View style={styles.section}>
        <SectionHeader
          title="Fixed Deposits"
          icon="card"
          isExpanded={expandedSections.deposits}
          onToggle={() => toggleSection('deposits')}
          count={data.fixedDeposits.length}
        />
        {expandedSections.deposits && (
          <View style={styles.sectionContent}>
            {data.fixedDeposits.map((fd, index) => (
              <View key={index} style={styles.fdCard}>
                <View style={styles.fdHeader}>
                  <Text style={styles.fdNumber}>{fd.depositNo}</Text>
                  <Text style={styles.fdRoi}>{fd.roi}% ROI</Text>
                </View>
                <View style={styles.fdDetails}>
                  <Text style={styles.fdAmount}>{formatCurrency(fd.amount)}</Text>
                  <Text style={styles.fdMaturity}>Matures: {fd.maturityDate}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.saveButton]}
        onPress={handleSaveTransactions}
        disabled={!data.transactions || data.transactions.length === 0}
      >
        <Ionicons name="save" size={20} color="white" />
        <Text style={styles.actionButtonText}>
          Save {data.transactions?.length || 0} Transactions
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.exportButton]}
        onPress={handleExport}
      >
        <Ionicons name="download" size={20} color="white" />
        <Text style={styles.actionButtonText}>Export Data</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Bank Statement Analysis</Text>
        <Text style={styles.subtitle}>{data.metadata.bankName}</Text>
        <Text style={styles.dateRange}>
          {data.metadata.dateRange.start.toLocaleDateString()} - {data.metadata.dateRange.end.toLocaleDateString()}
        </Text>
      </View>

      {renderCustomerInfo()}
      {renderAccountSummary()}
      {renderTransactions()}
      {renderFixedDeposits()}

      {renderActions()}

      <View style={styles.summaryFooter}>
        <Text style={styles.summaryFooterTitle}>Summary</Text>
        <View style={styles.summaryFooterRow}>
          <Text style={styles.summaryFooterLabel}>Total Transactions:</Text>
          <Text style={styles.summaryFooterValue}>{data.metadata.totalTransactions}</Text>
        </View>
        <View style={styles.summaryFooterRow}>
          <Text style={styles.summaryFooterLabel}>Total Credits:</Text>
          <Text style={[styles.summaryFooterValue, { color: '#28a745' }]}>
            {formatCurrency(data.metadata.totalCredits)}
          </Text>
        </View>
        <View style={styles.summaryFooterRow}>
          <Text style={styles.summaryFooterLabel}>Total Debits:</Text>
          <Text style={[styles.summaryFooterValue, { color: '#dc3545' }]}>
            {formatCurrency(data.metadata.totalDebits)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 14,
    color: '#6c757d',
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sectionContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 2,
    textAlign: 'right',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryCardLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryCardValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  transactionHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  transactionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    flex: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 11,
    color: '#6c757d',
    flex: 1,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#1a1a1a',
    flex: 2,
    marginHorizontal: 8,
  },
  transactionAmount: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  transactionBalance: {
    fontSize: 11,
    color: '#6c757d',
    flex: 1,
    textAlign: 'right',
  },
  moreTransactionsText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  fdCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fdNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  fdRoi: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  fdDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fdAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  fdMaturity: {
    fontSize: 12,
    color: '#6c757d',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  exportButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryFooter: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryFooterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryFooterLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryFooterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

export default BankStatementViewer;
