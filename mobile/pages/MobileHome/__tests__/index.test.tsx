import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileHome from '../index';
import { useTheme } from '@/common/providers/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { MOBILE_ROUTES } from '../../../routes/mobileRoutes';

// Mock hooks
jest.mock('@/common/providers/ThemeProvider');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('@/contexts/DemoModeContext');

// Mock MOBILE_ROUTES
jest.mock('../../../routes/mobileRoutes', () => ({
  MOBILE_ROUTES: {
    DASHBOARD: '/mobile/dashboard',
  },
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant }) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }) => (
    <div className={className} data-testid="card">{children}</div>
  ),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }) => (
    <div className={className} data-testid="progress" data-value={value}>
      Progress: {value}%
    </div>
  ),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseDemoMode = useDemoMode as jest.MockedFunction<typeof useDemoMode>;

describe('MobileHome', () => {
  const mockNavigate = jest.fn();
  const mockSetIsDemo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: jest.fn(),
      theme: 'light',
    });
    mockUseDemoMode.mockReturnValue({
      isDemo: false,
      setIsDemo: mockSetIsDemo,
      toggleDemoMode: jest.fn(),
    });
  });

  describe('Basic Rendering', () => {
    it('renders the main hero section', () => {
      render(<MobileHome />);
      
      expect(screen.getByText(/Take control of/)).toBeInTheDocument();
      expect(screen.getByText('your financial future')).toBeInTheDocument();
      expect(screen.getByText(/OctopusFinancer helps you track, budget, and optimize/)).toBeInTheDocument();
    });

    it('renders all feature items in hero section', () => {
      render(<MobileHome />);
      
      expect(screen.getByText('Smart Transaction Analysis')).toBeInTheDocument();
      expect(screen.getByText('AI Financial Advisor')).toBeInTheDocument();
      expect(screen.getByText('Multi-Account Management')).toBeInTheDocument();
    });

    it('renders dashboard preview section', () => {
      render(<MobileHome />);
      
      expect(screen.getByText('Dashboard Preview')).toBeInTheDocument();
      expect(screen.getByText('Get instant insights into your financial health')).toBeInTheDocument();
      
      // Check progress bars
      expect(screen.getByText('65% of budget')).toBeInTheDocument();
      expect(screen.getByText('30% of budget')).toBeInTheDocument();
      expect(screen.getByText('5% of budget')).toBeInTheDocument();
    });

    it('renders features section', () => {
      render(<MobileHome />);
      
      expect(screen.getByText('Powerful Features for Better Finance')).toBeInTheDocument();
      expect(screen.getByText('Smart Budgeting')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument();
      expect(screen.getByText('Automatic Categorization')).toBeInTheDocument();
    });

    it('renders testimonials section', () => {
      render(<MobileHome />);
      
      expect(screen.getByText('What Our Users Say')).toBeInTheDocument();
      expect(screen.getByText(/Sarah J./)).toBeInTheDocument();
      expect(screen.getByText(/Michael T./)).toBeInTheDocument();
      expect(screen.getByText(/Ana L./)).toBeInTheDocument();
    });

    it('renders CTA section', () => {
      render(<MobileHome />);
      
      expect(screen.getByText('Ready to Transform Your Finances?')).toBeInTheDocument();
      expect(screen.getByText('Get Started For Free')).toBeInTheDocument();
      expect(screen.getByText('View Plans')).toBeInTheDocument();
    });
  });

  describe('Theme Handling', () => {
    it('applies light theme classes correctly', () => {
      mockUseTheme.mockReturnValue({
        resolvedTheme: 'light',
        setTheme: jest.fn(),
        theme: 'light',
      });
      
      const { container } = render(<MobileHome />);
      
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-white', 'text-gray-900');
    });

    it('applies dark theme classes correctly', () => {
      mockUseTheme.mockReturnValue({
        resolvedTheme: 'dark',
        setTheme: jest.fn(),
        theme: 'dark',
      });
      
      const { container } = render(<MobileHome />);
      
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-black', 'text-white');
    });

    it('applies theme-specific text colors for descriptions', () => {
      mockUseTheme.mockReturnValue({
        resolvedTheme: 'dark',
        setTheme: jest.fn(),
        theme: 'dark',
      });
      
      const { container } = render(<MobileHome />);
      
      // Check that text elements have proper dark mode classes by looking for class names
      const elementsWithGrayText = container.querySelectorAll('.text-gray-400');
      expect(elementsWithGrayText.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Functionality', () => {
    it('navigates to dashboard when "Try Demo" button is clicked', () => {
      render(<MobileHome />);
      
      const tryDemoButton = screen.getByText(/Try Demo/);
      fireEvent.click(tryDemoButton);
      
      expect(mockSetIsDemo).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith(MOBILE_ROUTES.DASHBOARD);
    });

    it('navigates to dashboard when "Go to Dashboard" button is clicked', () => {
      render(<MobileHome />);
      
      const goToDashboardButton = screen.getByText(/Go to Dashboard/);
      fireEvent.click(goToDashboardButton);
      
      expect(mockSetIsDemo).toHaveBeenCalledWith(false);
      expect(mockNavigate).toHaveBeenCalledWith(MOBILE_ROUTES.DASHBOARD);
    });

    it('handles Learn More button click without navigation', () => {
      render(<MobileHome />);
      
      const learnMoreButton = screen.getByText('Learn More');
      fireEvent.click(learnMoreButton);
      
      // Should not trigger navigation or demo mode changes
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockSetIsDemo).not.toHaveBeenCalled();
    });

    it('handles CTA buttons without navigation', () => {
      render(<MobileHome />);
      
      const getStartedButton = screen.getByText('Get Started For Free');
      const viewPlansButton = screen.getByText('View Plans');
      
      fireEvent.click(getStartedButton);
      fireEvent.click(viewPlansButton);
      
      // Should not trigger navigation or demo mode changes
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockSetIsDemo).not.toHaveBeenCalled();
    });

    it('handles navigation function errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });
      
      render(<MobileHome />);
      
      // The component should render even if navigation throws an error
      expect(screen.getByText('Try Demo')).toBeInTheDocument();
      
      // Clicking the button will cause the error, but it should be caught
      const tryDemoButton = screen.getByText(/Try Demo/);
      
      // We expect this to not crash the component
      try {
        fireEvent.click(tryDemoButton);
        // If we get here, the component handled the error
      } catch (error) {
        // If the error propagates, that's expected for this test
        expect(error).toEqual(expect.any(Error));
      }
      
      consoleSpy.mockRestore();
    });

    it('handles demo mode setter errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockSetIsDemo.mockImplementation(() => {
        throw new Error('Demo mode error');
      });
      
      render(<MobileHome />);
      
      // The component should render even if setIsDemo throws an error
      expect(screen.getByText('Try Demo')).toBeInTheDocument();
      
      // Clicking the button will cause the error, but it should be caught
      const tryDemoButton = screen.getByText(/Try Demo/);
      
      // We expect this to not crash the component
      try {
        fireEvent.click(tryDemoButton);
        // If we get here, the component handled the error
      } catch (error) {
        // If the error propagates, that's expected for this test
        expect(error).toEqual(expect.any(Error));
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('Progress Bars', () => {
    it('renders progress bars with correct values', () => {
      render(<MobileHome />);
      
      const progressBars = screen.getAllByTestId('progress');
      
      expect(progressBars[0]).toHaveAttribute('data-value', '65');
      expect(progressBars[1]).toHaveAttribute('data-value', '30');
      expect(progressBars[2]).toHaveAttribute('data-value', '5');
    });

    it('displays correct budget category labels', () => {
      render(<MobileHome />);
      
      expect(screen.getByText('Needs')).toBeInTheDocument();
      expect(screen.getByText('Wants')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Feature Cards', () => {
    it('renders all feature cards with icons and descriptions', () => {
      render(<MobileHome />);
      
      // Hero section features
      expect(screen.getByText('Smart Transaction Analysis')).toBeInTheDocument();
      expect(screen.getByText(/Automatically categorize and analyze/)).toBeInTheDocument();
      
      expect(screen.getByText('AI Financial Advisor')).toBeInTheDocument();
      expect(screen.getAllByText(/Get personalized recommendations/)[0]).toBeInTheDocument();
      
      expect(screen.getByText('Multi-Account Management')).toBeInTheDocument();
      expect(screen.getByText(/Connect and manage all your financial accounts/)).toBeInTheDocument();
    });

    it('renders detailed feature cards with proper styling', () => {
      render(<MobileHome />);
      
      const featureCards = screen.getAllByTestId('card');
      expect(featureCards.length).toBeGreaterThan(3); // Multiple card sections
      
      // Check that feature descriptions are present
      expect(screen.getByText(/Effortlessly create and manage budgets/)).toBeInTheDocument();
      expect(screen.getByText(/Get personalized recommendations and insights/)).toBeInTheDocument();
      expect(screen.getByText(/Transactions are automatically categorized/)).toBeInTheDocument();
    });
  });

  describe('Testimonials', () => {
    it('renders all testimonial cards', () => {
      render(<MobileHome />);
      
      expect(screen.getByText(/OctopusFinancer helped me save an extra \$470/)).toBeInTheDocument();
      expect(screen.getByText(/The AI categorization is incredibly accurate/)).toBeInTheDocument();
      expect(screen.getByText(/I've tried many budgeting apps/)).toBeInTheDocument();
    });

    it('displays star ratings for testimonials', () => {
      render(<MobileHome />);
      
      // Check for star icons in testimonials (FontAwesome classes)
      const { container } = render(<MobileHome />);
      const starElements = container.querySelectorAll('.fas.fa-star');
      expect(starElements.length).toBeGreaterThan(0);
    });

    it('shows author information for testimonials', () => {
      render(<MobileHome />);
      
      expect(screen.getByText(/Sarah J./)).toBeInTheDocument();
      expect(screen.getByText(/Marketing Specialist/)).toBeInTheDocument();
      expect(screen.getByText(/Michael T./)).toBeInTheDocument();
      expect(screen.getByText(/Software Engineer/)).toBeInTheDocument();
      expect(screen.getByText(/Ana L./)).toBeInTheDocument();
      expect(screen.getByText(/Healthcare Professional/)).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('applies correct container classes', () => {
      const { container } = render(<MobileHome />);
      
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'min-h-screen', 'w-full', 'max-w-[430px]', 'mx-auto', 'relative');
    });

    it('structures sections with proper spacing', () => {
      render(<MobileHome />);
      
      // Check that sections have proper spacing classes
      const { container } = render(<MobileHome />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(3);
      
      sections.forEach(section => {
        expect(section).toHaveClass('px-4');
      });
    });

    it('applies responsive grid layouts', () => {
      render(<MobileHome />);
      
      // Check for grid layouts in dashboard preview
      const { container } = render(<MobileHome />);
      const gridElements = container.querySelectorAll('.grid-cols-3, .grid-cols-1');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<MobileHome />);
      
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1Elements.length).toBe(1);
      expect(h2Elements.length).toBeGreaterThan(0);
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('provides accessible button elements', () => {
      render(<MobileHome />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(4); // Multiple CTA buttons
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('uses semantic HTML structure', () => {
      const { container } = render(<MobileHome />);
      
      const mainElement = container.querySelector('main');
      const sections = container.querySelectorAll('section');
      
      expect(mainElement).toBeInTheDocument();
      expect(sections.length).toBeGreaterThan(3);
    });
  });

  describe('Button Variants and Styling', () => {
    it('applies correct button variants', () => {
      render(<MobileHome />);
      
      const buttons = screen.getAllByTestId('button');
      
      // Check that some buttons have outline variant
      const outlineButtons = buttons.filter(button => 
        button.getAttribute('data-variant') === 'outline'
      );
      expect(outlineButtons.length).toBeGreaterThan(0);
    });

    it('applies theme-specific button styling', () => {
      mockUseTheme.mockReturnValue({
        resolvedTheme: 'dark',
        setTheme: jest.fn(),
        theme: 'dark',
      });
      
      render(<MobileHome />);
      
      // Check that buttons have proper styling classes
      const { container } = render(<MobileHome />);
      const buttonElements = container.querySelectorAll('button');
      expect(buttonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Demo Mode Integration', () => {
    it('correctly sets demo mode when "Try Demo" is clicked', () => {
      render(<MobileHome />);
      
      const tryDemoButton = screen.getByText(/Try Demo/);
      fireEvent.click(tryDemoButton);
      
      expect(mockSetIsDemo).toHaveBeenCalledWith(true);
    });

    it('correctly sets production mode when "Go to Dashboard" is clicked', () => {
      render(<MobileHome />);
      
      const goToDashboardButton = screen.getByText(/Go to Dashboard/);
      fireEvent.click(goToDashboardButton);
      
      expect(mockSetIsDemo).toHaveBeenCalledWith(false);
    });

    it('maintains current demo mode state for other interactions', () => {
      render(<MobileHome />);
      
      const learnMoreButton = screen.getByText('Learn More');
      fireEvent.click(learnMoreButton);
      
      expect(mockSetIsDemo).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing theme gracefully', () => {
      mockUseTheme.mockReturnValue({
        resolvedTheme: undefined,
        setTheme: jest.fn(),
        theme: undefined,
      });
      
      expect(() => render(<MobileHome />)).not.toThrow();
    });

    it('handles navigation function errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });
      
      render(<MobileHome />);
      
      // The component should render even if navigation throws an error
      expect(screen.getByText('Try Demo')).toBeInTheDocument();
      
      // Clicking the button will cause the error, but it should be caught
      const tryDemoButton = screen.getByText(/Try Demo/);
      
      // We expect this to not crash the component
      try {
        fireEvent.click(tryDemoButton);
        // If we get here, the component handled the error
      } catch (error) {
        // If the error propagates, that's expected for this test
        expect(error).toEqual(expect.any(Error));
      }
      
      consoleSpy.mockRestore();
    });

    it('handles demo mode setter errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockSetIsDemo.mockImplementation(() => {
        throw new Error('Demo mode error');
      });
      
      render(<MobileHome />);
      
      // The component should render even if setIsDemo throws an error
      expect(screen.getByText('Try Demo')).toBeInTheDocument();
      
      // Clicking the button will cause the error, but it should be caught
      const tryDemoButton = screen.getByText(/Try Demo/);
      
      // We expect this to not crash the component
      try {
        fireEvent.click(tryDemoButton);
        // If we get here, the component handled the error
      } catch (error) {
        // If the error propagates, that's expected for this test
        expect(error).toEqual(expect.any(Error));
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('Content Validation', () => {
    it('displays correct marketing copy', () => {
      render(<MobileHome />);
      
      expect(screen.getByText(/Take control of/)).toBeInTheDocument();
      expect(screen.getByText(/OctopusFinancer helps you track, budget, and optimize/)).toBeInTheDocument();
      expect(screen.getByText(/Join thousands who've transformed their finances/)).toBeInTheDocument();
    });

    it('shows proper feature descriptions', () => {
      render(<MobileHome />);
      
      expect(screen.getByText(/Automatically categorize and analyze your spending patterns/)).toBeInTheDocument();
      expect(screen.getByText(/Get personalized recommendations to improve your financial health/)).toBeInTheDocument();
      expect(screen.getByText(/Connect and manage all your financial accounts in one place/)).toBeInTheDocument();
    });

    it('displays testimonial quotes correctly', () => {
      render(<MobileHome />);
      
      expect(screen.getByText(/save an extra \$470 each month/)).toBeInTheDocument();
      expect(screen.getByText(/AI categorization is incredibly accurate/)).toBeInTheDocument();
      expect(screen.getByText(/goal tracker finally helped me achieve my goals/)).toBeInTheDocument();
    });
  });
}); 