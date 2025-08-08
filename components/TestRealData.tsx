import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useDemoMode } from './contexts/DemoModeContext';
import { useAccounts } from './contexts/AccountsContext';
import * as accountsService from './services/accountsService';

/**
 * Test component to verify real data from Accounts_real table
 * This component allows you to:
 * 1. Switch between demo and real data modes
 * 2. View current accounts and their balances
 * 3. Test direct service calls to accounts_real table
 */
export const TestRealData: React.FC = () => {
  const { isDemo, setIsDemo, toggleDemoMode } = useDemoMode();
  const { accounts, loading, error, fetchAccounts } = useAccounts();
  const [directData, setDirectData] = useState<any[]>([]);
  const [directLoading, setDirectLoading] = useState(false);

  // Test direct service call to real data
  const testDirectRealData = async () => {
    try {
      setDirectLoading(true);
      // Force fetch from accounts_real table
      const realData = await accountsService.fetchAccounts(false); // false = use real data
      setDirectData(realData);
      console.log('Direct real data fetch:', realData);
    } catch (err) {
      console.error('Direct real data fetch error:', err);
    } finally {
      setDirectLoading(false);
    }
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Real Data Test Component</Text>
      
      {/* Demo Mode Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Mode Control</Text>
        <Text style={styles.status}>
          Current Mode: {isDemo ? 'DEMO DATA' : 'REAL DATA'}
        </Text>
        <Text style={styles.info}>
          {isDemo ? 'Using "accounts" table' : 'Using "accounts_real" table'}
        </Text>
        
        <View style={styles.buttonRow}>
          <Button 
            title="Switch to Real Data" 
            onPress={() => setIsDemo(false)}
            disabled={!isDemo}
          />
          <Button 
            title="Switch to Demo Data" 
            onPress={() => setIsDemo(true)}
            disabled={isDemo}
          />
        </View>
        
        <Button 
          title="Toggle Mode" 
          onPress={toggleDemoMode}
        />
      </View>

      {/* Current Context Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Context Data (useAccounts)</Text>
        <Text style={styles.info}>Loading: {loading.toString()}</Text>
        <Text style={styles.info}>Error: {error || 'None'}</Text>
        <Text style={styles.info}>Account Count: {accounts.length}</Text>
        <Text style={styles.info}>
          Total Balance: ${totalBalance.toLocaleString()}
        </Text>
        
        <Button title="Refresh Context Data" onPress={fetchAccounts} />
        
        {accounts.length > 0 && (
          <View style={styles.accountsList}>
            <Text style={styles.subTitle}>Accounts:</Text>
            {accounts.map((account) => (
              <View key={account.id} style={styles.accountItem}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.type}</Text>
                <Text style={styles.accountBalance}>
                  ${account.balance.toLocaleString()}
                </Text>
                <Text style={styles.accountInstitution}>
                  {account.institution || 'No Institution'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Direct Service Call Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direct Service Call Test</Text>
        <Text style={styles.info}>
          This bypasses context and calls service directly
        </Text>
        
        <View style={styles.buttonRow}>
          <Button 
            title="Test Real Data Direct" 
            onPress={testDirectRealData}
            disabled={directLoading}
          />
        </View>
        
        {directLoading && <Text>Loading direct data...</Text>}
        
        {directData.length > 0 && (
          <View style={styles.accountsList}>
            <Text style={styles.subTitle}>Direct Real Data Results:</Text>
            {directData.map((account) => (
              <View key={account.id} style={styles.accountItem}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountBalance}>
                  ${account.balance.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instruction}>
          1. Click "Switch to Real Data" to use accounts_real table
        </Text>
        <Text style={styles.instruction}>
          2. Check if you see real balance values from your database
        </Text>
        <Text style={styles.instruction}>
          3. Use "Test Real Data Direct" to bypass context caching
        </Text>
        <Text style={styles.instruction}>
          4. If no data shows, you may need to populate accounts_real table
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#555',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  instruction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  accountsList: {
    marginTop: 12,
  },
  accountItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 4,
  },
  accountInstitution: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default TestRealData;
