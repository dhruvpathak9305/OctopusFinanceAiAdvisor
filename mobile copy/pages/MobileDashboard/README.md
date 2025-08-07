# Mobile Dashboard Component Structure

This directory contains the modularized version of the MobileDashboard page, broken down into smaller, reusable components for better maintainability and testability.

## Component Architecture

The MobileDashboard has been refactored into the following components:

- **index.tsx**: Main entry point that composes all subcomponents
- **Header.tsx**: Page header with title, subtitle and theme toggle
- **BudgetProgressSection.tsx**: The budget progress visualization with circular charts and subcategory details
- **FinancialSummaryCards.tsx**: Horizontal swipeable cards showing financial data
- **RecentTransactionsSection.tsx**: List of recent transactions
- **UpcomingBillsSection.tsx**: Upcoming bills and payments

## Key Features

1. **Responsive Circular Budgets**: Uses the improved CircularBudgetProgress component with dynamic resizing
2. **Theme Toggle**: Theme toggle integrated in the header
3. **Dynamic Budget Subcategories**: Expandable subcategory panels with smooth transitions

## State Management

Each component manages its own local state, with the main component (index.tsx) providing the necessary data props to each subcomponent.

## Data Flow

```
MobileDashboard (index.tsx)
├─ Financial data
├─ Transaction data
├─ Icons mapping
├─ Theme context
│
├─ Header
│  └─ ThemeToggle
│
├─ FinancialSummaryCards
│  └─ Individual card items
│
├─ BudgetProgressSection
│  ├─ CircularBudgetProgress charts
│  └─ BudgetSubcategories
│
├─ RecentTransactionsSection
└─ UpcomingBillsSection
```

## Testing Recommendations

For testing, consider:

1. Unit tests for each component with mock data
2. Integration tests for key sections like BudgetProgressSection
3. Snapshot tests for UI consistency
4. Interaction tests for expandable components and theme toggle 