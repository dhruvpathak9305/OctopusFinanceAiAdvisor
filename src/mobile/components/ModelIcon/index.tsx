import React from "react";
import { Image, Text, View, StyleSheet, useColorScheme } from "react-native";
import { ChatModel } from "../../types/chat";

interface ModelIconProps {
  model: ChatModel;
  size?: number;
}

/**
 * Component to display model logo or fallback avatar emoji
 * Supports theme-specific logos (light/dark)
 */
const ModelIcon: React.FC<ModelIconProps> = ({ model, size = 24 }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Check if we have theme-specific logo paths
  if (model.id === "grok-4") {
    // Use theme-specific Grok logos based on the current theme
    return (
      <View
        style={[
          styles.logoContainer,
          // Add a contrasting background in light mode for better visibility
          !isDark && {
            backgroundColor: "#222",
            borderRadius: size / 2,
            padding: 2,
          },
        ]}
      >
        <Image
          source={
            isDark
              ? require("../../../../assets/grok-logo-dark.webp")
              : require("../../../../assets/grok-logo-light.webp")
          }
          style={[
            styles.image,
            {
              width: isDark ? size : size - 4,
              height: isDark ? size : size - 4,
              borderRadius: size / 2,
            },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }
  // DeepSeek model with theme-specific logos
  else if (model.id === "deepseek-chat") {
    return (
      <Image
        source={
          isDark
            ? require("../../../../assets/deepseek-logo-dark.webp")
            : require("../../../../assets/deepseek-logo-light.webp")
        }
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        resizeMode="contain"
      />
    );
  }
  // Gemini model with colorful gradient-style emoji
  else if (model.id === "gemini-2.0-flash") {
    return (
      <View
        style={[
          styles.logoContainer,
          styles.geminiContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isDark ? "#1a73e8" : "#4285f4", // Google blue
          },
        ]}
      >
        <Text
          style={[
            styles.emojiText,
            {
              fontSize: size * 0.6,
              color: "white",
              fontWeight: "600",
            },
          ]}
        >
          ✨
        </Text>
      </View>
    );
  }
  // Llama model with Meta-branded styling
  else if (model.id === "llama-3.3-8b") {
    return (
      <View
        style={[
          styles.logoContainer,
          styles.llamaContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isDark ? "#0866FF" : "#1877F2", // Meta blue
          },
        ]}
      >
        <Text
          style={[
            styles.emojiText,
            {
              fontSize: size * 0.6,
              color: "white",
              fontWeight: "600",
            },
          ]}
        >
          🦙
        </Text>
      </View>
    );
  }
  // If model has a logo path, use the image
  else if (model.logoPath) {
    return (
      <Image
        source={{ uri: model.logoPath }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        resizeMode="contain"
      />
    );
  }

  // Fallback to avatar emoji
  return (
    <Text style={[styles.emojiText, { fontSize: size * 0.8 }]}>
      {model.avatarUrl || "🤖"}
    </Text>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 12,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  geminiContainer: {
    shadowColor: "#4285f4",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  llamaContainer: {
    shadowColor: "#1877F2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emojiText: {
    textAlign: "center",
  },
});

export default ModelIcon;
