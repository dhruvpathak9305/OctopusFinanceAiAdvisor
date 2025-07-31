import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthlyExpenseCard from '../MonthlyExpenseCard';
import { useMonthlyExpenses } from '@/contexts/TransactionContext';
import { useTheme } from '@/common/providers/ThemeProvider';

// Mock the dependencies
jest.mock('@/contexts/TransactionContext');
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

const mockUseMonthlyExpenses = useMonthlyExpenses as jest.MockedFunction<typeof useMonthlyExpenses>;
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('MonthlyExpenseCard', () => {
  const mockGetExpenseSummary = jest.fn();
  const mockGetExpenseHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useTheme hook
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
    });

    // Mock useMonthlyExpenses hook with successful data
    mockUseMonthlyExpenses.mockReturnValue({
      getExpenseSummary: mockGetExpenseSummary.mockResolvedValue({
        total: 3450,
        count: 25,
        averageAmount: 138,
        periodComparison: {
          current: 3450,
          previous: 3250,
          percentageChange: 6.15
        }
      }),
      getExpenseHistory: mockGetExpenseHistory.mockResolvedValue([
        { month: 'Jan', value: 3200 },
        { month: 'Feb', value: 3400 },
        { month: 'Mar', value: 3450 },
      ])
    });
  });

  it('renders with initial state', async () => {
    render(<MonthlyExpenseCard />);
    
    // Should show loading initially
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    });
    
    // Check for UI elements
    expect(screen.getByText('Use Test Data')).toBeInTheDocument();
    
    // Check that the chart is rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    render(<MonthlyExpenseCard />);
    
    // Should initially show loading state
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('toggles test data when switch is clicked', async () => {
    render(<MonthlyExpenseCard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
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

    const { rerender } = render(<MonthlyExpenseCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    });
    
    // Re-render with light theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light'
    });
    
    rerender(<MonthlyExpenseCard />);
    
    // Should still have the chart
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles error state gracefully', async () => {
    // Mock error from the hooks
    mockUseMonthlyExpenses.mockReturnValue({
      getExpenseSummary: mockGetExpenseSummary.mockRejectedValue(new Error('Database error')),
      getExpenseHistory: mockGetExpenseHistory.mockRejectedValue(new Error('Database error'))
    });

    render(<MonthlyExpenseCard />);
    
    // Wait for component to handle error and show error message
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load expense data')).toBeInTheDocument();
    });
  });

  it('renders chart elements correctly', async () => {
    render(<MonthlyExpenseCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    });
    
    // Check all chart elements are present
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('handles edge case with no expense data', async () => {
    // Mock empty data response
    mockUseMonthlyExpenses.mockReturnValue({
      getExpenseSummary: mockGetExpenseSummary.mockResolvedValue({
        total: 0,
        count: 0,
        averageAmount: 0,
        periodComparison: {
          current: 0,
          previous: 0,
          percentageChange: 0
        }
      }),
      getExpenseHistory: mockGetExpenseHistory.mockResolvedValue([])
    });

    render(<MonthlyExpenseCard />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    });
    
    // Should still render the chart structure
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('displays correct expense values', async () => {
    render(<MonthlyExpenseCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    });
    
    // Should display the mocked expense total
    expect(screen.getByText('$3,450')).toBeInTheDocument();
    
    // Should display percentage change (text is split across elements)
    expect(screen.getByText(/\+6\.2%/)).toBeInTheDocument();
    expect(screen.getByText(/from last month/)).toBeInTheDocument();
  });
}); 