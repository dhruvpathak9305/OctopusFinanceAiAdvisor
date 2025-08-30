import { supabase } from "../lib/supabase/client";

/**
 * Balance Debugger Utility
 * Helps diagnose sync issues between UI and database
 */
export class BalanceDebugger {
  /**
   * Get direct database values for comparison
   */
  static async getDirectDatabaseValues() {
    try {
      console.log("🔍 BalanceDebugger: Starting database inspection...");

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user");
      }
      console.log("👤 BalanceDebugger: User:", user.email);

      // Get raw balance_real data
      const { data: balanceData, error: balanceError } = await supabase
        .from("balance_real")
        .select("*")
        .eq("user_id", user.id);

      if (balanceError) {
        console.error(
          "❌ BalanceDebugger: Error fetching balance_real:",
          balanceError
        );
      } else {
        console.log("📊 BalanceDebugger: Raw balance_real data:", balanceData);
      }

      // Get raw accounts_real data
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts_real")
        .select("*")
        .eq("user_id", user.id);

      if (accountsError) {
        console.error(
          "❌ BalanceDebugger: Error fetching accounts_real:",
          accountsError
        );
      } else {
        console.log(
          "🏦 BalanceDebugger: Raw accounts_real data:",
          accountsData
        );
      }

      // Get joined data (what BalanceService should return)
      const { data: joinedData, error: joinedError } = await supabase
        .from("balance_real")
        .select(
          `
          *,
          accounts_real!balance_real_account_id_fkey (
            name,
            type,
            institution,
            account_number,
            currency
          )
        `
        )
        .eq("user_id", user.id)
        .order("last_updated", { ascending: false });

      if (joinedError) {
        console.error(
          "❌ BalanceDebugger: Error fetching joined data:",
          joinedError
        );
      } else {
        console.log(
          "🔗 BalanceDebugger: Joined balance + account data:",
          joinedData
        );
      }

      // Calculate totals
      const totalBalance = (balanceData || []).reduce(
        (sum: number, balance: any) => {
          const currentBalance = parseFloat(balance.current_balance) || 0;
          console.log(`💰 Account ${balance.account_id}: ${currentBalance}`);
          return sum + currentBalance;
        },
        0
      );

      console.log(
        "🧮 BalanceDebugger: Total balance calculated:",
        totalBalance
      );

      // Check RLS policies
      console.log("🔒 BalanceDebugger: Checking RLS policies...");
      const { data: rlsData, error: rlsError } = await supabase.rpc(
        "pg_has_role",
        { role: "authenticated" }
      );

      if (rlsError) {
        console.warn(
          "⚠️ BalanceDebugger: Could not check RLS status:",
          rlsError
        );
      } else {
        console.log(
          "🔒 BalanceDebugger: User has authenticated role:",
          rlsData
        );
      }

      return {
        user: user.email,
        balanceData,
        accountsData,
        joinedData,
        totalBalance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ BalanceDebugger: Fatal error:", error);
      throw error;
    }
  }

  /**
   * Compare BalanceService output with direct database query
   */
  static async compareServiceVsDatabase() {
    try {
      console.log(
        "🔄 BalanceDebugger: Comparing BalanceService vs Direct Database..."
      );

      // Import BalanceService dynamically to avoid circular imports
      const { default: BalanceService } = await import(
        "../services/balanceService"
      );

      // Get service data
      const serviceData = await BalanceService.fetchAccountBalances(
        undefined,
        false
      );
      console.log("🔧 BalanceDebugger: BalanceService data:", serviceData);

      // Get direct database data
      const directData = await this.getDirectDatabaseValues();

      // Compare totals
      const serviceTotal = serviceData.reduce(
        (sum, balance) => sum + balance.current_balance,
        0
      );
      const directTotal = directData.totalBalance;

      console.log("⚖️  BalanceDebugger: Comparison Results:");
      console.log("   📱 UI/Service Total:", serviceTotal);
      console.log("   🗄️  Database Total:", directTotal);
      console.log("   🔍 Difference:", serviceTotal - directTotal);
      console.log("   ✅ Match:", serviceTotal === directTotal ? "YES" : "NO");

      return {
        serviceData,
        directData,
        serviceTotal,
        directTotal,
        difference: serviceTotal - directTotal,
        match: serviceTotal === directTotal,
      };
    } catch (error) {
      console.error("❌ BalanceDebugger: Comparison failed:", error);
      throw error;
    }
  }

  /**
   * Test real-time subscriptions
   */
  static async testRealtimeSubscriptions() {
    try {
      console.log("📡 BalanceDebugger: Testing real-time subscriptions...");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Test balance_real subscription
      const balanceSubscription = supabase
        .channel("debug-balance-test")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "balance_real",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log(
              "🔔 BalanceDebugger: Balance subscription received:",
              payload
            );
          }
        )
        .subscribe((status) => {
          console.log(
            "📡 BalanceDebugger: Balance subscription status:",
            status
          );
        });

      // Test transactions_real subscription
      const transactionSubscription = supabase
        .channel("debug-transaction-test")
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
              "🔔 BalanceDebugger: Transaction subscription received:",
              payload
            );
          }
        )
        .subscribe((status) => {
          console.log(
            "📡 BalanceDebugger: Transaction subscription status:",
            status
          );
        });

      console.log(
        "📡 BalanceDebugger: Subscriptions established. Add/edit/delete a transaction to test..."
      );

      // Return cleanup function
      return () => {
        balanceSubscription.unsubscribe();
        transactionSubscription.unsubscribe();
        console.log("🧹 BalanceDebugger: Test subscriptions cleaned up");
      };
    } catch (error) {
      console.error("❌ BalanceDebugger: Subscription test failed:", error);
      throw error;
    }
  }
}

// Global debug functions for console access
(global as any).debugBalance = BalanceDebugger.getDirectDatabaseValues;
(global as any).debugBalanceComparison =
  BalanceDebugger.compareServiceVsDatabase;
(global as any).debugBalanceSubscriptions =
  BalanceDebugger.testRealtimeSubscriptions;

export default BalanceDebugger;
