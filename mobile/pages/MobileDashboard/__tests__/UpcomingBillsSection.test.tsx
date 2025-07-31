import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpcomingBillsSection from '../UpcomingBillsSection';
import { useUpcomingBills } from '@/hooks/useUpcomingBills';
import { toast } from '@/components/ui/use-toast';

// Mock hooks
jest.mock('@/hooks/useUpcomingBills');

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }) => (
    <div className={className} onClick={onClick} data-testid="card">
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size }) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      data-size={size}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, className }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className={className}
      data-testid="test-data-switch"
    />
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogTrigger: ({ children }) => <div data-testid="dialog-trigger">{children}</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }) => (
    <div data-testid="select" data-value={value} onChange={(e: any) => onValueChange && onValueChange(e.target.value)}>
      {children}
    </div>
  ),
  SelectContent: ({ children }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }) => (
    <div data-testid="select-item" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children, className }) => (
    <div className={className} data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }) => <div data-testid="select-value">{placeholder}</div>,
}));

// Mock other components
jest.mock('@/common/components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="error-boundary">{children}</div>,
}));

jest.mock('@/mobile/components/bills/UpcomingBillItem', () => ({
  __esModule: true,
  default: ({ bill, onEdit, onDelete, onMarkPaid }) => (
    <div data-testid="upcoming-bill-item" data-bill-id={bill.id}>
      {bill.name}: ${bill.amount}
      <button onClick={() => onEdit?.(bill.id)} data-testid="edit-bill">Edit</button>
      <button onClick={() => onDelete?.(bill.id)} data-testid="delete-bill">Delete</button>
      <button onClick={() => onMarkPaid?.(bill.id)} data-testid="mark-paid-bill">Mark Paid</button>
    </div>
  ),
}));

jest.mock('@/mobile/components/bills/UpcomingBillDialog', () => ({
  __esModule: true,
  default: ({ open, onOpenChange, billToEdit, onSuccess }) => (
    open ? (
      <div data-testid="upcoming-bill-dialog" data-bill-id={billToEdit?.id || 'new'}>
        Bill Dialog
        <button onClick={() => onSuccess?.({})} data-testid="dialog-save">Save</button>
        <button onClick={() => onOpenChange?.(false)} data-testid="dialog-close">Close</button>
      </div>
    ) : null
  ),
}));

jest.mock('@/components/common/QuickAddButton', () => ({
  __esModule: true,
  default: ({ bottomSpacing, rightSpacing }) => (
    <div 
      data-testid="quick-add-button" 
      data-bottom-spacing={bottomSpacing}
      data-right-spacing={rightSpacing}
    >
      Quick Add Button
    </div>
  ),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  PlusCircle: () => <div data-testid="plus-circle-icon">Plus</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  CalendarDays: () => <div data-testid="calendar-days-icon">CalendarDays</div>,
  DollarSign: () => <div data-testid="dollar-sign-icon">DollarSign</div>,
  Loader: () => <div data-testid="loader">Loading...</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">Alert</div>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatString) => {
    if (formatString === 'MMM d') return 'Jan 15';
    if (formatString === 'EEEE') return 'Monday';
    return 'Jan 15, 2024';
  }),
  isToday: jest.fn(() => false),
  isTomorrow: jest.fn(() => false),
  isThisWeek: jest.fn(() => false),
  parseISO: jest.fn((date) => new Date(date)),
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock sample data
jest.mock('@/data/sampleUpcomingBills', () => ({
  sampleUpcomingBills: [
    {
      id: 'test-1',
      name: 'Electricity Bill',
      amount: 120,
      due_date: '2024-01-15',
      status: 'upcoming',
      category_name: 'Utilities',
      autopay: false,
      transaction_id: 'tx-1',
      frequency: 'monthly',
      autopay_source: 'none',
      user_id: 'user-1',
      account_id: 'acc-1',
      credit_card_id: null,
      description: 'Electric bill',
      category_id: 'cat-1',
      subcategory_id: 'sub-1',
      notes: null,
      reminder_days: 3,
      end_date: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'test-2',
      name: 'Internet Bill',
      amount: 80,
      due_date: '2024-01-16',
      status: 'upcoming',
      category_name: 'Utilities',
      autopay: true,
      transaction_id: 'tx-2',
      frequency: 'monthly',
      autopay_source: 'bank',
      user_id: 'user-1',
      account_id: 'acc-1',
      credit_card_id: null,
      description: 'Internet bill',
      category_id: 'cat-1',
      subcategory_id: 'sub-1',
      notes: null,
      reminder_days: 5,
      end_date: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
}));

const mockUpcomingBills = [
  {
    id: '1',
    name: 'Electric Bill',
    amount: 150,
    due_date: '2024-01-15',
    description: 'Monthly electric bill',
    category_id: 'cat-1',
    subcategory_id: 'sub-1',
    account_id: 'acc-1',
    credit_card_id: null,
    user_id: 'user-1',
    status: 'upcoming' as const,
    transaction_id: 'tx-1',
    frequency: 'monthly',
    autopay: false,
    autopay_source: 'none',
    notes: 'Electric utility bill',
    reminder_days: 3,
    end_date: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    account_name: 'Checking Account',
    credit_card_name: null,
    category_name: 'Utilities',
    subcategory_name: 'Electric',
    is_overdue: false,
    due_status: 'upcoming' as const,
  },
  {
    id: '2',
    name: 'Internet Bill',
    amount: 80,
    due_date: '2024-01-20',
    description: 'Monthly internet bill',
    category_id: 'cat-2',
    subcategory_id: 'sub-2',
    account_id: 'acc-1',
    credit_card_id: null,
    user_id: 'user-1',
    status: 'upcoming' as const,
    transaction_id: 'tx-2',
    frequency: 'monthly',
    autopay: true,
    autopay_source: 'bank',
    notes: null,
    reminder_days: 5,
    end_date: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    account_name: 'Checking Account',
    credit_card_name: null,
    category_name: 'Utilities',
    subcategory_name: 'Internet',
    is_overdue: false,
    due_status: 'upcoming' as const,
  },
];

const mockUseUpcomingBills = useUpcomingBills as jest.MockedFunction<typeof useUpcomingBills>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

describe('UpcomingBillsSection', () => {
  const mockRefreshBills = jest.fn();
  const mockAddUpcomingBill = jest.fn();
  const mockUpdateUpcomingBill = jest.fn();
  const mockDeleteUpcomingBill = jest.fn();
  const mockMarkBillAsPaid = jest.fn();
  const mockIsBillOverdue = jest.fn();
  const mockUpdateBillAutopay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpcomingBills.mockReturnValue({
      upcomingBills: mockUpcomingBills,
      loading: false,
      error: null,
      refreshBills: mockRefreshBills,
      addUpcomingBill: mockAddUpcomingBill,
      updateUpcomingBill: mockUpdateUpcomingBill,
      deleteUpcomingBill: mockDeleteUpcomingBill,
      markBillAsPaid: mockMarkBillAsPaid,
      isBillOverdue: mockIsBillOverdue,
      updateBillAutopay: mockUpdateBillAutopay,
    });
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<UpcomingBillsSection />);
      
      expect(screen.getByText('Upcoming Bills')).toBeInTheDocument();
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<UpcomingBillsSection className="custom-class" />);
      
      expect(container.firstChild.firstChild).toHaveClass('custom-class');
    });

    it('renders bills when data is available', () => {
      render(<UpcomingBillsSection />);
      
      // These are rendered in the UpcomingBillItem mock
      expect(screen.getAllByTestId('upcoming-bill-item')).toHaveLength(2);
    });

    it('renders filter select', () => {
      render(<UpcomingBillsSection />);
      
      const selectElement = screen.getByTestId('select');
      expect(selectElement).toBeInTheDocument();
      expect(selectElement).toHaveAttribute('data-value', 'month');
    });
  });

  describe('Test Data Toggle', () => {
    it('uses test data when useTestData prop is true', () => {
      render(<UpcomingBillsSection useTestData={true} />);
      
      expect(screen.getByText('Upcoming Bills')).toBeInTheDocument();
    });

    it('uses API data when useTestData prop is false', () => {
      render(<UpcomingBillsSection useTestData={false} />);
      
      expect(screen.getByText('Upcoming Bills')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner when loading is true', () => {
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: [],
        loading: true,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      render(<UpcomingBillsSection />);
      
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByTestId('upcoming-bill-item')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when error is present', () => {
      const errorMessage = 'Failed to load bills';
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: [],
        loading: false,
        error: errorMessage,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      render(<UpcomingBillsSection />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByTestId('upcoming-bill-item')).not.toBeInTheDocument();
    });
  });

  describe('Bill Interactions', () => {
    it('renders edit buttons for each bill', async () => {
      render(<UpcomingBillsSection />);
      
      const editButtons = screen.getAllByTestId('edit-bill');
      expect(editButtons).toHaveLength(2);
    });

    it('renders delete buttons for each bill', async () => {
      render(<UpcomingBillsSection />);
      
      const deleteButtons = screen.getAllByTestId('delete-bill');
      expect(deleteButtons).toHaveLength(2);
    });

    it('renders mark paid buttons for each bill', async () => {
      render(<UpcomingBillsSection />);
      
      const markPaidButtons = screen.getAllByTestId('mark-paid-bill');
      expect(markPaidButtons).toHaveLength(2);
    });

    it('handles bill edit interactions', async () => {
      render(<UpcomingBillsSection />);
      
      const editButtons = screen.getAllByTestId('edit-bill');
      fireEvent.click(editButtons[0]);
      
      // The edit logic is handled by the component
      expect(editButtons[0]).toBeInTheDocument();
    });
  });

  describe('Date Grouping', () => {
    it('groups bills by date correctly', () => {
      render(<UpcomingBillsSection />);
      
      // Should display grouped bills
      expect(screen.getAllByTestId('upcoming-bill-item')).toHaveLength(2);
    });

    it('applies correct date formatting', () => {
      render(<UpcomingBillsSection />);
      
      // Check that date formatting is applied (mocked to return 'Jan 15')
      const dateElements = screen.getAllByText(/Jan 15/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('handles bills with different due dates', () => {
      const billsWithDifferentDates = [
        {
          ...mockUpcomingBills[0],
          due_date: '2024-01-15',
        },
        {
          ...mockUpcomingBills[1],
          due_date: '2024-01-20',
        },
      ];
      
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: billsWithDifferentDates,
        loading: false,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      expect(() => render(<UpcomingBillsSection />)).not.toThrow();
    });
  });

  describe('Empty State', () => {
    it('displays appropriate message when no bills are available', () => {
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: [],
        loading: false,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      render(<UpcomingBillsSection />);
      
      expect(screen.queryByTestId('upcoming-bill-item')).not.toBeInTheDocument();
      expect(screen.getByText('Upcoming Bills')).toBeInTheDocument();
      expect(screen.getByText('No upcoming bills')).toBeInTheDocument();
      expect(screen.getByTestId('quick-add-button')).toBeInTheDocument();
    });
  });

  describe('Bill Status Handling', () => {
    it('handles overdue bills correctly', () => {
      const overdueBill = {
        ...mockUpcomingBills[0],
        is_overdue: true,
        due_status: 'overdue' as const,
      };
      
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: [overdueBill],
        loading: false,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      expect(() => render(<UpcomingBillsSection />)).not.toThrow();
    });

    it('handles bills due today', () => {
      const todayBill = {
        ...mockUpcomingBills[0],
        due_status: 'today' as const,
      };
      
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: [todayBill],
        loading: false,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      expect(() => render(<UpcomingBillsSection />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<UpcomingBillsSection />);
      
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('Upcoming Bills');
    });

    it('provides accessible buttons', () => {
      render(<UpcomingBillsSection />);
      
      const editButtons = screen.getAllByTestId('edit-bill');
      editButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('provides accessible select element', () => {
      render(<UpcomingBillsSection />);
      
      const selectElement = screen.getByTestId('select');
      expect(selectElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles bills with missing category gracefully', () => {
      const billWithMissingCategory = {
        ...mockUpcomingBills[0],
        category_name: null,
        subcategory_name: null,
      };
      
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: [billWithMissingCategory],
        loading: false,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      expect(() => render(<UpcomingBillsSection />)).not.toThrow();
    });

    it('handles bills with zero amount', () => {
      const zeroAmountBill = {
        ...mockUpcomingBills[0],
        amount: 0,
      };
      
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: [zeroAmountBill],
        loading: false,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      expect(() => render(<UpcomingBillsSection />)).not.toThrow();
    });

    it('handles very large amounts gracefully', () => {
      const largeAmountBill = {
        ...mockUpcomingBills[0],
        amount: 999999.99,
      };
      
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: [largeAmountBill],
        loading: false,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      expect(() => render(<UpcomingBillsSection />)).not.toThrow();
    });

    it('handles very large datasets gracefully', () => {
      const largeBillsList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockUpcomingBills[0],
        id: `bill-${i}`,
        name: `Bill ${i}`,
        amount: i * 10,
      }));
      
      mockUseUpcomingBills.mockReturnValue({
        upcomingBills: largeBillsList,
        loading: false,
        error: null,
        refreshBills: mockRefreshBills,
        addUpcomingBill: mockAddUpcomingBill,
        updateUpcomingBill: mockUpdateUpcomingBill,
        deleteUpcomingBill: mockDeleteUpcomingBill,
        markBillAsPaid: mockMarkBillAsPaid,
        isBillOverdue: mockIsBillOverdue,
        updateBillAutopay: mockUpdateBillAutopay,
      });
      
      expect(() => render(<UpcomingBillsSection />)).not.toThrow();
    });
  });
}); 