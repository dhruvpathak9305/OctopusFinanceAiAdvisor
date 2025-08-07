# Financial Summary Components

This directory contains React Native components for displaying financial summary cards in the mobile dashboard.

## Components

### FinancialSummaryCard
Base component for all financial summary cards with:
- Chart visualization
- Loading and error states
- Theme support (light/dark)
- Interactive elements (View All, Add New)

### NetWorthCard
Displays net worth information with:
- Total net worth value
- Monthly change percentage
- 6-month trend chart
- Navigation to detailed view

### AccountsCard
Shows bank account information with:
- Total account balance
- Monthly change percentage
- 6-month trend chart
- Navigation to accounts management

### CreditCardCard
Displays credit card debt with:
- Total debt amount
- Monthly change percentage
- 6-month trend chart
- Navigation to debt management

### MonthlyIncomeCard
Shows monthly income with:
- Total income amount
- Monthly change percentage
- 6-month trend chart
- Navigation to income tracking

### MonthlyExpenseCard
Displays monthly expenses with:
- Total expense amount
- Monthly change percentage
- 6-month trend chart
- Navigation to expense tracking

## Usage

```typescript
import { 
  NetWorthCard, 
  AccountsCard, 
  CreditCardCard, 
  MonthlyIncomeCard, 
  MonthlyExpenseCard 
} from '../../components/FinancialSummary';

// In your component
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <NetWorthCard backgroundImage={backgroundImageUrl} />
  <AccountsCard backgroundImage={backgroundImageUrl} />
  <CreditCardCard backgroundImage={backgroundImageUrl} />
  <MonthlyIncomeCard backgroundImage={backgroundImageUrl} />
  <MonthlyExpenseCard backgroundImage={backgroundImageUrl} />
</ScrollView>
```

## Features

- **Responsive Design**: Adapts to different screen sizes
- **Theme Support**: Full light/dark theme compatibility
- **Custom Charts**: Built-in bar chart visualization
- **Navigation**: Integrated with React Navigation
- **Loading States**: Proper loading indicators
- **Error Handling**: Graceful error states
- **Mock Data**: Built-in demo data for testing

## Props

### FinancialSummaryCard
- `title`: Card title
- `icon`: Emoji icon
- `data`: Chart data array
- `total`: Total value
- `monthlyChange`: Monthly change percentage
- `themeColor`: Primary color for the card
- `loading`: Loading state
- `error`: Error message
- `onViewAll`: View all callback
- `onAddNew`: Add new callback
- `backgroundImage`: Optional background image URL

### Individual Cards
- `backgroundImage`: Optional background image URL

## Chart Data Format

```typescript
interface ChartData {
  month: string;  // Month abbreviation (e.g., "Jan")
  value: number;  // Numeric value
}
```

## Navigation

All cards include navigation to their respective detail pages:
- Net Worth → Money tab with net-worth focus
- Accounts → Money tab with accounts focus
- Credit Cards → Money tab with credit-cards focus
- Income → Money tab with income focus
- Expenses → Money tab with expenses focus

## Styling

Components use consistent styling with:
- Rounded corners (12px)
- Shadow effects
- Proper spacing
- Color-coded themes
- Responsive layouts

## Dependencies

- React Native core components
- React Navigation for routing
- ThemeContext for theme management
- No external chart libraries (custom implementation) 