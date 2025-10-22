/**
 * =============================================================================
 * FIXED DEPOSITS SERVICE - SUPABASE INTEGRATION
 * =============================================================================
 * 
 * Service for managing Fixed Deposit (FD) data and syncing with Net Worth
 * 
 * Features:
 * - Fetch all active FDs for user
 * - Calculate current value with accrued interest
 * - Format FDs for Net Worth display
 * - Group FDs by institution/bank
 * - Auto-sync with Net Worth entries
 * 
 * =============================================================================
 */

import { supabase } from "../lib/supabase/client";
import { getTableMap } from "../utils/tableMapping";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface FixedDeposit {
  id: string;
  user_id: string;
  account_id: string;
  deposit_number: string;
  deposit_name: string | null;
  principal_amount: number;
  interest_rate: number;
  interest_type: 'simple' | 'compound';
  interest_payout_frequency: 'monthly' | 'quarterly' | 'yearly' | 'maturity';
  period_months: number;
  opening_date: string;
  maturity_date: string;
  maturity_amount: number;
  current_value: number;
  interest_accrued: number;
  status: 'active' | 'matured' | 'closed' | 'premature_closed';
  auto_renewal: boolean;
  nomination_status: 'registered' | 'not_registered';
  nominee_name: string | null;
  nominee_relationship: string | null;
  institution: string;
  branch_name: string | null;
  linked_account_number: string | null;
  premature_withdrawal_penalty: number | null;
  tds_applicable: boolean;
  tds_deducted: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface FDSummaryByBank {
  institution: string;
  count: number;
  total_principal: number;
  total_current_value: number;
  total_interest_accrued: number;
  fds: FixedDeposit[];
}

export interface FDNetWorthData {
  id: string;
  name: string;
  value: number;
  percentage: number;
  items: number;
  icon: string;
  color: string;
  institution: string;
  fd_count: number;
  subcategories: Array<{
    id: string;
    name: string;
    value: number;
    percentage: number;
    principal: number;
    interest_rate: number;
    maturity_date: string;
    institution: string;
    deposit_number: string;
    icon: string;
    color: string;
  }>;
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch all active Fixed Deposits for the current user
 */
export const fetchFixedDeposits = async (
  isDemo: boolean = false
): Promise<FixedDeposit[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const tableMap = getTableMap(isDemo);
  const tableName = tableMap.fixed_deposits || "fixed_deposits_real";

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("maturity_date", { ascending: true });

  if (error) {
    console.error("Error fetching fixed deposits:", error);
    throw error;
  }

  return (data as FixedDeposit[]) || [];
};

/**
 * Fetch FD summary grouped by bank/institution
 */
export const fetchFDSummaryByBank = async (
  isDemo: boolean = false
): Promise<FDSummaryByBank[]> => {
  const fds = await fetchFixedDeposits(isDemo);

  // Group by institution
  const groupedByBank = fds.reduce((acc, fd) => {
    const bank = fd.institution || "Unknown Bank";
    
    if (!acc[bank]) {
      acc[bank] = {
        institution: bank,
        count: 0,
        total_principal: 0,
        total_current_value: 0,
        total_interest_accrued: 0,
        fds: [],
      };
    }

    acc[bank].count += 1;
    acc[bank].total_principal += Number(fd.principal_amount);
    acc[bank].total_current_value += Number(fd.current_value);
    acc[bank].total_interest_accrued += Number(fd.interest_accrued);
    acc[bank].fds.push(fd);

    return acc;
  }, {} as Record<string, FDSummaryByBank>);

  return Object.values(groupedByBank).sort(
    (a, b) => b.total_current_value - a.total_current_value
  );
};

/**
 * Calculate total FD portfolio value
 */
export const calculateTotalFDValue = async (
  isDemo: boolean = false
): Promise<{
  total_fds: number;
  total_principal: number;
  total_current_value: number;
  total_interest_accrued: number;
  banks_count: number;
}> => {
  const fds = await fetchFixedDeposits(isDemo);
  const summary = await fetchFDSummaryByBank(isDemo);

  return {
    total_fds: fds.length,
    total_principal: fds.reduce((sum, fd) => sum + Number(fd.principal_amount), 0),
    total_current_value: fds.reduce((sum, fd) => sum + Number(fd.current_value), 0),
    total_interest_accrued: fds.reduce((sum, fd) => sum + Number(fd.interest_accrued), 0),
    banks_count: summary.length,
  };
};

// =============================================================================
// NET WORTH INTEGRATION
// =============================================================================

/**
 * Format Fixed Deposits data for Net Worth "Debt & Fixed Income" category
 * Returns data for the "Fixed Deposits" subcategory
 */
export const fetchFixedDepositsForNetWorth = async (
  isDemo: boolean = false
): Promise<FDNetWorthData[]> => {
  try {
    console.log("💰 fetchFixedDepositsForNetWorth called with isDemo:", isDemo);

    const fdsByBank = await fetchFDSummaryByBank(isDemo);
    const totals = await calculateTotalFDValue(isDemo);

    console.log("💰 FDs by bank:", fdsByBank);
    console.log("💰 Total FD value:", totals.total_current_value);

    // If no FDs, return empty array
    if (fdsByBank.length === 0) {
      console.log("💰 No FDs found, returning empty array");
      return [];
    }

    // Format each bank's FDs as a Net Worth entry
    const result = fdsByBank.map((bankSummary) => ({
      id: `fd-${bankSummary.institution.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${bankSummary.institution} Fixed Deposits`,
      value: bankSummary.total_current_value,
      percentage: totals.total_current_value > 0
        ? Math.round((bankSummary.total_current_value / totals.total_current_value) * 100 * 10) / 10
        : 0,
      items: bankSummary.count,
      icon: "time-outline", // Clock icon for FDs
      color: "#8B5CF6", // Purple for fixed income
      institution: bankSummary.institution,
      fd_count: bankSummary.count,
      subcategories: bankSummary.fds.map((fd) => ({
        id: fd.id,
        name: fd.deposit_name || `FD ${fd.deposit_number}`,
        value: Number(fd.current_value),
        percentage: bankSummary.total_current_value > 0
          ? Math.round((Number(fd.current_value) / bankSummary.total_current_value) * 100)
          : 0,
        principal: Number(fd.principal_amount),
        interest_rate: Number(fd.interest_rate),
        maturity_date: fd.maturity_date,
        institution: fd.institution,
        deposit_number: fd.deposit_number,
        icon: "time-outline",
        color: "#8B5CF6",
      })),
    }));

    console.log("💰 Formatted FD data for Net Worth:", result);
    return result;
  } catch (error) {
    console.error("💰 Error fetching FDs for Net Worth:", error);
    return [];
  }
};

/**
 * Get aggregated FD summary for display
 */
export const getAggregatedFDSummary = async (
  isDemo: boolean = false
): Promise<{
  total_value: number;
  fd_count: number;
  bank_count: number;
  display_text: string;
}> => {
  try {
    const totals = await calculateTotalFDValue(isDemo);

    return {
      total_value: totals.total_current_value,
      fd_count: totals.total_fds,
      bank_count: totals.banks_count,
      display_text: `${totals.total_fds} FDs across ${totals.banks_count} ${totals.banks_count === 1 ? 'bank' : 'banks'}`,
    };
  } catch (error) {
    console.error("Error getting FD summary:", error);
    return {
      total_value: 0,
      fd_count: 0,
      bank_count: 0,
      display_text: "No active FDs",
    };
  }
};

// =============================================================================
// SYNC WITH NET WORTH ENTRIES
// =============================================================================

/**
 * Sync Fixed Deposits to Net Worth entries
 * This ensures FDs appear in the Net Worth calculations
 */
export const syncFDsToNetWorth = async (
  isDemo: boolean = false
): Promise<void> => {
  try {
    console.log("🔄 Starting FD sync to Net Worth...");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tableMap = getTableMap(isDemo);
    const fds = await fetchFixedDeposits(isDemo);

    console.log(`🔄 Found ${fds.length} active FDs to sync`);

    // Find "Debt & Fixed Income" category
    const { data: category, error: catError } = await supabase
      .from(tableMap.net_worth_categories)
      .select("id, name")
      .ilike("name", "%debt%fixed%income%")
      .or("name.ilike.%fixed%income%")
      .single();

    if (catError || !category) {
      console.error("🔄 Could not find 'Debt & Fixed Income' category:", catError);
      return;
    }

    console.log("🔄 Found category:", category);

    // Find "Fixed Deposits" subcategory
    const { data: subcategory, error: subError } = await supabase
      .from(tableMap.net_worth_subcategories)
      .select("id, name")
      .eq("category_id", category.id)
      .ilike("name", "%fixed%deposit%")
      .single();

    if (subError || !subcategory) {
      console.error("🔄 Could not find 'Fixed Deposits' subcategory:", subError);
      return;
    }

    console.log("🔄 Found subcategory:", subcategory);

    // Get existing FD entries in Net Worth
    const { data: existingEntries } = await supabase
      .from(tableMap.net_worth_entries)
      .select("id, linked_source_id, value")
      .eq("user_id", user.id)
      .eq("category_id", category.id)
      .eq("subcategory_id", subcategory.id)
      .eq("linked_source_type", "fixed_deposit");

    const existingFDIds = new Set(
      (existingEntries || []).map((e) => e.linked_source_id)
    );

    // Sync each FD
    for (const fd of fds) {
      if (existingFDIds.has(fd.id)) {
        // Update existing entry
        await supabase
          .from(tableMap.net_worth_entries)
          .update({
            asset_name: fd.deposit_name || `FD ${fd.deposit_number}`,
            value: Number(fd.current_value),
            market_price: Number(fd.principal_amount),
            notes: `Interest: ${fd.interest_rate}% | Maturity: ${fd.maturity_date}`,
            updated_at: new Date().toISOString(),
            last_synced_at: new Date().toISOString(),
          })
          .eq("linked_source_id", fd.id)
          .eq("user_id", user.id);

        console.log(`🔄 Updated FD entry: ${fd.deposit_number}`);
      } else {
        // Create new entry
        await supabase.from(tableMap.net_worth_entries).insert({
          user_id: user.id,
          asset_name: fd.deposit_name || `FD ${fd.deposit_number}`,
          category_id: category.id,
          subcategory_id: subcategory.id,
          value: Number(fd.current_value),
          market_price: Number(fd.principal_amount),
          quantity: 1,
          date: fd.opening_date,
          notes: `Interest: ${fd.interest_rate}% | Maturity: ${fd.maturity_date}`,
          is_active: true,
          is_included_in_net_worth: true,
          linked_source_type: "fixed_deposit",
          linked_source_id: fd.id,
          last_synced_at: new Date().toISOString(),
        });

        console.log(`🔄 Created new FD entry: ${fd.deposit_number}`);
      }
    }

    console.log("✅ FD sync completed successfully");
  } catch (error) {
    console.error("❌ Error syncing FDs to Net Worth:", error);
    throw error;
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate days until maturity
 */
export const calculateDaysToMaturity = (maturityDate: string): number => {
  const today = new Date();
  const maturity = new Date(maturityDate);
  const diffTime = maturity.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format FD display name
 */
export const formatFDDisplayName = (fd: FixedDeposit): string => {
  if (fd.deposit_name) return fd.deposit_name;
  return `${fd.institution} FD - ${fd.deposit_number}`;
};

/**
 * Check if FD is maturing soon (within 30 days)
 */
export const isMaturingSoon = (maturityDate: string): boolean => {
  const daysToMaturity = calculateDaysToMaturity(maturityDate);
  return daysToMaturity > 0 && daysToMaturity <= 30;
};

/**
 * Get FD status display
 */
export const getFDStatusDisplay = (fd: FixedDeposit): {
  status: string;
  color: string;
  message: string;
} => {
  const daysToMaturity = calculateDaysToMaturity(fd.maturity_date);

  if (daysToMaturity < 0) {
    return {
      status: "Matured",
      color: "#EF4444",
      message: "FD has matured",
    };
  } else if (daysToMaturity <= 30) {
    return {
      status: "Maturing Soon",
      color: "#F59E0B",
      message: `Matures in ${daysToMaturity} days`,
    };
  } else {
    return {
      status: "Active",
      color: "#10B981",
      message: `Matures in ${daysToMaturity} days`,
    };
  }
};

export default {
  fetchFixedDeposits,
  fetchFDSummaryByBank,
  calculateTotalFDValue,
  fetchFixedDepositsForNetWorth,
  getAggregatedFDSummary,
  syncFDsToNetWorth,
  calculateDaysToMaturity,
  formatFDDisplayName,
  isMaturingSoon,
  getFDStatusDisplay,
};

