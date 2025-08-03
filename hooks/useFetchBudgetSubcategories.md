# useFetchBudgetSubcategories Hook

## Overview

The `useFetchBudgetSubcategories` hook is a custom React hook designed to fetch and manage budget subcategories. It retrieves active budget categories, calculates budget summaries, and transforms data for component use, supporting different time periods like monthly, quarterly, and yearly.

## Features

- **Fetch Budget Subcategories**: Retrieves active budget categories from the database.
- **Calculate Budget Summary**: Computes budget summaries based on the selected time period.
- **Data Transformation**: Transforms and organizes data for component use.
- **Time Period Support**: Supports monthly, quarterly, and yearly views.

## Detailed Features

- **Fetch Budget Subcategories**: The hook connects to the database to retrieve active budget categories for the authenticated user. It ensures that only categories marked as active are fetched, providing a streamlined view of the user's current budget setup.

- **Calculate Budget Summary**: Utilizes the `calculateBudgetSummary` utility to compute summaries for each category based on the selected time period. This allows users to view their budget performance over different intervals, such as monthly, quarterly, or yearly.

- **Data Transformation**: Transforms raw data from the database into a format suitable for UI components. This includes calculating percentages and adjusting budget limits based on the selected time period.

- **Time Period Support**: Offers flexibility in viewing budget data by supporting multiple time periods. This feature is particularly useful for users who want to analyze their spending habits over different durations.

## Expanded Usage Example

```tsx
import { useFetchBudgetSubcategories } from '@/hooks/useFetchBudgetSubcategories';

const BudgetComponent = () => {
  const { budgetData, loading, error } = useFetchBudgetSubcategories('quarterly');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {budgetData.map(category => (
        <div key={category.name}>
          <h3>{category.name}</h3>
          <p>Amount: ${category.amount}</p>
          <p>Limit: ${category.limit}</p>
          <p>Percentage: {category.percentage}%</p>
          <div>
            {category.subcategories.map(sub => (
              <div key={sub.name}>
                <span>{sub.name}: ${sub.amount}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

## Best Practices

- **Use Appropriate Time Periods**: Choose the time period that best fits your analysis needs. For example, use 'monthly' for short-term tracking and 'yearly' for long-term trends.
- **Error Handling**: Always check for errors and provide user feedback to improve the user experience.

## Common Pitfalls

- **Authentication**: Ensure the user is authenticated before attempting to fetch data, as the hook relies on user-specific information.
- **Data Overload**: Be mindful of the amount of data being fetched, especially for long time periods, to avoid performance issues.

## Usage

To use the `useFetchBudgetSubcategories` hook, import it into your component and call it with the desired view option:

```tsx
import { useFetchBudgetSubcategories } from '@/hooks/useFetchBudgetSubcategories';

const MyComponent = () => {
  const { budgetData, loading, error } = useFetchBudgetSubcategories('monthly');

  // Component logic here
};
```

## API

- **budgetData**: An array of budget categories with their subcategories.
- **loading**: A boolean indicating if the data is currently being fetched.
- **error**: A string containing any error message encountered during operations.

## Error Handling

Errors encountered during operations are handled gracefully, with error messages providing feedback to the user. 