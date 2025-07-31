import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountChips from '../AccountChips';
import { AccountData } from '../hooks/useAccountSelection';

const mockChartData: AccountData[] = [
  {
    id: '1',
    name: 'Savings Account',
    accountName: 'Savings Account',
    value: 150000,
    percentage: 35.3,
    institution: 'HDFC Bank - Savings',
    color: '#FF8C42',
  },
  {
    id: '2',
    name: 'Current Account',
    accountName: 'Current Account',
    value: 75000,
    percentage: 17.6,
    institution: 'ICICI Bank',
    color: '#E74C3C',
  },
  {
    id: '3',
    name: 'Fixed Deposit',
    accountName: 'Fixed Deposit',
    value: 200000,
    percentage: 47.1,
    institution: 'SBI Bank',
    color: '#9B59B6',
  },
];

describe('AccountChips', () => {
  const mockOnAccountSelect = jest.fn();

  beforeEach(() => {
    mockOnAccountSelect.mockClear();
  });

  it('renders all account chips', () => {
    render(
      <AccountChips
        chartData={mockChartData}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    expect(screen.getByText('HDFC Bank - Savings')).toBeInTheDocument();
    expect(screen.getByText('ICICI Bank')).toBeInTheDocument();
    expect(screen.getByText('SBI Bank')).toBeInTheDocument();

    // Check for amounts in compact format
    expect(screen.getByText('₹1.5L')).toBeInTheDocument();
    expect(screen.getByText('₹75.0K')).toBeInTheDocument();
    expect(screen.getByText('₹2.0L')).toBeInTheDocument();

    // Check for percentages
    expect(screen.getByText('35.3%')).toBeInTheDocument();
    expect(screen.getByText('17.6%')).toBeInTheDocument();
    expect(screen.getByText('47.1%')).toBeInTheDocument();
  });

  it('calls onAccountSelect when chip is clicked', () => {
    render(
      <AccountChips
        chartData={mockChartData}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const hdfcChip = screen.getByText('HDFC Bank - Savings').closest('button');
    fireEvent.click(hdfcChip!);

    expect(mockOnAccountSelect).toHaveBeenCalledWith(mockChartData[0]);
  });

  it('highlights selected chip with correct styling', () => {
    render(
      <AccountChips
        chartData={mockChartData}
        selectedAccount={mockChartData[0]}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const selectedChip = screen.getByText('HDFC Bank - Savings').closest('button');
    expect(selectedChip).toHaveClass('bg-muted', 'ring-2', 'ring-primary/20');

    // Check that the color dot has additional styling when selected
    const colorDot = selectedChip!.querySelector('.w-3.h-3.rounded.transition-all');
    expect(colorDot).toHaveClass('ring-2', 'ring-white', 'shadow-md');
  });

  it('shows full amount for selected chip and compact for others', () => {
    render(
      <AccountChips
        chartData={mockChartData}
        selectedAccount={mockChartData[0]} // Select first account
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Selected chip should show full amount (₹1,50,000)
    expect(screen.getByText('₹1,50,000')).toBeInTheDocument();

    // Other chips should show compact amounts
    expect(screen.getByText('₹75.0K')).toBeInTheDocument();
    expect(screen.getByText('₹2.0L')).toBeInTheDocument();
  });

  it('applies correct color styling to amounts and percentages', () => {
    const { container } = render(
      <AccountChips
        chartData={mockChartData}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Check for green amount styling
    const greenAmounts = container.querySelectorAll('.text-green-500.font-semibold');
    expect(greenAmounts.length).toBe(3); // One for each chip

    // Check for yellow percentage styling
    const yellowPercentages = container.querySelectorAll('.text-yellow-500.font-medium');
    expect(yellowPercentages.length).toBe(3); // One for each chip
  });

  it('renders chip color dots with correct background colors', () => {
    const { container } = render(
      <AccountChips
        chartData={mockChartData}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const colorDots = container.querySelectorAll('.w-3.h-3.rounded');
    
    expect(colorDots[0]).toHaveStyle('background-color: rgb(255, 140, 66)'); // #FF8C42
    expect(colorDots[1]).toHaveStyle('background-color: rgb(231, 76, 60)'); // #E74C3C
    expect(colorDots[2]).toHaveStyle('background-color: rgb(155, 89, 182)'); // #9B59B6
  });

  it('handles empty chart data gracefully', () => {
    render(
      <AccountChips
        chartData={[]}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Should render empty grid
    const grid = document.querySelector('.grid.grid-cols-2');
    expect(grid).toBeInTheDocument();
    expect(grid?.children.length).toBe(0);
  });

  it('handles single account data', () => {
    const singleAccount = [mockChartData[0]];
    
    render(
      <AccountChips
        chartData={singleAccount}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    expect(screen.getByText('HDFC Bank - Savings')).toBeInTheDocument();
    expect(screen.getByText('₹1.5L')).toBeInTheDocument();
    expect(screen.getByText('35.3%')).toBeInTheDocument();
  });

  it('maintains responsive grid layout', () => {
    const { container } = render(
      <AccountChips
        chartData={mockChartData}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const gridContainer = container.querySelector('.grid.grid-cols-2.gap-2.mt-4.text-xs');
    expect(gridContainer).toBeInTheDocument();
  });

  it('handles hover states correctly', () => {
    render(
      <AccountChips
        chartData={mockChartData}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const chips = screen.getAllByRole('button');
    chips.forEach(chip => {
      expect(chip).toHaveClass('hover:bg-muted/50');
    });
  });

  it('truncates long institution names', () => {
    const longNameAccount: AccountData = {
      id: '4',
      name: 'Very Long Account Name That Should Be Truncated',
      accountName: 'Very Long Account Name That Should Be Truncated',
      value: 100000,
      percentage: 20,
      institution: 'Very Long Bank Name That Should Be Truncated',
      color: '#000000',
    };

    render(
      <AccountChips
        chartData={[longNameAccount]}
        selectedAccount={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const institutionElement = screen.getByText('Very Long Bank Name That Should Be Truncated');
    expect(institutionElement).toHaveClass('truncate');
  });
}); 