import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SplitToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  colors: {
    text: string;
    textSecondary: string;
    primary: string;
    card: string;
    border: string;
  };
  disabled?: boolean;
}

const SplitToggle: React.FC<SplitToggleProps> = ({
  isEnabled,
  onToggle,
  colors,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: isEnabled ? `${colors.primary}15` : colors.card,
            borderColor: isEnabled ? colors.primary : colors.border,
          },
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && onToggle(!isEnabled)}
        activeOpacity={0.7}
      >
        <View style={styles.toggleContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="people-outline"
              size={18}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.toggleText,
                {
                  color: colors.text,
                },
              ]}
            >
              Split
            </Text>
            {isEnabled && (
              <Text
                style={[styles.toggleSubtext, { color: colors.textSecondary }]}
              >
                Divide this expense among multiple people
              </Text>
            )}
          </View>
          <View style={styles.switchContainer}>
            <View
              style={[
                styles.switch,
                {
                  backgroundColor: isEnabled ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  {
                    backgroundColor: "white",
                    transform: [{ translateX: isEnabled ? 16 : 2 }],
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  toggleButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "500",
  },
  toggleSubtext: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  switchContainer: {
    alignItems: "center",
  },
  switch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    position: "relative",
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SplitToggle;
