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
      <Image
        source={
          isDark
            ? require("../../../../assets/grok-logo-dark.webp")
            : require("../../../../assets/grok-logo-light.webp")
        }
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        resizeMode="contain"
      />
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
  emojiText: {
    textAlign: "center",
  },
});

export default ModelIcon;
