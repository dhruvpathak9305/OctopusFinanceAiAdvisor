# Account Filter Testing Guide 🧪

**Quick reference for testing the new account filter feature**

---

## 🎯 Quick Test Steps

### **Test 1: Basic Filtering**
1. Open the mobile app and navigate to **Transactions** page
2. You should see **3 filter controls**:
   - Row 1: Date filter (left) | Sort/Type filter (right)
   - Row 2: Account filter (full width) ← NEW!
3. Click the **Account Filter** dropdown
4. You should see: "All Accounts", "Axis Bank", "HDFC Bank Ltd.", "ICICI Bank", "IDFC FIRST Bank", etc.
5. Select **"IDFC FIRST Bank"**
6. ✅ Verify only IDFC transactions are shown

### **Test 2: Check Console Logs**
Open React Native debugger and look for:
```
🏦 Filtering by account: IDFC FIRST Bank (ID: 328c756a-b05e-4925-a9ae-852f7fb18b4e)
🏦 Account filter applied: 50 → 15 transactions
```

### **Test 3: Combined Filters**
1. Set date to **"Oct 2025"**
2. Set account to **"IDFC FIRST Bank"**
3. Set type to **"Expense"**
4. ✅ Verify you see ONLY IDFC expenses from October

### **Test 4: All Accounts (Default)**
1. Select **"All Accounts"** from the dropdown
2. ✅ Verify you see transactions from ALL banks (ICICI, HDFC, IDFC, etc.)

### **Test 5: Check Summary Cards**
1. Filter by a specific account (e.g., "ICICI Bank")
2. ✅ Verify the Income/Expense/Net summary cards update to show only that account's totals

---

## 📊 Expected Results by Account

### **IDFC FIRST Bank (October 2025)**
Expected transactions:
- Burger King (₹104.96)
- Cab payments
- Food & dining
- Medicine
- Various expenses

### **HDFC Bank Ltd. (October 2025)**
Expected transactions:
- Dividend income (₹10.23)
- Any HDFC-specific transactions

### **ICICI Bank (October 2025)**
Expected transactions:
- Large transfers
- Salary credits
- ICICI-specific transactions

---

## 🐛 What to Look For

### **✅ Good Signs:**
- Dropdown opens smoothly
- Accounts listed alphabetically
- Filtering happens instantly (no loading spinner)
- Transaction count changes appropriately
- Summary cards update
- Works with other filters

### **❌ Potential Issues:**
- Dropdown shows "All Accounts" but no other accounts → Check `realAccounts` data
- Selecting an account shows 0 transactions → Check console for warnings
- Filtering is slow → Performance issue (shouldn't happen with current implementation)
- Wrong transactions shown → Check account ID matching

---

## 🔍 Debug Console Logs

If something doesn't work, check the console for these logs:

### **Normal Flow:**
```
🏦 Filtering by account: IDFC FIRST Bank (ID: 328c756a-b05e-4925-a9ae-852f7fb18b4e)
🏦 Account filter applied: 50 → 15 transactions
```

### **Warning Signs:**
```
⚠️ Account not found: IDFC FIRST Bank
```
This means the selected account isn't in the `realAccounts` array.

---

## 🧪 Advanced Testing

### **Test Account Matching Logic**

Open the React Native debugger and check the console when filtering:

1. **ID-based matching** (should happen first):
   - Transaction `source_account_id` should match selected account ID
   - Most reliable method

2. **Name-based matching** (fallback):
   - Used only if ID doesn't match
   - Checks `source_account_name` field

### **Test Edge Cases:**

1. **Null Account Transactions**
   - Filter: "All Accounts" → Should show transactions with null `source_account_id`
   - Filter: Any specific bank → Should NOT show null account transactions

2. **Multiple Accounts Same Institution**
   - "Kotak Mahindra" and "Kotak Mahindra Joint" should filter separately
   - ID-based matching ensures correct separation

3. **Empty Account Name**
   - Should not crash
   - Should fall back to account ID matching

---

## 📱 Device Testing

### **iOS**
- Test on iPhone simulator
- Check dropdown animation
- Verify touch targets are large enough

### **Android**
- Test on Android emulator
- Check dropdown z-index (should appear above other elements)
- Verify back button behavior

---

## 🎨 Visual Checks

### **Layout:**
```
┌────────────────────────────────────────┐
│  📅 Oct 2025    |   Oldest First ▼    │
├────────────────────────────────────────┤
│     🏦 IDFC FIRST Bank ▼               │  ← Should be full width
└────────────────────────────────────────┘
```

### **Dark Mode:**
- Account filter dropdown should match theme
- Text should be white in dark mode
- Background should be dark gray (#374151)

### **Light Mode:**
- Account filter dropdown should match theme
- Text should be dark (#111827)
- Background should be light gray (#F3F4F6)

---

## 🚀 Performance Benchmarks

### **Expected Performance:**
- Filtering 100 transactions: < 50ms
- Filtering 500 transactions: < 100ms
- Filtering 1000 transactions: < 200ms

### **If Slow:**
Check if:
1. Filtering is running on every render (should only run on filter change)
2. `fetchTransactionsData` dependency array is correct
3. No infinite loops in `useEffect`

---

## ✅ Acceptance Criteria

The feature is working correctly if:

1. ✅ Account filter dropdown appears below Date and Sort filters
2. ✅ Dropdown shows "All Accounts" + all active bank accounts
3. ✅ Selecting an account filters transactions instantly
4. ✅ Works in combination with date, type, and sort filters
5. ✅ Summary cards update to show filtered totals
6. ✅ No console errors or warnings (except expected debug logs)
7. ✅ Smooth animations and responsive UI
8. ✅ Works in both light and dark mode
9. ✅ Transaction count updates appropriately
10. ✅ "All Accounts" shows all transactions

---

## 🔧 Troubleshooting

### **Issue: Dropdown is empty (no accounts)**
**Cause**: `realAccounts` array is empty  
**Fix**: Check if `useRealAccountsData` hook is fetching data correctly

### **Issue: Filtering shows wrong transactions**
**Cause**: Account ID mismatch  
**Fix**: Check console logs to see which account ID is being used

### **Issue: Performance is slow**
**Cause**: Too many re-renders  
**Fix**: Check `useEffect` dependencies and ensure memoization

### **Issue: Dropdown doesn't open**
**Cause**: z-index issue or state not updating  
**Fix**: Check `Dropdown` component state management

---

## 📞 Support

If you encounter issues:
1. Check console logs for warnings/errors
2. Verify database has account data
3. Check that transactions have valid `source_account_id`
4. Review the filtering logic in `MobileTransactions/index.tsx`

---

**✅ Happy Testing! The account filter should work seamlessly with ID-based matching.**

