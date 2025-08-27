import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "../../hooks/useThemeColors";
import { getFilledIcons, getAllIconCategories } from "../../utils/allIonicons";

interface IconPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  currentIcon: string;
  colors: ThemeColors;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  visible,
  onClose,
  onSelectIcon,
  currentIcon,
  colors,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customIconName, setCustomIconName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [emojiInput, setEmojiInput] = useState("");
  const [showEmojiInput, setShowEmojiInput] = useState(false);

  const iconCategories = ["All", ...getAllIconCategories(), "Custom", "Emoji"];

  // Filter icons based on search and category (only filled icons)
  const filteredIcons =
    selectedCategory === "Custom" || selectedCategory === "Emoji"
      ? [] // Don't show predefined icons when Custom or Emoji is selected
      : getFilledIcons().filter((iconOption) => {
          const matchesCategory =
            selectedCategory === "All" ||
            iconOption.category === selectedCategory;
          const matchesSearch =
            searchText === "" ||
            iconOption.displayName
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            iconOption.keywords.some((keyword) =>
              keyword.toLowerCase().includes(searchText.toLowerCase())
            ) ||
            iconOption.category
              .toLowerCase()
              .includes(searchText.toLowerCase());

          return matchesCategory && matchesSearch;
        });

  // Check if custom icon is valid
  const isValidCustomIcon = (iconName: string): boolean => {
    return iconName.length > 0 && /^[a-z-]+$/.test(iconName);
  };

  // Check if emoji is valid
  const isValidEmoji = (emoji: string): boolean => {
    return (
      emoji.length > 0 &&
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
        emoji
      )
    );
  };

  // Handle category changes
  useEffect(() => {
    setShowCustomInput(selectedCategory === "Custom");
    setShowEmojiInput(selectedCategory === "Emoji");
    if (selectedCategory === "Custom") {
      setCustomIconName("");
    }
    if (selectedCategory === "Emoji") {
      setEmojiInput("");
    }
  }, [selectedCategory]);

  const handleSelectIcon = (iconName: string) => {
    onSelectIcon(iconName);
    onClose();
  };

  const handleCustomIconSelect = () => {
    if (isValidCustomIcon(customIconName)) {
      handleSelectIcon(customIconName);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Choose Icon
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search & Category Filters */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search icons (e.g., food, car, home)..."
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
            contentContainerStyle={styles.categoryFilterContent}
          >
            {iconCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                  {
                    backgroundColor:
                      selectedCategory === category
                        ? colors.primary
                        : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category &&
                      styles.categoryButtonTextActive,
                    {
                      color:
                        selectedCategory === category ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {selectedCategory === "Custom" ? (
            <View style={styles.customIconContainer}>
              <Text style={[styles.customIconTitle, { color: colors.text }]}>
                Enter Custom Icon Name
              </Text>
              <Text
                style={[
                  styles.customIconSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Use any Ionicon name (e.g., home-outline, heart-circle,
                star-outline)
              </Text>

              <TextInput
                style={[
                  styles.customIconInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={customIconName}
                onChangeText={setCustomIconName}
                placeholder="e.g., home-outline, heart-circle..."
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Live Preview */}
              {customIconName && (
                <View style={styles.customIconPreview}>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>
                    Preview:
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.previewButton,
                      {
                        backgroundColor: isValidCustomIcon(customIconName)
                          ? colors.primary
                          : colors.error,
                        borderColor: isValidCustomIcon(customIconName)
                          ? colors.primary
                          : colors.error,
                      },
                    ]}
                    onPress={handleCustomIconSelect}
                    disabled={!isValidCustomIcon(customIconName)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={customIconName as any}
                      size={28}
                      color="#FFFFFF"
                    />
                    <Text style={styles.previewLabel}>
                      {customIconName || "Enter name"}
                    </Text>
                  </TouchableOpacity>

                  {customIconName && !isValidCustomIcon(customIconName) && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      Invalid icon name format
                    </Text>
                  )}

                  {isValidCustomIcon(customIconName) && (
                    <TouchableOpacity
                      style={[
                        styles.useButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleCustomIconSelect}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.useButtonText}>Use This Icon</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ) : selectedCategory === "Emoji" ? (
            <View style={styles.customIconContainer}>
              <Text style={[styles.customIconTitle, { color: colors.text }]}>
                Enter Emoji
              </Text>
              <Text
                style={[
                  styles.customIconSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Use your keyboard to add any emoji (🏠 🍕 🚗 💰)
              </Text>

              <TextInput
                style={[
                  styles.customIconInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={emojiInput}
                onChangeText={setEmojiInput}
                placeholder="Tap here and use emoji keyboard..."
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                multiline={false}
                maxLength={4}
              />

              {/* Live Preview */}
              {emojiInput && (
                <View style={styles.customIconPreview}>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>
                    Preview:
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.previewButton,
                      {
                        backgroundColor: isValidEmoji(emojiInput)
                          ? colors.primary
                          : colors.error,
                        borderColor: isValidEmoji(emojiInput)
                          ? colors.primary
                          : colors.error,
                      },
                    ]}
                    onPress={() => {
                      if (isValidEmoji(emojiInput)) {
                        handleSelectIcon(emojiInput);
                      }
                    }}
                    disabled={!isValidEmoji(emojiInput)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.previewLabel}>{emojiInput || "?"}</Text>
                  </TouchableOpacity>

                  {emojiInput && !isValidEmoji(emojiInput) && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      Please enter a valid emoji
                    </Text>
                  )}

                  {isValidEmoji(emojiInput) && (
                    <TouchableOpacity
                      style={[
                        styles.useButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={() => handleSelectIcon(emojiInput)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.useButtonText}>Use This Emoji</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.iconGrid}>
              {filteredIcons.map((iconOption) => (
                <TouchableOpacity
                  key={iconOption.name}
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor:
                        currentIcon === iconOption.name
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        currentIcon === iconOption.name
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => handleSelectIcon(iconOption.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={iconOption.name as any}
                    size={22}
                    color={
                      currentIcon === iconOption.name ? "#FFFFFF" : colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.iconLabel,
                      {
                        color:
                          currentIcon === iconOption.name
                            ? "#FFFFFF"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {iconOption.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
  },
  categoryFilter: {
    flexGrow: 0,
  },
  categoryFilterContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  categoryButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryButtonTextActive: {
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  iconButton: {
    width: "18%", // 5 icons per row with proper spacing
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 6,
    fontWeight: "500",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.1,
    lineHeight: 8,
    marginTop: 2,
  },
  // Custom Icon Styles
  customIconContainer: {
    padding: 20,
    alignItems: "center",
  },
  customIconTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  customIconSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  customIconInput: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  customIconPreview: {
    alignItems: "center",
    width: "100%",
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  previewButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 4,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  useButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  useButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
