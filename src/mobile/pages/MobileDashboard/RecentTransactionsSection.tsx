import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
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
  icon: string;
  date: string;
  tags?: string[];
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
  return {
    id: supabaseTransaction.id,
    description: supabaseTransaction.name || "Transaction",
    isRecurring: supabaseTransaction.is_recurring,
    account: supabaseTransaction.source_account_name || "Unknown Account",
    type: supabaseTransaction.type as "income" | "expense" | "transfer",
    amount: Math.abs(supabaseTransaction.amount).toFixed(2),
    category: supabaseTransaction.category_name || "Uncategorized",
    subcategory: supabaseTransaction.subcategory_name || undefined,
    note: supabaseTransaction.description || undefined,
    icon: supabaseTransaction.icon || "receipt",
    date: supabaseTransaction.date,
    tags: [
      supabaseTransaction.category_name,
      supabaseTransaction.subcategory_name,
      supabaseTransaction.is_recurring ? "Recurring" : undefined,
    ].filter(Boolean) as string[],
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
      month: "long",
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

  const getIconName = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      "credit-card": "💳",
      "shopping-basket": "🛒",
      home: "🏠",
      receipt: "📄",
      briefcase: "💼",
      utensils: "🍽️",
      car: "🚗",
      gamepad: "🎮",
      "shopping-bag": "🛍️",
      heartbeat: "❤️",
      bolt: "⚡",
    };
    return iconMap[icon] || "📊";
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
      {dayData.transactions.map((transaction) => (
        <TouchableOpacity
          key={transaction.id}
          style={[
            styles.transactionItem,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => onEditTransaction(transaction.id)}
          onLongPress={() => {
            Alert.alert(
              "Delete Transaction",
              "Are you sure you want to delete this transaction?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => onDeleteTransaction(transaction.id),
                },
              ]
            );
          }}
        >
          <View style={styles.transactionLeft}>
            <View style={styles.transactionIcon}>
              <Text style={styles.transactionIconText}>
                {getIconName(transaction.icon)}
              </Text>
            </View>
            <View style={styles.transactionInfo}>
              <Text
                style={[styles.transactionDescription, { color: colors.text }]}
                numberOfLines={1}
              >
                {transaction.description}
              </Text>
              <Text
                style={[
                  styles.transactionAccount,
                  { color: colors.textSecondary },
                ]}
              >
                {transaction.account}
              </Text>
              {transaction.note && (
                <Text
                  style={[
                    styles.transactionNote,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {transaction.note}
                </Text>
              )}
              {transaction.tags && transaction.tags.length > 0 && (
                <View style={styles.transactionTags}>
                  {transaction.tags.slice(0, 2).map((tag, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: "#10B98120" }]}
                    >
                      <Text style={[styles.tagText, { color: "#10B981" }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.transactionRight}>
            <Text
              style={[
                styles.transactionAmount,
                { color: getTransactionColor(transaction.type) },
              ]}
            >
              {transaction.type === "income" ? "+" : "-"}
              {transaction.amount}
            </Text>
            <View style={styles.transactionActions}>
              {transaction.isRecurring && (
                <View style={styles.recurringIndicator}>
                  <Text style={styles.recurringText}>🔄</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEditTransaction(transaction.id)}
              >
                <Text
                  style={[styles.actionIcon, { color: colors.textSecondary }]}
                >
                  ✏️
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDeleteTransaction(transaction.id)}
              >
                <Text
                  style={[styles.actionIcon, { color: colors.textSecondary }]}
                >
                  🗑️
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

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

  // Fetch transactions from Supabase
  const fetchTransactionsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on selected filter - ensure we get enough transactions
      const now = new Date();
      let startDate = new Date();

      switch (selectedFilter.toLowerCase()) {
        case "this week":
          startDate.setDate(now.getDate() - 30); // Extended to 30 days to ensure enough transactions
          break;
        case "monthly":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarterly":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "this year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30); // Default to 30 days to show at least 10 transactions
      }

      // Fetch transactions from Supabase
      const supabaseTransactions = await fetchTransactions(
        {
          dateRange: { start: startDate, end: now },
        },
        isDemo
      );

      // Transform Supabase transactions to component format
      const transformedTransactions = supabaseTransactions.map(
        transformSupabaseTransaction
      );

      setTransactions(transformedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
      // Fallback to empty array
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, isDemo]);

  // Load transactions when component mounts or filter changes
  useEffect(() => {
    fetchTransactionsData();
  }, [fetchTransactionsData]);

  const filteredTransactions = transactions;
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>📄</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Transactions Yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Start by adding your first transaction!
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.transactionsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {Object.entries(groupedTransactions).map(([date, dayData]) => (
                <TransactionGroup
                  key={date}
                  date={date}
                  dayData={dayData}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Edit Modal */}
      {isEditModalVisible && editingTransaction && (
        <QuickAddButton
          editTransaction={editingTransaction}
          isEditMode={true}
          onTransactionUpdate={handleTransactionUpdate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
    borderRadius: 12,
    borderWidth: 1,
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
    fontSize: 14,
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
});

export default RecentTransactionsSection;
