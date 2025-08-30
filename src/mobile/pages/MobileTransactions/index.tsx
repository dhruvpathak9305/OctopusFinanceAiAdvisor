import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import {
  fetchTransactions,
  deleteTransaction,
  fetchTransactionById,
} from "../../../../services/transactionsService";
import { Transaction as SupabaseTransaction } from "../../../../types/transactions";
import DateSelector from "../../components/DateSelector";
import SearchModal from "../../components/SearchModal";
import QuickAddButton from "../../components/QuickAddButton";

interface MobileTransactionsProps {
  className?: string;
}

interface SearchData {
  text: string;
  amount: string;
  category: string;
  date: string;
}

// Define transaction types for the component
interface Transaction {
  id: string;
  title: string;
  source: string;
  tags: string[];
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  icon: string;
  date: string;
}

// Define grouped transactions type
interface GroupedTransactions {
  id: string;
  date: string;
  transactions: Transaction[];
  summary: { income: number; expense: number; transfer: number };
}

// Transform Supabase transaction to component transaction
const transformSupabaseTransaction = (
  supabaseTransaction: SupabaseTransaction
): Transaction => {
  try {
    return {
      id: supabaseTransaction.id || "",
      title: supabaseTransaction.name || "Transaction",
      source: supabaseTransaction.source_account_name || "Unknown Account",
      tags: [
        supabaseTransaction.category_name,
        supabaseTransaction.subcategory_name,
        supabaseTransaction.is_recurring ? "Recurring" : undefined,
      ].filter(Boolean) as string[],
      description: supabaseTransaction.description || "",
      amount:
        typeof supabaseTransaction.amount === "number"
          ? supabaseTransaction.amount
          : 0,
      type:
        (supabaseTransaction.type as "income" | "expense" | "transfer") ||
        "expense",
      icon: getTransactionIcon(
        supabaseTransaction.type,
        supabaseTransaction.icon
      ),
      date: supabaseTransaction.date || new Date().toISOString().split("T")[0],
    };
  } catch (error) {
    console.error(
      "Error transforming transaction:",
      error,
      supabaseTransaction
    );
    // Return a safe fallback transaction
    return {
      id: "error-" + Date.now(),
      title: "Error Loading Transaction",
      source: "Unknown",
      tags: ["Error"],
      description: "Failed to load transaction data",
      amount: 0,
      type: "expense",
      icon: "⚠️",
      date: new Date().toISOString().split("T")[0],
    };
  }
};

// Get appropriate icon for transaction type
const getTransactionIcon = (
  type: string,
  customIcon?: string | null
): string => {
  if (customIcon) return customIcon;

  const iconMap: { [key: string]: string } = {
    income: "💰",
    expense: "💸",
    transfer: "🔄",
    loan: "🏦",
    loan_repayment: "📋",
    debt: "💳",
    debt_collection: "📊",
  };

  return iconMap[type] || "📄";
};

// Group transactions by date
const groupTransactionsByDate = (
  transactions: Transaction[]
): GroupedTransactions[] => {
  try {
    const grouped: { [date: string]: GroupedTransactions } = {};

    transactions.forEach((transaction) => {
      if (!transaction || !transaction.date) {
        console.warn("Invalid transaction found:", transaction);
        return;
      }

      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = {
          id: date,
          date: date,
          transactions: [],
          summary: { income: 0, expense: 0, transfer: 0 },
        };
      }

      grouped[date].transactions.push(transaction);

      const amount = Math.abs(transaction.amount || 0);
      switch (transaction.type) {
        case "income":
          grouped[date].summary.income += amount;
          break;
        case "expense":
          grouped[date].summary.expense += amount;
          break;
        case "transfer":
          grouped[date].summary.transfer += amount;
          break;
        default:
          // Default to expense if type is unknown
          grouped[date].summary.expense += amount;
          break;
      }
    });

    return Object.values(grouped).sort((a, b) => {
      try {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } catch (error) {
        console.warn("Error sorting dates:", error);
        return 0;
      }
    });
  } catch (error) {
    console.error("Error grouping transactions:", error);
    return [];
  }
};

const MobileTransactions: React.FC<MobileTransactionsProps> = ({
  className = "",
}) => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();
  // Set default to current month
  const getCurrentMonthFilter = () => {
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  const [selectedFilter, setSelectedFilter] = useState(getCurrentMonthFilter());
  const [selectedSort, setSelectedSort] = useState("Oldest First");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<
    GroupedTransactions[]
  >([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const colors = isDark
    ? {
        background: "#0B1426",
        card: "#1F2937",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        filterBackground: "#374151",
      }
    : {
        background: "#FFFFFF",
        card: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        filterBackground: "#F3F4F6",
      };

  // Fetch transactions from Supabase
  const fetchTransactionsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on selected filter
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      // Parse the filter (e.g., "Jun 2025" -> June 2025)
      const filterMatch = selectedFilter.match(/(\w+)\s+(\d{4})/);
      if (filterMatch) {
        const monthName = filterMatch[1];
        const year = parseInt(filterMatch[2]);

        // Handle month name parsing more robustly
        const monthNames = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ];
        const monthIndex = monthNames.indexOf(monthName.toLowerCase());

        if (monthIndex !== -1) {
          startDate = new Date(year, monthIndex, 1);
          endDate = new Date(year, monthIndex + 1, 0);
        } else {
          // Fallback to current month if month parsing fails
          startDate.setMonth(now.getMonth());
          startDate.setDate(1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
      } else {
        // Fallback to current month if filter parsing fails
        startDate.setMonth(now.getMonth());
        startDate.setDate(1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      // Fetch transactions for the selected month
      const supabaseTransactions = await fetchTransactions(
        {
          dateRange: { start: startDate, end: endDate },
        },
        isDemo
      );

      // Transform Supabase transactions to component format
      const transformedTransactions = supabaseTransactions.map(
        transformSupabaseTransaction
      );

      // Apply sorting
      let sortedTransactions = [...transformedTransactions];
      switch (selectedSort) {
        case "Newest First":
          sortedTransactions.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          break;
        case "Oldest First":
          sortedTransactions.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          break;
        case "Largest Amount":
          sortedTransactions.sort(
            (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
          );
          break;
        case "Smallest Amount":
          sortedTransactions.sort(
            (a, b) => Math.abs(a.amount) - Math.abs(b.amount)
          );
          break;
        case "Income":
          sortedTransactions = sortedTransactions.filter(
            (t) => t.type === "income"
          );
          break;
        case "Expense":
          sortedTransactions = sortedTransactions.filter(
            (t) => t.type === "expense"
          );
          break;
        case "Transfer":
          sortedTransactions = sortedTransactions.filter(
            (t) => t.type === "transfer"
          );
          break;
        // 'ALL' case - no filtering needed
      }

      setTransactions(sortedTransactions);
      setGroupedTransactions(groupTransactionsByDate(sortedTransactions));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
      setTransactions([]);
      setGroupedTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, selectedSort, isDemo]);

  // Load transactions when component mounts or filters change
  useEffect(() => {
    fetchTransactionsData();
  }, [fetchTransactionsData]);

  // Calculate summary data
  const summaryData = {
    income: transactions
      .filter((t) => t && t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
    expenses: transactions
      .filter((t) => t && t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
    net: transactions
      .filter((t) => t)
      .reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Dropdown Component for sorting
  const Dropdown: React.FC<{
    value: string;
    options: string[];
    onValueChange: (value: string) => void;
    placeholder?: string;
  }> = ({ value, options, onValueChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            {
              backgroundColor: colors.filterBackground,
              borderColor: colors.border,
            },
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
              {
                backgroundColor: colors.filterBackground,
                borderColor: colors.border,
              },
            ]}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  value === option && { backgroundColor: "#F59E0B20" },
                ]}
                onPress={() => {
                  onValueChange(option);
                  setIsOpen(false);
                  console.log("Selected sort option:", option);
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = () => {
    console.log("Opening search modal");
    setIsSearchVisible(true);
  };

  const handleSearchClose = () => {
    console.log("Closing search modal");
    setIsSearchVisible(false);
  };

  const handleSearchSubmit = (searchData: SearchData) => {
    console.log("Search submitted:", searchData);
    Alert.alert(
      "Search Results",
      `Found transactions matching: ${searchData.text}`
    );
  };

  const handleMoreOptions = () => {
    Alert.alert("More Options", "More options menu will be implemented");
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    console.log("Filter changed to:", filter);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    console.log("Sort changed to:", sort);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    // We need to fetch the full transaction data from the service to get complete account information
    fetchTransactionById(transaction.id, isDemo)
      .then((fullTransaction) => {
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
      })
      .catch((error) => {
        console.error("Error fetching transaction for edit:", error);
        Alert.alert("Error", "Failed to load transaction details");
      });
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setEditingTransaction(null);
  };

  const handleTransactionUpdate = () => {
    // Refresh transactions after edit
    fetchTransactionsData();
    handleCloseEditModal();
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!transactionId) {
      Alert.alert("Error", "Invalid transaction ID");
      return;
    }

    try {
      await deleteTransaction(transactionId, isDemo);
      // Refresh transactions after deletion
      fetchTransactionsData();
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (err) {
      console.error("Error deleting transaction:", err);
      Alert.alert("Error", "Failed to delete transaction. Please try again.");
    }
  };

  // Get tag color based on category
  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "needs":
        return { background: "#EF444420", text: "#EF4444" }; // Red for essential needs
      case "wants":
        return { background: "#F59E0B20", text: "#F59E0B" }; // Orange for wants
      case "save":
        return { background: "#10B98120", text: "#10B981" }; // Green for savings
      case "food":
        return { background: "#8B5CF620", text: "#8B5CF6" }; // Purple for food
      case "bills":
        return { background: "#3B82F620", text: "#3B82F6" }; // Blue for bills
      case "entertainment":
        return { background: "#EC489920", text: "#EC4899" }; // Pink for entertainment
      default:
        return { background: "#6B728020", text: "#6B7280" }; // Gray for others
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
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

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading transactions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: "#EF4444" }]}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchTransactionsData}
          >
            <Text style={[styles.retryButtonText, { color: "#10B981" }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Transactions
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSearch} style={styles.headerButton}>
            <Text style={[styles.headerIcon, { color: colors.text }]}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMoreOptions}
            style={styles.headerButton}
          >
            <Text style={[styles.headerIcon, { color: colors.text }]}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View
        style={[
          styles.filtersContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.filtersRow}>
          <DateSelector
            value={selectedFilter}
            onValueChange={handleFilterChange}
            placeholder="Select month"
          />
          <Dropdown
            value={selectedSort}
            options={[
              "Oldest First",
              "Newest First",
              "Largest Amount",
              "Smallest Amount",
              "Transfer",
              "Income",
              "Expense",
              "ALL",
            ]}
            onValueChange={handleSortChange}
            placeholder="Sort by"
          />
        </View>
      </View>

      {/* Summary Cards - Compact 1x3 Layout */}
      <View
        style={[
          styles.summaryContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#10B98115", borderColor: "#10B98130" },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: "#10B981" }]}>
              Income
            </Text>
            <Text style={[styles.summaryAmount, { color: "#10B981" }]}>
              +{formatCurrency(summaryData.income)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#EF444415", borderColor: "#EF444430" },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: "#EF4444" }]}>
              Expenses
            </Text>
            <Text style={[styles.summaryAmount, { color: "#EF4444" }]}>
              -{formatCurrency(summaryData.expenses)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#3B82F615", borderColor: "#3B82F630" },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: "#3B82F6" }]}>Net</Text>
            <Text style={[styles.summaryAmount, { color: "#3B82F6" }]}>
              {formatCurrency(summaryData.net)}
            </Text>
          </View>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {groupedTransactions.length === 0 ? (
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
              No Transactions Found
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions found for the selected period.
            </Text>
          </View>
        ) : (
          groupedTransactions.map((dayGroup) => (
            <View key={dayGroup.id} style={styles.dayGroup}>
              {/* Date Header with Summary */}
              <View style={styles.dateHeader}>
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(dayGroup.date)}
                </Text>
                <View style={styles.dateSummary}>
                  {dayGroup.summary.income > 0 && (
                    <Text style={[styles.summaryText, { color: "#10B981" }]}>
                      ↓+{formatCurrencyCompact(dayGroup.summary.income)}
                    </Text>
                  )}
                  {dayGroup.summary.expense > 0 && (
                    <Text style={[styles.summaryText, { color: "#EF4444" }]}>
                      ↑-{formatCurrencyCompact(dayGroup.summary.expense)}
                    </Text>
                  )}
                  {dayGroup.summary.transfer > 0 && (
                    <Text style={[styles.summaryText, { color: "#3B82F6" }]}>
                      ⇌ {formatCurrencyCompact(dayGroup.summary.transfer)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Transactions */}
              {dayGroup.transactions.map((transaction) => (
                <View
                  key={transaction.id}
                  style={[
                    styles.transactionItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        {
                          backgroundColor: `${getTransactionColor(
                            transaction.type
                          )}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.transactionIconText,
                          { color: getTransactionColor(transaction.type) },
                        ]}
                      >
                        {transaction.icon}
                      </Text>
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text
                        style={[
                          styles.transactionTitle,
                          { color: colors.text },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {transaction.title}
                      </Text>
                      <Text
                        style={[
                          styles.transactionSource,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {transaction.source}
                      </Text>
                      <View style={styles.transactionTags}>
                        {transaction.tags.map((tag, index) => {
                          const tagColors = getTagColor(tag);
                          return (
                            <View
                              key={index}
                              style={[
                                styles.tag,
                                { backgroundColor: tagColors.background },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.tagText,
                                  { color: tagColors.text },
                                ]}
                              >
                                {tag}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      <Text
                        style={[
                          styles.transactionDescription,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {transaction.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: getTransactionColor(transaction.type) },
                      ]}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <View style={styles.transactionActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditTransaction(transaction)}
                      >
                        <Text style={[styles.actionIcon, { color: "#F59E0B" }]}>
                          ✏️
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          Alert.alert(
                            "Delete Transaction",
                            "Are you sure you want to delete this transaction?",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () =>
                                  handleDeleteTransaction(transaction.id),
                              },
                            ]
                          );
                        }}
                      >
                        <Text
                          style={[
                            styles.actionIcon,
                            { color: colors.textSecondary },
                          ]}
                        >
                          🗑️
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Search Modal */}
      <SearchModal
        visible={isSearchVisible}
        onClose={handleSearchClose}
        onSearch={handleSearchSubmit}
      />

      {/* Edit Transaction Modal */}
      {isEditModalVisible && editingTransaction && (
        <QuickAddButton
          editTransaction={editingTransaction}
          isEditMode={true}
          onTransactionUpdate={handleTransactionUpdate}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    marginTop: 20,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
  },
  headerIcon: {
    fontSize: 20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
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
    minHeight: 36,
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
    color: "#F59E0B",
    fontWeight: "bold",
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateSummary: {
    flexDirection: "row",
    gap: 8,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: "500",
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
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionSource: {
    fontSize: 12,
    marginBottom: 4,
  },
  transactionTags: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
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
  transactionDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  transactionActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
});

export default MobileTransactions;
