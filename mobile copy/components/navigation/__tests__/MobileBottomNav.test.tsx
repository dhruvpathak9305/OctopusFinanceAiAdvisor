import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileBottomNav from '../MobileBottomNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/common/providers/ThemeProvider';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock theme provider
jest.mock('@/common/providers/ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, ...props }) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock mobile routes
jest.mock('../../../routes/mobileRoutes', () => ({
  MOBILE_ROUTES: {
    HOME: '/',
    DASHBOARD: '/dashboard',
    PORTFOLIO: '/portfolio',
    TRAVEL: '/travel',
    GOALS: '/goals',
    SETTINGS: '/settings',
  },
}));

describe('MobileBottomNav', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useTheme as any).mockReturnValue({
      resolvedTheme: 'light',
    });
  });

  describe('Basic Rendering', () => {
    it('renders navigation with correct structure', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('Travel')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders all navigation items with correct icons', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const expectedIcons = [
        'fa-home',
        'fa-chart-pie',
        'fa-bullseye',
        'fa-plane',
        'fa-cog',
      ];

      expectedIcons.forEach(iconClass => {
        const iconElement = container.querySelector(`.fas.${iconClass}`);
        expect(iconElement).toBeInTheDocument();
      });
    });

    it('has correct grid layout structure', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const gridContainer = container.querySelector('.grid.grid-cols-5.h-16');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Active State Management', () => {
    it('dashboard nav item is inactive when on home route', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      
      render(<MobileBottomNav />);
      
      // Dashboard nav item is rendered with '/dashboard' path, so when we're on '/' it's inactive
      const dashboardText = screen.getByText('Dashboard');
      expect(dashboardText).toHaveClass('text-[10px]', 'leading-none');
      expect(dashboardText).not.toHaveClass('text-emerald-500', 'font-semibold');
    });

    it('marks dashboard as active when on dashboard route', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const dashboardText = screen.getByText('Dashboard');
      expect(dashboardText).toHaveClass('text-[10px]', 'mt-0', 'text-emerald-500', 'font-semibold');
      
      const dashboardIcon = container.querySelector('.fa-home');
      expect(dashboardIcon).toHaveClass('text-emerald-500');
    });

    it('marks correct item as active for different routes', () => {
      const testCases = [
        { pathname: '/portfolio', expectedActiveText: 'Portfolio' },
        { pathname: '/goals', expectedActiveText: 'Goals' },
        { pathname: '/travel', expectedActiveText: 'Travel' },
        { pathname: '/settings', expectedActiveText: 'Settings' },
      ];

      testCases.forEach(({ pathname, expectedActiveText }) => {
        (useLocation as any).mockReturnValue({ pathname });
        const { rerender } = render(<MobileBottomNav />);
        
        const activeText = screen.getByText(expectedActiveText);
        expect(activeText).toHaveClass('text-[10px]', 'mt-0', 'text-emerald-500', 'font-semibold');
        
        rerender(<div />); // Clear for next test
      });
    });

    it('shows inactive styling for non-active items', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      const portfolioText = screen.getByText('Portfolio');
      expect(portfolioText).toHaveClass('text-[10px]', 'leading-none');
      expect(portfolioText).not.toHaveClass('text-emerald-500', 'font-semibold');
    });
  });

  describe('Theme Support', () => {
    it('applies light theme styling correctly for inactive items', () => {
      (useTheme as any).mockReturnValue({
        resolvedTheme: 'light',
      });
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' }); // Dashboard active, portfolio inactive
      
      render(<MobileBottomNav />);
      
      const portfolioText = screen.getByText('Portfolio');
      expect(portfolioText).toHaveClass('text-[10px]', 'leading-none');
    });

    it('applies dark theme styling correctly for inactive items', () => {
      (useTheme as any).mockReturnValue({
        resolvedTheme: 'dark',
      });
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' }); // Dashboard active, portfolio inactive
      
      render(<MobileBottomNav />);
      
      const portfolioText = screen.getByText('Portfolio');
      expect(portfolioText).toHaveClass('text-[10px]', 'leading-none');
    });

    it('applies correct background styling for active items in dark theme', () => {
      (useTheme as any).mockReturnValue({
        resolvedTheme: 'dark',
      });
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const activeContainer = container.querySelector('.bg-gray-200\\/40');
      expect(activeContainer).toBeInTheDocument();
    });

    it('applies correct background styling for active items in light theme', () => {
      (useTheme as any).mockReturnValue({
        resolvedTheme: 'light',
      });
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const activeContainer = container.querySelector('.bg-gray-800\\/00');
      expect(activeContainer).toBeInTheDocument();
    });
  });

  describe('Navigation Functionality', () => {
    it('navigates to dashboard when Dashboard tab is clicked', () => {
      (useLocation as any).mockReturnValue({ pathname: '/portfolio' });
      
      render(<MobileBottomNav />);
      
      // Dashboard should be a button when not active
      const dashboardButton = screen.getByText('Dashboard').closest('button');
      fireEvent.click(dashboardButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('navigates when active dashboard item is clicked', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      // Dashboard should be a div when active
      const dashboardItem = screen.getByText('Dashboard').closest('div');
      fireEvent.click(dashboardItem);
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('navigates to portfolio when Portfolio tab is clicked', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      const portfolioButton = screen.getByText('Portfolio').closest('button');
      fireEvent.click(portfolioButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/portfolio');
    });

    it('navigates correctly for all navigation items', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const testCases = [
        { text: 'Portfolio', expectedRoute: '/portfolio' },
        { text: 'Goals', expectedRoute: '/goals' },
        { text: 'Travel', expectedRoute: '/travel' },
        { text: 'Settings', expectedRoute: '/settings' },
      ];

      render(<MobileBottomNav />);

      testCases.forEach(({ text, expectedRoute }) => {
        mockNavigate.mockClear();
        
        const navItem = screen.getByText(text).closest('button');
        fireEvent.click(navItem);
        
        expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
      });
    });
  });

  describe('Active vs Inactive Rendering', () => {
    it('renders active item with special container div', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      const dashboardContainer = screen.getByText('Dashboard').closest('div');
      expect(dashboardContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'h-full', 'cursor-pointer');
    });

    it('renders inactive items as buttons', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      const portfolioButton = screen.getByText('Portfolio').closest('button');
      expect(portfolioButton).toHaveAttribute('data-variant', 'ghost');
      expect(portfolioButton).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'h-full', 'rounded-none', 'space-y-0');
    });

    it('applies correct icon styling for active items', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const activeIcon = container.querySelector('.fa-home');
      expect(activeIcon).toHaveClass('text-xl', 'text-emerald-500');
    });

    it('applies correct icon styling for inactive items', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const inactiveIcon = container.querySelector('.fa-chart-pie');
      expect(inactiveIcon).toHaveClass('text-lg', 'mb-0.5', 'text-muted-foreground');
    });
  });

  describe('Layout and Styling', () => {
    it('has fixed bottom positioning', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('fixed', 'bottom-0', 'w-full', 'z-50');
    });

    it('has proper border and background styling', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      const { container } = render(<MobileBottomNav />);
      
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-background', 'border-t', 'border-border', 'dark:bg-gray-950');
    });

    it('has correct text sizing for labels', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      const labels = screen.getAllByText(/Dashboard|Portfolio|Goals|Travel|Settings/);
      labels.forEach(label => {
        expect(label).toHaveClass('text-[10px]');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('provides clickable elements for navigation', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4); // 4 inactive buttons (1 active is a div)
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('maintains accessibility for active items with div containers', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileBottomNav />);
      
      const dashboardContainer = screen.getByText('Dashboard').closest('div');
      expect(dashboardContainer).toHaveClass('cursor-pointer');
    });
  });

  describe('Edge Cases', () => {
    it('handles unknown routes gracefully', () => {
      (useLocation as any).mockReturnValue({ pathname: '/unknown-route' });
      
      expect(() => render(<MobileBottomNav />)).not.toThrow();
      
      // Should not have any active items
      const { container } = render(<MobileBottomNav />);
      const activeElements = container.querySelectorAll('.text-emerald-500');
      expect(activeElements).toHaveLength(0);
    });

    it('handles missing theme gracefully', () => {
      (useTheme as any).mockReturnValue({
        resolvedTheme: undefined,
      });
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      expect(() => render(<MobileBottomNav />)).not.toThrow();
    });
  });
}); 