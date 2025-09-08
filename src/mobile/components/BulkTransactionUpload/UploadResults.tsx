import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UploadResultsProps {
  result: {
    success: boolean;
    result?: {
      status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
      inserted_count: number;
      error_count: number;
      errors: any[];
    };
    validation?: any;
    duplicates?: any;
    error?: string;
  };
}

export default function UploadResults({ result }: UploadResultsProps) {
  const [showErrors, setShowErrors] = React.useState(false);

  if (!result) return null;

  const { success, result: uploadResult, error } = result;

  const getStatusIcon = () => {
    if (!success) return { name: "close-circle", color: "#F44336" };
    if (uploadResult?.status === "SUCCESS")
      return { name: "checkmark-circle", color: "#4CAF50" };
    if (uploadResult?.status === "PARTIAL_SUCCESS")
      return { name: "warning", color: "#FF9800" };
    return { name: "close-circle", color: "#F44336" };
  };

  const getStatusText = () => {
    if (!success) return "Upload Failed";
    if (uploadResult?.status === "SUCCESS") return "Upload Successful";
    if (uploadResult?.status === "PARTIAL_SUCCESS") return "Partial Success";
    return "Upload Failed";
  };

  const statusIcon = getStatusIcon();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={statusIcon.name} size={24} color={statusIcon.color} />
        <Text style={[styles.statusText, { color: statusIcon.color }]}>
          {getStatusText()}
        </Text>
      </View>

      {uploadResult && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{uploadResult.inserted_count}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>

          {uploadResult.error_count > 0 && (
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.errorNumber]}>
                {uploadResult.error_count}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {uploadResult?.errors && uploadResult.errors.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowErrors(!showErrors)}
          >
            <Text style={styles.toggleButtonText}>
              {showErrors ? "Hide" : "Show"} Error Details (
              {uploadResult.errors.length})
            </Text>
            <Ionicons
              name={showErrors ? "chevron-up" : "chevron-down"}
              size={16}
              color="#007AFF"
            />
          </TouchableOpacity>

          {showErrors && (
            <ScrollView style={styles.errorsList} nestedScrollEnabled>
              {uploadResult.errors.map((error, index) => (
                <View key={index} style={styles.errorItem}>
                  <Text style={styles.errorItemText}>
                    {typeof error === "string" ? error : JSON.stringify(error)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {result.duplicates && result.duplicates.duplicate_count > 0 && (
        <View style={styles.duplicateContainer}>
          <Ionicons name="copy-outline" size={16} color="#FF9800" />
          <Text style={styles.duplicateText}>
            {result.duplicates.duplicate_count} potential duplicate
            {result.duplicates.duplicate_count !== 1 ? "s" : ""} detected
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  errorNumber: {
    color: "#F44336",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
    marginBottom: 8,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 8,
  },
  toggleButtonText: {
    color: "#007AFF",
    fontSize: 14,
    marginRight: 4,
  },
  errorsList: {
    maxHeight: 150,
    marginTop: 8,
  },
  errorItem: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#F44336",
  },
  errorItemText: {
    fontSize: 12,
    color: "#666",
  },
  duplicateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  duplicateText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#f57c00",
  },
});
