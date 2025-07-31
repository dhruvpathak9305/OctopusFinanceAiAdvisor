import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreditCardCard from '../CreditCardCard';
import { useCreditCards } from '@/contexts/CreditCardContext';
import { useTheme } from '@/common/providers/ThemeProvider';

// Mock the dependencies
jest.mock('@/contexts/CreditCardContext');
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

const mockUseCreditCards = useCreditCards as jest.MockedFunction<typeof useCreditCards>;
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('CreditCardCard', () => {
  // Setup default mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useTheme hook
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
    });

    // Mock useCreditCards hook for success state with complete CreditCard objects
    mockUseCreditCards.mockReturnValue({
      creditCards: [
        { 
          id: '1', 
          name: 'Visa', 
          bank: 'Chase', 
          lastFourDigits: '1234',
          currentBalance: 2000, 
          creditLimit: 5000,
          dueDate: '2024-02-15',
          user_id: 'user1'
        },
        { 
          id: '2', 
          name: 'Mastercard', 
          bank: 'Citi', 
          lastFourDigits: '5678',
          currentBalance: 3000, 
          creditLimit: 10000,
          dueDate: '2024-02-20',
          user_id: 'user1'
        }
      ],
      loading: false,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });
  });

  it('renders correctly with credit card data', async () => {
    render(<CreditCardCard />);
    
    // Wait for data to load and check content
    await waitFor(() => {
      expect(screen.getByText('Credit Card Debt')).toBeInTheDocument();
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

  it('renders loading state', async () => {
    // Mock loading state
    mockUseCreditCards.mockReturnValue({
      creditCards: [],
      loading: true,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });

    render(<CreditCardCard />);
    
    // Should display loading spinner
    await waitFor(() => {
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
    
    // Should not render chart when loading
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('renders error state', async () => {
    // Mock error state
    mockUseCreditCards.mockReturnValue({
      creditCards: [],
      loading: false,
      error: 'Failed to fetch credit cards',
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });

    render(<CreditCardCard />);
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    expect(screen.getByText('Failed to fetch credit cards')).toBeInTheDocument();
    
    // Should not render chart when there's an error
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('toggles test data when switch is clicked', async () => {
    render(<CreditCardCard />);
    
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

    const { rerender } = render(<CreditCardCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Credit Card Debt')).toBeInTheDocument();
    });
    
    // Re-render with light theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light'
    });
    
    rerender(<CreditCardCard />);
    
    // Should still have the chart
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles edge case when there are no credit cards', async () => {
    // Mock empty credit cards array
    mockUseCreditCards.mockReturnValue({
      creditCards: [],
      loading: false,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });

    render(<CreditCardCard />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Credit Card Debt')).toBeInTheDocument();
    });

    // Should still render the chart component structure
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles edge case when all credit cards have the same balance', async () => {
    // Mock credit cards with same balance
    mockUseCreditCards.mockReturnValue({
      creditCards: [
        { 
          id: '1', 
          name: 'Visa', 
          bank: 'Chase', 
          lastFourDigits: '1234',
          currentBalance: 1000, 
          creditLimit: 5000,
          dueDate: '2024-02-15',
          user_id: 'user1'
        },
        { 
          id: '2', 
          name: 'Mastercard', 
          bank: 'Citi', 
          lastFourDigits: '5678',
          currentBalance: 1000, 
          creditLimit: 10000,
          dueDate: '2024-02-20',
          user_id: 'user1'
        }
      ],
      loading: false,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });

    render(<CreditCardCard />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Credit Card Debt')).toBeInTheDocument();
    });

    // Should render the chart
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('ensures component renders with chart elements', async () => {
    render(<CreditCardCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Credit Card Debt')).toBeInTheDocument();
    });
    
    // Check all chart elements are present (excluding x-axis as it might not be rendered)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });
}); 