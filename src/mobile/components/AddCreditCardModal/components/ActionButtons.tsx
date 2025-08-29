import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActionButtonsProps {
  onScanPress: () => void;
  onSave: () => void;
  scanButtonScale: Animated.Value;
  colors: any;
  styles: any;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onScanPress,
  onSave,
  scanButtonScale,
  colors,
  styles,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <Animated.View style={[{ transform: [{ scale: scanButtonScale }] }]}>
        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: colors.primary }]}
          onPress={onScanPress}
        >
          <View style={styles.scanButtonContent}>
            <Ionicons name="scan" size={20} color="white" />
            <Text style={styles.scanButtonText}>
              Extract Credit Card Details
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={onSave}
      >
        <Text style={styles.saveButtonText}>Add Credit Card</Text>
      </TouchableOpacity>
    </View>
  );
};
