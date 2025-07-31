# Mobile Dashboard

A comprehensive financial dashboard for React Native/Expo applications featuring reusable components, trend visualization, and error boundaries.

## Overview

The Mobile Dashboard provides a complete financial overview with the following key features:

- **Financial Summary Cards**: Horizontal scrollable cards showing Net Worth, Credit Card Debt, Bank Accounts, Monthly Income, and Monthly Expenses with trend charts
- **Budget Progress Section**: Visual budget tracking with circular progress indicators
- **Recent Transactions**: Scrollable list of recent transactions with filtering options
- **Upcoming Bills**: Bill management with status indicators and date grouping
- **Error Boundaries**: Comprehensive error handling to prevent app crashes
- **Responsive Design**: Optimized for mobile screens with proper spacing and touch targets

## Architecture

### Component Structure

```
src/mobile/pages/MobileDashboard/
├── index.tsx                           # Main dashboard component
├── components/
│   ├── index.ts                       # Component exports
│   ├── ErrorBoundary.tsx              # Error boundary wrapper
│   ├── Header.tsx                     # Dashboard header
│   ├── FinancialSummaryCard.tsx       # Base financial card component
│   ├── NetWorthCard.tsx               # Net worth display card
│   ├── CreditCardCard.tsx             # Credit card debt card
│   ├── AccountsCard.tsx               # Bank accounts card
│   ├── MonthlyIncomeCard.tsx          # Monthly income card
│   ├── MonthlyExpenseCard.tsx         # Monthly expenses card
│   ├── BudgetProgressSection.tsx      # Budget tracking section
│   ├── RecentTransactionsSection.tsx  # Recent transactions list
│   └── UpcomingBillsSection.tsx       # Upcoming bills section
└── README.md                          # This documentation
```

### Design Patterns

1. **Component Composition**: Each section is a self-contained component with its own state management
2. **Error Boundaries**: Every major section is wrapped in error boundaries to isolate failures
3. **Reusable Cards**: Financial summary cards use a base component with specialized implementations
4. **Mock Data**: All components include realistic mock data for development and testing
5. **Responsive Layout**: Uses React Native Dimensions and flexible layouts for different screen sizes

## Features

### Financial Summary Cards

Horizontal scrollable cards displaying key financial metrics:

- **Net Worth**: Total assets minus liabilities with trend visualization
- **Credit Card Debt**: Current credit card balances with change indicators
- **Bank Accounts**: Total bank account balances
- **Monthly Income**: Current month's income with trend
- **Monthly Expenses**: Current month's expenses with trend

Each card includes:
- Mini trend chart using react-native-chart-kit
- Percentage change from previous period
- Visual trend indicators (up/down arrows)
- Touch interaction support

### Budget Progress Section

Visual budget tracking with:
- Circular progress indicators for Needs, Wants, and Savings
- Filter options (Expense/Monthly)
- Percentage completion display
- Category icons and color coding

### Recent Transactions Section

Transaction management featuring:
- Scrollable transaction list
- Category icons and color coding
- Filter options (Weekly/Monthly/Quarterly)
- Empty state handling
- Loading states
- Transaction amount color coding (red for expenses, green for income)

### Upcoming Bills Section

Bill management with:
- Date-based grouping (Today, Tomorrow, etc.)
- Status indicators (Due, Paid, Overdue)
- Category tags (Utilities, Subscriptions, etc.)
- Recurring bill indicators
- Due date formatting
- Status color coding

## Usage

```tsx
import MobileDashboard from './src/mobile/pages/MobileDashboard';

export default function App() {
  return <MobileDashboard />;
}
```

## Customization

### Adding New Financial Cards

1. Create a new card component following the existing pattern:

```tsx
import React from 'react';
import FinancialSummaryCard from './FinancialSummaryCard';

const YourCustomCard: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const cardData = {
    value: '$1,234',
    change: '+5.2%',
    trend: 'up' as const,
    chartData: [100, 120, 110, 130, 125, 140, 135],
  };

  return (
    <FinancialSummaryCard
      title="Your Metric"
      value={cardData.value}
      change={cardData.change}
      trend={cardData.trend}
      icon="📊"
      chartData={cardData.chartData}
      onPress={onPress}
      backgroundColor="#1F2937"
    />
  );
};

export default YourCustomCard;
```

2. Add it to the dashboard in `index.tsx`:

```tsx
<ErrorBoundary>
  <YourCustomCard />
</ErrorBoundary>
```

### Styling Customization

All components use StyleSheet for styling. Key style constants:

```tsx
const styles = StyleSheet.create({
  // Dark theme colors
  backgroundColor: '#0B1426',    // Main background
  cardBackground: '#1F2937',     // Card backgrounds
  borderColor: '#374151',        // Borders
  textPrimary: '#FFFFFF',        // Primary text
  textSecondary: '#9CA3AF',      // Secondary text
  accentColor: '#10B981',        // Green accent
  errorColor: '#EF4444',         // Red for expenses/errors
  warningColor: '#F59E0B',       // Orange for warnings
});
```

## Dependencies

- `react-native-chart-kit`: Chart visualization
- `react-native-svg`: SVG support for charts
- React Native core components

## Error Handling

The dashboard implements comprehensive error boundaries:

1. **Section-level boundaries**: Each major section has its own error boundary
2. **Card-level boundaries**: Financial summary cards are individually protected
3. **Graceful degradation**: Errors in one section don't affect others
4. **User-friendly messages**: Clear error messages with retry options

## Performance Considerations

- **Lazy loading**: Components load data as needed
- **Scroll optimization**: Uses proper scrolling components with performance optimizations
- **Memory management**: Proper cleanup in useEffect hooks
- **Chart optimization**: Minimal chart data points for smooth rendering

## Development

### Mock Data

All components include realistic mock data for development. In production, replace with:

```tsx
// Replace mock data with API calls
const { data, loading, error } = useYourApiHook();
```

### Testing

Each component includes:
- TypeScript interfaces for props
- Error boundary testing
- Mock data for consistent testing
- Proper prop validation

## Responsive Design

The dashboard adapts to different screen sizes:

- Cards scale based on screen width
- Proper touch targets (minimum 44px)
- Scrollable content with proper padding
- Safe area handling for different devices

## Accessibility

- Semantic component structure
- Proper text contrast ratios
- Touch target sizing
- Screen reader support (can be enhanced further)

## Future Enhancements

1. **Real-time data**: WebSocket integration for live updates
2. **Offline support**: Local storage and sync capabilities
3. **Customizable layout**: User-defined card order and visibility
4. **Advanced filtering**: Date ranges, categories, amounts
5. **Export functionality**: PDF/CSV export capabilities
6. **Push notifications**: Bill reminders and spending alerts
7. **Dark/Light theme**: Theme switching capability
8. **Animations**: Smooth transitions and micro-interactions 