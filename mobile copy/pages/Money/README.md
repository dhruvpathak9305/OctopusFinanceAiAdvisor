# Money Page - Accounts Tab Revamp

A mobile-optimized, theme-aware financial management interface for bank accounts, credit cards, and net worth tracking.

## 📋 Overview

The Money page has been completely revamped with a focus on the **Accounts** tab, following modern UI/UX principles and mobile-first design. The page includes modular, reusable components that provide a comprehensive view of user financial data.

## 🚀 Features

### 🏦 Accounts Tab (Revamped)
- **Filter Bar**: Horizontally scrollable institution filters
- **Total Balance Card**: Real-time balance with sync status
- **Donut Chart**: Visual account distribution by institution
- **Account Icon Row**: Quick overview with abbreviated balances
- **Extra Cash Card**: Investment opportunity suggestions
- **Responsive Design**: Mobile-first with desktop optimizations

### 💳 Credit Cards Tab
- Institution-based filtering
- Card management and breakdown views
- Usage tracking and limits

### 💰 Net Worth Tab
- Assets vs liabilities overview
- Investment portfolio summary

## 🧩 Component Architecture

```
src/mobile/pages/Money/
├── index.tsx                 # Main Money page container
├── AccountsTab.tsx          # New revamped accounts tab
├── components/              # Modular reusable components
│   ├── FilterBar.tsx        # Institution filter chips
│   ├── BalanceCard.tsx      # Total balance + sync time
│   ├── DonutChart.tsx       # Account distribution chart
│   └── AccountIconRow.tsx   # Scrollable account icons
└── __tests__/               # Comprehensive test suite
    ├── AccountsTab.test.tsx
    └── components/
        ├── FilterBar.test.tsx
        └── BalanceCard.test.tsx
```

## 🎨 Design System

### Theme Support
- **Light Mode**: Clean, professional appearance
- **Dark Mode**: Easy-on-eyes dark theme
- **Auto-switching**: Follows system preferences

### Mobile-First Responsive Design
```css
/* Mobile (default) */
text-lg, p-4, text-xs

/* Tablet and up */
sm:text-xl, sm:p-6, sm:text-base
```

### Color Scheme
- **Primary Colors**: Green accent for actions
- **Bank Colors**: Institution-specific branding
- **Status Colors**: 
  - Green: Positive balances, healthy metrics
  - Red: Negative balances, alerts
  - Muted: Secondary information

## 💾 Data Integration

### Services Used
- `@/services/accountsService.ts` - Account data operations
- `@/contexts/AccountsContext.tsx` - State management
- `@/config/bankConfig.ts` - Bank branding and colors

### Data Flow
```typescript
AccountsService → AccountsContext → AccountsTab → Components
```

### Account Types Supported
- ✅ Checking Accounts
- ✅ Savings Accounts  
- ✅ Investment Accounts
- ❌ Credit Cards (filtered out)
- ❌ Loans (filtered out)

## 🔧 Component APIs

### FilterBar
```typescript
interface FilterBarProps {
  institutions: string[];
  selectedInstitution: string;
  onInstitutionChange: (institution: string) => void;
  onAddAccount: () => void;
  title?: string;
}
```

### BalanceCard
```typescript
interface BalanceCardProps {
  totalBalance: number;
  lastSyncTime?: string;
  accountCount: number;
}
```

### DonutChart
```typescript
interface DonutChartProps {
  data: ChartData[];
  title?: string;
  compact?: boolean;
}
```

### AccountIconRow
```typescript
interface AccountIconRowProps {
  accounts: Account[];
  onAccountSelect?: (account: Account) => void;
}
```

## 💰 Currency Formatting

### Indian Rupee (INR) Support
- **Full Format**: ₹1,23,456.78
- **Abbreviated Format**: 
  - ₹1.2L (Lakhs)
  - ₹45K (Thousands) 
  - ₹2.3Cr (Crores)

### Smart Time Formatting
- "Just now" (< 1 minute)
- "5 mins ago" (< 1 hour)
- "2 hours ago" (< 24 hours)
- "Yesterday" (1 day ago)
- "3 days ago" (< 1 week)
- "15 Jan" (older dates)

## 🧪 Testing Strategy

### Unit Tests Coverage
- ✅ Component rendering
- ✅ User interactions
- ✅ Data calculations
- ✅ Responsive behavior
- ✅ Error handling
- ✅ Empty states

### Test Files
```bash
# Run all Money page tests
npm test -- --testPathPattern="Money"

# Run specific component tests
npm test -- --testPathPattern="FilterBar"
npm test -- --testPathPattern="BalanceCard"
npm test -- --testPathPattern="AccountsTab"
```

## 📱 Mobile Optimizations

### Touch-Friendly Design
- **Minimum Touch Targets**: 44px (iOS standard)
- **Swipe Gestures**: Horizontal scrolling for filters and icons
- **Pull-to-Refresh**: Data synchronization

### Performance
- **Lazy Loading**: Chart components loaded on demand
- **Memoization**: Expensive calculations cached
- **Debounced Interactions**: Smooth user experience

### iOS/Android Specific
- **Safe Areas**: Proper spacing for notches
- **Native Scrolling**: WebKit momentum scrolling
- **Haptic Feedback**: Touch response (where supported)

## 🎯 User Experience

### Key User Flows
1. **Quick Balance Check**: Immediate total balance visibility
2. **Institution Filtering**: Easy bank-wise account filtering
3. **Visual Data**: Chart-based account distribution
4. **Action-Oriented**: Clear CTAs for account management

### Accessibility (a11y)
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Clear focus indicators

## 🔄 State Management

### Data Fetching
```typescript
const { accounts, loading, error } = useAccounts();
```

### Filter State
```typescript
const [selectedInstitution, setSelectedInstitution] = useState("All");
```

### Modal State
```typescript
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
```

## 🚀 Future Enhancements

### Planned Features
- [ ] Pull-to-refresh for account sync
- [ ] Account search and sorting
- [ ] Transaction preview in account cards
- [ ] Biometric authentication for sensitive data
- [ ] Offline mode with sync queue

### Performance Improvements
- [ ] Virtual scrolling for large account lists
- [ ] Progressive Web App (PWA) capabilities
- [ ] Service worker for offline functionality

## 📈 Analytics & Monitoring

### Key Metrics Tracked
- Filter usage patterns
- Account interaction rates
- Chart engagement
- Modal conversion rates

### Performance Monitoring
- Component render times
- API response times
- User interaction latency

## 🔗 Integration Points

### External Services
- Bank APIs for real-time data
- Chart.js/Recharts for visualizations
- Notification service for alerts

### Internal Services
- Authentication service
- Theme provider
- Responsive utilities

## 🛠️ Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 📚 Documentation

### Component Documentation
Each component includes:
- TypeScript interfaces
- Usage examples
- Props documentation
- Test coverage

### API Documentation
- Service method signatures
- Error handling patterns
- Data transformation utilities

This revamped Money page provides a solid foundation for financial data management with extensible, well-tested components that follow modern React patterns and design principles. 