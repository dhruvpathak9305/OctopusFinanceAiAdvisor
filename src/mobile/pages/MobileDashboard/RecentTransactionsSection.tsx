import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
} from "react-native";
import TransactionItem from "../../components/TransactionItem";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import {
  fetchTransactions,
  deleteTransaction,
  fetchTransactionById,
} from "../../../../services/transactionsService";
import { Transaction as SupabaseTransaction } from "../../../../types/transactions";
import { Ionicons } from "@expo/vector-icons";
import QuickAddButton from "../../components/QuickAddButton";
import { balanceEventEmitter } from "../../../../utils/balanceEventEmitter";
import { useInfiniteScroll } from "../../../../hooks/useInfiniteScroll";
import { TransactionsRepository } from "../../../../services/repositories/transactionsRepository";
import { useUnifiedAuth } from "../../../../contexts/UnifiedAuthContext";
import { useSubscription } from "../../../../contexts/SubscriptionContext";
import networkMonitor from "../../../../services/sync/networkMonitor";
import { getLocalDb } from "../../../../services/localDb";

interface RecentTransactionsSectionProps {
  className?: string;
}

// Define transaction types for the component
interface Transaction {
  id: number | string;
  description: string;
  isRecurring?: boolean;
  account: string;
  type: "income" | "expense" | "transfer";
  amount: string;
  category: string;
  subcategory?: string;
  note?: string;
  icon: string | null;
  date: string;
  tags?: string[];
  // Additional fields from Supabase
  subcategory_icon?: string | null;
  category_icon?: string | null;
  // Color fields from database
  category_ring_color?: string | null;
  category_bg_color?: string | null;
  subcategory_color?: string | null;
}

// Define grouped transactions type
interface GroupedTransactions {
  [date: string]: {
    income: number;
    expense: number;
    transfer: number;
    transactions: Transaction[];
  };
}

// Transform Supabase transaction to component transaction
const transformSupabaseTransaction = (
  supabaseTransaction: SupabaseTransaction
): Transaction => {
  // Determine transaction type based on Supabase type or amount
  let transactionType: "income" | "expense" | "transfer" = "expense"; // default

  if (supabaseTransaction.type) {
    switch (supabaseTransaction.type) {
      case "income":
        transactionType = "income";
        break;
      case "expense":
        transactionType = "expense";
        break;
      case "transfer":
        transactionType = "transfer";
        break;
      case "loan":
      case "debt":
        transactionType = "expense"; // Loans and debts are expenses
        break;
      case "loan_repayment":
      case "debt_collection":
        transactionType = "income"; // Loan repayments and debt collections are income
        break;
      default:
        // Fallback: determine type from amount (negative = expense, positive = income)
        transactionType = supabaseTransaction.amount < 0 ? "expense" : "income";
    }
  } else {
    // Fallback: determine type from amount (negative = expense, positive = income)
    transactionType = supabaseTransaction.amount < 0 ? "expense" : "income";
  }

  // Get subcategory icon if available (we need to check for it in the response)
  const subcategoryIcon =
    (supabaseTransaction as any).subcategory_icon ||
    (supabaseTransaction as any).budget_subcategories?.icon ||
    null;

  // Get category icon if available
  const categoryIcon =
    (supabaseTransaction as any).category_icon ||
    (supabaseTransaction as any).budget_categories?.icon ||
    null;

  return {
    id: supabaseTransaction.id,
    description: supabaseTransaction.name || "Transaction",
    isRecurring: supabaseTransaction.is_recurring,
    account: supabaseTransaction.source_account_name || "Unknown Account",
    type: transactionType,
    amount: Math.abs(supabaseTransaction.amount).toFixed(2),
    category: supabaseTransaction.category_name || "uncategorized",
    subcategory: supabaseTransaction.subcategory_name || undefined,
    note: supabaseTransaction.description || undefined,
    // Use subcategory icon, then category icon, then transaction icon
    icon: subcategoryIcon || categoryIcon || supabaseTransaction.icon || null,
    date: supabaseTransaction.date,
    // Pass database colors for proper styling
    category_ring_color:
      (supabaseTransaction as any).category_ring_color ||
      (supabaseTransaction as any).budget_categories?.ring_color,
    category_bg_color:
      (supabaseTransaction as any).category_bg_color ||
      (supabaseTransaction as any).budget_categories?.bg_color,
    subcategory_color:
      (supabaseTransaction as any).subcategory_color ||
      (supabaseTransaction as any).budget_subcategories?.color,
    tags: [
      supabaseTransaction.category_name,
      supabaseTransaction.subcategory_name,
      supabaseTransaction.is_recurring ? "Recurring" : undefined,
    ].filter(Boolean) as string[],
    // CRITICAL: Include metadata for split transaction badge
    metadata: supabaseTransaction.metadata || null,
  };
};

// Group transactions by date
const groupTransactionsByDate = (
  transactions: Transaction[]
): GroupedTransactions => {
  const grouped: GroupedTransactions = {};

  transactions.forEach((transaction) => {
    const date = transaction.date;
    if (!grouped[date]) {
      grouped[date] = {
        income: 0,
        expense: 0,
        transfer: 0,
        transactions: [],
      };
    }

    grouped[date].transactions.push(transaction);

    const amount = parseFloat(transaction.amount);
    switch (transaction.type) {
      case "income":
        grouped[date].income += amount;
        break;
      case "expense":
        grouped[date].expense += amount;
        break;
      case "transfer":
        grouped[date].transfer += amount;
        break;
    }
  });

  return grouped;
};

// Dropdown Component
const Dropdown: React.FC<{
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, options, onValueChange, placeholder }) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const colors = isDark
    ? {
        background: "#374151",
        text: "#FFFFFF",
        border: "#4B5563",
      }
    : {
        background: "#F3F4F6",
        text: "#111827",
        border: "#D1D5DB",
      };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
          {value || placeholder}
        </Text>
        <Text style={[styles.dropdownArrow, { color: colors.text }]}>
          {isOpen ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            styles.dropdownMenu,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dropdownItem,
                value === option && { backgroundColor: "#10B98120" },
              ]}
              onPress={() => {
                onValueChange(option);
                setIsOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                {option}
              </Text>
              {value === option && (
                <Text style={styles.dropdownCheckmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Transaction Group Component
const TransactionGroup: React.FC<{
  date: string;
  dayData: {
    income: number;
    expense: number;
    transfer: number;
    transactions: Transaction[];
  };
  onEditTransaction: (id: number | string) => void;
  onDeleteTransaction: (id: number | string) => void;
}> = ({ date, dayData, onEditTransaction, onDeleteTransaction }) => {
  const { isDark } = useTheme();

  const colors = isDark
    ? {
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        card: "#1F2937",
      }
    : {
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        card: "#FFFFFF",
      };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short", // Changed from "long" to "short" for abbreviated month name
      day: "numeric",
      year: "numeric",
    });
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "income":
        return "#10B981";
      case "expense":
        return "#EF4444";
      case "transfer":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getTransactionBorderColor = (transaction: Transaction) => {
    // Import fallback icon utilities
    const {
      getFallbackBorderColor,
      shouldUseFallbackIcon,
    } = require("../../../../utils/fallbackIcons");

    // Use fallback border colors when category/subcategory info is missing
    if (
      shouldUseFallbackIcon(
        transaction.category,
        transaction.subcategory,
        transaction.icon
      )
    ) {
      return getFallbackBorderColor(transaction.type);
    }

    // Default border color for categorized transactions
    return colors.border;
  };

  return (
    <View
      style={[styles.transactionGroup, { borderBottomColor: colors.border }]}
    >
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {formatDate(date)}
        </Text>
        <View style={styles.dateSummary}>
          {dayData.income > 0 && (
            <Text style={[styles.summaryText, { color: "#10B981" }]}>
              ↓+{formatCurrency(dayData.income)}
            </Text>
          )}
          {dayData.expense > 0 && (
            <Text style={[styles.summaryText, { color: "#EF4444" }]}>
              ↑-{formatCurrency(dayData.expense)}
            </Text>
          )}
          {dayData.transfer > 0 && (
            <Text style={[styles.summaryText, { color: "#3B82F6" }]}>
              ⇌ {formatCurrency(dayData.transfer)}
            </Text>
          )}
        </View>
      </View>

      {/* Transactions */}
      {dayData.transactions.map((transaction, index) => (
        <TransactionItem
          key={`${transaction.id}-${date}-${index}`}
          transaction={transaction}
          onPress={() => onEditTransaction(transaction.id)}
          onEdit={() => onEditTransaction(transaction.id)}
          onDelete={() => onDeleteTransaction(transaction.id)}
          colors={colors}
        />
      ))}
    </View>
  );
};

const RecentTransactionsSection: React.FC<RecentTransactionsSectionProps> = ({
  className = "",
}) => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();
  const { user } = useUnifiedAuth();
  const { isPremium } = useSubscription();
  const isOnline = networkMonitor.isCurrentlyOnline();
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<
    number | string | null
  >(null);

  // Get user ID for repository
  const userId = user?.id || 'offline_user';

  // Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

      // Calculate date range based on selected filter
  const dateRange = useMemo(() => {
      const now = new Date();
      let startDate = new Date();

      switch (selectedFilter.toLowerCase()) {
        case "this week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarterly":
          const currentMonth = now.getMonth();
          const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          break;
        case "this year":
        // Set to January 1st of current year at midnight local time
          startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0); // Ensure it's at midnight
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

    // Normalize endDate to end of today
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999); // End of today

    return { startDate, endDate };
  }, [selectedFilter]);

  // Memoize fetchNext to include dateRange in dependencies
  const fetchNext = useCallback(async (cursor?: string) => {
    if (!userId) {
      return { data: [], nextCursor: undefined, hasMore: false };
    }

    console.log(`📅 RecentTransactions: Fetching page ${cursor || 1} for date range:`, {
      start: formatLocalDate(dateRange.startDate),
      end: formatLocalDate(dateRange.endDate),
      filter: selectedFilter
    });

    const repo = new TransactionsRepository(userId, isPremium, isOnline);
    const page = cursor ? parseInt(cursor, 10) : 1;
    const pageSize = 20; // Load 20 transactions at a time
    
    const result = await repo.findByDateRangePaginated(
      dateRange.startDate,
      dateRange.endDate,
      page,
      pageSize
    );

    console.log(`✅ RecentTransactions: Fetched ${result.data.length} transactions (page ${page}, total: ${result.total})`);
    
    // Debug: Check if there are any transactions at all in the database (only on first page, wrapped in try-catch to prevent errors)
    if (result.total === 0 && page === 1) {
      try {
        const db = await getLocalDb();
        
        // Check transactions for this user
        const allTransactions = await repo.findAll({ user_id: userId });
        console.log(`🔍 Debug: Total transactions in DB for user ${userId}: ${allTransactions.length}`);
        
        // Check ALL transactions (any user_id) to see if sync worked
        const allTransactionsResult = await db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM transactions_local WHERE deleted_offline = 0`
        );
        console.log(`🔍 Debug: Total transactions in DB (all users): ${allTransactionsResult?.count || 0}`);
        
        // Check distinct user_ids in the database
        const distinctUsers = await db.getAllAsync<{ user_id: string; count: number }>(
          `SELECT user_id, COUNT(*) as count FROM transactions_local WHERE deleted_offline = 0 GROUP BY user_id`
        );
        console.log(`🔍 Debug: Distinct user_ids in transactions_local:`, distinctUsers);
        
        if (allTransactions.length > 0) {
          const sampleDate = allTransactions[0]?.date;
          console.log(`🔍 Debug: Sample transaction date: ${sampleDate}`);
          console.log(`🔍 Debug: Date range query: ${formatLocalDate(dateRange.startDate)} to ${formatLocalDate(dateRange.endDate)}`);
          // Check date range of all transactions
          const dates = allTransactions.map(t => t.date).sort();
          console.log(`🔍 Debug: Transaction date range in DB: ${dates[0]} to ${dates[dates.length - 1]}`);
        } else if ((allTransactionsResult?.count || 0) > 0) {
          // If there are transactions but not for this user, show sample
          const sampleTransactions = await db.getAllAsync<{ date: string; user_id: string; name: string }>(
            `SELECT date, user_id, name FROM transactions_local WHERE deleted_offline = 0 ORDER BY date DESC LIMIT 5`
          );
          console.log(`🔍 Debug: Sample transactions (any user):`, sampleTransactions.map(t => ({ date: t.date, user_id: t.user_id, name: t.name })));
          console.log(`⚠️ Warning: Transactions exist but with different user_id! Expected: ${userId}, Found: ${distinctUsers.map(u => u.user_id).join(', ')}`);
        }
      } catch (debugError) {
        // Silently fail debug logging - don't break the main flow
        console.warn('Debug logging failed:', debugError);
      }
    }

    // Transform repository transactions to component format
    const transformed = result.data.map((tx: any) => transformSupabaseTransaction(tx as SupabaseTransaction));

    return {
      data: transformed,
      nextCursor: result.hasMore ? (page + 1).toString() : undefined,
      hasMore: result.hasMore,
    };
  }, [userId, isPremium, isOnline, dateRange.startDate, dateRange.endDate, selectedFilter, formatLocalDate]);

  // Use infinite scroll hook to fetch transactions
  const infiniteScroll = useInfiniteScroll({
    fetchNext,
    pageSize: 20,
    enabled: !!userId,
    onError: (err) => {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    },
  });

  const colors = isDark
    ? {
        background: "#1F2937",
        card: "#1F2937",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        filterBackground: "#374151",
        primary: "#10B981", // Added primary color for quick add button
      }
    : {
        background: "#FFFFFF",
        card: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        filterBackground: "#F3F4F6",
        primary: "#10B981", // Added primary color for quick add button
      };

  // Legacy fetchTransactionsData for backward compatibility (used by refresh handlers)
  const fetchTransactionsData = useCallback(async () => {
    await infiniteScroll.refresh();
  }, [infiniteScroll]);

  // Reset and reload when filter changes
  useEffect(() => {
    console.log(`🔄 RecentTransactions: Filter changed to "${selectedFilter}", resetting...`);
    infiniteScroll.reset();
    // reset() now automatically triggers loadMore(), so no need to call it manually
  }, [selectedFilter]); // Reset when filter changes - reset() will trigger reload

  // Listen for bulk transaction uploads to refresh data
  useEffect(() => {
    const handleTransactionEvent = (event: {
      type: string;
      transactionId?: string;
      source?: string;
    }) => {
      console.log("🔔 RecentTransactions: Received transaction event:", event);

      // Refresh transaction data for any transaction-related event or sync completion
      if (
        event.type.includes("transaction") || 
        event.type.includes("bulk") ||
        event.type === "sync-complete" ||
        event.source === "supabase-to-local"
      ) {
        console.log(
          "🔄 RecentTransactions: Refreshing transactions due to event:",
          event.type
        );
        setTimeout(() => {
          infiniteScroll.refresh(); // Use infiniteScroll.refresh() directly
        }, 500); // Small delay to allow database operations to complete
      }
    };

    // Subscribe to balance events (which include transaction events)
    const unsubscribe = balanceEventEmitter.subscribe(handleTransactionEvent);

    // Also listen for custom web events (fallback)
    const handleCustomEvent = (event: CustomEvent) => {
      console.log(
        "🔔 RecentTransactions: Received custom event:",
        event.detail
      );
      if (
        event.detail?.type === "bulk-upload" ||
        event.detail?.type === "sync-complete" ||
        event.detail?.source === "supabase-to-local"
      ) {
        console.log("🔄 RecentTransactions: Refreshing due to event:", event.detail.type);
        setTimeout(() => {
          infiniteScroll.refresh(); // Use infiniteScroll.refresh() directly
        }, 500);
      }
    };

    if (
      typeof window !== "undefined" &&
      typeof window.addEventListener === "function"
    ) {
      window.addEventListener(
        "transactionsRefreshNeeded",
        handleCustomEvent as EventListener
      );
    }

    return () => {
      unsubscribe();
      if (
        typeof window !== "undefined" &&
        typeof window.removeEventListener === "function"
      ) {
        window.removeEventListener(
          "transactionsRefreshNeeded",
          handleCustomEvent as EventListener
        );
      }
    };
  }, [fetchTransactionsData]);

  // Use transactions from infinite scroll and deduplicate by ID
  const transactions = infiniteScroll.data;
  // Deduplicate transactions by ID to prevent duplicate keys
  const uniqueTransactions = React.useMemo(() => {
    const seen = new Set<string | number>();
    return transactions.filter((tx) => {
      if (seen.has(tx.id)) {
        return false;
      }
      seen.add(tx.id);
      return true;
    });
  }, [transactions]);
  
  const filteredTransactions = uniqueTransactions;
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  const loading = infiniteScroll.isLoading;

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleEditTransaction = useCallback(
    async (transactionId: number | string) => {
      try {
        // Fetch the complete transaction data from the service to get all account information
        const fullTransaction = await fetchTransactionById(
          transactionId.toString(),
          isDemo
        );
        if (fullTransaction) {
          // Transform the complete transaction data to match edit modal expected format
          const editTransactionData = {
            id: fullTransaction.id,
            name: fullTransaction.name,
            description: fullTransaction.description,
            amount: Math.abs(fullTransaction.amount), // Make sure it's positive for the form
            type: fullTransaction.type,
            date: fullTransaction.date,
            source_account_id: fullTransaction.source_account_id,
            source_account_name: fullTransaction.source_account_name,
            source_account_type: fullTransaction.source_account_type,
            destination_account_id: fullTransaction.destination_account_id,
            destination_account_name: fullTransaction.destination_account_name,
            destination_account_type: fullTransaction.destination_account_type,
            category_name: fullTransaction.category_name,
            subcategory_name: fullTransaction.subcategory_name,
            merchant: fullTransaction.merchant,
            is_recurring: fullTransaction.is_recurring || false,
            recurrence_pattern: fullTransaction.recurrence_pattern,
            recurrence_end_date: fullTransaction.recurrence_end_date,
            metadata: fullTransaction.metadata || null, // CRITICAL: Include metadata for split transaction loading
          };

          setEditingTransaction(editTransactionData);
          setIsEditModalVisible(true);
        } else {
          Alert.alert(
            "Error",
            "Could not load transaction details for editing"
          );
        }
      } catch (error) {
        console.error("Error fetching transaction for edit:", error);
        Alert.alert("Error", "Failed to load transaction details");
      }
    },
    [isDemo]
  );

  const showDeleteConfirmation = useCallback(
    (transactionId: number | string) => {
      setTransactionToDelete(transactionId);
      setIsDeleteModalVisible(true);
    },
    []
  );

  const handleDeleteTransaction = useCallback(
    async (transactionId: number | string) => {
      try {
        await deleteTransaction(transactionId.toString(), isDemo);
        // Refresh transactions after deletion
        fetchTransactionsData();
        Alert.alert("Success", "Transaction deleted successfully");
      } catch (err) {
        console.error("Error deleting transaction:", err);
        Alert.alert("Error", "Failed to delete transaction");
      }
    },
    [isDemo, fetchTransactionsData]
  );

  const confirmDeleteTransaction = useCallback(async () => {
    if (transactionToDelete) {
      await handleDeleteTransaction(transactionToDelete);
      setIsDeleteModalVisible(false);
      setTransactionToDelete(null);
    }
  }, [transactionToDelete, handleDeleteTransaction]);

  const cancelDeleteTransaction = useCallback(() => {
    setIsDeleteModalVisible(false);
    setTransactionToDelete(null);
  }, []);

  const handleViewAll = () => {
    // Navigate to Transactions page
    (navigation as any).navigate("Transactions");
  };

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalVisible(false);
    setEditingTransaction(null);
  }, []);

  const handleTransactionUpdate = useCallback(() => {
    // Refresh transactions after edit
    fetchTransactionsData();
  }, [fetchTransactionsData]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>
              Recent Transactions
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/* Filter */}
            <Dropdown
              value={selectedFilter}
              options={["This Week", "Monthly", "Quarterly", "This Year"]}
              onValueChange={handleFilterChange}
              placeholder="Select period"
            />

            {/* View All Button */}
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={[styles.viewAllText, { color: "#10B981" }]}>
                View all
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: "#EF4444" }]}>
                {error}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchTransactionsData}
              >
                <Text style={[styles.retryButtonText, { color: "#10B981" }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : Object.keys(groupedTransactions).length === 0 ? (
            <View
              style={[
                styles.emptyContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {/* Creative Empty State Icon - Wallet with sparkle */}
              <View style={styles.emptyIconWrapper}>
                <View style={[styles.emptyIconOuter, { backgroundColor: '#10B98115' }]}>
                  <View style={[styles.emptyIconInner, { backgroundColor: '#10B98125' }]}>
                    {/* Wallet shape */}
                    <View style={styles.walletIcon}>
                      <View style={[styles.walletBody, { backgroundColor: '#10B981' }]}>
                        <View style={[styles.walletFlap, { backgroundColor: '#0D9668' }]} />
                        <View style={styles.walletClasp} />
                      </View>
                    </View>
                  </View>
                </View>
                {/* Sparkle accents */}
                <View style={[styles.sparkle, styles.sparkle1, { backgroundColor: '#10B981' }]} />
                <View style={[styles.sparkle, styles.sparkle2, { backgroundColor: '#10B981' }]} />
                <View style={[styles.sparkle, styles.sparkle3, { backgroundColor: '#34D399' }]} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Transactions Yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Your financial journey starts here!{'\n'}Add your first transaction to begin tracking.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.transactionsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              refreshControl={
                <RefreshControl
                  refreshing={infiniteScroll.isLoading && !infiniteScroll.isLoadingMore}
                  onRefresh={infiniteScroll.refresh}
                  tintColor={colors.primary}
                />
              }
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const paddingToBottom = 20;
                const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
                
                if (isCloseToBottom && infiniteScroll.hasMore && !infiniteScroll.isLoadingMore) {
                  infiniteScroll.loadMore();
                }
              }}
              scrollEventThrottle={400}
            >
              {Object.entries(groupedTransactions).map(([date, dayData]) => (
                <TransactionGroup
                  key={date}
                  date={date}
                  dayData={dayData}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={showDeleteConfirmation}
                />
              ))}
              {infiniteScroll.isLoadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingMoreText, { color: colors.textSecondary }]}>
                    Loading more...
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Edit Modal */}
      {isEditModalVisible && editingTransaction && (
        <QuickAddButton
          editTransaction={editingTransaction}
          isEditMode={true}
          onTransactionUpdate={() => {
            // First refresh the data
            handleTransactionUpdate();
            // Close the modal immediately to prevent it from reopening
            handleCloseEditModal();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDeleteTransaction}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.deleteModalContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.deleteModalHeader}>
              <Text style={[styles.deleteModalTitle, { color: colors.text }]}>
                Delete Transaction
              </Text>
            </View>

            <View style={styles.deleteModalContent}>
              <Text
                style={[
                  styles.deleteModalMessage,
                  { color: colors.textSecondary },
                ]}
              >
                Are you sure you want to delete this transaction? This action
                cannot be undone.
              </Text>
            </View>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[
                  styles.deleteModalButton,
                  styles.cancelButton,
                  { borderColor: colors.border },
                ]}
                onPress={cancelDeleteTransaction}
              >
                <Text
                  style={[styles.deleteModalButtonText, { color: colors.text }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalButton, styles.confirmButton]}
                onPress={confirmDeleteTransaction}
              >
                <Text
                  style={[styles.deleteModalButtonText, { color: "#FFFFFF" }]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  dropdownButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dropdownCheckmark: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyIconWrapper: {
    position: 'relative',
    marginBottom: 20,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBody: {
    width: 36,
    height: 28,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  walletFlap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  walletClasp: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sparkle1: {
    top: 8,
    right: 12,
    opacity: 0.8,
  },
  sparkle2: {
    bottom: 15,
    left: 10,
    width: 5,
    height: 5,
    opacity: 0.6,
  },
  sparkle3: {
    top: 25,
    left: 5,
    width: 4,
    height: 4,
    opacity: 0.5,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10B98120",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  transactionsList: {
    maxHeight: 600, // Increased to show at least 10 transactions
  },
  transactionGroup: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dateSummary: {
    flexDirection: "row",
    gap: 8,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionAccount: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionNote: {
    fontSize: 11,
    marginBottom: 4,
  },
  transactionTags: {
    flexDirection: "row",
    gap: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  transactionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recurringIndicator: {
    alignItems: "center",
  },
  recurringText: {
    fontSize: 10,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
  // Delete Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContainer: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  deleteModalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deleteModalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  deleteModalActions: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: "#EF4444",
  },
  deleteModalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RecentTransactionsSection;
