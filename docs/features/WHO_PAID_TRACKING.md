# Who Paid Tracking in Group Splits

## 🎯 The Problem

**Current Behavior**: When splitting expenses in a group, the system assumes **the person who creates the transaction is the one who paid**.

**Real World Scenario**: In groups, different members pay for different things:
- **Alice** pays for dinner (₹500)
- **Bob** pays for tickets (₹300)  
- **Charlie** pays for taxi (₹200)

Each person should get credit for what **they actually paid**, not who entered it in the app.

---

## 🔍 Current Data Structure

Looking at your `transaction_splits` table, it has:
```sql
paid_by UUID  -- Column exists but not fully utilized
```

**Your current data shows**:
- All 9 splits have `user_id = "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9"` (you) in `transactions_real`
- This means YOU are marked as paying for all 3 transactions (3 x ₹100 = ₹300)
- But "Test" and "Test 2" members didn't pay anything

---

## ✅ How It Should Work

### **Scenario**: Three friends split ₹300 total expenses

**Transaction 1** - ₹100 for Dinner (YOU paid):
```
Total: ₹100
Split: 3 ways (₹33.33 each)
Paid by: dhruvpathak9305 ✅

You paid ₹100, but your share is only ₹33.33
→ Others owe you: ₹66.67
```

**Transaction 2** - ₹100 for Movie (Test paid):
```
Total: ₹100  
Split: 3 ways (₹33.33 each)
Paid by: Test ✅

Test paid ₹100, but their share is only ₹33.33
→ Others owe Test: ₹66.67
```

**Transaction 3** - ₹100 for Taxi (Test 2 paid):
```
Total: ₹100
Split: 3 ways (₹33.33 each)  
Paid by: Test 2 ✅

Test 2 paid ₹100, but their share is only ₹33.33
→ Others owe Test 2: ₹66.67
```

**Final Balances**:
- **You**: Paid ₹100, Owe ₹100 → Net: ₹0 (settled)
- **Test**: Paid ₹100, Owe ₹100 → Net: ₹0 (settled)
- **Test 2**: Paid ₹100, Owe ₹100 → Net: ₹0 (settled)

---

## 🚀 How to Implement This

### **Option 1: Manual Selection (Current Method)**

When adding a transaction with splits, the app should ask:
```
Who paid for this expense?
○ Me (dhruvpathak9305)
○ Test
○ Test 2
```

### **Option 2: Automatic from Transaction Source**

If the transaction is from:
- **Your bank SMS** → You paid
- **Test's bank SMS** → Test paid
- **Manual entry** → Ask who paid

---

## 🔧 Required Changes

### **1. Database Function Update**

The `get_group_balances` function needs to check `paid_by` column:

```sql
-- Current (WRONG):
-- Assumes transaction creator = payer
SELECT t.user_id as paid_by_user_id
FROM transactions_real t

-- Correct:
-- Check splits.paid_by first, fallback to transaction.user_id
SELECT 
  COALESCE(ts.paid_by, t.user_id) as paid_by_user_id
FROM transaction_splits ts
JOIN transactions_real t ON t.id = ts.transaction_id
```

### **2. UI Update Needed**

In `SplitCalculator.tsx` or `QuickAddButton.tsx`, add:

```typescript
// Add "Who paid?" selector
<Text>Who paid for this expense?</Text>
<Select
  value={paidByUserId}
  onChange={setPaidByUserId}
>
  {splitCalculations.map(participant => (
    <Option value={participant.user_id}>
      {participant.user_name}
    </Option>
  ))}
</Select>
```

### **3. Service Update**

In `expenseSplittingService.ts`, when creating splits:

```typescript
async createTransactionWithSplits(
  transactionData: any,
  splits: SplitCalculation[],
  paidByUserId: string  // ← NEW PARAMETER
) {
  // Set paid_by for each split
  const splitsWithPayer = splits.map(split => ({
    ...split,
    paid_by: paidByUserId  // ← SET WHO PAID
  }));
  
  // Insert with paid_by info
  await supabase.rpc('create_transaction_with_splits', {
    p_transaction_data: transactionData,
    p_splits: splitsWithPayer
  });
}
```

---

## 📊 Current vs Correct Balances

### **Your Current Data** (All paid by you):

| Member | Paid | Share | Net Balance |
|--------|------|-------|-------------|
| You | ₹300 | ₹100 | **+₹200** (others owe you) |
| Test | ₹0 | ₹100 | **-₹100** (owes you) |
| Test 2 | ₹0 | ₹100 | **-₹100** (owes you) |

**This is what you're seeing now** ✅

### **If Each Paid Once** (Fair distribution):

| Member | Paid | Share | Net Balance |
|--------|------|-------|-------------|
| You | ₹100 | ₹100 | **₹0** (settled) |
| Test | ₹100 | ₹100 | **₹0** (settled) |
| Test 2 | ₹100 | ₹100 | **₹0** (settled) |

**Everyone would be settled** ✅

---

## 🎯 Implementation Priority

### **Phase 1**: Fix Current Issues (Done ✅)
- ✅ Show all 3 members separately
- ✅ Calculate balances correctly
- ✅ Fix React key error

### **Phase 2**: Add "Who Paid" Tracking (To Do 📋)
- [ ] Add UI to select who paid
- [ ] Update database function to use `paid_by`
- [ ] Update service to pass `paid_by`
- [ ] Test with multiple payers

---

## 🔍 How to Check Current "Who Paid" Data

Run this in Supabase to see who paid what:

```sql
SELECT 
  t.id as transaction_id,
  t.name as transaction_name,
  t.amount,
  t.user_id as created_by,
  ts.paid_by as paid_by_in_split,
  u.email as creator_email
FROM transactions_real t
LEFT JOIN transaction_splits ts ON ts.transaction_id = t.id
LEFT JOIN auth.users u ON u.id = t.user_id
WHERE t.name = 'Test'
ORDER BY t.created_at;
```

---

## 💡 User Experience Flow

### **When Adding Split Transaction**:

1. Enter transaction details (amount, category, etc.)
2. Enable "Split Expense"
3. Select group and participants
4. **NEW**: Select "Who paid for this?"
   - Default: You (transaction creator)
   - Options: All group participants
5. Review split amounts
6. Save transaction

### **When Viewing Group Details**:

Shows accurate balances:
```
👤 Alice
   Paid: ₹500 (dinner + taxi)
   Share: ₹333
   Others owe them: ₹167 ✅

👤 Bob  
   Paid: ₹300 (tickets)
   Share: ₹333
   They owe: ₹33 ❌

👤 Charlie
   Paid: ₹200 (snacks)
   Share: ₹333
   They owe: ₹133 ❌
```

---

## 🚀 Next Steps

1. **Immediate**: Fix React key error (done above)
2. **Short-term**: Add "Who paid?" selector in UI
3. **Testing**: Verify balances calculate correctly with different payers

---

**Your question is absolutely valid!** The system should track who actually paid, not just who entered the transaction. This requires UI updates to let users select the payer when creating split transactions.

Would you like me to implement the "Who paid?" selector in the split transaction UI?

