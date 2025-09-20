import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  shouldUseFallbackIcon,
  getFallbackIconConfig,
} from "../../../../utils/fallbackIcons";
import { renderIconFromName } from "../../../../utils/subcategoryIcons";
import { generateLighterBackground } from "../../../../utils/colors/SubcategoryColorGenerator";

interface TransactionItemProps {
  /**
   * The transaction data
   */
  transaction: {
    id: string | number;
    title?: string;
    description?: string;
    name?: string;
    account?: string;
    source?: string;
    source_account_name?: string;
    type: "income" | "expense" | "transfer";
    amount: number | string;
    category?: string;
    category_name?: string;
    subcategory?: string;
    subcategory_name?: string;
    note?: string;
    icon?: string | null;
    date?: string;
    tags?: string[];
    is_recurring?: boolean;
    isRecurring?: boolean;
    // Additional fields for category/subcategory display
    subcategory_color?: string | null;
    category_ring_color?: string | null;
    category_bg_color?: string | null;
  };

  /**
   * Callback for when the transaction is pressed
   */
  onPress?: () => void;

  /**
   * Callback for when the edit button is pressed
   */
  onEdit?: () => void;

  /**
   * Callback for when the delete button is pressed
   */
  onDelete?: () => void;

  /**
   * Whether the transaction is selected (for multi-select mode)
   */
  isSelected?: boolean;

  /**
   * Theme colors for styling
   */
  colors: {
    text: string;
    textSecondary: string;
    card: string;
    border: string;
    background?: string;
  };

  /**
   * Optional style overrides
   */
  style?: any;
}

/**
 * Shared TransactionItem component that can be used in both the Recent Transactions and Transactions pages
 */
const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onEdit,
  onDelete,
  isSelected = false,
  colors,
  style,
}) => {
  // Format helpers
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Math.abs(numValue));
  };

  // Get transaction properties with consistent fallbacks
  const title =
    transaction.title ||
    transaction.name ||
    transaction.description ||
    "Transaction";
  const source =
    transaction.account ||
    transaction.source ||
    transaction.source_account_name ||
    "Unknown Account";
  const category = transaction.category || transaction.category_name;
  const subcategory = transaction.subcategory || transaction.subcategory_name;
  const note = transaction.note || transaction.description;

  // Get tags from transaction if they exist, otherwise create from category/subcategory
  const tags =
    transaction.tags ||
    ([
      category,
      subcategory,
      transaction.is_recurring ? "Recurring" : undefined,
    ].filter(Boolean) as string[]);

  // Transaction color based on type
  const getTransactionColor = (type: string) => {
    switch (type) {
      case "income":
        return "#10B981";
      case "expense":
        return "#EF4444";
      case "transfer":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  // Get tag color based on category
  const getTagColor = (tag: string) => {
    // First check if we have database colors available
    if (
      tag?.toLowerCase() === category?.toLowerCase() &&
      transaction.category_ring_color
    ) {
      // This is the main category and we have its color from DB
      const color = transaction.category_ring_color;
      return {
        background: `${color}20`, // Add transparency
        text: color,
      };
    } else if (
      tag?.toLowerCase() === subcategory?.toLowerCase() &&
      transaction.subcategory_color
    ) {
      // This is the subcategory and we have its color from DB
      const color = transaction.subcategory_color;
      return {
        background: `${color}20`, // Add transparency
        text: color,
      };
    }

    // If we have category color but not subcategory color, use category color for subcategory
    if (
      category?.toLowerCase() &&
      subcategory?.toLowerCase() === tag?.toLowerCase() &&
      transaction.category_ring_color
    ) {
      const color = transaction.category_ring_color;
      return {
        background: `${color}20`, // Add transparency
        text: color,
      };
    }

    // If we don't have database colors, fall back to the category-based coloring
    if (category?.toLowerCase() === "needs") {
      // All subcategories under "Needs" should use the Needs color scheme
      return { background: "#EF444420", text: "#EF4444" }; // Red for needs and its subcategories
    } else if (category?.toLowerCase() === "wants") {
      // All subcategories under "Wants" should use the Wants color scheme
      return { background: "#F59E0B20", text: "#F59E0B" }; // Orange for wants and its subcategories
    } else if (
      category?.toLowerCase() === "save" ||
      category?.toLowerCase() === "savings"
    ) {
      // All subcategories under "Save" should use the Save color scheme
      return { background: "#10B98120", text: "#10B981" }; // Green for savings and its subcategories
    }

    // Final fallback to tag-based coloring
    switch (tag?.toLowerCase()) {
      case "needs":
        return { background: "#EF444420", text: "#EF4444" }; // Red for essential needs
      case "wants":
        return { background: "#F59E0B20", text: "#F59E0B" }; // Orange for wants
      case "save":
      case "savings":
        return { background: "#10B98120", text: "#10B981" }; // Green for savings
      case "food":
        // If Food is under Needs, use Needs color
        return category?.toLowerCase() === "needs"
          ? { background: "#EF444420", text: "#EF4444" }
          : { background: "#EF444420", text: "#EF4444" }; // Now using red for food to match Needs
      case "bills":
      case "utilities":
        // If Bills is under Needs, use Needs color
        return category?.toLowerCase() === "needs"
          ? { background: "#EF444420", text: "#EF4444" }
          : { background: "#3B82F620", text: "#3B82F6" }; // Blue for bills
      case "entertainment":
        // If Entertainment is under Wants, use Wants color
        return category?.toLowerCase() === "wants"
          ? { background: "#F59E0B20", text: "#F59E0B" }
          : { background: "#F59E0B20", text: "#F59E0B" }; // Now using orange for entertainment to match Wants
      case "recurring":
        return { background: "#4F46E520", text: "#4F46E5" }; // Indigo for recurring
      default:
        return { background: "#6B728020", text: "#6B7280" }; // Gray for others
    }
  };

  // Check if we should use a fallback icon
  const useFallback = shouldUseFallbackIcon(
    category,
    subcategory,
    transaction.icon
  );

  return (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        { backgroundColor: colors.card, borderColor: colors.border },
        isSelected && styles.transactionItemSelected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.transactionLeft}>
        {/* Transaction Icon */}
        <View
          style={[
            styles.transactionIcon,
            useFallback
              ? {
                  borderWidth: 2,
                  borderColor: getFallbackIconConfig(transaction.type)
                    .borderColor,
                  backgroundColor: generateLighterBackground(
                    getFallbackIconConfig(transaction.type).borderColor,
                    20
                  ),
                }
              : {
                  backgroundColor: generateLighterBackground(
                    transaction.subcategory_color ||
                      transaction.category_ring_color ||
                      getTransactionColor(transaction.type),
                    20
                  ),
                },
          ]}
        >
          {useFallback ? (
            // Use fallback icons based on transaction type
            getFallbackIconConfig(transaction.type).icon
          ) : transaction.icon && typeof transaction.icon === "string" ? (
            // Check if it's a string that could be a Lucide icon name
            // This handles both capitalized and lowercase icon names
            /^[a-zA-Z][a-zA-Z0-9]*$/.test(transaction.icon) ? (
              // Render the Lucide icon component - capitalize first letter if needed
              renderIconFromName(
                // Ensure first letter is capitalized for component lookup
                transaction.icon.charAt(0).toUpperCase() +
                  transaction.icon.slice(1),
                22,
                // Use subcategory color if available, otherwise use category color or default
                transaction.subcategory_color ||
                  transaction.category_ring_color ||
                  getTransactionColor(transaction.type)
              )
            ) : (
              // If it's not a valid icon name format, render as text/emoji
              <Text
                style={[
                  styles.transactionIconText,
                  {
                    color:
                      transaction.subcategory_color ||
                      transaction.category_ring_color ||
                      getTransactionColor(transaction.type),
                  },
                ]}
              >
                {transaction.icon}
              </Text>
            )
          ) : (
            // Fallback for null/undefined icon
            <Text
              style={[
                styles.transactionIconText,
                { color: getTransactionColor(transaction.type) },
              ]}
            >
              📄
            </Text>
          )}
        </View>

        {/* Transaction Details */}
        <View style={styles.transactionInfo}>
          <Text
            style={[styles.transactionTitle, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>

          <Text
            style={[styles.transactionSource, { color: colors.textSecondary }]}
          >
            {source}
          </Text>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <View style={styles.transactionTags}>
              {tags.slice(0, 2).map((tag, index) => {
                if (!tag) return null;
                const tagColors = getTagColor(tag);
                return (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      { backgroundColor: tagColors.background },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: tagColors.text }]}>
                      {tag}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Note/Description */}
          {note && (
            <Text
              style={[styles.transactionNote, { color: colors.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {note}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.transactionRight}>
        {/* Amount */}
        <Text
          style={[
            styles.transactionAmount,
            { color: getTransactionColor(transaction.type) },
          ]}
        >
          {transaction.type === "expense" ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </Text>

        {/* Action Buttons */}
        <View style={styles.transactionActions}>
          {transaction.is_recurring && (
            <View style={styles.recurringIndicator}>
              <Text style={styles.recurringText}>🔄</Text>
            </View>
          )}

          {/* Edit Button */}
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Text
                style={[styles.actionIcon, { color: colors.textSecondary }]}
              >
                ✏️
              </Text>
            </TouchableOpacity>
          )}

          {/* Delete Button */}
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Text
                style={[styles.actionIcon, { color: colors.textSecondary }]}
              >
                🗑️
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  transactionItemSelected: {
    backgroundColor: "#1F2937",
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionSource: {
    fontSize: 12,
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 11,
    lineHeight: 16,
  },
  transactionTags: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  transactionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recurringIndicator: {
    alignItems: "center",
    marginRight: 2,
  },
  recurringText: {
    fontSize: 10,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
});

export default TransactionItem;
