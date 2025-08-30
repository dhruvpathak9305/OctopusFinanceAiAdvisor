/* eslint-disable react-refresh/only-export-components, react-hooks/exhaustive-deps */
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { toast } from "sonner";
import { useDemoMode } from "./DemoModeContext";
import {
  fetchAccountsWithBalances,
  addAccountWithInitialBalance,
  updateAccount,
  deleteAccount,
  AccountWithBalance,
} from "../services/optimizedAccountsService";

export interface OptimizedAccountsContextType {
  accounts: AccountWithBalance[];
  loading: boolean;
  error: string | null;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  accountCount: number;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: {
    name: string;
    type: string;
    institution?: string;
    initial_balance?: number;
    account_number?: string;
    logo_url?: string;
  }) => Promise<void>;
  updateAccount: (
    id: string,
    updates: {
      name?: string;
      type?: string;
      institution?: string;
      account_number?: string;
      logo_url?: string;
      is_active?: boolean;
    }
  ) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getAccountById: (id: string) => AccountWithBalance | undefined;
  getActiveAccounts: () => AccountWithBalance[];
  getBankAccounts: () => AccountWithBalance[];
}

export const OptimizedAccountsContext =
  createContext<OptimizedAccountsContextType>({
    accounts: [],
    loading: false,
    error: null,
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    accountCount: 0,
    fetchAccounts: async () => {},
    addAccount: async () => {},
    updateAccount: async () => {},
    deleteAccount: async () => {},
    getAccountById: () => undefined,
    getActiveAccounts: () => [],
    getBankAccounts: () => [],
  });

export const OptimizedAccountsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemo } = useDemoMode();

  // Computed values
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.current_balance,
    0
  );
  const totalIncome = accounts.reduce(
    (sum, account) => sum + account.total_income,
    0
  );
  const totalExpenses = accounts.reduce(
    (sum, account) => sum + account.total_expenses,
    0
  );
  const accountCount = accounts.filter((account) => account.is_active).length;

  // Function to fetch accounts from service
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAccountsWithBalances(isDemo);
      setAccounts(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  // Load accounts when the component mounts or when demo mode changes
  useEffect(() => {
    fetchAccounts();
  }, [isDemo]);

  // Add new account
  const addAccount = async (accountData: {
    name: string;
    type: string;
    institution?: string;
    initial_balance?: number;
    account_number?: string;
    logo_url?: string;
  }) => {
    try {
      const newAccount = await addAccountWithInitialBalance(
        accountData,
        isDemo
      );
      setAccounts((prev) => [...prev, newAccount]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err; // Re-throw for component handling
    }
  };

  // Update existing account
  const updateAccountInContext = async (
    id: string,
    accountUpdate: {
      name?: string;
      type?: string;
      institution?: string;
      account_number?: string;
      logo_url?: string;
      is_active?: boolean;
    }
  ) => {
    try {
      const updatedAccount = await updateAccount(id, accountUpdate, isDemo);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === id ? updatedAccount : acc))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err; // Re-throw for component handling
    }
  };

  // Delete account
  const deleteAccountInContext = async (id: string) => {
    try {
      await deleteAccount(id, isDemo);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err; // Re-throw for component handling
    }
  };

  // Helper functions
  const getAccountById = (id: string): AccountWithBalance | undefined => {
    return accounts.find((account) => account.id === id);
  };

  const getActiveAccounts = (): AccountWithBalance[] => {
    return accounts.filter((account) => account.is_active);
  };

  const getBankAccounts = (): AccountWithBalance[] => {
    return accounts.filter(
      (account) =>
        account.is_active &&
        account.type !== "Credit Card" &&
        account.type !== "Credit" &&
        account.type !== "Loan"
    );
  };

  return (
    <OptimizedAccountsContext.Provider
      value={{
        accounts,
        loading,
        error,
        totalBalance,
        totalIncome,
        totalExpenses,
        accountCount,
        fetchAccounts,
        addAccount,
        updateAccount: updateAccountInContext,
        deleteAccount: deleteAccountInContext,
        getAccountById,
        getActiveAccounts,
        getBankAccounts,
      }}
    >
      {children}
    </OptimizedAccountsContext.Provider>
  );
};

// Custom hook to use the optimized accounts context
export const useOptimizedAccounts = () => {
  const context = useContext(OptimizedAccountsContext);
  if (context === undefined) {
    throw new Error(
      "useOptimizedAccounts must be used within an OptimizedAccountsProvider"
    );
  }
  return context;
};
