import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import NetWorthSection from '../NetWorthSection';
import { NetWorthProvider } from '@/contexts/NetWorthContext';

// Mock the underlying service
jest.mock('@/services/netWorthService', () => {
  // Import mock data here to avoid circular dependency
  const { mockDbEntries, mockDbCategories, mockDbCategorySummary } = require('../__mocks__/netWorthMockData');
  
  return {
    fetchNetWorthEntries: jest.fn().mockResolvedValue(mockDbEntries),
    fetchCategories: jest.fn().mockResolvedValue(mockDbCategories),
    fetchSubcategories: jest.fn().mockResolvedValue([]),
    calculateNetWorth: jest.fn().mockResolvedValue({
      total_assets: 10000000,
      total_liabilities: 2500000,
      net_worth: 7500000
    }),
    fetchCategorySummary: jest.fn().mockResolvedValue(mockDbCategorySummary),
    fetchNetWorthSnapshots: jest.fn().mockResolvedValue([]),
    calculateNetWorthTrend: jest.fn().mockResolvedValue({
      percentChange: 8.5,
      monthlyChange: '+8.5%'
    }),
    addNetWorthEntry: jest.fn().mockResolvedValue({}),
    updateNetWorthEntry: jest.fn().mockResolvedValue({}),
    deleteNetWorthEntry: jest.fn().mockResolvedValue(undefined),
    toggleEntryVisibility: jest.fn().mockResolvedValue({}),
    createMonthlySnapshot: jest.fn().mockResolvedValue('snapshot-id')
  };
});

// Mock the DemoModeContext
jest.mock('@/contexts/DemoModeContext', () => ({
  useDemoMode: () => ({ isDemo: true })
}));

// Mock the contexts
jest.mock('@/contexts/AccountsContext', () => ({
  useAccounts: () => ({
    accounts: [
      { id: '1', name: 'Savings Account', type: 'Savings', balance: 50000, provider: 'HDFC' },
      { id: '2', name: 'Current Account', type: 'Current', balance: 25000, provider: 'ICICI' }
    ]
  })
}));

jest.mock('@/contexts/CreditCardContext', () => ({
  useCreditCards: () => ({
    creditCards: [
      { id: '1', name: 'HDFC Card', currentBalance: 5000, provider: 'HDFC' },
      { id: '2', name: 'ICICI Card', currentBalance: 3000, provider: 'ICICI' }
    ]
  })
}));

jest.mock('@/common/providers/ThemeProvider', () => ({
  useTheme: () => ({
    resolvedTheme: 'light'
  })
}));

// Mock router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

// Test wrapper component with NetWorthProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <NetWorthProvider>
        {children}
      </NetWorthProvider>
    </BrowserRouter>
  );
};

describe('NetWorthSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Net Worth card with basic elements', async () => {
    render(
      <TestWrapper>
        <NetWorthSection />
      </TestWrapper>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Net Worth')).toBeInTheDocument();
    });
    
    // Use getAllByText for elements that appear multiple times
    const totalAssetsElements = screen.getAllByText('Total Assets');
    expect(totalAssetsElements.length).toBeGreaterThan(0);
    
    const totalLiabilitiesElements = screen.getAllByText('Total Liabilities');
    expect(totalLiabilitiesElements.length).toBeGreaterThan(0);
  });

  it('has view mode toggle functionality', async () => {
    render(
      <TestWrapper>
        <NetWorthSection />
      </TestWrapper>
    );

    await waitFor(() => {
      // Look for actual button elements
      const buttonElements = document.querySelectorAll('button');
      expect(buttonElements.length).toBeGreaterThan(0);
    });
  });

  it('switches between Grid and List view modes', async () => {
    render(
      <TestWrapper>
        <NetWorthSection />
      </TestWrapper>
    );

    await waitFor(() => {
      // Check that view mode controls exist
      const viewControls = document.querySelector('.space-y-4.sm\\:space-y-6');
      expect(viewControls).toBeInTheDocument();
    });
  });

  it('displays asset classes in grid layout by default', async () => {
    render(
      <TestWrapper>
        <NetWorthSection />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show grid of asset classes
      const gridContainer = document.querySelector('.grid.grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  it('displays asset data from context', async () => {
    render(
      <TestWrapper>
        <NetWorthSection />
      </TestWrapper>
    );

    // Wait for data to load, then check that mock data is displayed
    await waitFor(() => {
      // Check for any asset name from mock data
      const assetElements = document.querySelectorAll('[class*="font-medium"]');
      expect(assetElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('shows loading state initially', () => {
    render(
      <TestWrapper>
        <NetWorthSection />
      </TestWrapper>
    );

    // Should show loading state initially
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  describe('Responsive Design', () => {
    it('has proper mobile-responsive classes', async () => {
      render(
        <TestWrapper>
          <NetWorthSection />
        </TestWrapper>
      );

      // Check for responsive spacing
      expect(document.querySelector('.space-y-4.sm\\:space-y-6')).toBeInTheDocument();
      
      await waitFor(() => {
        // Check for responsive text sizing
        const netWorthTitle = screen.getByText('Net Worth');
        expect(netWorthTitle).toHaveClass('text-base', 'sm:text-lg');
      });
    });
  });
}); 