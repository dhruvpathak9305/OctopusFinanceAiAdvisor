import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SMSMessageInputProps {
  onAnalyzeSMS: (smsText: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
  };
}

const SMSMessageInput: React.FC<SMSMessageInputProps> = ({
  onAnalyzeSMS,
  isLoading,
  disabled = false,
  placeholder = "Paste your bank SMS message...",
  colors,
}) => {
  const [smsText, setSmsText] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const containerHeight = useRef(new Animated.Value(56)).current;

  // Handle button press animation
  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.9,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Expand input height when message is multiline
  useEffect(() => {
    const baseHeight = 56;
    const additionalHeight =
      smsText.split("\n").length > 1
        ? Math.min((smsText.split("\n").length - 1) * 20, 80)
        : 0;

    Animated.timing(containerHeight, {
      toValue: baseHeight + additionalHeight,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [smsText, containerHeight]);

  // Handle analyze SMS
  const handleAnalyzeSMS = () => {
    if (!smsText.trim() || isLoading || disabled) {
      return;
    }

    onAnalyzeSMS(smsText.trim());

    // Clear the input
    setSmsText("");

    // Dismiss keyboard on send for iOS
    if (Platform.OS === "ios") {
      Keyboard.dismiss();
    }
  };

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      // Note: Clipboard API is not available in this setup
      // This is a placeholder for future implementation
      Alert.alert(
        "Paste SMS",
        "Please manually paste your SMS message into the text field.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: containerHeight,
        },
      ]}
    >
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {/* Paste button */}
        <TouchableOpacity
          style={[styles.actionButton]}
          onPress={handlePasteFromClipboard}
          disabled={isLoading || disabled}
        >
          <Ionicons
            name="clipboard"
            size={22}
            color={disabled ? colors.textSecondary : "#FFFFFF"}
            style={{
              backgroundColor: disabled ? colors.textSecondary : colors.primary,
              borderRadius: 4,
              padding: 2,
            }}
          />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={smsText}
          onChangeText={setSmsText}
          multiline
          numberOfLines={1}
          maxLength={2000}
          editable={!disabled}
          blurOnSubmit={false}
          onSubmitEditing={handleAnalyzeSMS}
        />

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              (smsText.trim() === "" || isLoading || disabled) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleAnalyzeSMS}
            disabled={smsText.trim() === "" || isLoading || disabled}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="paper-plane" size={20} color="white" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    borderTopWidth: 1,
    minHeight: 56,
    marginBottom: Platform.OS === "ios" ? 10 : 5, // Push up from bottom
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    position: "relative",
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  actionButton: {
    marginRight: 12,
    padding: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    zIndex: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default SMSMessageInput;
