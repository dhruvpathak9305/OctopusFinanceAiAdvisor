# Row Level Security (RLS) Policies Summary

This document provides a comprehensive overview of all Row Level Security policies in the Supabase database.

## Overview

- **Total RLS Policies**: 150+ policies across all tables
- **Schema Coverage**: Primarily `public` schema (application data)
- **Security Model**: User-based data isolation with role-based access control
- **Policy Types**: CRUD operations (SELECT, INSERT, UPDATE, DELETE) and ALL operations

## Security Architecture

### Core Principles

1. **User Data Isolation**: Users can only access their own data
2. **Relationship-Based Access**: Access to related data through proper relationships
3. **Role-Based Permissions**: Different access levels for creators, members, and participants
4. **Hierarchical Security**: Parent-child relationship security (categories → subcategories)

### Authentication Integration

- Uses `auth.uid()` for current user identification
- Integrates with Supabase Auth system
- Supports both `public` and `authenticated` roles

## Policy Categories

### Direct User Ownership

Tables where users can only access records they own:

- `accounts`, `accounts_real`
- `balance_real`
- `budget_categories_real`
- `net_worth_entries`, `net_worth_entries_real`
- `upcoming_bills`
- `individual_contacts`

### Relationship-Based Access

Tables with complex relationship-based security:

- `group_members` - Access based on group membership and roles
- `transaction_splits` - Access through transaction ownership or group membership
- `loan_payments` - Access through loan participation
- `financial_relationships` - Bidirectional relationship access

### Hierarchical Security

Tables with parent-child security relationships:

- `budget_subcategories` → `budget_categories_real`
- `budget_category_snapshots` → `budget_periods`
- `net_worth_entry_metadata` → `net_worth_entries`

### Shared Reference Data

Tables accessible by all authenticated users:

- `net_worth_categories`, `net_worth_categories_real`
- `net_worth_subcategories`, `net_worth_subcategories_real`

## Security Patterns

### Standard CRUD Pattern

```sql
-- SELECT: Users can view their own data
(auth.uid() = user_id)

-- INSERT: Users can create data for themselves
WITH CHECK (auth.uid() = user_id)

-- UPDATE: Users can modify their own data
USING (auth.uid() = user_id)

-- DELETE: Users can delete their own data
USING (auth.uid() = user_id)
```

### Group-Based Access Pattern

```sql
-- Access through group membership
(group_id IN (
  SELECT group_id FROM group_members
  WHERE user_id = auth.uid() AND is_active = true
))
```

### Relationship-Based Pattern

```sql
-- Access through related table ownership
EXISTS (
  SELECT 1 FROM parent_table
  WHERE parent_table.id = child_table.parent_id
  AND parent_table.user_id = auth.uid()
)
```

## Table-Specific Security Models

### Account Management

- **Direct Ownership**: Users own their accounts and balances
- **Full CRUD Access**: Complete control over account data
- **Balance Isolation**: Balance records tied to account ownership

### Budget Management

- **Category Ownership**: Users own their budget categories
- **Hierarchical Access**: Subcategories inherit category permissions
- **Snapshot Security**: Budget snapshots secured through period ownership

### Transaction Processing

- **Owner Control**: Transaction creators control splits and modifications
- **Participant Access**: Split participants can view and update their portions
- **Group Visibility**: Group members can view relevant transaction splits

### Net Worth Tracking

- **Entry Ownership**: Users own their net worth entries
- **Metadata Security**: Entry metadata inherits entry permissions
- **Snapshot Privacy**: Net worth snapshots are user-private
- **Shared Categories**: Categories and subcategories are shared reference data

### Group & Relationship Management

- **Creator Privileges**: Group creators have admin-level access
- **Member Rights**: Group members have view and limited update access
- **Role-Based Actions**: Different permissions for admins vs members
- **Relationship Bidirectionality**: Both parties can view financial relationships

### Loan Management

- **Participant Access**: Both lenders and borrowers can view loans
- **Payment Rights**: Loan participants can create and view payments
- **Lender Control**: Lenders can update loan terms

## Advanced Security Features

### Multi-Role Policies

Some tables have multiple policies for different access patterns:

- `group_members`: Separate policies for self-access vs admin access
- `transaction_splits`: Different rules for owners vs participants

### Conditional Access

Policies with complex conditions:

- Group admin detection through role checking
- Active membership verification
- Registration status validation

### Cross-Table Validation

Policies that validate across multiple tables:

- Budget subcategory validation through category ownership
- Transaction split validation through transaction ownership

## Security Benefits

### Data Isolation

- **Complete User Separation**: No cross-user data leakage
- **Automatic Enforcement**: Database-level security, not application-dependent
- **Performance Optimized**: Policies use indexed columns for efficiency

### Relationship Security

- **Proper Access Control**: Complex relationships properly secured
- **Hierarchical Permissions**: Parent-child relationships maintained
- **Group Dynamics**: Flexible group-based access patterns

### Audit & Compliance

- **Transparent Security**: All access rules clearly defined
- **Consistent Enforcement**: Same rules apply regardless of access method
- **Traceable Access**: Clear audit trail of who can access what

## Maintenance & Monitoring

### Policy Management

- Regular review of policy effectiveness
- Performance impact monitoring
- Security testing with different user scenarios

### Best Practices

- Use indexed columns in policy conditions
- Keep policies simple and readable
- Test policies with realistic user scenarios
- Document complex policy logic

---

_Generated from Supabase database security analysis_
_Last updated: $(date)_
