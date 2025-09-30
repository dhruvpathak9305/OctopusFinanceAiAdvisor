import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";

interface TravelExpense {
  id: string;
  destination: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  icon: string;
  color: string;
  budgetLimit?: number;
  isPlanned?: boolean;
}

interface TravelBudget {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  color: string;
  icon: string;
}

interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  spentAmount: number;
  status: "planning" | "active" | "completed";
  categories: TravelBudget[];
}

const MobileTravel: React.FC = () => {
  const { isDark } = useTheme();
  const { colors } = useTheme();
  const { isDemo } = useDemoMode();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("expenses"); // expenses, budget, planning
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);

  // Enhanced travel expense data with budget limits
  const [travelExpenses, setTravelExpenses] = useState<TravelExpense[]>([
    {
      id: "1",
      destination: "Goa Trip",
      category: "Accommodation",
      amount: 15000,
      date: "Aug 15, 2025",
      description: "Beach resort booking",
      icon: "bed",
      color: "#3B82F6",
      budgetLimit: 20000,
      isPlanned: true,
    },
    {
      id: "2",
      destination: "Mumbai Business",
      category: "Transportation",
      amount: 8500,
      date: "Aug 12, 2025",
      description: "Flight tickets",
      icon: "airplane",
      color: "#8B5CF6",
      budgetLimit: 10000,
      isPlanned: true,
    },
    {
      id: "3",
      destination: "Delhi Conference",
      category: "Food & Dining",
      amount: 3200,
      date: "Aug 10, 2025",
      description: "Restaurant expenses",
      icon: "restaurant",
      color: "#F59E0B",
      budgetLimit: 5000,
      isPlanned: false,
    },
    {
      id: "4",
      destination: "Goa Trip",
      category: "Activities",
      amount: 5600,
      date: "Aug 16, 2025",
      description: "Water sports and tours",
      icon: "boat",
      color: "#10B981",
      budgetLimit: 8000,
      isPlanned: true,
    },
  ]);

  // Travel plans data
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([
    {
      id: "1",
      destination: "Goa Trip",
      startDate: "Aug 15, 2025",
      endDate: "Aug 20, 2025",
      totalBudget: 50000,
      spentAmount: 26200,
      status: "active",
      categories: [
        {
          category: "Accommodation",
          limit: 20000,
          spent: 15000,
          remaining: 5000,
          color: "#3B82F6",
          icon: "bed",
        },
        {
          category: "Transportation",
          limit: 15000,
          spent: 8000,
          remaining: 7000,
          color: "#8B5CF6",
          icon: "airplane",
        },
        {
          category: "Food & Dining",
          limit: 10000,
          spent: 3200,
          remaining: 6800,
          color: "#F59E0B",
          icon: "restaurant",
        },
        {
          category: "Activities",
          limit: 8000,
          spent: 5600,
          remaining: 2400,
          color: "#10B981",
          icon: "boat",
        },
      ],
    },
    {
      id: "2",
      destination: "Mumbai Business",
      startDate: "Aug 12, 2025",
      endDate: "Aug 14, 2025",
      totalBudget: 25000,
      spentAmount: 11700,
      status: "completed",
      categories: [
        {
          category: "Accommodation",
          limit: 12000,
          spent: 12000,
          remaining: 0,
          color: "#3B82F6",
          icon: "bed",
        },
        {
          category: "Transportation",
          limit: 10000,
          spent: 8500,
          remaining: 1500,
          color: "#8B5CF6",
          icon: "airplane",
        },
        {
          category: "Food & Dining",
          limit: 3000,
          spent: 3200,
          remaining: -200,
          color: "#F59E0B",
          icon: "restaurant",
        },
      ],
    },
  ]);

  const filters = [
    "All",
    "Accommodation",
    "Transportation",
    "Food & Dining",
    "Activities",
  ];
  const totalAmount = travelExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const totalBudget = travelExpenses.reduce(
    (sum, expense) => sum + (expense.budgetLimit || 0),
    0
  );
  const remainingBudget = totalBudget - totalAmount;

  // Budget tracking data
  const budgetCategories: TravelBudget[] = [
    {
      category: "Accommodation",
      limit: 32000,
      spent: 27000,
      remaining: 5000,
      color: "#3B82F6",
      icon: "bed",
    },
    {
      category: "Transportation",
      limit: 25000,
      spent: 16500,
      remaining: 8500,
      color: "#8B5CF6",
      icon: "airplane",
    },
    {
      category: "Food & Dining",
      limit: 8000,
      spent: 6400,
      remaining: 1600,
      color: "#F59E0B",
      icon: "restaurant",
    },
    {
      category: "Activities",
      limit: 8000,
      spent: 5600,
      remaining: 2400,
      color: "#10B981",
      icon: "boat",
    },
    {
      category: "Shopping",
      limit: 5000,
      spent: 0,
      remaining: 5000,
      color: "#EC4899",
      icon: "bag",
    },
  ];

  const getBudgetStatusColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage <= 70) return colors.success;
    if (percentage <= 90) return colors.warning;
    return colors.error;
  };

  const getBudgetStatusIcon = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage <= 70) return "checkmark-circle";
    if (percentage <= 90) return "warning";
    return "alert-circle";
  };

  const renderFilterButton = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        {
          backgroundColor:
            selectedFilter === filter ? colors.primary : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: selectedFilter === filter ? "white" : colors.text,
          },
        ]}
      >
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderExpenseItem = ({ item }: { item: TravelExpense }) => (
    <TouchableOpacity
      style={[
        styles.expenseCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[styles.expenseIcon, { backgroundColor: `${item.color}20` }]}
      >
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.expenseDetails}>
        <Text style={[styles.destination, { color: colors.text }]}>
          {item.destination}
        </Text>
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {item.category}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {item.date}
        </Text>
        {item.budgetLimit && (
          <View style={styles.expenseBudgetInfo}>
            <Text style={[styles.budgetText, { color: colors.textSecondary }]}>
              Budget: ₹{item.budgetLimit.toLocaleString("en-IN")}
            </Text>
            <View
              style={[
                styles.budgetStatus,
                {
                  backgroundColor:
                    getBudgetStatusColor(item.amount, item.budgetLimit) + "20",
                },
              ]}
            >
              <Ionicons
                name={getBudgetStatusIcon(item.amount, item.budgetLimit) as any}
                size={12}
                color={getBudgetStatusColor(item.amount, item.budgetLimit)}
              />
            </View>
          </View>
        )}
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: item.color }]}>
          ₹{item.amount.toLocaleString("en-IN")}
        </Text>
        {item.isPlanned && (
          <View
            style={[
              styles.plannedBadge,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.plannedText, { color: colors.primary }]}>
              Planned
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderBudgetCategory = ({ item }: { item: TravelBudget }) => (
    <View
      style={[
        styles.budgetCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.budgetHeader}>
        <View
          style={[styles.budgetIcon, { backgroundColor: `${item.color}20` }]}
        >
          <Ionicons name={item.icon as any} size={20} color={item.color} />
        </View>
        <View style={styles.budgetInfo}>
          <Text style={[styles.budgetCategory, { color: colors.text }]}>
            {item.category}
          </Text>
          <Text style={[styles.budgetAmounts, { color: colors.textSecondary }]}>
            ₹{item.spent.toLocaleString("en-IN")} / ₹
            {item.limit.toLocaleString("en-IN")}
          </Text>
        </View>
        <View
          style={[
            styles.budgetStatus,
            {
              backgroundColor:
                getBudgetStatusColor(item.spent, item.limit) + "20",
            },
          ]}
        >
          <Ionicons
            name={getBudgetStatusIcon(item.spent, item.limit) as any}
            size={16}
            color={getBudgetStatusColor(item.spent, item.limit)}
          />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: getBudgetStatusColor(item.spent, item.limit),
                width: `${Math.min((item.spent / item.limit) * 100, 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {Math.round((item.spent / item.limit) * 100)}%
        </Text>
      </View>

      <View style={styles.budgetFooter}>
        <Text
          style={[
            styles.remainingText,
            {
              color: item.remaining >= 0 ? colors.success : colors.error,
            },
          ]}
        >
          {item.remaining >= 0
            ? "₹" + item.remaining.toLocaleString("en-IN") + " left"
            : "₹" + Math.abs(item.remaining).toLocaleString("en-IN") + " over"}
        </Text>
      </View>
    </View>
  );

  const renderTravelPlan = ({ item }: { item: TravelPlan }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => setSelectedPlan(item)}
    >
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={[styles.planDestination, { color: colors.text }]}>
            {item.destination}
          </Text>
          <Text style={[styles.planDates, { color: colors.textSecondary }]}>
            {item.startDate} - {item.endDate}
          </Text>
        </View>
        <View
          style={[
            styles.planStatus,
            {
              backgroundColor:
                item.status === "completed"
                  ? colors.success + "20"
                  : item.status === "active"
                  ? colors.primary + "20"
                  : colors.warning + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.planStatusText,
              {
                color:
                  item.status === "completed"
                    ? colors.success
                    : item.status === "active"
                    ? colors.primary
                    : colors.warning,
              },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.planBudget}>
        <View style={styles.budgetRow}>
          <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
            Total Budget:
          </Text>
          <Text style={[styles.budgetValue, { color: colors.text }]}>
            ₹{item.totalBudget.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.budgetRow}>
          <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
            Spent:
          </Text>
          <Text style={[styles.budgetValue, { color: colors.primary }]}>
            ₹{item.spentAmount.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.budgetRow}>
          <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
            Remaining:
          </Text>
          <Text
            style={[
              styles.budgetValue,
              {
                color:
                  item.totalBudget - item.spentAmount >= 0
                    ? colors.success
                    : colors.error,
              },
            ]}
          >
            ₹
            {Math.abs(item.totalBudget - item.spentAmount).toLocaleString(
              "en-IN"
            )}
            {item.totalBudget - item.spentAmount >= 0 ? " left" : " over"}
          </Text>
        </View>
      </View>

      {/* Category breakdown */}
      <View style={styles.categoryBreakdown}>
        <Text style={[styles.breakdownTitle, { color: colors.textSecondary }]}>
          Category Breakdown:
        </Text>
        <View style={styles.categoryGrid}>
          {item.categories.slice(0, 3).map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: category.color },
                ]}
              />
              <Text
                style={[styles.categoryName, { color: colors.text }]}
                numberOfLines={1}
              >
                {category.category}
              </Text>
            </View>
          ))}
          {item.categories.length > 3 && (
            <Text
              style={[styles.moreCategories, { color: colors.textSecondary }]}
            >
              +{item.categories.length - 3} more
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "expenses":
        return (
          <>
            {/* Summary Card */}
            <View
              style={[styles.summaryCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Total Travel Spend
                </Text>
                <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                  ₹{totalAmount.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.summaryDetails}>
                <Text
                  style={[
                    styles.summarySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  This month • {travelExpenses.length} expenses
                </Text>
                <View style={styles.budgetSummary}>
                  <Text
                    style={[
                      styles.budgetSummaryText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Budget: ₹{totalBudget.toLocaleString("en-IN")}
                  </Text>
                  <Text
                    style={[
                      styles.budgetSummaryText,
                      {
                        color:
                          remainingBudget >= 0 ? colors.success : colors.error,
                      },
                    ]}
                  >
                    {remainingBudget >= 0
                      ? "₹" + remainingBudget.toLocaleString("en-IN") + " left"
                      : "₹" +
                        Math.abs(remainingBudget).toLocaleString("en-IN") +
                        " over"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filtersContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersScroll}
              >
                {filters.map(renderFilterButton)}
              </ScrollView>
            </View>

            {/* Expenses List */}
            <View style={styles.expensesContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Expenses
              </Text>
              <FlatList
                data={travelExpenses.filter(
                  (expense) =>
                    selectedFilter === "All" ||
                    expense.category === selectedFilter
                )}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </>
        );

      case "budget":
        return (
          <>
            {/* Budget Overview */}
            <View
              style={[styles.summaryCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Travel Budget Overview
                </Text>
                <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                  ₹{totalBudget.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.budgetProgress}>
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: getBudgetStatusColor(
                          totalAmount,
                          totalBudget
                        ),
                        width: `${Math.min(
                          (totalAmount / totalBudget) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, { color: colors.textSecondary }]}
                >
                  {Math.round((totalAmount / totalBudget) * 100)}% of budget
                  used
                </Text>
              </View>
            </View>

            {/* Budget Categories */}
            <View style={styles.budgetContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Budget by Category
              </Text>
              <FlatList
                data={budgetCategories}
                renderItem={renderBudgetCategory}
                keyExtractor={(item) => item.category}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </>
        );

      case "planning":
        return (
          <>
            {/* Planning Overview */}
            <View
              style={[styles.summaryCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Travel Planning
                </Text>
                <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                  {travelPlans.length} trips
                </Text>
              </View>
              <Text
                style={[
                  styles.summarySubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Plan and track your upcoming adventures
              </Text>
            </View>

            {/* Travel Plans */}
            <View style={styles.plansContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your Travel Plans
              </Text>
              <FlatList
                data={travelPlans}
                renderItem={renderTravelPlan}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Travel specific header content if needed */}

      {/* Tab Navigation */}
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "expenses" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("expenses")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "expenses"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "budget" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("budget")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "budget"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Budget
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "planning" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("planning")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "planning"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Planning
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Add Expense Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddExpenseModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Plan Button */}
      <TouchableOpacity
        style={[styles.addPlanButton, { backgroundColor: colors.secondary }]}
        onPress={() => setShowAddPlanModal(true)}
      >
        <Ionicons name="calendar" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "700",
  },
  summaryDetails: {
    marginTop: 8,
  },
  summarySubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  budgetSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetSummaryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  budgetProgress: {
    marginTop: 12,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  expensesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  expenseCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: "center",
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  expenseDetails: {
    flex: 1,
  },
  destination: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    marginBottom: 4,
  },
  expenseBudgetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  budgetText: {
    fontSize: 11,
  },
  budgetStatus: {
    padding: 4,
    borderRadius: 8,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  plannedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  plannedText: {
    fontSize: 10,
    fontWeight: "600",
  },
  budgetContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  budgetAmounts: {
    fontSize: 14,
  },
  budgetFooter: {
    marginTop: 8,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  plansContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  planCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planDestination: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  planDates: {
    fontSize: 14,
  },
  planStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  planStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  planBudget: {
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryBreakdown: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 12,
    maxWidth: 80,
  },
  moreCategories: {
    fontSize: 12,
    fontStyle: "italic",
  },
  addButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addPlanButton: {
    position: "absolute",
    bottom: 100,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default MobileTravel;
