/**
 * =============================================================================
 * SUBSCRIPTION CONTEXT - REACT CONTEXT FOR SUBSCRIPTION STATE
 * =============================================================================
 * 
 * Provides subscription status across the app.
 * Manages premium status, sync capability, and subscription tier.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import subscriptionService, { SubscriptionStatus } from '../services/subscription/subscriptionService';
import { useUnifiedAuth } from './UnifiedAuthContext';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isPremium: boolean;
  isAuthenticated: boolean;
  canSync: boolean;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated: authIsAuthenticated } = useUnifiedAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await subscriptionService.checkSubscriptionStatus(true);
      setSubscriptionStatus(status);
    } catch (err: any) {
      console.error('Error refreshing subscription:', err);
      setError(err.message || 'Failed to refresh subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    refreshSubscription();

    // Refresh when auth state changes
    if (authIsAuthenticated) {
      refreshSubscription();
    }
  }, [authIsAuthenticated]);

  // Periodic refresh (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (authIsAuthenticated) {
        refreshSubscription();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [authIsAuthenticated]);

  const value: SubscriptionContextType = {
    subscriptionStatus,
    isPremium: subscriptionStatus?.isPremium || false,
    isAuthenticated: subscriptionStatus?.isAuthenticated || false,
    canSync: subscriptionStatus?.canSync || false,
    loading,
    error,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

