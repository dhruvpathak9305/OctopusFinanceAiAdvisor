import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import {
  BulkTransactionService,
  type BulkTransactionData,
} from "../../../../services/bulkTransactionService";
import { useUnifiedAuth } from "../../../../contexts/UnifiedAuthContext";
import ProgressBar from "./ProgressBar";
import ValidationResults from "./ValidationResults";
import UploadResults from "./UploadResults";

interface BulkTransactionUploadProps {
  accountId: string;
  accountName: string;
  onUploadComplete?: (result: any) => void;
  onClose?: () => void;
}

export default function BulkTransactionUpload({
  accountId,
  accountName,
  onUploadComplete,
  onClose,
}: BulkTransactionUploadProps) {
  const { user } = useUnifiedAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [uploadStep, setUploadStep] = useState<
    "select" | "preview" | "uploading" | "complete"
  >("select");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");

  // Data states
  const [parsedTransactions, setParsedTransactions] = useState<
    BulkTransactionData[]
  >([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleFileSelect = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/plain", "application/csv"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile(file);
        await parseFile(file);
      }
    } catch (error) {
      console.error("File selection error:", error);
      Alert.alert("Error", "Failed to select file. Please try again.");
    }
  }, []);

  const parseFile = async (file: any) => {
    setIsLoading(true);
    setCurrentStage("Parsing file...");

    try {
      const fileContent = await FileSystem.readAsStringAsync(file.uri);

      let transactions: BulkTransactionData[];

      // Determine parsing method based on file type/content
      if (
        file.name.toLowerCase().includes(".csv") ||
        fileContent.includes(",")
      ) {
        transactions = BulkTransactionService.parseCSV(
          fileContent,
          accountId,
          user?.id || ""
        );
      } else {
        transactions = BulkTransactionService.parseBankStatement(
          fileContent,
          accountId,
          user?.id || ""
        );
      }

      if (transactions.length === 0) {
        throw new Error("No valid transactions found in file");
      }

      setParsedTransactions(transactions);

      // Validate transactions
      setCurrentStage("Validating transactions...");
      const validation = await BulkTransactionService.validateTransactions(
        transactions
      );
      setValidationResult(validation);

      if (validation.is_valid) {
        setUploadStep("preview");
      } else {
        Alert.alert(
          "Validation Issues",
          `Found ${validation.validation_errors.length} validation errors. Please review and fix them.`
        );
      }
    } catch (error) {
      console.error("File parsing error:", error);
      Alert.alert("Parsing Error", error.message || "Failed to parse file");
      // Clear any potentially set data to prevent showing dummy data
      setParsedTransactions([]);
      setValidationResult(null);
      setUploadStep("upload");
    } finally {
      setIsLoading(false);
      setCurrentStage("");
    }
  };

  const handleManualEntry = () => {
    Alert.prompt(
      "Manual Entry",
      "Paste your bank statement text here:",
      async (text) => {
        if (text && text.trim()) {
          setIsLoading(true);
          setCurrentStage("Parsing text...");

          try {
            const transactions = BulkTransactionService.parseBankStatement(
              text,
              accountId,
              user?.id || ""
            );

            if (transactions.length === 0) {
              throw new Error("No valid transactions found in text");
            }

            setParsedTransactions(transactions);

            // Validate transactions
            setCurrentStage("Validating transactions...");
            const validation =
              await BulkTransactionService.validateTransactions(transactions);
            setValidationResult(validation);

            if (validation.is_valid) {
              setUploadStep("preview");
            }
          } catch (error) {
            console.error("Manual entry error:", error);
            Alert.alert("Parsing Error", error.message);
          } finally {
            setIsLoading(false);
            setCurrentStage("");
          }
        }
      },
      "plain-text"
    );
  };

  const handleUpload = async () => {
    if (!user?.id) return;

    setUploadStep("uploading");
    setIsLoading(true);
    setProgress(0);

    try {
      const result = await BulkTransactionService.uploadWithValidation(
        parsedTransactions,
        user.id,
        {
          skipValidation: true, // Already validated
          onProgress: (stage, progress) => {
            setCurrentStage(stage);
            setProgress(progress);
          },
        }
      );

      setUploadResult(result);
      setUploadStep("complete");

      if (result.success) {
        Alert.alert(
          "Upload Complete!",
          `Successfully uploaded ${
            result.result?.inserted_count || 0
          } transactions.`
        );
        onUploadComplete?.(result);
      } else {
        Alert.alert(
          "Upload Issues",
          result.error || "Some transactions failed to upload"
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const renderSelectStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Bulk Transaction Upload</Text>
      <Text style={styles.subtitle}>Upload transactions for {accountName}</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleFileSelect}
          disabled={isLoading}
        >
          <Ionicons name="document-outline" size={24} color="#007AFF" />
          <Text style={styles.optionText}>Upload CSV File</Text>
          <Text style={styles.optionDescription}>
            Select a CSV file with transaction data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleManualEntry}
          disabled={isLoading}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
          <Text style={styles.optionText}>Manual Entry</Text>
          <Text style={styles.optionDescription}>
            Paste bank statement text directly
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{currentStage}</Text>
        </View>
      )}
    </View>
  );

  const renderPreviewStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Review Transactions</Text>
      <Text style={styles.subtitle}>
        Found {parsedTransactions.length} transactions
      </Text>

      {validationResult && <ValidationResults validation={validationResult} />}

      <ScrollView style={styles.transactionsList}>
        {parsedTransactions.slice(0, 10).map((transaction, index) => (
          <View key={index} style={styles.transactionItem}>
            <Text style={styles.transactionName}>{transaction.name}</Text>
            <Text style={styles.transactionAmount}>
              {transaction.type === "expense" ? "-" : "+"}₹
              {transaction.amount.toFixed(2)}
            </Text>
            <Text style={styles.transactionDate}>
              {transaction.date.split("T")[0]}
            </Text>
          </View>
        ))}
        {parsedTransactions.length > 10 && (
          <Text style={styles.moreText}>
            ... and {parsedTransactions.length - 10} more transactions
          </Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setUploadStep("select")}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleUpload}>
          <Text style={styles.primaryButtonText}>Upload All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUploadingStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Uploading Transactions</Text>
      <Text style={styles.subtitle}>{currentStage}</Text>

      <ProgressBar progress={progress} />

      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>{progress}% Complete</Text>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Upload Complete</Text>

      {uploadResult && <UploadResults result={uploadResult} />}

      <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
        <Text style={styles.primaryButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {uploadStep === "select" && renderSelectStep()}
        {uploadStep === "preview" && renderPreviewStep()}
        {uploadStep === "uploading" && renderUploadingStep()}
        {uploadStep === "complete" && renderCompleteStep()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 8,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  transactionsList: {
    flex: 1,
    maxHeight: 300,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 12,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  moreText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  progressInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 16,
  },
});
