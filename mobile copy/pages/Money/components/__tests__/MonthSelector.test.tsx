import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthSelector from '../MonthSelector';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: ({ className, ...props }: any) => (
    <div className={className} data-testid="chevron-left" {...props} />
  ),
  ChevronRight: ({ className, ...props }: any) => (
    <div className={className} data-testid="chevron-right" {...props} />
  ),
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('MonthSelector', () => {
  const mockOnMonthChange = jest.fn();
  const testDate = new Date(2024, 5, 15); // June 15, 2024

  beforeEach(() => {
    mockOnMonthChange.mockClear();
  });

  it('renders current month correctly', () => {
    render(
      <MonthSelector currentMonth={testDate} onMonthChange={mockOnMonthChange} />
    );

    expect(screen.getByTestId('current-month')).toHaveTextContent('June 2024');
  });

  it('renders navigation buttons', () => {
    render(
      <MonthSelector currentMonth={testDate} onMonthChange={mockOnMonthChange} />
    );

    const prevButton = screen.getByTestId('prev-month-button');
    const nextButton = screen.getByTestId('next-month-button');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toHaveAttribute('aria-label', 'Previous month');
    expect(nextButton).toHaveAttribute('aria-label', 'Next month');
  });

  it('calls onMonthChange with previous month when prev button is clicked', () => {
    render(
      <MonthSelector currentMonth={testDate} onMonthChange={mockOnMonthChange} />
    );

    const prevButton = screen.getByTestId('prev-month-button');
    fireEvent.click(prevButton);

    expect(mockOnMonthChange).toHaveBeenCalledTimes(1);
    const calledDate = mockOnMonthChange.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(4); // May (0-indexed)
    expect(calledDate.getFullYear()).toBe(2024);
  });

  it('calls onMonthChange with next month when next button is clicked', () => {
    render(
      <MonthSelector currentMonth={testDate} onMonthChange={mockOnMonthChange} />
    );

    const nextButton = screen.getByTestId('next-month-button');
    fireEvent.click(nextButton);

    expect(mockOnMonthChange).toHaveBeenCalledTimes(1);
    const calledDate = mockOnMonthChange.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(6); // July (0-indexed)
    expect(calledDate.getFullYear()).toBe(2024);
  });

  it('handles year transitions correctly', () => {
    const decemberDate = new Date(2024, 11, 15); // December 2024
    render(
      <MonthSelector currentMonth={decemberDate} onMonthChange={mockOnMonthChange} />
    );

    const nextButton = screen.getByTestId('next-month-button');
    fireEvent.click(nextButton);

    const calledDate = mockOnMonthChange.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(0); // January (0-indexed)
    expect(calledDate.getFullYear()).toBe(2025);
  });

  it('handles year transitions backwards correctly', () => {
    const januaryDate = new Date(2024, 0, 15); // January 2024
    render(
      <MonthSelector currentMonth={januaryDate} onMonthChange={mockOnMonthChange} />
    );

    const prevButton = screen.getByTestId('prev-month-button');
    fireEvent.click(prevButton);

    const calledDate = mockOnMonthChange.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(11); // December (0-indexed)
    expect(calledDate.getFullYear()).toBe(2023);
  });

  it('applies custom className when provided', () => {
    render(
      <MonthSelector 
        currentMonth={testDate} 
        onMonthChange={mockOnMonthChange} 
        className="custom-class"
      />
    );

    const monthSelector = screen.getByTestId('month-selector');
    expect(monthSelector).toHaveClass('custom-class');
  });

  it('renders icons correctly', () => {
    render(
      <MonthSelector currentMonth={testDate} onMonthChange={mockOnMonthChange} />
    );

    expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
  });

  it('formats different months correctly', () => {
    const { rerender } = render(
      <MonthSelector currentMonth={new Date(2024, 0, 1)} onMonthChange={mockOnMonthChange} />
    );
    expect(screen.getByTestId('current-month')).toHaveTextContent('January 2024');

    rerender(
      <MonthSelector currentMonth={new Date(2024, 11, 1)} onMonthChange={mockOnMonthChange} />
    );
    expect(screen.getByTestId('current-month')).toHaveTextContent('December 2024');
  });
}); 