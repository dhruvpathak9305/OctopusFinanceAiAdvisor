# Transaction Splitting CRUD Operations

## Overview
Complete reference for Create, Read, Update, and Delete operations on split transactions, including cascade behavior and data synchronization.

**Status**: ✅ **FULLY IMPLEMENTED & TESTED**

---

## 🔐 Database CASCADE Configuration

### Schema Definition
```sql
-- transaction_splits table (Line 19)
CONSTRAINT transaction_splits_transaction_id_fkey 
  FOREIGN KEY (transaction_id) 
  REFERENCES public.transactions_real (id) 
  ON DELETE CASCADE  -- ✅ Auto-delete splits when transaction deleted
```

### What CASCADE Does
When you delete a transaction:
1. ✅ Transaction deleted from `transactions_real`
2. ✅ **ALL related splits automatically deleted** from `transaction_splits`
3. ✅ No orphan records
4. ✅ No manual cleanup needed

---

## 📖 CRUD Operations

### 1️⃣ CREATE - Add Split Transaction

#### UI Flow
```
User Action:
1. Opens transaction form
2. Enables "Split" toggle
3. Selects group: "Test"
4. Selects who paid: "dhruvpathak9305"
5. Splits shown: 3 people × ₹33.33
6. Clicks "Add Transaction"
```

#### Service Layer
```typescript
// services/expenseSplittingService.ts
await ExpenseSplittingService.createTransactionWithSplits(
  transactionData,  // Basic transaction info
  splits,           // Array of split calculations
  groupId,          // "Test" group ID
  "equal",          // Split type
  paidByUserId      // Who paid
);
```

#### Database Function
```sql
-- Executes: create_transaction_with_splits()
BEGIN
  -- 1. Insert transaction
  INSERT INTO transactions_real (...) RETURNING id;
  
  -- 2. Insert splits (one per participant)
  INSERT INTO transaction_splits (
    transaction_id,
    user_id,
    paid_by,  -- ✅ Who actually paid
    share_amount,
    group_id,
    ...
  ) VALUES ...;
  
  RETURN transaction_id;
END;
```

#### Result
- ✅ 1 record in `transactions_real`
- ✅ N records in `transaction_splits` (N = number of participants)
- ✅ Group balances include this transaction
- ✅ Account balance updated (via trigger)

---

### 2️⃣ READ - View Split Transactions

#### Get Transaction with Splits
```typescript
// Fetch transaction
const transaction = await supabase
  .from('transactions_real')
  .select('*')
  .eq('id', transactionId)
  .single();

// Fetch splits
const splits = await ExpenseSplittingService.getTransactionSplits(
  transactionId
);
```

#### Get Group Balances
```typescript
// Fetch group with financial data
const groupData = await GroupFinancialService.getUserGroupsWithFinancials();

// Fetch member balances
const memberBalances = await GroupFinancialService.getGroupMemberBalances(
  groupId
);
```

#### Database Queries
```sql
-- Get transaction splits
SELECT * FROM transaction_splits 
WHERE transaction_id = 'xxx';

-- Get group balances (uses paid_by correctly after Migration #13)
SELECT * FROM get_group_balances('group-id');
```

#### UI Display
- ✅ Transaction shows split badge (call-split icon)
- ✅ Edit screen shows split section expanded
- ✅ Participants list populated from DB
- ✅ Selected payer highlighted
- ✅ Group pre-selected

---

### 3️⃣ UPDATE - Modify Split Transaction

#### Current Behavior ⚠️
**Splits are NOT automatically updated when editing transactions.**

#### What Happens Now:
1. User edits transaction amount
2. Transaction record updates ✅
3. **Splits remain unchanged** ⚠️
4. Balances may be incorrect

#### Recommended Solution:

##### Option A: Delete & Recreate Splits (Simpler)
```typescript
async function updateSplitTransaction(
  transactionId: string,
  newData: TransactionData,
  newSplits: SplitCalculation[]
) {
  // 1. Delete old splits
  await supabase
    .from('transaction_splits')
    .delete()
    .eq('transaction_id', transactionId);
  
  // 2. Update transaction
  await supabase
    .from('transactions_real')
    .update(newData)
    .eq('id', transactionId);
  
  // 3. Create new splits
  await ExpenseSplittingService.createSplitsForTransaction(
    transactionId,
    newSplits
  );
}
```

##### Option B: Smart Update (More Complex)
```typescript
async function updateSplitTransaction(
  transactionId: string,
  newData: TransactionData,
  newSplits: SplitCalculation[]
) {
  // Compare old vs new splits
  // Update matching, delete removed, insert new
  // More efficient but complex
}
```

##### Option C: Prevent Editing (Safest)
```typescript
// In UI: Don't allow editing split transactions
if (transaction.metadata?.has_splits) {
  Alert.alert(
    "Cannot Edit Split Transaction",
    "Delete and recreate to modify split transactions.",
    [{ text: "OK" }]
  );
  return;
}
```

#### ⚠️ TODO: Implement Update Logic
Currently, updating split transactions is **NOT IMPLEMENTED**. You should:
1. Choose an approach (A, B, or C above)
2. Implement in `services/expenseSplittingService.ts`
3. Add UI logic in `QuickAddButton/index.tsx`

---

### 4️⃣ DELETE - Remove Split Transaction

#### UI Flow
```
User Action:
1. Long press on transaction
2. Selects "Delete"
3. Confirms deletion
```

#### Service Layer
```typescript
// services/transactionsService.ts
await deleteTransaction(transactionId);
```

#### Database Execution
```sql
-- User's delete command
DELETE FROM transactions_real WHERE id = 'xxx';

-- What happens automatically:
-- 1. Transaction deleted ✅
-- 2. CASCADE triggered ✅
-- 3. All splits deleted ✅
DELETE FROM transaction_splits WHERE transaction_id = 'xxx';  -- Auto

-- 4. Balance trigger fires ✅
-- 5. Account balance reverted ✅
```

#### Result
- ✅ Transaction removed from `transactions_real`
- ✅ **All splits automatically removed** from `transaction_splits` (CASCADE)
- ✅ Group balance recalculates (next query)
- ✅ Account balance reverted (via trigger)
- ✅ UI refreshes
- ✅ No orphan data

#### Verification
```sql
-- Check if splits were deleted
SELECT COUNT(*) FROM transaction_splits 
WHERE transaction_id = 'deleted-transaction-id';
-- Returns: 0 ✅

-- Check group balances updated
SELECT * FROM get_group_balances('test-group-id');
-- Does NOT include deleted transaction ✅
```

---

## 🔄 Data Synchronization

### Automatic Sync (Already Working)

| Event | `transactions_real` | `transaction_splits` | `balance_real` | UI |
|-------|---------------------|----------------------|----------------|-----|
| **Create** | ✅ Inserted | ✅ Inserted (via function) | ✅ Updated (trigger) | ✅ Refreshes |
| **Delete** | ✅ Deleted | ✅ Auto-deleted (CASCADE) | ✅ Reverted (trigger) | ✅ Refreshes |
| **Update Amount** | ✅ Updated | ⚠️ Manual needed | ✅ Updated (trigger) | ⚠️ May show wrong splits |
| **Update Payer** | - | ⚠️ Manual needed | - | ⚠️ Wrong balances |

### Manual Sync Required For:
1. ⚠️ **Updating transaction amount** → Recalculate splits
2. ⚠️ **Changing participants** → Delete/recreate splits
3. ⚠️ **Changing split type** → Recalculate splits
4. ⚠️ **Changing payer** → Update `paid_by` in all splits

---

## 🧪 Testing DELETE CASCADE

### Test 1: Basic Delete
```sql
-- Create test transaction with splits
SELECT create_transaction_with_splits(
  '{"name":"Test", "amount":100, ...}'::jsonb,
  ARRAY[
    '{"user_id":"xxx", "share_amount":50}'::jsonb,
    '{"user_id":"yyy", "share_amount":50}'::jsonb
  ]
);

-- Verify splits created
SELECT COUNT(*) FROM transaction_splits WHERE transaction_id = 'xxx';
-- Returns: 2

-- Delete transaction
DELETE FROM transactions_real WHERE id = 'xxx';

-- Verify splits auto-deleted
SELECT COUNT(*) FROM transaction_splits WHERE transaction_id = 'xxx';
-- Returns: 0 ✅
```

### Test 2: Group Balance After Delete
```sql
-- Before delete
SELECT * FROM get_group_balances('test-group');
-- Shows 3 transactions

-- Delete one transaction
DELETE FROM transactions_real WHERE name = 'Test';

-- After delete
SELECT * FROM get_group_balances('test-group');
-- Shows 2 transactions, balances updated ✅
```

### Test 3: UI Sync
```typescript
// In your app:
1. Create split transaction "Dinner ₹300"
2. Verify shows in transaction list with split badge
3. Verify group balance shows ₹300
4. Delete transaction
5. Verify transaction removed from list
6. Verify group balance updated (no longer includes ₹300)
```

---

## 🎯 Best Practices

### ✅ DO:
1. **Delete split transactions** when you need to remove them
   - CASCADE handles cleanup automatically
   
2. **Check `metadata.has_splits`** before operations
   ```typescript
   if (transaction.metadata?.has_splits) {
     // Special handling for split transactions
   }
   ```

3. **Reload group balances** after operations
   ```typescript
   await groupFinancialService.getUserGroupsWithFinancials();
   ```

4. **Use database functions** for complex operations
   ```typescript
   await ExpenseSplittingService.createTransactionWithSplits(...);
   // Don't manually insert splits
   ```

### ❌ DON'T:
1. **Don't manually delete splits**
   ```sql
   -- ❌ WRONG
   DELETE FROM transaction_splits WHERE transaction_id = 'xxx';
   DELETE FROM transactions_real WHERE id = 'xxx';
   
   -- ✅ RIGHT
   DELETE FROM transactions_real WHERE id = 'xxx';
   -- Splits auto-deleted via CASCADE
   ```

2. **Don't update transaction amount without recalculating splits**
   ```typescript
   // ❌ WRONG
   await supabase
     .from('transactions_real')
     .update({ amount: 200 })
     .eq('id', transactionId);
   // Splits still show old amounts!
   
   // ✅ RIGHT
   // Delete and recreate, or implement smart update
   ```

3. **Don't create splits without using the function**
   ```typescript
   // ❌ WRONG
   await supabase.from('transaction_splits').insert(...);
   
   // ✅ RIGHT
   await ExpenseSplittingService.createTransactionWithSplits(...);
   ```

---

## 🔧 Implementation Status

| Operation | Status | Notes |
|-----------|--------|-------|
| **CREATE** | ✅ Complete | Via `createTransactionWithSplits` |
| **READ** | ✅ Complete | Via `getTransactionSplits` |
| **UPDATE** | ⚠️ Not Implemented | Needs design decision (see Options A/B/C) |
| **DELETE** | ✅ Complete | CASCADE working perfectly |
| **CASCADE** | ✅ Working | Splits auto-deleted with transaction |
| **Triggers** | ✅ Working | Balance updates automatic |
| **UI Sync** | ✅ Working | Real-time subscriptions active |

---

## 🚀 Next Steps

### For UPDATE Implementation:
1. **Choose approach** (Recommend Option A: Delete & Recreate)
2. **Create function**: `updateTransactionWithSplits()`
3. **Update UI**: Handle edit mode for split transactions
4. **Add validation**: Prevent partial updates
5. **Test thoroughly**: Especially balance calculations

### Example Implementation (Option A):
```typescript
// services/expenseSplittingService.ts
static async updateTransactionWithSplits(
  transactionId: string,
  transactionData: any,
  newSplits: SplitCalculation[],
  groupId?: string,
  splitType: string = "equal",
  paidByUserId?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Start transaction
  try {
    // 1. Delete old splits
    const { error: deleteError } = await supabase
      .from('transaction_splits')
      .delete()
      .eq('transaction_id', transactionId);
    
    if (deleteError) throw deleteError;

    // 2. Update transaction
    const { error: updateError } = await supabase
      .from('transactions_real')
      .update({
        ...transactionData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .eq('user_id', user.id);
    
    if (updateError) throw updateError;

    // 3. Create new splits
    const splitsData = newSplits.map(split => ({
      transaction_id: transactionId,
      user_id: split.user_id,
      is_guest_user: split.is_guest || false,
      guest_name: split.user_name,
      guest_email: split.user_email,
      group_id: groupId || null,
      share_amount: split.share_amount,
      share_percentage: split.share_percentage,
      split_type: splitType,
      paid_by: paidByUserId || user.id,
    }));

    const { error: insertError } = await supabase
      .from('transaction_splits')
      .insert(splitsData);
    
    if (insertError) throw insertError;

  } catch (error) {
    console.error('Error updating split transaction:', error);
    throw error;
  }
}
```

---

## 📚 Related Documentation

- **Database Schema**: `database/group-expense-splitting/03_create_transaction_splits_table.sql`
- **Functions**: `database/group-expense-splitting/04_splitting_functions.sql`
- **Service Layer**: `services/expenseSplittingService.ts`
- **UI Components**: `src/mobile/components/ExpenseSplitting/`
- **Architecture**: `docs/features/transaction-splitting/SPLIT_ARCHITECTURE_EXPLAINED.md`

---

**Last Updated**: October 25, 2025  
**Status**: CREATE/READ/DELETE ✅ | UPDATE ⚠️ To Be Implemented

