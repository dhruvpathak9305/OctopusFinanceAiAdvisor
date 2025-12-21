import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { useDemoMode } from './DemoModeContext';
import { useUnifiedAuth } from './UnifiedAuthContext';
import { useSubscription } from './SubscriptionContext';
import * as creditCardService from '../services/creditCardService';
import * as creditCardServiceLocal from '../services/creditCardsServiceLocal';
import { networkMonitor } from '../services/sync/networkMonitor';

export interface CreditCard {
  id?: string;
  user_id?: string;
  name: string;
  bank: string;
  logoUrl?: string;
  lastFourDigits: string;
  creditLimit: number;
  currentBalance: number;
  dueDate: string;
  billingCycle?: string;
  issuer?: string;
  balance?: number;
  limit?: number;
  created_at?: string;
  updated_at?: string;
  utilizationPercentage?: number;
  availableCredit?: number;
  daysUntilDue?: number;
  isOverdue?: boolean;
}

export const billingCycles = [
  "Monthly",
  "Bi-weekly",
  "Weekly"
];

export interface CreditCardContextType {
  creditCards: CreditCard[];
  loading: boolean;
  error: string | null;
  fetchCreditCards: () => Promise<void>;
  addCreditCard: (creditCard: Omit<CreditCard, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateCreditCard: (id: string, creditCard: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  summary?: {
    totalCreditLimit: number;
    totalCurrentBalance: number;
    totalAvailableCredit: number;
    averageUtilization: number;
    totalCards: number;
    highUtilizationCards: number;
    upcomingDueDates: number;
  };
}

export const CreditCardContext = createContext<CreditCardContextType>({
  creditCards: [],
  loading: false,
  error: null,
  fetchCreditCards: async () => {},
  addCreditCard: async () => {},
  updateCreditCard: async () => {},
  deleteCreditCard: async () => {}
});

/**
 * Convert local service CreditCard to context CreditCard format
 */
function mapLocalToContextCard(localCard: creditCardServiceLocal.CreditCardWithUtilization): CreditCard {
  return {
    id: localCard.id,
    user_id: localCard.user_id,
    name: localCard.name,
    bank: localCard.institution,
    logoUrl: localCard.logo_url || undefined,
    lastFourDigits: localCard.last_four_digits.toString(),
    creditLimit: localCard.credit_limit,
    currentBalance: localCard.current_balance,
    dueDate: localCard.due_date || new Date().toISOString().split('T')[0],
    billingCycle: localCard.billing_cycle || undefined,
    utilizationPercentage: localCard.utilizationPercentage,
    availableCredit: localCard.availableCredit,
    daysUntilDue: localCard.daysUntilDue,
    isOverdue: localCard.isOverdue,
    created_at: localCard.created_at ? new Date(localCard.created_at).toISOString() : undefined,
    updated_at: localCard.updated_at ? new Date(localCard.updated_at).toISOString() : undefined,
  };
}

/**
 * Convert context CreditCard to local service format
 */
function mapContextToLocalCard(contextCard: Omit<CreditCard, "id" | "user_id" | "created_at" | "updated_at">): Omit<creditCardServiceLocal.CreditCardInsert, 'user_id'> {
  return {
    name: contextCard.name,
    institution: contextCard.bank,
    last_four_digits: parseInt(contextCard.lastFourDigits, 10),
    credit_limit: contextCard.creditLimit,
    current_balance: contextCard.currentBalance,
    due_date: contextCard.dueDate,
    billing_cycle: contextCard.billingCycle || null,
    logo_url: contextCard.logoUrl || null,
  };
}

export const CreditCardProvider = ({ children }: { children: ReactNode }) => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [summary, setSummary] = useState<CreditCardContextType['summary']>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { isDemo } = useDemoMode();
  const { user, isAuthenticated } = useUnifiedAuth();
  const { isPremium, canSync } = useSubscription();

  // Get user ID - use authenticated user ID if available, otherwise fallback
  const userId = user?.id || '';

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = async () => {
      const status = await networkMonitor.getStatus();
      setIsOnline(status === 'online');
    };

    updateNetworkStatus();
    const unsubscribe = networkMonitor.addListener((status) => {
      setIsOnline(status === 'online');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Function to fetch credit cards (local-first with fallback)
  const fetchCreditCards = useCallback(async () => {
    if (!userId) {
      console.log('CreditCardProvider: No user ID available, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try local-first approach
      try {
        const localCards = await creditCardServiceLocal.fetchCreditCardsLocal(
          userId,
          isPremium,
          isOnline
        );
        
        const contextCards = localCards.map(mapLocalToContextCard);
        setCreditCards(contextCards);

        // Fetch summary
        try {
          const cardSummary = await creditCardServiceLocal.fetchCreditCardSummary(
            userId,
            isPremium,
            isOnline
          );
          setSummary(cardSummary);
        } catch (summaryError) {
          console.warn('Failed to fetch credit card summary:', summaryError);
        }

        setLoading(false);
        return;
      } catch (localError) {
        console.warn('Local fetch failed, falling back to Supabase:', localError);
        
        // Fallback to Supabase if local fails
        if (isAuthenticated && !isDemo) {
          const supabaseCards = await creditCardService.fetchCreditCards(isDemo);
          setCreditCards(supabaseCards);
          setLoading(false);
          return;
        }
        
        throw localError;
      }
    } catch (err) {
      console.error('Error fetching credit cards:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [userId, isPremium, isOnline, isAuthenticated, isDemo]);

  // Load credit cards when dependencies change
  useEffect(() => {
    if (userId) {
      fetchCreditCards();
    }
  }, [userId, isPremium, isOnline, isAuthenticated, isDemo, fetchCreditCards]);

  // Add new credit card (local-first with optimistic update)
  const addCreditCard = useCallback(async (creditCard: Omit<CreditCard, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Ensure required fields are present
      if (!creditCard.lastFourDigits) {
        throw new Error("Last four digits are required");
      }

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticCard: CreditCard = {
        ...creditCard,
        id: tempId,
        user_id: userId,
      };
      setCreditCards(prev => [...prev, optimisticCard]);

      try {
        // Try local-first
        const localCardData = mapContextToLocalCard(creditCard);
        const newLocalCard = await creditCardServiceLocal.addCreditCardLocal(
          localCardData,
          userId,
          isPremium,
          isOnline
        );
        
        const contextCard = mapLocalToContextCard(newLocalCard);
        setCreditCards(prev => prev.map(cc => cc.id === tempId ? contextCard : cc));
      } catch (localError) {
        // Fallback to Supabase
        if (isAuthenticated && !isDemo) {
          const newCard = await creditCardService.addCreditCard({
            ...creditCard,
            lastFourDigits: creditCard.lastFourDigits
          }, isDemo);
          setCreditCards(prev => prev.map(cc => cc.id === tempId ? newCard : cc));
        } else {
          throw localError;
        }
      }

      // Refresh summary
      if (userId) {
        try {
          const cardSummary = await creditCardServiceLocal.fetchCreditCardSummary(
            userId,
            isPremium,
            isOnline
          );
          setSummary(cardSummary);
        } catch (summaryError) {
          console.warn('Failed to refresh summary:', summaryError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Remove optimistic update on error
      setCreditCards(prev => prev.filter(cc => cc.id !== tempId));
      throw err;
    }
  }, [userId, isPremium, isOnline, isAuthenticated, isDemo]);

  // Update existing credit card (local-first with optimistic update)
  const updateCreditCard = useCallback(async (id: string, cardUpdates: Partial<CreditCard>) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Optimistic update
      setCreditCards(prev => 
        prev.map(cc => cc.id === id ? { ...cc, ...cardUpdates } : cc)
      );

      try {
        // Try local-first
        const localUpdate: Partial<creditCardServiceLocal.CreditCardUpdate> = {};
        if (cardUpdates.name) localUpdate.name = cardUpdates.name;
        if (cardUpdates.bank) localUpdate.institution = cardUpdates.bank;
        if (cardUpdates.lastFourDigits) localUpdate.last_four_digits = parseInt(cardUpdates.lastFourDigits, 10);
        if (cardUpdates.creditLimit !== undefined) localUpdate.credit_limit = cardUpdates.creditLimit;
        if (cardUpdates.currentBalance !== undefined) localUpdate.current_balance = cardUpdates.currentBalance;
        if (cardUpdates.dueDate) localUpdate.due_date = cardUpdates.dueDate;
        if (cardUpdates.billingCycle !== undefined) localUpdate.billing_cycle = cardUpdates.billingCycle;
        if (cardUpdates.logoUrl !== undefined) localUpdate.logo_url = cardUpdates.logoUrl;

        const updatedLocalCard = await creditCardServiceLocal.updateCreditCardLocal(
          id,
          localUpdate,
          userId,
          isPremium,
          isOnline
        );
        
        const contextCard = mapLocalToContextCard(updatedLocalCard);
        setCreditCards(prev => prev.map(cc => cc.id === id ? contextCard : cc));
      } catch (localError) {
        // Fallback to Supabase
        if (isAuthenticated && !isDemo) {
          const updatedCard = await creditCardService.updateCreditCard(id, cardUpdates, isDemo);
          setCreditCards(prev => prev.map(cc => cc.id === id ? updatedCard : cc));
        } else {
          throw localError;
        }
      }

      // Refresh summary
      if (userId) {
        try {
          const cardSummary = await creditCardServiceLocal.fetchCreditCardSummary(
            userId,
            isPremium,
            isOnline
          );
          setSummary(cardSummary);
        } catch (summaryError) {
          console.warn('Failed to refresh summary:', summaryError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Revert optimistic update on error
      fetchCreditCards();
      throw err;
    }
  }, [userId, isPremium, isOnline, isAuthenticated, isDemo, fetchCreditCards]);

  // Delete credit card (local-first)
  const deleteCreditCard = useCallback(async (id: string) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Optimistic update
      setCreditCards(prev => prev.filter(cc => cc.id !== id));

      try {
        // Try local-first
        await creditCardServiceLocal.deleteCreditCardLocal(id, userId, isPremium, isOnline);
      } catch (localError) {
        // Fallback to Supabase
        if (isAuthenticated && !isDemo) {
          await creditCardService.deleteCreditCard(id, isDemo);
        } else {
          throw localError;
        }
      }

      // Refresh summary
      if (userId) {
        try {
          const cardSummary = await creditCardServiceLocal.fetchCreditCardSummary(
            userId,
            isPremium,
            isOnline
          );
          setSummary(cardSummary);
        } catch (summaryError) {
          console.warn('Failed to refresh summary:', summaryError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Revert optimistic update on error
      fetchCreditCards();
      throw err;
    }
  }, [userId, isPremium, isOnline, isAuthenticated, isDemo, fetchCreditCards]);

  return (
    <CreditCardContext.Provider 
      value={{ 
        creditCards, 
        loading, 
        error, 
        summary,
        fetchCreditCards, 
        addCreditCard, 
        updateCreditCard, 
        deleteCreditCard
      }}
    >
      {children}
    </CreditCardContext.Provider>
  );
};

// Custom hook to use the credit card context
export const useCreditCards = () => {
  const context = useContext(CreditCardContext);
  if (context === undefined) {
    throw new Error('useCreditCards must be used within a CreditCardProvider');
  }
  return context;
};
