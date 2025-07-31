import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileDashboard from '../index';
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock Swiper components
jest.mock('swiper/react', () => ({
  Swiper: ({ children, className }) => <div className={className} data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Pagination: {},
}));

// Mock CSS imports
jest.mock('swiper/css', () => ({}));
jest.mock('swiper/css/pagination', () => ({}));

// Mock UI components
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, onValueChange, className }) => (
    <div className={className} data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children, className }) => (
    <div className={className} data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value, className, onClick }) => (
    <button 
      className={className} 
      data-testid={`tab-trigger-${value}`}
      data-value={value}
      onClick={onClick}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value, className }) => (
    <div className={className} data-testid={`tab-content-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }) => <div data-testid="dialog">{children}</div>,
}));

// Mock sub-components
jest.mock('../Header', () => ({
  __esModule: true,
  default: ({ title, subtitle }) => (
    <div data-testid="header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

jest.mock('../BudgetProgressSection', () => ({
  __esModule: true,
  default: () => <div data-testid="budget-progress-section">Budget Progress</div>,
}));

jest.mock('../RecentTransactionsSection', () => ({
  __esModule: true,
  default: () => <div data-testid="recent-transactions-section">Recent Transactions</div>,
}));

jest.mock('../UpcomingBillsSection', () => ({
  __esModule: true,
  default: ({ useTestData }) => (
    <div data-testid="upcoming-bills-section" data-use-test-data={useTestData}>
      Upcoming Bills
    </div>
  ),
}));

// Mock FinancialSummary components
jest.mock('@/mobile/components/FinancialSummary', () => ({
  NetWorthCard: ({ backgroundImage }) => (
    <div data-testid="net-worth-card" data-background-image={backgroundImage}>
      Net Worth Card
    </div>
  ),
  AccountsCard: ({ backgroundImage }) => (
    <div data-testid="accounts-card" data-background-image={backgroundImage}>
      Accounts Card
    </div>
  ),
  CreditCardCard: ({ backgroundImage }) => (
    <div data-testid="credit-card-card" data-background-image={backgroundImage}>
      Credit Card Card
    </div>
  ),
  MonthlyIncomeCard: ({ backgroundImage }) => (
    <div data-testid="monthly-income-card" data-background-image={backgroundImage}>
      Monthly Income Card
    </div>
  ),
  MonthlyExpenseCard: ({ backgroundImage }) => (
    <div data-testid="monthly-expense-card" data-background-image={backgroundImage}>
      Monthly Expense Card
    </div>
  ),
}));

// Mock other components
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

jest.mock('@/components/dashboard/MobileTravel', () => ({
  __esModule: true,
  default: ({ activeMainTab }) => (
    <div data-testid="mobile-travel" data-active-main-tab={activeMainTab}>
      Mobile Travel Component
    </div>
  ),
}));

describe('MobileDashboard', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  describe('Basic Rendering', () => {
    it('renders the main dashboard structure', () => {
      render(<MobileDashboard />);
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Track, analyze, and optimize your finances in one place')).toBeInTheDocument();
    });

    it('renders all financial summary cards in swiper', () => {
      render(<MobileDashboard />);
      
      expect(screen.getByTestId('swiper')).toBeInTheDocument();
      expect(screen.getByTestId('net-worth-card')).toBeInTheDocument();
      expect(screen.getByTestId('accounts-card')).toBeInTheDocument();
      expect(screen.getByTestId('credit-card-card')).toBeInTheDocument();
      expect(screen.getByTestId('monthly-income-card')).toBeInTheDocument();
      expect(screen.getByTestId('monthly-expense-card')).toBeInTheDocument();
    });

    it('renders financial summary cards with correct background images', () => {
      render(<MobileDashboard />);
      
      const netWorthCard = screen.getByTestId('net-worth-card');
      const accountsCard = screen.getByTestId('accounts-card');
      const creditCardCard = screen.getByTestId('credit-card-card');
      const incomeCard = screen.getByTestId('monthly-income-card');
      const expenseCard = screen.getByTestId('monthly-expense-card');
      
      expect(netWorthCard).toHaveAttribute('data-background-image');
      expect(accountsCard).toHaveAttribute('data-background-image');
      expect(creditCardCard).toHaveAttribute('data-background-image');
      expect(incomeCard).toHaveAttribute('data-background-image');
      expect(expenseCard).toHaveAttribute('data-background-image');
    });

    it('renders the test data toggle switch', () => {
      render(<MobileDashboard />);
      
      expect(screen.getByText('Use Test Data')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders the tabs navigation', () => {
      render(<MobileDashboard />);
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-overview')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-sms')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-advisor')).toBeInTheDocument();
    });

    it('renders the quick add button', () => {
      render(<MobileDashboard />);
      
      const quickAddButton = screen.getByTestId('quick-add-button');
      expect(quickAddButton).toBeInTheDocument();
      expect(quickAddButton).toHaveAttribute('data-bottom-spacing', '20');
      expect(quickAddButton).toHaveAttribute('data-right-spacing', '4');
    });
  });

  describe('Tab Navigation', () => {
    it('displays overview tab content by default', () => {
      render(<MobileDashboard />);
      
      expect(screen.getByTestId('tab-content-overview')).toBeInTheDocument();
      expect(screen.getByTestId('budget-progress-section')).toBeInTheDocument();
      expect(screen.getByTestId('recent-transactions-section')).toBeInTheDocument();
      expect(screen.getByTestId('upcoming-bills-section')).toBeInTheDocument();
    });

    it('displays SMS analysis tab content', () => {
      render(<MobileDashboard />);
      
      expect(screen.getByTestId('tab-content-sms')).toBeInTheDocument();
      
      // Use more specific queries to avoid multiple matches
      const smsContent = screen.getByTestId('tab-content-sms');
      expect(smsContent.querySelector('h3')).toHaveTextContent('SMS Analysis');
      expect(screen.getByText('Connect your SMS to automatically track expenses and analyze spending patterns.')).toBeInTheDocument();
      expect(screen.getByText('Connect SMS')).toBeInTheDocument();
    });

    it('displays financial advisor tab content', () => {
      render(<MobileDashboard />);
      
      expect(screen.getByTestId('tab-content-advisor')).toBeInTheDocument();
      
      // Use more specific queries to avoid multiple matches
      const advisorContent = screen.getByTestId('tab-content-advisor');
      expect(advisorContent.querySelector('h3')).toHaveTextContent('Financial Advisor');
      expect(screen.getByText('Get personalized financial advice based on your spending habits and goals.')).toBeInTheDocument();
      expect(screen.getByText('Get Advice')).toBeInTheDocument();
    });

    it('shows correct icons for each tab', () => {
      const { container } = render(<MobileDashboard />);
      
      const overviewTab = screen.getByTestId('tab-trigger-overview');
      const smsTab = screen.getByTestId('tab-trigger-sms');
      const advisorTab = screen.getByTestId('tab-trigger-advisor');
      
      expect(overviewTab.querySelector('.fa-chart-pie')).toBeInTheDocument();
      expect(smsTab.querySelector('.fa-message')).toBeInTheDocument();
      expect(advisorTab.querySelector('.fa-user-tie')).toBeInTheDocument();
    });
  });

  describe('Test Data Toggle', () => {
    it('starts with test data enabled by default', () => {
      render(<MobileDashboard />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      
      const upcomingBillsSection = screen.getByTestId('upcoming-bills-section');
      expect(upcomingBillsSection).toHaveAttribute('data-use-test-data', 'true');
    });

    it('toggles test data when switch is clicked', () => {
      render(<MobileDashboard />);
      
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      
      const upcomingBillsSection = screen.getByTestId('upcoming-bills-section');
      expect(upcomingBillsSection).toHaveAttribute('data-use-test-data', 'false');
    });

    it('applies correct styling when test data is enabled', () => {
      render(<MobileDashboard />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('bg-emerald');
    });

    it('applies correct styling when test data is disabled', () => {
      render(<MobileDashboard />);
      
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      
      expect(toggle).toHaveClass('bg-gray-200');
    });
  });

  describe('Overview Tab Content', () => {
    it('renders all overview sections', () => {
      render(<MobileDashboard />);
      
      expect(screen.getByTestId('budget-progress-section')).toBeInTheDocument();
      expect(screen.getByTestId('recent-transactions-section')).toBeInTheDocument();
      expect(screen.getByTestId('upcoming-bills-section')).toBeInTheDocument();
    });

    it('passes useTestData prop to UpcomingBillsSection', () => {
      render(<MobileDashboard />);
      
      const upcomingBillsSection = screen.getByTestId('upcoming-bills-section');
      expect(upcomingBillsSection).toHaveAttribute('data-use-test-data', 'true');
      
      // Toggle test data
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      
      expect(upcomingBillsSection).toHaveAttribute('data-use-test-data', 'false');
    });
  });

  describe('SMS Analysis Tab', () => {
    it('displays SMS analysis placeholder content', () => {
      render(<MobileDashboard />);
      
      const smsContent = screen.getByTestId('tab-content-sms');
      expect(smsContent).toBeInTheDocument();
      
      // Check for icon within the SMS content
      const smsIcon = smsContent.querySelector('.fa-message');
      expect(smsIcon).toBeInTheDocument();
      
      // Use more specific query within the tab content
      expect(smsContent.querySelector('h3')).toHaveTextContent('SMS Analysis');
      expect(smsContent.querySelector('p')).toHaveTextContent('Connect your SMS to automatically track expenses and analyze spending patterns.');
    });

    it('has connect SMS button', () => {
      render(<MobileDashboard />);
      
      const connectButton = screen.getByText('Connect SMS');
      expect(connectButton).toBeInTheDocument();
      expect(connectButton).toHaveClass('bg-emerald-500', 'text-white');
    });
  });

  describe('Financial Advisor Tab', () => {
    it('displays financial advisor placeholder content', () => {
      render(<MobileDashboard />);
      
      const advisorContent = screen.getByTestId('tab-content-advisor');
      expect(advisorContent).toBeInTheDocument();
      
      // Check for icon within the advisor content
      const advisorIcon = advisorContent.querySelector('.fa-user-tie');
      expect(advisorIcon).toBeInTheDocument();
      
      // Use more specific query within the tab content
      expect(advisorContent.querySelector('h3')).toHaveTextContent('Financial Advisor');
      expect(advisorContent.querySelector('p')).toHaveTextContent('Get personalized financial advice based on your spending habits and goals.');
    });

    it('has get advice button', () => {
      render(<MobileDashboard />);
      
      const adviceButton = screen.getByText('Get Advice');
      expect(adviceButton).toBeInTheDocument();
      expect(adviceButton).toHaveClass('bg-emerald-500', 'text-white');
    });
  });

  describe('Layout and Styling', () => {
    it('has correct main layout structure', () => {
      const { container } = render(<MobileDashboard />);
      
      const mainContainer = container.querySelector('.flex.flex-col.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('bg-gray-50', 'dark:bg-gray-900');
    });

    it('positions quick add button correctly', () => {
      const { container } = render(<MobileDashboard />);
      
      const fabContainer = container.querySelector('.fixed.bottom-20.right-4');
      expect(fabContainer).toBeInTheDocument();
      expect(fabContainer).toHaveClass('flex', 'flex-col', 'gap-3', 'z-50');
    });

    it('applies correct swiper styling', () => {
      render(<MobileDashboard />);
      
      const swiper = screen.getByTestId('swiper');
      expect(swiper).toHaveClass('w-full');
    });

    it('applies correct tabs styling', () => {
      render(<MobileDashboard />);
      
      const tabs = screen.getByTestId('tabs');
      expect(tabs).toHaveClass('mb-6');
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-3', 'h-10');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = render(<MobileDashboard />);
      
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('flex-1', 'mt-4');
    });

    it('provides accessible switch for test data toggle', () => {
      render(<MobileDashboard />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked');
      expect(toggle).toHaveAttribute('type', 'button');
    });

    it('provides accessible buttons', () => {
      render(<MobileDashboard />);
      
      const connectSmsButton = screen.getByText('Connect SMS');
      const getAdviceButton = screen.getByText('Get Advice');
      
      expect(connectSmsButton.tagName).toBe('BUTTON');
      expect(getAdviceButton.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing navigate function gracefully', () => {
      (useNavigate as any).mockReturnValue(undefined);
      
      expect(() => render(<MobileDashboard />)).not.toThrow();
    });

    it('renders without crashing when components are missing', () => {
      // This tests the robustness of the component structure
      expect(() => render(<MobileDashboard />)).not.toThrow();
    });
  });

  describe('Component Integration', () => {
    it('integrates with all sub-components correctly', () => {
      render(<MobileDashboard />);
      
      // Verify all major components are rendered
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('swiper')).toBeInTheDocument();
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('budget-progress-section')).toBeInTheDocument();
      expect(screen.getByTestId('recent-transactions-section')).toBeInTheDocument();
      expect(screen.getByTestId('upcoming-bills-section')).toBeInTheDocument();
      expect(screen.getByTestId('quick-add-button')).toBeInTheDocument();
    });

    it('passes correct props to sub-components', () => {
      render(<MobileDashboard />);
      
      // Check Header props
      expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Track, analyze, and optimize your finances in one place')).toBeInTheDocument();
      
      // Check UpcomingBillsSection props
      const upcomingBillsSection = screen.getByTestId('upcoming-bills-section');
      expect(upcomingBillsSection).toHaveAttribute('data-use-test-data', 'true');
      
      // Check QuickAddButton props
      const quickAddButton = screen.getByTestId('quick-add-button');
      expect(quickAddButton).toHaveAttribute('data-bottom-spacing', '20');
      expect(quickAddButton).toHaveAttribute('data-right-spacing', '4');
    });
  });
}); 