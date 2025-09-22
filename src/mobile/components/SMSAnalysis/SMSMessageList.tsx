import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { SMSMessage, SMSModel } from "../../types/sms";
import SMSAnalysisCard from "./SMSAnalysisCard";
import ModelIcon from "../ModelIcon";

interface SMSMessageListProps {
  messages: SMSMessage[];
  isLoading: boolean;
  selectedModel: SMSModel;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    surface: string;
  };
  onAddToTransactions?: (transactionRecord: any) => void;
  onEditTransaction?: (transactionRecord: any) => void;
}

const SMSMessageList: React.FC<SMSMessageListProps> = ({
  messages,
  isLoading,
  selectedModel,
  colors,
  onAddToTransactions,
  onEditTransaction,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Scroll to bottom when loading state changes to true (thinking indicator appears)
  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300); // Longer delay to ensure thinking indicator is rendered
    }
  }, [isLoading]);

  // Debug loading state
  useEffect(() => {
    console.log("SMS MessageList - isLoading changed:", isLoading);
  }, [isLoading]);

  // Fade in animation for new messages
  useEffect(() => {
    if (messages.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [messages, fadeAnim]);

  // Format timestamp to human-readable time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If no messages, show welcome message
  if (messages.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={styles.emptyIcon}>📱💰</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          SMS Transaction Analyzer
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Paste bank SMS messages for AI analysis
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featuresList}>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
              💳 Extract amounts & merchant details
            </Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
              📊 Categorize spending patterns
            </Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
              💡 Get smart financial insights
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {messages.map((message) => (
          <View key={message.id} style={styles.messageContainer}>
            {message.type === "user" && (
              <View style={styles.userMessageRow}>
                <View
                  style={[
                    styles.userBubble,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.userMessageText}>📱 SMS to Analyze</Text>
                  <Text
                    style={[styles.smsText, { color: "rgba(255,255,255,0.9)" }]}
                  >
                    {message.content}
                  </Text>
                  <Text style={styles.userTimestamp}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            )}

            {message.type === "analysis" && message.analysisResult && (
              <View style={styles.analysisRow}>
                <SMSAnalysisCard
                  analysisResult={message.analysisResult}
                  colors={colors}
                  onAddToTransactions={onAddToTransactions}
                  onEditTransaction={onEditTransaction}
                />
              </View>
            )}

            {message.type === "assistant" && (
              <View style={styles.assistantMessageRow}>
                <View
                  style={[
                    styles.assistantBubble,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.assistantName, { color: colors.primary }]}
                  >
                    {selectedModel.name} Analysis
                  </Text>
                  <Text
                    style={[
                      styles.assistantMessageText,
                      { color: colors.text },
                    ]}
                  >
                    {message.content}
                  </Text>
                  <Text
                    style={[
                      styles.assistantTimestamp,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={styles.messageRow}>
            {console.log("SMS Analysis - Rendering thinking indicator!") ||
              null}
            {/* Assistant avatar for loading state */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ModelIcon model={selectedModel as any} size={24} />
              </View>
            </View>

            {/* Loading bubble */}
            <View
              style={[
                styles.messageBubble,
                styles.assistantBubble,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: colors.textSecondary, marginLeft: 8 },
                  ]}
                >
                  Thinking...
                </Text>
              </View>
            </View>

            {/* Empty space for balance */}
            <View style={styles.avatarContainer} />
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginVertical: 4,
  },
  // WhatsApp style message layout
  messageRow: {
    flexDirection: "row",
    marginVertical: 2,
    paddingVertical: 2,
    width: "100%",
  },
  // Avatar styling
  avatarContainer: {
    width: 36,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  // Bubble styling
  messageBubble: {
    maxWidth: "82%",
    padding: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 1,
  },
  assistantBubble: {
    borderTopLeftRadius: 2,
    borderWidth: 1,
    marginRight: 4,
  },
  userMessageRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 2,
  },
  assistantMessageRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 2,
  },
  analysisRow: {
    marginVertical: 8,
  },
  userBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 2,
    marginLeft: 8,
  },
  assistantBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 2,
    borderWidth: 1,
    marginRight: 8,
  },
  userMessageText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  smsText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  assistantName: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  assistantMessageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userTimestamp: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  assistantTimestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresContainer: {
    width: "100%",
    alignItems: "center",
  },
  featuresList: {
    width: "100%",
    alignItems: "center",
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
    textAlign: "center",
  },
});

export default SMSMessageList;
