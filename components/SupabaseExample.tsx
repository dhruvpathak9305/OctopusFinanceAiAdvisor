import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/SupabaseContext';
import {
  accountsService,
  transactionsService,
  budgetService,
  upcomingBillsService,
} from '../services';

export default function SupabaseExample() {
  const { user, signIn, signUp, signOut, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsResult, transactionsResult, categoriesResult, billsResult] = await Promise.all([
        accountsService.getAccounts(),
        transactionsService.getRecentTransactions(5),
        budgetService.getBudgetCategories(),
        upcomingBillsService.getUpcomingBillsNext30Days(),
      ]);

      setAccounts(accountsResult.accounts || []);
      setTransactions(transactionsResult.transactions || []);
      setBudgetCategories(categoriesResult.categories || []);
      setUpcomingBills(billsResult.bills || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('Sign In Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        Alert.alert('Sign Up Error', error.message);
      } else {
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAccounts([]);
      setTransactions([]);
      setBudgetCategories([]);
      setUpcomingBills([]);
    } catch (error) {
      Alert.alert('Error', 'Sign out failed');
    }
  };

  const createSampleAccount = async () => {
    try {
      const { account, error } = await accountsService.createAccount({
        name: 'Sample Bank Account',
        type: 'checking',
        balance: 5000,
        institution: 'Sample Bank',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Account created!');
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  const createSampleTransaction = async () => {
    if (accounts.length === 0) {
      Alert.alert('Error', 'Please create an account first');
      return;
    }

    try {
      const { transaction, error } = await transactionsService.createTransaction({
        account_id: accounts[0].id,
        amount: -50.00,
        description: 'Sample transaction',
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'expense',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Transaction created!');
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create transaction');
    }
  };

  if (!isAuthenticated) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Supabase Integration Example</Text>
        <Text style={styles.subtitle}>Sign in or create an account to get started</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.email}!</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={createSampleAccount}>
          <Text style={styles.actionButtonText}>Create Sample Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={createSampleTransaction}>
          <Text style={styles.actionButtonText}>Create Sample Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={loadData}>
          <Text style={styles.actionButtonText}>Refresh Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accounts ({accounts.length})</Text>
        {accounts.map((account) => (
          <View key={account.id} style={styles.card}>
            <Text style={styles.cardTitle}>{account.name}</Text>
            <Text style={styles.cardSubtitle}>{account.institution}</Text>
            <Text style={styles.cardAmount}>${account.balance.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions ({transactions.length})</Text>
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.card}>
            <Text style={styles.cardTitle}>{transaction.description}</Text>
            <Text style={styles.cardSubtitle}>
              {new Date(transaction.transaction_date).toLocaleDateString()}
            </Text>
            <Text
              style={[
                styles.cardAmount,
                { color: transaction.amount > 0 ? '#10B981' : '#EF4444' },
              ]}
            >
              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Categories ({budgetCategories.length})</Text>
        {budgetCategories.map((category) => (
          <View key={category.id} style={styles.card}>
            <Text style={styles.cardTitle}>{category.name}</Text>
            <Text style={styles.cardSubtitle}>{category.description}</Text>
            {category.icon && <Text style={styles.cardIcon}>{category.icon}</Text>}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Bills ({upcomingBills.length})</Text>
        {upcomingBills.map((bill) => (
          <View key={bill.id} style={styles.card}>
            <Text style={styles.cardTitle}>{bill.name}</Text>
            <Text style={styles.cardSubtitle}>
              Due: {new Date(bill.due_date).toLocaleDateString()}
            </Text>
            <Text style={styles.cardAmount}>${bill.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  secondaryButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  cardIcon: {
    fontSize: 20,
    position: 'absolute',
    right: 16,
    top: 16,
  },
}); 