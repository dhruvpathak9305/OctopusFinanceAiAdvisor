# Transaction Splitting Documentation

This folder contains all documentation related to the transaction splitting feature, which allows users to split expenses among multiple people or groups.

## Files Overview

### Core Documentation
- **SPLIT_ARCHITECTURE_EXPLAINED.md** - Explains the database architecture and data flow for split transactions
- **SPLIT_DB_ANALYSIS_SUMMARY.md** - Summary of database capabilities and structure for splitting
- **SPLIT_EXECUTION_PLAN.md** - Detailed execution plan for implementing the split feature
- **SPLIT_IMPLEMENTATION_COMPLETE.md** - Summary of completed implementation
- **TRANSACTION_SPLITTING_IMPLEMENTATION_PLAN.md** - Overall implementation plan and roadmap

### Testing & Verification
- **SPLIT_SQL_TESTS.md** - SQL queries for testing and verifying split functionality
- **SPLIT_TESTING_GUIDE.md** - Comprehensive guide for testing the split feature

### UI/UX Enhancements
- **COLLAPSIBLE_SPLIT_UI.md** - Beautiful collapsible split section with animations and gradients
- **WHO_PAID_UI_SIMPLIFICATION.md** - Integrated "Who paid?" selection into participants list

### Database Fixes & Operations
- **PAID_BY_CALCULATION_FIX.md** - Fixed balance calculations to use actual payer instead of transaction creator (Migration #13)
- **SPLIT_CRUD_OPERATIONS.md** - Complete guide to Create, Read, Update, Delete operations and CASCADE behavior
- **GUEST_PAYER_FIX.md** - Phase 1: Fixed foreign key error when guest users are selected as payers
- **GUEST_PAYER_FULL_IMPLEMENTATION.md** - Phase 2: Complete guest payer tracking with phone numbers (Migrations #14, #15) ⭐ NEW

## Related Documentation

- Database migrations: `/database/group-expense-splitting/`
- Service layer: `/services/expenseSplittingService.ts`
- UI components: `/src/mobile/components/ExpenseSplitting/`
- Types: `/types/splitting.ts`

## Quick Links

- [Budget Progress Docs](../budget-progress/)
- [Expense Splitting Docs](../../expense-splitting/)

