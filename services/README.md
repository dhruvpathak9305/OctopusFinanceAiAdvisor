# Services

## Purpose

The `services/` folder contains modules that handle data fetching, mutation, and communication with external APIs or databases. Services encapsulate business logic and data operations, keeping them separate from UI concerns.

## When to Use Services

Use services when:

- Interacting with external APIs or databases
- Performing data transformations and validations
- Implementing business logic that's independent of UI state
- Managing authentication, authorization, or other system-level concerns
- Handling complex data operations that shouldn't be in UI components

Services should **not** contain:
- UI-specific logic (use contexts or components)
- State management unrelated to data operations (use contexts)
- Rendering logic (use components)

## Folder Structure

```
services/
├── __tests__/                    - Unit tests for all services
│   ├── mocks/                   - Mock implementations for testing
│   ├── accountsService.test.ts  - Tests for account operations
│   ├── autopayService.test.ts   - Tests for autopay functionality
│   ├── budgetSubcategoryService.test.ts - Tests for subcategory CRUD
│   ├── transactionsService.test.ts - Tests for transaction operations
│   ├── supabaseClient.test.ts   - Tests for client initialization
│   └── ... other test files
├── accountsService.ts           - Handles account data operations
├── creditCardService.ts         - Handles credit card data operations
├── autopayService.ts           - Manages automatic payment functionality
├── budgetService.ts            - Manages budget data and operations
├── budgetCategoryService.ts    - Handles budget category CRUD operations
├── budgetSubcategoryService.ts - Handles budget subcategory CRUD operations
├── transactionsService.ts     - Core transaction management service
├── upcomingBillsService.ts     - Manages recurring bills and payments
├── advancedBudgetingService.ts - Advanced budgeting features and analytics
├── supabaseClient.ts          - Supabase client configuration
└── README.md                  - This file
```

## Service Descriptions

### Core Financial Services

**accountsService.ts**
- Manages user bank accounts and financial account operations
- Handles account CRUD operations, balance history, and analytics
- Supports multiple account types (checking, savings, investment, etc.)
- Includes user authentication and ownership validation

**transactionsService.ts**
- Core transaction management with advanced filtering capabilities
- Supports all transaction types (income, expenses, transfers, loans, debts)
- Provides transaction summaries, analytics, and historical data
- Handles recurring transactions and period-over-period comparisons

**creditCardService.ts**
- Manages credit card accounts and related operations
- Tracks credit limits, balances, and due dates
- Integrates with transaction system for credit card purchases

### Budget Management Services

**budgetService.ts**
- Main budget management and category operations
- Handles budget allocation, tracking, and reporting
- Provides budget vs actual spending analysis

**budgetCategoryService.ts**
- CRUD operations for budget categories
- Manages category hierarchy and relationships
- Handles category-specific budget limits and colors

**budgetSubcategoryService.ts**
- CRUD operations for budget subcategories
- Manages subcategory details (name, amount, color, icon)
- Maintains parent-child relationships with categories

### Automation Services

**autopayService.ts**
- Handles automatic payment processing for recurring bills
- Processes bills due today with autopay enabled
- Manages bill status updates and next payment scheduling
- Supports both bank account and credit card autopay sources

**upcomingBillsService.ts**
- Manages recurring bills and payment schedules
- Handles bill creation, updates, and deletion
- Tracks bill status and payment history

### Advanced Features

**advancedBudgetingService.ts**
- Advanced budgeting features and analytics
- Provides sophisticated budget analysis and forecasting
- Handles complex budget scenarios and reporting

### Infrastructure

**supabaseClient.ts**
- Centralized Supabase client configuration
- Manages database connection and authentication
- Single source of truth for all database operations

## Testing

All services are thoroughly tested with Jest. The test suite includes:

- **Unit Tests**: Individual function testing with mocked dependencies
- **Integration Tests**: Service interaction testing
- **Mock Data**: Comprehensive mock implementations for testing
- **Error Handling**: Tests for various error scenarios
- **Authentication**: User authentication and authorization testing

### Running Tests

```bash
# Run all service tests
npm run test:services

# Run specific service tests
npm test accountsService.test.ts
npm test transactionsService.test.ts

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage

- ✅ accountsService.ts - Full CRUD operations, history, authentication
- ✅ autopayService.ts - Bill processing, status updates, date calculations
- ✅ budgetSubcategoryService.ts - CRUD operations, validation
- ✅ transactionsService.ts - Advanced filtering, summaries, transformations
- ✅ supabaseClient.ts - Client initialization and configuration
- ✅ creditCardService.ts - Credit card operations
- ✅ budgetService.ts - Budget management
- ✅ budgetCategoryService.ts - Category operations
- ✅ upcomingBillsService.ts - Bill management
- ✅ advancedBudgetingService.ts - Advanced features

## Usage Examples

### Creating a Service

```ts
// services/userService.ts
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Data mapping functions
const mapDbUserToModel = (dbUser) => ({
  id: dbUser.id,
  email: dbUser.email,
  firstName: dbUser.first_name,
  lastName: dbUser.last_name
});

// Fetch user data
export const fetchUser = async (userId: string): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return mapDbUserToModel(data);
  } catch (error) {
    toast.error('Failed to fetch user data');
    throw error;
  }
};

// Update user data
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    // Map from application model to database model
    const dbUpdates = {};
    if ('firstName' in updates) dbUpdates.first_name = updates.firstName;
    if ('lastName' in updates) dbUpdates.last_name = updates.lastName;
    if ('email' in updates) dbUpdates.email = updates.email;
    
    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success('User updated successfully');
    return mapDbUserToModel(data);
  } catch (error) {
    toast.error('Failed to update user');
    throw error;
  }
};
```

### Using Services in Contexts or Components

```tsx
// In a context
import { fetchUser, updateUser } from '@/services/userService';

// In a context provider
const fetchUserData = async (userId) => {
  try {
    setLoading(true);
    const userData = await fetchUser(userId);
    setUser(userData);
    setLoading(false);
  } catch (error) {
    setError(error.message);
    setLoading(false);
  }
};

// Or directly in a component (for simpler cases)
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUser(userId);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    
    loadUser();
  }, [userId]);
  
  // Render user profile...
};
```

## Best Practices

1. **Error Handling**: Always include proper error handling and user feedback
2. **Authentication**: Validate user authentication for protected operations
3. **Data Mapping**: Use mapping functions to transform between database and application models
4. **Testing**: Write comprehensive unit tests for all service functions
5. **Documentation**: Document service functions with clear descriptions and examples
6. **Type Safety**: Use TypeScript interfaces for all data structures
7. **Demo Mode**: Support demo/production environments where applicable 