import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, darkTheme } from "../../../../contexts/ThemeContext";
import { useTheme as useNavTheme } from "@react-navigation/native";
import { FinancialRelationshipService } from "../../../../services/financialRelationshipService";
import { LoanManagementService } from "../../../../services/loanManagementService";
import {
  Loan,
  LoanStatus,
  FinancialRelationship,
} from "../../../../types/financial-relationships";

interface LoanSummaryTabProps {
  userId: string;
  onViewLoanDetails?: (loanId: string) => void;
}

interface LoanSummary {
  totalLent: number;
  totalBorrowed: number;
  activeLoanCount: number;
  activeBorrowCount: number;
  totalPendingPayments: number;
  nextPaymentDate: string | null;
  overdueLoanCount: number;
}

const LoanSummaryTab: React.FC<LoanSummaryTabProps> = ({
  userId,
  onViewLoanDetails,
}) => {
  const { isDark } = useTheme();
  const navTheme = useNavTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lent" | "borrowed" | "upcoming">(
    "lent"
  );
  const [summary, setSummary] = useState<LoanSummary>({
    totalLent: 0,
    totalBorrowed: 0,
    activeLoanCount: 0,
    activeBorrowCount: 0,
    totalPendingPayments: 0,
    nextPaymentDate: null,
    overdueLoanCount: 0,
  });
  const [lentLoans, setLentLoans] = useState<Loan[]>([]);
  const [borrowedLoans, setBorrowedLoans] = useState<Loan[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);

  // Always use the dark theme to match the main dashboard
  const colors = {
    ...darkTheme,
    ...navTheme.colors,
    card: "#1F2937",
    primary: "#10B981",
    success: "#10B981",
    text: "#FFFFFF",
    textSecondary: "#9CA3AF",
  };

  useEffect(() => {
    loadSummaryData();
  }, []);

  const loadSummaryData = async () => {
    try {
      setLoading(true);

      // Using mock data since we're just demonstrating the UI

      // Mock lent loans
      const mockLentLoans = [
        {
          id: "loan1",
          amount: 5000,
          remaining_amount: 3000,
          description: "Home Renovation Loan",
          borrower_id: "user2",
          borrower_name: "Rahul Kumar",
          lender_id: userId,
          status: "active",
          interest_rate: 5.0,
          created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          next_payment_date: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          due_date: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payment_frequency: "monthly",
        },
        {
          id: "loan2",
          amount: 2000,
          remaining_amount: 2000,
          description: "Emergency Fund",
          borrower_id: "user3",
          borrower_name: "Priya Sharma",
          lender_id: userId,
          status: "active",
          interest_rate: 0,
          created_at: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          next_payment_date: new Date(
            Date.now() + 20 * 24 * 60 * 60 * 1000
          ).toISOString(),
          due_date: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payment_frequency: "one-time",
        },
        {
          id: "loan3",
          amount: 1500,
          remaining_amount: 0,
          description: "Weekend Trip",
          borrower_id: "user4",
          borrower_name: "Vikram Singh",
          lender_id: userId,
          status: "completed",
          interest_rate: 0,
          created_at: new Date(
            Date.now() - 45 * 24 * 60 * 60 * 1000
          ).toISOString(),
          next_payment_date: null,
          due_date: new Date(
            Date.now() - 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payment_frequency: "one-time",
        },
        {
          id: "loan4",
          amount: 8000,
          remaining_amount: 8000,
          description: "Business Investment",
          borrower_id: "user5",
          borrower_name: "Amit Patel",
          lender_id: userId,
          status: "active",
          interest_rate: 7.5,
          created_at: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          next_payment_date: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          due_date: new Date(
            Date.now() + 180 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payment_frequency: "monthly",
        },
      ];

      // Mock borrowed loans
      const mockBorrowedLoans = [
        {
          id: "loan5",
          amount: 10000,
          remaining_amount: 7500,
          description: "Education Loan",
          borrower_id: userId,
          borrower_name: "You",
          lender_id: "user6",
          lender_name: "Neha Gupta",
          status: "active",
          interest_rate: 4.0,
          created_at: new Date(
            Date.now() - 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
          next_payment_date: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          due_date: new Date(
            Date.now() + 270 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payment_frequency: "monthly",
        },
        {
          id: "loan6",
          amount: 3000,
          remaining_amount: 3000,
          description: "New Laptop",
          borrower_id: userId,
          borrower_name: "You",
          lender_id: "user7",
          lender_name: "Karan Malhotra",
          status: "active",
          interest_rate: 0,
          created_at: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          next_payment_date: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          due_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payment_frequency: "one-time",
        },
      ];

      // Mock upcoming payments
      const mockUpcomingPayments = [
        {
          id: "payment1",
          loan_id: "loan5",
          amount: 833.33,
          due_date: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          type: "outgoing",
          related_id: "user6",
          related_name: "Neha Gupta",
          status: "pending",
          payment_number: 3,
          total_payments: 12,
        },
        {
          id: "payment2",
          loan_id: "loan6",
          amount: 3000,
          due_date: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          type: "outgoing",
          related_id: "user7",
          related_name: "Karan Malhotra",
          status: "pending",
          payment_number: 1,
          total_payments: 1,
        },
        {
          id: "payment3",
          loan_id: "loan1",
          amount: 500,
          due_date: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          type: "incoming",
          related_id: "user2",
          related_name: "Rahul Kumar",
          status: "pending",
          payment_number: 4,
          total_payments: 10,
        },
        {
          id: "payment4",
          loan_id: "loan4",
          amount: 500,
          due_date: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          type: "incoming",
          related_id: "user5",
          related_name: "Amit Patel",
          status: "overdue",
          payment_number: 1,
          total_payments: 16,
        },
      ];

      setLentLoans(mockLentLoans);
      setBorrowedLoans(mockBorrowedLoans);
      setUpcomingPayments(mockUpcomingPayments);

      // Calculate summary data
      const lentTotal = mockLentLoans.reduce(
        (sum, loan) => sum + loan.remaining_amount,
        0
      );
      const borrowedTotal = mockBorrowedLoans.reduce(
        (sum, loan) => sum + loan.remaining_amount,
        0
      );

      const activeLentCount = mockLentLoans.filter(
        (loan) => loan.status === "active"
      ).length;
      const activeBorrowedCount = mockBorrowedLoans.filter(
        (loan) => loan.status === "active"
      ).length;

      const overdueLoanCount = mockLentLoans.filter((loan) => {
        const dueDate = new Date(loan.next_payment_date);
        return loan.status === "active" && dueDate < new Date();
      }).length;

      const pendingPayments = mockLentLoans.filter(
        (loan) => loan.status === "active" && loan.remaining_amount > 0
      ).length;

      // Sort upcoming payments by date and get the nearest
      const sortedPayments = [...mockUpcomingPayments].sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );

      const nextPaymentDate =
        sortedPayments.length > 0 ? sortedPayments[0].due_date : null;

      setSummary({
        totalLent: lentTotal,
        totalBorrowed: borrowedTotal,
        activeLoanCount: activeLentCount,
        activeBorrowCount: activeBorrowedCount,
        totalPendingPayments: pendingPayments,
        nextPaymentDate,
        overdueLoanCount,
      });
    } catch (error) {
      console.error("Error loading loan summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays <= 7) {
      return `${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderLoanItem = ({ item }: { item: Loan }) => {
    const isOverdue =
      new Date(item.next_payment_date) < new Date() && item.status === "active";
    const isCompleted = item.status === "completed";

    // Calculate progress - what percentage of the loan has been paid back
    const progress = Math.round(
      ((item.amount - item.remaining_amount) / item.amount) * 100
    );

    const getStatusColor = () => {
      if (isOverdue) return "#EF4444"; // Red for overdue
      if (isCompleted) return "#10B981"; // Green for completed
      return "#F59E0B"; // Yellow/orange for active
    };

    const getStatusIcon = () => {
      if (isOverdue) return "alert-circle";
      if (isCompleted) return "checkmark-circle";
      return "cash-outline";
    };

    return (
      <TouchableOpacity
        style={[styles.loanCard, { backgroundColor: "#1F2937" }]}
        onPress={() => onViewLoanDetails?.(item.id)}
      >
        {/* Status indicator strip at the top */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: getStatusColor(),
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />

        <View style={styles.loanHeader}>
          <View style={styles.loanInfo}>
            <View
              style={[
                styles.loanIcon,
                {
                  backgroundColor: isOverdue
                    ? "rgba(239,68,68,0.2)"
                    : isCompleted
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(245,158,11,0.2)",
                },
              ]}
            >
              <Ionicons
                name={getStatusIcon()}
                size={24}
                color={getStatusColor()}
              />
            </View>
            <View>
              <Text style={[styles.loanTitle, { color: colors.text }]}>
                {item.description || `Loan to ${item.borrower_name}`}
              </Text>
              <Text
                style={[styles.loanSubtitle, { color: colors.textSecondary }]}
              >
                {isCompleted
                  ? "Paid in full"
                  : `With ${item.borrower_name} • ${new Date(
                      item.created_at
                    ).toLocaleDateString()}`}
              </Text>
            </View>
          </View>
          <View>
            <Text
              style={[
                styles.loanAmount,
                { color: isOverdue ? "#EF4444" : "#10B981" },
              ]}
            >
              {formatCurrency(item.remaining_amount)}
            </Text>
            <Text style={[styles.loanStatus, { color: colors.textSecondary }]}>
              {isOverdue ? "OVERDUE" : item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Progress bar showing paid amount */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: isCompleted ? "#10B981" : "#3B82F6",
                width: `${progress}%`,
              },
            ]}
          />
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {progress}% paid
          </Text>
        </View>

        <View style={styles.loanDetails}>
          <View style={styles.loanDetailRow}>
            <Text
              style={[styles.loanDetailLabel, { color: colors.textSecondary }]}
            >
              Original Amount:
            </Text>
            <Text style={[styles.loanDetailValue, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>

          {item.interest_rate > 0 && (
            <View style={styles.loanDetailRow}>
              <Text
                style={[
                  styles.loanDetailLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Interest Rate:
              </Text>
              <Text style={[styles.loanDetailValue, { color: colors.text }]}>
                {item.interest_rate}%
              </Text>
            </View>
          )}

          {!isCompleted && (
            <View style={styles.loanDetailRow}>
              <Text
                style={[
                  styles.loanDetailLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Next Payment:
              </Text>
              <Text
                style={[
                  styles.loanDetailValue,
                  {
                    color: isOverdue ? "#EF4444" : colors.text,
                  },
                ]}
              >
                {formatDate(item.next_payment_date)}
                {isOverdue && " (OVERDUE)"}
              </Text>
            </View>
          )}

          <View style={styles.loanDetailRow}>
            <Text
              style={[styles.loanDetailLabel, { color: colors.textSecondary }]}
            >
              {isCompleted ? "Completed On:" : "Final Due Date:"}
            </Text>
            <Text style={[styles.loanDetailValue, { color: colors.text }]}>
              {formatDate(item.due_date)}
            </Text>
          </View>

          {!isCompleted && (
            <View style={styles.loanDetailRow}>
              <Text
                style={[
                  styles.loanDetailLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Payment Schedule:
              </Text>
              <Text style={[styles.loanDetailValue, { color: colors.text }]}>
                {item.payment_frequency === "monthly" ? "Monthly" : "One-time"}
              </Text>
            </View>
          )}
        </View>

        {/* Action button at the bottom */}
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10B981" }]}
            onPress={() => console.log(`Action for loan ${item.id}`)}
          >
            <Text style={styles.actionButtonText}>
              {isOverdue ? "Send Reminder" : "Record Payment"}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderUpcomingItem = ({ item }: { item: any }) => {
    const isPaymentToBeMade = item.type === "outgoing";
    const isOverdue = new Date(item.due_date) < new Date();

    // Calculate days remaining until payment is due (or days overdue)
    const today = new Date();
    const dueDate = new Date(item.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
      <TouchableOpacity
        style={[styles.paymentCard, { backgroundColor: "#1F2937" }]}
        onPress={() => onViewLoanDetails?.(item.loan_id)}
      >
        {/* Status indicator strip */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: isOverdue
              ? "#EF4444"
              : diffDays <= 3
              ? "#F59E0B"
              : "#10B981",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />

        <View style={styles.paymentHeader}>
          <View style={styles.paymentInfo}>
            <View
              style={[
                styles.paymentIcon,
                {
                  backgroundColor: isPaymentToBeMade
                    ? "rgba(239,68,68,0.2)"
                    : "rgba(16,185,129,0.2)",
                },
              ]}
            >
              <Ionicons
                name={
                  isOverdue
                    ? "alert-circle"
                    : isPaymentToBeMade
                    ? "arrow-up-outline"
                    : "arrow-down-outline"
                }
                size={24}
                color={
                  isOverdue
                    ? "#EF4444"
                    : isPaymentToBeMade
                    ? "#F59E0B"
                    : "#10B981"
                }
              />
            </View>
            <View>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>
                {isPaymentToBeMade
                  ? `Payment to ${item.related_name}`
                  : `Payment from ${item.related_name}`}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={[
                    styles.paymentDueDate,
                    {
                      color: isOverdue ? "#EF4444" : colors.textSecondary,
                      fontWeight: isOverdue ? "600" : "400",
                    },
                  ]}
                >
                  {isOverdue ? "OVERDUE" : `Due: ${formatDate(item.due_date)}`}
                </Text>

                {/* Show payment count info */}
                <View style={styles.paymentCountBadge}>
                  <Text style={styles.paymentCountText}>
                    {item.payment_number}/{item.total_payments}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View>
            <Text
              style={[
                styles.paymentAmount,
                { color: isPaymentToBeMade ? "#F59E0B" : "#10B981" },
              ]}
            >
              {formatCurrency(item.amount)}
            </Text>
            <Text
              style={[
                styles.paymentCountdown,
                {
                  color: isOverdue
                    ? "#EF4444"
                    : diffDays <= 3
                    ? "#F59E0B"
                    : "#10B981",
                },
              ]}
            >
              {isOverdue
                ? `${Math.abs(diffDays)} days late`
                : diffDays === 0
                ? "Today"
                : diffDays === 1
                ? "Tomorrow"
                : `${diffDays} days left`}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.paymentActions}>
          {isOverdue && (
            <TouchableOpacity
              style={[
                styles.paymentActionButton,
                { backgroundColor: "#EF4444" },
              ]}
              onPress={() =>
                console.log(`Send reminder for payment ${item.id}`)
              }
            >
              <Text style={styles.paymentActionButtonText}>Send Reminder</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.paymentActionButton,
              {
                backgroundColor: isOverdue ? "#6B7280" : "#10B981",
                marginLeft: isOverdue ? 8 : 0,
              },
            ]}
            onPress={() => console.log(`Record payment ${item.id}`)}
          >
            <Text style={styles.paymentActionButtonText}>
              {isPaymentToBeMade ? "Make Payment" : "Mark Received"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="document-outline"
        size={48}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No{" "}
        {activeTab === "lent"
          ? "lent loans"
          : activeTab === "borrowed"
          ? "borrowed loans"
          : "upcoming payments"}{" "}
        found
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: darkTheme.background }]}>
      {/* Fixed Summary Cards - Always visible */}
      <View style={styles.fixedSummaryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryCardsContent}
        >
          <View style={[styles.summaryCard, { backgroundColor: "#1F2937" }]}>
            <Ionicons name="cash-outline" size={24} color="#10B981" />
            <Text style={[styles.summaryLabel, { color: "#9CA3AF" }]}>
              Total Lent
            </Text>
            <Text style={[styles.summaryValue, { color: "#FFFFFF" }]}>
              {formatCurrency(summary.totalLent)}
            </Text>
            <Text style={[styles.summarySubtext, { color: "#9CA3AF" }]}>
              {summary.activeLoanCount} active loans
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: "#1F2937" }]}>
            <Ionicons name="wallet-outline" size={24} color="#EF4444" />
            <Text style={[styles.summaryLabel, { color: "#9CA3AF" }]}>
              Total Borrowed
            </Text>
            <Text style={[styles.summaryValue, { color: "#FFFFFF" }]}>
              {formatCurrency(summary.totalBorrowed)}
            </Text>
            <Text style={[styles.summarySubtext, { color: "#9CA3AF" }]}>
              {summary.activeBorrowCount} active borrows
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: "#1F2937" }]}>
            <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
            <Text style={[styles.summaryLabel, { color: "#9CA3AF" }]}>
              Pending Payments
            </Text>
            <Text style={[styles.summaryValue, { color: "#FFFFFF" }]}>
              {summary.totalPendingPayments}
            </Text>
            <Text style={[styles.summarySubtext, { color: "#9CA3AF" }]}>
              {summary.overdueLoanCount > 0
                ? `${summary.overdueLoanCount} overdue`
                : "All on time"}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: "#1F2937" }]}>
            <Ionicons name="time-outline" size={24} color="#3B82F6" />
            <Text style={[styles.summaryLabel, { color: "#9CA3AF" }]}>
              Next Payment
            </Text>
            <Text style={[styles.summaryValue, { color: "#FFFFFF" }]}>
              {summary.nextPaymentDate
                ? formatDate(summary.nextPaymentDate)
                : "None"}
            </Text>
            <Text style={[styles.summarySubtext, { color: "#9CA3AF" }]}>
              {summary.nextPaymentDate
                ? new Date(summary.nextPaymentDate).toLocaleDateString()
                : "-"}
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: "#1F2937" }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "lent" && {
              borderBottomColor: "#10B981",
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("lent")}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name="arrow-up-circle"
              size={18}
              color={activeTab === "lent" ? "#10B981" : colors.textSecondary}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "lent" ? "#10B981" : colors.textSecondary,
                },
              ]}
            >
              Lent
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "borrowed" && {
              borderBottomColor: "#10B981",
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("borrowed")}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name="arrow-down-circle"
              size={18}
              color={
                activeTab === "borrowed" ? "#10B981" : colors.textSecondary
              }
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "borrowed" ? "#10B981" : colors.textSecondary,
                },
              ]}
            >
              Borrowed
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "upcoming" && {
              borderBottomColor: "#10B981",
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("upcoming")}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name="calendar"
              size={18}
              color={
                activeTab === "upcoming" ? "#10B981" : colors.textSecondary
              }
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "upcoming" ? "#10B981" : colors.textSecondary,
                },
              ]}
            >
              Upcoming
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === "lent" && (
        <FlatList
          data={lentLoans}
          renderItem={renderLoanItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      {activeTab === "borrowed" && (
        <FlatList
          data={borrowedLoans}
          renderItem={renderLoanItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      {activeTab === "upcoming" && (
        <FlatList
          data={upcomingPayments}
          renderItem={renderUpcomingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fixedSummaryContainer: {
    backgroundColor: darkTheme.background,
    paddingTop: 16, // Add padding at top
    paddingBottom: 8, // Add padding at bottom
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  summaryCardsContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
    paddingVertical: 8, // Add padding at top and bottom
  },
  summaryCard: {
    width: 150,
    height: 130, // Increase height
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  summarySubtext: {
    fontSize: 11,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 16,
    marginTop: 8, // Add margin at top
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 6, // Add padding at top
  },
  loanCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loanInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  loanIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  loanSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  loanAmount: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  loanStatus: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "right",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    marginTop: 12,
    marginBottom: 4,
    position: "relative",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 3,
    fontWeight: "500", // Make text bolder
    letterSpacing: 0.2, // Improve readability
  },
  loanDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  actionButton: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loanDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  loanDetailLabel: {
    fontSize: 12,
  },
  loanDetailValue: {
    fontSize: 12,
    fontWeight: "500",
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  paymentDueDate: {
    fontSize: 12,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  paymentCountdown: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
    fontWeight: "500",
  },
  paymentCountBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  paymentCountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  paymentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  paymentActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentActionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
});

export default LoanSummaryTab;
