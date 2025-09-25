import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme as useNavTheme } from "@react-navigation/native";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { FinancialRelationshipService } from "../../../../services/financialRelationshipService";
import { LoanManagementService } from "../../../../services/loanManagementService";
import { UserFinancialSummary } from "../../../../types/financial-relationships";

interface FinancialDashboardProps {
  userId: string;
  onCreateLoan?: () => void;
  onRequestPayment?: () => void;
  onViewRelationships?: () => void;
}

interface RecentActivity {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "payment" | "loan" | "split";
  relatedUserId: string;
  relatedUserName?: string;
}

interface UpcomingPayment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  type: "incoming" | "outgoing";
  relatedUserId: string;
  relatedUserName?: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  userId,
  onCreateLoan,
  onRequestPayment,
  onViewRelationships,
}) => {
  const { isDark } = useTheme();
  const navTheme = useNavTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<UserFinancialSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>(
    []
  );
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use the dark theme but with specific adjustments to match the main dashboard
  const colors = {
    ...darkTheme,
    ...navTheme.colors,
    card: "#1F2937", // Darker card background to match the main dashboard
    primary: "#10B981", // Green primary color for buttons and accents
    success: "#10B981", // Green success color
    text: "#FFFFFF", // White text
    textSecondary: "#9CA3AF", // Gray secondary text
    cardHighlight: "#2D3748", // Slightly lighter shade for hover/active states
    border: "#374151", // Border color
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load financial summary
        await loadFinancialSummary();

        // Load recent activity
        await loadRecentActivity();

        // Load upcoming payments
        await loadUpcomingPayments();
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  const loadFinancialSummary = async () => {
    try {
      // Get all relationships
      const relationships =
        await FinancialRelationshipService.getRelationships();

      // Calculate totals
      let totalOwed = 0;
      let totalOwing = 0;

      relationships.forEach((rel) => {
        if (rel.total_amount > 0) {
          totalOwed += rel.total_amount;
        } else {
          totalOwing += Math.abs(rel.total_amount);
        }
      });

      // Get active loans count
      const loans = await LoanManagementService.getLoans({
        role: "lender",
        status: "active",
      });

      // Get unpaid splits count
      const splits = await FinancialRelationshipService.getRelationships();
      let unpaidSplitCount = 0;

      // In a real implementation, we would count actual unpaid splits
      // For now, we'll just use the relationships count as a placeholder
      unpaidSplitCount = relationships.length;

      setSummary({
        totalOwed,
        totalOwing,
        netBalance: totalOwed - totalOwing,
        activeLoanCount: loans.length,
        unpaidSplitCount,
        currency: "INR", // Default currency, could be made dynamic
      });
    } catch (error) {
      console.error("Error loading financial summary:", error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // In a real implementation, we would fetch actual recent activity
      // For now, we'll create some sample data
      const mockActivity: RecentActivity[] = [
        {
          id: "1",
          description: "Payment received",
          amount: 500,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: "payment",
          relatedUserId: "user1",
          relatedUserName: "Dhruv",
        },
        {
          id: "2",
          description: "Loan created",
          amount: 2000,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: "loan",
          relatedUserId: "user2",
          relatedUserName: "Rahul",
        },
        {
          id: "3",
          description: "Split expense",
          amount: 1500,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: "split",
          relatedUserId: "user3",
          relatedUserName: "Priya",
        },
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      console.error("Error loading recent activity:", error);
    }
  };

  const loadUpcomingPayments = async () => {
    try {
      // In a real implementation, we would fetch actual upcoming payments
      // For now, we'll create some sample data
      const mockUpcoming: UpcomingPayment[] = [
        {
          id: "1",
          description: "Loan payment due",
          amount: 2000,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 3,
          type: "incoming",
          relatedUserId: "user2",
          relatedUserName: "Rahul",
        },
        {
          id: "2",
          description: "Split expense payment",
          amount: 800,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 1,
          type: "outgoing",
          relatedUserId: "user4",
          relatedUserName: "Amit",
        },
      ];

      setUpcomingPayments(mockUpcoming);
    } catch (error) {
      console.error("Error loading upcoming payments:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDaysRemaining = (days: number) => {
    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Tomorrow";
    } else {
      return `${days}d remaining`;
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading financial data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: darkTheme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Financial Summary */}
      <View style={[styles.card, { backgroundColor: darkTheme.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          FINANCIAL SUMMARY
        </Text>

        {/* Summary Cards in a Row */}
        <View style={styles.summaryCardsRow}>
          <TouchableOpacity
            style={[
              styles.summaryCard,
              { backgroundColor: colors.cardHighlight },
            ]}
            onPress={() => console.log("View all owed")}
          >
            <View style={styles.summaryCardContent}>
              <Ionicons
                name="arrow-down"
                size={24}
                color={colors.success}
                style={styles.summaryIcon}
              />
              <Text
                style={[
                  styles.summaryCardLabel,
                  { color: colors.textSecondary },
                ]}
              >
                You are owed
              </Text>
              <Text
                style={[styles.summaryCardValue, { color: colors.success }]}
              >
                {formatCurrency(summary?.totalOwed || 0)}
              </Text>
              <Text
                style={[
                  styles.summaryCardSubtext,
                  { color: colors.textSecondary },
                ]}
              >
                From {recentActivity.length || 0} people
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.summaryCard,
              { backgroundColor: colors.cardHighlight },
            ]}
            onPress={() => console.log("View all owing")}
          >
            <View style={styles.summaryCardContent}>
              <Ionicons
                name="arrow-up"
                size={24}
                color="#EF4444"
                style={styles.summaryIcon}
              />
              <Text
                style={[
                  styles.summaryCardLabel,
                  { color: colors.textSecondary },
                ]}
              >
                You owe
              </Text>
              <Text style={[styles.summaryCardValue, { color: "#EF4444" }]}>
                {formatCurrency(summary?.totalOwing || 0)}
              </Text>
              <Text
                style={[
                  styles.summaryCardSubtext,
                  { color: colors.textSecondary },
                ]}
              >
                To {upcomingPayments.length || 0} people
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Net Balance with Animation */}
        <View
          style={[
            styles.netBalanceContainer,
            {
              backgroundColor: colors.cardHighlight,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.netBalanceContent}>
            <Text style={[styles.netBalanceLabel, { color: colors.text }]}>
              NET BALANCE
            </Text>
            <Text
              style={[
                styles.netBalanceValue,
                {
                  color:
                    (summary?.netBalance || 0) > 0
                      ? colors.success
                      : (summary?.netBalance || 0) < 0
                      ? "#EF4444"
                      : colors.text,
                },
              ]}
            >
              {formatCurrency(summary?.netBalance || 0)}
            </Text>
          </View>

          <View style={styles.balanceIndicatorContainer}>
            <View
              style={[
                styles.balanceIndicatorBar,
                { backgroundColor: "#374151" },
              ]}
            >
              <View
                style={[
                  styles.balanceIndicatorFill,
                  {
                    backgroundColor:
                      (summary?.netBalance || 0) >= 0
                        ? colors.success
                        : "#EF4444",
                    width: `${Math.min(
                      Math.abs((summary?.netBalance || 0) / 5000) * 100,
                      100
                    )}%`,
                    alignSelf:
                      (summary?.netBalance || 0) >= 0
                        ? "flex-start"
                        : "flex-end",
                  },
                ]}
              />
            </View>
            <View style={styles.balanceLabelsContainer}>
              <Text
                style={[
                  styles.balanceIndicatorLabel,
                  { color: colors.textSecondary },
                ]}
              >
                You owe others
              </Text>
              <Text
                style={[
                  styles.balanceIndicatorLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Others owe you
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.card, { backgroundColor: darkTheme.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          QUICK ACTIONS
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10B981" }]}
            onPress={onCreateLoan}
          >
            <Ionicons name="cash-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Create Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10B981" }]}
            onPress={onRequestPayment}
          >
            <Ionicons name="arrow-down-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Request Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10B981" }]}
            onPress={onViewRelationships}
          >
            <Ionicons name="people-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={[styles.card, { backgroundColor: darkTheme.card }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            RECENT ACTIVITY
          </Text>
          <TouchableOpacity
            onPress={() => setShowAllActivity(!showAllActivity)}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              {showAllActivity ? "Show Less" : "View All"}
            </Text>
          </TouchableOpacity>
        </View>

        {recentActivity.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No recent activity
          </Text>
        ) : (
          <>
            {(showAllActivity
              ? recentActivity
              : recentActivity.slice(0, 3)
            ).map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityItem,
                  { backgroundColor: colors.cardHighlight },
                ]}
                onPress={() =>
                  console.log(`View activity details: ${activity.id}`)
                }
              >
                <View
                  style={[
                    styles.activityIconContainer,
                    {
                      backgroundColor:
                        activity.type === "payment"
                          ? "rgba(16,185,129,0.2)"
                          : activity.type === "loan"
                          ? "rgba(239,68,68,0.2)"
                          : "rgba(59,130,246,0.2)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      activity.type === "payment"
                        ? "cash-outline"
                        : activity.type === "loan"
                        ? "wallet-outline"
                        : "people-outline"
                    }
                    size={24}
                    color={
                      activity.type === "payment"
                        ? "#10B981"
                        : activity.type === "loan"
                        ? "#EF4444"
                        : "#3B82F6"
                    }
                  />
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text
                      style={[
                        styles.activityDescription,
                        { color: colors.text },
                      ]}
                    >
                      {activity.type === "payment"
                        ? `${activity.relatedUserName} paid you`
                        : activity.type === "loan"
                        ? `You loaned to ${activity.relatedUserName}`
                        : `Split with ${activity.relatedUserName}`}
                    </Text>
                    <Text
                      style={[
                        styles.activityAmount,
                        {
                          color:
                            activity.type === "loan"
                              ? "#EF4444"
                              : colors.success,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {formatCurrency(activity.amount)}
                    </Text>
                  </View>
                  <View style={styles.activitySubheader}>
                    <Text
                      style={[
                        styles.activityDate,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatDate(activity.date)}
                    </Text>
                    <TouchableOpacity>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {!showAllActivity && recentActivity.length > 3 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllActivity(true)}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  Show {recentActivity.length - 3} More
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Upcoming */}
      <View style={[styles.card, { backgroundColor: darkTheme.card }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            UPCOMING
          </Text>
          <TouchableOpacity
            onPress={() => setShowAllUpcoming(!showAllUpcoming)}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              {showAllUpcoming ? "Show Less" : "View All"}
            </Text>
          </TouchableOpacity>
        </View>

        {upcomingPayments.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No upcoming payments
          </Text>
        ) : (
          <>
            {(showAllUpcoming
              ? upcomingPayments
              : upcomingPayments.slice(0, 2)
            ).map((payment) => (
              <TouchableOpacity
                key={payment.id}
                style={[
                  styles.upcomingItem,
                  { backgroundColor: colors.cardHighlight },
                ]}
                onPress={() =>
                  console.log(`View payment details: ${payment.id}`)
                }
              >
                <View
                  style={[
                    styles.upcomingIconContainer,
                    {
                      backgroundColor:
                        payment.type === "incoming"
                          ? "rgba(16,185,129,0.2)"
                          : "rgba(239,68,68,0.2)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      payment.type === "incoming"
                        ? "arrow-down-outline"
                        : "arrow-up-outline"
                    }
                    size={24}
                    color={payment.type === "incoming" ? "#10B981" : "#EF4444"}
                  />
                </View>

                <View style={styles.upcomingContent}>
                  <View style={styles.upcomingHeader}>
                    <View>
                      <Text
                        style={[styles.upcomingTitle, { color: colors.text }]}
                      >
                        {payment.type === "incoming"
                          ? `${payment.relatedUserName}'s payment due`
                          : `Your payment to ${payment.relatedUserName}`}
                      </Text>
                      <Text
                        style={[
                          styles.upcomingDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {payment.description}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.upcomingAmount,
                        {
                          color:
                            payment.type === "incoming" ? "#10B981" : "#EF4444",
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {formatCurrency(payment.amount)}
                    </Text>
                  </View>

                  <View style={styles.upcomingFooter}>
                    <View style={styles.upcomingDateContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={
                          payment.daysRemaining <= 1
                            ? "#EF4444"
                            : colors.textSecondary
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.upcomingDate,
                          {
                            color:
                              payment.daysRemaining <= 1
                                ? "#EF4444"
                                : colors.textSecondary,
                            fontWeight:
                              payment.daysRemaining <= 1 ? "600" : "400",
                          },
                        ]}
                      >
                        {formatDaysRemaining(payment.daysRemaining)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.upcomingActionButton,
                        {
                          backgroundColor:
                            payment.type === "incoming" ? "#10B981" : "#3B82F6",
                        },
                      ]}
                      onPress={() =>
                        console.log(`Action for payment ${payment.id}`)
                      }
                    >
                      <Text style={styles.upcomingActionText}>
                        {payment.type === "incoming"
                          ? "Record Payment"
                          : "Make Payment"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {!showAllUpcoming && upcomingPayments.length > 2 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllUpcoming(true)}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  Show {upcomingPayments.length - 2} More
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Financial Summary Section
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  summaryCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "48%",
    borderRadius: 10,
    padding: 12,
    elevation: 1,
  },
  summaryCardContent: {
    alignItems: "flex-start",
  },
  summaryIcon: {
    marginBottom: 8,
  },
  summaryCardLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryCardSubtext: {
    fontSize: 11,
  },
  netBalanceContainer: {
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
  },
  netBalanceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  netBalanceLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  netBalanceValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  balanceIndicatorContainer: {
    width: "100%",
  },
  balanceIndicatorBar: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    marginBottom: 8,
  },
  balanceIndicatorFill: {
    height: 6,
    borderRadius: 3,
  },
  balanceLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceIndicatorLabel: {
    fontSize: 11,
  },

  // Quick Actions
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },

  // Recent Activity
  activityItem: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activitySubheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityDate: {
    fontSize: 12,
    marginTop: 2,
  },

  // Upcoming Payments
  upcomingItem: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  upcomingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    alignSelf: "flex-start",
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  upcomingDescription: {
    fontSize: 12,
  },
  upcomingAmount: {
    fontSize: 16,
  },
  upcomingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upcomingDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  upcomingDate: {
    fontSize: 12,
  },
  upcomingActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  upcomingActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },

  // Show More Button
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 14,
    marginRight: 4,
    fontWeight: "500",
  },

  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 14,
  },
});

export default FinancialDashboard;
