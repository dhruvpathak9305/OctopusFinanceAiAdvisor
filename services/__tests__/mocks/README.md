# Service Layer Test Mocks

This folder contains mock implementations for testing service layer functions.

## Files

### `serviceMocks.js`
Mock implementations for all service layer functions:
- **mockSupabaseClient**: Mock Supabase client with chainable methods
- **mockApiResponse**: Helper for creating API response structures
- **mockAccountService**: Mock account service functions
- **mockCreditCardService**: Mock credit card service functions
- **mockTransactionService**: Mock transaction service functions
- **mockBudgetService**: Mock budget service functions
- **mockAIService**: Mock AI analysis service functions
- **mockDemoData**: Sample demo data for testing

## Usage

```javascript
import { 
  mockAccountService, 
  mockSupabaseClient 
} from './mocks/serviceMocks';

// Mock entire service module
jest.mock('@/services/accountsService', () => mockAccountService);

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient
}));
```

## Purpose

These mocks isolate service layer testing from external dependencies like databases, APIs, and third-party services, ensuring fast and reliable unit tests. 