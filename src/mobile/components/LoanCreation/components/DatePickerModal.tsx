/**
 * Enhanced Date Picker Modal with Calendar and Quick Selection
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  minDate?: Date;
  colors: any;
  title?: string;
}

interface QuickDateOption {
  id: string;
  label: string;
  getDaysFromNow: () => number;
}

const QUICK_DATE_OPTIONS: QuickDateOption[] = [
  { id: "tomorrow", label: "Tomorrow", getDaysFromNow: () => 1 },
  { id: "next_week", label: "Next Week", getDaysFromNow: () => 7 },
  { id: "next_month", label: "Next Month", getDaysFromNow: () => 30 },
  { id: "3_months", label: "3 Months", getDaysFromNow: () => 90 },
  { id: "6_months", label: "6 Months", getDaysFromNow: () => 180 },
  { id: "1_year", label: "1 Year", getDaysFromNow: () => 365 },
];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  minDate = new Date(),
  colors,
  title = "Select Due Date",
}) => {
  const [tempDate, setTempDate] = useState<Date>(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  const handleQuickSelect = (option: QuickDateOption) => {
    const date = new Date();
    date.setDate(date.getDate() + option.getDaysFromNow());
    setTempDate(date);
  };

  const handleConfirm = () => {
    const formattedDate = tempDate.toISOString().split("T")[0];
    onSelectDate(formattedDate);
    onClose();
  };

  const handleClear = () => {
    onSelectDate("");
    onClose();
  };

  const formatDisplayDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quick Selection Options */}
          <View style={styles.quickOptionsContainer}>
            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Quick Selection
            </Text>
            <View style={styles.quickOptions}>
              {QUICK_DATE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.quickOptionButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleQuickSelect(option)}
                >
                  <Text
                    style={[styles.quickOptionText, { color: colors.text }]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Choose Date
            </Text>

            {Platform.OS === "ios" ? (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={minDate}
                onChange={(event, date) => {
                  if (date) setTempDate(date);
                }}
                textColor={colors.text}
                style={styles.iosDatePicker}
              />
            ) : (
              <View style={styles.androidDateDisplay}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
                <Text style={[styles.androidDateText, { color: colors.text }]}>
                  {formatDisplayDate(tempDate)}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.changeButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => {
                    // This would open the native Android date picker
                    // For now, we'll just show the current date
                  }}
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Selected Date Display */}
            <View
              style={[
                styles.selectedDateDisplay,
                {
                  backgroundColor: colors.primary + "15",
                  borderColor: colors.primary,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.selectedDateText, { color: colors.text }]}>
                Selected: {formatDisplayDate(tempDate)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.clearButton,
                {
                  borderColor: colors.border,
                },
              ]}
              onPress={handleClear}
            >
              <Text style={[styles.clearButtonText, { color: colors.error }]}>
                Clear
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={handleConfirm}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 34,
      maxHeight: "85%",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      flex: 1,
    },
    closeButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    quickOptionsContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    quickOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    quickOptionButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    quickOptionText: {
      fontSize: 14,
      fontWeight: "600",
    },
    calendarContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    iosDatePicker: {
      width: "100%",
      marginVertical: 8,
    },
    androidDateDisplay: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 12,
    },
    androidDateText: {
      flex: 1,
      fontSize: 18,
      fontWeight: "600",
    },
    changeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    changeButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    selectedDateDisplay: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
      borderWidth: 1,
      gap: 8,
    },
    selectedDateText: {
      fontSize: 14,
      fontWeight: "600",
    },
    actionButtons: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 12,
    },
    clearButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    clearButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    confirmButton: {
      flex: 2,
      flexDirection: "row",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    confirmButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
