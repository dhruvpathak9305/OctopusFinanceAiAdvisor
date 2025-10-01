# Database Security Documentation

This directory contains comprehensive documentation of all security measures implemented in the Supabase database.

## 🔒 Overview

The database implements a comprehensive Row Level Security (RLS) system with **150+ policies** ensuring complete data isolation and proper access control across all functional areas.

## 📁 Documentation Structure

### [RLS_POLICIES_SUMMARY.md](./RLS_POLICIES_SUMMARY.md)

High-level overview of the security architecture, including:

- Security principles and patterns
- Policy categories and types
- Authentication integration
- Performance and compliance benefits

### [table-specific-policies.md](./table-specific-policies.md)

Detailed documentation of RLS policies for each table, organized by functional area:

- Account Management
- Budget Management
- Transaction Processing
- Net Worth Tracking
- Group & Relationship Management
- Loan Management
- Bill & Reminder Management
- Advanced Budgeting
- AI & Analytics

## 🛡️ Security Architecture

### Core Security Principles

#### 1. User Data Isolation

```sql
-- Standard pattern: Users can only access their own data
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

#### 2. Relationship-Based Access

```sql
-- Access through proper relationships
EXISTS (
  SELECT 1 FROM parent_table
  WHERE parent_table.id = child_table.parent_id
  AND parent_table.user_id = auth.uid()
)
```

#### 3. Role-Based Permissions

```sql
-- Different access levels for different roles
(created_by = auth.uid()) OR  -- Creator access
(user_id = auth.uid()) OR     -- Member access
(role = 'admin')              -- Admin access
```

#### 4. Hierarchical Security

```sql
-- Parent-child relationship security
EXISTS (
  SELECT 1 FROM budget_categories_real
  WHERE budget_categories_real.id = budget_subcategories.category_id
  AND budget_categories_real.user_id = auth.uid()
)
```

## 🔐 Security Models by Table Type

### Direct User Ownership (Most Common)

Tables where users own records directly:

- `accounts`, `accounts_real`
- `balance_real`
- `budget_categories_real`
- `net_worth_entries`, `net_worth_entries_real`
- `individual_contacts`
- `upcoming_bills`

**Pattern**: `auth.uid() = user_id`

### Participant-Based Access

Tables where multiple users can access the same record:

- `loans` (lender + borrower)
- `loan_payments` (through loan participation)
- `payment_reminders` (creator + recipient)
- `transaction_splits` (owner + participants + group members)

**Pattern**: `(user_a_id = auth.uid()) OR (user_b_id = auth.uid())`

### Hierarchical Access

Tables that inherit permissions from parent tables:

- `budget_subcategories` → `budget_categories_real`
- `budget_category_snapshots` → `budget_periods`
- `net_worth_entry_metadata` → `net_worth_entries`

**Pattern**: `EXISTS (SELECT 1 FROM parent WHERE parent.user_id = auth.uid())`

### Group-Based Access

Tables with complex group membership rules:

- `groups` (creator + members)
- `group_members` (self + creator + admin)
- `transaction_splits` (through group membership)

**Pattern**: Complex multi-condition policies

### Shared Reference Data

Tables accessible by all authenticated users:

- `net_worth_categories`, `net_worth_categories_real`
- `net_worth_subcategories`, `net_worth_subcategories_real`

**Pattern**: `USING (true)` for authenticated role

## 🚀 Security Benefits

### Data Protection

- **Complete Isolation**: No cross-user data leakage possible
- **Database-Level Enforcement**: Security enforced at the database level, not application
- **Automatic Application**: All queries automatically filtered by RLS policies

### Performance Optimization

- **Indexed Conditions**: All policy conditions use indexed columns
- **Efficient Filtering**: Policies designed for optimal query performance
- **Minimal Overhead**: Security checks integrated into query execution

### Compliance & Audit

- **Transparent Rules**: All access rules clearly documented and visible
- **Consistent Enforcement**: Same security rules regardless of access method
- **Audit Trail**: Clear understanding of who can access what data

## 🔧 Policy Management

### Development Guidelines

#### 1. Policy Design

```sql
-- Good: Use indexed columns
USING (auth.uid() = user_id)  -- user_id is indexed

-- Avoid: Complex computations in policies
USING (expensive_function(auth.uid()) = some_value)
```

#### 2. Testing Policies

```sql
-- Test with different user contexts
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user-uuid"}';
SELECT * FROM protected_table;
```

#### 3. Policy Naming

- Use descriptive names: `Users can view their own accounts`
- Include operation type: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `ALL`
- Be specific about access pattern: `own`, `related`, `group members`

### Maintenance Best Practices

#### 1. Regular Security Reviews

- Audit policy effectiveness quarterly
- Review access patterns for new features
- Test policies with realistic user scenarios

#### 2. Performance Monitoring

```sql
-- Monitor policy performance impact
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM table_with_rls
WHERE conditions;
```

#### 3. Documentation Updates

- Update documentation when policies change
- Document complex policy logic with examples
- Maintain security model diagrams

## 🛠️ Security Testing

### Policy Validation Queries

#### Test User Isolation

```sql
-- Verify users can only see their own data
SELECT COUNT(*) FROM accounts WHERE user_id != auth.uid();
-- Should return 0 for any authenticated user
```

#### Test Relationship Access

```sql
-- Verify proper relationship-based access
SELECT COUNT(*) FROM transaction_splits ts
WHERE NOT EXISTS (
  SELECT 1 FROM transactions_real t
  WHERE t.id = ts.transaction_id AND t.user_id = auth.uid()
) AND ts.user_id != auth.uid();
-- Should return 0 unless user is in relevant groups
```

#### Test Hierarchical Security

```sql
-- Verify parent-child security
SELECT COUNT(*) FROM budget_subcategories bs
WHERE NOT EXISTS (
  SELECT 1 FROM budget_categories_real bc
  WHERE bc.id = bs.category_id AND bc.user_id = auth.uid()
);
-- Should return 0 for any authenticated user
```

### Security Test Scenarios

#### 1. Cross-User Access Prevention

- User A cannot access User B's accounts
- User A cannot see User B's transactions
- User A cannot modify User B's budget categories

#### 2. Relationship-Based Access

- Group members can view relevant splits
- Loan participants can access loan data
- Contact relationships work bidirectionally

#### 3. Hierarchical Permission Inheritance

- Subcategory access follows category ownership
- Metadata access follows entry ownership
- Snapshot access follows period ownership

## 📊 Security Metrics

### Coverage Statistics

- **Tables with RLS**: 35+ tables
- **Total Policies**: 150+ policies
- **Security Models**: 6 distinct patterns
- **Role Support**: `public`, `authenticated` roles

### Policy Distribution

- **Direct Ownership**: ~60% of policies
- **Relationship-Based**: ~25% of policies
- **Hierarchical**: ~10% of policies
- **Shared Access**: ~5% of policies

## 🔄 Future Security Enhancements

### Potential Improvements

1. **Attribute-Based Access Control (ABAC)**: More granular permissions
2. **Time-Based Policies**: Temporary access grants
3. **Audit Logging**: Comprehensive access logging
4. **Policy Templates**: Standardized policy patterns

### Monitoring & Alerting

1. **Policy Violation Detection**: Alert on unusual access patterns
2. **Performance Impact Monitoring**: Track policy overhead
3. **Security Metrics Dashboard**: Visualize security posture

---

_This security documentation ensures comprehensive protection of user data while maintaining optimal performance and usability._
