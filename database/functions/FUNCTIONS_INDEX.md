# 📚 Complete Supabase Functions Index

This is a comprehensive index of all 48 custom PostgreSQL functions in your Supabase database, organized by category with descriptions and usage information.

## 📊 Function Statistics

- **Total Functions**: 50
- **Total Database Triggers**: 24
- **Categories**: 8
- **Trigger Functions**: 10
- **Business Logic Functions**: 40

---

## 🔐 Auth & Users (4 functions)

| Function                        | Purpose                           | Parameters                                     | Returns |
| ------------------------------- | --------------------------------- | ---------------------------------------------- | ------- |
| `add_group_member`              | Add member to expense group       | `p_group_id`, `p_email`, `p_name?`, `p_role?`  | `UUID`  |
| `create_group_with_members`     | Create group with initial members | `p_name`, `p_description?`, `p_member_emails?` | `UUID`  |
| `add_or_get_individual_contact` | Add/get individual contact        | `p_contact_email`, `p_contact_name?`           | `UUID`  |
| `create_test_contacts`          | Create test contacts              | None                                           | `VOID`  |

---

## 💰 Budget Management (8 functions)

| Function                       | Purpose                            | Parameters                                                                           | Returns |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------ | ------- |
| `get_budget_progress`          | Get budget progress for categories | `p_user_id`, `p_transaction_type?`, `p_period_type?`                                 | `TABLE` |
| `get_budget_summary`           | Get budget summary by type         | `p_user_id`, `p_transaction_type?`, `p_period_type?`                                 | `TABLE` |
| `get_budget_overview`          | Complete financial overview        | `p_user_id`, `p_period_type?`                                                        | `TABLE` |
| `get_budget_progress_filtered` | Filtered budget progress           | `p_user_id`, `p_category_ids`, `p_transaction_type`, `p_period_type?`                | `TABLE` |
| `get_category_details`         | Detailed category information      | `p_user_id`, `p_category_id`, `p_transaction_type?`, `p_period_type?`                | `TABLE` |
| `get_subcategory_progress`     | Subcategory budget progress        | `p_user_id`, `p_category_id`, `p_transaction_type?`, `p_period_type?`                | `TABLE` |
| `get_subcategory_summary`      | Subcategory summary stats          | `p_user_id`, `p_category_id`, `p_transaction_type?`, `p_period_type?`                | `TABLE` |
| `get_subcategory_transactions` | Recent subcategory transactions    | `p_user_id`, `p_subcategory_id`, `p_transaction_type?`, `p_period_type?`, `p_limit?` | `TABLE` |

---

## 👥 Financial Relationships (6 functions)

| Function                                | Purpose                           | Parameters                                       | Returns   |
| --------------------------------------- | --------------------------------- | ------------------------------------------------ | --------- |
| `create_or_get_financial_relationship`  | Create/get financial relationship | `p_related_user_id`, `p_relationship_type`       | `UUID`    |
| `update_financial_relationship_balance` | Update relationship balance       | `p_relationship_id`                              | `NUMERIC` |
| `get_group_balances`                    | Get group expense balances        | `p_group_id`                                     | `TABLE`   |
| `get_user_unsettled_splits`             | Get user's unsettled splits       | `p_user_id`                                      | `TABLE`   |
| `create_transaction_with_splits`        | Create transaction with splits    | `p_transaction_data`, `p_splits`                 | `UUID`    |
| `settle_transaction_split`              | Settle a transaction split        | `p_split_id`, `p_settlement_method?`, `p_notes?` | `BOOLEAN` |

---

## 📊 Net Worth (4 functions)

| Function                              | Purpose                                     | Parameters  | Returns |
| ------------------------------------- | ------------------------------------------- | ----------- | ------- |
| `calculate_user_net_worth`            | Calculate net worth (demo)                  | `user_uuid` | `TABLE` |
| `calculate_user_net_worth_real`       | Calculate net worth (production)            | `user_uuid` | `TABLE` |
| `create_net_worth_snapshot`           | Create net worth snapshot (demo)            | `user_uuid` | `UUID`  |
| `create_net_worth_snapshot_real`      | Create net worth snapshot (production)      | `user_uuid` | `UUID`  |
| `sync_accounts_to_net_worth`          | Sync accounts to net worth (demo)           | None        | `VOID`  |
| `sync_accounts_to_net_worth_real`     | Sync accounts to net worth (production)     | None        | `VOID`  |
| `sync_credit_cards_to_net_worth`      | Sync credit cards to net worth (demo)       | None        | `VOID`  |
| `sync_credit_cards_to_net_worth_real` | Sync credit cards to net worth (production) | None        | `VOID`  |

---

## 🏦 Balance System (8 functions)

| Function                      | Purpose                            | Parameters     | Returns   |
| ----------------------------- | ---------------------------------- | -------------- | --------- |
| `recalculate_account_balance` | Recalculate single account balance | `account_uuid` | `NUMERIC` |
| `recalculate_all_balances`    | Recalculate all account balances   | None           | `TABLE`   |
| `fix_missing_balance_records` | Create missing balance records     | None           | `INTEGER` |
| `sync_all_account_details`    | Sync account details to balance    | None           | `INTEGER` |
| `fix_all_balance_issues`      | Fix all balance system issues      | None           | `TABLE`   |
| `run_balance_diagnostics`     | Run balance system diagnostics     | None           | `TABLE`   |

---

## 💳 Transaction Processing (4 functions)

| Function                        | Purpose                       | Parameters                       | Returns |
| ------------------------------- | ----------------------------- | -------------------------------- | ------- |
| `bulk_insert_transactions`      | Insert multiple transactions  | `transactions_data`              | `TABLE` |
| `validate_bulk_transactions`    | Validate transaction data     | `transactions_data`              | `TABLE` |
| `detect_duplicate_transactions` | Detect duplicate transactions | `user_uuid`, `transactions_data` | `TABLE` |

---

## 💰 Loan Management (2 functions)

| Function                  | Purpose                         | Parameters                         | Returns   |
| ------------------------- | ------------------------------- | ---------------------------------- | --------- |
| `calculate_loan_interest` | Calculate accrued loan interest | `p_loan_id`, `p_calculation_date?` | `NUMERIC` |

---

## ⚡ Trigger Functions (8 functions, 24 triggers)

| Function                               | Purpose                                | Tables Affected          | Triggers Count |
| -------------------------------------- | -------------------------------------- | ------------------------ | -------------- |
| `create_balance_for_new_account`       | Auto-create balance for new accounts   | `accounts_real`          | 1              |
| `sync_balance_on_account_update`       | Sync balance when account updated      | `accounts_real`          | 1              |
| `update_balance_from_transaction`      | Update balance from transactions       | `transactions_real`      | 3              |
| `validate_account_ids`                 | Validate account IDs in transactions   | `transactions_real`      | 2              |
| `update_relationship_on_split`         | Update relationship on split changes   | `transaction_splits`     | 3              |
| `update_relationship_on_loan`          | Update relationship on loan changes    | `loans`                  | 3              |
| `update_relationship_on_payment`       | Update relationship on payment changes | `loan_payments`          | 3              |
| `update_updated_at_column`             | Auto-update updated_at timestamp       | 6 net worth tables       | 6              |
| `update_subcategory_budget_limits`     | Update subcategory budget limits       | `budget_categories_real` | 1              |
| `update_budget_categories_from_period` | Update categories from period          | `budget_periods`         | 1              |

---

## 🛠️ Utility Functions (2 functions)

| Function                           | Purpose                          | Parameters     | Returns   |
| ---------------------------------- | -------------------------------- | -------------- | --------- |
| `update_updated_at_column`         | Auto-update updated_at timestamp | None (trigger) | `TRIGGER` |
| `update_subcategory_budget_limits` | Update subcategory budget limits | None (trigger) | `TRIGGER` |

---

## 🚀 Quick Usage Guide

### Most Common Functions

```sql
-- Get budget progress for current month
SELECT * FROM get_budget_progress('user-id', 'expense', 'monthly');

-- Calculate current net worth
SELECT * FROM calculate_user_net_worth_real('user-id');

-- Fix all balance issues
SELECT * FROM fix_all_balance_issues();

-- Add member to group
SELECT add_group_member('group-id', 'email@example.com', 'Name', 'member');

-- Bulk insert transactions
SELECT * FROM bulk_insert_transactions('[{...transaction data...}]'::jsonb);
```

### System Maintenance

```sql
-- Run diagnostics
SELECT * FROM run_balance_diagnostics();

-- Recalculate all balances
SELECT * FROM recalculate_all_balances();

-- Sync net worth data
SELECT sync_accounts_to_net_worth_real();
SELECT sync_credit_cards_to_net_worth_real();
```

---

## 📁 File Organization

```
database/functions/
├── auth-and-users/
│   └── group-management.sql          # 4 functions
├── budget-management/
│   └── budget-progress.sql           # 8 functions
├── financial-relationships/
│   ├── group-expenses.sql            # 3 functions
│   └── loan-management.sql           # 3 functions
├── net-worth/
│   ├── calculations.sql              # 4 functions
│   └── sync-functions.sql            # 4 functions
├── balance-system/
│   ├── balance-management.sql        # 6 functions
│   └── diagnostics.sql               # 2 functions
├── transaction-processing/
│   └── bulk-operations.sql           # 4 functions
└── triggers/
    ├── TRIGGERS_INDEX.md             # Complete trigger reference
    ├── account-triggers.sql          # 2 functions, 2 triggers
    ├── transaction-triggers.sql      # 2 functions, 5 triggers
    ├── relationship-triggers.sql     # 3 functions, 9 triggers
    └── utility-triggers.sql          # 3 functions, 8 triggers
```

---

## 🔄 Maintenance Notes

- **Demo vs Production**: Many functions have both demo and `_real` versions
- **Performance**: Budget functions are optimized with indexes for 10-100x performance improvement
- **Error Handling**: Bulk operations include comprehensive error handling and rollback
- **Triggers**: Automatic data synchronization through database triggers
- **Diagnostics**: Built-in health checks and issue resolution functions

This comprehensive function library provides complete financial management capabilities for your Octopus Finance AI Advisor application! 🎯
