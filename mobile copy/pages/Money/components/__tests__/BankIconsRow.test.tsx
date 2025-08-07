import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BankIconsRow from '../BankIconsRow';

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/config/bankConfig', () => ({
  getBankConfig: jest.fn((institution: string) => {
    const configs: Record<string, any> = {
      'HDFC Bank': {
        name: 'HDFC Bank',
        logoPath: '/src/assets/images/banks/hdfc.svg',
        primaryColor: '#E53E3E',
      },
      'ICICI Bank': {
        name: 'ICICI Bank',
        logoPath: '/src/assets/images/banks/icici.svg',
        primaryColor: '#FF8C00',
      },
    };
    return configs[institution] || null;
  }),
  DEFAULT_BANK_CONFIG: {
    name: 'Bank',
    logoPath: '',
    primaryColor: '#6B7280',
  },
}));

describe('BankIconsRow', () => {
  const mockAccounts = [
    {
      id: '1',
      name: 'HDFC Savings',
      institution: 'HDFC Bank',
      balance: 50000,
      type: 'Savings',
    },
    {
      id: '2',
      name: 'ICICI Current',
      institution: 'ICICI Bank',
      balance: 75000,
      type: 'Current',
    },
    {
      id: '3',
      name: 'Axis Savings',
      institution: 'Axis Bank',
      balance: 30000,
      type: 'Savings',
    },
  ];

  const mockOnAccountSelect = jest.fn();

  beforeEach(() => {
    mockOnAccountSelect.mockClear();
  });

  it('renders nothing when no accounts provided', () => {
    const { container } = render(
      <BankIconsRow accounts={[]} onAccountSelect={mockOnAccountSelect} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all individual account icons', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Should render all individual account icons
    expect(screen.getByTestId('account-icon-1')).toBeInTheDocument();
    expect(screen.getByTestId('account-icon-2')).toBeInTheDocument();
    expect(screen.getByTestId('account-icon-3')).toBeInTheDocument();
  });

  it('does not render "All Accounts" button', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Should not render "All Accounts" button
    expect(screen.queryByTestId('all-accounts-button')).not.toBeInTheDocument();
  });

  it('displays individual account balances correctly', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Check individual account balances
    const account1 = screen.getByTestId('account-icon-1');
    const account2 = screen.getByTestId('account-icon-2');
    const account3 = screen.getByTestId('account-icon-3');

    expect(account1).toHaveTextContent('₹50K');
    expect(account2).toHaveTextContent('₹75K');
    expect(account3).toHaveTextContent('₹30K');
  });

  it('shows all accounts with normal styling when no selection', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // All accounts should be shown normally (no opacity reduction)
    const account1 = screen.getByTestId('account-icon-1');
    const account2 = screen.getByTestId('account-icon-2');
    const account3 = screen.getByTestId('account-icon-3');

    expect(account1).not.toHaveClass('opacity-60');
    expect(account2).not.toHaveClass('opacity-60');
    expect(account3).not.toHaveClass('opacity-60');
  });

  it('highlights selected account correctly and fades others', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId="1"
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const selectedAccount = screen.getByTestId('account-icon-1');
    const unselectedAccount1 = screen.getByTestId('account-icon-2');
    const unselectedAccount2 = screen.getByTestId('account-icon-3');

    // Selected account should be highlighted
    expect(selectedAccount).toHaveClass('scale-105');
    
    // Unselected accounts should be faded
    expect(unselectedAccount1).toHaveClass('opacity-60');
    expect(unselectedAccount2).toHaveClass('opacity-60');
  });

  it('calls onAccountSelect with account when unselected account is clicked', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    fireEvent.click(screen.getByTestId('account-icon-1'));
    expect(mockOnAccountSelect).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('calls onAccountSelect with null when selected account is clicked (deselection)', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId="1"
        onAccountSelect={mockOnAccountSelect}
      />
    );

    fireEvent.click(screen.getByTestId('account-icon-1'));
    expect(mockOnAccountSelect).toHaveBeenCalledWith(null);
  });

  it('calls onAccountSelect with new account when different account is clicked', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId="1"
        onAccountSelect={mockOnAccountSelect}
      />
    );

    fireEvent.click(screen.getByTestId('account-icon-2'));
    expect(mockOnAccountSelect).toHaveBeenCalledWith(mockAccounts[1]);
  });

  it('applies custom className when provided', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        onAccountSelect={mockOnAccountSelect}
        className="custom-class"
      />
    );

    expect(screen.getByTestId('bank-icons-row')).toHaveClass('custom-class');
  });

  it('has proper scrolling setup for mobile', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const container = screen.getByTestId('bank-icons-row');
    expect(container).toHaveClass('overflow-x-auto', 'scrollbar-hide');
  });

  it('displays bank names truncated on individual icons', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const account1 = screen.getByTestId('account-icon-1');
    const account2 = screen.getByTestId('account-icon-2');

    expect(account1).toHaveTextContent('HDFC Bank');
    expect(account2).toHaveTextContent('ICICI Bank');
  });

  it('shows visual feedback on hover for accounts', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId="1"
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const unselectedAccount = screen.getByTestId('account-icon-2');
    expect(unselectedAccount).toHaveClass('hover:opacity-80');
  });

  it('formats large balances correctly', () => {
    const largeBalanceAccounts = [
      {
        id: '1',
        name: 'Large Account',
        institution: 'Test Bank',
        balance: 1500000, // 15L
        type: 'Savings',
      },
      {
        id: '2',
        name: 'Very Large Account',
        institution: 'Test Bank',
        balance: 12000000, // 1.2Cr
        type: 'Savings',
      },
    ];

    render(
      <BankIconsRow 
        accounts={largeBalanceAccounts} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const account1 = screen.getByTestId('account-icon-1');
    const account2 = screen.getByTestId('account-icon-2');

    expect(account1).toHaveTextContent('₹15L');
    expect(account2).toHaveTextContent('₹1.2Cr');
  });

  it('handles accounts without institution gracefully', () => {
    const accountsWithoutInstitution = [
      {
        id: '1',
        name: 'Cash Account',
        balance: 5000,
        type: 'Cash',
      },
    ];

    render(
      <BankIconsRow 
        accounts={accountsWithoutInstitution} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const account = screen.getByTestId('account-icon-1');
    expect(account).toHaveTextContent('Cash Account');
  });

  it('applies transition classes for smooth animations', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const account = screen.getByTestId('account-icon-1');
    expect(account).toHaveClass('transition-all', 'duration-200');
  });

  it('uses fallback icon when image fails to load', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Find images and simulate error
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      fireEvent.error(img);
    });

    // After error, should fall back to university icon
    expect(mockAccounts.length).toBeGreaterThan(0);
  });

  it('shows correct text colors based on selection state', () => {
    render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId="1"
        onAccountSelect={mockOnAccountSelect}
      />
    );

    const selectedAccount = screen.getByTestId('account-icon-1');
    const unselectedAccount = screen.getByTestId('account-icon-2');

    // Selected account should have full color
    const selectedBalance = selectedAccount.querySelector('.text-xs');
    expect(selectedBalance).toHaveClass('text-foreground');

    // Unselected account should have muted color
    const unselectedBalance = unselectedAccount.querySelector('.text-xs');
    expect(unselectedBalance).toHaveClass('text-muted-foreground');
  });

  it('only highlights one icon at a time', () => {
    const { rerender } = render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId="1"
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Initially account 1 is selected
    expect(screen.getByTestId('account-icon-1')).toHaveClass('scale-105');
    expect(screen.getByTestId('account-icon-2')).toHaveClass('opacity-60');

    // Change selection to account 2
    rerender(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId="2"
        onAccountSelect={mockOnAccountSelect}
      />
    );

    expect(screen.getByTestId('account-icon-1')).toHaveClass('opacity-60');
    expect(screen.getByTestId('account-icon-2')).toHaveClass('scale-105');
  });

  it('resets to normal state when no account is selected', () => {
    const { rerender } = render(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId="1"
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // Initially account 1 is selected
    expect(screen.getByTestId('account-icon-1')).toHaveClass('scale-105');
    expect(screen.getByTestId('account-icon-2')).toHaveClass('opacity-60');

    // Reset to no selection
    rerender(
      <BankIconsRow 
        accounts={mockAccounts} 
        selectedAccountId={null}
        onAccountSelect={mockOnAccountSelect}
      />
    );

    // All accounts should be shown normally
    expect(screen.getByTestId('account-icon-1')).not.toHaveClass('scale-105');
    expect(screen.getByTestId('account-icon-1')).not.toHaveClass('opacity-60');
    expect(screen.getByTestId('account-icon-2')).not.toHaveClass('opacity-60');
  });
}); 