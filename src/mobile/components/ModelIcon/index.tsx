import React from 'react';
import { Image, Text, View, StyleSheet, useColorScheme } from 'react-native';
import { ChatModel } from '../../types/chat';

interface ModelIconProps {
  model: ChatModel;
  size?: number;
}

/**
 * Component to display model logo or fallback avatar emoji
 */
const ModelIcon: React.FC<ModelIconProps> = ({ model, size = 24 }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // If model has a logo path, use the image
  if (model.logoPath) {
    return (
      <Image
        source={{ uri: model.logoPath }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
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
    textAlign: 'center',
  }
});

export default ModelIcon;
