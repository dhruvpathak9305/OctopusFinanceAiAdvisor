# Expense Splitting API Reference

This document provides a reference for the expense splitting service methods.

## ExpenseSplittingService

The `ExpenseSplittingService` class provides methods for managing expense splitting functionality.

### Group Management

#### createGroup

```typescript
static async createGroup(
  name: string,
  description?: string,
  memberEmails: string[] = []
): Promise<Group>
```

Creates a new expense-sharing group.

**Parameters:**

- `name`: The name of the group
- `description`: Optional description of the group
- `memberEmails`: Optional array of member email addresses

**Returns:** The created group object

#### getUserGroups

```typescript
static async getUserGroups(): Promise<Group[]>
```

Gets all groups for the current user.

**Returns:** Array of group objects

#### getGroupMembers

```typescript
static async getGroupMembers(groupId: string): Promise<GroupMember[]>
```

Gets all members of a specific group.

**Parameters:**

- `groupId`: ID of the group

**Returns:** Array of group member objects

#### updateGroup

```typescript
static async updateGroup(
  groupId: string,
  updates: {
    name?: string;
    description?: string;
  }
): Promise<boolean>
```

Updates a group's details.

**Parameters:**

- `groupId`: ID of the group to update
- `updates`: Object containing fields to update

**Returns:** Success status

#### deleteGroup

```typescript
static async deleteGroup(groupId: string): Promise<boolean>
```

Deletes a group.

**Parameters:**

- `groupId`: ID of the group to delete

**Returns:** Success status

### Individual Contacts

#### getExistingIndividuals

```typescript
static async getExistingIndividuals(): Promise<IndividualPerson[]>
```

Gets all individual contacts for the current user.

**Returns:** Array of individual person objects

#### addIndividualContact

```typescript
static async addIndividualContact(
  email: string,
  name?: string
): Promise<IndividualPerson>
```

Adds a new individual contact.

**Parameters:**

- `email`: Email address of the contact
- `name`: Optional name of the contact

**Returns:** The created individual person object

#### updateIndividualContact

```typescript
static async updateIndividualContact(
  contactId: string,
  updates: { name?: string; email?: string }
): Promise<boolean>
```

Updates an individual contact.

**Parameters:**

- `contactId`: ID of the contact to update
- `updates`: Object containing fields to update

**Returns:** Success status

#### deleteIndividualContact

```typescript
static async deleteIndividualContact(contactId: string): Promise<boolean>
```

Marks an individual contact as inactive (soft delete).

**Parameters:**

- `contactId`: ID of the contact to delete

**Returns:** Success status

### Split Calculations

#### calculateEqualSplits

```typescript
static calculateEqualSplits(
  totalAmount: number,
  participants: { user_id: string; user_name: string }[]
): SplitCalculation[]
```

Calculates equal splits for an expense.

**Parameters:**

- `totalAmount`: Total amount to split
- `participants`: Array of participant objects

**Returns:** Array of split calculation objects

#### calculatePercentageSplits

```typescript
static calculatePercentageSplits(
  totalAmount: number,
  participants: { user_id: string; user_name: string; percentage: number }[]
): SplitCalculation[]
```

Calculates percentage-based splits for an expense.

**Parameters:**

- `totalAmount`: Total amount to split
- `participants`: Array of participant objects with percentages

**Returns:** Array of split calculation objects

#### validateSplits

```typescript
static validateSplits(
  totalAmount: number,
  splits: SplitCalculation[]
): SplitValidation
```

Validates that splits add up correctly.

**Parameters:**

- `totalAmount`: Expected total amount
- `splits`: Array of split calculation objects

**Returns:** Validation result object

### Transaction Management

#### createTransactionWithSplits

```typescript
static async createTransactionWithSplits(
  transactionData: any,
  splits: SplitCalculation[],
  groupId?: string
): Promise<string>
```

Creates a transaction with associated splits.

**Parameters:**

- `transactionData`: Base transaction data
- `splits`: Array of split calculation objects
- `groupId`: Optional group ID for group expenses

**Returns:** ID of the created transaction

#### getTransactionSplits

```typescript
static async getTransactionSplits(
  transactionId: string
): Promise<TransactionSplit[]>
```

Gets all splits for a transaction.

**Parameters:**

- `transactionId`: ID of the transaction

**Returns:** Array of transaction split objects

#### settleSplit

```typescript
static async settleSplit(
  splitId: string,
  settlementMethod: string = "other",
  notes?: string
): Promise<boolean>
```

Marks a split as settled.

**Parameters:**

- `splitId`: ID of the split to settle
- `settlementMethod`: Method of settlement
- `notes`: Optional notes about the settlement

**Returns:** Success status

### Group Member Management

#### addGroupMember

```typescript
static async addGroupMember(
  groupId: string,
  userEmail: string,
  userName?: string,
  role: "member" | "admin" = "member"
): Promise<boolean>
```

Adds a member to a group.

**Parameters:**

- `groupId`: ID of the group
- `userEmail`: Email of the user to add
- `userName`: Optional name of the user
- `role`: Role of the user in the group

**Returns:** Success status

#### editGroupMember

```typescript
static async editGroupMember(
  groupId: string,
  memberId: string,
  updates: {
    user_name?: string;
    user_email?: string;
    role?: "member" | "admin";
  }
): Promise<boolean>
```

Edits a group member's details.

**Parameters:**

- `groupId`: ID of the group
- `memberId`: ID of the member to edit
- `updates`: Object containing fields to update

**Returns:** Success status

#### removeGroupMember

```typescript
static async removeGroupMember(
  groupId: string,
  memberId: string
): Promise<boolean>
```

Removes a member from a group.

**Parameters:**

- `groupId`: ID of the group
- `memberId`: ID of the member to remove

**Returns:** Success status
