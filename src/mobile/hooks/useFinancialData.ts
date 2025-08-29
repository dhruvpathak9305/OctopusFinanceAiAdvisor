import { useState, useEffect } from "react";
import { useAccounts } from "../../../contexts/AccountsContext";
import { useDemoMode } from "../../../contexts/DemoModeContext";
import {
  fetchTransactions,
  fetchTransactionHistory,
} from "../../../services/transactionsService";

interface FinancialData {
  netWorth: {
    total: number;
    change: string;
    loading: boolean;
  };
  accounts: {
    total: number;
    change: string;
    loading: boolean;
  };
  creditCards: {
    total: number;
    change: string;
    loading: boolean;
  };
  income: {
    total: number;
    change: string;
    loading: boolean;
  };
  expenses: {
    total: number;
    change: string;
    loading: boolean;
  };
}

export const useFinancialData = () => {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { isDemo } = useDemoMode();

  const [financialData, setFinancialData] = useState<FinancialData>({
    netWorth: { total: 0, change: "+1.9%", loading: true },
    accounts: { total: 0, change: "+2.8%", loading: true },
    creditCards: { total: 2321, change: "+0.8%", loading: false },
    income: { total: 566486, change: "0.0%", loading: false },
    expenses: { total: 133846, change: "0.0%", loading: false },
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Calculate Net Worth
        const bankAccounts = accounts.filter(
          (account) =>
            account.type !== "Credit Card" &&
            account.type !== "Credit" &&
            account.type !== "Loan"
        );

        const totalAssets = bankAccounts.reduce(
          (sum, account) => sum + Math.max(account.balance, 0),
          0
        );

        const totalLiabilities = accounts
          .filter(
            (account) => account.balance < 0 || account.type === "Credit Card"
          )
          .reduce((sum, account) => sum + Math.abs(account.balance), 0);

        const netWorthTotal = totalAssets - totalLiabilities;
        const accountsTotal = bankAccounts.reduce(
          (sum, account) => sum + account.balance,
          0
        );

        // Get current month's date range for income/expenses
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch current month's income and expenses
        const [currentIncomeTransactions, currentExpenseTransactions] =
          await Promise.all([
            fetchTransactions(
              {
                type: "income",
                dateRange: { start: startOfMonth, end: endOfMonth },
              },
              isDemo
            ),
            fetchTransactions(
              {
                type: "expense",
                dateRange: { start: startOfMonth, end: endOfMonth },
              },
              isDemo
            ),
          ]);

        const totalIncome = currentIncomeTransactions.reduce(
          (sum, transaction) => sum + Math.abs(transaction.amount),
          0
        );

        const totalExpenses = currentExpenseTransactions.reduce(
          (sum, transaction) => sum + Math.abs(transaction.amount),
          0
        );

        setFinancialData({
          netWorth: {
            total: netWorthTotal,
            change: "+1.9%",
            loading: false,
          },
          accounts: {
            total: accountsTotal,
            change: "+2.8%",
            loading: false,
          },
          creditCards: {
            total: 2321,
            change: "+0.8%",
            loading: false,
          },
          income: {
            total: totalIncome > 0 ? totalIncome : 566486,
            change: "0.0%",
            loading: false,
          },
          expenses: {
            total: totalExpenses > 0 ? totalExpenses : 133846,
            change: "0.0%",
            loading: false,
          },
        });
      } catch (error) {
        console.error("Error fetching financial data:", error);
        // Set default fallback data on error
        setFinancialData({
          netWorth: { total: 4776896, change: "+1.9%", loading: false },
          accounts: { total: 4776896, change: "+2.8%", loading: false },
          creditCards: { total: 2321, change: "+0.8%", loading: false },
          income: { total: 566486, change: "0.0%", loading: false },
          expenses: { total: 133846, change: "0.0%", loading: false },
        });
      }
    };

    if (!accountsLoading) {
      fetchFinancialData();
    }
  }, [accounts, accountsLoading, isDemo]);

  return financialData;
};
