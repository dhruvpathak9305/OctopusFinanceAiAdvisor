import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from "react-native";
import { ChatMessage, ChatModel } from "../../types/chat";
import ModelIcon from '../../components/ModelIcon';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  selectedModel: ChatModel;
  onSuggestedQuestionClick?: (question: string) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    surface: string;
  };
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  selectedModel,
  onSuggestedQuestionClick,
  colors,
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
        <Text style={styles.emptyIcon}>💰</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Welcome to Octopus Finance AI Advisor
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Ask me anything about personal finance, budgeting, savings, or
          investments.
        </Text>

        <View
          style={[
            styles.suggestionContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.suggestionsTitle, { color: colors.text }]}>
            Try asking:
          </Text>

          {[
            "How can I create a monthly budget?",
            "What are strategies for paying off debt?",
            "How much should I save for retirement?",
            "What is dollar-cost averaging?",
            "How do I improve my credit score?",
          ].map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionBubble,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => {
                // Pass the suggestion text to parent component
                if (typeof onSuggestedQuestionClick === "function") {
                  onSuggestedQuestionClick(suggestion);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionText, { color: colors.text }]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
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
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.role === "user"
                ? [styles.userMessage, { backgroundColor: colors.primary }]
                : [
                    styles.assistantMessage,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ],
            ]}
          >
            {message.role === "assistant" && (
              <View style={styles.assistantHeader}>
                <View style={styles.assistantAvatar}>
                  <ModelIcon model={selectedModel} size={24} />
                </View>
                <Text style={[styles.assistantName, { color: colors.text }]}>
                  {selectedModel.name}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.messageText,
                message.role === "user"
                  ? styles.userMessageText
                  : [styles.assistantMessageText, { color: colors.text }],
              ]}
            >
              {message.content}
            </Text>

            <Text
              style={[
                styles.timestamp,
                message.role === "user"
                  ? styles.userTimestamp
                  : [
                      styles.assistantTimestamp,
                      { color: colors.textSecondary },
                    ],
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Thinking...
            </Text>
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
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    maxWidth: "85%",
    minWidth: "50%",
  },
  userMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  assistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  assistantAvatar: {
    width: 24,
    height: 24,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantName: {
    fontWeight: "600",
    fontSize: 14,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  assistantMessageText: {
    fontWeight: "400",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  assistantTimestamp: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  loadingText: {
    marginLeft: 8,
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
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  suggestionContainer: {
    width: "100%",
    alignItems: "flex-start",
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  suggestionBubble: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
});

export default MessageList;
