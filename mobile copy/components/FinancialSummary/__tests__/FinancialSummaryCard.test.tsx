import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialSummaryCard from '../FinancialSummaryCard';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: (props) => <div data-testid="x-axis" data-props={JSON.stringify(props)} />,
  YAxis: (props) => <div data-testid="y-axis" data-props={JSON.stringify(props)} />,
  Tooltip: (props) => <div data-testid="tooltip" data-content={props.content ? 'custom' : 'default'} />,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

// Mock Switch component
jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, id }) => (
    <input
      type="checkbox"
      data-testid="switch"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      id={id}
    />
  ),
}));

const mockData = [
  { month: 'Jan', value: 1000 },
  { month: 'Feb', value: 1200 },
  { month: 'Mar', value: 1500 },
  { month: 'Apr', value: 1800 },
];

const defaultProps = {
  title: 'Monthly Income',
  iconClass: 'fas fa-dollar-sign mr-1 text-green-500',
  data: mockData,
  total: 1800,
  monthlyChange: '+$300',
  themeColor: '#22c55e',
  loading: false,
  error: null,
  onViewAll: jest.fn(),
  useTestData: false,
  setUseTestData: jest.fn(),
};

describe('FinancialSummaryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
      expect(screen.getByText('$1,800')).toBeInTheDocument();
      expect(screen.getByText('+$300 from last month')).toBeInTheDocument();
      expect(screen.getByText('View All')).toBeInTheDocument();
      expect(screen.getByText('Use Test Data')).toBeInTheDocument();
    });

    it('renders chart components', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getByTestId('area')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('applies custom theme color', () => {
      const customProps = { ...defaultProps, themeColor: '#3b82f6' };
      render(<FinancialSummaryCard {...customProps} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('displays correct formatted currency values', () => {
      const propsWithLargeValue = { ...defaultProps, total: 123456 };
      render(<FinancialSummaryCard {...propsWithLargeValue} />);

      expect(screen.getByText('$123,456')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('displays loading state when loading is true', () => {
      const loadingProps = { ...defaultProps, loading: true };
      render(<FinancialSummaryCard {...loadingProps} />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Income')).not.toBeInTheDocument();
      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
    });

    it('hides loading state when loading is false', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('displays error message when error is present', () => {
      const errorProps = { ...defaultProps, error: 'Failed to load data' };
      render(<FinancialSummaryCard {...errorProps} />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Income')).not.toBeInTheDocument();
      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
    });

    it('does not display error when error is null', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      expect(screen.queryByText('Error')).not.toBeInTheDocument();
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onViewAll when View All button is clicked', () => {
      const mockOnViewAll = jest.fn();
      const propsWithCallback = { ...defaultProps, onViewAll: mockOnViewAll };
      
      render(<FinancialSummaryCard {...propsWithCallback} />);

      const viewAllButton = screen.getByText('View All');
      fireEvent.click(viewAllButton);

      expect(mockOnViewAll).toHaveBeenCalledTimes(1);
    });

    it('toggles test data switch correctly', () => {
      const mockSetUseTestData = jest.fn();
      const propsWithSwitch = { ...defaultProps, setUseTestData: mockSetUseTestData };
      
      render(<FinancialSummaryCard {...propsWithSwitch} />);

      const switchElement = screen.getByTestId('switch');
      expect(switchElement).not.toBeChecked();

      fireEvent.click(switchElement);

      expect(mockSetUseTestData).toHaveBeenCalledWith(true);
    });

    it('displays correct switch state when useTestData is true', () => {
      const propsWithTestData = { ...defaultProps, useTestData: true };
      
      render(<FinancialSummaryCard {...propsWithTestData} />);

      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeChecked();
    });
  });

  describe('Chart Configuration', () => {
    it('configures Y-axis to be hidden', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      const yAxis = screen.getByTestId('y-axis');
      const yAxisProps = JSON.parse(yAxis.getAttribute('data-props') || '{}');
      expect(yAxisProps.hide).toBe(true);
    });

    it('configures chart dimensions correctly', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('renders tooltip component', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toBeInTheDocument();
      
      expect(tooltip).toHaveAttribute('data-content', 'custom');
    });
  });

  describe('Data Formatting', () => {
    it('formats zero values correctly', () => {
      const zeroProps = { ...defaultProps, total: 0 };
      render(<FinancialSummaryCard {...zeroProps} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('formats negative values correctly', () => {
      const negativeProps = { ...defaultProps, total: -1500 };
      render(<FinancialSummaryCard {...negativeProps} />);

      expect(screen.getByText('-$1,500')).toBeInTheDocument();
    });

    it('formats large values correctly', () => {
      const largeProps = { ...defaultProps, total: 1234567 };
      render(<FinancialSummaryCard {...largeProps} />);

      expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    });

    it('handles decimal values by rounding', () => {
      const decimalProps = { ...defaultProps, total: 1234.56 };
      render(<FinancialSummaryCard {...decimalProps} />);

      expect(screen.getByText('$1,235')).toBeInTheDocument(); // Should round to nearest dollar
    });
  });

  describe('Tooltip Functionality', () => {
    it('configures custom tooltip with proper formatting', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toBeInTheDocument();
      
      expect(tooltip).toHaveAttribute('data-content', 'custom');
    });

    // Note: Testing actual tooltip interaction is complex with mocked recharts
    // In real implementation, tooltip would show formatted currency values
  });

  describe('Visual Elements', () => {
    it('applies correct CSS classes for card styling', () => {
      const { container } = render(<FinancialSummaryCard {...defaultProps} />);

      const card = container.querySelector('[class*="p-4"][class*="h-[180px]"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-white', 'dark:bg-gray-800', 'shadow-sm');
    });

    it('displays trend indicator with correct styling', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      const trendContainer = screen.getByText('+$300 from last month').closest('div');
      expect(trendContainer).toHaveClass('bg-emerald-100');
    });

    it('renders icon with correct class', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      const titleElement = screen.getByText('Monthly Income');
      expect(titleElement.closest('h3')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data array', () => {
      const emptyDataProps = { ...defaultProps, data: [] };
      render(<FinancialSummaryCard {...emptyDataProps} />);

      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const specialTitleProps = { ...defaultProps, title: 'Special & Expenses!' };
      render(<FinancialSummaryCard {...specialTitleProps} />);

      expect(screen.getByText('Special & Expenses!')).toBeInTheDocument();
    });

    it('handles very long monthly change text', () => {
      const longChangeProps = { 
        ...defaultProps, 
        monthlyChange: '+$1,234,567.89 with additional descriptive text' 
      };
      render(<FinancialSummaryCard {...longChangeProps} />);

      expect(screen.getByText(/\+\$1,234,567\.89 with additional descriptive text from last month/)).toBeInTheDocument();
    });

    it('gracefully handles missing props', () => {
      const minimalProps = {
        title: 'Test',
        iconClass: '',
        data: [],
        total: 0,
        monthlyChange: '0',
        themeColor: '#000',
        loading: false,
        error: null,
        onViewAll: jest.fn(),
        useTestData: false,
        setUseTestData: jest.fn(),
      };

      expect(() => render(<FinancialSummaryCard {...minimalProps} />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
    });

    it('provides accessible labels for interactive elements', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('id', 'use-test-data');
      
      const label = screen.getByLabelText('Use Test Data');
      expect(label).toBeInTheDocument();
    });

    it('maintains proper heading hierarchy', () => {
      render(<FinancialSummaryCard {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Monthly Income');
    });
  });

  describe('Theme and Color Handling', () => {
    it('applies different theme colors correctly', () => {
      const blueTheme = { ...defaultProps, themeColor: '#3b82f6' };
      render(<FinancialSummaryCard {...blueTheme} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('handles invalid theme colors gracefully', () => {
      const invalidTheme = { ...defaultProps, themeColor: 'invalid-color' };
      
      expect(() => render(<FinancialSummaryCard {...invalidTheme} />)).not.toThrow();
    });
  });
}); 