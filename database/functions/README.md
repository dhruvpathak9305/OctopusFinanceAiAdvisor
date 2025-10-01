# Supabase Database Functions Reference

This directory contains all the custom PostgreSQL functions defined in your Supabase database. These functions are organized by category for easy reference and understanding.

## 📁 Directory Structure

```
database/functions/
├── README.md                    # This file - overview and index
├── auth-and-users/             # User authentication and management
├── budget-management/          # Budget tracking and progress functions
├── financial-relationships/    # Group expenses and personal loans
├── net-worth/                 # Net worth calculations and snapshots
├── balance-system/            # Account balance management and sync
├── transaction-processing/    # Transaction handling and validation
├── triggers/                  # Database trigger functions
└── utilities/                 # Helper and utility functions
```

## 🎯 Function Categories

### 🔐 Auth & Users (8 functions)

Functions for user management, group membership, and contact handling.

### 💰 Budget Management (8 functions)

Comprehensive budget tracking, progress monitoring, and financial overview functions.

### 👥 Financial Relationships (6 functions)

Group expense splitting, loan management, and financial relationship tracking.

### 📊 Net Worth (4 functions)

Net worth calculations, snapshots, and asset/liability sync functions.

### 🏦 Balance System (8 functions)

Account balance management, synchronization, and diagnostic functions.

### 💳 Transaction Processing (4 functions)

Transaction validation, bulk processing, and duplicate detection.

### ⚡ Triggers (8 functions)

Database trigger functions for automatic data updates and validation.

### 🛠️ Utilities (2 functions)

Helper functions for common operations and maintenance.

## 📋 Quick Function Index

| Function Name                    | Category               | Purpose                            |
| -------------------------------- | ---------------------- | ---------------------------------- |
| `add_group_member`               | Auth & Users           | Add members to expense groups      |
| `get_budget_progress`            | Budget Management      | Get budget progress for categories |
| `calculate_user_net_worth_real`  | Net Worth              | Calculate total net worth          |
| `recalculate_account_balance`    | Balance System         | Recalculate account balances       |
| `bulk_insert_transactions`       | Transaction Processing | Insert multiple transactions       |
| `create_balance_for_new_account` | Triggers               | Auto-create balance records        |

## 🚀 Usage Examples

### Getting Budget Progress

```sql
SELECT * FROM get_budget_progress(
  p_user_id := 'your-user-id',
  p_transaction_type := 'expense',
  p_period_type := 'monthly'
);
```

### Calculating Net Worth

```sql
SELECT * FROM calculate_user_net_worth_real('your-user-id');
```

### Adding Group Member

```sql
SELECT add_group_member(
  p_group_id := 'group-uuid',
  p_email := 'member@example.com',
  p_name := 'Member Name',
  p_role := 'member'
);
```

## 📚 Documentation Format

Each function file includes:

- **Purpose**: What the function does
- **Parameters**: Input parameters with types and descriptions
- **Returns**: Return type and structure
- **Usage Examples**: SQL examples showing how to call the function
- **Related Functions**: Links to related functions
- **Notes**: Important implementation details

## 🔄 Maintenance

These functions are automatically extracted from your live Supabase database. To update:

1. Run the SQL queries in `supabase-sql-editor-queries.sql`
2. Export the results
3. Update the relevant function files
4. Update this README if new categories are added

## 🔗 Related Documentation

- [Database Schema Analysis](../database-schema-analysis.md)
- [Complete Database Capture Guide](../COMPLETE-DATABASE-CAPTURE-GUIDE.md)
- [Budget Progress Functions](../budget-progress/README.md)
- [Expense Splitting Functions](../expense-splitting/README.md)
