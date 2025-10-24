# Transaction Splitting Implementation Plan

## Executive Summary
Based on database analysis, **the database IS FULLY CAPABLE** of handling transaction splits. All required tables, functions, and constraints are in place. However, the **mobile app integration needs completion** to save splits when creating/editing transactions.

---

## 1. Current Database Capabilities ✅

### 1.1 Tables Available
- ✅ `transaction_splits` - Stores split information
- ✅ `groups` - Group management
- ✅ `group_members` - Group membership (with mobile_number & relationship fields)
- ✅ `individual_contacts` - Individual split contacts
- ✅ `transactions_real` - Main transactions table
- ✅ `financial_relationships` - Relationship tracking

### 1.2 Database Functions Available
- ✅ `create_transaction_with_splits()` - Create transaction with splits atomically
- ✅ `settle_transaction_split()` - Mark a split as paid
- ✅ `get_user_unsettled_splits()` - Get unpaid splits
- ✅ `get_group_balances()` - Calculate who owes whom
- ✅ `update_relationship_on_split()` - Auto-trigger for relationship updates

### 1.3 Constraints & Validation
- ✅ Split amounts must be positive
- ✅ Share percentages 0-100%
- ✅ Split types: equal, percentage, custom, amount
- ✅ Unique user per transaction (no duplicate splits)
- ✅ Transaction amount validation (splits must match transaction ±0.01 for rounding)
- ✅ Cascading deletes (transaction deleted = splits deleted)

### 1.4 Row Level Security (RLS)
- ✅ Users can only see their own splits
- ✅ Transaction owners can create/delete splits
- ✅ Users can update their own split status

---

## 2. What's Missing / Needs Implementation

### 2.1 Mobile App Integration ⚠️

**CRITICAL**: The mobile app UI exists but doesn't actually **SAVE** splits to the database when creating transactions.

**Current Flow (Incomplete)**:
```typescript
User creates transaction → Enables split → Selects group/individuals → 
Configures split → Presses "Add Transaction" → 
❌ SPLITS ARE NOT SAVED TO DB
```

**Required Integration Points**:

1. **QuickAddButton/AddTransactionModal** (`src/mobile/components/QuickAddButton/index.tsx`)
   - Needs to call `create_transaction_with_splits()` instead of regular insert
   - Must pass split data along with transaction data

2. **ExpenseSplittingService** (`services/expenseSplittingService.ts`)
   - ✅ Has `createTransactionWithSplits()` method
   - ⚠️ **But it's not being called from the UI**

3. **Transaction Form State Management**
   - Need to pass split data from `ExpenseSplittingInterface` to parent
   - Currently stored in local state but not sent to backend

---

## 3. Implementation Roadmap

### Phase 1: Complete Basic Split Creation (Priority: HIGH)

#### Step 1.1: Update Transaction Creation Flow
**File**: `src/mobile/components/QuickAddButton/index.tsx`

```typescript
// Currently (around line 580):
const response = await supabase
  .from("transactions_real")
  .insert([transactionData]);

// Should be:
if (hasSplits && splits.length > 0) {
  // Use the split-enabled function
  await ExpenseSplittingService.createTransactionWithSplits(
    transactionData,
    splits,
    selectedGroup?.id
  );
} else {
  // Regular transaction
  await supabase
    .from("transactions_real")
    .insert([transactionData]);
}
```

#### Step 1.2: Update ExpenseSplittingService
**File**: `services/expenseSplittingService.ts`

Current method signature needs update to match UI data structure:
```typescript
static async createTransactionWithSplits(
  transactionData: any,
  splits: SplitCalculation[],
  groupId?: string
): Promise<string>
```

Needs to handle:
- Converting SplitCalculation[] to database format
- Setting `paid_by` field (who actually paid)
- Handling both group and individual splits
- Error handling and rollback

#### Step 1.3: Add Edit Transaction Support
**File**: `src/mobile/components/QuickAddButton/index.tsx`

When editing a transaction with splits:
1. Load existing splits from database
2. Allow user to modify split configuration
3. Delete old splits and create new ones (or use UPDATE logic)

---

### Phase 2: Handle Non-Registered Users (Priority: MEDIUM)

#### Issue: Guest Users in Splits
The `transaction_splits` table has a foreign key to `auth.users`:
```sql
CONSTRAINT transaction_splits_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
```

But `group_members` can have non-registered users (guests).

**Solutions**:

**Option A** (Recommended): Store guest user info in metadata
```typescript
// For non-registered users, create a metadata entry
{
  user_id: 'GUEST_UUID',  // Use a special marker UUID
  metadata: {
    is_guest: true,
    name: 'Shivam',
    email: 'shivam@gmail.com',
    mobile_number: '+91...',
    relationship: 'Friend'
  }
}
```

**Option B**: Modify database constraint
```sql
-- Remove the foreign key constraint
ALTER TABLE transaction_splits 
  DROP CONSTRAINT transaction_splits_user_id_fkey;

-- Add columns for guest info
ALTER TABLE transaction_splits
  ADD COLUMN is_guest_user BOOLEAN DEFAULT FALSE,
  ADD COLUMN guest_name TEXT,
  ADD COLUMN guest_email TEXT,
  ADD COLUMN guest_mobile TEXT;
```

---

### Phase 3: Edge Cases & Validation (Priority: HIGH)

#### 3.1 Rounding Issues
**Problem**: 1000 rupees split 3 ways = 333.33 × 3 = 999.99

**Solution** (Already in DB function):
```sql
-- Allows 1 paisa difference
IF ABS(v_total_splits - v_transaction_amount) > 0.01 THEN
  RAISE EXCEPTION 'Split amounts do not match';
END IF;
```

**UI Handling**:
- Give rounding difference to first participant
- Show "Adjusted" label when rounding applied

#### 3.2 Zero Amount Splits
**Scenario**: User adds someone but sets their share to 0

**Solution**:
- Prevent splits with 0 amount in UI
- Database has CHECK constraint: `share_amount > 0`

#### 3.3 Single Person Split
**Scenario**: User splits expense with only themselves

**Solution**:
- Allow it (valid use case for tracking)
- But show warning: "This is the same as a regular transaction"

#### 3.4 Transaction Deletion with Splits
**Scenario**: User deletes a transaction that has splits

**Solution**:
- ✅ Already handled via CASCADE
- ⚠️ Need to show warning in UI: "This transaction has splits. Deleting will remove split records."

#### 3.5 Partial Payments
**Scenario**: Multiple people paid different portions

**Current**: Only supports one payer (`paid_by` field)

**Enhancement Needed**:
```typescript
// Store multiple payers in metadata
metadata: {
  payers: [
    { user_id: 'xxx', amount_paid: 2000 },
    { user_id: 'yyy', amount_paid: 3535.9 }
  ]
}
```

#### 3.6 Transaction Amount Changes
**Scenario**: User edits transaction amount after splits are created

**Solutions**:
1. **Proportional Adjustment** (Recommended)
   - Recalculate all splits based on original percentages
   - Example: 1000→1500, 33.3%→500 instead of 333.33

2. **Reset Splits**
   - Force user to reconfigure splits

3. **Lock Amount**
   - Prevent amount changes on split transactions

#### 3.7 Currency Mismatches
**Scenario**: Transaction in USD, splits in INR

**Current**: Not handled

**Solution**:
- Store currency at split level
- Use exchange rates (out of scope for now)
- For MVP: All splits must be in same currency as transaction

---

## 4. Split Type Implementations

### 4.1 Equal Split (Simplest)
```typescript
// Amount: 5535.9, People: 3
per_person = 5535.9 / 3 = 1845.30
// Give rounding difference to first person
splits = [1845.30, 1845.30, 1845.30]
```

### 4.2 Percentage Split
```typescript
// Amount: 5535.9
// Person A: 40%, Person B: 30%, Person C: 30%
splits = [
  { user: 'A', amount: 2214.36, percentage: 40 },
  { user: 'B', amount: 1660.77, percentage: 30 },
  { user: 'C', amount: 1660.77, percentage: 30 },
]
// Total: 5535.90 ✅
```

### 4.3 Custom/Exact Amounts
```typescript
// User manually enters amounts
splits = [
  { user: 'A', amount: 2000 },
  { user: 'B', amount: 1535.9 },
  { user: 'C', amount: 2000 },
]
// Validation: 2000 + 1535.9 + 2000 = 5535.9 ✅
```

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│   USER CREATES TRANSACTION WITH SPLIT           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  1. User enters transaction details              │
│     - Amount: 5535.9                             │
│     - Description: "Society Maintenance"         │
│     - Date, Category, etc.                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. User enables "Split" toggle                  │
│     - Chooses: Group or Individual               │
│     - Selects: GOB Group (3 members)             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. User configures split type                   │
│     - Equal split selected                       │
│     - System calculates: 1845.30 per person      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. User presses "Add Transaction"               │
│     ⚠️ CRITICAL POINT - Need implementation      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. Call create_transaction_with_splits()        │
│     - Creates transaction in transactions_real   │
│     - Creates 3 split records                    │
│     - Atomic operation (rollback on error)       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  6. Database validates                           │
│     ✓ Split amounts match transaction amount     │
│     ✓ All user_ids exist                         │
│     ✓ No duplicate participants                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  7. SUCCESS - Transaction with splits created    │
│     - Transaction ID returned                    │
│     - UI shows success message                   │
│     - Redirects to transactions list             │
└─────────────────────────────────────────────────┘
```

---

## 6. Testing Checklist

### 6.1 Basic Functionality
- [ ] Create transaction with equal split (2 people)
- [ ] Create transaction with equal split (3 people - test rounding)
- [ ] Create transaction with percentage split
- [ ] Create transaction with custom amounts
- [ ] Create transaction with group split
- [ ] Create transaction with individual split
- [ ] Edit transaction without changing splits
- [ ] Edit transaction and modify splits
- [ ] Delete transaction with splits

### 6.2 Edge Cases
- [ ] Split with 10+ people
- [ ] Split with decimal amounts (0.01)
- [ ] Split with large amounts (1,00,000+)
- [ ] Split with non-registered users
- [ ] Split where user is not a participant
- [ ] Duplicate split creation (should fail)
- [ ] Negative amounts (should fail)
- [ ] Split total != transaction amount (should fail)

### 6.3 Group Scenarios
- [ ] Create group with 3 members
- [ ] Add members with mobile & relationship
- [ ] Split transaction with all group members
- [ ] Split transaction with subset of group members
- [ ] Delete group member (what happens to their splits?)

### 6.4 Settlement
- [ ] Mark split as paid
- [ ] View unsettled splits
- [ ] Calculate who owes whom
- [ ] Full settlement of a transaction
- [ ] Partial settlements

---

## 7. Implementation Priority

### **🔴 Phase 1 - CRITICAL (Week 1)**
1. ✅ Database schema verified - DONE
2. ⚠️ **Integrate split creation in QuickAddButton**
3. ⚠️ **Test basic equal split functionality**
4. ⚠️ **Handle non-registered users** (Option A - metadata approach)

### **🟡 Phase 2 - HIGH (Week 2)**
5. Add edit transaction with splits
6. Add delete confirmation for split transactions
7. Handle all split types (equal, percentage, custom)
8. Add validation error messages

### **🟢 Phase 3 - MEDIUM (Week 3)**
9. View split details in transaction list
10. Show split summary in transaction details
11. Add "My Splits" screen to view all unsettled splits
12. Add settlement functionality

### **🔵 Phase 4 - LOW (Week 4+)**
13. Group balance calculations
14. Split history and analytics
15. Export split data
16. Notifications for unsettled splits

---

## 8. Database Migration Required

### 8.1 Already Applied ✅
- Mobile number and relationship fields in `group_members`

### 8.2 Need to Apply
Run this migration to support guest users:

```sql
-- File: database/group-expense-splitting/11_support_guest_splits.sql

-- Add columns to transaction_splits for guest user support
ALTER TABLE public.transaction_splits
  ADD COLUMN IF NOT EXISTS is_guest_user BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_mobile TEXT,
  ADD COLUMN IF NOT EXISTS guest_relationship TEXT;

-- Update constraint to allow NULL user_id for guests
ALTER TABLE public.transaction_splits
  DROP CONSTRAINT IF EXISTS transaction_splits_user_id_fkey;

-- Add conditional constraint
ALTER TABLE public.transaction_splits
  ADD CONSTRAINT transaction_splits_user_guest_check
  CHECK (
    (is_guest_user = FALSE AND user_id IS NOT NULL AND guest_name IS NULL) OR
    (is_guest_user = TRUE AND guest_name IS NOT NULL AND guest_email IS NOT NULL)
  );

-- Create index for guest users
CREATE INDEX IF NOT EXISTS idx_transaction_splits_guest_email
  ON public.transaction_splits (guest_email)
  WHERE is_guest_user = TRUE;

COMMENT ON COLUMN public.transaction_splits.is_guest_user IS 'Whether this split is for a non-registered user';
COMMENT ON COLUMN public.transaction_splits.guest_name IS 'Name of guest user (if not registered)';
COMMENT ON COLUMN public.transaction_splits.guest_email IS 'Email of guest user (if not registered)';
```

---

## 9. Key Files to Modify

### Frontend (React Native)
1. **`src/mobile/components/QuickAddButton/index.tsx`** (Lines 580-650)
   - Modify `handleAddTransaction()` to call split service
   - Add split data to form state

2. **`src/mobile/components/ExpenseSplitting/ExpenseSplittingInterface.tsx`**
   - Already exists, ensure proper data flow to parent

3. **`services/expenseSplittingService.ts`**
   - Update `createTransactionWithSplits()` method
   - Add guest user handling

### Backend (Supabase Functions)
- `database/group-expense-splitting/04_splitting_functions.sql`
   - Update `create_transaction_with_splits()` if needed
   - Add guest user support

---

## 10. Sample Code Implementation

### 10.1 Update QuickAddButton Component

```typescript
// In handleAddTransaction function
const handleAddTransaction = async () => {
  try {
    setLoading(true);

    // Prepare transaction data
    const transactionData = {
      user_id: user.id,
      name: description,
      amount: parseFloat(amount),
      date: selectedDate,
      type: transactionType,
      category: category,
      subcategory: subcategory,
      // ... other fields
    };

    let result;

    // Check if transaction has splits
    if (splitData && splitData.isEnabled && splitData.splits.length > 0) {
      // Create transaction with splits
      const transactionId = await ExpenseSplittingService.createTransactionWithSplits(
        transactionData,
        splitData.splits,
        splitData.groupId
      );
      result = { data: { id: transactionId }, error: null };
    } else {
      // Regular transaction without splits
      result = await supabase
        .from('transactions_real')
        .insert([transactionData])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    // Success
    Alert.alert('Success', 'Transaction added successfully!');
    onClose();
    
  } catch (error) {
    console.error('Error adding transaction:', error);
    Alert.alert('Error', 'Failed to add transaction');
  } finally {
    setLoading(false);
  }
};
```

---

## 11. Conclusion

### Current Status: **70% Complete**
- ✅ Database fully capable
- ✅ UI components built
- ⚠️ **Integration missing** (critical gap)
- ❌ Testing not done
- ❌ Guest user support needs enhancement

### Next Steps:
1. **TODAY**: Implement transaction creation with splits integration
2. **This Week**: Test basic split functionality end-to-end
3. **Next Week**: Add edit/delete support and settlement features

### Estimated Time:
- **Phase 1 (Critical)**: 2-3 days
- **Phase 2 (High)**: 3-4 days  
- **Phase 3 (Medium)**: 1 week
- **Total MVP**: 2-3 weeks for production-ready split functionality

---

**Last Updated**: October 23, 2025
**Status**: Ready for implementation
**Risk Level**: Low (database is solid, only integration work needed)

