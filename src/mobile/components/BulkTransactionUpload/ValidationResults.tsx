import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ValidationResultsProps {
  validation: {
    is_valid: boolean;
    total_count: number;
    validation_errors: any[];
  };
}

export default function ValidationResults({
  validation,
}: ValidationResultsProps) {
  const [showErrors, setShowErrors] = React.useState(false);

  if (!validation) return null;

  const { is_valid, total_count, validation_errors } = validation;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={is_valid ? "checkmark-circle" : "warning-outline"}
            size={20}
            color={is_valid ? "#4CAF50" : "#FF9800"}
          />
          <Text
            style={[
              styles.statusText,
              { color: is_valid ? "#4CAF50" : "#FF9800" },
            ]}
          >
            {is_valid
              ? "All Valid"
              : `${validation_errors.length} Issues Found`}
          </Text>
        </View>

        <Text style={styles.countText}>
          {total_count} transaction{total_count !== 1 ? "s" : ""}
        </Text>
      </View>

      {!is_valid && validation_errors.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowErrors(!showErrors)}
          >
            <Text style={styles.toggleButtonText}>
              {showErrors ? "Hide" : "Show"} Error Details
            </Text>
            <Ionicons
              name={showErrors ? "chevron-up" : "chevron-down"}
              size={16}
              color="#007AFF"
            />
          </TouchableOpacity>

          {showErrors && (
            <ScrollView style={styles.errorsList} nestedScrollEnabled>
              {validation_errors.map((error, index) => (
                <View key={index} style={styles.errorItem}>
                  <Text style={styles.errorTitle}>
                    Transaction {error.transaction_index || index + 1}:
                  </Text>
                  {Array.isArray(error.errors) &&
                    error.errors.map((err, errIndex) => (
                      <Text key={errIndex} style={styles.errorText}>
                        • {err}
                      </Text>
                    ))}
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  countText: {
    fontSize: 12,
    color: "#666",
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
    borderLeftColor: "#FF9800",
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
});
