import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DonutCenterLabel from '../DonutCenterLabel';
import { AccountData } from '../hooks/useAccountSelection';

const mockAccount: AccountData = {
  id: '1',
  name: 'Test Account',
  accountName: 'Test Account',
  value: 150000,
  percentage: 35.3,
  institution: 'HDFC Bank',
  color: '#FF8C42',
};

describe('DonutCenterLabel', () => {
  it('renders total balance when no account is selected', () => {
    render(
      <DonutCenterLabel 
        selectedAccount={null} 
        totalBalance={425000} 
      />
    );

    expect(screen.getByText('₹4.25L')).toBeInTheDocument();
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
  });

  it('renders selected account details when account is selected', () => {
    render(
      <DonutCenterLabel 
        selectedAccount={mockAccount} 
        totalBalance={425000} 
      />
    );

    expect(screen.getByText('₹1.50L')).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    expect(screen.getByText('35.3% of total')).toBeInTheDocument();
  });

  it('formats amounts correctly for large balances', () => {
    const largeAccount: AccountData = {
      id: '2',
      name: 'Large Account',
      accountName: 'Large Account',
      value: 15000000, // 1.5 Cr
      percentage: 75.0,
      institution: 'Large Bank',
      color: '#FF0000',
    };

    render(
      <DonutCenterLabel 
        selectedAccount={largeAccount} 
        totalBalance={20000000} 
      />
    );

    expect(screen.getByText('₹1.50Cr')).toBeInTheDocument();
    expect(screen.getByText('Large Bank')).toBeInTheDocument();
    expect(screen.getByText('75.0% of total')).toBeInTheDocument();
  });

  it('formats amounts correctly for small balances', () => {
    const smallAccount: AccountData = {
      id: '3',
      name: 'Small Account',
      accountName: 'Small Account',
      value: 2500, // 2.5K
      percentage: 1.2,
      institution: 'Small Bank',
      color: '#00FF00',
    };

    render(
      <DonutCenterLabel 
        selectedAccount={smallAccount} 
        totalBalance={208333} 
      />
    );

    expect(screen.getByText('₹2.5K')).toBeInTheDocument();
    expect(screen.getByText('Small Bank')).toBeInTheDocument();
    expect(screen.getByText('1.2% of total')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(
      <DonutCenterLabel 
        selectedAccount={mockAccount} 
        totalBalance={425000} 
      />
    );

    const centerDiv = container.querySelector('.absolute.inset-0.flex.flex-col.items-center.justify-center.pointer-events-none');
    expect(centerDiv).toBeInTheDocument();

    const amountElement = container.querySelector('.text-lg.sm\\:text-xl.font-bold.text-foreground');
    expect(amountElement).toBeInTheDocument();

    const institutionElement = container.querySelector('.text-xs.text-muted-foreground');
    expect(institutionElement).toBeInTheDocument();

    const percentageElement = container.querySelector('.text-xs.text-yellow-500.font-medium');
    expect(percentageElement).toBeInTheDocument();
  });

  it('handles edge case with zero balance', () => {
    const zeroAccount: AccountData = {
      id: '4',
      name: 'Zero Account',
      accountName: 'Zero Account',
      value: 0,
      percentage: 0,
      institution: 'Zero Bank',
      color: '#000000',
    };

    render(
      <DonutCenterLabel 
        selectedAccount={zeroAccount} 
        totalBalance={100000} 
      />
    );

    expect(screen.getByText('₹0')).toBeInTheDocument();
    expect(screen.getByText('Zero Bank')).toBeInTheDocument();
    expect(screen.getByText('0.0% of total')).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    const { container } = render(
      <DonutCenterLabel 
        selectedAccount={mockAccount} 
        totalBalance={425000} 
      />
    );

    // Ensure the component is not interactive due to pointer-events-none
    const centerElement = container.querySelector('.pointer-events-none');
    expect(centerElement).toBeInTheDocument();
  });
}); 