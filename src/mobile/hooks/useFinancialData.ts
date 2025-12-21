import { useState, useEffect } from "react";
import { useAccounts } from "../../../contexts/AccountsContext";
import { useDemoMode } from "../../../contexts/DemoModeContext";
import { useUnifiedAuth } from "../../../contexts/UnifiedAuthContext";
import { AccountsRepository } from "../../../services/repositories/accountsRepository";
import { TransactionsRepository } from "../../../services/repositories/transactionsRepository";
import { getLocalDb } from "../../../services/localDb";
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
    count: number;
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
  const { user } = useUnifiedAuth();
  const userId = user?.id || 'offline_user';

  // TODO: Replace hardcoded MoM values with real calculations from accountBalanceHistoryService
  const [financialData, setFinancialData] = useState<FinancialData>({
    netWorth: { total: 0, change: "0.0%", loading: true }, // TODO: Calculate real MoM
    accounts: { total: 0, change: "0.0%", loading: true, count: 0 }, // TODO: Calculate real MoM  
    creditCards: { total: 2321, change: "0.0%", loading: false }, // TODO: Calculate real MoM
    income: { total: 566486, change: "0.0%", loading: false },
    expenses: { total: 133846, change: "0.0%", loading: false },
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        console.log("📊 useFinancialData: Fetching from local DB...");
        
        // Fetch accounts and balances from local DB (optimized)
        const accountsRepo = new AccountsRepository(userId, false, false);
        const db = await getLocalDb();
        
        const localAccounts = await accountsRepo.findAll({
          user_id: userId,
          isActive: true,
          limit: 1000,
        });
        
        // Get balances for all accounts in one batch query
        const accountIds = localAccounts.map(acc => acc.id);
        let balancesMap = new Map<string, number>();
        
        if (accountIds.length > 0) {
          const placeholders = accountIds.map(() => '?').join(',');
          const balances = await db.getAllAsync<{ account_id: string; current_balance: number }>(
            `SELECT account_id, current_balance FROM balance_local 
             WHERE account_id IN (${placeholders})`,
            accountIds
          );
          
          balances.forEach(b => {
            balancesMap.set(b.account_id, b.current_balance);
          });
        }
        
        // Map accounts with balances
        const accountsWithBalances = localAccounts.map((account) => ({
          ...account,
          balance: balancesMap.get(account.id) ?? account.current_balance ?? 0,
          type: account.type,
        }));

        // Calculate Net Worth
        const bankAccounts = accountsWithBalances.filter(
          (account) =>
            account.type !== "Credit Card" &&
            account.type !== "Credit" &&
            account.type !== "Loan"
        );

        const totalAssets = bankAccounts.reduce(
          (sum, account) => sum + Math.max(account.balance, 0),
          0
        );

        const totalLiabilities = accountsWithBalances
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

        // Fetch current month's income and expenses from local DB
        const transactionsRepo = new TransactionsRepository(userId, false, false);
        const startTimestamp = startOfMonth.getTime();
        const endTimestamp = endOfMonth.getTime();
        
        const [incomeTransactions, expenseTransactions] = await Promise.all([
          transactionsRepo.findAll({
            user_id: userId,
            type: 'income',
            startDate: startTimestamp,
            endDate: endTimestamp,
            limit: 10000,
          }),
          transactionsRepo.findAll({
            user_id: userId,
            type: 'expense',
            startDate: startTimestamp,
            endDate: endTimestamp,
            limit: 10000,
          }),
        ]);

        const totalIncome = incomeTransactions.reduce(
          (sum, transaction) => sum + Math.abs(transaction.amount || 0),
          0
        );

        const totalExpenses = expenseTransactions.reduce(
          (sum, transaction) => sum + Math.abs(transaction.amount || 0),
          0
        );
        
        console.log("✅ useFinancialData: Data loaded from local DB", {
          netWorth: netWorthTotal,
          accounts: accountsTotal,
          accountsCount: bankAccounts.length,
          income: totalIncome,
          expenses: totalExpenses,
        });

        // Fetch credit cards from local DB
        const creditCards = await db.getAllAsync<any>(
          `SELECT * FROM credit_cards_local 
           WHERE user_id = ? AND deleted_offline = 0`,
          [userId]
        );
        
        const creditCardsTotal = creditCards.reduce(
          (sum, card) => sum + Math.abs(card.current_balance || 0),
          0
        );

        setFinancialData({
          netWorth: {
            total: netWorthTotal,
            change: "0.0%", // TODO: Calculate real MoM from balance history
            loading: false,
          },
          accounts: {
            total: accountsTotal,
            change: "0.0%", // TODO: Calculate real MoM from balance history
            loading: false,
            count: bankAccounts.length,
          },
          creditCards: {
            total: creditCardsTotal,
            change: "0.0%", // TODO: Calculate real MoM
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
        console.error("❌ Error fetching financial data from local DB:", error);
        // Fallback: try using accounts from context if local DB fails
        try {
          const bankAccounts = accounts.filter(
            (account) =>
              account.type !== "Credit Card" &&
              account.type !== "Credit" &&
              account.type !== "Loan"
          );

          const totalAssets = bankAccounts.reduce(
            (sum, account) => sum + Math.max(account.balance || 0, 0),
            0
          );

          const totalLiabilities = accounts
            .filter(
              (account) => (account.balance || 0) < 0 || account.type === "Credit Card"
            )
            .reduce((sum, account) => sum + Math.abs(account.balance || 0), 0);

          const netWorthTotal = totalAssets - totalLiabilities;
          const accountsTotal = bankAccounts.reduce(
            (sum, account) => sum + (account.balance || 0),
            0
          );

          setFinancialData({
            netWorth: { total: netWorthTotal, change: "0.0%", loading: false },
            accounts: {
              total: accountsTotal,
              change: "0.0%",
              loading: false,
              count: bankAccounts.length,
            },
            creditCards: { total: 0, change: "0.0%", loading: false },
            income: { total: 0, change: "0.0%", loading: false },
            expenses: { total: 0, change: "0.0%", loading: false },
          });
        } catch (fallbackError) {
          console.error("❌ Error with fallback:", fallbackError);
          // Set default fallback data on error
          setFinancialData({
            netWorth: { total: 0, change: "0.0%", loading: false },
            accounts: {
              total: 0,
              change: "0.0%",
              loading: false,
              count: 0,
            },
            creditCards: { total: 0, change: "0.0%", loading: false },
            income: { total: 0, change: "0.0%", loading: false },
            expenses: { total: 0, change: "0.0%", loading: false },
          });
        }
      }
    };

    if (userId && !accountsLoading) {
      fetchFinancialData();
    }
  }, [userId, accountsLoading]);

  return financialData;
};
