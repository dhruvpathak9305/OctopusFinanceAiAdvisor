# Financial Relationship Management UI Components

This document details the UI components needed for the financial relationship management features in Octopus Finance.

## Core Components

### FinancialDashboard

The main dashboard for financial relationships, showing overall balances, recent activity, and quick actions.

**Props:**

- `userId`: ID of the current user
- `colors`: Theme colors object
- `isDark`: Dark mode flag

**Features:**

- Summary of money owed to user vs. money user owes
- Net balance calculation and visualization
- Quick action buttons for common tasks
- Recent activity timeline
- Upcoming payment reminders

**Example:**

```tsx
<FinancialDashboard
  userId="user123"
  colors={theme.colors}
  isDark={theme.dark}
/>
```

### RelationshipList

Component for displaying a list of financial relationships with summary information.

**Props:**

- `relationships`: Array of financial relationships
- `onSelectRelationship`: Callback when a relationship is selected
- `colors`: Theme colors object
- `filter`: Optional filter criteria

**Features:**

- List of relationships with balance information
- Sorting options (amount, name, recent activity)
- Filtering options (all, positive balance, negative balance)
- Search functionality

**Example:**

```tsx
<RelationshipList
  relationships={userRelationships}
  onSelectRelationship={handleRelationshipSelect}
  colors={theme.colors}
  filter="all"
/>
```

### RelationshipDetail

Detailed view of a specific financial relationship, showing transaction history and balance information.

**Props:**

- `relationshipId`: ID of the relationship to display
- `colors`: Theme colors object
- `isDark`: Dark mode flag
- `onCreateLoan`: Callback for creating a new loan
- `onRequestPayment`: Callback for requesting a payment

**Features:**

- Relationship summary and balance
- Transaction history with filtering
- Active loans section
- Split expenses section
- Payment request and recording options

**Example:**

```tsx
<RelationshipDetail
  relationshipId="rel123"
  colors={theme.colors}
  isDark={theme.dark}
  onCreateLoan={handleCreateLoan}
  onRequestPayment={handleRequestPayment}
/>
```

### LoanCreationForm

Form for creating a new loan between users.

**Props:**

- `lenderId`: ID of the lender (current user)
- `preselectedBorrowerId`: Optional ID of the preselected borrower
- `onCreateLoan`: Callback when loan is created
- `onCancel`: Callback when form is cancelled
- `colors`: Theme colors object

**Features:**

- Borrower selection
- Amount input with currency selection
- Interest rate input (optional)
- Start date and due date selection
- Description field
- Reminder configuration

**Example:**

```tsx
<LoanCreationForm
  lenderId="user123"
  preselectedBorrowerId="user456"
  onCreateLoan={handleLoanCreated}
  onCancel={handleCancel}
  colors={theme.colors}
/>
```

### LoanDetail

Detailed view of a specific loan, showing payment history and status.

**Props:**

- `loanId`: ID of the loan to display
- `colors`: Theme colors object
- `isDark`: Dark mode flag
- `onRecordPayment`: Callback for recording a payment
- `onSendReminder`: Callback for sending a payment reminder

**Features:**

- Loan summary information
- Payment schedule visualization
- Payment history list
- Interest calculation
- Status indicators
- Payment recording form
- Reminder configuration

**Example:**

```tsx
<LoanDetail
  loanId="loan123"
  colors={theme.colors}
  isDark={theme.dark}
  onRecordPayment={handleRecordPayment}
  onSendReminder={handleSendReminder}
/>
```

### PaymentRecordingForm

Form for recording a payment against a loan or split expense.

**Props:**

- `targetId`: ID of the loan or split to apply payment to
- `targetType`: Type of target ('loan' or 'split')
- `maxAmount`: Maximum amount that can be paid
- `onRecordPayment`: Callback when payment is recorded
- `onCancel`: Callback when form is cancelled
- `colors`: Theme colors object

**Features:**

- Amount input with validation
- Payment method selection
- Date selection
- Notes field
- Receipt upload option

**Example:**

```tsx
<PaymentRecordingForm
  targetId="loan123"
  targetType="loan"
  maxAmount={500}
  onRecordPayment={handlePaymentRecorded}
  onCancel={handleCancel}
  colors={theme.colors}
/>
```

### ReminderConfigurationForm

Form for configuring payment reminders.

**Props:**

- `targetId`: ID of the loan or split to create reminder for
- `targetType`: Type of target ('loan' or 'split')
- `dueDate`: Due date of the payment
- `amount`: Amount due
- `recipientId`: ID of the recipient
- `onSaveReminder`: Callback when reminder is saved
- `onCancel`: Callback when form is cancelled
- `colors`: Theme colors object

**Features:**

- Reminder date selection
- Reminder frequency options
- Message customization
- Preview functionality

**Example:**

```tsx
<ReminderConfigurationForm
  targetId="loan123"
  targetType="loan"
  dueDate="2023-06-15"
  amount={500}
  recipientId="user456"
  onSaveReminder={handleReminderSaved}
  onCancel={handleCancel}
  colors={theme.colors}
/>
```

### DebtCollectionDashboard

Dashboard for managing and collecting debts owed to the user.

**Props:**

- `userId`: ID of the current user
- `colors`: Theme colors object
- `isDark`: Dark mode flag
- `onSelectDebt`: Callback when a debt is selected

**Features:**

- Summary of total outstanding debts
- Debt aging analysis
- Priority recommendations
- Quick action buttons
- Debt list with filtering options

**Example:**

```tsx
<DebtCollectionDashboard
  userId="user123"
  colors={theme.colors}
  isDark={theme.dark}
  onSelectDebt={handleDebtSelected}
/>
```

## Layout Components

### FinancialTabNavigator

Tab-based navigation for the financial relationship management features.

**Props:**

- `initialTab`: Initial tab to display
- `colors`: Theme colors object
- `isDark`: Dark mode flag

**Features:**

- Dashboard tab
- Relationships tab
- Loans tab
- Debt Collection tab
- Animated tab transitions

**Example:**

```tsx
<FinancialTabNavigator
  initialTab="dashboard"
  colors={theme.colors}
  isDark={theme.dark}
/>
```

### RelationshipCard

Card component for displaying a summary of a financial relationship.

**Props:**

- `relationship`: Relationship object to display
- `colors`: Theme colors object
- `onPress`: Callback when card is pressed
- `compact`: Whether to display in compact mode

**Features:**

- Person name and avatar
- Relationship balance with direction indicator
- Last activity summary
- Quick action buttons

**Example:**

```tsx
<RelationshipCard
  relationship={relationshipData}
  colors={theme.colors}
  onPress={handleCardPress}
  compact={false}
/>
```

### LoanCard

Card component for displaying a summary of a loan.

**Props:**

- `loan`: Loan object to display
- `colors`: Theme colors object
- `onPress`: Callback when card is pressed
- `compact`: Whether to display in compact mode

**Features:**

- Loan amount and status
- Borrower/lender information
- Due date with countdown
- Progress indicator for repayment

**Example:**

```tsx
<LoanCard
  loan={loanData}
  colors={theme.colors}
  onPress={handleLoanPress}
  compact={false}
/>
```

## UI Screens

### Financial Dashboard Screen

```
+------------------------------------------+
|                                          |
|  FINANCIAL SUMMARY                       |
|                                          |
|  You are owed: ₹12,500                   |
|  You owe: ₹4,200                         |
|                                          |
|  Net balance: ₹8,300                     |
|                                          |
+------------------------------------------+
|                                          |
|  QUICK ACTIONS                           |
|                                          |
|  [Create Loan] [Request Payment] [Pay]   |
|                                          |
+------------------------------------------+
|                                          |
|  RECENT ACTIVITY                         |
|                                          |
|  • Dhruv paid you ₹500 - 2d ago         |
|  • You loaned ₹2,000 to Rahul - 5d ago  |
|  • Split ₹1,500 with Priya - 1w ago     |
|                                          |
+------------------------------------------+
|                                          |
|  UPCOMING                                |
|                                          |
|  • Rahul's payment due - 3d remaining    |
|  • Your payment to Amit - Tomorrow       |
|                                          |
+------------------------------------------+
```

### Relationship List Screen

```
+------------------------------------------+
|                                          |
|  FINANCIAL RELATIONSHIPS                 |
|                                          |
|  [All] [They owe me] [I owe them]        |
|                                          |
|  Search: [________________]              |
|                                          |
+------------------------------------------+
|                                          |
|  Rahul                                   |
|  They owe you: ₹2,500                    |
|  Last activity: 2 days ago               |
|  [>]                                     |
|                                          |
+------------------------------------------+
|                                          |
|  Priya                                   |
|  You owe: ₹1,200                         |
|  Last activity: 1 week ago               |
|  [>]                                     |
|                                          |
+------------------------------------------+
|                                          |
|  Amit                                    |
|  They owe you: ₹800                      |
|  Last activity: 2 weeks ago              |
|  [>]                                     |
|                                          |
+------------------------------------------+
|                                          |
|  [+ Add Relationship]                    |
|                                          |
+------------------------------------------+
```

### Relationship Detail Screen

```
+------------------------------------------+
|                                          |
|  RAHUL                                   |
|                                          |
|  Overall: They owe you ₹2,500            |
|                                          |
|  [Request Payment] [Record Payment]      |
|                                          |
+------------------------------------------+
|                                          |
|  ACTIVE LOANS                            |
|                                          |
|  Personal Loan - ₹2,000                  |
|  Created: May 15, 2023                   |
|  Due: June 15, 2023                      |
|  [View Details]                          |
|                                          |
+------------------------------------------+
|                                          |
|  SPLIT EXPENSES                          |
|                                          |
|  Dinner - ₹500 (unpaid)                  |
|  Movie tickets - ₹0 (settled)            |
|                                          |
+------------------------------------------+
|                                          |
|  TRANSACTION HISTORY                     |
|                                          |
|  • Loan payment - ₹500 - May 25          |
|  • Split expense - ₹1,000 - May 20       |
|  • New loan - ₹2,000 - May 15            |
|                                          |
+------------------------------------------+
```

### Loan Creation Screen

```
+------------------------------------------+
|                                          |
|  CREATE NEW LOAN                         |
|                                          |
|  Borrower: [Select Contact ▼]            |
|                                          |
|  Amount: [₹_______]                      |
|                                          |
|  Interest Rate: [___]% (Optional)        |
|                                          |
|  Start Date: [Today]                     |
|                                          |
|  Due Date: [Select Date ▼]               |
|                                          |
|  Description: [___________________]      |
|                                          |
|  Reminder Settings:                      |
|  [x] 3 days before due date              |
|  [x] On due date                         |
|  [ ] Weekly until paid                   |
|                                          |
|  [Cancel]         [Create Loan]          |
|                                          |
+------------------------------------------+
```

### Loan Detail Screen

```
+------------------------------------------+
|                                          |
|  PERSONAL LOAN - ₹2,000                  |
|                                          |
|  Borrower: Rahul                         |
|  Status: Active                          |
|                                          |
|  Start Date: May 15, 2023                |
|  Due Date: June 15, 2023                 |
|  Days Remaining: 15                      |
|                                          |
+------------------------------------------+
|                                          |
|  PAYMENT SUMMARY                         |
|                                          |
|  Principal: ₹2,000                       |
|  Interest: ₹50                           |
|  Total Due: ₹2,050                       |
|                                          |
|  Paid: ₹500                              |
|  Remaining: ₹1,550                       |
|                                          |
|  [Record Payment] [Send Reminder]        |
|                                          |
+------------------------------------------+
|                                          |
|  PAYMENT HISTORY                         |
|                                          |
|  May 25, 2023 - ₹500 - Cash              |
|  Notes: First installment                |
|                                          |
+------------------------------------------+
|                                          |
|  PAYMENT SCHEDULE                        |
|                                          |
|  [Chart showing payment timeline]        |
|                                          |
+------------------------------------------+
```

### Debt Collection Screen

```
+------------------------------------------+
|                                          |
|  DEBT COLLECTION CENTER                  |
|                                          |
|  Total owed to you: ₹12,500              |
|                                          |
|  [All] [Overdue] [Coming Due]            |
|                                          |
+------------------------------------------+
|                                          |
|  PRIORITY COLLECTION                     |
|                                          |
|  Rahul - ₹2,000 - 30 days overdue        |
|  [Send Reminder] [Payment Options]       |
|                                          |
|  Amit - ₹800 - 15 days overdue           |
|  [Send Reminder] [Payment Options]       |
|                                          |
+------------------------------------------+
|                                          |
|  COMING DUE                              |
|                                          |
|  Priya - ₹500 - Due in 3 days            |
|  [Send Reminder]                         |
|                                          |
|  Sanjay - ₹1,200 - Due in 7 days         |
|  [Send Reminder]                         |
|                                          |
+------------------------------------------+
|                                          |
|  AUTOMATED REMINDERS                     |
|                                          |
|  [Configure Reminder Settings]           |
|                                          |
+------------------------------------------+
```

## Integration with Existing UI

### Transaction Form Enhancement

Add loan and debt repayment options to the transaction form.

```
+------------------------------------------+
|                                          |
|  ADD NEW TRANSACTION                     |
|                                          |
|  Type: [Expense ▼]                       |
|        Expense                           |
|        Income                            |
|        Transfer                          |
|        Loan                              |
|        Debt Repayment                    |
|                                          |
+------------------------------------------+
```

### Contact Detail Enhancement

Add financial relationship summary to contact details.

```
+------------------------------------------+
|                                          |
|  CONTACT: RAHUL                          |
|                                          |
|  Email: rahul@example.com                |
|  Phone: +91 98765 43210                  |
|                                          |
+------------------------------------------+
|                                          |
|  FINANCIAL RELATIONSHIP                  |
|                                          |
|  They owe you: ₹2,500                    |
|  Active loans: 1                         |
|  Unpaid splits: 2                        |
|                                          |
|  [View Details]                          |
|                                          |
+------------------------------------------+
```

### Split Expense Enhancement

Add due date and reminder options to split expense flow.

```
+------------------------------------------+
|                                          |
|  SPLIT EXPENSE                           |
|                                          |
|  Total Amount: ₹1,500                    |
|                                          |
|  Participants:                           |
|  • You: ₹750                             |
|  • Rahul: ₹750                           |
|                                          |
+------------------------------------------+
|                                          |
|  PAYMENT SETTINGS                        |
|                                          |
|  Due Date: [Select Date ▼]               |
|                                          |
|  [x] Enable payment reminders            |
|                                          |
|  Reminder Schedule:                      |
|  [x] 3 days before due date              |
|  [x] On due date                         |
|  [ ] Weekly until paid                   |
|                                          |
+------------------------------------------+
```

## Design System Integration

All components will follow the application's design system for consistency:

1. **Colors**: Use the theme colors object for all UI elements
2. **Typography**: Follow the established typography hierarchy
3. **Spacing**: Use consistent spacing throughout components
4. **Iconography**: Use the Ionicons icon set for consistency
5. **Dark Mode**: Support both light and dark modes

## Accessibility Considerations

1. **Screen Readers**: All components will include proper ARIA labels
2. **Color Contrast**: Ensure sufficient contrast for text and UI elements
3. **Touch Targets**: Ensure touch targets are at least 44x44 points
4. **Keyboard Navigation**: Support keyboard navigation for web version
5. **Dynamic Text Sizes**: Support dynamic text sizes for accessibility settings

This comprehensive UI component documentation provides a blueprint for implementing the financial relationship management features in Octopus Finance, ensuring a consistent and user-friendly experience.
