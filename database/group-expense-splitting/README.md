# Group Expense Splitting

This module provides functionality for splitting expenses among groups and individuals, similar to apps like Splitwise.

## Table Structure

### Groups and Members

- **groups**: Stores information about expense-sharing groups
- **group_members**: Tracks membership in groups, including roles and permissions

### Individual Contacts

- **individual_contacts**: Stores contacts for individual expense splitting
  - Used when splitting expenses with people who aren't in a formal group

### Transaction Splitting

- **transaction_splits**: Records how transactions are split among participants
  - Supports equal, percentage, and custom splits
  - Tracks payment status and settlement methods

## SQL Functions

- **add_or_get_individual_contact**: Creates or retrieves an individual contact
- **create_test_contacts**: Creates a test contact for development purposes
- **create_transaction_with_splits**: Creates a transaction with associated splits

## Row Level Security (RLS)

All tables have RLS policies to ensure users can only:

- See their own groups and contacts
- Modify groups they created
- See transactions they're involved in

## Usage Flow

1. Users can create groups or add individual contacts
2. When adding a transaction, users can choose to split it
3. The expense can be split equally, by percentage, or with custom amounts
4. Each participant's share is tracked until settled

## Implementation Notes

- The database schema supports both group and individual expense splitting
- Soft deletion is used (is_active flag) to preserve transaction history
- Indexes are optimized for common query patterns
