# Transaction Split Implementation - Execution Plan

## 🎯 Goal
Make the split functionality work end-to-end: Create transaction → Enable split → Configure → Save → Actually stores in database

---

## ✅ Pre-Flight Check

### Database Status
- ✅ `transaction_splits` table exists
- ✅ `groups` table exists
- ✅ `group_members` table exists (with mobile_number & relationship)
- ✅ `create_transaction_with_splits()` function exists
- ⚠️ Guest user support needs migration

### Code Status
- ✅ UI components built (`ExpenseSplittingInterface`, `SplitToggle`, etc.)
- ✅ Service exists (`ExpenseSplittingService.ts`)
- ⚠️ Integration missing (QuickAddButton doesn't call split service)

---

## 📋 Implementation Steps

### **Phase 1: Database Setup** (15 minutes)

#### Step 1.1: Run Guest User Migration
**File**: `database/group-expense-splitting/11_support_guest_splits.sql`
**Status**: ⏳ Ready to run
**Action**: Execute SQL migration

**What it does**:
- Allows non-registered users (Shivam, Yash) in splits
- Adds guest_name, guest_email, guest_mobile, guest_relationship fields
- Updates `create_transaction_with_splits()` function

---

### **Phase 2: Backend Integration** (2-3 hours)

#### Step 2.1: Update ExpenseSplittingService
**File**: `services/expenseSplittingService.ts`
**Current**: Method exists but needs enhancement
**Changes**:
1. Update `createTransactionWithSplits()` to handle guest users
2. Add proper error handling
3. Format data for database function
4. Return transaction ID

#### Step 2.2: Update Transaction Types
**File**: `types/splitting.ts`
**Changes**:
1. Add guest user flags to interfaces
2. Ensure types match database structure

---

### **Phase 3: Frontend Integration** (3-4 hours)

#### Step 3.1: Add Split State to QuickAddButton
**File**: `src/mobile/components/QuickAddButton/index.tsx`
**Current**: Has split UI but doesn't capture data
**Changes**:
1. Add state to track split data
2. Capture data from `ExpenseSplittingInterface`
3. Pass split configuration to submit handler

#### Step 3.2: Update Transaction Creation Logic
**File**: `src/mobile/components/QuickAddButton/index.tsx` (handleAddTransaction)
**Current**: Only does regular insert
**Changes**:
```typescript
// Replace simple insert with conditional logic
if (hasSplits && splits.length > 0) {
  await ExpenseSplittingService.createTransactionWithSplits(...)
} else {
  await supabase.from('transactions_real').insert(...)
}
```

#### Step 3.3: Update Edit Transaction Flow
**File**: `src/mobile/components/QuickAddButton/index.tsx` (edit mode)
**Changes**:
1. Load existing splits when editing
2. Allow modification of split configuration
3. Handle split updates properly

---

### **Phase 4: Testing** (2-3 hours)

#### Test 4.1: Basic Equal Split
- Create transaction: ₹1000, 2 people
- Verify: 1 transaction, 2 splits (₹500 each)

#### Test 4.2: Three-Way Split with Rounding
- Create transaction: ₹1000, 3 people
- Verify: Splits are ₹333.33, ₹333.33, ₹333.34

#### Test 4.3: Group Split (GOB)
- Create transaction: ₹5535.9
- Select: GOB group (you, Shivam, Yash)
- Verify: 1 transaction, 3 splits (₹1845.30 each)

#### Test 4.4: Guest Users
- Create split with non-registered users
- Verify: Guest fields populated (name, email, mobile, relationship)

#### Test 4.5: Percentage Split
- Create transaction: ₹1000
- Configure: 40%, 30%, 30%
- Verify: ₹400, ₹300, ₹300

#### Test 4.6: Edit Transaction
- Edit amount from ₹1000 to ₹1500
- Verify: Splits recalculate proportionally

#### Test 4.7: Delete Transaction
- Delete transaction with splits
- Verify: Splits also deleted (CASCADE)

---

## 🚀 Execution Timeline

### Day 1 (Today) - 4-5 hours
- ✅ Step 1.1: Run migration (15 min)
- ✅ Step 2.1: Update service (1 hour)
- ✅ Step 2.2: Update types (30 min)
- ✅ Step 3.1: Add split state (1 hour)
- ✅ Step 3.2: Update creation logic (1.5 hours)

**Goal**: Basic split creation working

### Day 2 - 2-3 hours
- ✅ Step 3.3: Edit transaction flow (2 hours)
- ✅ Test 4.1-4.4: Basic tests (1 hour)

**Goal**: Edit and basic tests passing

### Day 3 - 1-2 hours
- ✅ Test 4.5-4.7: Advanced tests (1 hour)
- ✅ Bug fixes and polish (1 hour)

**Goal**: Production ready

---

## 📁 Files We'll Modify

### Backend
1. `services/expenseSplittingService.ts` (150 lines affected)
2. `types/splitting.ts` (20 lines affected)

### Frontend
3. `src/mobile/components/QuickAddButton/index.tsx` (100 lines affected)
4. `src/mobile/components/ExpenseSplitting/ExpenseSplittingInterface.tsx` (minor updates)

### Database
5. Run: `database/group-expense-splitting/11_support_guest_splits.sql`

**Total**: ~300 lines of code changes + 1 migration

---

## 🎬 Let's Start!

### STEP 1: Run Database Migration

Run this now:
```bash
PGPASSWORD=KO5wgsWET2KgAvwr /opt/homebrew/opt/postgresql@16/bin/psql \
  -h db.fzzbfgnmbchhmqepwmer.supabase.co \
  -U postgres \
  -d postgres \
  -f database/group-expense-splitting/11_support_guest_splits.sql
```

### STEP 2: Update Service Layer

We'll modify `ExpenseSplittingService.createTransactionWithSplits()` to:
- Accept split data from UI
- Format for database function
- Handle guest users
- Return transaction ID

### STEP 3: Connect UI

We'll modify `QuickAddButton` to:
- Capture split configuration
- Call split service when enabled
- Show success/error properly

---

## ✅ Success Criteria

### Must Have
- [ ] Can create transaction with equal split (2-3 people)
- [ ] Transaction shows in list with split indicator
- [ ] Split details viewable
- [ ] Guest users (Shivam, Yash) work
- [ ] Your balance reflects full amount paid

### Nice to Have
- [ ] Edit transaction with splits
- [ ] Percentage and custom splits
- [ ] Delete confirmation
- [ ] Settlement tracking

---

## 🔥 Current Status: READY TO START

**Next Action**: Run the database migration, then I'll implement the code changes.

Say "Go" and I'll execute! 🚀

