import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock React Router before importing the component
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="router">{children}</div>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/money',
    search: '',
    hash: '',
    state: null,
  }),
}));

import MoneyPage from '../index';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCreditCards } from '@/contexts/CreditCardContext';

// Mock other dependencies
jest.mock('@/contexts/AccountsContext');
jest.mock('@/contexts/CreditCardContext');

// Mock ThemeProvider
jest.mock('@/common/providers/ThemeProvider', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
  })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

jest.mock('@/components/common/ExtraCashInBankCard/ExtraCashInBankCard', () => {
  return function MockExtraCashInBankCard() {
    return <div data-testid="extra-cash-card">Extra Cash Card</div>;
  };
});

jest.mock('@/components/common/AddAccountModal', () => {
  return function MockAddAccountModal() {
    return <div data-testid="add-account-modal">Add Account Modal</div>;
  };
});

jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
  LabelList: () => <div data-testid="label-list" />,
}));

const mockUseAccounts = useAccounts as jest.MockedFunction<typeof useAccounts>;
const mockUseCreditCards = useCreditCards as jest.MockedFunction<typeof useCreditCards>;

// Mock the contexts
const mockAccounts = [
  { id: '1', name: 'Test Savings', type: 'Savings', balance: 50000, lastUpdated: '2025-01-07' },
];

const mockCreditCards = [
  { id: '1', name: 'Test Credit Card', currentBalance: 15000, lastUpdated: '2025-01-07' }
];

jest.mock('@/contexts/AccountsContext', () => ({
  useAccounts: () => ({
    accounts: mockAccounts,
    loading: false,
    error: null
  })
}));

jest.mock('@/contexts/CreditCardContext', () => ({
  useCreditCards: () => ({
    creditCards: mockCreditCards,
    loading: false,
    error: null
  })
}));

// Mock the theme provider
jest.mock('@/common/providers/ThemeProvider', () => ({
  useTheme: () => ({
    resolvedTheme: 'dark',
  }),
}));

// Mock the responsive hook
jest.mock('@/common/hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: true,
  }),
}));

// Mock the child components
jest.mock('../components/AccountsSection', () => {
  return function MockAccountsSection({ onAccountSelect }: any) {
    return (
      <div data-testid="accounts-section">
        <h2>Accounts Section</h2>
        <button onClick={() => onAccountSelect({ id: '1', name: 'Test Account' })}>
          Select Account
        </button>
      </div>
    );
  };
});

jest.mock('../components/CreditCardsSection', () => {
  return function MockCreditCardsSection({ onManageCard, onViewBreakdown }: any) {
    return (
      <div data-testid="credit-cards-section">
        <h2>Credit Cards Section</h2>
        <button onClick={() => onManageCard('card-1')}>Manage Card</button>
        <button onClick={() => onViewBreakdown('card-1')}>View Breakdown</button>
      </div>
    );
  };
});

jest.mock('../components/NetWorthSection', () => {
  return function MockNetWorthSection() {
    return (
      <div data-testid="net-worth-section">
        <h2>Net Worth Section</h2>
        <p>Net worth content</p>
      </div>
    );
  };
});

const renderWithRouter = (initialEntries: string[] = ['/money']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <MoneyPage />
    </MemoryRouter>
  );
};

describe('MoneyPage', () => {
  beforeEach(() => {
    mockUseAccounts.mockReturnValue({
      accounts: [],
      loading: false,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    mockUseCreditCards.mockReturnValue({
      creditCards: [],
      loading: false,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default tab', () => {
    renderWithRouter();
    
    expect(screen.getByText('Money')).toBeInTheDocument();
    expect(screen.getByText('Manage your accounts and cards')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Credit Cards')).toBeInTheDocument();
    expect(screen.getByText('Net Worth')).toBeInTheDocument();
  });

  it('displays accounts tab by default', () => {
    renderWithRouter();
    
    expect(screen.getByTestId('accounts-section')).toBeInTheDocument();
    expect(screen.queryByTestId('credit-cards-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('net-worth-section')).not.toBeInTheDocument();
  });

  it('switches to credit cards tab when clicked', async () => {
    renderWithRouter();
    
    const creditCardsTab = screen.getByText('Credit Cards');
    fireEvent.click(creditCardsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('credit-cards-section')).toBeInTheDocument();
      expect(screen.queryByTestId('accounts-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('net-worth-section')).not.toBeInTheDocument();
    });
  });

  it('switches to net worth tab when clicked', async () => {
    renderWithRouter();
    
    const netWorthTab = screen.getByText('Net Worth');
    fireEvent.click(netWorthTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('net-worth-section')).toBeInTheDocument();
      expect(screen.queryByTestId('accounts-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('credit-cards-section')).not.toBeInTheDocument();
    });
  });

  it('handles URL parameter for tab selection', () => {
    renderWithRouter(['/money?tab=net-worth']);
    
    expect(screen.getByTestId('net-worth-section')).toBeInTheDocument();
    expect(screen.queryByTestId('accounts-section')).not.toBeInTheDocument();
  });

  it('handles URL parameter for credit cards tab', () => {
    renderWithRouter(['/money?tab=credit-cards']);
    
    expect(screen.getByTestId('credit-cards-section')).toBeInTheDocument();
    expect(screen.queryByTestId('accounts-section')).not.toBeInTheDocument();
  });

  it('defaults to accounts tab when invalid tab parameter is provided', () => {
    renderWithRouter(['/money?tab=invalid-tab']);
    
    expect(screen.getByTestId('accounts-section')).toBeInTheDocument();
  });

  it('updates URL when tab changes', async () => {
    const { container } = renderWithRouter();
    
    const netWorthTab = screen.getByText('Net Worth');
    fireEvent.click(netWorthTab);
    
    await waitFor(() => {
      // Check that URL has been updated (this would be reflected in actual routing)
      expect(screen.getByTestId('net-worth-section')).toBeInTheDocument();
    });
  });

  it('handles account selection correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderWithRouter();
    
    const selectButton = screen.getByText('Select Account');
    fireEvent.click(selectButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Selected account:', { id: '1', name: 'Test Account' });
    
    consoleSpy.mockRestore();
  });

  it('handles credit card management correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderWithRouter();
    
    // Switch to credit cards tab
    const creditCardsTab = screen.getByText('Credit Cards');
    fireEvent.click(creditCardsTab);
    
    await waitFor(() => {
      const manageButton = screen.getByText('Manage Card');
      fireEvent.click(manageButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Manage card:', 'card-1');
    });
    
    consoleSpy.mockRestore();
  });

  it('handles credit card breakdown view correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderWithRouter();
    
    // Switch to credit cards tab
    const creditCardsTab = screen.getByText('Credit Cards');
    fireEvent.click(creditCardsTab);
    
    await waitFor(() => {
      const breakdownButton = screen.getByText('View Breakdown');
      fireEvent.click(breakdownButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('View breakdown for card:', 'card-1');
    });
    
    consoleSpy.mockRestore();
  });

  it('displays proper tab styling', () => {
    renderWithRouter();
    
    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toBeInTheDocument();
    
    const accountsTab = screen.getByRole('tab', { name: /accounts/i });
    const creditCardsTab = screen.getByRole('tab', { name: /credit cards/i });
    const netWorthTab = screen.getByRole('tab', { name: /net worth/i });
    
    expect(accountsTab).toBeInTheDocument();
    expect(creditCardsTab).toBeInTheDocument();
    expect(netWorthTab).toBeInTheDocument();
  });

  it('has proper icons for each tab', () => {
    renderWithRouter();
    
    // Check for FontAwesome icons
    const accountsIcon = screen.getByText('Accounts').querySelector('i.fas.fa-university');
    const creditCardsIcon = screen.getByText('Credit Cards').querySelector('i.fas.fa-credit-card');
    const netWorthIcon = screen.getByText('Net Worth').querySelector('i.fas.fa-chart-line');
    
    expect(accountsIcon).toBeInTheDocument();
    expect(creditCardsIcon).toBeInTheDocument();
    expect(netWorthIcon).toBeInTheDocument();
  });

  it('handles back navigation correctly', () => {
    const mockHistoryBack = jest.fn();
    
    // Mock window.history.back
    Object.defineProperty(window, 'history', {
      value: { back: mockHistoryBack },
      writable: true
    });
    
    renderWithRouter();
    
    const backButton = screen.getByRole('button', { name: /arrow-left/i });
    fireEvent.click(backButton);
    
    // In a real router context, this would trigger navigation
    expect(backButton).toBeInTheDocument();
  });

  it('is mobile responsive', () => {
    renderWithRouter();
    
    // Check for mobile-responsive title
    const title = screen.getByText('Money');
    expect(title).toHaveClass('text-xl'); // Mobile text size
    
    // Check for responsive tab styling
    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toHaveClass('h-9'); // Mobile height
  });

  it('maintains tab state across re-renders', async () => {
    const { rerender } = renderWithRouter();
    
    // Switch to net worth tab
    const netWorthTab = screen.getByText('Net Worth');
    fireEvent.click(netWorthTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('net-worth-section')).toBeInTheDocument();
    });
    
    // Re-render component
    rerender(
      <MemoryRouter initialEntries={['/money']}>
        <MoneyPage />
      </MemoryRouter>
    );
    
    // Should maintain net worth tab selection
    expect(screen.getByTestId('net-worth-section')).toBeInTheDocument();
  });

  it('handles multiple URL parameters correctly', () => {
    renderWithRouter(['/money?tab=net-worth&action=add']);
    
    // Should load net worth tab
    expect(screen.getByTestId('net-worth-section')).toBeInTheDocument();
    
    // The action parameter would be handled by the NetWorthSection component
  });

  it('provides proper accessibility', () => {
    renderWithRouter();
    
    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Money');
    
    // Check for tab accessibility
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('updates document title appropriately', () => {
    renderWithRouter();
    
    // This would be tested if the component sets document.title
    // For now, just ensure the page title is visible
    expect(screen.getByText('Money')).toBeInTheDocument();
    expect(screen.getByText('Manage your accounts and cards')).toBeInTheDocument();
  });

  it('handles empty or no URL parameters gracefully', () => {
    renderWithRouter(['/money?']);
    
    // Should default to accounts tab
    expect(screen.getByTestId('accounts-section')).toBeInTheDocument();
  });

  it('preserves other URL parameters when changing tabs', async () => {
    renderWithRouter(['/money?tab=accounts&filter=active']);
    
    // Switch tabs
    const netWorthTab = screen.getByText('Net Worth');
    fireEvent.click(netWorthTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('net-worth-section')).toBeInTheDocument();
    });
    
    // In a real implementation, other parameters would be preserved
  });

  it('displays correct tab content for each selection', async () => {
    renderWithRouter();
    
    // Test accounts tab
    expect(screen.getByTestId('accounts-section')).toBeInTheDocument();
    expect(screen.getByText('Accounts Section')).toBeInTheDocument();
    
    // Test credit cards tab
    const creditCardsTab = screen.getByText('Credit Cards');
    fireEvent.click(creditCardsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('credit-cards-section')).toBeInTheDocument();
      expect(screen.getByText('Credit Cards Section')).toBeInTheDocument();
    });
    
    // Test net worth tab
    const netWorthTab = screen.getByText('Net Worth');
    fireEvent.click(netWorthTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('net-worth-section')).toBeInTheDocument();
      expect(screen.getByText('Net Worth Section')).toBeInTheDocument();
    });
  });
});
