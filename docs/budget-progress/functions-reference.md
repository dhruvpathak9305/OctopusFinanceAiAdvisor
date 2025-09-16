# Budget Functions Quick Reference

> **SQL Implementation**: All SQL files are now organized in `database/budget-progress/` with a consistent naming convention (01-indexes.sql, 02-main-functions.sql, etc.)

## 🚀 **One-Line Function Guide**

```typescript
import {
  getBudgetProgress,
  getBudgetSummary,
  getCategoryDetails,
  getSubcategoryProgress,
  getBudgetOverview,
  getSubcategoryTransactions,
} from "../services/budgetProgressService";
```

## 📋 **All Functions with Examples**

```typescript
// 1. Main Dashboard - All categories with progress
const allCategories = await getBudgetProgress(userId, "expense", "monthly");

// 2. Summary Cards - Totals by type (Needs/Wants/Save)
const summary = await getBudgetSummary(userId, "expense", "monthly");

// 3. Category Details - Single category info
const details = await getCategoryDetails(
  userId,
  categoryId,
  "expense",
  "monthly"
);

// 4. Subcategory Breakdown - Within a category
const subcategories = await getSubcategoryProgress(
  userId,
  categoryId,
  "expense",
  "monthly"
);

// 5. Complete Overview - Full financial picture
const overview = await getBudgetOverview(userId, "monthly");

// 6. Recent Transactions - For a subcategory
const transactions = await getSubcategoryTransactions(
  userId,
  subcategoryId,
  "expense",
  "monthly",
  10
);
```

## 🎯 **Common Usage Patterns**

### **Dashboard Budget Progress**

```typescript
const progress = await getBudgetProgress(userId, "expense", "monthly");
// Use: progress.map(cat => show progress ring with cat.percentage_used)
```

### **Budget Details Modal**

```typescript
const [details, subcategories] = await Promise.all([
  getCategoryDetails(userId, categoryId, "expense", "monthly"),
  getSubcategoryProgress(userId, categoryId, "expense", "monthly"),
]);
```

### **Summary Cards**

```typescript
const [expenseSum, incomeSum] = await Promise.all([
  getBudgetSummary(userId, "expense", "monthly"),
  getBudgetSummary(userId, "income", "monthly"),
]);
```

## 📊 **Return Data Examples**

### **getBudgetProgress()** - Array of categories

```typescript
[
  {
    category_id: "uuid",
    category_name: "Housing",
    budget_limit: 2000,
    spent_amount: 1500,
    remaining_amount: 500,
    percentage_used: 75,
    status: "on_budget",
    ring_color: "#10B981",
  },
];
```

### **getBudgetSummary()** - Category type totals

```typescript
[
  {
    category_type: "expense",
    total_budget: 5000,
    total_spent: 3500,
    total_remaining: 1500,
    overall_percentage: 70,
    category_count: 3,
  },
];
```

### **getSubcategoryProgress()** - Subcategory breakdown

```typescript
[
  {
    subcategory_name: "Rent",
    budget_limit: 1500,
    spent_amount: 1500,
    percentage_used: 100,
    color: "#10B981",
    transaction_count: 1,
  },
];
```

## ⚡ **Quick Tips**

- **Period Types**: `"monthly"`, `"quarterly"`, `"yearly"`
- **Transaction Types**: `"expense"`, `"income"`, `"all"`
- **Performance**: All functions are optimized with database indexes
- **Generic**: Works with any category names (not hardcoded)
- **Type Safe**: Full TypeScript support with proper interfaces

## 🎉 **Ready to Use!**

All functions are implemented and optimized. Import and use them in your React Native components for fast, real-time budget progress functionality! 🚀
