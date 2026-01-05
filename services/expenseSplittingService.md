# Expense Splitting Service

The `ExpenseSplittingService` provides functionality for splitting expenses among groups and individuals in the Octopus Organizer app.

## Features

- **Group Management**: Create, update, and manage expense-sharing groups
- **Individual Contacts**: Manage contacts for one-off expense splitting
- **Split Calculations**: Calculate equal, percentage, or custom splits
- **Split Validation**: Validate that splits add up to the total amount

## Key Methods

### Group Management

- `createGroup`: Create a new expense-sharing group
- `getUserGroups`: Get all groups for the current user
- `getGroupMembers`: Get members of a specific group
- `updateGroup`: Update group details
- `deleteGroup`: Delete a group

### Individual Contacts

- `getExistingIndividuals`: Get all individual contacts for the current user
- `addIndividualContact`: Add a new individual contact
- `updateIndividualContact`: Update an existing contact
- `deleteIndividualContact`: Mark a contact as inactive (soft delete)

### Split Calculations

- `calculateEqualSplits`: Split an amount equally among participants
- `calculatePercentageSplits`: Split an amount based on percentages
- `validateSplits`: Verify that splits add up correctly

### Transaction Management

- `createTransactionWithSplits`: Create a transaction with associated splits
- `getTransactionSplits`: Get all splits for a transaction
- `settleSplit`: Mark a split as settled

## Implementation Details

- Uses Supabase for data storage and authentication
- Implements Row Level Security (RLS) for data protection
- Supports both group and individual expense splitting
- Provides validation to ensure splits are accurate

## Error Handling

All methods include comprehensive error handling to:

- Validate user authentication
- Handle database errors gracefully
- Provide meaningful error messages
- Ensure data integrity
