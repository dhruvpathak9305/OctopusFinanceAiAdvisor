import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Minus,
  Plus,
  ArrowLeftRight,
  CircleDollarSign,
  CreditCard,
  Repeat,
  PlusCircle,
  MinusCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react-native";

export interface FallbackIconConfig {
  icon: React.ReactNode;
  emoji: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * Get fallback icon configuration based on transaction type
 * Used when categories and subcategories are not present during CSV parsing
 */
export const getFallbackIconConfig = (
  transactionType: "income" | "expense" | "transfer" | "credit" | "debit"
): FallbackIconConfig => {
  // Normalize transaction type
  const normalizedType = normalizeTransactionType(transactionType);

  switch (normalizedType) {
    case "income":
      return {
        icon: <ArrowUpRight size={22} color="#FFFFFF" strokeWidth={2.5} />, // White arrow up-right with thicker stroke
        emoji: "💰", // Money bag emoji for income
        borderColor: "#10B981", // Green border
        backgroundColor: "#10B981", // Green background for icon
        textColor: "#065F46", // Dark green text
      };

    case "expense":
      return {
        icon: <ArrowDownLeft size={22} color="#FFFFFF" strokeWidth={2.5} />, // White arrow down-left with thicker stroke
        emoji: "💸", // Money with wings emoji for expenses
        borderColor: "#EF4444", // Red border
        backgroundColor: "#EF4444", // Red background for icon
        textColor: "#991B1B", // Dark red text
      };

    case "transfer":
      return {
        icon: <Repeat size={22} color="#FFFFFF" strokeWidth={2.5} />, // White repeat/transfer icon with thicker stroke
        emoji: "🔄", // Refresh symbol for transfers
        borderColor: "#3B82F6", // Blue border
        backgroundColor: "#3B82F6", // Blue background for icon
        textColor: "#1E40AF", // Dark blue text
      };

    default:
      // Default to expense for unknown types
      return {
        icon: <ArrowDownLeft size={22} color="#FFFFFF" strokeWidth={2.5} />,
        emoji: "💸",
        borderColor: "#EF4444",
        backgroundColor: "#EF4444",
        textColor: "#991B1B",
      };
  }
};

/**
 * Normalize transaction type to standard format
 */
const normalizeTransactionType = (
  type: "income" | "expense" | "transfer" | "credit" | "debit"
): "income" | "expense" | "transfer" => {
  switch (type.toLowerCase()) {
    case "credit":
    case "income":
      return "income";
    case "debit":
    case "expense":
      return "expense";
    case "transfer":
      return "transfer";
    default:
      return "expense";
  }
};

/**
 * Get fallback icon emoji for simple use cases
 */
export const getFallbackIconEmoji = (
  transactionType: "income" | "expense" | "transfer" | "credit" | "debit"
): string => {
  return getFallbackIconConfig(transactionType).emoji;
};

/**
 * Get fallback border color for transaction cards
 */
export const getFallbackBorderColor = (
  transactionType: "income" | "expense" | "transfer" | "credit" | "debit"
): string => {
  return getFallbackIconConfig(transactionType).borderColor;
};

/**
 * Check if a transaction has valid category/subcategory information
 */
export const hasValidCategoryInfo = (
  category?: string | null,
  subcategory?: string | null
): boolean => {
  return !!(
    category &&
    category.trim() !== "" &&
    category.toLowerCase() !== "uncategorized" &&
    category.toLowerCase() !== "unknown" &&
    category.toLowerCase() !== "general" &&
    // Only consider it valid if it's a meaningful category name
    category.length > 4 && // Exclude very short categories like "Food"
    !category.toLowerCase().includes("misc") &&
    !category.toLowerCase().includes("other")
  );
};

/**
 * Determine if fallback icons should be used
 */
export const shouldUseFallbackIcon = (
  category?: string | null,
  subcategory?: string | null,
  icon?: string | null
): boolean => {
  // Use fallback if no meaningful icon is provided and no valid category info
  const hasNoMeaningfulIcon = !icon || icon === "receipt" || icon === "📄";
  return hasNoMeaningfulIcon && !hasValidCategoryInfo(category, subcategory);
};
