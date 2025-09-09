import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import BalanceService, { AccountBalance } from "../services/balanceService";
import { useDemoMode } from "./DemoModeContext";
import { supabase } from "../lib/supabase/client";
import BalanceDebugger from "../utils/balanceDebugger";
import { subscribeToBalanceUpdates } from "../utils/balanceEventEmitter";

interface BalanceContextType {
  balances: AccountBalance[];
  loading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  getAccountBalance: (accountId: string) => AccountBalance | undefined;
  totalBalance: number;
  bankAccountBalances: AccountBalance[];
  debugComparison: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const useBalances = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalances must be used within a BalanceProvider");
  }
  return context;
};

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider: React.FC<BalanceProviderProps> = ({
  children,
}) => {
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemo } = useDemoMode();

  // Filter out credit cards and loans (liabilities) from account balances
  const bankAccountBalances = balances.filter(
    (balance) =>
      balance.account_type !== "Credit Card" &&
      balance.account_type !== "Credit" &&
      balance.account_type !== "Loan"
  );

  // Calculate total balance from bank accounts
  const totalBalance = bankAccountBalances.reduce(
    (sum, balance) => sum + balance.current_balance,
    0
  );

  // Function to fetch balances
  const fetchBalances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(
        "🔄 BalanceContext: Fetching balances from balance_real table, isDemo:",
        isDemo
      );
      const fetchedBalances = await BalanceService.fetchAccountBalances(
        undefined,
        isDemo
      );
      console.log("📊 BalanceContext: Raw fetched balances:", fetchedBalances);
      console.log(
        "💰 BalanceContext: Total balance calculated:",
        fetchedBalances
          .filter(
            (b) =>
              b.account_type !== "Credit Card" &&
              b.account_type !== "Credit" &&
              b.account_type !== "Loan"
          )
          .reduce((sum, balance) => sum + balance.current_balance, 0)
      );
      setBalances(fetchedBalances);
    } catch (err) {
      console.error("Error fetching account balances:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
      setBalances([]);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  // Public refresh function
  const refreshBalances = useCallback(async () => {
    await fetchBalances();
  }, [fetchBalances]);

  // Get specific account balance
  const getAccountBalance = useCallback(
    (accountId: string) => {
      return balances.find((balance) => balance.account_id === accountId);
    },
    [balances]
  );

  // Debug comparison function
  const debugComparison = useCallback(async () => {
    try {
      console.log("🔍 BalanceContext: Running debug comparison...");
      await BalanceDebugger.compareServiceVsDatabase();
    } catch (error) {
      console.error("❌ BalanceContext: Debug comparison failed:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Fallback: Listen to custom balance update events (in case real-time subscriptions fail)
  useEffect(() => {
    const handleBalanceUpdateNeeded = (event: any) => {
      console.log(
        "🔄 BalanceContext: Custom event triggered balance refresh:",
        event.detail || event
      );
      setTimeout(() => {
        fetchBalances();
      }, 300);
    };

    // Check if we're in a web environment with proper window.addEventListener support
    const isWebEnvironment =
      typeof window !== "undefined" &&
      typeof window.addEventListener === "function";

    if (isWebEnvironment) {
      window.addEventListener("balanceUpdateNeeded", handleBalanceUpdateNeeded);
      console.log(
        "🎧 BalanceContext: Custom event listener added for balance updates (Web)"
      );
    } else {
      // For React Native, use our custom event emitter
      console.log(
        "📱 BalanceContext: Setting up React Native compatible event listener"
      );
    }

    // Always set up React Native compatible event listener as additional fallback
    const unsubscribeEmitter = subscribeToBalanceUpdates((event) => {
      console.log("📱 BalanceContext: React Native event received:", event);
      setTimeout(() => {
        fetchBalances();
      }, 300);
    });

    return () => {
      if (
        isWebEnvironment &&
        typeof window.removeEventListener === "function"
      ) {
        window.removeEventListener(
          "balanceUpdateNeeded",
          handleBalanceUpdateNeeded
        );
        console.log("🧹 BalanceContext: Custom event listener removed");
      }

      // Always clean up React Native event emitter
      unsubscribeEmitter();
      console.log("🧹 BalanceContext: React Native event emitter cleaned up");
    };
  }, [fetchBalances]);

  // Set up real-time subscription for balance updates (only in production mode)
  useEffect(() => {
    if (isDemo || process.env.EXPO_PUBLIC_DISABLE_REALTIME === "true") {
      console.log(
        "🎭 BalanceContext: Skipping real-time subscriptions (demo mode or disabled)"
      );
      return; // Skip real-time subscriptions in demo mode or if disabled
    }

    let balanceSubscription: any = null;

    const setupRealtimeSubscription = async () => {
      try {
        // Wait for authentication
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error(
            "🔒 BalanceContext: Auth error during subscription setup:",
            error
          );
          return;
        }
        if (!user) {
          console.log(
            "🔒 BalanceContext: No authenticated user, skipping subscription"
          );
          return;
        }

        console.log(
          "📡 BalanceContext: Setting up real-time subscription for user:",
          user.email
        );

        // Subscribe to balance_real table changes for current user
        balanceSubscription = supabase
          .channel(`balance-changes-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
              schema: "public",
              table: "balance_real",
              filter: `user_id=eq.${user.id}`, // Only listen to current user's balances
            },
            (payload) => {
              console.log(
                "🔔 BalanceContext: Balance change detected:",
                payload
              );
              console.log(
                "🔄 BalanceContext: Triggering balance refresh due to real-time change"
              );
              // Small delay to ensure database operations complete
              setTimeout(() => {
                fetchBalances();
              }, 100);
            }
          )
          .subscribe((status, error) => {
            if (error) {
              console.warn(
                "⚠️ BalanceContext: Balance subscription error (non-critical):",
                error
              );
              // Don't break app - continue with manual refresh methods
            } else {
              console.log(
                "📡 BalanceContext: Balance subscription status:",
                status
              );
              if (status === "SUBSCRIBED") {
                console.log(
                  "✅ BalanceContext: Balance real-time subscription is active!"
                );
              } else if (status === "CHANNEL_ERROR") {
                console.warn(
                  "⚠️ BalanceContext: Channel error - using fallback refresh methods"
                );
              }
            }
          });

        console.log(
          "📡 BalanceContext: Balance real-time subscription established"
        );
      } catch (error) {
        console.error(
          "❌ BalanceContext: Error setting up balance subscription:",
          error
        );
      }
    };

    // Setup with a small delay to ensure context is ready
    const timer = setTimeout(setupRealtimeSubscription, 500);

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timer);
      if (balanceSubscription) {
        balanceSubscription.unsubscribe();
        console.log(
          "🧹 BalanceContext: Balance real-time subscription cleaned up"
        );
      }
    };
  }, [isDemo, fetchBalances]);

  // Also listen to transaction changes as a fallback
  useEffect(() => {
    if (isDemo || process.env.EXPO_PUBLIC_DISABLE_REALTIME === "true") {
      console.log(
        "🎭 BalanceContext: Skipping transaction subscription (demo mode or disabled)"
      );
      return; // Skip in demo mode or if disabled
    }

    let transactionSubscription: any = null;

    const setupTransactionSubscription = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error(
            "🔒 BalanceContext: Auth error during transaction subscription:",
            error
          );
          return;
        }
        if (!user) {
          console.log(
            "🔒 BalanceContext: No authenticated user for transaction subscription"
          );
          return;
        }

        console.log(
          "📡 BalanceContext: Setting up transaction-balance sync for user:",
          user.email
        );

        // Subscribe to transactions_real table changes
        transactionSubscription = supabase
          .channel(`transaction-balance-sync-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "transactions_real",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log(
                "🔔 BalanceContext: Transaction change detected, refreshing balances:",
                payload.eventType,
                payload.new?.id || payload.old?.id
              );
              // Delay to allow database triggers to complete
              setTimeout(() => {
                console.log(
                  "🔄 BalanceContext: Refreshing balances after transaction change (500ms delay)"
                );
                fetchBalances();
              }, 500);
            }
          )
          .subscribe((status, error) => {
            if (error) {
              console.warn(
                "⚠️ BalanceContext: Transaction subscription error (non-critical):",
                error
              );
              // Don't break app - continue with manual refresh methods
            } else {
              console.log(
                "📡 BalanceContext: Transaction subscription status:",
                status
              );
              if (status === "SUBSCRIBED") {
                console.log(
                  "✅ BalanceContext: Transaction-balance sync is active!"
                );
              } else if (status === "CHANNEL_ERROR") {
                console.warn(
                  "⚠️ BalanceContext: Transaction channel error - using fallback methods"
                );
              }
            }
          });

        console.log(
          "📡 BalanceContext: Transaction-balance sync subscription established"
        );
      } catch (error) {
        console.error(
          "❌ BalanceContext: Error setting up transaction subscription:",
          error
        );
      }
    };

    // Setup with a small delay to ensure context is ready
    const timer = setTimeout(setupTransactionSubscription, 700);

    return () => {
      clearTimeout(timer);
      if (transactionSubscription) {
        transactionSubscription.unsubscribe();
        console.log(
          "🧹 BalanceContext: Transaction-balance sync subscription cleaned up"
        );
      }
    };
  }, [isDemo, fetchBalances]);

  const value: BalanceContextType = {
    balances,
    loading,
    error,
    refreshBalances,
    getAccountBalance,
    totalBalance,
    bankAccountBalances,
    debugComparison,
  };

  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  );
};

export default BalanceContext;
