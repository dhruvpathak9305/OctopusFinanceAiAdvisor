import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SMSAnalysisResult } from "../../types/sms";

interface SMSAnalysisCardProps {
  analysisResult: SMSAnalysisResult;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    surface: string;
  };
  onAddToTransactions?: (transactionRecord: any) => void;
  onEditTransaction?: (transactionRecord: any) => void;
}

const SMSAnalysisCard: React.FC<SMSAnalysisCardProps> = ({
  analysisResult,
  colors,
  onAddToTransactions,
  onEditTransaction,
}) => {
  const { extractedData, confidence, isValid, warnings } = analysisResult;

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "#10B981"; // Green
    if (confidence >= 60) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  // Get transaction type icon and color
  const getTransactionIcon = (type: "debit" | "credit") => {
    return type === "credit"
      ? { name: "arrow-down-circle", color: "#10B981" }
      : { name: "arrow-up-circle", color: "#EF4444" };
  };

  const transactionIcon = getTransactionIcon(extractedData.type || "debit");
  const confidenceColor = getConfidenceColor(confidence);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isValid ? colors.border : "#EF4444",
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Transaction Analysis
          </Text>
        </View>
        <View style={styles.confidenceContainer}>
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: `${confidenceColor}20` },
            ]}
          >
            <Text style={[styles.confidenceText, { color: confidenceColor }]}>
              {confidence}% confident
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.amountRow}>
          <Ionicons
            name={transactionIcon.name as any}
            size={24}
            color={transactionIcon.color}
          />
          <View style={styles.amountInfo}>
            <Text style={[styles.amountText, { color: colors.text }]}>
              ₹{extractedData.amount?.toLocaleString() || "N/A"}
            </Text>
            <Text style={[styles.typeText, { color: colors.textSecondary }]}>
              {extractedData.type?.toUpperCase() || "UNKNOWN"}
            </Text>
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.additionalDetails}>
          {extractedData.merchant && (
            <DetailRow
              icon="storefront"
              label="Merchant"
              value={extractedData.merchant}
              colors={colors}
            />
          )}
          {extractedData.category && (
            <DetailRow
              icon="pricetag"
              label="Category"
              value={extractedData.category}
              colors={colors}
            />
          )}
          {extractedData.balance && (
            <DetailRow
              icon="wallet"
              label="Balance"
              value={`₹${extractedData.balance.toLocaleString()}`}
              colors={colors}
            />
          )}
          {extractedData.date && (
            <DetailRow
              icon="calendar"
              label="Date"
              value={extractedData.date}
              colors={colors}
            />
          )}
          {extractedData.accountNumber && (
            <DetailRow
              icon="card"
              label="Account"
              value={`****${extractedData.accountNumber}`}
              colors={colors}
            />
          )}
        </View>
      </View>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <View style={styles.warningsContainer}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={16} color="#F59E0B" />
            <Text style={[styles.warningTitle, { color: "#F59E0B" }]}>
              Warnings
            </Text>
          </View>
          {warnings.map((warning, index) => (
            <Text
              key={index}
              style={[styles.warningText, { color: colors.textSecondary }]}
            >
              • {warning}
            </Text>
          ))}
        </View>
      )}

      {/* Validity Status */}
      <View style={styles.statusContainer}>
        <Ionicons
          name={isValid ? "checkmark-circle" : "close-circle"}
          size={16}
          color={isValid ? "#10B981" : "#EF4444"}
        />
        <Text
          style={[
            styles.statusText,
            { color: isValid ? "#10B981" : "#EF4444" },
          ]}
        >
          {isValid ? "Valid Transaction" : "Invalid/Incomplete Data"}
        </Text>
      </View>

      {/* Action Buttons */}
      {isValid && analysisResult.transactionRecord && (
        <View style={styles.actionButtonsContainer}>
          {/* Edit Transaction Button */}
          {onEditTransaction && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.editButton,
                { borderColor: colors.primary },
              ]}
              onPress={() =>
                onEditTransaction(analysisResult.transactionRecord)
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.primary}
              />
              <Text
                style={[styles.actionButtonText, { color: colors.primary }]}
              >
                Edit Details
              </Text>
            </TouchableOpacity>
          )}

          {/* Add to Transactions Button */}
          {confidence >= 70 && onAddToTransactions && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.addButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() =>
                onAddToTransactions(analysisResult.transactionRecord)
              }
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color="white" />
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// Helper component for detail rows
const DetailRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  colors: any;
}> = ({ icon, label, value, colors }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon as any} size={16} color={colors.textSecondary} />
    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
      {label}:
    </Text>
    <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  confidenceContainer: {
    alignItems: "flex-end",
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsContainer: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  amountInfo: {
    marginLeft: 12,
  },
  amountText: {
    fontSize: 24,
    fontWeight: "700",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  additionalDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    marginLeft: 6,
    minWidth: 70,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  warningsContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 8,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 22,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  addButton: {
    backgroundColor: "#10B981", // Will be overridden by colors.primary
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default SMSAnalysisCard;
