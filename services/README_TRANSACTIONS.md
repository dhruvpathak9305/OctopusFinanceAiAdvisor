# Transaction Service

This file contains all source-of-truth functions for interacting with the backend transactions API or database.

## 📄 File: `/src/services/transactionsService.ts`

### Core Functions

#### Data Fetching
- **`fetchTransactions(filters?, isDemo?)`** - Fetch transactions with comprehensive filtering
- **`fetchTransactionById(id, isDemo?)`** - Fetch a single transaction by ID
- **`fetchTransactionSummary(filters?, isDemo?, includeComparison?)`** - Get transaction summary with optional period comparison
- **`fetchMonthlyTransactionSummary(type?, isDemo?, targetDate?)`** - Get monthly summary (current vs previous month)
- **`fetchTransactionHistory(filters?, isDemo?, months?)`** - Get transaction history for charts (multiple months)

#### Data Modification
- **`addTransaction(transaction, isDemo?)`** - Add a new transaction
- **`updateTransaction(id, updates, isDemo?)`** - Update an existing transaction
- **`deleteTransaction(id, isDemo?)`** - Delete a transaction

#### Helper Functions
- **`prepareTransactionForInsert(transaction, userId)`** - Transform transaction data for database insert
- **`transformTransactionResponse(rawData)`** - Transform raw database response to standard Transaction format
- **`getMonthlyDateRanges(targetDate?)`** - Get current and previous month date ranges

### Demo Mode Support

All functions support demo mode through the `isDemo` parameter:
- `isDemo = true` → Uses 'transactions' table (demo data)
- `isDemo = false` → Uses 'transactions_real' table (real user data)

### Error Handling

All functions include:
- Comprehensive error logging
- User-friendly toast notifications
- Proper error propagation for calling code

### Types

The service layer now uses the centralized Transaction type from `@/types/transactions`:

```typescript
// Imported from @/types/transactions
interface Transaction {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer' | 'loan' | 'loan_repayment' | 'debt' | 'debt_collection';
  amount: number;
  date: string;
  user_id: string;
  // ... see full interface in types/transactions.ts
}

interface TransactionFilters {
  type?: 'income' | 'expense' | 'transfer' | 'loan' | 'loan_repayment' | 'debt' | 'debt_collection' | 'all';
  dateRange?: { start: Date; end: Date };
  amountRange?: { min?: number; max?: number };
  // ... see full interface in service file
}
```

## Usage Guidelines

### ✅ Use these service functions in hooks or components to keep business logic and API logic decoupled.

### ❌ Do NOT directly import Supabase client in hooks/components for transaction operations.

### 📦 Hook Integration

The service functions are consumed by:

#### 1. **`/src/hooks/useFetchTransactions.ts`**
- **Purpose**: React state management for transaction lists
- **Responsibilities**: 
  - Local state updates
  - UI-specific data grouping/sorting
  - React lifecycle management
  - Demo mode integration

#### 2. **`/src/mobile/hooks/useTransactions.tsx`**
- **Purpose**: Mobile-specific transaction state management
- **Responsibilities**:
  - Legacy field mapping compatibility
  - Mobile UI state updates
  - Real-time subscription management
  - Toast notifications for mobile UX

### Type Consolidation Benefits

1. **🎯 Single Transaction Type**: All components now use the same Transaction interface from `@/types/transactions`
2. **🛡️ Type Safety**: Eliminates type mismatches between service layer and hooks
3. **🔧 Extended Type Support**: Now supports all transaction types including 'loan', 'loan_repayment', 'debt', 'debt_collection'
4. **📦 Centralized Maintenance**: Transaction type changes only need to be made in one place

### Architecture Benefits

1. **🔥 Single Source of Truth**: All API logic centralized in service layer
2. **🛡️ Consistent Demo Mode**: Demo/real data switching handled in one place
3. **🧪 Better Testability**: Pure service functions easier to unit test
4. **📦 Clear Separation**: API logic separate from React state management
5. **🔧 Easier Maintenance**: Changes propagate from service to all consumers

### Migration Notes

#### Before Refactoring:
- Duplicate API logic in multiple hooks
- Inconsistent demo mode support
- Mixed responsibilities (API + state management)
- **Multiple Transaction type definitions causing type mismatches**

#### After Refactoring:
- Service layer handles all API interactions
- Hooks focus only on React state management
- Consistent demo mode across all components
- Standardized error handling and user feedback
- **Centralized Transaction type eliminates type conflicts** 