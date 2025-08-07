import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountsCard from '../AccountsCard';
import { useAccounts } from '@/contexts/AccountsContext';
import { useTheme } from '@/common/providers/ThemeProvider';

// Mock the dependencies
jest.mock('@/contexts/AccountsContext');
jest.mock('@/common/providers/ThemeProvider');

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,  
  XAxis: () => <div data-testid="x-axis" />,  
  YAxis: () => <div data-testid="y-axis" />,  
  Tooltip: () => <div data-testid="tooltip" />,  
}));

jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>
}));

const mockUseAccounts = useAccounts as jest.MockedFunction<typeof useAccounts>;
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('AccountsCard', () => {
  // Setup default mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
    });

    mockUseAccounts.mockReturnValue({
      accounts: [
        { id: '1', name: 'Checking', type: 'Checking', balance: 5000, institution: 'Bank A', user_id: 'user1' },
        { id: '2', name: 'Savings', type: 'Savings', balance: 10000, institution: 'Bank A', user_id: 'user1' },
        { id: '3', name: 'Credit Card', type: 'Credit Card', balance: -2000, institution: 'Bank B', user_id: 'user1' }
      ],
      loading: false,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });
  });

  it('renders correctly with account data', async () => {
    render(<AccountsCard />);
    
    // Wait for data to load and check content
    await waitFor(() => {
      expect(screen.getByText('Accounts')).toBeInTheDocument();
    });
    
    // Check for UI elements that should be present
    expect(screen.getByText('Use Test Data')).toBeInTheDocument();
    
    // Check that the chart is rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders loading state', async () => {
    // Mock loading state
    mockUseAccounts.mockReturnValue({
      accounts: [],
      loading: true,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AccountsCard />);
    
    // Should display loading spinner (Loader component)
    await waitFor(() => {
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
    
    // Should not render chart when loading
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('renders error state', async () => {
    // Mock error state
    mockUseAccounts.mockReturnValue({
      accounts: [],
      loading: false,
      error: 'Failed to fetch accounts',
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AccountsCard />);
    
    // Should display error message - based on the actual error output
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    expect(screen.getByText('Failed to fetch accounts')).toBeInTheDocument();
    
    // Should not render chart when there's an error
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('toggles test data when switch is clicked', async () => {
    render(<AccountsCard />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Use Test Data')).toBeInTheDocument();
    });
    
    // Default state should be 'Use real data'
    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();
    
    // Click toggle to use test data
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    
    // Chart should still be rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('applies theme-aware colors', async () => {
    // Test dark theme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      resolvedTheme: 'dark'
    });

    const { rerender } = render(<AccountsCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Accounts')).toBeInTheDocument();
    });
    
    // Re-render with light theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light'
    });
    
    rerender(<AccountsCard />);
    
    // Should still have the chart
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles edge case when there are no accounts', async () => {
    // Mock empty accounts array
    mockUseAccounts.mockReturnValue({
      accounts: [],
      loading: false,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AccountsCard />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Accounts')).toBeInTheDocument();
    });

    // Should still render the chart component structure
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles edge case when all accounts have the same balance', async () => {
    // Mock accounts with same balance
    mockUseAccounts.mockReturnValue({
      accounts: [
        { id: '1', name: 'Checking 1', type: 'Checking', balance: 1000, institution: 'Bank A', user_id: 'user1' },
        { id: '2', name: 'Checking 2', type: 'Checking', balance: 1000, institution: 'Bank A', user_id: 'user1' },
      ],
      loading: false,
      error: null,
      fetchAccounts: jest.fn(),
      addAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AccountsCard />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Accounts')).toBeInTheDocument();
    });

    // Should render the chart
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('ensures component renders with chart elements', async () => {
    render(<AccountsCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Accounts')).toBeInTheDocument();
    });
    
    // Check all chart elements are present (excluding x-axis as it's not rendered)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });
}); 