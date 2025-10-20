# 🧪 Net Worth Form - Test Data Samples

## 🎯 **Ready-to-Use Test Data for Form Testing**

Use these sample data sets to test your "Add Asset Entry" and "Add Liability Entry" forms.

---

## 💰 **ASSET ENTRY TEST CASES**

### **Test Case 1: Savings Account (Basic)**

```
Entry Name: Primary Savings Account
Description: Main savings account for emergency fund
Amount: 150000
Category: Cash & Cash Equivalents
Subcategory: Savings Bank Account
Acquisition Date: 2024-01-15
Current Value: 152500
Institution: HDFC Bank
Account Number: ****5678
Notes: 3.5% interest rate, monthly compounding
```

### **Test Case 2: Investment Portfolio (Advanced)**

```
Entry Name: Equity Investment Portfolio
Description: Diversified stock portfolio
Amount: 500000
Category: Investments
Subcategory: Stocks & Equity
Acquisition Date: 2023-06-10
Current Value: 625000
Appreciation Rate: 12.5
Institution: Zerodha
Account Number: ZER123456
Notes: Long-term growth focused portfolio
```

### **Test Case 3: Real Estate Property**

```
Entry Name: Residential Apartment - Bangalore
Description: 2BHK apartment in Electronic City
Amount: 8500000
Category: Real Estate
Subcategory: Residential Property
Acquisition Date: 2022-03-20
Current Value: 9200000
Appreciation Rate: 4.2
Institution: HDFC Home Loans
Account Number: HL789012
Notes: 1200 sq ft, ready to move in
```

### **Test Case 4: Fixed Deposit**

```
Entry Name: 5-Year Fixed Deposit
Description: High-interest fixed deposit
Amount: 300000
Category: Fixed Income
Subcategory: Fixed Deposits
Acquisition Date: 2024-10-01
Current Value: 315000
Appreciation Rate: 6.8
Institution: SBI
Account Number: FD456789
Notes: Maturity date: 2029-10-01
```

### **Test Case 5: Gold Investment**

```
Entry Name: Digital Gold Holdings
Description: Gold purchased through digital platform
Amount: 75000
Category: Commodities
Subcategory: Precious Metals
Acquisition Date: 2024-05-15
Current Value: 82000
Appreciation Rate: 8.5
Institution: Paytm Gold
Account Number: PG987654
Notes: 15 grams of 24K gold
```

---

## 💳 **LIABILITY ENTRY TEST CASES**

### **Test Case 6: Home Loan (Basic)**

```
Entry Name: Home Loan - Primary Residence
Description: Housing loan for apartment purchase
Amount: 6500000
Category: Secured Loans
Subcategory: Home Loan
Interest Rate: 8.75
Monthly Payment: 55000
Maturity Date: 2039-03-20
Institution: HDFC Bank
Account Number: HL234567
Notes: 20-year tenure, floating rate
```

### **Test Case 7: Car Loan**

```
Entry Name: Car Loan - Honda City
Description: Auto loan for new car purchase
Amount: 850000
Category: Secured Loans
Subcategory: Vehicle Loan
Interest Rate: 9.25
Monthly Payment: 18500
Maturity Date: 2029-08-15
Institution: ICICI Bank
Account Number: AL345678
Notes: 5-year tenure, fixed rate
```

### **Test Case 8: Credit Card Debt**

```
Entry Name: HDFC Credit Card Outstanding
Description: Credit card revolving balance
Amount: 45000
Category: Unsecured Loans
Subcategory: Credit Card Debt
Interest Rate: 42.0
Monthly Payment: 5000
Institution: HDFC Bank
Account Number: ****1234
Notes: High priority for repayment
```

### **Test Case 9: Personal Loan**

```
Entry Name: Personal Loan - Medical Emergency
Description: Loan taken for medical expenses
Amount: 200000
Category: Unsecured Loans
Subcategory: Personal Loan
Interest Rate: 14.5
Monthly Payment: 12000
Maturity Date: 2026-12-31
Institution: Bajaj Finserv
Account Number: PL567890
Notes: 2-year tenure, EMI auto-debit
```

### **Test Case 10: Education Loan**

```
Entry Name: MBA Education Loan
Description: Loan for MBA program
Amount: 1200000
Category: Secured Loans
Subcategory: Education Loan
Interest Rate: 10.5
Monthly Payment: 15000
Maturity Date: 2032-06-30
Institution: SBI
Account Number: EL678901
Notes: Moratorium period ended, repayment started
```

---

## 🧪 **TESTING SCENARIOS**

### **Scenario A: Quick Asset Test**

1. **Open** "Add Asset Entry" form
2. **Fill** Test Case 1 (Savings Account)
3. **Submit** and verify success message
4. **Check** if data appears in Net Worth dashboard

### **Scenario B: Advanced Asset Test**

1. **Open** "Add Asset Entry" form
2. **Fill** Test Case 2 (Investment Portfolio)
3. **Test** institution picker (should show existing institutions)
4. **Submit** and verify both main entry and metadata

### **Scenario C: Liability Test**

1. **Open** "Add Liability Entry" form
2. **Fill** Test Case 6 (Home Loan)
3. **Verify** liability-specific fields (Interest Rate, Monthly Payment)
4. **Submit** and check liability section updates

### **Scenario D: Institution Picker Test**

1. **Open** any form
2. **Tap** Institution field
3. **Verify** existing institutions appear (from your accounts)
4. **Test** "Add Custom Institution" option
5. **Test** "Clear Selection" option

### **Scenario E: Form Validation Test**

1. **Try** submitting with empty required fields
2. **Verify** validation messages appear
3. **Test** invalid amount formats
4. **Ensure** form doesn't submit with errors

---

## 📊 **VERIFICATION STEPS**

### **After Each Test:**

#### **1. Check Success Message**

- ✅ "Net worth entry created successfully!" alert appears
- ✅ Form closes automatically
- ✅ No error messages

#### **2. Verify Dashboard Updates**

- ✅ New entry appears in appropriate section (Assets/Liabilities)
- ✅ Total values update correctly
- ✅ Net worth calculation reflects new entry

#### **3. Database Verification** (Optional)

```sql
-- Check latest entries
SELECT asset_name, value, market_price, notes, created_at
FROM net_worth_entries_real
WHERE user_id = 'your_user_id'
ORDER BY created_at DESC
LIMIT 5;

-- Check metadata for latest entry
SELECT e.asset_name, m.key, m.value
FROM net_worth_entries_real e
JOIN net_worth_entry_metadata_real m ON e.id = m.entry_id
WHERE e.user_id = 'your_user_id'
ORDER BY e.created_at DESC, m.key;
```

---

## 🎯 **RECOMMENDED TESTING ORDER**

### **Phase 1: Basic Functionality**

1. **Test Case 1** - Simple savings account (Asset)
2. **Test Case 6** - Basic home loan (Liability)

### **Phase 2: Advanced Features**

3. **Test Case 2** - Investment with appreciation rate
4. **Test Case 7** - Car loan with all fields

### **Phase 3: Edge Cases**

5. **Test Case 4** - Fixed deposit with maturity
6. **Test Case 8** - Credit card with high interest

### **Phase 4: Institution Picker**

7. **Test** existing institution selection
8. **Test** custom institution entry
9. **Test** clear selection functionality

---

## 🚨 **EXPECTED RESULTS**

### **✅ Success Indicators:**

- Form submits without errors
- Success alert appears
- Dashboard totals update
- Entry appears in correct category
- Institution picker works smoothly

### **❌ Potential Issues to Watch:**

- Form validation errors
- Database connection issues
- Institution picker not loading
- Metadata not saving
- Calculation errors in totals

---

## 💡 **PRO TESTING TIPS**

### **1. Start Simple**

Begin with Test Case 1 (basic savings account) to verify core functionality.

### **2. Test Institution Picker**

Make sure you have some accounts created first, so the institution picker has data to show.

### **3. Verify Calculations**

After adding entries, check if the net worth calculation (Assets - Liabilities) is correct.

### **4. Test Both Types**

Add both assets and liabilities to see the complete picture.

### **5. Check Persistence**

Close and reopen the app to ensure data persists correctly.

---

## 🎉 **READY TO TEST!**

**Pick any test case above and start testing your form!**

The data is realistic and covers various scenarios you might encounter in real usage. Each test case is designed to verify different aspects of the form functionality.

**Recommended starting point:** Test Case 1 (Savings Account) for a quick success test! 🚀
