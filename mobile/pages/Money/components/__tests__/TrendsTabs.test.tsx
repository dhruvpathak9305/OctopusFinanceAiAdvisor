import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendsTabs from '../TrendsTabs';

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('TrendsTabs', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it('renders all three tabs correctly', () => {
    render(
      <TrendsTabs activeTab="spend" onTabChange={mockOnTabChange} />
    );

    expect(screen.getByTestId('tab-spend')).toBeInTheDocument();
    expect(screen.getByTestId('tab-invested')).toBeInTheDocument();
    expect(screen.getByTestId('tab-income')).toBeInTheDocument();

    expect(screen.getByText('Spend')).toBeInTheDocument();
    expect(screen.getByText('Invested')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
  });

  it('highlights the active tab with correct category color', () => {
    render(
      <TrendsTabs activeTab="spend" onTabChange={mockOnTabChange} />
    );

    const spendTab = screen.getByTestId('tab-spend');
    const investedTab = screen.getByTestId('tab-invested');
    const incomeTab = screen.getByTestId('tab-income');

    // Spend tab should be active with red color
    expect(spendTab).toHaveClass('bg-red-500', 'text-white', 'border-red-500');
    expect(spendTab).toHaveAttribute('aria-pressed', 'true');
    
    // Other tabs should be inactive
    expect(investedTab).toHaveClass('bg-background', 'text-muted-foreground', 'border-border');
    expect(incomeTab).toHaveClass('bg-background', 'text-muted-foreground', 'border-border');
    
    expect(investedTab).toHaveAttribute('aria-pressed', 'false');
    expect(incomeTab).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows correct colors for invested tab when active', () => {
    render(
      <TrendsTabs activeTab="invested" onTabChange={mockOnTabChange} />
    );

    const investedTab = screen.getByTestId('tab-invested');
    
    // Invested tab should be active with blue color
    expect(investedTab).toHaveClass('bg-blue-500', 'text-white', 'border-blue-500');
    expect(investedTab).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows correct colors for income tab when active', () => {
    render(
      <TrendsTabs activeTab="income" onTabChange={mockOnTabChange} />
    );

    const incomeTab = screen.getByTestId('tab-income');
    
    // Income tab should be active with green color
    expect(incomeTab).toHaveClass('bg-green-500', 'text-white', 'border-green-500');
    expect(incomeTab).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onTabChange when a tab is clicked', () => {
    render(
      <TrendsTabs activeTab="spend" onTabChange={mockOnTabChange} />
    );

    const investedTab = screen.getByTestId('tab-invested');
    fireEvent.click(investedTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('invested');
  });

  it('calls onTabChange when income tab is clicked', () => {
    render(
      <TrendsTabs activeTab="spend" onTabChange={mockOnTabChange} />
    );

    const incomeTab = screen.getByTestId('tab-income');
    fireEvent.click(incomeTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('income');
  });

  it('applies custom className when provided', () => {
    render(
      <TrendsTabs 
        activeTab="spend" 
        onTabChange={mockOnTabChange} 
        className="custom-class"
      />
    );

    const tabsContainer = screen.getByTestId('trends-tabs');
    expect(tabsContainer).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TrendsTabs activeTab="spend" onTabChange={mockOnTabChange} />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-pressed');
    });
  });

  it('renders emoji icons for each tab', () => {
    render(
      <TrendsTabs activeTab="spend" onTabChange={mockOnTabChange} />
    );

    // Check that emojis are present
    expect(screen.getByText('💸')).toBeInTheDocument();
    expect(screen.getByText('📈')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  it('switches tabs correctly when different tabs are selected', () => {
    const { rerender } = render(
      <TrendsTabs activeTab="spend" onTabChange={mockOnTabChange} />
    );

    expect(screen.getByTestId('tab-spend')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('tab-invested')).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <TrendsTabs activeTab="invested" onTabChange={mockOnTabChange} />
    );

    expect(screen.getByTestId('tab-spend')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('tab-invested')).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies border styling and transitions correctly', () => {
    render(
      <TrendsTabs activeTab="spend" onTabChange={mockOnTabChange} />
    );

    const spendTab = screen.getByTestId('tab-spend');
    const investedTab = screen.getByTestId('tab-invested');

    // Check that all tabs have border class
    expect(spendTab).toHaveClass('border');
    expect(investedTab).toHaveClass('border');

    // Check transition classes
    expect(spendTab).toHaveClass('transition-all', 'duration-200');
    expect(investedTab).toHaveClass('transition-all', 'duration-200');
  });
}); 