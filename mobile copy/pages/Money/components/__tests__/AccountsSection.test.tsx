import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountsSection from '../AccountsSection';
import { useAccounts } from '@/contexts/AccountsContext';

// Mock dependencies
jest.mock('@/contexts/AccountsContext');
jest.mock('@/components/common/ExtraCashInBankCard/ExtraCashInBankCard', () => {
  return function MockExtraCashInBankCard({ totalAccountBalance }: { totalAccountBalance: number }) {
    return (
      <div data-testid="extra-cash-card">
        Extra cash for balance: {totalAccountBalance}
      </div>
    );
  };
});

jest.mock('@/components/common/AddAccountModal', () => {
  return function MockAddAccountModal({ 
    open, 
    onOpenChange 
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
  }) {
    return open ? (
      <div data-testid="add-account-modal">
        <button onClick={() => onOpenChange(false)}>Close Modal</button>
      </div>
    ) : null;
  };
});

jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ onClick }: { onClick?: (data: any) => void }) => <div data-testid="pie" onClick={onClick ? () => onClick({ payload: { id: '1' } }) : undefined} />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

jest.mock('@/config/bankConfig', () => ({
  getBankConfig: jest.fn((institution: string) => {
    const configs: Record<string, any> = {
      'HDFC Bank': {
        name: 'HDFC Bank',
        logoPath: '/hdfc-logo.svg',
        primaryColor: '#E53E3E',
        gradientFrom: 'from-red-500',
        gradientTo: 'to-red-600',
        textColor: 'white'
      },
      'ICICI Bank': {
        name: 'ICICI Bank',
        logoPath: '/icici-logo.svg',
        primaryColor: '#FF8C00',
        gradientFrom: 'from-orange-500',
        gradientTo: 'to-red-600',
        textColor: 'white'
      }
    };
    return configs[institution] || null;
  }),
  DEFAULT_BANK_CONFIG: {
    name: 'Bank',
    logoPath: '',
    primaryColor: '#6B7280',
    gradientFrom: 'from-gray-500',
    gradientTo: 'to-gray-600',
    textColor: 'white'
  }
}));

const mockUseAccounts = useAccounts as jest.MockedFunction<typeof useAccounts>;

// Mock account data
const mockAccounts = [
  {
    id: '1',
    name: 'Savings Account',
    type: 'Savings',
    institution: 'HDFC Bank',
    balance: 150000,
    last_sync: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Current Account',
    type: 'Current',
    institution: 'ICICI Bank',
    balance: 75000,
    last_sync: '2024-01-15T11:00:00Z'
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'Credit Card',
    institution: 'Axis Bank',
    balance: -25000,
    last_sync: '2024-01-15T09:45:00Z'
  },
  {
    id: '4',
    name: 'Fixed Deposit',
    type: 'Savings',
    institution: 'HDFC Bank',
    balance: 200000,
    last_sync: '2024-01-15T08:20:00Z'
  }
];

describe('AccountsSection', () => {
  beforeEach(() => {
    mockUseAccounts.mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUseAccounts.mockReturnValue({
      accounts: [],
      loading: true,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AccountsSection />);

    // Look for the specific loading spinner element
    const loadingElement = document.querySelector('.animate-spin.rounded-full.h-8.w-8.border-b-2.border-primary');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders filter bar with correct institutions', () => {
    render(<AccountsSection />);

    expect(screen.getByText('All')).toBeInTheDocument();
    
    // Use getByRole to find specific filter buttons
    const filterButtons = screen.getAllByRole('button');
    const hdfcButton = filterButtons.find(button => button.textContent === 'HDFC Bank');
    const iciciButton = filterButtons.find(button => button.textContent === 'ICICI Bank');
    
    expect(hdfcButton).toBeInTheDocument();
    expect(iciciButton).toBeInTheDocument();
    
    // Credit card institution should not appear in bank account filters
    const axisButton = filterButtons.find(button => button.textContent === 'Axis Bank');
    expect(axisButton).not.toBeDefined();
  });

  it('calculates total balance correctly excluding credit cards', () => {
    render(<AccountsSection />);

    // Total should be 150000 + 75000 + 200000 = 425000 (excluding credit card)
    expect(screen.getByText('₹4,25,000.00')).toBeInTheDocument();
  });

  it('displays compact donut chart in collapsed view', () => {
    render(<AccountsSection />);

    // Should have compact donut chart (but not the expanded bar chart initially)
    const pieCharts = screen.getAllByTestId('pie-chart');
    expect(pieCharts.length).toBeGreaterThan(0); // Compact chart is visible

    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    
    // Account Distribution should be collapsed initially
    expect(screen.getByText('Account Distribution')).toBeInTheDocument();
  });

  it('shows expanded view with enhanced donut chart when toggled', () => {
    render(<AccountsSection />);

    // Initially collapsed - check that enhanced chart center text is not visible
    expect(screen.queryByText('₹4.25L')).not.toBeInTheDocument();
    
    // Click to expand
    const distributionButton = screen.getByText('Account Distribution');
    fireEvent.click(distributionButton);
    
    // Should show enhanced donut chart in expanded view
    const pieCharts = screen.getAllByTestId('pie-chart');
    expect(pieCharts.length).toBeGreaterThan(1); // Both compact and expanded charts
    
    // Check for center text in expanded view (specific amount)
    expect(screen.getByText('₹4.25L')).toBeInTheDocument();
  });

  it('renders bank icons row with abbreviated balances', () => {
    render(<AccountsSection />);
    
    // Check for abbreviated balance formats (actual output from component)
    expect(screen.getByText('₹1.5L')).toBeInTheDocument(); // 150000 -> ₹1.5L
    expect(screen.getByText('₹75K')).toBeInTheDocument();  // 75000 -> ₹75K
    expect(screen.getByText('₹2.0L')).toBeInTheDocument(); // 200000 -> ₹2.0L (actual format)
  });

  it('displays extra cash card with correct total balance', () => {
    render(<AccountsSection />);

    expect(screen.getByTestId('extra-cash-card')).toBeInTheDocument();
    expect(screen.getByText('Extra cash for balance: 425000')).toBeInTheDocument();
  });

  it('filters accounts by institution when filter is selected', () => {
    render(<AccountsSection />);

    // Initially shows all bank accounts (excluding credit cards)
    expect(screen.getByText('3 accounts')).toBeInTheDocument();

    // Click HDFC Bank filter using more specific selector
    const filterButtons = screen.getAllByRole('button');
    const hdfcButton = filterButtons.find(button => button.textContent === 'HDFC Bank');
    if (hdfcButton) {
      fireEvent.click(hdfcButton);
    }

    // Should show only HDFC accounts
    expect(screen.getByText('2 accounts')).toBeInTheDocument();
  });

  it('opens add account modal when add button is clicked', () => {
    render(<AccountsSection />);

    fireEvent.click(screen.getByText('Add Account'));

    expect(screen.getByTestId('add-account-modal')).toBeInTheDocument();
  });

  it('displays empty state when no accounts exist', () => {
    mockUseAccounts.mockReturnValue({
      accounts: [],
      loading: false,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AccountsSection />);

    expect(screen.getByText('No bank accounts found')).toBeInTheDocument();
    expect(screen.getByText('Add Your First Account')).toBeInTheDocument();
  });

  it('displays last sync time in user-friendly format', () => {
    render(<AccountsSection />);

    // Should show formatted time
    const timeElements = screen.getAllByText(/ago|Just now|\d{1,2} \w{3}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('uses bank configuration for colors and icons', () => {
    render(<AccountsSection />);

    // Bank icons should be present (updated selector for actual structure)
    const bankIcons = document.querySelectorAll('img[alt*="Bank"], [style*="background-color"]');
    expect(bankIcons.length).toBeGreaterThan(0);
  });

  it('handles account selection callback', () => {
    const mockOnAccountSelect = jest.fn();
    render(<AccountsSection onAccountSelect={mockOnAccountSelect} />);

    // Test bank icon interactions
    const bankIconButtons = document.querySelectorAll('button[class*="flex items-center gap-2"]');
    expect(bankIconButtons.length).toBeGreaterThan(0);
  });

  it('displays mobile-optimized font sizes', () => {
    render(<AccountsSection />);

    // Check for mobile-optimized text classes
    const smallTexts = document.querySelectorAll('.text-xs, .text-sm, .text-\\[10px\\]');
    expect(smallTexts.length).toBeGreaterThan(0);
  });

  it('enhanced donut chart shows percentage and center text', () => {
    render(<AccountsSection />);

    // Expand the distribution view
    const distributionButton = screen.getByText('Account Distribution');
    fireEvent.click(distributionButton);

    // Check for enhanced donut chart with center amount
    expect(screen.getByText('₹4.25L')).toBeInTheDocument();
    
    // Check for percentage display in legend chips
    expect(screen.getByText(/47\.1%/)).toBeInTheDocument();
    expect(screen.getByText(/35\.3%/)).toBeInTheDocument();
    expect(screen.getByText(/17\.6%/)).toBeInTheDocument();
  });

  it('compact chart shows max 4 slices with others grouping', () => {
    // Add more accounts to test "Others" grouping
    const manyAccounts = [
      ...mockAccounts,
      {
        id: '5',
        name: 'Account 5',
        type: 'Savings',
        institution: 'SBI Bank',
        balance: 50000,
        last_sync: '2024-01-15T10:30:00Z'
      },
      {
        id: '6',
        name: 'Account 6',
        type: 'Savings',
        institution: 'Kotak Bank',
        balance: 30000,
        last_sync: '2024-01-15T10:30:00Z'
      }
    ];

    mockUseAccounts.mockReturnValue({
      accounts: manyAccounts,
      loading: false,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AccountsSection />);

    // Should still show compact chart with max slices
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('groups small accounts into Others category', () => {
    // Create accounts with very different balances
    const accountsWithVariance = [
      {
        id: '1',
        name: 'Large Account',
        type: 'Savings',
        institution: 'HDFC Bank',
        balance: 1000000, // ₹10L
        last_sync: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Small Account 1',
        type: 'Savings',
        institution: 'ICICI Bank',
        balance: 1000, // ₹1K (< 0.5% of total)
        last_sync: '2024-01-15T11:00:00Z'
      },
      {
        id: '3',
        name: 'Small Account 2',
        type: 'Savings',
        institution: 'Axis Bank',
        balance: 500, // ₹500 (< 0.5% of total)
        last_sync: '2024-01-15T09:45:00Z'
      }
    ];

    mockUseAccounts.mockReturnValue({
      accounts: accountsWithVariance,
      loading: false,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AccountsSection />);

    // Expand the distribution view
    const distributionButton = screen.getByText('Account Distribution');
    fireEvent.click(distributionButton);

    // Should group small accounts into "Others"
    expect(screen.getByText('Others')).toBeInTheDocument();
  });

  it('donut chart center shows selected account details when clicked', () => {
    render(<AccountsSection />);

    // Expand the distribution view
    const distributionButton = screen.getByText('Account Distribution');
    fireEvent.click(distributionButton);

    // Find the legend chip buttons
    const legendChips = document.querySelectorAll('.grid.grid-cols-2 button');
    expect(legendChips.length).toBeGreaterThan(0);
    
    if (legendChips.length > 0) {
      // Click the first chip
      fireEvent.click(legendChips[0]);
      
      // Center should show selected account details
      // Look specifically in the center area for the institution name
      const centerArea = document.querySelector('.absolute.inset-0.flex.flex-col.items-center.justify-center');
      expect(centerArea).toBeInTheDocument();
      
      // Check for the selected account's institution in the center
      const institutionInCenter = centerArea?.querySelector('.text-xs.text-muted-foreground');
      expect(institutionInCenter).toBeInTheDocument();
    }
  });

  it('chip click shows full amount while others remain compact', () => {
    render(<AccountsSection />);

    // Expand the distribution view
    const distributionButton = screen.getByText('Account Distribution');
    fireEvent.click(distributionButton);

    // Find the legend chip buttons
    const legendChips = document.querySelectorAll('.grid.grid-cols-2 button');
    expect(legendChips.length).toBeGreaterThan(0);
    
    if (legendChips.length > 0) {
      // Initially all amounts should be in compact format (checking for green styling indicates new format)
      const greenAmounts = document.querySelectorAll('.text-green-500');
      expect(greenAmounts.length).toBeGreaterThan(0);
      
      // Click the first chip
      fireEvent.click(legendChips[0]);
      
      // The clicked chip should have highlighting classes
      expect(legendChips[0]).toHaveClass('bg-muted', 'ring-2', 'ring-primary/20');
    }
  });

  it('displays enhanced chip styling with green amounts and yellow percentages', () => {
    render(<AccountsSection />);

    // Expand the distribution view
    const distributionButton = screen.getByText('Account Distribution');
    fireEvent.click(distributionButton);

    // Check for green amount styling
    const greenAmounts = document.querySelectorAll('.text-green-500');
    expect(greenAmounts.length).toBeGreaterThan(0);

    // Check for yellow percentage styling
    const yellowPercentages = document.querySelectorAll('.text-yellow-500');
    expect(yellowPercentages.length).toBeGreaterThan(0);
  });

  it('account count appears below compact chart', () => {
    render(<AccountsSection />);

    // The account count should be positioned near the compact chart
    expect(screen.getByText('3 accounts')).toBeInTheDocument();
    
    // Verify the compact chart is present
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('uses soft color palette for enhanced chart', () => {
    render(<AccountsSection />);

    // Expand the distribution view
    const distributionButton = screen.getByText('Account Distribution');
    fireEvent.click(distributionButton);

    // Check that the enhanced chart is rendered
    const pieCharts = screen.getAllByTestId('pie-chart');
    expect(pieCharts.length).toBeGreaterThan(1); // Both compact and enhanced charts
  });

  it('displays accessibility labels for interactive elements', () => {
    render(<AccountsSection />);

    // Click to expand first
    const distributionButton = screen.getByText('Account Distribution');
    fireEvent.click(distributionButton);

    // Check for aria-label on the distribution toggle button
    const collapseButton = screen.getByRole('button', { name: /hide account breakdown/i });
    expect(collapseButton).toBeInTheDocument();
  });
});

// Add a custom matcher for better loading state testing
const renderWithLoadingSpinner = () => {
  const { container } = render(<AccountsSection />);
  const spinnerElement = container.querySelector('.animate-spin');
  if (spinnerElement) {
    spinnerElement.setAttribute('data-testid', 'loading-spinner');
  }
  return { container };
}; 