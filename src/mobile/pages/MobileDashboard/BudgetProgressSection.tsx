import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  InteractionManager,
} from "react-native";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { budgetCategoryService } from "../../../../services/budgetCategoryService";
import {
  getBudgetProgress,
  type BudgetProgressItem,
} from "../../../../services/budgetProgressService";
import { BudgetCategory } from "../../../../types/budget";
import { renderIconFromName } from "../../../../utils/subcategoryIcons";
import BudgetCategoryDetailModal from "../../components/BudgetCategoryDetailModal";
import { useUnifiedAuth } from "../../../../contexts/UnifiedAuthContext";
import CircularProgress from "../../components/common/CircularProgress";
import { balanceEventEmitter } from "../../../../utils/balanceEventEmitter";

// Mock data for budget categories
const mockBudgetData = {
  expense: [
    {
      name: "Needs",
      percentage: 60,
      color: "#10B981",
      amount: 1800,
      limit: 3000,
      icon: "home",
    },
    {
      name: "Wants",
      percentage: 30,
      color: "#F59E0B",
      amount: 900,
      limit: 3000,
      icon: "heart",
    },
    {
      name: "Save",
      percentage: 10,
      color: "#3B82F6",
      amount: 300,
      limit: 3000,
      icon: "piggy-bank",
    },
  ],
  income: [
    {
      name: "Side Income",
      percentage: 25,
      color: "#F59E0B",
      amount: 500,
      limit: 2000,
      icon: "carrot",
    },
    {
      name: "Earned Income",
      percentage: 80,
      color: "#3B82F6",
      amount: 4000,
      limit: 5000,
      icon: "briefcase",
    },
    {
      name: "Passive Income",
      percentage: 15,
      color: "#8B5CF6",
      amount: 300,
      limit: 2000,
      icon: "chart-line",
    },
    {
      name: "Government & Benefits",
      percentage: 0,
      color: "#06B6D4",
      amount: 0,
      limit: 1000,
      icon: "building",
    },
    {
      name: "Windfall Income",
      percentage: 0,
      color: "#10B981",
      amount: 0,
      limit: 500,
      icon: "gift",
    },
    {
      name: "Reimbursements",
      percentage: 0,
      color: "#3B82F6",
      amount: 0,
      limit: 300,
      icon: "receipt",
    },
  ],
  all: [
    // Expense categories
    {
      name: "Needs",
      percentage: 60,
      color: "#10B981",
      amount: 1800,
      limit: 3000,
      icon: "home",
      type: "expense",
    },
    {
      name: "Wants",
      percentage: 30,
      color: "#F59E0B",
      amount: 900,
      limit: 3000,
      icon: "heart",
      type: "expense",
    },
    {
      name: "Save",
      percentage: 10,
      color: "#3B82F6",
      amount: 300,
      limit: 3000,
      icon: "piggy-bank",
      type: "expense",
    },
    // Income categories
    {
      name: "Side Income",
      percentage: 25,
      color: "#F59E0B",
      amount: 500,
      limit: 2000,
      icon: "carrot",
      type: "income",
    },
    {
      name: "Earned Income",
      percentage: 80,
      color: "#3B82F6",
      amount: 4000,
      limit: 5000,
      icon: "briefcase",
      type: "income",
    },
    {
      name: "Passive Income",
      percentage: 15,
      color: "#8B5CF6",
      amount: 300,
      limit: 2000,
      icon: "chart-line",
      type: "income",
    },
    {
      name: "Government & Benefits",
      percentage: 0,
      color: "#06B6D4",
      amount: 0,
      limit: 1000,
      icon: "building",
      type: "income",
    },
    {
      name: "Windfall Income",
      percentage: 0,
      color: "#10B981",
      amount: 0,
      limit: 500,
      icon: "gift",
      type: "income",
    },
    {
      name: "Reimbursements",
      percentage: 0,
      color: "#3B82F6",
      amount: 0,
      limit: 300,
      icon: "receipt",
      type: "income",
    },
  ],
};

type TimePeriod = "monthly" | "quarterly" | "yearly";
type BudgetType = "expense" | "income" | "all";

interface BudgetProgressSectionProps {
  className?: string;
}

// Note: Using proper SVG-based CircularProgress component from common/CircularProgress

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

const BudgetProgressSection: React.FC<BudgetProgressSectionProps> = ({
  className = "",
}) => {
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();
  const { user } = useUnifiedAuth();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
  const [typeFilter, setTypeFilter] = useState<BudgetType>("expense");
  const [activeBudgetSubcategory, setActiveBudgetSubcategory] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [realCategories, setRealCategories] = useState<BudgetCategory[]>([]);
  const [budgetProgressData, setBudgetProgressData] = useState<
    BudgetProgressItem[]
  >([]);

  const colors = isDark
    ? {
        background: "#1F2937",
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleSubcategories = (index: number) => {
    setActiveBudgetSubcategory(
      activeBudgetSubcategory === index ? null : index
    );
  };

  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period as TimePeriod);
    setActiveBudgetSubcategory(null);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type as BudgetType);
    setActiveBudgetSubcategory(null);
  };

  // Fetch real budget progress data
  const fetchBudgetProgressData = useCallback(async () => {
    if (!user?.id || isDemo) {
      setLoading(false);
      return;
    }

    try {
      // Only set loading if we don't already have data to avoid UI flashing
      if (budgetProgressData.length === 0) {
        setLoading(true);
      }

      // Use a local variable to store the new data
      let newData;

      if (typeFilter === "all") {
        // Fetch both expense and income categories
        const [expenseData, incomeData] = await Promise.all([
          getBudgetProgress(user.id, "expense", timePeriod),
          getBudgetProgress(user.id, "income", timePeriod),
        ]);

        newData = [...expenseData, ...incomeData];
      } else {
        // Fetch specific type
        newData = await getBudgetProgress(
          user.id,
          typeFilter as any,
          timePeriod
        );
      }

      // Performance optimization: avoid unnecessary state updates and deep comparisons
      // Only update if we have data and it's different from current data
      if (newData && newData.length > 0) {
        setBudgetProgressData((prevData) => {
          // Simple length check first (faster)
          if (prevData.length !== newData.length) {
            return newData;
          }

          // Check if any key data points have changed
          const hasChanges = newData.some((item, index) => {
            if (index >= prevData.length) return true;
            return (
              item.spent_amount !== prevData[index].spent_amount ||
              item.budget_limit !== prevData[index].budget_limit ||
              item.category_id !== prevData[index].category_id
            );
          });

          return hasChanges ? newData : prevData;
        });
      }
    } catch (error) {
      console.error("Error fetching budget progress data:", error);
      // Only clear data if there was an actual error
      setBudgetProgressData((prevData) =>
        prevData.length > 0 ? prevData : []
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, isDemo, typeFilter, timePeriod]);

  // Manual refresh function (can be called from other components)
  const refreshBudgetData = useCallback(() => {
    fetchBudgetProgressData();
  }, [fetchBudgetProgressData]);

  // Fetch data when filters change or component mounts
  useEffect(() => {
    if (user?.id && !isDemo) {
      fetchBudgetProgressData();
    }
  }, [timePeriod, typeFilter]);

  // Reference for debounce timeout and refresh state tracking
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRefreshPending, setIsRefreshPending] = useState(false);

  // Listen for transaction events and perform periodic refresh
  useEffect(() => {
    if (!isDemo && user?.id) {
      // Highly optimized debounced fetch function to prevent UI freezing
      const debouncedFetch = () => {
        // Cancel any pending refresh
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // Set a flag to indicate refresh is pending, but don't trigger re-renders
        // if we're already in a pending state
        if (!isRefreshPending) {
          setIsRefreshPending(true);
        }

        // Use a much longer delay to ensure UI remains responsive after transaction updates
        // This is critical to prevent freezing when alerts are shown
        debounceRef.current = setTimeout(() => {
          // Use requestAnimationFrame to queue the refresh for the next frame
          // This helps ensure the UI thread is free before we start fetching data
          requestAnimationFrame(() => {
            // Then use InteractionManager to ensure all animations and UI work is complete
            InteractionManager.runAfterInteractions(() => {
              // Finally, perform the fetch in a try-catch to prevent any uncaught errors
              try {
                fetchBudgetProgressData()
                  .catch(() => {
                    // Silently handle errors to prevent UI disruption
                    // Data will be stale but UI will remain responsive
                  })
                  .finally(() => {
                    // Clear the pending flag after a short delay to prevent rapid re-renders
                    setTimeout(() => {
                      setIsRefreshPending(false);
                    }, 100);
                  });
              } catch (err) {
                // Ensure we always clear the pending flag even if something unexpected happens
                setTimeout(() => {
                  setIsRefreshPending(false);
                }, 100);
              }
            });
          });
        }, 2000); // Much longer delay (2 seconds) to ensure UI remains responsive after transaction updates
      };

      // Optimized event handler with intelligent filtering
      const handleTransactionEvent = (event: {
        type: string;
        transactionId?: string;
        timestamp?: number;
      }) => {
        // Only handle relevant events and avoid processing too many events in succession
        if (event.type.includes("transaction") || event.type.includes("bulk")) {
          // Use the debounced fetch to prevent UI freezing
          debouncedFetch();
        }
      };

      // Subscribe to balance events (which include transaction events)
      const unsubscribe = balanceEventEmitter.subscribe(handleTransactionEvent);

      // Set up a more intelligent fallback refresh with even longer interval
      // This is just a safety mechanism in case event-based updates fail
      const interval = setInterval(() => {
        // Only trigger periodic refresh if no refresh is pending and app is active
        if (!isRefreshPending) {
          // Use a separate timeout to avoid blocking the interval callback
          setTimeout(() => {
            debouncedFetch();
          }, 0);
        }
      }, 180000); // Increased to 3 minutes to further reduce update frequency and prevent UI issues

      // Enhanced cleanup function to prevent memory leaks and ensure proper state reset
      return () => {
        // Clear any pending timeouts with proper null check
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }

        // Clear all other potential timeouts that might be pending
        const timeoutIds = [];
        for (let i = 0; i < 10; i++) {
          timeoutIds.push(setTimeout(() => {}, 0));
        }
        timeoutIds.forEach(clearTimeout);

        // Always set refresh state to false on cleanup
        setIsRefreshPending(false);

        // Unsubscribe from events and clear intervals
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, [user?.id, isDemo]);

  // Map database icon names to Lucide React icon names
  const mapIconNameToLucide = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      // Expense icons
      home: "Home",
      heart: "Heart",
      "piggy-bank": "PiggyBank",
      wallet: "Wallet",

      // Income icons
      briefcase: "Briefcase",
      "trending-up": "TrendingUp",
      building: "Building",
      gift: "Gift",
      receipt: "Receipt",
      "dollar-sign": "DollarSign",

      // Fallback
      circle: "Circle",
    };

    return iconMap[iconName] || "Circle";
  };

  const renderCategoryIcon = (
    iconName: string,
    color: string,
    categoryName?: string
  ) => {
    // If no icon from database, use category name to determine icon
    let finalIconName = iconName;
    if (!iconName || iconName === "circle") {
      if (categoryName?.toLowerCase().includes("need")) finalIconName = "home";
      else if (categoryName?.toLowerCase().includes("want"))
        finalIconName = "heart";
      else if (categoryName?.toLowerCase().includes("save"))
        finalIconName = "piggy-bank";
      else finalIconName = "circle";
    }

    const lucideIconName = mapIconNameToLucide(finalIconName);

    try {
      return renderIconFromName(lucideIconName, 18, color);
    } catch (error) {
      console.warn("Icon rendering failed for:", finalIconName, error);
      // Fallback to emoji icons
      return (
        <Text style={{ fontSize: 22, color }}>
          {finalIconName === "home"
            ? "🏠"
            : finalIconName === "heart"
            ? "❤️"
            : finalIconName === "piggy-bank"
            ? "🐷"
            : "💰"}
        </Text>
      );
    }
  };

  // Fetch real budget categories
  const fetchBudgetCategories = useCallback(async () => {
    try {
      // Only set loading true if we don't already have data
      if (realCategories.length === 0) {
        setLoading(true);
      }
      const categories = await budgetCategoryService.fetchCategories(isDemo);
      setRealCategories(categories);
    } catch (error) {
      console.error("Error fetching budget categories:", error);
      // Use a non-blocking notification instead of blocking Alert
      console.warn("Failed to load budget categories");
    } finally {
      setLoading(false);
    }
  }, [isDemo, realCategories.length]);

  useEffect(() => {
    fetchBudgetCategories();
  }, [isDemo, fetchBudgetCategories]);

  const getCurrentCategories = () => {
    if (isDemo) {
      return mockBudgetData[typeFilter] || [];
    }

    // Use real budget progress data with correct calculations
    const mappedData = budgetProgressData.map((category) => {
      const calculatedPercentage =
        category.budget_limit > 0
          ? Math.round((category.spent_amount / category.budget_limit) * 100)
          : 0;

      const mappedCategory = {
        name: category.category_name,
        percentage: calculatedPercentage, // Use our calculated percentage for accuracy
        color: category.ring_color || "#10B981",
        amount: category.spent_amount,
        limit: category.budget_limit,
        remaining: category.remaining_amount,
        icon: category.icon || "circle", // Keep original icon name for debugging
        id: category.category_id,
        category_type: category.category_type,
        status: category.status,
      };

      return mappedCategory;
    });

    return mappedData;
  };

  const getIconForCategory = (
    categoryName: string,
    categoryType?: string
  ): string => {
    const iconMap: { [key: string]: string } = {
      // Expense categories
      needs: "home",
      wants: "heart",
      save: "piggy-bank",
      savings: "piggy-bank",
      housing: "home",
      food: "restaurant",
      transportation: "car",
      entertainment: "game-controller",
      utilities: "flash",
      healthcare: "medical",
      insurance: "shield",

      // Income categories
      "earned income": "briefcase",
      "side income": "trending-up",
      "passive income": "trending-up",
      "government & benefits": "building",
      "windfall income": "gift",
      reimbursements: "receipt",
      salary: "briefcase",
      freelance: "trending-up",
      investment: "trending-up",
      dividend: "trending-up",
      bonus: "gift",
      refund: "receipt",
    };

    const key = categoryName.toLowerCase();
    const mappedIcon = iconMap[key];

    if (mappedIcon) {
      return mappedIcon;
    }

    // Fallback based on category type
    if (categoryType === "income") {
      return "dollar-sign";
    } else if (categoryType === "expense") {
      return "wallet";
    }

    return "circle";
  };

  const handleCategoryPress = (category: any) => {
    if (isDemo) {
      // Convert the category to match the expected format for the modal
      const categoryForModal = {
        id: category.name.toLowerCase().replace(/ /g, "-"),
        user_id: "user-1",
        name: category.name,
        budget_limit: category.limit,
        ring_color: category.color,
        bg_color: category.color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: null,
        description: null,
        status: "active",
        start_date: new Date().toISOString(),
        frequency: "monthly",
        strategy: "zero-based",
        is_active: "true",
        percentage: category.percentage,
        category_type: typeFilter === "expense" ? "expense" : "income",
      };

      setSelectedCategory(categoryForModal);
    } else {
      // Use budget progress data to create category for modal
      const categoryForModal = {
        id: category.id,
        user_id: user?.id || "current-user",
        name: category.name,
        budget_limit: category.limit,
        ring_color: category.color,
        bg_color: category.color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: null,
        description: null,
        status: category.status || "not_set",
        start_date: new Date().toISOString(),
        frequency: "monthly",
        strategy: "zero-based",
        is_active: "true",
        percentage: category.percentage,
        category_type: category.category_type || "expense",
        icon: category.icon,
        subcategories: [], // Will be fetched by the modal itself
        spent: category.amount,
        remaining: (category as any).remaining,
      };

      setSelectedCategory(categoryForModal);
    }

    setShowDetailModal(true);
  };

  if (loading && budgetProgressData.length === 0) {
    // Use a default height for loading state (assuming 2 rows for most cases)
    const defaultLoadingHeight = 80 + 2 * 172; // base + 2 rows

    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: colors.background,
            minHeight: defaultLoadingHeight,
          },
        ]}
      >
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading budget data...
        </Text>
      </View>
    );
  }

  const currentCategories = getCurrentCategories();

  // Calculate dynamic container height based on number of cards
  const calculateContainerHeight = () => {
    const numberOfCards = currentCategories.length;
    const cardsPerRow = 3;
    const numberOfRows = Math.ceil(numberOfCards / cardsPerRow);

    // Base height includes header (60px) + margins
    const baseHeight = 80;
    // Each row takes approximately 160px (card height) + 12px gap
    const rowHeight = 172;

    return baseHeight + numberOfRows * rowHeight;
  };

  const dynamicContainerStyle = {
    ...styles.container,
    minHeight: calculateContainerHeight(),
  };

  return (
    <View style={dynamicContainerStyle}>
      {/* Header with Filters */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Budget Progress
        </Text>
        <View style={styles.filters}>
          {/* Type Filter */}
          <Dropdown
            value={typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
            options={["Expense", "Income", "All"]}
            onValueChange={(value) =>
              handleTypeFilterChange(value.toLowerCase())
            }
            placeholder="Type"
          />

          {/* Time Period Filter */}
          <Dropdown
            value={timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
            options={["Monthly", "Quarterly", "Yearly"]}
            onValueChange={(value) =>
              handleTimePeriodChange(value.toLowerCase())
            }
            placeholder="Period"
          />
        </View>
      </View>

      {/* Budget Categories Grid */}
      <View style={styles.categoriesGrid}>
        {currentCategories.map((category, index) => (
          <TouchableOpacity
            key={`${category.name}-${index}`}
            style={[
              styles.categoryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            {/* Category Icon */}
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: `${category.color}20` },
              ]}
            >
              {renderCategoryIcon(category.icon, category.color, category.name)}
            </View>

            {/* Category Name */}
            <Text
              style={[styles.categoryName, { color: colors.text }]}
              numberOfLines={2}
            >
              {category.name}
            </Text>

            {/* Circular Progress with Smart Color and Over-Budget Handling */}
            <View style={styles.progressContainer}>
              <CircularProgress
                percentage={Math.min(category.percentage || 0, 100)} // Cap at 100% for visual
                size={65}
                strokeWidth={5}
                backgroundColor={colors.border + "30"}
                showPercentage={false} // We'll show our own percentage overlay
                color={
                  (category.percentage || 0) > 100
                    ? "#EF4444" // Bright red for over budget (>100%)
                    : (category.percentage || 0) > 90
                    ? "#F59E0B" // Orange for very close to limit (90-100%)
                    : (category.percentage || 0) > 75
                    ? "#FBBF24" // Yellow for approaching limit (75-90%)
                    : category.color // Original color for safe range (<75%)
                }
              />
              {/* Percentage Text Overlay */}
              <View style={styles.progressTextOverlay}>
                <Text
                  style={[
                    styles.progressPercentageText,
                    {
                      color:
                        (category.percentage || 0) > 100
                          ? "#EF4444"
                          : colors.text,
                      fontWeight:
                        (category.percentage || 0) > 100 ? "800" : "600",
                    },
                  ]}
                >
                  {category.percentage || 0}%
                </Text>
                {/* Over Budget Indicator */}
                {(category.percentage || 0) > 100 && (
                  <Text style={styles.overBudgetIndicator}>!</Text>
                )}
              </View>
            </View>

            {/* Amount Info */}
            <Text
              style={[styles.categoryAmount, { color: colors.textSecondary }]}
            >
              {formatCurrency(category.amount || 0)} /{" "}
              {formatCurrency(category.limit || 0)}
            </Text>
            {/* Remaining Amount */}
            {!isDemo && (category as any).remaining !== undefined && (
              <Text
                style={[
                  styles.remainingAmount,
                  {
                    color:
                      (category as any).remaining > 0 ? "#10B981" : "#EF4444",
                  },
                ]}
              >
                {formatCurrency((category as any).remaining)} left
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Budget Category Detail Modal */}
      <BudgetCategoryDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        category={selectedCategory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24, // Add spacing between Budget Progress and Recent Transactions
    width: "100%", // Ensure full width
    flex: 0, // Prevent container from growing or shrinking
    // minHeight is now calculated dynamically
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    // minHeight is now set dynamically inline
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%", // Ensure full width
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1, // Allow title to take available space
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 0, // Prevent shrinking
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
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    width: "100%", // Ensure full width
  },
  categoryCard: {
    width: "30%",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 160, // Reduced height to make cards shorter
    // Removed maxHeight constraint to allow content to fit properly
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryIconText: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 16,
  },
  categoryAmount: {
    fontSize: 10,
    marginTop: 6,
    textAlign: "center",
  },
  remainingAmount: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "600",
    paddingBottom: 4, // Add padding to ensure text is not cut off
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8, // Reduced vertical margin
    height: 64, // Fixed height to avoid layout shifts (reduced for shorter cards)
  },
  progressTextOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  progressPercentageText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  overBudgetIndicator: {
    fontSize: 8,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: -2,
  },
  // Note: CircularProgress styles removed - using SVG-based component now
  subcategoryCard: {
    marginTop: 16,
    padding: 16,
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
  subcategoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subcategoryTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  subcategoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  subcategoryTitleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  subcategoryContent: {
    paddingTop: 8,
  },
  subcategoryText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default BudgetProgressSection;
