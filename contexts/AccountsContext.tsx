/* eslint-disable react-refresh/only-export-components, react-hooks/exhaustive-deps */
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { toast } from 'sonner';
import { useDemoMode } from './DemoModeContext';
import { useUnifiedAuth } from './UnifiedAuthContext';
import * as accountsService from '../services/accountsService';

export type Account = {
  id: string;
  user_id?: string;
  name: string;
  type: string;
  balance: number;
  institution: string | null;
  last_sync?: string | null;
  created_at?: string;
  updated_at?: string;
  account_number?: string | null;
  logo_url?: string | null;
};

export interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const AccountsContext = createContext<AccountsContextType>({
  accounts: [],
  loading: false,
  error: null,
  fetchAccounts: async () => { },
  addAccount: async () => { },
  updateAccount: async () => { },
  deleteAccount: async () => { }
});

export const AccountsProvider = ({ children }: { children: ReactNode }) => {
  // Authentication check - CRITICAL: Don't fetch data before user is logged in
  const { isAuthenticated, user } = useUnifiedAuth();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemo } = useDemoMode();

  // Function to fetch accounts from service
  const fetchAccounts = async () => {
    // Safety check: Don't fetch if user is not authenticated
    if (!user || !isAuthenticated) {
      console.log('ℹ️ AccountsProvider: Skipping fetch - user not authenticated');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await accountsService.fetchAccounts(isDemo);
      setAccounts(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  // Load accounts when the component mounts or when demo mode changes - ONLY if authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('⏳ AccountsProvider: Waiting for authentication...');
      setLoading(false);
      return;
    }
    
    console.log('✅ AccountsProvider: User authenticated, fetching accounts...');
    fetchAccounts();
  }, [isDemo, isAuthenticated, user]);

  // Add new account
  const addAccount = async (account: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const newAccount = await accountsService.addAccount(account as Account, isDemo);
      setAccounts(prev => [...prev, newAccount]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err; // Re-throw for component handling
    }
  };

  // Update existing account
  const updateAccount = async (id: string, accountUpdate: Partial<Account>) => {
    try {
      const account = accounts.find(a => a.id === id);
      if (!account) {
        throw new Error('Account not found');
      }
      
      const updatedAccount = await accountsService.updateAccount({
        ...account,
        ...accountUpdate,
        id
      }, isDemo);
      
      setAccounts(prev => 
        prev.map(acc => acc.id === id ? updatedAccount : acc)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err; // Re-throw for component handling
    }
  };

  // Delete account
  const deleteAccount = async (id: string) => {
    try {
      await accountsService.deleteAccount(id, isDemo);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err; // Re-throw for component handling
    }
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        loading,
        error,
        fetchAccounts,
        addAccount,
        updateAccount,
        deleteAccount
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
};

// Custom hook to use the accounts context
export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};
