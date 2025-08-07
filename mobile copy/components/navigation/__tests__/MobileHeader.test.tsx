import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileHeader from '../MobileHeader';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useTheme } from '@/common/providers/ThemeProvider';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock contexts
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/DemoModeContext', () => ({
  useDemoMode: jest.fn(),
}));

jest.mock('@/common/providers/ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size, ...props }) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant} 
      data-size={size}
      {...props}
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
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={className}
      data-testid="demo-switch"
    />
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div>{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children }) => <div>{children}</div>,
}));

jest.mock('@/components/common/ThemeToggle', () => ({
  __esModule: true,
  default: ({ className, iconSize }) => (
    <button 
      data-testid="theme-toggle" 
      className={className}
      data-icon-size={iconSize}
    >
      Theme Toggle
    </button>
  ),
}));

jest.mock('lucide-react', () => ({
  // Navigation and UI icons
  FlaskConical: () => <div data-testid="flask-icon">Flask</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Bell: () => <div data-testid="bell-icon">Bell</div>,
  PlusIcon: () => <div data-testid="plus-icon">Plus</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  
  // Financial icons
  DollarSign: () => <div data-testid="dollar-sign-icon">DollarSign</div>,
  CreditCard: () => <div data-testid="credit-card-icon">CreditCard</div>,
  Wallet: () => <div data-testid="wallet-icon">Wallet</div>,
  Receipt: () => <div data-testid="receipt-icon">Receipt</div>,
  Coins: () => <div data-testid="coins-icon">Coins</div>,
  PiggyBank: () => <div data-testid="piggy-bank-icon">PiggyBank</div>,
  Landmark: () => <div data-testid="landmark-icon">Landmark</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  
  // Category icons
  ShoppingCart: () => <div data-testid="shopping-cart-icon">ShoppingCart</div>,
  ShoppingBag: () => <div data-testid="shopping-bag-icon">ShoppingBag</div>,
  Car: () => <div data-testid="car-icon">Car</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  BookOpen: () => <div data-testid="book-open-icon">BookOpen</div>,
  Book: () => <div data-testid="book-icon">Book</div>,
  Smartphone: () => <div data-testid="smartphone-icon">Smartphone</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Wifi: () => <div data-testid="wifi-icon">Wifi</div>,
  Utensils: () => <div data-testid="utensils-icon">Utensils</div>,
  Film: () => <div data-testid="film-icon">Film</div>,
  Plane: () => <div data-testid="plane-icon">Plane</div>,
  Headphones: () => <div data-testid="headphones-icon">Headphones</div>,
  Gamepad: () => <div data-testid="gamepad-icon">Gamepad</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  Scissors: () => <div data-testid="scissors-icon">Scissors</div>,
  Umbrella: () => <div data-testid="umbrella-icon">Umbrella</div>,
  Baby: () => <div data-testid="baby-icon">Baby</div>,
  Briefcase: () => <div data-testid="briefcase-icon">Briefcase</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Building: () => <div data-testid="building-icon">Building</div>,
  Coffee: () => <div data-testid="coffee-icon">Coffee</div>,
  Gift: () => <div data-testid="gift-icon">Gift</div>,
  Diamond: () => <div data-testid="diamond-icon">Diamond</div>,
  Bike: () => <div data-testid="bike-icon">Bike</div>,
  Edit3: () => <div data-testid="edit3-icon">Edit3</div>,
  Music: () => <div data-testid="music-icon">Music</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  Truck: () => <div data-testid="truck-icon">Truck</div>,
  School: () => <div data-testid="school-icon">School</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  
  // Utility icons
  Droplets: () => <div data-testid="droplets-icon">Droplets</div>,
  Pizza: () => <div data-testid="pizza-icon">Pizza</div>,
  Laptop: () => <div data-testid="laptop-icon">Laptop</div>,
  HeartPulse: () => <div data-testid="heart-pulse-icon">HeartPulse</div>,
  GraduationCap: () => <div data-testid="graduation-cap-icon">GraduationCap</div>,
  Shirt: () => <div data-testid="shirt-icon">Shirt</div>,
  Wine: () => <div data-testid="wine-icon">Wine</div>,
  Palette: () => <div data-testid="palette-icon">Palette</div>,
  Wrench: () => <div data-testid="wrench-icon">Wrench</div>,
  Bus: () => <div data-testid="bus-icon">Bus</div>,
  Wind: () => <div data-testid="wind-icon">Wind</div>,
  LifeBuoy: () => <div data-testid="life-buoy-icon">LifeBuoy</div>,
  Train: () => <div data-testid="train-icon">Train</div>,
  
  // Action icons
  Pencil: () => <div data-testid="pencil-icon">Pencil</div>,
  Trash2: () => <div data-testid="trash2-icon">Trash2</div>,
  MoreVertical: () => <div data-testid="more-vertical-icon">MoreVertical</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  X: () => <div data-testid="x-icon">X</div>,
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

describe('MobileHeader', () => {
  const mockNavigate = jest.fn();
  const mockSignOut = jest.fn();
  const mockToggleDemoMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useTheme as any).mockReturnValue({
      resolvedTheme: 'light',
    });
    (useAuth as any).mockReturnValue({
      user: null,
      signOut: mockSignOut,
      loading: false,
    });
    (useDemoMode as any).mockReturnValue({
      isDemo: false,
      toggleDemoMode: mockToggleDemoMode,
    });
  });

  describe('Basic Rendering', () => {
    it('renders header with correct structure', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      
      render(<MobileHeader />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('OctopusFinancer')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('displays correct page title based on route', () => {
      const testCases = [
        { pathname: '/', expectedTitle: 'OctopusFinancer' },
        { pathname: '/dashboard', expectedTitle: 'OctopusFinancer' },
        { pathname: '/portfolio', expectedTitle: 'Portfolio' },
        { pathname: '/travel', expectedTitle: 'Travel' },
        { pathname: '/goals', expectedTitle: 'Goals' },
        { pathname: '/settings', expectedTitle: 'Settings' },
      ];

      testCases.forEach(({ pathname, expectedTitle }) => {
        (useLocation as any).mockReturnValue({ pathname });
        const { rerender } = render(<MobileHeader />);
        
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
        rerender(<div />); // Clear for next test
      });
    });

    it('displays correct header icon based on route', () => {
      const testCases = [
        { pathname: '/', expectedIcon: 'fa-chart-line' },
        { pathname: '/dashboard', expectedIcon: 'fa-chart-line' },
        { pathname: '/portfolio', expectedIcon: 'fa-chart-pie' },
        { pathname: '/travel', expectedIcon: 'fa-plane' },
        { pathname: '/goals', expectedIcon: 'fa-bullseye' },
        { pathname: '/settings', expectedIcon: 'fa-cog' },
      ];

      testCases.forEach(({ pathname, expectedIcon }) => {
        (useLocation as any).mockReturnValue({ pathname });
        const { container, rerender } = render(<MobileHeader />);
        
        const iconElement = container.querySelector(`.fas.${expectedIcon}`);
        expect(iconElement).toBeInTheDocument();
        rerender(<div />); // Clear for next test
      });
    });
  });

  describe('Authentication States', () => {
    it('shows login and signup buttons on home page when not authenticated', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      (useAuth as any).mockReturnValue({
        user: null,
        signOut: mockSignOut,
        loading: false,
      });
      
      render(<MobileHeader />);
      
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('shows logout button when authenticated', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      (useAuth as any).mockReturnValue({
        user: { id: '1', email: 'test@example.com' },
        signOut: mockSignOut,
        loading: false,
      });
      
      render(<MobileHeader />);
      
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
    });

    it('shows loading state when auth is loading', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      (useAuth as any).mockReturnValue({
        user: null,
        signOut: mockSignOut,
        loading: true,
      });
      
      const { container } = render(<MobileHeader />);
      
      const loadingElement = container.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });

    it('shows notification bell on non-home pages when not authenticated', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      (useAuth as any).mockReturnValue({
        user: null,
        signOut: mockSignOut,
        loading: false,
      });
      
      const { container } = render(<MobileHeader />);
      
      const bellIcon = container.querySelector('.fa-bell');
      expect(bellIcon).toBeInTheDocument();
    });
  });

  describe('Demo Mode Toggle', () => {
    it('shows demo toggle on dashboard pages', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileHeader />);
      
      expect(screen.getByText('Demo')).toBeInTheDocument();
      expect(screen.getByTestId('flask-icon')).toBeInTheDocument();
    });

    it('does not show demo toggle on home page', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      
      render(<MobileHeader />);
      
      expect(screen.queryByText('Demo')).not.toBeInTheDocument();
    });

    it('does not show demo toggle on auth page', () => {
      (useLocation as any).mockReturnValue({ pathname: '/auth' });
      
      render(<MobileHeader />);
      
      expect(screen.queryByText('Demo')).not.toBeInTheDocument();
    });

    it('toggles demo mode when switch is clicked', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileHeader />);
      
      const demoButton = screen.getByText('Demo').closest('button');
      fireEvent.click(demoButton);
      
      expect(mockToggleDemoMode).toHaveBeenCalled();
    });

    it('reflects demo mode state in switch', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      (useDemoMode as any).mockReturnValue({
        isDemo: true,
        toggleDemoMode: mockToggleDemoMode,
      });
      
      render(<MobileHeader />);
      
      const demoButton = screen.getByText('Demo').closest('button');
      expect(demoButton).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to home when title is clicked', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      
      render(<MobileHeader />);
      
      const titleElement = screen.getByText('OctopusFinancer').closest('div');
      fireEvent.click(titleElement);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to auth page when login button is clicked', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      
      render(<MobileHeader />);
      
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });

    it('navigates to auth page when signup button is clicked', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      
      render(<MobileHeader />);
      
      const signupButton = screen.getByText('Sign up');
      fireEvent.click(signupButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  describe('Logout Functionality', () => {
    it('calls signOut and navigates home on logout', async () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      (useAuth as any).mockReturnValue({
        user: { id: '1', email: 'test@example.com' },
        signOut: mockSignOut.mockResolvedValue(undefined),
        loading: false,
      });
      
      render(<MobileHeader />);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles logout error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      (useAuth as any).mockReturnValue({
        user: { id: '1', email: 'test@example.com' },
        signOut: mockSignOut.mockRejectedValue(new Error('Logout failed')),
        loading: false,
      });
      
      render(<MobileHeader />);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Theme Integration', () => {
    it('passes correct props to ThemeToggle', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      
      render(<MobileHeader />);
      
      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toHaveAttribute('data-icon-size', '3');
      expect(themeToggle).toHaveClass('relative', 'z-10', 'border');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      
      render(<MobileHeader />);
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('provides accessible button elements', () => {
      (useLocation as any).mockReturnValue({ pathname: '/' });
      
      render(<MobileHeader />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles unknown routes gracefully', () => {
      (useLocation as any).mockReturnValue({ pathname: '/unknown-route' });
      
      render(<MobileHeader />);
      
      expect(screen.getByText('OctopusFinancer')).toBeInTheDocument();
      
      const { container } = render(<MobileHeader />);
      const iconElement = container.querySelector('.fas.fa-chart-line');
      expect(iconElement).toBeInTheDocument();
    });

    it('handles missing user gracefully', () => {
      (useLocation as any).mockReturnValue({ pathname: '/dashboard' });
      (useAuth as any).mockReturnValue({
        user: undefined,
        signOut: mockSignOut,
        loading: false,
      });
      
      expect(() => render(<MobileHeader />)).not.toThrow();
    });
  });
}); 