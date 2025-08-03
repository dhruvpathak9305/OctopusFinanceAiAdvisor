import React, { ReactNode } from 'react';
import { vi } from 'vitest';
import { AuthContext } from '../../../contexts/AuthContext';
import { mockAuthContext } from './mocks';

// React Router uses hooks that require a BrowserRouter, so we mock the hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Wrapper component to provide all contexts needed for tests
export function TestProviders({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to wrap render hooks with the test provider
export function renderHookWithProviders<Result, Props>(
  renderCallback: (props: Props) => Result,
  options?: any
) {
  const { renderHook } = require('@testing-library/react'); // Import dynamically to avoid circular deps
  
  return renderHook(renderCallback, {
    wrapper: TestProviders,
    ...options,
  });
} 