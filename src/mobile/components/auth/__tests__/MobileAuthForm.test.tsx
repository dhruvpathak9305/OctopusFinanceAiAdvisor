import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MobileAuthForm from '../MobileAuthForm';
import { MobileAuthProvider } from '../../../../contexts/MobileAuthContext';

// Mock the auth context
const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('../../../../contexts/MobileAuthContext', () => ({
  useMobileAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    resetPassword: mockResetPassword,
  }),
  MobileAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('MobileAuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <MobileAuthProvider>
        {component}
      </MobileAuthProvider>
    );
  };

  it('renders login form by default', () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<MobileAuthForm />);
    
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('switches to signup mode when signup tab is pressed', () => {
    const { getByText } = renderWithProvider(<MobileAuthForm />);
    
    const signupTab = getByText('Sign Up');
    fireEvent.press(signupTab);
    
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Join Octopus Organizer today')).toBeTruthy();
  });

  it('switches to forgot password mode when forgot password is pressed', () => {
    const { getByText } = renderWithProvider(<MobileAuthForm />);
    
    const forgotPasswordLink = getByText('Forgot your password?');
    fireEvent.press(forgotPasswordLink);
    
    expect(getByText('Reset Password')).toBeTruthy();
    expect(getByText('Enter your email and we\'ll send you a reset link')).toBeTruthy();
  });

  it('validates email format', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<MobileAuthForm />);
    
    const emailInput = getByPlaceholderText('Enter your email');
    const submitButton = getByText('Sign In');
    
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  it('validates required fields', async () => {
    const { getByText } = renderWithProvider(<MobileAuthForm />);
    
    const submitButton = getByText('Sign In');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('calls signIn when login form is submitted with valid data', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<MobileAuthForm />);
    
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const submitButton = getByText('Sign In');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('validates password confirmation in signup mode', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<MobileAuthForm />);
    
    // Switch to signup mode
    const signupTab = getByText('Sign Up');
    fireEvent.press(signupTab);
    
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const confirmPasswordInput = getByPlaceholderText('Confirm your password');
    const submitButton = getByText('Create Account');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'differentpassword');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });

  it('calls signUp when signup form is submitted with valid data', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<MobileAuthForm />);
    
    // Switch to signup mode
    const signupTab = getByText('Sign Up');
    fireEvent.press(signupTab);
    
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const confirmPasswordInput = getByPlaceholderText('Confirm your password');
    const submitButton = getByText('Create Account');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('calls resetPassword when forgot password form is submitted', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<MobileAuthForm />);
    
    // Switch to forgot password mode
    const forgotPasswordLink = getByText('Forgot your password?');
    fireEvent.press(forgotPasswordLink);
    
    const emailInput = getByPlaceholderText('Enter your email');
    const submitButton = getByText('Send Reset Link');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });
}); 