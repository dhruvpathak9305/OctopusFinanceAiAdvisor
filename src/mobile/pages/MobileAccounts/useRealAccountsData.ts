import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase/client";
import { BankAccount } from "./types";
import { THEME_COLORS, generateAccountColors } from "./utils";
import type { Database } from "../../../../types/supabase";

type AccountRow = Database["public"]["Tables"]["accounts_real"]["Row"];
type BalanceRow = Database["public"]["Tables"]["balance_real"]["Row"];

interface AccountWithBalance {
  account: AccountRow;
  balance: BalanceRow | null;
}

/**
 * Custom hook to fetch real accounts data from Supabase
 * Fetches from accounts_real and balance_real tables
 */
export const useRealAccountsData = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    fetchAccountsData();
  }, []);

  const fetchAccountsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch accounts from accounts_real table
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts_real")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (accountsError) {
        throw accountsError;
      }

      // Fetch balances from balance_real table
      const { data: balancesData, error: balancesError } = await supabase
        .from("balance_real")
        .select("*")
        .eq("user_id", user.id);

      if (balancesError) {
        console.warn("Error fetching balances:", balancesError);
        // Continue with 0 balances
      }

      // Create a map of account_id to balance
      const balanceMap = new Map<string, BalanceRow>();
      (balancesData || []).forEach((balance) => {
        balanceMap.set(balance.account_id, balance);
      });

      // Calculate total balance
      let total = 0;
      (balancesData || []).forEach((balance) => {
        total += Number(balance.current_balance) || 0;
      });
      setTotalBalance(total);

      // Generate theme colors for accounts
      const colors = generateAccountColors(accountsData?.length || 0);

      // Transform data to BankAccount format
      const transformedAccounts: BankAccount[] = (accountsData || []).map(
        (account, index) => {
          const balance = balanceMap.get(account.id);
          const currentBalance = Number(balance?.current_balance) || 0;
          const percentage =
            total > 0 ? Math.round((currentBalance / total) * 100) : 0;

          return {
            id: account.id,
            name: account.institution || account.name,
            balance: currentBalance,
            percentage,
            color: colors[index] || THEME_COLORS.green,
            icon: getIconForAccountType(account.type),
          };
        }
      );

      setAccounts(transformedAccounts);
    } catch (err) {
      console.error("Error fetching accounts data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const refreshAccounts = () => {
    fetchAccountsData();
  };

  return {
    accounts,
    loading,
    error,
    totalBalance,
    refreshAccounts,
  };
};

/**
 * Get icon name based on account type
 */
const getIconForAccountType = (type: string): string => {
  const typeMap: Record<string, string> = {
    checking: "card-outline",
    savings: "wallet-outline",
    credit: "card",
    investment: "trending-up",
    cash: "cash-outline",
  };

  return typeMap[type.toLowerCase()] || "wallet-outline";
};
