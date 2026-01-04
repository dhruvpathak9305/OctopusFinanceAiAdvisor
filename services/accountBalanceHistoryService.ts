import { supabase } from "../lib/supabase/client";

export interface BalanceSnapshot {
  account_id: string;
  balance: number;
  snapshot_date: string;
}

export interface MoMGrowth {
  currentMonthTotal: number;
  previousMonthTotal: number;
  changeAmount: number;
  changePercentage: number;
  trend: "up" | "down" | "neutral";
  formattedChange: string;
}

/**
 * Formats a date as YYYY-MM-DD in local timezone (avoids UTC conversion issues)
 */
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Fetches account balance history for a specific date
 */
export const fetchBalanceSnapshotsForDate = async (
  date: Date,
  isDemo: boolean = false
): Promise<BalanceSnapshot[]> => {
  try {
    // Format date in local timezone to avoid UTC conversion issues
    const dateStr = formatDateLocal(date);
    
    const { data, error } = await supabase
      .from(isDemo ? "account_balance_history" : "account_balance_history_real")
      .select("account_id, balance, snapshot_date")
      .eq("snapshot_date", dateStr)
      .order("snapshot_date", { ascending: false });

    if (error) {
      const isNetworkError = 
        error.message?.includes("Network request failed") ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("network");
      
      if (isNetworkError) {
        if (__DEV__) {
          console.warn("⚠️ Network error fetching balance snapshots (suppressed)");
        }
      } else {
        console.error("Error fetching balance snapshots:", error);
      }
      return [];
    }

    return data || [];
  } catch (error: any) {
    const isNetworkError = 
      error?.message?.includes("Network request failed") ||
      error?.message?.includes("Failed to fetch") ||
      error?.name === "TypeError" ||
      error?.message?.includes("network");
    
    if (isNetworkError) {
      if (__DEV__) {
        console.warn("⚠️ Network error in fetchBalanceSnapshots (suppressed)");
      }
    } else {
      console.error("Exception fetching balance snapshots:", error);
    }
    return [];
  }
};

/**
 * Gets the last day of a given month
 */
const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

/**
 * Fetches the most recent balance snapshot for each account within a month
 */
export const fetchMonthEndBalances = async (
  year: number,
  month: number,
  isDemo: boolean = false
): Promise<BalanceSnapshot[]> => {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = getLastDayOfMonth(year, month);

    // Format dates in local timezone to avoid UTC conversion issues
    const startDateStr = formatDateLocal(startDate);
    const endDateStr = formatDateLocal(endDate);

    // Suppress console log in production to reduce noise
    if (__DEV__) {
      console.log(`📅 Fetching balances for ${year}-${month + 1}: ${startDateStr} to ${endDateStr}`);
    }

    // Add timeout to prevent hanging requests
    const queryPromise = supabase
      .from(isDemo ? "account_balance_history" : "account_balance_history_real")
      .select("account_id, balance, snapshot_date")
      .gte("snapshot_date", startDateStr)
      .lte("snapshot_date", endDateStr)
      .order("snapshot_date", { ascending: false });

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: { message: "Request timeout" } });
      }, 10000); // 10 second timeout
    });

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      // Check if it's a network error
      const isNetworkError = 
        error.message?.includes("Network request failed") ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("timeout") ||
        error.message?.includes("network");
      
      if (isNetworkError && __DEV__) {
        // Only log network errors in dev mode, and only once per session
        console.warn(`⚠️ Network error fetching balances for ${year}-${month + 1} (suppressing further errors)`);
      } else if (!isNetworkError) {
        console.error("Error fetching month-end balances:", error);
      }
      return [];
    }

    // Get the latest snapshot for each account in this month
    const latestByAccount = new Map<string, BalanceSnapshot>();
    
    (data || []).forEach((snapshot) => {
      if (!latestByAccount.has(snapshot.account_id)) {
        latestByAccount.set(snapshot.account_id, snapshot);
      }
    });

    return Array.from(latestByAccount.values());
  } catch (error: any) {
    // Check if it's a network error
    const isNetworkError = 
      error?.message?.includes("Network request failed") ||
      error?.message?.includes("Failed to fetch") ||
      error?.name === "TypeError" ||
      error?.message?.includes("network");
    
    if (isNetworkError) {
      // Suppress network error logs to prevent console spam
      if (__DEV__) {
        console.warn(`⚠️ Network error in fetchMonthEndBalances (suppressed)`);
      }
    } else {
      console.error("Exception fetching month-end balances:", error);
    }
    return [];
  }
};

/**
 * Calculates Month-over-Month growth comparing current balance with last month's end
 * @param currentTotalBalance - Current real-time total balance from accounts_real
 * @param isDemo - Whether to use demo data
 */
export const calculateMoMGrowth = async (
  currentTotalBalance: number,
  isDemo: boolean = false
): Promise<MoMGrowth | null> => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Get previous month
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    if (__DEV__) {
      console.log(
        `📊 Calculating MoM Growth: Today: ${currentYear}-${currentMonth + 1}-${currentDay}, Previous month end: ${previousYear}-${previousMonth + 1}`
      );
    }

    // Fetch previous month's end balance (from history)
    const previousMonthBalances = await fetchMonthEndBalances(previousYear, previousMonth, isDemo);

    if (__DEV__) {
      console.log(
        `📊 Previous month snapshots: ${previousMonthBalances.length}`
      );
    }

    // Calculate previous month total
    const previousMonthTotal = previousMonthBalances.reduce(
      (sum, snapshot) => sum + snapshot.balance,
      0
    );

    // If no previous month data, return neutral
    if (previousMonthTotal === 0 || previousMonthBalances.length === 0) {
      if (__DEV__) {
        console.log("⚠️ No previous month data available for MoM calculation");
      }
      return {
        currentMonthTotal: currentTotalBalance,
        previousMonthTotal: 0,
        changeAmount: 0,
        changePercentage: 0,
        trend: "neutral",
        formattedChange: "0.0%",
      };
    }

    // Use current real-time balance for comparison
    const currentMonthTotal = currentTotalBalance;

    // Calculate change
    const changeAmount = currentMonthTotal - previousMonthTotal;
    const changePercentage =
      previousMonthTotal > 0
        ? (changeAmount / previousMonthTotal) * 100
        : 0;

    // Determine trend
    let trend: "up" | "down" | "neutral" = "neutral";
    if (changePercentage > 0.1) trend = "up";
    else if (changePercentage < -0.1) trend = "down";

    // Format change string
    const sign = changePercentage >= 0 ? "+" : "";
    const formattedChange = `${sign}${changePercentage.toFixed(1)}%`;

    const result: MoMGrowth = {
      currentMonthTotal,
      previousMonthTotal,
      changeAmount,
      changePercentage,
      trend,
      formattedChange,
    };

    if (__DEV__) {
      console.log("📊 MoM Growth calculated:", {
        ...result,
        currentDate: `${currentYear}-${currentMonth + 1}-${currentDay}`,
        previousMonthEnd: `${previousYear}-${previousMonth + 1} (end)`
      });
    }

    return result;
  } catch (error: any) {
    const isNetworkError = 
      error?.message?.includes("Network request failed") ||
      error?.message?.includes("Failed to fetch") ||
      error?.name === "TypeError" ||
      error?.message?.includes("network");
    
    if (isNetworkError) {
      if (__DEV__) {
        console.warn("⚠️ Network error in calculateMoMGrowth (suppressed)");
      }
    } else {
      console.error("Exception calculating MoM growth:", error);
    }
    return null;
  }
};

/**
 * Gets MoM growth with fallback to current balance if no history exists
 * @param currentBalance - Current real-time total balance from accounts_real
 * @param isDemo - Whether to use demo data
 */
export const getMoMGrowthWithFallback = async (
  currentBalance: number,
  isDemo: boolean = false
): Promise<MoMGrowth> => {
  // Calculate MoM using current balance vs previous month's end
  const momGrowth = await calculateMoMGrowth(currentBalance, isDemo);

  if (momGrowth) {
    return momGrowth;
  }

  // Fallback: if calculation fails, return neutral growth
  if (__DEV__) {
    console.log(
      "⚠️ MoM calculation failed, using fallback with current balance"
    );
  }

  return {
    currentMonthTotal: currentBalance,
    previousMonthTotal: currentBalance,
    changeAmount: 0,
    changePercentage: 0,
    trend: "neutral",
    formattedChange: "0.0%",
  };
};

/**
 * Fetches account balance history for a specific account or all accounts
 * @param accountId - Optional account ID. If not provided, fetches for all accounts
 * @param months - Number of months of history to fetch
 * @param isDemo - Whether to use demo data
 */
export const fetchAccountHistory = async (
  accountId: string | null,
  months: number = 12,
  isDemo: boolean = false
): Promise<{ date: string; value: number }[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      if (__DEV__) {
        console.error("User not authenticated");
      }
      return [];
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const startDateStr = formatDateLocal(startDate);
    const endDateStr = formatDateLocal(endDate);

    let query = supabase
      .from(isDemo ? "account_balance_history" : "account_balance_history_real")
      .select("snapshot_date, balance, account_id")
      .eq("user_id", user.id)
      .gte("snapshot_date", startDateStr)
      .lte("snapshot_date", endDateStr)
      .order("snapshot_date", { ascending: true });

    // Filter by specific account if provided
    if (accountId) {
      query = query.eq("account_id", accountId);
    }

    // Add timeout
    const queryPromise = query;
    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: { message: "Request timeout" } });
      }, 10000);
    });

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      const isNetworkError = 
        error.message?.includes("Network request failed") ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("timeout") ||
        error.message?.includes("network");
      
      if (isNetworkError) {
        // Suppress network error logs
        if (__DEV__) {
          console.warn("⚠️ Network error fetching account history (suppressed)");
        }
      } else {
        console.error("Error fetching account history:", error);
      }
      return [];
    }

    // Group by date and sum balances
    const balanceByDate = new Map<string, number>();
    (data || []).forEach((record: any) => {
      const date = record.snapshot_date;
      const currentBalance = balanceByDate.get(date) || 0;
      balanceByDate.set(date, currentBalance + record.balance);
    });

    // Convert to array and sort by date
    return Array.from(balanceByDate.entries())
      .map(([date, balance]) => ({ date, value: balance }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error: any) {
    const isNetworkError = 
      error?.message?.includes("Network request failed") ||
      error?.message?.includes("Failed to fetch") ||
      error?.name === "TypeError" ||
      error?.message?.includes("network");
    
    if (isNetworkError) {
      // Suppress network error logs
      if (__DEV__) {
        console.warn("⚠️ Network error in fetchAccountHistory (suppressed)");
      }
    } else {
      console.error("Exception fetching account history:", error);
    }
    return [];
  }
};

