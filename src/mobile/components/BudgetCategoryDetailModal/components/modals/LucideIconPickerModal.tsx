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
import { renderIconFromName } from "../../../../../../utils/subcategoryIcons";

interface LucideIconPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  currentIcon: string;
  colors: ThemeColors;
}

export const LucideIconPickerModal: React.FC<LucideIconPickerModalProps> = ({
  visible,
  onClose,
  onSelectIcon,
  currentIcon,
  colors,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Available Lucide React icons organized by category
  const availableLucideIcons = [
    // Financial Icons
    { name: "DollarSign", category: "FINANCIAL", displayName: "Dollar Sign" },
    { name: "CreditCard", category: "FINANCIAL", displayName: "Credit Card" },
    { name: "PiggyBank", category: "FINANCIAL", displayName: "Piggy Bank" },
    { name: "Wallet", category: "FINANCIAL", displayName: "Wallet" },
    { name: "Coins", category: "FINANCIAL", displayName: "Coins" },
    { name: "Banknote", category: "FINANCIAL", displayName: "Banknote" },
    { name: "TrendingUp", category: "FINANCIAL", displayName: "Trending Up" },
    { name: "Receipt", category: "FINANCIAL", displayName: "Receipt" },
    { name: "Building", category: "FINANCIAL", displayName: "Building" },
    { name: "Percent", category: "FINANCIAL", displayName: "Percentage" },

    // Home & Utilities
    { name: "Home", category: "HOME", displayName: "Home" },
    { name: "Zap", category: "HOME", displayName: "Electricity" },
    { name: "Droplets", category: "HOME", displayName: "Water" },
    { name: "Wifi", category: "HOME", displayName: "WiFi" },
    { name: "Smartphone", category: "HOME", displayName: "Phone" },
    { name: "Tv", category: "HOME", displayName: "TV" },

    // Food & Dining
    { name: "Utensils", category: "FOOD", displayName: "Dining" },
    { name: "Coffee", category: "FOOD", displayName: "Coffee" },
    { name: "Pizza", category: "FOOD", displayName: "Pizza" },
    { name: "ShoppingCart", category: "FOOD", displayName: "Groceries" },
    { name: "Apple", category: "FOOD", displayName: "Healthy Food" },
    { name: "Wine", category: "FOOD", displayName: "Alcohol" },
    { name: "ChefHat", category: "FOOD", displayName: "Cooking" },
    { name: "IceCream", category: "FOOD", displayName: "Desserts" },

    // Transportation
    { name: "Car", category: "TRANSPORT", displayName: "Car" },
    { name: "Bus", category: "TRANSPORT", displayName: "Bus" },
    { name: "Train", category: "TRANSPORT", displayName: "Train" },
    { name: "Plane", category: "TRANSPORT", displayName: "Flight" },
    { name: "Bike", category: "TRANSPORT", displayName: "Bicycle" },
    { name: "Fuel", category: "TRANSPORT", displayName: "Fuel" },

    // Health & Personal
    { name: "Stethoscope", category: "HEALTH", displayName: "Healthcare" },
    { name: "Heart", category: "HEALTH", displayName: "Health" },
    { name: "Activity", category: "HEALTH", displayName: "Fitness" },
    { name: "Dumbbell", category: "HEALTH", displayName: "Gym" },
    { name: "Pill", category: "HEALTH", displayName: "Medicine" },
    { name: "Baby", category: "HEALTH", displayName: "Baby Care" },
    { name: "Scissors", category: "HEALTH", displayName: "Personal Care" },

    // Entertainment & Shopping
    { name: "Film", category: "ENTERTAINMENT", displayName: "Movies" },
    { name: "Music", category: "ENTERTAINMENT", displayName: "Music" },
    { name: "Gamepad", category: "ENTERTAINMENT", displayName: "Gaming" },
    { name: "Camera", category: "ENTERTAINMENT", displayName: "Photography" },
    { name: "Headphones", category: "ENTERTAINMENT", displayName: "Audio" },
    { name: "ShoppingBag", category: "SHOPPING", displayName: "Shopping" },
    { name: "Gift", category: "SHOPPING", displayName: "Gifts" },
    { name: "Shirt", category: "SHOPPING", displayName: "Clothing" },

    // Education & Work
    { name: "GraduationCap", category: "EDUCATION", displayName: "Education" },
    { name: "Book", category: "EDUCATION", displayName: "Books" },
    { name: "Briefcase", category: "EDUCATION", displayName: "Work" },
    { name: "Laptop", category: "EDUCATION", displayName: "Computer" },
    { name: "Users", category: "EDUCATION", displayName: "Team" },

    // Other
    { name: "Shield", category: "OTHER", displayName: "Insurance" },
    { name: "Target", category: "OTHER", displayName: "Goals" },
    { name: "Calendar", category: "OTHER", displayName: "Calendar" },
    { name: "Wrench", category: "OTHER", displayName: "Maintenance" },
    { name: "Globe", category: "OTHER", displayName: "Travel" },
    { name: "Star", category: "OTHER", displayName: "Favorite" },
    { name: "Clock", category: "OTHER", displayName: "Time" },
    { name: "MapPin", category: "OTHER", displayName: "Location" },
    { name: "Bell", category: "OTHER", displayName: "Notifications" },
    { name: "Settings", category: "OTHER", displayName: "Settings" },
    { name: "Lock", category: "OTHER", displayName: "Security" },
    { name: "Key", category: "OTHER", displayName: "Access" },
  ];

  const iconCategories = [
    { key: "ALL", label: "All" },
    { key: "FINANCIAL", label: "Money" },
    { key: "HOME", label: "Home" },
    { key: "FOOD", label: "Food" },
    { key: "TRANSPORT", label: "Travel" },
    { key: "HEALTH", label: "Health" },
    { key: "ENTERTAINMENT", label: "Fun" },
    { key: "SHOPPING", label: "Shop" },
    { key: "EDUCATION", label: "Learn" },
    { key: "OTHER", label: "Other" },
  ];

  // Filter icons based on search and category
  const filteredIcons = availableLucideIcons
    .filter((iconOption) => {
      const matchesCategory =
        selectedCategory === "ALL" || iconOption.category === selectedCategory;
      const matchesSearch =
        searchText === "" ||
        iconOption.name.toLowerCase().includes(searchText.toLowerCase()) ||
        iconOption.displayName.toLowerCase().includes(searchText.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const handleSelectIcon = (iconName: string) => {
    onSelectIcon(iconName);
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Choose Icon
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Search icons (e.g., food, car, home)..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {iconCategories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedCategory === category.key
                      ? colors.primary
                      : colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color:
                      selectedCategory === category.key
                        ? "#FFFFFF"
                        : colors.text,
                  },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Icons Grid */}
        <ScrollView style={styles.content}>
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
                {renderIconFromName(
                  iconOption.name,
                  22,
                  currentIcon === iconOption.name ? "#FFFFFF" : colors.text
                )}
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
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {iconOption.displayName}
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
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    maxHeight: 50,
  },
  categoriesContent: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  categoryButtonText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  iconButton: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginBottom: 12,
  },
  iconLabel: {
    fontSize: 9,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
});
