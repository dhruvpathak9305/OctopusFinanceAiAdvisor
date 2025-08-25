import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useDemoMode } from './contexts/DemoModeContext';
import { useAccounts } from './contexts/AccountsContext';
import * as accountsService from './services/accountsService';
import { supabase } from './lib/supabase/client';
import { getTableName } from './constants/TableNames';

/**
 * Debug component to troubleshoot accounts data fetching
 */
export const DebugAccounts: React.FC = () => {
  const { isDemo, setIsDemo } = useDemoMode();
  const { accounts, loading, error, fetchAccounts } = useAccounts();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [directData, setDirectData] = useState<any[]>([]);

  // Test direct service call
  const testDirectService = async () => {
    try {
      console.log('🔍 Testing direct service call...');
      const data = await accountsService.fetchAccounts(isDemo);
      setDirectData(data);
      console.log('✅ Direct service result:', data);
    } catch (err) {
      console.error('❌ Direct service error:', err);
    }
  };

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('🔍 Testing database connection...');
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 User:', user?.id, authError);
      
      // Check table access
      const tableName = getTableName('ACCOUNTS', isDemo);
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
      
      console.log('📊 Table access:', tableData, tableError);
      
      setDebugInfo({
        user: user?.id,
        authError: authError?.message,
        tableError: tableError?.message,
        isDemo
      });
    } catch (err) {
      console.error('❌ Database test error:', err);
    }
  };

  // Test direct database query
  const testDirectQuery = async () => {
    try {
      console.log('🔍 Testing direct database query...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user');
        return;
      }
      
      const { data, error } = await supabase
        .from('accounts_real')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('📊 Direct query result:', data, error);
      setDirectData(data || []);
    } catch (err) {
      console.error('❌ Direct query error:', err);
    }
  };

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Accounts Debug Panel</Text>
      
      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <Text style={styles.info}>Demo Mode: {isDemo ? 'DEMO' : 'REAL DATA'}</Text>
        <Text style={styles.info}>Loading: {loading.toString()}</Text>
        <Text style={styles.info}>Error: {error || 'None'}</Text>
        <Text style={styles.info}>Accounts Count: {accounts.length}</Text>
        <Text style={styles.info}>Total Balance: ₹{accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}</Text>
      </View>

      {/* Debug Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info</Text>
        <Text style={styles.info}>User ID: {debugInfo.user || 'Not found'}</Text>
        <Text style={styles.info}>Auth Error: {debugInfo.authError || 'None'}</Text>
        <Text style={styles.info}>Table Error: {debugInfo.tableError || 'None'}</Text>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Actions</Text>
        <View style={styles.buttonRow}>
          <Button title="Switch to Demo" onPress={() => setIsDemo(true)} />
          <Button title="Switch to Real" onPress={() => setIsDemo(false)} />
        </View>
        <Button title="Refresh Context" onPress={fetchAccounts} />
        <Button title="Test Direct Service" onPress={testDirectService} />
        <Button title="Test Direct Query" onPress={testDirectQuery} />
        <Button title="Test Database" onPress={testDatabaseConnection} />
      </View>

      {/* Context Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Context Data ({accounts.length} accounts)</Text>
        {accounts.map((account, index) => (
          <View key={account.id} style={styles.accountItem}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>₹{account.balance.toLocaleString()}</Text>
            <Text style={styles.accountType}>{account.type}</Text>
          </View>
        ))}
      </View>

      {/* Direct Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direct Data ({directData.length} accounts)</Text>
        {directData.map((account, index) => (
          <View key={account.id || index} style={styles.accountItem}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>₹{account.balance?.toLocaleString()}</Text>
            <Text style={styles.accountType}>{account.type}</Text>
          </View>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Troubleshooting Steps</Text>
        <Text style={styles.instruction}>1. Check if user is authenticated</Text>
        <Text style={styles.instruction}>2. Verify database connection</Text>
        <Text style={styles.instruction}>3. Check if accounts_real table has data</Text>
        <Text style={styles.instruction}>4. Verify user_id matches in database</Text>
        <Text style={styles.instruction}>5. Check RLS policies on accounts_real table</Text>
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
  info: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  accountItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 4,
  },
  accountType: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  instruction: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default DebugAccounts;
