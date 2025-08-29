import React from "react";
import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DatePickerProps } from "../types";

export const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  value,
  onClose,
  onChange,
  minimumDate,
  colors,
  styles,
}) => {
  if (Platform.OS === "ios") {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.datePickerOverlay}>
          <View
            style={[
              styles.datePickerContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[
                styles.datePickerHeader,
                {
                  backgroundColor: colors.card,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity onPress={onClose}>
                <Text
                  style={[
                    styles.datePickerButton,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text
                  style={[styles.datePickerButton, { color: colors.primary }]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={value}
              mode="date"
              display="spinner"
              onChange={onChange}
              minimumDate={minimumDate}
              textColor={colors.text}
              accentColor={colors.primary}
              style={[
                styles.datePicker,
                { backgroundColor: colors.background },
              ]}
            />
          </View>
        </View>
      </Modal>
    );
  }

  // Android DatePicker
  if (visible) {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onChange={onChange}
        minimumDate={minimumDate}
      />
    );
  }

  return null;
};
