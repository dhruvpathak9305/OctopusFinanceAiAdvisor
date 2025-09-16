# Budget Progress SQL Implementation

This directory contains all SQL files needed for implementing the Budget Progress functionality in the OctopusFinanceAiAdvisor application.

## File Structure

The SQL files are organized in a logical order for implementation:

| File | Purpose | Dependencies |
|------|---------|-------------|
| `01-indexes.sql` | Creates database indexes for performance optimization | None |
| `02-main-functions.sql` | Implements core budget progress functions | `01-indexes.sql` |
| `03-summary-functions.sql` | Implements budget summary and detail functions | `01-indexes.sql`, `02-main-functions.sql` |
| `04-testing.sql` | Contains tests to verify implementation | All previous files |

## Installation Order

For proper installation, run the files in numerical order:

```bash
# Connect to your PostgreSQL database
psql -d your_database -f database/budget-progress/01-indexes.sql
psql -d your_database -f database/budget-progress/02-main-functions.sql
psql -d your_database -f database/budget-progress/03-summary-functions.sql
psql -d your_database -f database/budget-progress/04-testing.sql
```

## Available Functions

| Function | Description | Used For |
|----------|-------------|----------|
| `get_budget_progress()` | Main budget data for all categories | Budget Progress cards |
| `get_budget_summary()` | Summary totals by category type | Summary cards |
| `get_category_details()` | Detailed info for a single category | Category detail views |
| `get_subcategory_progress()` | Breakdown of subcategories | Budget Details modal |
| `get_budget_overview()` | Complete financial overview | Dashboard metrics |
| `get_subcategory_transactions()` | Recent transactions for a subcategory | Transaction lists |

## Function Parameters

All functions support these common parameters:

- `p_user_id` - User UUID (required)
- `p_transaction_type` - 'expense', 'income', or 'all' (default: 'expense')
- `p_period_type` - 'monthly', 'quarterly', or 'yearly' (default: 'monthly')

## TypeScript Integration

The TypeScript service for these functions is available at:
`services/budgetProgressService.ts`

## Documentation

For complete documentation on the Budget Progress implementation, see:
`docs/budget-progress/README.md`
