# Expense Splitting Types

This file defines TypeScript interfaces and types used for expense splitting functionality in the Octopus Finance app.

## Core Types

### Group Management

- `Group`: Represents an expense-sharing group
- `GroupMember`: Represents a member of a group with associated role and permissions
- `GroupRole`: Type for member roles ("member" | "admin")

### Individual Contacts

- `IndividualPerson`: Represents a person for individual expense splitting

### Transaction Splitting

- `TransactionSplit`: Records how a transaction is split among participants
- `SplitCalculation`: Calculation of an individual's share of an expense
- `SplitType`: Type for split methods ("equal" | "percentage" | "custom" | "amount")
- `SplitValidation`: Validation result for a set of splits
- `SplitFormData`: Form data for creating splits
- `SplitParticipant`: A participant in a split with their share information

### Settlements

- `Settlement`: Record of one person settling a debt with another
- `GroupSettlement`: Collection of settlements within a group
- `SettlementMethod`: Type for payment methods ("cash" | "upi" | "bank_transfer" | "other")

## Constants

The file includes constants for better type safety:

- `SPLIT_TYPES`: Enum-like object for split types
- `SETTLEMENT_METHODS`: Enum-like object for settlement methods
- `GROUP_ROLES`: Enum-like object for group roles

## Usage

These types are used throughout the expense splitting feature to ensure type safety and provide clear interfaces between components.

Example:

```typescript
// Creating a split calculation
const split: SplitCalculation = {
  user_id: "user123",
  user_name: "John Doe",
  share_amount: 25.5,
  share_percentage: 50,
  is_paid: false,
};
```
