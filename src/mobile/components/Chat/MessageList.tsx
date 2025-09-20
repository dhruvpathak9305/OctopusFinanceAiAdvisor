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
              styles.messageRow,
              message.role === "user" ? styles.userMessageRow : styles.assistantMessageRow,
            ]}
          >
            {/* Assistant Avatar (only for assistant messages) */}
            {message.role === "assistant" && (
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <ModelIcon model={selectedModel} size={24} />
                </View>
              </View>
            )}
            
            {/* Message Bubble */}
            <View 
              style={[
                styles.messageBubble,
                message.role === "user" 
                  ? [styles.userBubble, { backgroundColor: '#10B981' }] // Green for user
                  : [styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              {/* Assistant name (only shown for assistant messages) */}
              {message.role === "assistant" && (
                <Text style={[styles.assistantName, { color: colors.primary }]}>
                  {selectedModel.name}
                </Text>
              )}
              
              {/* Message content */}
              <Text
                style={[
                  styles.messageText,
                  message.role === "user"
                    ? styles.userMessageText
                    : [styles.assistantMessageText, { color: colors.text }],
                ]}
              >
                {typeof message.content === 'string' ? message.content : 'Unsupported message format'}
              </Text>
              
              {/* Timestamp */}
              <Text
                style={[
                  styles.timestamp,
                  message.role === "user"
                    ? styles.userTimestamp
                    : [styles.assistantTimestamp, { color: colors.textSecondary }],
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
            
            {/* Empty space on user messages to balance avatar */}
            {message.role === "user" && <View style={styles.avatarContainer} />}
          </View>
        ))}

        {isLoading && (
          <View style={styles.messageRow}>
            {/* Assistant avatar for loading state */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ModelIcon model={selectedModel} size={24} />
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary, marginLeft: 8 }]}>
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
    padding: 16,
    paddingBottom: 24,
  },
  // WhatsApp style message layout
  messageRow: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingVertical: 2,
    width: '100%',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  // Avatar styling
  avatarContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Bubble styling
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 1,
  },
  userBubble: {
    borderTopRightRadius: 2, // Creates the "tail" effect
    marginLeft: 8,
  },
  assistantBubble: {
    borderTopLeftRadius: 2, // Creates the "tail" effect
    borderWidth: 1,
    marginRight: 8,
  },
  // Text styling within bubbles
  assistantName: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 4,
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
    marginTop: 4,
    alignSelf: "flex-end",
    paddingLeft: 8,
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  assistantTimestamp: {
    opacity: 0.7,
  },
  // Keep original styles for backward compatibility
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
