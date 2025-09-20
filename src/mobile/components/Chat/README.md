# Chat Interface Component

A modern, theme-consistent chat interface for the Octopus Finance AI Advisor.

## Overview

This component provides a complete chat interface for users to interact with various AI models. It's designed to match the existing Octopus Finance application theme and provides a seamless experience for asking financial questions.

## Features

- 💬 Real-time chat with multiple AI models
- 🤖 Model selection dropdown
- 📱 Responsive design for mobile and desktop
- 🎨 Theme-consistent styling (light/dark mode)
- ⚡ Streaming responses for natural typing effect
- 🛡️ Error boundaries for graceful error handling
- 💾 Persistent chat within a session

## Structure

```
components/
  Chat/
    ChatContainer.tsx       # Main container component
    MessageList.tsx         # Displays chat messages
    MessageInput.tsx        # Text input for user messages
    ModelSelector.tsx       # Model selection dropdown
    ErrorBoundary.tsx       # Error handling component
    index.ts                # Exports all components
```

## Usage

### Basic Integration

```tsx
import { ChatContainer } from "../../components/Chat";
import { useTheme } from "../../../../contexts/ThemeContext";

const MyComponent = () => {
  const { isDark } = useTheme();

  // Define colors based on theme
  const colors = isDark
    ? {
        background: "#0B1426",
        card: "#1F2937",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        primary: "#10B981",
        surface: "#1F2937",
        error: "#EF4444",
      }
    : {
        background: "#FFFFFF",
        card: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        primary: "#10B981",
        surface: "#F3F4F6",
        error: "#EF4444",
      };

  return (
    <View style={styles.container}>
      <ChatContainer colors={colors} isDark={isDark} />
    </View>
  );
};
```

## Customization

The chat interface is fully customizable through the `colors` prop, which allows you to match any theme.

## Dependencies

- React Native
- Expo Vector Icons (for UI elements)

## Error Handling

The chat interface comes with built-in error boundaries that gracefully handle errors in the chat UI. If you want to provide a custom fallback UI, you can pass it as a prop:

```tsx
import { ErrorBoundary } from "../../components/Chat";

<ErrorBoundary
  fallback={<MyCustomErrorUI />}
  onReset={handleReset}
  isDark={isDark}
>
  <ChatContainer colors={colors} isDark={isDark} />
</ErrorBoundary>;
```

## Models

The chat interface supports multiple AI models defined in the `aiService.ts` file. You can add or remove models by modifying the `CHAT_MODELS` array.

## Extending

To add new features, like saving chat history or adding attachments:

1. Update the types in `src/mobile/types/chat.ts`
2. Modify the hook in `src/mobile/hooks/useChat.ts`
3. Add UI components to the relevant component files
