# Financial Summary Components

A collection of modular financial card components for displaying various financial metrics in the Octopus Finance mobile dashboard.

## Components

### 1. NetWorthCard

Displays the user's net worth, including assets, liabilities, and percentage change from the previous period.

```jsx
import { NetWorthCard } from '@/mobile/components/FinancialSummary';

<NetWorthCard backgroundImage="url/to/image.jpg" />
```

### 2. AccountsCard

Shows the total balance of user's bank accounts and the percentage change from the previous period.

```jsx
import { AccountsCard } from '@/mobile/components/FinancialSummary';

<AccountsCard backgroundImage="url/to/image.jpg" />
```

### 3. CreditCardCard

Displays the user's total credit card debt and percentage change from the previous period.

```jsx
import { CreditCardCard } from '@/mobile/components/FinancialSummary';

<CreditCardCard backgroundImage="url/to/image.jpg" />
```

### 4. MonthlyIncomeCard

Shows the user's monthly income and percentage change from the previous month.

```jsx
import { MonthlyIncomeCard } from '@/mobile/components/FinancialSummary';

<MonthlyIncomeCard backgroundImage="url/to/image.jpg" />
```

### 5. MonthlyExpenseCard

Displays the user's monthly expenses and percentage change from the previous month.

```jsx
import { MonthlyExpenseCard } from '@/mobile/components/FinancialSummary';

<MonthlyExpenseCard backgroundImage="url/to/image.jpg" />
```

## Usage with FinancialSummaryCards Component

All these components are conveniently integrated in the `FinancialSummaryCards` component, which arranges them in a swipeable carousel:

```jsx
import { FinancialSummaryCards } from '@/mobile/pages/MobileDashboard';

const cardBackgroundImages = {
  netWorth: "url/to/networth-bg.jpg",
  accounts: "url/to/accounts-bg.jpg",
  creditCard: "url/to/creditcard-bg.jpg",
  income: "url/to/income-bg.jpg",
  expenses: "url/to/expenses-bg.jpg"
};

<FinancialSummaryCards cardBackgroundImages={cardBackgroundImages} />
```

## Features

- **Real-time Data**: Each component fetches its own data from applicable hooks/services
- **Loading States**: Proper loading indicators while data is being fetched
- **Error Handling**: Graceful error presentation for failed data fetching
- **Dark Mode Support**: All components fully support light and dark mode
- **Responsive Design**: Cards adapt to different screen sizes
- **Optional Background Images**: Enhance visual appeal with optional background images

## Data Sources

- **NetWorthCard**: Uses `useNetWorth` hook 
- **AccountsCard**: Uses `useAccounts` hook
- **CreditCardCard**: Uses `useCreditCards` hook
- **Monthly Income/Expense Cards**: Directly query the transactions database

## Additional Notes

All percentage changes are color-coded (green for positive trends, red for negative) based on whether the change is beneficial for the metric. For example, an increase in net worth is positive, while an increase in expenses is negative. 