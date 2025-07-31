import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendsSection from '../TrendsSection';

// Mock the custom hook
jest.mock('@/hooks/useTrendData', () => ({
  useTrendData: jest.fn(() => ({
    loading: false,
    error: null,
    getDataForTab: jest.fn((tab: string) => ({
      chartData: [
        { date: '2024-06-01', value: 1000, budget: 3000 },
        { date: '2024-06-02', value: 1500, budget: 3000 },
        { date: '2024-06-03', value: 2000, budget: 3000 },
      ],
      summaryData: {
        currentSpend: 30000,
        budget: tab === 'spend' ? 50000 : undefined,
        lastMonthSpend: 25000,
        percentageChange: 20.0,
      },
    })),
  })),
}));

// Mock ErrorBoundary
jest.mock('@/components/common/ErrorBoundary', () => {
  return function MockErrorBoundary({ children, fallback, onError, ...props }: any) {
    return (
      <div data-testid="error-boundary" {...props}>
        {children}
      </div>
    );
  };
});

// Mock sub-components
jest.mock('../TrendsTabs', () => {
  return function MockTrendsTabs({ activeTab, onTabChange }: any) {
    return (
      <div data-testid="trends-tabs">
        <button onClick={() => onTabChange('spend')} data-testid="tab-spend">
          Spend {activeTab === 'spend' && '(active)'}
        </button>
        <button onClick={() => onTabChange('invested')} data-testid="tab-invested">
          Invested {activeTab === 'invested' && '(active)'}
        </button>
        <button onClick={() => onTabChange('income')} data-testid="tab-income">
          Income {activeTab === 'income' && '(active)'}
        </button>
      </div>
    );
  };
});

jest.mock('../MonthSelector', () => {
  return function MockMonthSelector({ currentMonth, onMonthChange }: any) {
    return (
      <div data-testid="month-selector">
        <button onClick={() => onMonthChange(new Date(2024, 4, 1))} data-testid="prev-month">
          Previous
        </button>
        <span data-testid="current-month">{currentMonth.toLocaleDateString()}</span>
        <button onClick={() => onMonthChange(new Date(2024, 6, 1))} data-testid="next-month">
          Next
        </button>
      </div>
    );
  };
});

jest.mock('../SpendSummaryHeader', () => {
  return function MockSpendSummaryHeader({ data, onBudgetEdit }: any) {
    return (
      <div data-testid="spend-summary-header">
        <span data-testid="current-spend">₹{data.currentSpend}</span>
        {data.budget && <span data-testid="budget">/ ₹{data.budget}</span>}
        {onBudgetEdit && (
          <button onClick={() => onBudgetEdit(60000)} data-testid="edit-budget">
            Edit Budget
          </button>
        )}
        <span data-testid="percentage-change">{data.percentageChange}%</span>
      </div>
    );
  };
});

jest.mock('../TrendChart', () => {
  return function MockTrendChart({ data, color, showBudgetLine, onPeriodChange }: any) {
    return (
      <div data-testid="trend-chart">
        <span data-testid="chart-color" style={{ color }}>Chart</span>
        <span data-testid="data-points">{data.length} points</span>
        {showBudgetLine && <span data-testid="budget-line">Budget Line</span>}
        {onPeriodChange && (
          <div data-testid="chart-period-toggle">
            <button onClick={() => onPeriodChange('daily')} data-testid="chart-daily-button">Daily</button>
            <button onClick={() => onPeriodChange('monthly')} data-testid="chart-monthly-button">Monthly</button>
          </div>
        )}
      </div>
    );
  };
});

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card" {...props}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">{children}</div>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('TrendsSection', () => {
  const mockUseTrendData = require('@/hooks/useTrendData').useTrendData;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all sub-components correctly', () => {
    render(<TrendsSection />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('trends-section')).toBeInTheDocument();
    expect(screen.getByTestId('month-selector')).toBeInTheDocument();
    expect(screen.getByTestId('trends-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('spend-summary-header')).toBeInTheDocument();
    expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
  });

  it('wraps content with ErrorBoundary', () => {
    render(<TrendsSection />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    mockUseTrendData.mockReturnValue({
      loading: true,
      error: null,
      getDataForTab: jest.fn(),
    });

    render(<TrendsSection />);

    expect(screen.getByTestId('trends-section')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('trends-tabs')).not.toBeInTheDocument();
  });

  it('shows error state correctly', () => {
    mockUseTrendData.mockReturnValue({
      loading: false,
      error: 'Failed to load data',
      getDataForTab: jest.fn(),
    });

    render(<TrendsSection />);

    expect(screen.getByTestId('trends-section')).toBeInTheDocument();
    expect(screen.getByText('Error loading trends data: Failed to load data')).toBeInTheDocument();
    expect(screen.queryByTestId('trends-tabs')).not.toBeInTheDocument();
  });

  it('handles tab switching correctly', () => {
    const mockGetDataForTab = jest.fn((tab: string) => ({
      chartData: [{ date: '2024-06-01', value: 1000 }],
      summaryData: {
        currentSpend: tab === 'spend' ? 30000 : 15000,
        budget: tab === 'spend' ? 50000 : undefined,
        lastMonthSpend: 25000,
        percentageChange: 20.0,
      },
    }));

    mockUseTrendData.mockReturnValue({
      loading: false,
      error: null,
      getDataForTab: mockGetDataForTab,
    });

    render(<TrendsSection />);

    // Initially on spend tab
    expect(screen.getByText('Spend (active)')).toBeInTheDocument();
    expect(mockGetDataForTab).toHaveBeenCalledWith('spend');

    // Switch to invested tab
    fireEvent.click(screen.getByTestId('tab-invested'));
    expect(mockGetDataForTab).toHaveBeenCalledWith('invested');
  });

  it('passes correct account filtering parameters to useTrendData', () => {
    render(
      <TrendsSection 
        selectedAccountId="123"
        selectedInstitution="HDFC Bank"
      />
    );

    expect(mockUseTrendData).toHaveBeenCalledWith(
      expect.any(Date), // currentMonth
      "123", // selectedAccountId
      "HDFC Bank", // selectedInstitution
      'daily' // period
    );
  });

  it('handles null selectedAccountId correctly', () => {
    render(
      <TrendsSection 
        selectedAccountId={null}
        selectedInstitution="All"
      />
    );

    expect(mockUseTrendData).toHaveBeenCalledWith(
      expect.any(Date),
      null,
      "All",
      'daily'
    );
  });

  it('shows budget edit functionality for spend tab only', () => {
    render(<TrendsSection />);

    // Should show edit budget button for spend tab
    expect(screen.getByTestId('edit-budget')).toBeInTheDocument();

    // Switch to invested tab
    fireEvent.click(screen.getByTestId('tab-invested'));
    
    // Should not show edit budget button for non-spend tabs
    expect(screen.queryByTestId('edit-budget')).not.toBeInTheDocument();
  });

  it('handles budget editing correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<TrendsSection />);

    const editButton = screen.getByTestId('edit-budget');
    fireEvent.click(editButton);

    expect(consoleSpy).toHaveBeenCalledWith('Budget updated:', 60000);
    
    consoleSpy.mockRestore();
  });

  it('applies correct colors for different tabs matching Add Transactions modal', () => {
    render(<TrendsSection />);

    // Initial tab is 'spend' with red color
    expect(screen.getByTestId('chart-color')).toHaveStyle('color: rgb(239, 68, 68)');

    // Switch to income tab - should be GREEN per Add Transactions modal
    fireEvent.click(screen.getByTestId('tab-income'));
    expect(screen.getByTestId('chart-color')).toHaveStyle('color: rgb(16, 185, 129)'); // Green for income

    // Switch to invested tab - should be BLUE per Add Transactions modal  
    fireEvent.click(screen.getByTestId('tab-invested'));
    expect(screen.getByTestId('chart-color')).toHaveStyle('color: rgb(59, 130, 246)'); // Blue for invest
  });

  it('shows budget line only for spend tab', () => {
    render(<TrendsSection />);

    // Should show budget line for spend tab
    expect(screen.getByTestId('budget-line')).toBeInTheDocument();

    // Switch to invested tab
    fireEvent.click(screen.getByTestId('tab-invested'));
    expect(screen.queryByTestId('budget-line')).not.toBeInTheDocument();

    // Switch to income tab
    fireEvent.click(screen.getByTestId('tab-income'));
    expect(screen.queryByTestId('budget-line')).not.toBeInTheDocument();
  });

  it('renders period toggle within chart component only', () => {
    render(<TrendsSection />);

    // Should have chart period toggle within the chart component
    expect(screen.getByTestId('chart-period-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('chart-daily-button')).toBeInTheDocument();
    expect(screen.getByTestId('chart-monthly-button')).toBeInTheDocument();
  });

  it('handles chart period toggle correctly', () => {
    render(<TrendsSection />);

    const dailyButton = screen.getByTestId('chart-daily-button');
    const monthlyButton = screen.getByTestId('chart-monthly-button');

    expect(dailyButton).toBeInTheDocument();
    expect(monthlyButton).toBeInTheDocument();

    // Test period switching
    fireEvent.click(monthlyButton);
    fireEvent.click(dailyButton);
  });

  it('applies custom className when provided', () => {
    render(<TrendsSection className="custom-class" />);

    const trendsSection = screen.getByTestId('trends-section');
    expect(trendsSection).toHaveClass('custom-class');
  });

  it('passes correct data to chart component', () => {
    const mockGetDataForTab = jest.fn(() => ({
      chartData: [{ date: '2024-06-01', value: 1000 }],
      summaryData: {
        currentSpend: 30000,
        budget: 50000,
        lastMonthSpend: 25000,
        percentageChange: 20.0,
      },
    }));

    mockUseTrendData.mockReturnValue({
      loading: false,
      error: null,
      getDataForTab: mockGetDataForTab,
    });

    render(<TrendsSection />);

    expect(screen.getByTestId('data-points')).toHaveTextContent('1 points');
  });

  it('renders components with proper container width classes', () => {
    render(<TrendsSection />);

    // Check that summary header and chart are wrapped in full-width containers
    const summaryContainer = screen.getByTestId('spend-summary-header').parentElement;
    const chartContainer = screen.getByTestId('trend-chart').parentElement;
    
    expect(summaryContainer).toHaveClass('w-full');
    expect(chartContainer).toHaveClass('w-full');
  });

  it('updates trend data when period changes', () => {
    render(<TrendsSection />);

    // Click monthly period button
    fireEvent.click(screen.getByTestId('chart-monthly-button'));

    // Should call useTrendData with 'monthly' period
    expect(mockUseTrendData).toHaveBeenLastCalledWith(
      expect.any(Date),
      null,
      "All",
      'monthly'
    );
  });

  it('updates trend data when account selection changes', () => {
    const { rerender } = render(<TrendsSection selectedAccountId={null} />);

    expect(mockUseTrendData).toHaveBeenCalledWith(
      expect.any(Date),
      null,
      "All",
      'daily'
    );

    // Change selected account
    rerender(<TrendsSection selectedAccountId="123" selectedInstitution="HDFC Bank" />);

    expect(mockUseTrendData).toHaveBeenLastCalledWith(
      expect.any(Date),
      "123",
      "HDFC Bank",
      'daily'
    );
  });
}); 