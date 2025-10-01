# Public Schema Indexes

This document details all indexes in the `public` schema, organized by functional area.

## Account Management

### accounts_real

- `accounts_real_pkey` - Primary key (id)
- `idx_accounts_real_user_id` - User lookup
- `idx_accounts_real_type` - Account type filtering
- `idx_accounts_real_institution` - Institution-based queries

### balance_real

- `balance_real_pkey` - Primary key (id)
- `balance_real_account_unique` - Unique account constraint
- `idx_balance_real_account_id` - Account lookups
- `idx_balance_real_user_id` - User-based queries
- `idx_balance_real_account_name` - Name-based searches
- `idx_balance_real_account_type` - Type filtering
- `idx_balance_real_currency` - Currency-based queries
- `idx_balance_real_institution_name` - Institution filtering (partial)
- `idx_balance_real_last_updated` - Temporal queries (DESC)

### account_balance_history_real

- `account_balance_history_real_pkey` - Primary key (id)
- `account_balance_history_real_account_id_snapshot_date_key` - Unique constraint

## Budget Management

### budget_categories_real

- `budget_categories_pkey` - Primary key (id)
- `budget_categories_user_id_idx` - User-based queries
- `unique_category_per_type_per_user` - Unique constraint (user_id, name, category_type)
- `idx_budget_categories_real_lookup` - Composite lookup (user_id, category_type, is_active)

### budget_subcategories_real

- `budget_subcategories_real_pkey` - Primary key (id)
- `budget_subcategories_real_category_id_idx` - Category relationships
- `budget_subcategories_real_transaction_category_id_idx` - Transaction linking
- `budget_subcategories_real_icon_idx` - Icon-based queries
- `idx_budget_subcategories_real_lookup` - Active subcategory lookup

### budget_periods_real

- `budget_periods_real_pkey` - Primary key (id)
- `budget_periods_real_user_id_idx` - User-based queries
- `budget_periods_real_period_start_idx` - Period start date queries

## Transaction Processing

### transactions_real

- `transactions_real_pkey` - Primary key (id)
- `transactions_real_is_credit_card_idx` - Credit card filtering
- `idx_transactions_real_user_date_type` - Composite query optimization (user_id, date DESC, type)
- `idx_transactions_real_budget_progress` - Budget progress queries (user_id, category_id, type, date DESC)
- `idx_transactions_real_subcategory_progress` - Subcategory progress (user_id, subcategory_id, type, date DESC)
- `idx_transactions_real_expense_only` - Expense-only queries (partial index)
- `idx_transactions_real_income_only` - Income-only queries (partial index)

### transaction_splits

- `transaction_splits_pkey` - Primary key (id)
- `transaction_splits_unique_user_transaction` - Unique constraint (transaction_id, user_id)
- `idx_transaction_splits_transaction_id` - Transaction relationships
- `idx_transaction_splits_user_id` - User-based queries
- `idx_transaction_splits_group_id` - Group-based queries
- `idx_transaction_splits_relationship_id` - Relationship tracking
- `idx_transaction_splits_due_date` - Due date queries
- `idx_transaction_splits_unpaid` - Unpaid splits (partial index)
- `idx_transaction_splits_group_unpaid` - Group unpaid splits (partial index)
- `idx_transaction_splits_reminder_enabled` - Reminder queries (partial index)

## Net Worth Tracking

### net_worth_entries_real

- `net_worth_entries_real_pkey` - Primary key (id)
- `idx_net_worth_entries_real_user_id` - User-based queries
- `idx_net_worth_entries_real_category_id` - Category relationships
- `idx_net_worth_entries_real_subcategory_id` - Subcategory relationships
- `idx_net_worth_entries_real_date` - Date-based queries (DESC)
- `idx_net_worth_entries_real_active` - Active entries (user_id, is_active, is_included_in_net_worth)
- `idx_net_worth_entries_real_linked_source` - Source linking (linked_source_type, linked_source_id)
- `unique_linked_entry_real` - Unique constraint (user_id, linked_source_type, linked_source_id)

### net_worth_categories_real

- `net_worth_categories_real_pkey` - Primary key (id)
- `net_worth_categories_real_name_key` - Unique name constraint

### net_worth_subcategories_real

- `net_worth_subcategories_real_pkey` - Primary key (id)
- `idx_net_worth_subcategories_real_category_id` - Category relationships
- `net_worth_subcategories_real_category_id_name_key` - Unique constraint (category_id, name)

### net_worth_snapshots_real

- `net_worth_snapshots_real_pkey` - Primary key (id)
- `net_worth_snapshots_real_user_id_snapshot_date_key` - Unique constraint (user_id, snapshot_date)
- `idx_net_worth_snapshots_real_user_date` - User date queries (user_id, snapshot_date DESC)

### net_worth_entry_metadata_real

- `net_worth_entry_metadata_real_pkey` - Primary key (id)
- `idx_net_worth_entry_metadata_real_entry_id` - Entry relationships
- `net_worth_entry_metadata_real_entry_id_key_key` - Unique constraint (entry_id, key)

## Credit Card Management

### credit_cards_real

- `credit_cards_real_pkey` - Primary key (id)

### credit_card_balance_history_real

- `credit_card_balance_history_real_pkey` - Primary key (id)
- `credit_card_balance_history_re_credit_card_id_snapshot_date_key` - Unique constraint

## Group & Relationship Management

### groups

- `groups_pkey` - Primary key (id)
- `idx_groups_created_by` - Creator-based queries
- `idx_groups_active` - Active groups (partial index)

### group_members

- `group_members_pkey` - Primary key (id)
- `group_members_unique_user_group` - Unique constraint (group_id, user_id)
- `idx_group_members_group_id` - Group-based queries
- `idx_group_members_user_id` - User-based queries
- `idx_group_members_active` - Active members (partial index)

### individual_contacts

- `individual_contacts_pkey` - Primary key (id)
- `individual_contacts_unique_user_email` - Unique constraint (user_id, contact_email)
- `idx_individual_contacts_user_id` - User-based queries
- `idx_individual_contacts_email` - Email-based searches
- `idx_individual_contacts_active` - Active contacts (partial index)
- `idx_individual_contacts_relationship_summary` - GIN index for JSONB field

### financial_relationships

- `financial_relationships_pkey` - Primary key (id)
- `financial_relationships_user_related_unique` - Unique constraint (user_id, related_user_id)
- `idx_financial_relationships_user_id` - User-based queries
- `idx_financial_relationships_related_user_id` - Related user queries
- `idx_financial_relationships_active` - Active relationships (partial index)

## Loan Management

### loans

- `loans_pkey` - Primary key (id)
- `idx_loans_borrower_id` - Borrower-based queries
- `idx_loans_lender_id` - Lender-based queries
- `idx_loans_relationship_id` - Relationship tracking
- `idx_loans_status` - Status-based filtering
- `idx_loans_due_date` - Due date queries

### loan_payments

- `loan_payments_pkey` - Primary key (id)
- `idx_loan_payments_loan_id` - Loan relationships
- `idx_loan_payments_created_by` - Creator tracking
- `idx_loan_payments_payment_date` - Payment date queries

## Bill Management

### upcoming_bills_real

- `upcoming_bills_real_pkey` - Primary key (id)
- `upcoming_bills_real_user_id_idx` - User-based queries
- `upcoming_bills_real_transaction_id_idx` - Transaction relationships
- `upcoming_bills_real_due_date_idx` - Due date queries
- `upcoming_bills_real_end_date_idx` - End date queries
- `upcoming_bills_real_status_idx` - Status filtering

## Reminder System

### payment_reminders

- `payment_reminders_pkey` - Primary key (id)
- `idx_payment_reminders_creator_id` - Creator tracking
- `idx_payment_reminders_recipient_id` - Recipient queries
- `idx_payment_reminders_loan_id` - Loan relationships
- `idx_payment_reminders_split_id` - Split relationships
- `idx_payment_reminders_due_date` - Due date queries
- `idx_payment_reminders_reminder_date` - Reminder date queries
- `idx_payment_reminders_status` - Status filtering

## Advanced Budgeting

### envelope_budgets

- `envelope_budgets_pkey` - Primary key (id)
- `envelope_budgets_user_id_idx` - User-based queries
- `envelope_budgets_period_id_idx` - Period relationships
- `envelope_budgets_unique_period_category_name` - Unique constraint

### zero_based_budgets

- `zero_based_budgets_pkey` - Primary key (id)
- `zero_based_budgets_user_id_idx` - User-based queries
- `zero_based_budgets_period_id_idx` - Period relationships
- `zero_based_budgets_unique_period_category` - Unique constraint

### rolling_budget_adjustments

- `rolling_budget_adjustments_pkey` - Primary key (id)
- `rolling_budget_adjustments_user_id_idx` - User-based queries
- `rolling_budget_adjustments_period_id_idx` - Period relationships

## AI & Analytics

### ai_spending_patterns

- `ai_spending_patterns_pkey` - Primary key (id)
- `ai_spending_patterns_user_id_idx` - User-based queries
- `ai_spending_patterns_category_id_idx` - Category relationships

---

_Total Public Schema Indexes: 180+_
_Optimized for high-performance financial data queries_
