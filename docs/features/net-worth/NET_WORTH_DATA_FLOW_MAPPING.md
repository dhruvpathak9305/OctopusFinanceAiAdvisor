# 📊 Net Worth Form Data Flow - Table Mapping

## 🎯 **COMPLETE DATA FLOW ANALYSIS**

This document shows exactly where each form field goes when you submit the "Add Asset Entry" or "Add Liability Entry" form.

---

## 📋 **Form Fields → Database Tables Mapping**

### **🏦 PRIMARY TABLE: `net_worth_entries_real`**

| **Form Field**    | **Database Column**        | **Data Type** | **Example Value**         | **Required** |
| ----------------- | -------------------------- | ------------- | ------------------------- | ------------ |
| `name`            | `asset_name`               | `VARCHAR`     | "Savings Account"         | ✅ **Yes**   |
| `amount`          | `value`                    | `NUMERIC`     | 50000.00                  | ✅ **Yes**   |
| `category`        | `category_id`              | `UUID`        | "cat_123..."              | ✅ **Yes**   |
| `subcategory`     | `subcategory_id`           | `UUID`        | "sub_456..."              | ✅ **Yes**   |
| `acquisitionDate` | `date`                     | `DATE`        | "2025-01-15"              | ❌ **No**    |
| `currentValue`    | `market_price`             | `NUMERIC`     | 52000.00                  | ❌ **No**    |
| `description`     | `notes`                    | `TEXT`        | "Primary savings account" | ❌ **No**    |
| _Auto-generated_  | `user_id`                  | `UUID`        | Current user ID           | ✅ **Yes**   |
| _Auto-generated_  | `is_active`                | `BOOLEAN`     | true                      | ✅ **Yes**   |
| _Auto-generated_  | `is_included_in_net_worth` | `BOOLEAN`     | true                      | ✅ **Yes**   |
| _Auto-generated_  | `linked_source_type`       | `ENUM`        | "manual"                  | ✅ **Yes**   |
| _Auto-generated_  | `quantity`                 | `NUMERIC`     | 1                         | ❌ **No**    |

### **📝 METADATA TABLE: `net_worth_entry_metadata_real`**

| **Form Field**     | **Metadata Key**    | **Data Type** | **Example Value** | **When Stored** |
| ------------------ | ------------------- | ------------- | ----------------- | --------------- |
| `appreciationRate` | "appreciation_rate" | `NUMERIC`     | 5.5               | If provided     |
| `interestRate`     | "interest_rate"     | `NUMERIC`     | 3.25              | If provided     |
| `monthlyPayment`   | "monthly_payment"   | `NUMERIC`     | 2500.00           | If provided     |
| `maturityDate`     | "maturity_date"     | `DATE`        | "2030-12-31"      | If provided     |
| `institution`      | "institution"       | `VARCHAR`     | "HDFC Bank"       | If provided     |
| `accountNumber`    | "account_number"    | `VARCHAR`     | "\*\*\*\*1234"    | If provided     |

---

## 🔄 **Data Flow Process**

### **Step 1: Form Submission**

```typescript
// User fills form and clicks "Add Asset" or "Add Liability"
const formData = {
  name: "Investment Portfolio",
  amount: "100000",
  category: "cat_investments_123",
  subcategory: "sub_stocks_456",
  currentValue: "105000",
  appreciationRate: "8.5",
  institution: "Zerodha",
  accountNumber: "ZER123456",
  // ... other fields
};
```

### **Step 2: Data Processing**

```typescript
// createNetWorthEntry() processes the data
const mainEntry = {
  asset_name: "Investment Portfolio", // → net_worth_entries_real
  value: 100000, // → net_worth_entries_real
  category_id: "cat_investments_123", // → net_worth_entries_real
  subcategory_id: "sub_stocks_456", // → net_worth_entries_real
  market_price: 105000, // → net_worth_entries_real
  user_id: "user_789", // → net_worth_entries_real
  is_active: true, // → net_worth_entries_real
  // ... other main fields
};

const metadataEntries = [
  { key: "appreciation_rate", value: 8.5 }, // → net_worth_entry_metadata_real
  { key: "institution", value: "Zerodha" }, // → net_worth_entry_metadata_real
  { key: "account_number", value: "ZER123456" }, // → net_worth_entry_metadata_real
];
```

### **Step 3: Database Insertion**

```sql
-- 1. Insert main entry
INSERT INTO net_worth_entries_real (
  asset_name, value, category_id, subcategory_id,
  market_price, user_id, is_active, ...
) VALUES (
  'Investment Portfolio', 100000, 'cat_investments_123',
  'sub_stocks_456', 105000, 'user_789', true, ...
);

-- 2. Insert metadata entries
INSERT INTO net_worth_entry_metadata_real (
  entry_id, key, value
) VALUES
  ('entry_abc123', 'appreciation_rate', 8.5),
  ('entry_abc123', 'institution', 'Zerodha'),
  ('entry_abc123', 'account_number', 'ZER123456');
```

---

## 📊 **Complete Table Structures**

### **🏦 `net_worth_entries_real` Table**

```sql
CREATE TABLE net_worth_entries_real (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  asset_name VARCHAR NOT NULL,           -- Form: name
  category_id UUID NOT NULL,             -- Form: category
  subcategory_id UUID NOT NULL,          -- Form: subcategory
  value NUMERIC NOT NULL,                -- Form: amount
  quantity NUMERIC DEFAULT 1,            -- Auto: 1
  market_price NUMERIC,                  -- Form: currentValue
  date DATE,                             -- Form: acquisitionDate
  notes TEXT,                            -- Form: description
  is_active BOOLEAN DEFAULT true,        -- Auto: true
  is_included_in_net_worth BOOLEAN DEFAULT true,  -- Auto: true
  linked_source_type linked_source_type DEFAULT 'manual',  -- Auto: manual
  linked_source_id UUID,                 -- Auto: null
  last_synced_at TIMESTAMP,             -- Auto: null
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **📝 `net_worth_entry_metadata_real` Table**

```sql
CREATE TABLE net_worth_entry_metadata_real (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES net_worth_entries_real(id),
  key VARCHAR NOT NULL,                  -- Field name
  value JSONB,                          -- Field value
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 **Data Verification Queries**

### **Check Main Entry Data**

```sql
SELECT
  asset_name,
  value,
  market_price,
  date,
  notes,
  category_id,
  subcategory_id,
  user_id,
  is_active,
  created_at
FROM net_worth_entries_real
WHERE user_id = 'your_user_id'
ORDER BY created_at DESC;
```

### **Check Metadata Entries**

```sql
SELECT
  e.asset_name,
  m.key,
  m.value,
  m.created_at
FROM net_worth_entries_real e
JOIN net_worth_entry_metadata_real m ON e.id = m.entry_id
WHERE e.user_id = 'your_user_id'
ORDER BY e.created_at DESC, m.key;
```

### **Complete Entry with Metadata**

```sql
SELECT
  e.asset_name,
  e.value,
  e.market_price,
  e.date,
  e.notes,
  json_object_agg(m.key, m.value) as metadata
FROM net_worth_entries_real e
LEFT JOIN net_worth_entry_metadata_real m ON e.id = m.entry_id
WHERE e.user_id = 'your_user_id'
GROUP BY e.id, e.asset_name, e.value, e.market_price, e.date, e.notes
ORDER BY e.created_at DESC;
```

---

## ✅ **Data Validation Checklist**

### **Before Form Submission**

- [ ] Entry name is provided
- [ ] Amount is valid number
- [ ] Category is selected
- [ ] Subcategory is selected

### **After Form Submission**

- [ ] Check `net_worth_entries_real` for main entry
- [ ] Verify `user_id` matches current user
- [ ] Confirm `asset_name`, `value`, `category_id`, `subcategory_id` are correct
- [ ] Check `net_worth_entry_metadata_real` for additional fields
- [ ] Verify metadata `entry_id` links to main entry

### **Data Integrity Checks**

- [ ] `is_active` = true
- [ ] `is_included_in_net_worth` = true
- [ ] `linked_source_type` = 'manual'
- [ ] `created_at` and `updated_at` timestamps are recent

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Main Entry Not Created**

**Symptoms:** No record in `net_worth_entries_real`
**Causes:**

- Missing required fields (name, amount, category, subcategory)
- User authentication failure
- Database permissions

**Solution:** Check form validation and user session

### **Issue 2: Metadata Not Saved**

**Symptoms:** Main entry exists but no metadata records
**Causes:**

- All metadata fields were empty/null
- Metadata table permissions
- Foreign key constraint issues

**Solution:** Verify metadata fields have values and entry_id is correct

### **Issue 3: Wrong Table Used**

**Symptoms:** Data goes to demo tables instead of real tables
**Causes:** `isDemo` parameter is true

**Solution:** Ensure `isDemo` is false for production data

---

## 📈 **Performance Considerations**

### **Indexing**

```sql
-- Recommended indexes for performance
CREATE INDEX idx_net_worth_entries_user_id ON net_worth_entries_real(user_id);
CREATE INDEX idx_net_worth_entries_category ON net_worth_entries_real(category_id);
CREATE INDEX idx_net_worth_entries_active ON net_worth_entries_real(is_active);
CREATE INDEX idx_net_worth_metadata_entry_id ON net_worth_entry_metadata_real(entry_id);
CREATE INDEX idx_net_worth_metadata_key ON net_worth_entry_metadata_real(key);
```

### **Query Optimization**

- Use `user_id` in WHERE clauses for data isolation
- Filter by `is_active = true` for active entries only
- Use JOINs efficiently when fetching entry + metadata

---

## 🎯 **Summary**

**✅ CONFIRMED: Form data is correctly mapped to database tables**

1. **Core fields** → `net_worth_entries_real` table
2. **Extended fields** → `net_worth_entry_metadata_real` table
3. **User isolation** → `user_id` field ensures data privacy
4. **Data integrity** → Foreign keys and constraints maintain consistency
5. **Flexibility** → Metadata approach allows unlimited field expansion

The implementation correctly handles both Asset and Liability entries using the same table structure, with the `type` determined by the category selection.
