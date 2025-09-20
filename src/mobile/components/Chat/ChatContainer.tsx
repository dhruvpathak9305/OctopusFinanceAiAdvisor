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

import { useChat } from "../../hooks/useChat";
import { ChatMessageContent } from "../../types/chat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ModelSelector from "./ModelSelector";
import ErrorBoundary from "./ErrorBoundary";
import { OpenRouterService } from "../../services/openRouterService";

interface ChatContainerProps {
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
}

const ChatContainer: React.FC<ChatContainerProps> = ({ colors, isDark }) => {
  // Chat state and functionality from custom hook
  const {
    messages,
    isLoading,
    error,
    selectedModel,
    sendMessage,
    clearMessages,
    changeModel,
    getAvailableModels,
  } = useChat();

  const [showOptions, setShowOptions] = useState(false);
  const [apiConnectionTested, setApiConnectionTested] = useState(false);

  // Test API connection when component mounts or selected model changes
  useEffect(() => {
    const testApiConnection = async () => {
      if (selectedModel.provider === "openrouter") {
        try {
          const openRouterService = OpenRouterService.getInstance();
          const isConnected = await openRouterService.testConnection();

          if (!isConnected && !apiConnectionTested) {
            console.warn("OpenRouter API connection failed");
            Alert.alert(
              "API Connection Issue",
              "Unable to connect to the AI service. Please check your internet connection or try again later.",
              [{ text: "OK" }]
            );
          }

          setApiConnectionTested(true);
        } catch (error) {
          console.error("Error testing API connection:", error);
        }
      }
    };

    testApiConnection();
  }, [selectedModel.provider]);

  // Handle message submission
  const handleSendMessage = async (content: string | ChatMessageContent[]) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Show user-friendly error message for common API issues
      if (error instanceof Error) {
        const errorMessage = error.message || "";
        if (errorMessage.includes("credits") || errorMessage.includes("402")) {
          Alert.alert(
            "API Credit Limit",
            "The AI service has reached its free credit limit. Please try again later when credits have been replenished.",
            [{ text: "OK" }]
          );
        }
      }
      // Other errors already handled in the hook
    }
  };

  // Reset conversation
  const handleReset = () => {
    clearMessages();
    setShowOptions(false);
  };
  
  // Test API connection
  const handleTestConnection = async () => {
    setShowOptions(false);
    try {
      const openRouterService = OpenRouterService.getInstance();
      const isConnected = await openRouterService.testConnection(selectedModel.apiKey);
      
      Alert.alert(
        isConnected ? "Connection Successful" : "Connection Failed",
        isConnected 
          ? "Successfully connected to the AI service." 
          : "Could not connect to the AI service. Please check your API key and internet connection.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "An error occurred while testing the connection.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <ErrorBoundary isDark={isDark}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Beautiful Chat Header with Gradient Effect */}
          <View
            style={[
              styles.beautifulHeader,
              {
                backgroundColor: isDark ? '#1a1f2c' : '#f0f7ff',
              },
            ]}
          >
            {/* Decorative gradient line at top */}
            <View style={styles.gradientLine} />
            
            <View style={styles.headerContent}>
              {/* New Chat button with pulse animation */}
              <TouchableOpacity
                style={[
                  styles.beautifulIconButton,
                  { 
                    backgroundColor: isDark ? '#2d3748' : '#e6f0ff',
                  },
                ]}
                onPress={handleReset}
                activeOpacity={0.6}
              >
                <View style={[styles.iconBackground, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>

              {/* Model selector with enhanced styling */}
              <View style={styles.modelSelectorContainerInHeader}>
                <ModelSelector
                  models={getAvailableModels()}
                  selectedModel={selectedModel}
                  onSelectModel={changeModel}
                  colors={colors}
                />
              </View>

              {/* Options button with improved styling */}
              <TouchableOpacity
                style={[
                  styles.beautifulIconButton,
                  {
                    backgroundColor: isDark ? '#2d3748' : '#e6f0ff',
                  },
                ]}
                onPress={() => setShowOptions(!showOptions)}
                activeOpacity={0.6}
              >
                <View style={[styles.iconBackground, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Subtle shadow effect */}
            <View style={styles.headerShadow} />
          </View>

            {/* Options menu - redesigned with modern styling */}
            {showOptions && (
              <View
                style={[
                  styles.optionsMenu,
                  { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 12,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={handleReset}
                >
                  <Ionicons name="refresh" size={18} color={colors.primary} />
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    New Chat
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={handleTestConnection}
                >
                  <Ionicons name="cloud-outline" size={18} color={colors.primary} />
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    Test Connection
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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

          {/* Model selector is now in the header */}

          {/* Message list */}
          <View style={styles.messageListContainer}>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onSuggestedQuestionClick={handleSendMessage}
              colors={colors}
            />
          </View>

          {/* Message input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            supportsImages={selectedModel.supportsImages}
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
  },
  // Beautiful header styles with modern design
  beautifulHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10,
  },
  gradientLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#10b981', // Primary green color
    opacity: 0.7,
  },
  headerShadow: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 50,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  modelSelectorContainerInHeader: {
    flex: 1,
    marginHorizontal: 10,
    maxHeight: 46,
  },
  beautifulIconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Keep old styles for reference
  enhancedHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  // Legacy styles kept for reference
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsMenu: {
    position: "absolute",
    top: 56,
    right: 16,
    minWidth: 160,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
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
  modelSelectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messageListContainer: {
    flex: 1,
  },
});

export default ChatContainer;
