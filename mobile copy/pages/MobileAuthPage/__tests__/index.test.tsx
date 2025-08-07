import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileAuthPage from '../index';
import { useTheme } from '@/common/providers/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MOBILE_ROUTES } from '../../../routes/mobileRoutes';

// Mock hooks
jest.mock('@/common/providers/ThemeProvider');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('@/contexts/AuthContext');

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

// Mock MobileAuthForm component
jest.mock('@/components/auth/MobileAuthForm', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mobile-auth-form">
      <form>
        <input data-testid="email-input" placeholder="Email" />
        <input data-testid="password-input" placeholder="Password" type="password" />
        <button data-testid="login-button" type="submit">Login</button>
        <button data-testid="signup-button" type="button">Sign Up</button>
      </form>
    </div>
  ),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Create a complete mock user object
const mockUser = {
  id: '1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  role: 'authenticated',
  confirmation_sent_at: '2023-01-01T00:00:00Z',
};

// Create a complete mock auth context
const createMockAuthContext = (overrides = {}) => ({
  session: null,
  user: null,
  loading: false,
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  ...overrides,
});

describe('MobileAuthPage', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: jest.fn(),
      theme: 'light',
    });
    mockUseAuth.mockReturnValue(createMockAuthContext());
  });

  describe('Basic Rendering', () => {
    it('renders the main authentication page', () => {
      render(<MobileAuthPage />);
      
      expect(screen.getByText('Welcome to Octopus Financer')).toBeInTheDocument();
      expect(screen.getByText('Your personal finance assistant')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-auth-form')).toBeInTheDocument();
    });

    it('renders all feature sections', () => {
      render(<MobileAuthPage />);
      
      expect(screen.getByText('Why Choose OctopusFinancer?')).toBeInTheDocument();
      expect(screen.getByText('Smart Budget Tracking')).toBeInTheDocument();
      expect(screen.getByText('Financial Goal Planning')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument();
    });
  });

  describe('Authentication State Handling', () => {
    it('redirects to dashboard when user is authenticated', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: mockUser,
        loading: false,
      }));
      
      render(<MobileAuthPage />);
      
      expect(mockNavigate).toHaveBeenCalledWith(MOBILE_ROUTES.DASHBOARD);
    });

    it('does not redirect when user is null', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: null,
        loading: false,
      }));
      
      render(<MobileAuthPage />);
      
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByTestId('mobile-auth-form')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner when auth is loading', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext({
        user: null,
        loading: true,
      }));
      
      render(<MobileAuthPage />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-auth-form')).not.toBeInTheDocument();
    });
  });

  describe('Theme Handling', () => {
    it('applies light theme classes correctly', () => {
      mockUseTheme.mockReturnValue({
        resolvedTheme: 'light',
        setTheme: jest.fn(),
        theme: 'light',
      });
      
      const { container } = render(<MobileAuthPage />);
      
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-white', 'text-gray-900');
    });

    it('applies dark theme classes correctly', () => {
      mockUseTheme.mockReturnValue({
        resolvedTheme: 'dark',
        setTheme: jest.fn(),
        theme: 'dark',
      });
      
      const { container } = render(<MobileAuthPage />);
      
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-black', 'text-white');
    });
  });
}); 