# Database Indexes Summary

This document provides a comprehensive overview of all indexes in the Supabase database, organized by schema and table.

## Overview

- **Total Indexes**: 245 indexes across all tables
- **Schemas**: `public` (majority) and `auth` (Supabase authentication)
- **Index Types**: Unique indexes, B-tree indexes, GIN indexes, Hash indexes

## Schema Breakdown

### Public Schema Indexes

The public schema contains the majority of application-specific indexes for:

- Financial data (accounts, transactions, net worth)
- Budget management
- User relationships and group management
- Balance tracking and history

### Auth Schema Indexes

The auth schema contains Supabase authentication-related indexes for:

- User management
- Session handling
- Multi-factor authentication
- OAuth and SSO providers

## Performance Optimizations

### Budget Progress System

- **6 specialized indexes** for budget tracking queries
- Optimized for monthly/quarterly/yearly period calculations
- Covers user_id, category_id, type, and date combinations

### Transaction Processing

- **Multiple composite indexes** for efficient transaction queries
- Separate indexes for income vs expense filtering
- Date-based indexes for time-range queries

### Balance System

- **8 indexes** on `balance_real` table for comprehensive balance tracking
- Includes account lookups, currency filtering, and temporal queries

### Net Worth Tracking

- **Comprehensive indexing** across all net worth tables
- Optimized for active entries and category-based calculations
- Efficient linking between entries and source accounts

## Index Categories

### Primary Keys (Unique Indexes)

Every table has a primary key index for unique identification.

### Foreign Key Indexes

Most foreign key relationships are indexed for efficient joins.

### Composite Indexes

Multi-column indexes for complex query patterns:

- `(user_id, category_id, type, date)` for budget queries
- `(user_id, is_active, is_included_in_net_worth)` for net worth calculations

### Partial Indexes

Conditional indexes for specific scenarios:

- Active records only: `WHERE (is_active = true)`
- Non-empty fields: `WHERE (field IS NOT NULL)`

### Specialized Indexes

- **GIN indexes** for JSONB fields (relationship_summary)
- **Hash indexes** for exact match lookups (token_hash)
- **Text pattern indexes** for email searches

## Performance Benefits

1. **Query Speed**: 10-100x improvement for budget progress functions
2. **Efficient Filtering**: Optimized indexes for common filter patterns
3. **Join Performance**: Foreign key indexes enable fast table joins
4. **Unique Constraints**: Prevent duplicate data while maintaining performance

## Maintenance Notes

- Indexes are automatically maintained by PostgreSQL
- Regular VACUUM and ANALYZE operations keep statistics current
- Monitor index usage with `pg_stat_user_indexes` view
- Consider dropping unused indexes to reduce storage overhead

---

_Generated from Supabase database schema analysis_
_Last updated: $(date)_
