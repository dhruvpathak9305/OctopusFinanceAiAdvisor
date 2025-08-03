# useUpcomingBills Hook

## Overview

The `useUpcomingBills` hook is a custom React hook designed to manage the state and operations related to upcoming bills in the application. It provides functionalities to fetch, add, update, delete, and mark bills as paid, while also handling caching and error management.

## Key Features

- **Fetch Upcoming Bills**: Retrieves upcoming bills from the database with support for filtering by status, due date range, and limit.
- **Add Bill**: Allows adding a new upcoming bill to the database.
- **Update Bill**: Supports updating existing bill details.
- **Delete Bill**: Provides functionality to delete a bill from the database.
- **Mark Bill as Paid**: Marks a bill as paid and removes it from the upcoming list.
- **Cache Management**: Implements caching to optimize data fetching and reduce unnecessary database queries.
- **Error Handling**: Includes error handling with toast notifications for user feedback.

## Usage

To use the `useUpcomingBills` hook, import it into your component and call it with the desired filter options:

```tsx
import { useUpcomingBills } from '@/hooks/useUpcomingBills';

const MyComponent = () => {
  const {
    upcomingBills,
    loading,
    error,
    refreshBills,
    addUpcomingBill,
    updateUpcomingBill,
    deleteUpcomingBill,
    markBillAsPaid,
    updateBillAutopay
  } = useUpcomingBills({
    status: 'upcoming',
    dueWithin: 'month',
    includeOverdue: true,
    limit: 10
  });

  // Component logic here
};
```

## API

- **upcomingBills**: An array of upcoming bills.
- **loading**: A boolean indicating if the data is currently being fetched.
- **error**: A string containing any error message encountered during operations.
- **refreshBills**: A function to manually refresh the list of upcoming bills.
- **addUpcomingBill**: A function to add a new bill.
- **updateUpcomingBill**: A function to update an existing bill.
- **deleteUpcomingBill**: A function to delete a bill.
- **markBillAsPaid**: A function to mark a bill as paid.
- **updateBillAutopay**: A function to update the autopay settings for a bill.

## Customization

The hook can be customized by adjusting the filter options passed to it, allowing for flexible retrieval of bills based on different criteria.

## Error Handling

Errors encountered during operations are handled gracefully, with toast notifications providing feedback to the user. The hook also implements a debounce mechanism to prevent excessive error notifications.

## Conclusion

The `useUpcomingBills` hook is a comprehensive solution for managing upcoming bills within the application, offering a range of functionalities to handle various bill-related operations efficiently. 