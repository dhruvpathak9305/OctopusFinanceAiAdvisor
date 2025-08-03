# 🚀 Supabase Integration for React Native Expo

This document provides a complete guide to the Supabase integration in your React Native Expo project.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Database Schema](#database-schema)
- [Services](#services)
- [Authentication](#authentication)
- [File Upload](#file-upload)
- [AI Features](#ai-features)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Supabase integration provides:

- **Authentication**: Email/password, OAuth (Google, Apple)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Image and document uploads
- **Real-time**: Live data synchronization
- **AI Features**: SMS parsing, receipt scanning, financial advice
- **Budget Management**: Categories, allocations, tracking
- **Account Management**: Financial accounts and transactions
- **Bill Management**: Upcoming bills and autopay

## ⚙️ Setup

### 1. Dependencies

The following packages are already installed:

```bash
npm install @supabase/supabase-js expo-secure-store expo-file-system expo-image-picker
```

### 2. Environment Variables

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://fzzbfgnmbchhmqepwmer.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U
```

### 3. Database Setup

Run the migration file in your Supabase dashboard:

```sql
-- Copy and paste the contents of lib/supabase/migrations/20250408_budget_tables.sql
-- into your Supabase SQL editor and execute it
```

## 🗄️ Database Schema

### Tables

1. **user_profiles**: User profile information
2. **accounts**: Financial accounts (bank, credit cards, etc.)
3. **budget_categories**: Budget categories with colors and icons
4. **budget_allocations**: Budget allocations per period
5. **transactions**: Financial transactions
6. **upcoming_bills**: Recurring bills and due dates
7. **autopay_schedules**: Automated payment schedules

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure users can only access their own data.

## 🔧 Services

### Authentication Service

```typescript
import { useAuth } from '../contexts/SupabaseContext';

const { user, signIn, signUp, signOut, isAuthenticated } = useAuth();

// Sign in
const { user, error } = await signIn('user@example.com', 'password');

// Sign up
const { user, error } = await signUp('user@example.com', 'password', 'John', 'Doe');

// Sign out
await signOut();
```

### Accounts Service

```typescript
import { accountsService } from '../services';

// Get all accounts
const { accounts, error } = await accountsService.getAccounts();

// Create account
const { account, error } = await accountsService.createAccount({
  name: 'Chase Checking',
  type: 'checking',
  balance: 5000,
  institution: 'Chase Bank',
});

// Get account summary
const { summary, error } = await accountsService.getAccountSummary();
```

### Budget Service

```typescript
import { budgetService } from '../services';

// Get budget categories
const { categories, error } = await budgetService.getBudgetCategories();

// Create budget allocation
const { allocation, error } = await budgetService.createBudgetAllocation({
  category_id: 'category-id',
  amount: 500,
  period: 'monthly',
  start_date: '2024-01-01',
});

// Get budget summary
const { summary, error } = await budgetService.getBudgetSummary('monthly');
```

### Transactions Service

```typescript
import { transactionsService } from '../services';

// Get transactions
const { transactions, error } = await transactionsService.getTransactions({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
});

// Create transaction
const { transaction, error } = await transactionsService.createTransaction({
  account_id: 'account-id',
  amount: -50.00,
  description: 'Grocery shopping',
  transaction_date: '2024-01-15',
  type: 'expense',
});

// Get transaction stats
const { stats, error } = await transactionsService.getTransactionStats();
```

### Upcoming Bills Service

```typescript
import { upcomingBillsService } from '../services';

// Get upcoming bills
const { bills, error } = await upcomingBillsService.getUpcomingBills();

// Create bill
const { bill, error } = await upcomingBillsService.createUpcomingBill({
  name: 'Rent',
  amount: 1200,
  due_date: '2024-02-01',
  frequency: 'monthly',
});

// Get bill reminders
const { reminders, error } = await upcomingBillsService.getBillReminders();
```

### File Upload Service

```typescript
import { fileUploadService } from '../services';

// Pick and upload image
const { uri, error } = await fileUploadService.pickImage('library');
if (uri) {
  const { success, url, error } = await fileUploadService.uploadImage(uri, 'receipt.jpg');
}

// Upload receipt
const { success, url, error } = await fileUploadService.uploadReceipt(imageUri);

// Upload avatar
const { success, url, error } = await fileUploadService.uploadAvatar(imageUri);
```

## 🔐 Authentication

### Context Usage

```typescript
import { useAuth, useUser } from '../contexts/SupabaseContext';

function MyComponent() {
  const { user, signIn, signOut, isAuthenticated } = useAuth();
  const { profile } = useUser();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>Welcome, {profile?.first_name}!</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

### OAuth Authentication

```typescript
import { useAuth } from '../contexts/SupabaseContext';

const { signInWithOAuth } = useAuth();

// Sign in with Google
const { error } = await signInWithOAuth('google');

// Sign in with Apple
const { error } = await signInWithOAuth('apple');
```

## 📁 File Upload

### Image Picker

```typescript
import { fileUploadService } from '../services';

// Pick from library
const { uri, error } = await fileUploadService.pickImage('library');

// Take photo
const { uri, error } = await fileUploadService.takePhoto();

// Upload with options
const { success, url, error } = await fileUploadService.uploadImage(uri, 'image.jpg', {
  compress: true,
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
});
```

### Receipt Upload

```typescript
import { fileUploadService } from '../services';

const { success, url, error } = await fileUploadService.uploadReceipt(imageUri);
```

## 🤖 AI Features

### SMS Transaction Parsing

```typescript
import { aiTransactionParser } from '../utils/aiTransactionParser';

const smsText = "Your account has been debited $25.50 for purchase at Walmart";
const { success, transaction, error } = await aiTransactionParser.parseSMSTransaction(smsText);

if (success && transaction) {
  // Create transaction from parsed data
  const { transaction: newTransaction, error } = await aiTransactionParser.createTransactionFromParsed(
    transaction,
    'account-id'
  );
}
```

### Receipt Scanning

```typescript
import { aiTransactionParser } from '../utils/aiTransactionParser';

const { success, transaction, error } = await aiTransactionParser.parseReceiptImage(imageUri);

if (success && transaction) {
  // Create transaction from parsed receipt
  const { transaction: newTransaction, error } = await aiTransactionParser.createTransactionFromParsed(
    transaction,
    'account-id'
  );
}
```

### Financial Advice

```typescript
import { aiTransactionParser } from '../utils/aiTransactionParser';

const { advice, confidence, suggestions, follow_up_questions } = await aiTransactionParser.getFinancialAdvice({
  question: "How can I save more money?",
  context: {
    current_balance: 5000,
    monthly_income: 4000,
    monthly_expenses: 3000,
    savings_goal: 10000,
  },
});
```

## 📱 Usage Examples

### Complete Authentication Flow

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../contexts/SupabaseContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} disabled={loading} />
      <Button title="Sign Up" onPress={handleSignUp} disabled={loading} />
    </View>
  );
}
```

### Dashboard with Real-time Data

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useAuth } from '../contexts/SupabaseContext';
import { accountsService, transactionsService } from '../services';

export default function Dashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
  }, []);

  const loadData = async () => {
    const [accountsResult, transactionsResult] = await Promise.all([
      accountsService.getAccounts(),
      transactionsService.getRecentTransactions(10),
    ]);

    setAccounts(accountsResult.accounts);
    setTransactions(transactionsResult.transactions);
    setLoading(false);
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to account updates
    accountsService.subscribeToAccounts((payload) => {
      console.log('Account updated:', payload);
      loadData(); // Reload data
    });

    // Subscribe to transaction updates
    transactionsService.subscribeToTransactions((payload) => {
      console.log('Transaction updated:', payload);
      loadData(); // Reload data
    });
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.email}!</Text>
      <Text>Accounts: {accounts.length}</Text>
      <Text>Recent Transactions: {transactions.length}</Text>
    </View>
  );
}
```

## ⚙️ Configuration

### Deep Linking

Add to your `app.json`:

```json
{
  "expo": {
    "scheme": "octopusfinance",
    "ios": {
      "bundleIdentifier": "com.yourapp.octopusfinance"
    },
    "android": {
      "package": "com.yourapp.octopusfinance"
    }
  }
}
```

### Supabase Edge Functions

Make sure your Supabase project has the following edge functions:

1. `parse-transaction`: For SMS and receipt parsing
2. `financial-advisor-chat`: For financial advice
3. `auto-categorize`: For automatic transaction categorization

### Storage Buckets

Create the following storage buckets in Supabase:

1. `user-files`: For general file uploads
2. `receipts`: For receipt images
3. `avatars`: For user profile pictures

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check if user is properly authenticated
   - Verify RLS policies are correctly set
   - Ensure user profile exists

2. **File Upload Issues**
   - Check storage bucket permissions
   - Verify file size limits
   - Ensure proper MIME types

3. **Real-time Issues**
   - Check network connectivity
   - Verify subscription setup
   - Ensure proper cleanup in useEffect

4. **AI Features Not Working**
   - Verify edge functions are deployed
   - Check function permissions
   - Ensure proper request format

### Debug Mode

Enable debug logging:

```typescript
import { supabase } from '../lib/supabase/client';

// Enable debug mode
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session?.user?.id);
});
```

### Error Handling

Always wrap service calls in try-catch:

```typescript
try {
  const { data, error } = await someService.someMethod();
  if (error) {
    console.error('Service error:', error);
    // Handle error appropriately
  }
} catch (error) {
  console.error('Unexpected error:', error);
  // Handle unexpected errors
}
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Expo Documentation](https://docs.expo.dev/)
- [Expo File System](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

## 🤝 Support

For issues related to this Supabase integration:

1. Check the troubleshooting section above
2. Review the Supabase dashboard logs
3. Check the Expo development server logs
4. Verify all dependencies are properly installed

---

**Note**: This integration is specifically designed for React Native Expo and includes mobile-optimized features like secure storage, file handling, and offline capabilities. 