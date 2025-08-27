import React, { useState } from "react";
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
import {
  AVAILABLE_COLORS,
  ColorOption,
  getColorCategories,
  getColorsByCategory,
} from "../../utils/subcategoryHelpers";

interface ColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (colorHex: string) => void;
  currentColor: string;
  colors: ThemeColors;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  visible,
  onClose,
  onSelectColor,
  currentColor,
  colors,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const colorCategories = ["All", ...getColorCategories()];

  // Filter colors based on search and category
  const filteredColors = AVAILABLE_COLORS.filter((colorOption) => {
    const matchesCategory =
      selectedCategory === "All" || colorOption.category === selectedCategory;
    const matchesSearch =
      searchText === "" ||
      colorOption.name.toLowerCase().includes(searchText.toLowerCase()) ||
      colorOption.category.toLowerCase().includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSelectColor = (colorHex: string) => {
    onSelectColor(colorHex);
    onClose();
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
            Choose Color
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
            placeholder="Search colors (e.g., blue, red, green)..."
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
            contentContainerStyle={styles.categoryFilterContent}
          >
            {colorCategories.map((category) => (
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

        {/* Color Grid */}
        <ScrollView style={styles.content}>
          <View style={styles.colorGrid}>
            {filteredColors.map((colorOption) => (
              <TouchableOpacity
                key={colorOption.hex}
                style={[
                  styles.colorButton,
                  { backgroundColor: colorOption.hex },
                  currentColor === colorOption.hex && styles.selectedColor,
                ]}
                onPress={() => handleSelectColor(colorOption.hex)}
                activeOpacity={0.8}
              >
                {currentColor === colorOption.hex && (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
                <Text
                  style={styles.colorLabel}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {colorOption.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
    marginBottom: 20,
  },
  colorLabel: {
    position: "absolute",
    bottom: -18,
    left: -10,
    right: -10,
    fontSize: 7,
    fontWeight: "500",
    textAlign: "center",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textTransform: "uppercase",
    letterSpacing: 0.2,
    lineHeight: 8,
  },
  selectedColor: {
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
