# 🔥 Database Triggers Complete Index

This document provides a comprehensive overview of all **24 database triggers** active in your Supabase database, organized by category and function.

---

## 📊 Trigger Statistics

- **Total Triggers**: 24
- **Trigger Functions**: 8
- **Tables with Triggers**: 10
- **Categories**: 4

---

## 🏦 Account Management Triggers (2 triggers)

### **trigger_create_balance_for_account**

- **Table**: `accounts_real`
- **Event**: `AFTER INSERT`
- **Function**: `create_balance_for_new_account()`
- **Purpose**: Auto-create balance record when new account is added

### **trigger_sync_balance_on_account_update**

- **Table**: `accounts_real`
- **Event**: `AFTER UPDATE`
- **Function**: `sync_balance_on_account_update()`
- **Purpose**: Sync balance record when account details change

---

## 💳 Transaction Management Triggers (5 triggers)

### **check_account_ids** (2 triggers)

- **Table**: `transactions_real`
- **Events**: `BEFORE INSERT`, `BEFORE UPDATE`
- **Function**: `validate_account_ids()`
- **Purpose**: Validate account IDs exist before transaction operations

### **trigger_update_balance_from_transaction** (3 triggers)

- **Table**: `transactions_real`
- **Events**: `AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE`
- **Function**: `update_balance_from_transaction()`
- **Purpose**: Automatically update account balances when transactions change

---

## 👥 Financial Relationship Triggers (9 triggers)

### **trigger_update_relationship_on_split** (3 triggers)

- **Table**: `transaction_splits`
- **Events**: `AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE`
- **Function**: `update_relationship_on_split()`
- **Purpose**: Update relationship balances when expense splits change

### **trigger_update_relationship_on_loan** (3 triggers)

- **Table**: `loans`
- **Events**: `AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE`
- **Function**: `update_relationship_on_loan()`
- **Purpose**: Update relationship balances when loans change

### **trigger_update_relationship_on_payment** (3 triggers)

- **Table**: `loan_payments`
- **Events**: `AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE`
- **Function**: `update_relationship_on_payment()`
- **Purpose**: Update relationship balances when loan payments change

---

## 🛠️ Utility Triggers (8 triggers)

### **Updated At Triggers** (6 triggers)

- **Tables**: `net_worth_categories`, `net_worth_categories_real`, `net_worth_entries`, `net_worth_entries_real`, `net_worth_subcategories`, `net_worth_subcategories_real`
- **Event**: `BEFORE UPDATE`
- **Function**: `update_updated_at_column()`
- **Purpose**: Automatically set `updated_at = NOW()` on record updates

### **Budget Management Triggers** (2 triggers)

#### **update_subcategory_budgets**

- **Table**: `budget_categories_real`
- **Event**: `AFTER UPDATE`
- **Function**: `update_subcategory_budget_limits()`
- **Purpose**: Update subcategory limits when parent category changes

#### **update_budget_categories_from_period_trigger**

- **Table**: `budget_periods`
- **Event**: `AFTER UPDATE`
- **Function**: `update_budget_categories_from_period()`
- **Purpose**: Update category limits when budget period changes

---

## 📋 Complete Trigger List

| #     | Trigger Name                                     | Table                          | Event                  | Timing   | Function                                 |
| ----- | ------------------------------------------------ | ------------------------------ | ---------------------- | -------- | ---------------------------------------- |
| 1     | `trigger_create_balance_for_account`             | `accounts_real`                | `INSERT`               | `AFTER`  | `create_balance_for_new_account()`       |
| 2     | `trigger_sync_balance_on_account_update`         | `accounts_real`                | `UPDATE`               | `AFTER`  | `sync_balance_on_account_update()`       |
| 3     | `update_subcategory_budgets`                     | `budget_categories_real`       | `UPDATE`               | `AFTER`  | `update_subcategory_budget_limits()`     |
| 4     | `update_budget_categories_from_period_trigger`   | `budget_periods`               | `UPDATE`               | `AFTER`  | `update_budget_categories_from_period()` |
| 5-7   | `trigger_update_relationship_on_payment`         | `loan_payments`                | `INSERT/UPDATE/DELETE` | `AFTER`  | `update_relationship_on_payment()`       |
| 8-10  | `trigger_update_relationship_on_loan`            | `loans`                        | `INSERT/UPDATE/DELETE` | `AFTER`  | `update_relationship_on_loan()`          |
| 11    | `update_net_worth_categories_updated_at`         | `net_worth_categories`         | `UPDATE`               | `BEFORE` | `update_updated_at_column()`             |
| 12    | `update_net_worth_categories_real_updated_at`    | `net_worth_categories_real`    | `UPDATE`               | `BEFORE` | `update_updated_at_column()`             |
| 13    | `update_net_worth_entries_updated_at`            | `net_worth_entries`            | `UPDATE`               | `BEFORE` | `update_updated_at_column()`             |
| 14    | `update_net_worth_entries_real_updated_at`       | `net_worth_entries_real`       | `UPDATE`               | `BEFORE` | `update_updated_at_column()`             |
| 15    | `update_net_worth_subcategories_updated_at`      | `net_worth_subcategories`      | `UPDATE`               | `BEFORE` | `update_updated_at_column()`             |
| 16    | `update_net_worth_subcategories_real_updated_at` | `net_worth_subcategories_real` | `UPDATE`               | `BEFORE` | `update_updated_at_column()`             |
| 17-19 | `trigger_update_relationship_on_split`           | `transaction_splits`           | `INSERT/UPDATE/DELETE` | `AFTER`  | `update_relationship_on_split()`         |
| 20-21 | `check_account_ids`                              | `transactions_real`            | `INSERT/UPDATE`        | `BEFORE` | `validate_account_ids()`                 |
| 22-24 | `trigger_update_balance_from_transaction`        | `transactions_real`            | `INSERT/UPDATE/DELETE` | `AFTER`  | `update_balance_from_transaction()`      |

---

## 🎯 Key Benefits

### **🔄 Automatic Data Consistency**

- Account balances stay synchronized with transactions
- Financial relationships update automatically
- Timestamps are maintained without manual intervention

### **✅ Data Validation**

- Account IDs are validated before transaction creation
- Prevents orphaned references and data integrity issues

### **⚡ Performance Optimization**

- Real-time updates eliminate need for batch processing
- Immediate consistency for financial calculations

### **🛡️ Error Prevention**

- Automatic validation prevents invalid data entry
- Consistent behavior across all data operations

---

## 🔍 Monitoring Triggers

### **Check All Active Triggers**

```sql
SELECT
  trigger_name,
  event_manipulation as event,
  event_object_table as table_name,
  action_timing as timing,
  action_statement as function_call
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### **Check Specific Trigger**

```sql
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_create_balance_for_account';
```

### **Disable/Enable Triggers** (Use with caution!)

```sql
-- Disable specific trigger
ALTER TABLE accounts_real DISABLE TRIGGER trigger_create_balance_for_account;

-- Enable specific trigger
ALTER TABLE accounts_real ENABLE TRIGGER trigger_create_balance_for_account;

-- Disable all triggers on table (for bulk operations)
ALTER TABLE transactions_real DISABLE TRIGGER ALL;

-- Re-enable all triggers
ALTER TABLE transactions_real ENABLE TRIGGER ALL;
```

---

## 🚨 Important Notes

### **Trigger Dependencies**

- Balance triggers depend on `balance_real` table structure
- Relationship triggers depend on `update_financial_relationship_balance()` function
- Utility triggers are independent and can be safely modified

### **Performance Considerations**

- Triggers execute for every row operation
- Bulk operations may be slower due to trigger overhead
- Consider disabling triggers for large data imports (then re-enable)

### **Maintenance**

- Test trigger behavior after schema changes
- Monitor trigger performance with large datasets
- Keep trigger functions simple and fast

---

## 📁 File Organization

```
database/functions/triggers/
├── TRIGGERS_INDEX.md              # This file - complete trigger reference
├── account-triggers.sql           # Account & balance management (2 triggers)
├── transaction-triggers.sql       # Transaction validation & balance updates (5 triggers)
├── relationship-triggers.sql      # Financial relationship updates (9 triggers)
└── utility-triggers.sql          # Utility & maintenance triggers (8 triggers)
```

Your trigger system provides **complete automation** for data consistency and validation across your entire financial management system! 🎯
