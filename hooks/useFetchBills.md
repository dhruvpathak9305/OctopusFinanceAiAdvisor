# useFetchBills Hook

## Overview

The `useFetchBills` hook is a custom React hook designed to manage and interact with upcoming bills in the application. It provides comprehensive functionality for fetching, adding, updating, and deleting bills, as well as organizing them into groups based on their due dates.

## Features

- **Bill Management**:
  - Fetch bills with filtering options
  - Add new bills
  - Update existing bills
  - Delete bills
  - Automatic sorting by due date
  - Group bills by due windows (This Week, Next Week, Later)

- **Filtering Options**:
  - Date Range (week, month, quarter, year, all)
  - Status (pending, paid, overdue, all)
  - Category
  - Search Term
  - Limit number of results

- **Real-time Updates**:
  - Automatic state management
  - Optimistic updates for better UX
  - Cache management

## Usage

```tsx
import { useFetchBills } from '@/hooks/useFetchBills';

const MyComponent = () => {
  const {
    bills,
    groupedBills,
    loading,
    error,
    refreshBills,
    addBill,
    updateBill,
    deleteBill
  } = useFetchBills({
    dateRange: 'month',
    status: 'pending',
    limit: 20
  });

  // Example: Add a new bill
  const handleAddBill = async () => {
    const newBill = {
      name: 'Electricity Bill',
      amount: 100,
      due_date: '2024-04-15',
      frequency: 'monthly',
      autopay_source: 'bank',
      transaction_id: 'transaction_123'
    };
    
    const result = await addBill(newBill);
    if (result) {
      console.log('Bill added successfully');
    }
  };

  // Example: Update a bill
  const handleUpdateBill = async (id: string) => {
    const updates = {
      amount: 150,
      due_date: '2024-04-20'
    };
    
    const result = await updateBill(id, updates);
    if (result) {
      console.log('Bill updated successfully');
    }
  };

  // Example: Delete a bill
  const handleDeleteBill = async (id: string) => {
    const success = await deleteBill(id);
    if (success) {
      console.log('Bill deleted successfully');
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div>
          {/* Display grouped bills */}
          {Object.entries(groupedBills).map(([window, group]) => (
            <div key={window}>
              <h3>{window}</h3>
              <p>Total: ${group.total}</p>
              {group.bills.map(bill => (
                <div key={bill.id}>
                  {bill.name} - ${bill.amount}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## API Reference

### Hook Parameters

```typescript
interface BillFilter {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
  status?: 'pending' | 'paid' | 'overdue' | 'all';
  categoryId?: string;
  searchTerm?: string;
  limit?: number;
}
```

### Return Values

- **bills**: Array of bills sorted by due date
- **groupedBills**: Bills grouped by due windows (This Week, Next Week, Later)
- **loading**: Boolean indicating if data is being fetched
- **error**: Error message if any
- **refreshBills**: Function to manually refresh bills
- **addBill**: Function to add a new bill
- **updateBill**: Function to update an existing bill
- **deleteBill**: Function to delete a bill

### Bill Type

```typescript
interface Bill {
  id: string;
  user_id: string;
  transaction_id: string;
  name: string;
  amount: number;
  due_date: string;
  frequency: string;
  autopay: boolean | null;
  autopay_source: string;
  account_id: string | null;
  credit_card_id: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  status: string;
  description: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  subcategory_name?: string;
}
```

## Error Handling

The hook includes comprehensive error handling:
- All database operations are wrapped in try-catch blocks
- Errors are stored in the error state
- Loading state is managed automatically
- User feedback is provided through error messages

## Best Practices

1. **Filtering**: Use appropriate filters to limit the number of bills fetched
2. **Error Handling**: Always check for errors when performing operations
3. **Refresh**: Use refreshBills when you need to fetch fresh data
4. **Grouping**: Utilize groupedBills for organized display of bills
5. **Types**: Ensure proper typing when adding or updating bills 