import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDemoMode } from './contexts/DemoModeContext';
import { useAccounts } from './contexts/AccountsContext';
import { formatAccountBalance, formatAccountBalanceShort } from './utils/currencyFormatter';
import * as realDataHelper from './utils/realDataHelper';

/**
 * Real Data Verification Component
 * 
 * Use this component to verify that your app is correctly showing
 * real balance values from the accounts_real table
 */
export const RealDataVerification: React.FC = () => {
  const { isDemo, setIsDemo } = useDemoMode();
  const { accounts, loading, error, fetchAccounts } = useAccounts();
  const [verificationResults, setVerificationResults] = useState<any>(null);

  // Calculate totals
  const bankAccounts = accounts.filter(account => 
    account.type !== 'Credit Card' && 
    account.type !== 'Credit' && 
    account.type !== 'Loan'
  );
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  // Run verification tests
  const runVerification = async () => {
    try {
      const results = await realDataHelper.compareDataSources();
      setVerificationResults(results);
    } catch (err) {
      Alert.alert('Error', 'Failed to run verification tests');
    }
  };

  useEffect(() => {
    runVerification();
  }, [isDemo]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Real Data Verification</Text>
      
      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Mode:</Text>
          <Text style={[styles.value, { color: isDemo ? '#FF6B6B' : '#4ECDC4' }]}>
            {isDemo ? 'DEMO DATA' : 'REAL DATA'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Table:</Text>
          <Text style={styles.value}>
            {isDemo ? 'accounts (demo)' : 'accounts_real'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Loading:</Text>
          <Text style={styles.value}>{loading ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Error:</Text>
          <Text style={styles.value}>{error || 'None'}</Text>
        </View>
      </View>

      {/* Switch Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode Control</Text>
        <View style={styles.buttonRow}>
          <Button 
            title="Use Real Data" 
            onPress={() => setIsDemo(false)}
            disabled={!isDemo}
            color="#4ECDC4"
          />
          <Button 
            title="Use Demo Data" 
            onPress={() => setIsDemo(true)}
            disabled={isDemo}
            color="#FF6B6B"
          />
        </View>
        <Button 
          title="Refresh Data" 
          onPress={fetchAccounts}
          color="#45B7D1"
        />
      </View>

      {/* Account Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalAmount}>
            {formatAccountBalance(totalBalance)}
          </Text>
          <Text style={styles.totalAmountShort}>
            ({formatAccountBalanceShort(totalBalance)})
          </Text>
          <Text style={styles.accountCount}>
            {accounts.length} total accounts, {bankAccounts.length} bank accounts
          </Text>
        </View>
      </View>

      {/* Account Details */}
      {accounts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          {accounts.map((account, index) => (
            <View key={account.id} style={styles.accountItem}>
              <View style={styles.accountHeader}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.type}</Text>
              </View>
              <Text style={styles.accountBalance}>
                {formatAccountBalance(account.balance)}
              </Text>
              <Text style={styles.accountInstitution}>
                {account.institution || 'No Institution'}
              </Text>
              <Text style={styles.accountId}>ID: {account.id.substring(0, 8)}...</Text>
            </View>
          ))}
        </View>
      )}

      {/* Verification Results */}
      {verificationResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Comparison</Text>
          <View style={styles.comparisonRow}>
            <Text style={styles.label}>Demo Accounts:</Text>
            <Text style={styles.value}>{verificationResults.demoCount}</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.label}>Real Accounts:</Text>
            <Text style={styles.value}>{verificationResults.realCount}</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.label}>Demo Balance:</Text>
            <Text style={styles.value}>
              {formatAccountBalance(verificationResults.demoBalance)}
            </Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.label}>Real Balance:</Text>
            <Text style={styles.value}>
              {formatAccountBalance(verificationResults.realBalance)}
            </Text>
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expected Results</Text>
        <Text style={styles.instruction}>
          ✅ When using REAL DATA, you should see:
        </Text>
        <Text style={styles.instruction}>
          • Axis Bank: ₹35,739
        </Text>
        <Text style={styles.instruction}>
          • IDFC Savings: ₹69,845
        </Text>
        <Text style={styles.instruction}>
          • HDFC Savings: ₹81,450
        </Text>
        <Text style={styles.instruction}>
          • ICICI Savings: ₹4,58,962
        </Text>
        <Text style={styles.instruction}>
          • Total: ₹6,45,996 (₹6.5L)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  totalAmountShort: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  accountCount: {
    fontSize: 14,
    color: '#95a5a6',
  },
  accountItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  accountType: {
    fontSize: 14,
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  accountInstitution: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  accountId: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  instruction: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default RealDataVerification;
