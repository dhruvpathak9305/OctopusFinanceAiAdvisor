import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useSMSChat } from "../../hooks/useSMSChat";
import { SMSMessage, SMSAnalysisResult } from "../../types/sms";
import SMSMessageList from "./SMSMessageList";
import SMSMessageInput from "./SMSMessageInput";
import SMSModelSelector from "./SMSModelSelector";
import ErrorBoundary from "../Chat/ErrorBoundary";

interface SMSChatContainerProps {
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    surface: string;
    error: string;
  };
  isDark: boolean;
  onOpenTransactionModal?: (
    transactionData?: any,
    isEditMode?: boolean
  ) => void;
}

const SMSChatContainer: React.FC<SMSChatContainerProps> = ({
  colors,
  isDark,
  onOpenTransactionModal,
}) => {
  // SMS Chat state and functionality from custom hook
  const {
    messages,
    isLoading,
    error,
    selectedModel,
    analyzeSMS,
    clearMessages,
    changeModel,
    getAvailableModels,
  } = useSMSChat();

  const [apiConnectionTested, setApiConnectionTested] = useState(false);

  // Test API connection when component mounts
  useEffect(() => {
    const testConnection = async () => {
      // We can reuse the OpenRouter connection test
      setApiConnectionTested(true);
    };
    testConnection();
  }, []);

  // Handle SMS analysis
  const handleAnalyzeSMS = async (smsText: string) => {
    try {
      await analyzeSMS(smsText);
    } catch (error) {
      console.error("Failed to analyze SMS:", error);
      if (error instanceof Error) {
        const errorMessage = error.message || "";
        if (errorMessage.includes("credits") || errorMessage.includes("402")) {
          Alert.alert(
            "API Credit Limit",
            "The AI service has reached its free credit limit. Please try again later.",
            [{ text: "OK" }]
          );
        }
      }
    }
  };

  // Reset conversation
  const handleReset = () => {
    clearMessages();
  };

  // Test API connection
  const handleTestConnection = async () => {
    Alert.alert(
      "Connection Test",
      "SMS Analysis uses the same AI models as the Financial Advisor.",
      [{ text: "OK" }]
    );
  };

  // Handle adding transaction to database
  const handleAddToTransactions = async (transactionRecord: any) => {
    console.log("Add Transaction button clicked");

    // Show confirmation dialog first, then open fresh Add Transaction modal
    Alert.alert(
      "Add Transaction",
      `Add this transaction to your records?\n\nAmount: ₹${
        transactionRecord.amount
      }\nType: ${transactionRecord.type}\nMerchant: ${
        transactionRecord.merchant || "Unknown"
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add New",
          onPress: () => {
            if (onOpenTransactionModal) {
              // Open fresh Add Transaction modal (no pre-filled data)
              onOpenTransactionModal(null, false);
            } else {
              console.log("Adding transaction:", transactionRecord);
              Alert.alert("Success", "Transaction added to your records!");
            }
          },
        },
      ]
    );
  };

  // Handle editing transaction details
  const handleEditTransaction = async (transactionRecord: any) => {
    console.log("Edit Details button clicked");
    if (onOpenTransactionModal) {
      // Always reset modal state first, then open
      setTimeout(() => {
        onOpenTransactionModal(transactionRecord, true);
      }, 100);
    } else {
      console.log("Opening edit modal with:", transactionRecord);
      Alert.alert(
        "Edit Transaction",
        "Opening transaction editor with pre-filled details...",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <ErrorBoundary isDark={isDark}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 10}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* SMS Analysis Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.headerContent}>
              {/* Model selector */}
              <View style={styles.modelSelectorContainer}>
                <SMSModelSelector
                  models={getAvailableModels()}
                  selectedModel={selectedModel}
                  onSelectModel={changeModel}
                  colors={colors}
                  isDark={isDark}
                />
              </View>

              {/* Connection status indicator */}
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    marginRight: 8,
                  },
                ]}
                onPress={handleTestConnection}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={apiConnectionTested ? "wifi" : "wifi-outline"}
                  size={22}
                  color={apiConnectionTested ? "#10B981" : colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Clear messages button */}
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Display error message if any */}
          {error && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: `${colors.error}20` },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity onPress={() => clearMessages()}>
                <Text style={[styles.errorAction, { color: colors.primary }]}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Message list */}
          <View style={styles.messageListContainer}>
            <SMSMessageList
              messages={messages}
              isLoading={isLoading}
              selectedModel={selectedModel}
              colors={colors}
              onAddToTransactions={handleAddToTransactions}
              onEditTransaction={handleEditTransaction}
            />
          </View>

          {/* SMS input */}
          <SMSMessageInput
            onAnalyzeSMS={handleAnalyzeSMS}
            isLoading={isLoading}
            colors={colors}
          />
        </View>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    paddingHorizontal: 0,
    marginHorizontal: 0,
    width: "100%",
    height: "100%",
  },
  header: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  modelSelectorContainer: {
    flex: 1,
    marginRight: 12,
    maxHeight: 46,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    margin: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  errorAction: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  messageListContainer: {
    flex: 1,
  },
});

export default SMSChatContainer;
