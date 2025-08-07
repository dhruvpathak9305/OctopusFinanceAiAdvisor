# Money Page - Usage Examples

This document provides practical examples of how to use the revamped Money page components in various scenarios.

## 🏗️ Basic Integration

### 1. Using the Complete AccountsTab

```typescript
import React from 'react';
import AccountsTab from '@/mobile/pages/Money/AccountsTab';

function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Financial Dashboard</h1>
      
      {/* Complete accounts tab with all features */}
      <AccountsTab />
    </div>
  );
}
```

### 2. Using Individual Components

```typescript
import React, { useState } from 'react';
import FilterBar from '@/mobile/pages/Money/components/FilterBar';
import BalanceCard from '@/mobile/pages/Money/components/BalanceCard';
import DonutChart from '@/mobile/pages/Money/components/DonutChart';
import AccountIconRow from '@/mobile/pages/Money/components/AccountIconRow';

function CustomAccountsView() {
  const [selectedInstitution, setSelectedInstitution] = useState('All');
  
  // Mock data
  const institutions = ['HDFC Bank', 'ICICI Bank', 'Axis Bank'];
  const accounts = [
    { id: '1', name: 'Savings', balance: 150000, institution: 'HDFC Bank', type: 'Savings' },
    { id: '2', name: 'Current', balance: 75000, institution: 'ICICI Bank', type: 'Current' }
  ];
  
  const chartData = [
    { name: 'HDFC Bank', value: 150000, institution: 'HDFC Bank' },
    { name: 'ICICI Bank', value: 75000, institution: 'ICICI Bank' }
  ];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        institutions={institutions}
        selectedInstitution={selectedInstitution}
        onInstitutionChange={setSelectedInstitution}
        onAddAccount={() => console.log('Add account')}
      />
      
      {/* Balance Overview */}
      <BalanceCard
        totalBalance={225000}
        lastSyncTime={new Date().toISOString()}
        accountCount={2}
      />
      
      {/* Visual Distribution */}
      <DonutChart
        data={chartData}
        title="Account Distribution"
        compact={true}
      />
      
      {/* Quick Access Icons */}
      <AccountIconRow
        accounts={accounts}
        onAccountSelect={(account) => console.log('Selected:', account)}
      />
    </div>
  );
}
```

## 📱 Mobile-Specific Examples

### 1. Compact Mobile Layout

```typescript
import React from 'react';
import { useResponsive } from '@/common/hooks/useResponsive';
import DonutChart from '@/mobile/pages/Money/components/DonutChart';

function MobileAccountsWidget() {
  const { isMobile } = useResponsive();
  
  const chartData = [
    { name: 'Savings', value: 150000, institution: 'HDFC Bank' },
    { name: 'Current', value: 75000, institution: 'ICICI Bank' }
  ];

  return (
    <div className="p-4">
      <DonutChart
        data={chartData}
        title={isMobile ? "Accounts" : "Account Distribution"}
        compact={isMobile}
      />
    </div>
  );
}
```

### 2. Touch-Optimized Account Row

```typescript
import React from 'react';
import AccountIconRow from '@/mobile/pages/Money/components/AccountIconRow';

function TouchFriendlyAccountsView() {
  const accounts = [
    { id: '1', name: 'Savings', balance: 150000, institution: 'HDFC Bank', type: 'Savings' },
    { id: '2', name: 'Current', balance: 75000, institution: 'ICICI Bank', type: 'Current' },
    { id: '3', name: 'FD', balance: 200000, institution: 'Axis Bank', type: 'Fixed Deposit' }
  ];

  const handleAccountTap = (account) => {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Navigate to account details
    console.log('Account selected:', account);
  };

  return (
    <div className="bg-background min-h-screen">
      <AccountIconRow
        accounts={accounts}
        onAccountSelect={handleAccountTap}
      />
    </div>
  );
}
```

## 🎨 Theme Integration Examples

### 1. Theme-Aware Balance Card

```typescript
import React from 'react';
import { useTheme } from '@/common/providers/ThemeProvider';
import BalanceCard from '@/mobile/pages/Money/components/BalanceCard';

function ThemedBalanceDisplay() {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={`p-6 ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <BalanceCard
        totalBalance={425000}
        lastSyncTime="2024-01-15T10:30:00Z"
        accountCount={3}
      />
      
      {/* Theme indicator */}
      <p className="text-xs text-muted-foreground mt-2">
        Current theme: {resolvedTheme}
      </p>
    </div>
  );
}
```

### 2. Custom Color Scheme

```typescript
import React from 'react';
import DonutChart from '@/mobile/pages/Money/components/DonutChart';

function CustomColorChart() {
  const chartData = [
    { name: 'HDFC Bank', value: 150000, institution: 'HDFC Bank', color: '#DC2626' },
    { name: 'ICICI Bank', value: 75000, institution: 'ICICI Bank', color: '#EA580C' },
    { name: 'Axis Bank', value: 100000, institution: 'Axis Bank', color: '#7C3AED' }
  ];

  return (
    <div className="p-4">
      <DonutChart
        data={chartData}
        title="Custom Colored Distribution"
      />
    </div>
  );
}
```

## 🔄 State Management Examples

### 1. Redux Integration

```typescript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FilterBar from '@/mobile/pages/Money/components/FilterBar';
import { setSelectedInstitution, openAddAccountModal } from '@/store/accountsSlice';

function ReduxIntegratedFilter() {
  const dispatch = useDispatch();
  const { institutions, selectedInstitution } = useSelector(state => state.accounts);

  return (
    <FilterBar
      institutions={institutions}
      selectedInstitution={selectedInstitution}
      onInstitutionChange={(institution) => 
        dispatch(setSelectedInstitution(institution))
      }
      onAddAccount={() => 
        dispatch(openAddAccountModal())
      }
    />
  );
}
```

### 2. Local State with Context

```typescript
import React, { createContext, useContext, useState } from 'react';
import AccountsTab from '@/mobile/pages/Money/AccountsTab';

const AccountsFilterContext = createContext();

function AccountsProvider({ children }) {
  const [selectedInstitution, setSelectedInstitution] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AccountsFilterContext.Provider 
      value={{
        selectedInstitution,
        setSelectedInstitution,
        isModalOpen,
        setIsModalOpen
      }}
    >
      {children}
    </AccountsFilterContext.Provider>
  );
}

function ContextAwareAccountsTab() {
  return (
    <AccountsProvider>
      <AccountsTab />
    </AccountsProvider>
  );
}
```

## 📊 Data Fetching Examples

### 1. API Integration with SWR

```typescript
import React from 'react';
import useSWR from 'swr';
import BalanceCard from '@/mobile/pages/Money/components/BalanceCard';

const fetcher = (url) => fetch(url).then(r => r.json());

function APIIntegratedBalance() {
  const { data: accounts, error, isLoading } = useSWR('/api/accounts', fetcher);

  if (isLoading) return <div className="animate-pulse h-24 bg-gray-200 rounded-lg" />;
  if (error) return <div className="text-red-500">Failed to load accounts</div>;

  const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0;
  const lastSync = accounts?.[0]?.lastSync;

  return (
    <BalanceCard
      totalBalance={totalBalance}
      lastSyncTime={lastSync}
      accountCount={accounts?.length || 0}
    />
  );
}
```

### 2. Real-time Updates with WebSocket

```typescript
import React, { useState, useEffect } from 'react';
import BalanceCard from '@/mobile/pages/Money/components/BalanceCard';

function RealTimeBalance() {
  const [balance, setBalance] = useState(0);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/accounts');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBalance(data.totalBalance);
      setLastSync(new Date().toISOString());
    };

    return () => ws.close();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground">Live updates</span>
      </div>
      
      <BalanceCard
        totalBalance={balance}
        lastSyncTime={lastSync}
        accountCount={3}
      />
    </div>
  );
}
```

## 🧪 Testing Examples

### 1. Component Testing with React Testing Library

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterBar from '@/mobile/pages/Money/components/FilterBar';

describe('FilterBar Integration Tests', () => {
  const mockProps = {
    institutions: ['HDFC Bank', 'ICICI Bank'],
    selectedInstitution: 'All',
    onInstitutionChange: jest.fn(),
    onAddAccount: jest.fn(),
  };

  it('integrates correctly in parent component', () => {
    function TestParent() {
      const [selected, setSelected] = React.useState('All');
      
      return (
        <FilterBar
          {...mockProps}
          selectedInstitution={selected}
          onInstitutionChange={setSelected}
        />
      );
    }

    render(<TestParent />);
    
    fireEvent.click(screen.getByText('HDFC Bank'));
    expect(screen.getByText('HDFC Bank')).toHaveClass('bg-primary');
  });
});
```

### 2. End-to-End Testing Example

```typescript
// Cypress test
describe('Money Page Flow', () => {
  beforeEach(() => {
    cy.visit('/money');
  });

  it('allows users to filter accounts and view details', () => {
    // Select accounts tab
    cy.get('[data-testid="accounts-tab"]').click();
    
    // Filter by institution
    cy.get('[data-testid="filter-hdfc"]').click();
    
    // Verify balance card updates
    cy.get('[data-testid="balance-card"]')
      .should('contain', '₹')
      .should('contain', 'HDFC');
    
    // Verify chart updates
    cy.get('[data-testid="donut-chart"]').should('be.visible');
    
    // Click on account icon
    cy.get('[data-testid="account-icon-0"]').click();
    
    // Verify account details modal or navigation
    cy.url().should('include', '/account/');
  });
});
```

## 🚀 Performance Optimization Examples

### 1. Memoized Components

```typescript
import React, { memo, useMemo } from 'react';
import DonutChart from '@/mobile/pages/Money/components/DonutChart';

const OptimizedAccountsView = memo(function OptimizedAccountsView({ accounts }) {
  const chartData = useMemo(() => {
    return accounts
      .reduce((groups, account) => {
        const key = account.institution;
        if (!groups[key]) groups[key] = { balance: 0, institution: key };
        groups[key].balance += account.balance;
        return groups;
      }, {});
  }, [accounts]);

  return (
    <DonutChart
      data={Object.values(chartData)}
      title="Optimized Account Distribution"
    />
  );
});
```

### 2. Lazy Loading with Suspense

```typescript
import React, { Suspense, lazy } from 'react';

const LazyDonutChart = lazy(() => import('@/mobile/pages/Money/components/DonutChart'));

function LazyLoadedAccountsView() {
  return (
    <div className="space-y-4">
      <Suspense fallback={
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Loading chart...</span>
        </div>
      }>
        <LazyDonutChart
          data={[]}
          title="Lazy Loaded Chart"
        />
      </Suspense>
    </div>
  );
}
```

## 🔗 Third-Party Integration Examples

### 1. Analytics Integration

```typescript
import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import FilterBar from '@/mobile/pages/Money/components/FilterBar';

function AnalyticsIntegratedFilter() {
  const { trackEvent } = useAnalytics();

  const handleInstitutionChange = (institution) => {
    trackEvent('account_filter_changed', {
      institution,
      timestamp: new Date().toISOString()
    });
    
    // Your filter logic here
  };

  return (
    <FilterBar
      institutions={['HDFC Bank', 'ICICI Bank']}
      selectedInstitution="All"
      onInstitutionChange={handleInstitutionChange}
      onAddAccount={() => trackEvent('add_account_clicked')}
    />
  );
}
```

### 2. Accessibility Enhancement

```typescript
import React from 'react';
import { useAnnouncer } from '@/hooks/useAnnouncer';
import BalanceCard from '@/mobile/pages/Money/components/BalanceCard';

function AccessibleBalanceCard() {
  const { announce } = useAnnouncer();

  React.useEffect(() => {
    announce('Account balance loaded');
  }, []);

  return (
    <div role="region" aria-label="Account balance summary">
      <BalanceCard
        totalBalance={425000}
        lastSyncTime="2024-01-15T10:30:00Z"
        accountCount={3}
      />
    </div>
  );
}
```

These examples demonstrate the flexibility and reusability of the revamped Money page components, showing how they can be integrated into various application architectures and use cases while maintaining their core functionality and design principles. 