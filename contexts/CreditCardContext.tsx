import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { useDemoMode } from './DemoModeContext';
import * as creditCardService from '../services/creditCardService';

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

export const CreditCardProvider = ({ children }: { children: ReactNode }) => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemo } = useDemoMode();

  // Function to fetch credit cards from service
  const fetchCreditCards = async () => {
    try {
      setLoading(true);
      const data = await creditCardService.fetchCreditCards(isDemo);
      setCreditCards(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  // Load credit cards when the component mounts or when demo mode changes
  useEffect(() => {
    fetchCreditCards();
  }, [isDemo]);

  // Add new credit card
  const addCreditCard = async (creditCard: Omit<CreditCard, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      // Ensure required fields are present
      if (!creditCard.lastFourDigits) {
        throw new Error("Last four digits are required");
      }
      
      const newCreditCard = await creditCardService.addCreditCard({
        ...creditCard,
        lastFourDigits: creditCard.lastFourDigits
      }, isDemo);
      setCreditCards(prev => [...prev, newCreditCard]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err; // Re-throw for component handling
    }
  };

  // Update existing credit card
  const updateCreditCard = async (id: string, cardUpdates: Partial<CreditCard>) => {
    try {
      const updatedCard = await creditCardService.updateCreditCard(id, cardUpdates, isDemo);
      setCreditCards(prev => 
        prev.map(cc => cc.id === id ? updatedCard : cc)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err; // Re-throw for component handling
    }
  };

  // Delete credit card
  const deleteCreditCard = async (id: string) => {
    try {
      await creditCardService.deleteCreditCard(id, isDemo);
      setCreditCards(prev => prev.filter(cc => cc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err; // Re-throw for component handling
    }
  };

  return (
    <CreditCardContext.Provider 
      value={{ 
        creditCards, 
        loading, 
        error, 
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
