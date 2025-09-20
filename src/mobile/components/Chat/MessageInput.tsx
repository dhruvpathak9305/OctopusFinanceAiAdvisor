import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ChatMessageContent } from "../../types/chat";

interface MessageInputProps {
  onSendMessage: (message: string | ChatMessageContent[]) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  supportsImages?: boolean; // Whether the selected model supports image inputs
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
  };
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = "Ask your financial questions...",
  supportsImages = false,
  colors,
}) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      message.split("\n").length > 1
        ? Math.min((message.split("\n").length - 1) * 20, 80)
        : 0;

    Animated.timing(containerHeight, {
      toValue: baseHeight + additionalHeight,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [message, containerHeight]);

  // Pick an image from the device's gallery
  const pickImage = async () => {
    try {
      // Request permission to access the media library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need permission to access your photos to attach images."
        );
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Store the image URI for display and sending
        setSelectedImage(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // Remove the selected image
  const removeImage = () => {
    setSelectedImage(null);
  };

  // Handle send message
  const handleSendMessage = () => {
    if ((!message.trim() && !selectedImage) || isLoading || disabled) {
      return;
    }

    if (selectedImage && supportsImages) {
      // Send message with image for models that support images
      const messageContent: ChatMessageContent[] = [];

      // Add text content if there's a message
      if (message.trim()) {
        messageContent.push({
          type: "text",
          text: message.trim(),
        });
      }

      // Add image content
      messageContent.push({
        type: "image_url",
        image_url: {
          url: selectedImage,
        },
      });

      onSendMessage(messageContent);
    } else {
      // Send text-only message
      onSendMessage(message.trim());
    }

    // Clear the input and selected image
    setMessage("");
    setSelectedImage(null);

    // Dismiss keyboard on send for iOS
    if (Platform.OS === "ios") {
      Keyboard.dismiss();
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
      {/* Selected image preview */}
      {selectedImage && (
        <View
          style={[
            styles.imagePreviewContainer,
            { backgroundColor: colors.card },
          ]}
        >
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={removeImage}
          >
            <Ionicons name="close-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {/* Image picker button - only show if model supports images */}
        {supportsImages && !selectedImage && (
          <TouchableOpacity
            style={[styles.imageButton, { backgroundColor: colors.card }]}
            onPress={pickImage}
            disabled={isLoading || disabled}
          >
            <Ionicons
              name="image"
              size={22}
              color={disabled ? colors.textSecondary : "#FFFFFF"}
              style={{
                backgroundColor: disabled
                  ? colors.textSecondary
                  : colors.primary,
                borderRadius: 4,
                padding: 2,
              }}
            />
          </TouchableOpacity>
        )}

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={1}
          maxLength={1000}
          editable={!disabled}
          blurOnSubmit={false}
          onSubmitEditing={handleSendMessage}
        />

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              ((message.trim() === "" && !selectedImage) ||
                isLoading ||
                disabled) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={
              (message.trim() === "" && !selectedImage) || isLoading || disabled
            }
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
    paddingHorizontal: 8, // Reduced horizontal padding for more chat space
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    position: "relative", // Added for proper button positioning
    zIndex: 1, // Ensure input container is above the FAB
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    zIndex: 2, // Ensure send button is above other elements
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  imageButton: {
    marginRight: 12,
    padding: 4,
  },
  imagePreviewContainer: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 12,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
  },
});

export default MessageInput;
