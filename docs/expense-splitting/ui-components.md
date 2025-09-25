# Expense Splitting UI Components

This document describes the UI components used in the expense splitting feature.

## Main Components

### ExpenseSplittingInterface

The main container component that orchestrates the expense splitting UI.

**Props:**

- `transactionAmount`: The total amount of the transaction
- `onSplitChange`: Callback when splits change
- `colors`: Theme colors object
- `isDark`: Dark mode flag
- `disabled`: Whether the interface is disabled

**Features:**

- Toggle for enabling/disabling splitting
- Mode selection (group or individual)
- Group or individual selection
- Split type and calculation

### SplitToggle

Toggle button for enabling/disabling expense splitting.

**Props:**

- `isEnabled`: Whether splitting is enabled
- `onToggle`: Callback when toggle changes
- `colors`: Theme colors object
- `disabled`: Whether the toggle is disabled

### GroupSelector

Component for selecting or creating expense-sharing groups.

**Props:**

- `selectedGroup`: Currently selected group
- `onSelectGroup`: Callback when group selection changes
- `colors`: Theme colors object
- `isDark`: Dark mode flag

**Features:**

- List of user's groups
- Create new group option
- Group management options

### IndividualSplitting

Component for selecting or creating individual contacts for splitting.

**Props:**

- `totalAmount`: The total amount of the transaction
- `onPeopleUpdate`: Callback when selected people change
- `colors`: Theme colors object
- `isDark`: Dark mode flag

**Features:**

- Add new person form
- Select from existing contacts
- Edit/delete contacts
- Split type selection
- Amount/percentage entry

### SplitCalculator

Component for calculating splits based on the selected method.

**Props:**

- `totalAmount`: The total amount of the transaction
- `selectedGroup`: Selected group (if any)
- `onSplitsChange`: Callback when splits change
- `colors`: Theme colors object

**Features:**

- Equal split calculation
- Percentage split calculation
- Custom split calculation
- Split validation

### SplitValidation

Component for displaying split validation results.

**Props:**

- `validation`: Validation result object
- `colors`: Theme colors object

**Features:**

- Error and warning display
- Split total vs. transaction amount comparison

## Usage Example

```tsx
// In a transaction form component
import { ExpenseSplittingInterface } from "./ExpenseSplitting";

const TransactionForm = () => {
  const [amount, setAmount] = useState(0);
  const [splits, setSplits] = useState([]);
  const [group, setGroup] = useState(null);

  const handleSplitChange = (isEnabled, newSplits, newGroup) => {
    if (isEnabled && newSplits) {
      setSplits(newSplits);
      setGroup(newGroup);
    } else {
      setSplits([]);
      setGroup(null);
    }
  };

  return (
    <View>
      <AmountInput value={amount} onChange={setAmount} />

      <ExpenseSplittingInterface
        transactionAmount={amount}
        onSplitChange={handleSplitChange}
        colors={theme.colors}
        isDark={theme.dark}
      />

      {/* Rest of the form */}
    </View>
  );
};
```

## Component Hierarchy

```
ExpenseSplittingInterface
├── SplitToggle
├── [Mode Selection]
├── GroupSelector (if group mode)
│   └── GroupManagement
└── IndividualSplitting (if individual mode)
    ├── [Add Person Form]
    └── [Existing Contacts List]
└── SplitCalculator
    └── SplitValidation
```

## UI States

### Split Toggle States

- Disabled: Splitting not available
- Off: Splitting available but not enabled
- On: Splitting enabled

### Mode Selection States

- Group: Group splitting mode active
- Individual: Individual splitting mode active

### Split Type States

- Equal: Equal splitting selected
- Percentage: Percentage-based splitting selected
- Custom: Custom amount splitting selected

## Styling

The components use a consistent styling approach:

- All components accept a `colors` prop for theming
- Dark mode is supported via the `isDark` prop
- Responsive layouts work on both mobile and web
- Consistent border radius, padding, and spacing
