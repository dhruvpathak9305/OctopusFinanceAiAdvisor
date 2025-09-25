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
import {
  RelationshipSummary,
  RelationshipTransaction,
  Loan,
  TransactionSplit,
} from "../../../../types/financial-relationships";

interface RelationshipDetailProps {
  relationshipId: string;
  onCreateLoan?: () => void;
  onRequestPayment?: () => void;
  onRecordPayment?: () => void;
  onBack?: () => void;
}

const RelationshipDetail: React.FC<RelationshipDetailProps> = ({
  relationshipId,
  onCreateLoan,
  onRequestPayment,
  onRecordPayment,
  onBack,
}) => {
  const { isDark } = useTheme();
  const navTheme = useNavTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<RelationshipSummary | null>(null);
  const [userName, setUserName] = useState<string>("User");

  // Use the dark theme but with specific adjustments to match the main dashboard
  const colors = {
    ...darkTheme,
    ...navTheme.colors,
    card: "#1F2937", // Darker card background to match the main dashboard
    primary: "#10B981", // Green primary color for buttons and accents
    success: "#10B981", // Green success color
    text: "#FFFFFF", // White text
    textSecondary: "#9CA3AF", // Gray secondary text
  };

  useEffect(() => {
    loadRelationshipDetails();
  }, [relationshipId]);

  const loadRelationshipDetails = async () => {
    try {
      setLoading(true);
      const data = await FinancialRelationshipService.getRelationshipSummary(
        relationshipId
      );
      setSummary(data);

      // In a real implementation, we would fetch user details
      // For now, we'll just use a sample name
      setUserName(getUserName(data.relatedUserId));
    } catch (error) {
      console.error("Error loading relationship details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    // In a real implementation, we would fetch user details
    // For now, we'll just use sample names
    const names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Neha"];
    const nameIndex =
      Math.abs(userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1)) %
      names.length;
    return names[nameIndex];
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderLoanItem = (loan: Loan) => {
    return (
      <View
        key={loan.id}
        style={[styles.loanCard, { backgroundColor: colors.card }]}
      >
        <View style={styles.loanHeader}>
          <Text style={[styles.loanTitle, { color: colors.text }]}>
            {loan.description || "Personal Loan"}
          </Text>
          <Text
            style={[
              styles.loanStatus,
              {
                color:
                  loan.status === "active"
                    ? colors.primary
                    : loan.status === "overdue"
                    ? colors.notification
                    : colors.text,
              },
            ]}
          >
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </Text>
        </View>

        <View style={styles.loanDetails}>
          <View style={styles.loanDetailRow}>
            <Text
              style={[styles.loanDetailLabel, { color: colors.textSecondary }]}
            >
              Amount:
            </Text>
            <Text style={[styles.loanDetailValue, { color: colors.text }]}>
              {formatCurrency(loan.amount)}
            </Text>
          </View>

          <View style={styles.loanDetailRow}>
            <Text
              style={[styles.loanDetailLabel, { color: colors.textSecondary }]}
            >
              Created:
            </Text>
            <Text style={[styles.loanDetailValue, { color: colors.text }]}>
              {formatDate(loan.created_at)}
            </Text>
          </View>

          {loan.due_date && (
            <View style={styles.loanDetailRow}>
              <Text
                style={[
                  styles.loanDetailLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Due:
              </Text>
              <Text style={[styles.loanDetailValue, { color: colors.text }]}>
                {formatDate(loan.due_date)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.viewDetailsButton, { borderColor: colors.primary }]}
          onPress={() => console.log("View loan details", loan.id)}
        >
          <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSplitItem = (split: TransactionSplit) => {
    return (
      <View
        key={split.id}
        style={[styles.splitCard, { backgroundColor: colors.card }]}
      >
        <View style={styles.splitHeader}>
          <Text style={[styles.splitTitle, { color: colors.text }]}>
            {/* In a real implementation, we would fetch transaction details */}
            {split.transaction_id.substring(0, 8) === "dinner"
              ? "Dinner"
              : split.transaction_id.substring(0, 8) === "movie"
              ? "Movie tickets"
              : "Split expense"}
          </Text>
          <Text
            style={[
              styles.splitStatus,
              {
                color: split.is_paid ? colors.primary : colors.notification,
              },
            ]}
          >
            {split.is_paid ? "Settled" : "Unpaid"}
          </Text>
        </View>

        <View style={styles.splitDetails}>
          <View style={styles.splitDetailRow}>
            <Text
              style={[styles.splitDetailLabel, { color: colors.textSecondary }]}
            >
              Amount:
            </Text>
            <Text style={[styles.splitDetailValue, { color: colors.text }]}>
              {formatCurrency(split.share_amount)}
            </Text>
          </View>

          {split.due_date && (
            <View style={styles.splitDetailRow}>
              <Text
                style={[
                  styles.splitDetailLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Due:
              </Text>
              <Text style={[styles.splitDetailValue, { color: colors.text }]}>
                {formatDate(split.due_date)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTransactionItem = (transaction: RelationshipTransaction) => {
    return (
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionIconContainer}>
          <Ionicons
            name={
              transaction.type === "loan"
                ? "wallet-outline"
                : transaction.type === "loan_payment"
                ? "cash-outline"
                : "people-outline"
            }
            size={20}
            color={colors.primary}
          />
        </View>
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text
              style={[styles.transactionDescription, { color: colors.text }]}
            >
              {transaction.description}
            </Text>
            <Text style={[styles.transactionAmount, { color: colors.text }]}>
              {formatCurrency(transaction.amount)}
            </Text>
          </View>
          <Text
            style={[styles.transactionDate, { color: colors.textSecondary }]}
          >
            {formatDate(transaction.date)}
          </Text>
        </View>
      </View>
    );
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
          Loading relationship details...
        </Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Could not load relationship details
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: "#10B981" }]}
          onPress={loadRelationshipDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPositive = summary.totalAmount >= 0;

  return (
    <View style={[styles.container, { backgroundColor: darkTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: darkTheme.card }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.userName, { color: colors.text }]}>
            {userName}
          </Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
            {isPositive ? "They owe you:" : "You owe:"}
          </Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: isPositive ? "#10B981" : "#EF4444" },
            ]}
          >
            {formatCurrency(summary.totalAmount)}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10B981" }]}
            onPress={onRequestPayment}
          >
            <Text style={styles.actionButtonText}>Request Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10B981" }]}
            onPress={onRecordPayment}
          >
            <Text style={styles.actionButtonText}>Record Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Active Loans */}
        {summary.activeLoans.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ACTIVE LOANS
            </Text>
            {summary.activeLoans.map(renderLoanItem)}
            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.primary }]}
              onPress={onCreateLoan}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                Create New Loan
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Split Expenses */}
        {summary.unpaidSplits.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              SPLIT EXPENSES
            </Text>
            {summary.unpaidSplits.map(renderSplitItem)}
          </View>
        )}

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            TRANSACTION HISTORY
          </Text>
          {summary.recentTransactions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transaction history
            </Text>
          ) : (
            summary.recentTransactions.map(renderTransactionItem)
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    maxWidth: "80%",
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  loanCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  loanStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  loanDetails: {
    marginBottom: 12,
  },
  loanDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  loanDetailLabel: {
    fontSize: 14,
  },
  loanDetailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  viewDetailsButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  splitCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  splitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  splitTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  splitStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  splitDetails: {
    marginBottom: 4,
  },
  splitDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  splitDetailLabel: {
    fontSize: 14,
  },
  splitDetailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    padding: 16,
  },
});

export default RelationshipDetail;
