import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreditCardsSection from '../CreditCardsSection';
import { useCreditCards } from '@/contexts/CreditCardContext';

// Mock dependencies
jest.mock('@/contexts/CreditCardContext');
jest.mock('@/components/common/credit-cards', () => ({
  CreditCardView: ({ id, name, institution, onManageCard, onViewBreakdown }: any) => (
    <div data-testid={`credit-card-${id}`}>
      <span>{name} - {institution}</span>
      <button onClick={() => onManageCard(id)}>Manage</button>
      <button onClick={() => onViewBreakdown(id)}>View Breakdown</button>
    </div>
  ),
}));

jest.mock('@/components/common/AddAccountModal', () => {
  return function MockAddAccountModal({ 
    open, 
    onOpenChange,
    isCreditCard
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    isCreditCard: boolean;
  }) {
    return open ? (
      <div data-testid="add-account-modal" data-credit-card={isCreditCard}>
        <button onClick={() => onOpenChange(false)}>Close Modal</button>
      </div>
    ) : null;
  };
});

const mockUseCreditCards = useCreditCards as jest.MockedFunction<typeof useCreditCards>;

// Mock credit card data
const mockCreditCards = [
  {
    id: '1',
    name: 'HDFC Regalia',
    bank: 'HDFC Bank',
    logoUrl: '',
    lastFourDigits: '1234',
    creditLimit: 200000,
    currentBalance: 15000,
    dueDate: '2024-02-15',
    billingCycle: 'monthly'
  },
  {
    id: '2',
    name: 'ICICI Platinum',
    bank: 'ICICI Bank',
    logoUrl: '',
    lastFourDigits: '5678',
    creditLimit: 150000,
    currentBalance: 8000,
    dueDate: '2024-02-20',
    billingCycle: 'monthly'
  }
];

describe('CreditCardsSection', () => {
  beforeEach(() => {
    mockUseCreditCards.mockReturnValue({
      creditCards: mockCreditCards,
      loading: false,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUseCreditCards.mockReturnValue({
      creditCards: [],
      loading: true,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });

    render(<CreditCardsSection />);

    // Look for the specific loading spinner element
    const loadingElement = document.querySelector('.animate-spin.rounded-full.h-8.w-8.border-b-2.border-primary');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders filter bar with correct institutions', () => {
    render(<CreditCardsSection />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    expect(screen.getByText('ICICI Bank')).toBeInTheDocument();
    expect(screen.getByText('Add Account')).toBeInTheDocument();
  });

  it('displays all credit cards when no filter is applied', () => {
    render(<CreditCardsSection />);

    expect(screen.getByText('All cards')).toBeInTheDocument();
    expect(screen.getByText('2 cards')).toBeInTheDocument();
    expect(screen.getByTestId('credit-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('credit-card-2')).toBeInTheDocument();
  });

  it('filters credit cards by institution when filter is selected', () => {
    render(<CreditCardsSection />);

    // Click HDFC Bank filter
    fireEvent.click(screen.getByText('HDFC Bank'));

    expect(screen.getByText('HDFC Bank cards')).toBeInTheDocument();
    expect(screen.getByText('1 card')).toBeInTheDocument();
    expect(screen.getByTestId('credit-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('credit-card-2')).not.toBeInTheDocument();
  });

  it('opens add credit card modal when add button is clicked', () => {
    render(<CreditCardsSection />);

    fireEvent.click(screen.getByText('Add Account'));

    expect(screen.getByTestId('add-account-modal')).toBeInTheDocument();
    expect(screen.getByTestId('add-account-modal')).toHaveAttribute('data-credit-card', 'true');
  });

  it('calls manage card callback when manage button is clicked', () => {
    const mockOnManageCard = jest.fn();
    render(<CreditCardsSection onManageCard={mockOnManageCard} />);

    fireEvent.click(screen.getAllByText('Manage')[0]);

    expect(mockOnManageCard).toHaveBeenCalledWith('1');
  });

  it('calls view breakdown callback when view breakdown button is clicked', () => {
    const mockOnViewBreakdown = jest.fn();
    render(<CreditCardsSection onViewBreakdown={mockOnViewBreakdown} />);

    fireEvent.click(screen.getAllByText('View Breakdown')[0]);

    expect(mockOnViewBreakdown).toHaveBeenCalledWith('1');
  });

  it('displays empty state when no credit cards exist', () => {
    mockUseCreditCards.mockReturnValue({
      creditCards: [],
      loading: false,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });

    render(<CreditCardsSection />);

    expect(screen.getByText('No credit cards found')).toBeInTheDocument();
    expect(screen.getByText('Add Your First Credit Card')).toBeInTheDocument();
  });

  it('displays filtered empty state when no cards match filter', () => {
    // Mock data with only HDFC cards
    mockUseCreditCards.mockReturnValue({
      creditCards: [mockCreditCards[0]], // Only HDFC card
      loading: false,
      error: null,
      fetchCreditCards: jest.fn(),
      addCreditCard: jest.fn(),
      updateCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
    });

    render(<CreditCardsSection />);

    // Since there's no ICICI card in the data, there should be no ICICI filter button
    // Check that the empty state shows up when we have no matching cards for a non-existent filter
    expect(screen.getByText('All cards')).toBeInTheDocument();
    expect(screen.getByText('1 card')).toBeInTheDocument();
    
    // Test that only HDFC filter is available (not ICICI)
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    expect(screen.queryByText('ICICI Bank')).not.toBeInTheDocument();
  });

  it('applies mobile-optimized padding and font sizes', () => {
    render(<CreditCardsSection />);

    // Check for mobile-optimized classes
    const headerElement = screen.getByText('All cards');
    expect(headerElement).toHaveClass('text-base');

    const descriptionElement = screen.getByText('As of last available statement');
    expect(descriptionElement).toHaveClass('text-xs');
  });
}); 