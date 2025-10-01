# Table-Specific RLS Policies

This document details Row Level Security policies for each table, organized by functional area.

## Account Management

### accounts & accounts_real

**Security Model**: Direct user ownership

```sql
-- All operations restricted to user's own accounts
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**Policies**:

- `Users can view their own accounts` (SELECT)
- `Users can insert their own accounts` (INSERT)
- `Users can update their own accounts` (UPDATE)
- `Users can delete their own accounts` (DELETE)

### balance_real

**Security Model**: Direct user ownership

```sql
-- All operations restricted to user's own balances
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**Policies**:

- `Users can view their own balances` (SELECT)
- `Users can insert their own balances` (INSERT)
- `Users can update their own balances` (UPDATE)
- `Users can delete their own balances` (DELETE)

## Budget Management

### budget_categories_real

**Security Model**: Direct user ownership

```sql
-- Standard user ownership pattern
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**Policies**:

- `Users can view their own budget categories` (SELECT)
- `Users can create their own budget categories` (INSERT)
- `Users can update their own budget categories` (UPDATE)
- `Users can delete their own budget categories` (DELETE)

### budget_subcategories

**Security Model**: Hierarchical through category ownership

```sql
-- Access through parent category ownership
EXISTS (
  SELECT 1 FROM budget_categories_real
  WHERE budget_categories_real.id = budget_subcategories.category_id
  AND budget_categories_real.user_id = auth.uid()
)
```

**Policies**:

- `Users can view their own budget subcategories` (SELECT)
- `Users can create their own budget subcategories` (INSERT)
- `Users can update their own budget subcategories` (UPDATE)
- `Users can delete their own budget subcategories` (DELETE)

### budget_periods

**Security Model**: Direct user ownership

```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**Policies**:

- `Users can view their own budget periods` (SELECT)
- `Users can create their own budget periods` (INSERT)
- `Users can update their own budget periods` (UPDATE)
- `Users can delete their own budget periods` (DELETE)

### budget_category_snapshots

**Security Model**: Hierarchical through period ownership

```sql
-- Access through budget period ownership
EXISTS (
  SELECT 1 FROM budget_periods
  WHERE budget_periods.id = budget_category_snapshots.period_id
  AND budget_periods.user_id = auth.uid()
)
```

**Policies**:

- `Users can view their own budget category snapshots` (SELECT)
- `Users can create budget category snapshots` (INSERT)
- `Users can update budget category snapshots` (UPDATE)
- `Users can delete budget category snapshots` (DELETE)

### budget_subcategory_snapshots

**Security Model**: Complex hierarchical through snapshot → period ownership

```sql
-- Access through budget category snapshot → period chain
EXISTS (
  SELECT 1 FROM budget_category_snapshots
  JOIN budget_periods ON budget_periods.id = budget_category_snapshots.period_id
  WHERE budget_category_snapshots.id = budget_subcategory_snapshots.snapshot_id
  AND budget_periods.user_id = auth.uid()
)
```

**Policies**:

- `Users can view their own budget subcategory snapshots` (SELECT)
- `Users can create budget subcategory snapshots` (INSERT)
- `Users can update budget subcategory snapshots` (UPDATE)
- `Users can delete budget subcategory snapshots` (DELETE)

## Transaction Processing

### transactions

**Security Model**: Category/subcategory validation

```sql
-- Prevent access to transactions with other users' categories
NOT EXISTS (
  SELECT 1 FROM budget_categories_real
  WHERE budget_categories_real.id = transactions.category_id
  AND budget_categories_real.user_id <> auth.uid()
)
```

**Policies**:

- `Users can only access transactions with their own categories` (ALL)
- `Users can only access transactions with their own subcategories` (ALL)

### transaction_splits

**Security Model**: Multi-faceted access (owner, participant, group member)

```sql
-- Complex access pattern
(user_id = auth.uid()) OR  -- Split participant
(transaction_id IN (       -- Transaction owner
  SELECT id FROM transactions_real WHERE user_id = auth.uid()
)) OR
(group_id IN (             -- Group member
  SELECT group_id FROM group_members WHERE user_id = auth.uid()
))
```

**Policies**:

- `Users can view relevant transaction splits` (SELECT)
- `Transaction owners can create splits` (INSERT)
- `Users can update their splits` (UPDATE)
- `Transaction owners can delete splits` (DELETE)

## Net Worth Tracking

### net_worth_entries & net_worth_entries_real

**Security Model**: Direct user ownership (authenticated role)

```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**Policies**:

- `Users can view their own net worth entries` (SELECT)
- `Users can insert their own net worth entries` (INSERT)
- `Users can update their own net worth entries` (UPDATE)
- `Users can delete their own net worth entries` (DELETE)

### net_worth_categories & net_worth_categories_real

**Security Model**: Shared reference data

```sql
-- Open to all authenticated users
USING (true)
```

**Policies**:

- `Categories are viewable by all authenticated users` (SELECT)
- `Categories real are viewable by all authenticated users` (SELECT)

### net_worth_subcategories & net_worth_subcategories_real

**Security Model**: Shared reference data

```sql
-- Open to all authenticated users
USING (true)
```

**Policies**:

- `Subcategories are viewable by all authenticated users` (SELECT)
- `Subcategories real are viewable by all authenticated users` (SELECT)

### net_worth_snapshots & net_worth_snapshots_real

**Security Model**: Direct user ownership (authenticated role)

```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**Policies**:

- `Users can view their own snapshots` (SELECT)
- `Users can insert their own snapshots` (INSERT)

### net_worth_entry_metadata & net_worth_entry_metadata_real

**Security Model**: Hierarchical through entry ownership

```sql
-- Access through net worth entry ownership
EXISTS (
  SELECT 1 FROM net_worth_entries
  WHERE net_worth_entries.id = net_worth_entry_metadata.entry_id
  AND net_worth_entries.user_id = auth.uid()
)
```

**Policies**:

- `Users can view metadata for their entries` (SELECT)
- `Users can manage metadata for their entries` (ALL)

### net_worth_history

**Security Model**: Direct user ownership (public role)

```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**Policies**:

- `Users can view their own net worth history` (SELECT)
- `Users can insert their own net worth history` (INSERT)
- `Users can update their own net worth history` (UPDATE)
- `Users can delete their own net worth history` (DELETE)

## Group & Relationship Management

### groups

**Security Model**: Creator ownership with member visibility

```sql
-- Creators can manage, members can view
(created_by = auth.uid()) OR  -- Creator access
EXISTS (                      -- Member access
  SELECT 1 FROM group_members
  WHERE group_id = groups.id AND user_id = auth.uid() AND is_active = true
)
```

**Policies**:

- `Users can create groups` (INSERT)
- `Users can view their own groups` (SELECT)
- `Users can view groups they are members of` (SELECT)
- `Group creators can update groups` (UPDATE)
- `Group creators can delete groups` (DELETE)

### group_members

**Security Model**: Complex multi-role access

```sql
-- Multiple access patterns for different operations
-- Self-access, creator access, admin access, member visibility
```

**Policies**:

- `Users can be added to groups` (INSERT) - Open insertion
- `Group creators can add members` (INSERT)
- `Users can view group memberships` (SELECT) - Multiple patterns
- `Users can update group memberships` (UPDATE)
- `Users can leave groups` (DELETE)
- `Group admins can remove members` (DELETE)

### individual_contacts

**Security Model**: Direct user ownership

```sql
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid())
```

**Policies**:

- `Users can view their own contacts` (SELECT)
- `Users can create their own contacts` (INSERT)
- `Users can update their own contacts` (UPDATE)
- `Users can delete their own contacts` (DELETE)

### financial_relationships

**Security Model**: Direct user ownership

```sql
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid())
```

**Policies**:

- `Users can view their own financial relationships` (SELECT)
- `Users can create their own financial relationships` (INSERT)
- `Users can update their own financial relationships` (UPDATE)

## Loan Management

### loans

**Security Model**: Participant-based access (lender/borrower)

```sql
-- Both lenders and borrowers can access
(lender_id = auth.uid()) OR (borrower_id = auth.uid())
```

**Policies**:

- `Users can view loans they are part of` (SELECT)
- `Users can create loans as lender` (INSERT)
- `Lenders can update their loans` (UPDATE)

### loan_payments

**Security Model**: Loan participant access

```sql
-- Access through loan participation
loan_id IN (
  SELECT id FROM loans
  WHERE lender_id = auth.uid() OR borrower_id = auth.uid()
)
```

**Policies**:

- `Users can view payments for loans they are part of` (SELECT)
- `Users can create payments for loans they are part of` (INSERT)

## Bill & Reminder Management

### upcoming_bills

**Security Model**: Direct user ownership

```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

**Policies**:

- `Users can view their own upcoming bills` (SELECT)
- `Users can insert their own upcoming bills` (INSERT)
- `Users can update their own upcoming bills` (UPDATE)
- `Users can delete their own upcoming bills` (DELETE)

### payment_reminders

**Security Model**: Creator/recipient access

```sql
-- Both creators and recipients can access
(creator_id = auth.uid()) OR (recipient_id = auth.uid())
```

**Policies**:

- `Users can view reminders they created or received` (SELECT)
- `Users can create reminders` (INSERT)
- `Users can update reminders they created` (UPDATE)

## Advanced Budgeting

### envelope_budgets

**Security Model**: Direct user ownership (ALL operations)

```sql
USING (auth.uid() = user_id)
```

**Policies**:

- `Users can manage their own envelope budgets` (ALL)

### zero_based_budgets

**Security Model**: Direct user ownership (ALL operations)

```sql
USING (auth.uid() = user_id)
```

**Policies**:

- `Users can manage their own zero-based budgets` (ALL)

### rolling_budget_adjustments

**Security Model**: Direct user ownership (ALL operations)

```sql
USING (auth.uid() = user_id)
```

**Policies**:

- `Users can manage their own rolling budget adjustments` (ALL)

## AI & Analytics

### ai_spending_patterns

**Security Model**: Direct user ownership (ALL operations)

```sql
USING (auth.uid() = user_id)
```

**Policies**:

- `Users can manage their own AI spending patterns` (ALL)

---

_Total RLS Policies: 150+_
_Comprehensive security coverage across all functional areas_
