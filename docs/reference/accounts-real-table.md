# 📊 `accounts_real` TABLE EXPLANATION

---

## 🎯 **What is `accounts_real` Table?**

The `accounts_real` table is your **MASTER ACCOUNT REGISTRY**. It stores high-level information about all your bank accounts.

### **Think of it as:**
- A **directory** of all your bank accounts
- A **profile card** for each account
- A **summary** of account details and current status

---

## 📋 **What Information Does It Store?**

### **Core Information**
| Field | Description | Example |
|-------|-------------|---------|
| `name` | Account nickname | "HDFC", "ICICI", "Axis" |
| `type` | Account type | "Savings", "Current", "Credit" |
| `institution` | Bank name | "HDFC Bank Ltd." |
| `account_number` | Full account number | "50100223596697" |
| `current_balance` | Latest balance | ₹50,780.37 |
| `account_status` | Status | "active", "inactive", "dormant" |

### **Additional Details**
- Bank branch information (IFSC, MICR, branch name, address)
- Account holder details
- Relationship manager contact info
- Nomination status
- Account category (regular, premium, wealth, salary)
- Account opening date
- Last sync timestamp

---

## 🔄 **Do We Need to Update `accounts_real` for HDFC?**

**YES! ✅ We should update it after uploading transactions.**

### **Current HDFC Account Status:**
```
Name:             HDFC
Type:             Savings
Institution:      HDFC Bank Ltd.
Account Number:   50100223596697
Current Balance:  ₹0.00 ❌ OUTDATED
Account Status:   active
Last Sync:        2025-05-18 (5 months ago)
```

### **What Needs Updating:**

#### **1. Current Balance** (Most Important)
```sql
-- After September upload:
current_balance = ₹9,116.44

-- After October upload (when complete):
current_balance = ₹50,780.37
```

#### **2. Last Sync Date**
```sql
last_sync = '2025-10-20' -- Today
```

#### **3. Additional Information (Optional)**
- Branch details from statement
- Account holder name: "DHRUV PATHAK"
- Branch: "RAJABHAT GOPALPUR"
- City: "KOLKATA 700102"
- State: "WEST BENGAL"

---

## 🔗 **How `accounts_real` Links to `transactions_real`**

```
accounts_real
    ↓ (account_id)
transactions_real
    ↓ (source_account_id)
Each Transaction
```

**Example:**
- HDFC account ID: `c5b2eb82-1159-4710-8d5d-de16ee0e6233`
- All HDFC transactions reference this ID in `source_account_id`
- This links transactions to the HDFC account

---

## 📊 **Relationship Between Tables**

```
┌─────────────────┐
│ accounts_real   │  ← Master account info
│ (Account Level) │
└────────┬────────┘
         │ account_id
         ↓
┌─────────────────┐
│transactions_real│  ← Individual transactions
│(Transaction Lvl)│
└─────────────────┘
```

**What gets updated when:**

### **When Uploading Transactions:**
1. ✅ `transactions_real` - NEW transactions inserted
2. ❌ `accounts_real` - NOT automatically updated

### **After Upload (Manual Update):**
1. ✅ Update `current_balance` in `accounts_real`
2. ✅ Update `last_sync` timestamp
3. ✅ Update `updated_at` timestamp

---

## 🛠️ **SQL to Update HDFC Account**

### **After September Upload:**
```sql
UPDATE accounts_real
SET 
    current_balance = 9116.44,
    last_sync = '2025-09-30',
    updated_at = NOW()
WHERE id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233';
```

### **After October Upload (when complete):**
```sql
UPDATE accounts_real
SET 
    current_balance = 50780.37, -- Will be final Oct balance
    last_sync = '2025-10-31',
    updated_at = NOW()
WHERE id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233';
```

---

## 📊 **All Your Accounts (from ACCOUNT_MAPPING.json)**

| Account | ID | Type | Current Balance |
|---------|-------|------|-----------------|
| **ICICI** | fd551095-... | Savings | ₹5,326,611.48 |
| **HDFC** | c5b2eb82-... | Savings | ₹0.00 ❌ (needs update) |
| **Axis** | 0de24177-... | Savings | ₹0.00 |
| **IDFC** | 328c756a-... | Savings | ₹0.00 |
| **Kotak** | db0683f0-... | Savings | ₹0.00 |
| **Kotak Joint** | f288c939-... | Savings | ₹0.00 |
| **Jupiter** | 67f0dcb5-... | Savings | ₹0.00 |

---

## 🎯 **Best Practice Workflow**

### **Step 1: Upload Transactions**
```bash
# Upload transactions to transactions_real
psql "..." -f scripts/uploads/upload-transactions-hdfc-september-2025.sql
```

### **Step 2: Update Account Balance**
```sql
-- Get the latest transaction balance
SELECT metadata->>'balance_after_transaction' as latest_balance
FROM transactions_real
WHERE source_account_id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233'
ORDER BY date DESC, created_at DESC
LIMIT 1;

-- Update accounts_real with this balance
UPDATE accounts_real
SET 
    current_balance = 9116.44, -- Use the latest_balance from above
    last_sync = NOW(),
    updated_at = NOW()
WHERE id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233';
```

### **Step 3: Verify Update**
```sql
SELECT name, current_balance, last_sync, updated_at
FROM accounts_real
WHERE id = 'c5b2eb82-1159-4710-8d5d-de16ee0e6233';
```

---

## ⚠️ **Important Notes**

1. **`current_balance` is a snapshot**, not calculated in real-time
2. **Manually update** after each statement upload
3. **Keep in sync** with the latest transaction's balance
4. **Used for:**
   - Dashboard summaries
   - Account selection dropdowns
   - Quick balance checks
   - Net worth calculations

---

## 🔄 **Automatic Updates (via Triggers)**

The database has triggers that may update `accounts_real` automatically:
- `trigger_sync_balance_on_account_update` - Syncs balance changes
- `trigger_create_balance_for_account` - Creates balance record for new accounts

However, **you should still manually update** `current_balance` after transaction uploads to ensure accuracy.

---

**Created:** 2025-10-20  
**For:** HDFC September 2025 Upload  
**Status:** Needs Update ⚠️

