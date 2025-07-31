import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpendSummaryHeader from '../SpendSummaryHeader';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Edit2: ({ className, ...props }: any) => (
    <div className={className} data-testid="edit-icon" {...props} />
  ),
  TrendingUp: ({ className, ...props }: any) => (
    <div className={className} data-testid="trending-up" {...props} />
  ),
  TrendingDown: ({ className, ...props }: any) => (
    <div className={className} data-testid="trending-down" {...props} />
  ),
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('SpendSummaryHeader', () => {
  const mockOnBudgetEdit = jest.fn();

  const defaultData = {
    currentSpend: 30000,
    budget: 50000,
    lastMonthSpend: 25000,
    percentageChange: 20.0,
  };

  beforeEach(() => {
    mockOnBudgetEdit.mockClear();
  });

  it('renders current spend and budget correctly', () => {
    render(
      <SpendSummaryHeader data={defaultData} onBudgetEdit={mockOnBudgetEdit} />
    );

    expect(screen.getByTestId('current-spend')).toHaveTextContent('₹30.0K');
    expect(screen.getByText('/ ₹50.0K')).toBeInTheDocument();
    expect(screen.getByTestId('last-month-spend')).toHaveTextContent('₹25.0K');
  });

  it('renders without budget when not provided', () => {
    const dataWithoutBudget = { ...defaultData, budget: undefined };
    render(
      <SpendSummaryHeader data={dataWithoutBudget} />
    );

    expect(screen.getByTestId('current-spend')).toHaveTextContent('₹30.0K');
    expect(screen.queryByText('/ ₹50.0K')).not.toBeInTheDocument();
  });

  it('shows edit button when onBudgetEdit is provided', () => {
    render(
      <SpendSummaryHeader data={defaultData} onBudgetEdit={mockOnBudgetEdit} />
    );

    expect(screen.getByTestId('budget-edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('budget-edit-button')).toHaveAttribute('aria-label', 'Edit budget');
  });

  it('does not show edit button when onBudgetEdit is not provided', () => {
    render(
      <SpendSummaryHeader data={defaultData} />
    );

    expect(screen.queryByTestId('budget-edit-button')).not.toBeInTheDocument();
  });

  it('shows budget edit form when edit button is clicked', () => {
    render(
      <SpendSummaryHeader data={defaultData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const editButton = screen.getByTestId('budget-edit-button');
    fireEvent.click(editButton);

    expect(screen.getByTestId('budget-edit-form')).toBeInTheDocument();
    expect(screen.getByTestId('budget-input')).toBeInTheDocument();
    expect(screen.getByTestId('budget-save-button')).toBeInTheDocument();
    expect(screen.getByTestId('budget-cancel-button')).toBeInTheDocument();
  });

  it('calls onBudgetEdit when budget is saved', () => {
    render(
      <SpendSummaryHeader data={defaultData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const editButton = screen.getByTestId('budget-edit-button');
    fireEvent.click(editButton);

    const budgetInput = screen.getByTestId('budget-input');
    fireEvent.change(budgetInput, { target: { value: '60000' } });

    const saveButton = screen.getByTestId('budget-save-button');
    fireEvent.click(saveButton);

    expect(mockOnBudgetEdit).toHaveBeenCalledWith(60000);
  });

  it('cancels budget editing when cancel button is clicked', () => {
    render(
      <SpendSummaryHeader data={defaultData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const editButton = screen.getByTestId('budget-edit-button');
    fireEvent.click(editButton);

    const budgetInput = screen.getByTestId('budget-input');
    fireEvent.change(budgetInput, { target: { value: '60000' } });

    const cancelButton = screen.getByTestId('budget-cancel-button');
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('budget-edit-form')).not.toBeInTheDocument();
    expect(mockOnBudgetEdit).not.toHaveBeenCalled();
  });

  it('displays percentage increase correctly', () => {
    render(
      <SpendSummaryHeader data={defaultData} onBudgetEdit={mockOnBudgetEdit} />
    );

    expect(screen.getByTestId('percentage-change')).toHaveTextContent('20.0% increase from last month');
    expect(screen.getByTestId('trending-up')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up')).toHaveClass('text-red-500');
  });

  it('displays percentage decrease correctly', () => {
    const dataWithDecrease = { ...defaultData, percentageChange: -15.5 };
    render(
      <SpendSummaryHeader data={dataWithDecrease} onBudgetEdit={mockOnBudgetEdit} />
    );

    expect(screen.getByTestId('percentage-change')).toHaveTextContent('15.5% decrease from last month');
    expect(screen.getByTestId('trending-down')).toBeInTheDocument();
    expect(screen.getByTestId('trending-down')).toHaveClass('text-green-500');
  });

  it('formats large amounts correctly', () => {
    const dataWithLargeAmounts = {
      currentSpend: 1500000, // 15L
      budget: 2000000, // 20L
      lastMonthSpend: 1200000, // 12L
      percentageChange: 25.0,
    };

    render(
      <SpendSummaryHeader data={dataWithLargeAmounts} onBudgetEdit={mockOnBudgetEdit} />
    );

    expect(screen.getByTestId('current-spend')).toHaveTextContent('₹15.0L');
    expect(screen.getByText('/ ₹20.0L')).toBeInTheDocument();
    expect(screen.getByTestId('last-month-spend')).toHaveTextContent('₹12.0L');
  });

  it('formats small amounts correctly', () => {
    const dataWithSmallAmounts = {
      currentSpend: 500,
      budget: 1000,
      lastMonthSpend: 400,
      percentageChange: 25.0,
    };

    render(
      <SpendSummaryHeader data={dataWithSmallAmounts} onBudgetEdit={mockOnBudgetEdit} />
    );

    expect(screen.getByTestId('current-spend')).toHaveTextContent('₹500');
    expect(screen.getByText('/ ₹1.0K')).toBeInTheDocument();
    expect(screen.getByTestId('last-month-spend')).toHaveTextContent('₹400');
  });

  it('applies custom className when provided', () => {
    render(
      <SpendSummaryHeader 
        data={defaultData} 
        onBudgetEdit={mockOnBudgetEdit} 
        className="custom-class"
      />
    );

    const header = screen.getByTestId('spend-summary-header');
    expect(header).toHaveClass('custom-class');
  });

  it('handles invalid budget input gracefully', () => {
    render(
      <SpendSummaryHeader data={defaultData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const editButton = screen.getByTestId('budget-edit-button');
    fireEvent.click(editButton);

    const budgetInput = screen.getByTestId('budget-input');
    fireEvent.change(budgetInput, { target: { value: 'invalid' } });

    const saveButton = screen.getByTestId('budget-save-button');
    fireEvent.click(saveButton);

    expect(mockOnBudgetEdit).not.toHaveBeenCalled();
    expect(screen.queryByTestId('budget-edit-form')).not.toBeInTheDocument();
  });

  // NEW TESTS FOR BUDGET-BASED COLORING

  it('applies green color for low budget usage (< 50%)', () => {
    const lowUsageData = {
      ...defaultData,
      currentSpend: 20000, // 40% of 50000 budget
      budget: 50000,
    };

    render(
      <SpendSummaryHeader data={lowUsageData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const currentSpend = screen.getByTestId('current-spend');
    expect(currentSpend).toHaveClass('text-green-500');
  });

  it('applies yellow color for medium budget usage (50-75%)', () => {
    const mediumUsageData = {
      ...defaultData,
      currentSpend: 35000, // 70% of 50000 budget
      budget: 50000,
    };

    render(
      <SpendSummaryHeader data={mediumUsageData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const currentSpend = screen.getByTestId('current-spend');
    expect(currentSpend).toHaveClass('text-yellow-500');
  });

  it('applies orange color for high budget usage (75-100%)', () => {
    const highUsageData = {
      ...defaultData,
      currentSpend: 45000, // 90% of 50000 budget
      budget: 50000,
    };

    render(
      <SpendSummaryHeader data={highUsageData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const currentSpend = screen.getByTestId('current-spend');
    expect(currentSpend).toHaveClass('text-orange-500');
  });

  it('applies red color for over budget usage (> 100%)', () => {
    const overBudgetData = {
      ...defaultData,
      currentSpend: 60000, // 120% of 50000 budget
      budget: 50000,
    };

    render(
      <SpendSummaryHeader data={overBudgetData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const currentSpend = screen.getByTestId('current-spend');
    expect(currentSpend).toHaveClass('text-red-500');
  });

  it('applies default color when no budget is set', () => {
    const noBudgetData = {
      ...defaultData,
      budget: undefined,
    };

    render(
      <SpendSummaryHeader data={noBudgetData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const currentSpend = screen.getByTestId('current-spend');
    expect(currentSpend).toHaveClass('text-foreground');
  });

  it('applies responsive font sizing classes', () => {
    render(
      <SpendSummaryHeader data={defaultData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const currentSpend = screen.getByTestId('current-spend');
    expect(currentSpend).toHaveClass('text-xl', 'sm:text-2xl');
  });

  it('handles edge case of exactly 50% budget usage', () => {
    const exactFiftyData = {
      ...defaultData,
      currentSpend: 25000, // Exactly 50% of 50000 budget
      budget: 50000,
    };

    render(
      <SpendSummaryHeader data={exactFiftyData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const currentSpend = screen.getByTestId('current-spend');
    expect(currentSpend).toHaveClass('text-yellow-500'); // 50% should be yellow
  });

  it('handles edge case of exactly 75% budget usage', () => {
    const exactSeventyFiveData = {
      ...defaultData,
      currentSpend: 37500, // Exactly 75% of 50000 budget
      budget: 50000,
    };

    render(
      <SpendSummaryHeader data={exactSeventyFiveData} onBudgetEdit={mockOnBudgetEdit} />
    );

    const currentSpend = screen.getByTestId('current-spend');
    expect(currentSpend).toHaveClass('text-orange-500'); // 75% should be orange
  });
}); 