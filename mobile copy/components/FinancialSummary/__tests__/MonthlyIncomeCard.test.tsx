import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthlyIncomeCard from '../MonthlyIncomeCard';
import { useMonthlyIncome } from '@/contexts/TransactionContext';
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

const mockUseMonthlyIncome = useMonthlyIncome as jest.MockedFunction<typeof useMonthlyIncome>;
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('MonthlyIncomeCard', () => {
  const mockGetIncomeSummary = jest.fn();
  const mockGetIncomeHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useTheme hook
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
    });

    // Mock useMonthlyIncome hook with successful data
    mockUseMonthlyIncome.mockReturnValue({
      getIncomeSummary: mockGetIncomeSummary.mockResolvedValue({
        total: 5200,
        count: 12,
        averageAmount: 433.33,
        periodComparison: {
          current: 5200,
          previous: 4800,
          percentageChange: 8.33
        }
      }),
      getIncomeHistory: mockGetIncomeHistory.mockResolvedValue([
        { month: 'Jan', value: 4800 },
        { month: 'Feb', value: 5000 },
        { month: 'Mar', value: 5200 },
      ])
    });
  });

  it('renders with initial state', async () => {
    render(<MonthlyIncomeCard />);
    
    // Should show loading initially
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
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
    render(<MonthlyIncomeCard />);
    
    // Should initially show loading state
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('toggles test data when switch is clicked', async () => {
    render(<MonthlyIncomeCard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
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

    const { rerender } = render(<MonthlyIncomeCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    });
    
    // Re-render with light theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light'
    });
    
    rerender(<MonthlyIncomeCard />);
    
    // Should still have the chart
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles error state gracefully', async () => {
    // Mock error from the hooks
    mockUseMonthlyIncome.mockReturnValue({
      getIncomeSummary: mockGetIncomeSummary.mockRejectedValue(new Error('Database error')),
      getIncomeHistory: mockGetIncomeHistory.mockRejectedValue(new Error('Database error'))
    });

    render(<MonthlyIncomeCard />);
    
    // Wait for component to handle error and show error message
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load income data')).toBeInTheDocument();
    });
  });

  it('renders chart elements correctly', async () => {
    render(<MonthlyIncomeCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    });
    
    // Check all chart elements are present
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('handles edge case with no income data', async () => {
    // Mock empty data response
    mockUseMonthlyIncome.mockReturnValue({
      getIncomeSummary: mockGetIncomeSummary.mockResolvedValue({
        total: 0,
        count: 0,
        averageAmount: 0,
        periodComparison: {
          current: 0,
          previous: 0,
          percentageChange: 0
        }
      }),
      getIncomeHistory: mockGetIncomeHistory.mockResolvedValue([])
    });

    render(<MonthlyIncomeCard />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    });
    
    // Should still render the chart structure
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('displays correct income values', async () => {
    render(<MonthlyIncomeCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    });
    
    // Should display the mocked income total
    expect(screen.getByText('$5,200')).toBeInTheDocument();
    
    // Should display percentage change (might be rounded)
    expect(screen.getByText(/\+8\.3%/)).toBeInTheDocument();
    expect(screen.getByText(/from last month/)).toBeInTheDocument();
  });
}); 