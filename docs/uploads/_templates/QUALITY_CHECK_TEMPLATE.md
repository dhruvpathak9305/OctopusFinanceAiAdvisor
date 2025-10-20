# ✅ [BANK] [MONTH] [YEAR] - Quality Check

**Pre-Upload Verification Report**

**Date:** [CHECK DATE]  
**Bank:** [BANK NAME]  
**Month:** [MONTH YEAR]  
**Total Transactions:** [NUMBER]

---

## 📊 Transaction Count Verification

### From Statement
- **Total Transactions:** [NUMBER]
- **Date Range:** [START] to [END]
- **Account Number:** [ACCOUNT NUMBER]

### Extracted Transactions
- **Total Extracted:** [NUMBER]
- **Match Statement:** ✅ / ❌

---

## 💰 Balance Verification

### Opening Balance
- **Statement:** ₹[AMOUNT]
- **Calculated:** ₹[AMOUNT]
- **Match:** ✅ / ❌

### Closing Balance
- **Statement:** ₹[AMOUNT]
- **Calculated:** ₹[AMOUNT]
- **Match:** ✅ / ❌

### Balance Progression
| Date | Transaction | Amount | Balance After | Verified |
|------|-------------|--------|---------------|----------|
| [DATE] | [NAME] | ₹[AMOUNT] | ₹[BALANCE] | ✅ |
| [DATE] | [NAME] | ₹[AMOUNT] | ₹[BALANCE] | ✅ |
| ... | ... | ... | ... | ... |

**Result:** ✅ All balances match / ❌ Discrepancy found

---

## 🔍 Data Quality Checks

### 1. Transaction Completeness
- [ ] All transactions from statement extracted
- [ ] No missing transactions
- [ ] All dates within month range
- [ ] All amounts verified

**Status:** ✅ Complete

### 2. Account IDs
- [ ] Source account IDs correct
- [ ] Destination account IDs correct
- [ ] All IDs from ACCOUNT_MAPPING.json
- [ ] Transfer accounts verified

**Status:** ✅ Verified

### 3. Transaction Types
- [ ] Income correctly classified
- [ ] Expenses correctly classified
- [ ] Transfers correctly classified
- [ ] All have proper account assignments

**Status:** ✅ Correct

### 4. Bank References
- [ ] All transactions have references
- [ ] All references are unique
- [ ] UPI/NEFT/IMPS refs captured
- [ ] No duplicate references

**Status:** ✅ Unique

---

## 📋 Transaction Breakdown

### By Type
| Type | Count | Total Amount | Expected |
|------|-------|--------------|----------|
| Income | [#] | ₹[AMOUNT] | ✅ |
| Expense | [#] | ₹[AMOUNT] | ✅ |
| Transfer | [#] | ₹[AMOUNT] | ✅ |

### Income Transactions
| Date | Name | Amount | Account |
|------|------|--------|---------|
| [DATE] | [NAME] | ₹[AMOUNT] | [ACCOUNT] |

**Total Income:** ₹[AMOUNT]

### Expense Transactions
| Date | Name | Amount | Category |
|------|------|--------|----------|
| [DATE] | [NAME] | ₹[AMOUNT] | [CATEGORY] |

**Total Expenses:** ₹[AMOUNT]

### Transfer Transactions
| Date | Name | Amount | To Account |
|------|------|--------|------------|
| [DATE] | [NAME] | ₹[AMOUNT] | [ACCOUNT] |

**Total Transfers Out:** ₹[AMOUNT]

---

## 🎯 Metadata Quality

### All Transactions Include
- [ ] bank_reference
- [ ] original_description
- [ ] upload_source
- [ ] upload_date
- [ ] account_last_four
- [ ] balance_after_transaction
- [ ] bank_name
- [ ] statement_period

**Status:** ✅ Complete

---

## 🔗 Transfer Verification

### Transfer Accounts
| Transfer | Source | Destination | Account ID Verified |
|----------|--------|-------------|---------------------|
| To [BANK] | [ACCOUNT] | [ACCOUNT_ID] | ✅ |

**Result:** ✅ All transfer account IDs verified

---

## 📊 Financial Summary

### Expected Totals
- **Opening Balance:** ₹[AMOUNT]
- **Total Income:** +₹[AMOUNT]
- **Total Expenses:** -₹[AMOUNT]
- **Total Transfers:** -₹[AMOUNT]
- **Expected Closing:** ₹[AMOUNT]

### Calculated
- **Actual Closing:** ₹[AMOUNT]
- **Difference:** ₹[AMOUNT]
- **Match:** ✅ / ❌

---

## ⚠️ Issues Found

### Critical Issues
- None / [List issues]

### Warnings
- None / [List warnings]

### Notes
[Any special notes or observations]

---

## ✅ Final Verification Result

| Check | Status |
|-------|--------|
| Transaction Count | ✅ Pass |
| Balance Progression | ✅ Pass |
| Account IDs | ✅ Pass |
| Transaction Types | ✅ Pass |
| Bank References | ✅ Pass |
| Metadata Quality | ✅ Pass |
| Financial Summary | ✅ Pass |

**Overall:** ✅ PASS - Ready for Upload

---

## 🎯 Confidence Level

**Quality Score:** [XX]% (Target: 98%+)  
**Recommendation:** ✅ Proceed with Upload / ⚠️ Fix Issues First

---

**Verification Date:** [DATE]  
**Verified By:** [NAME/SYSTEM]  
**Status:** ✅ Approved for Upload

