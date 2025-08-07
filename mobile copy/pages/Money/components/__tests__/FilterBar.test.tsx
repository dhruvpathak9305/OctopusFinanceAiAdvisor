import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterBar from '../FilterBar';

describe('FilterBar', () => {
  const defaultProps = {
    institutions: ['HDFC Bank', 'ICICI Bank', 'Axis Bank'],
    selectedInstitution: 'All',
    onInstitutionChange: jest.fn(),
    onAddAccount: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter options correctly', () => {
    render(<FilterBar {...defaultProps} />);

    expect(screen.getByText('Filter by:')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    expect(screen.getByText('ICICI Bank')).toBeInTheDocument();
    expect(screen.getByText('Axis Bank')).toBeInTheDocument();
    expect(screen.getByText('Add Account')).toBeInTheDocument();
  });

  it('highlights the selected institution', () => {
    render(<FilterBar {...defaultProps} selectedInstitution="HDFC Bank" />);

    const hdfcButton = screen.getByText('HDFC Bank');
    const iciciButton = screen.getByText('ICICI Bank');

    expect(hdfcButton).toHaveClass('bg-primary', 'text-primary-foreground');
    expect(iciciButton).toHaveClass('bg-muted', 'text-muted-foreground');
  });

  it('calls onInstitutionChange when institution is clicked', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(screen.getByText('HDFC Bank'));

    expect(defaultProps.onInstitutionChange).toHaveBeenCalledWith('HDFC Bank');
  });

  it('calls onAddAccount when add button is clicked', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(screen.getByText('Add Account'));

    expect(defaultProps.onAddAccount).toHaveBeenCalled();
  });

  it('renders custom title when provided', () => {
    render(<FilterBar {...defaultProps} title="Sort by:" />);

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.queryByText('Filter by:')).not.toBeInTheDocument();
  });

  it('handles empty institutions array', () => {
    render(<FilterBar {...defaultProps} institutions={[]} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Add Account')).toBeInTheDocument();
    // Should not render any institution buttons
    expect(screen.queryByText('HDFC Bank')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for scrolling', () => {
    render(<FilterBar {...defaultProps} />);

    const scrollContainer = screen.getByText('All').parentElement;
    expect(scrollContainer).toHaveClass('overflow-x-auto', 'scrollbar-hide');
  });

  it('applies hover states correctly', () => {
    render(<FilterBar {...defaultProps} />);

    const iciciButton = screen.getByText('ICICI Bank');
    expect(iciciButton).toHaveClass('hover:bg-muted/80');
  });

  it('shows plus icon in add account button', () => {
    render(<FilterBar {...defaultProps} />);

    const addButton = screen.getByText('Add Account');
    // The Plus icon should be rendered (we can check if the button contains the expected class)
    expect(addButton.querySelector('.w-3.h-3')).toBeTruthy();
  });
}); 