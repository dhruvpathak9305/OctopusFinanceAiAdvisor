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
import { generateLighterBackground } from "./colors/SubcategoryColorGenerator";

export const getFallbackIconConfig = (
  transactionType: "income" | "expense" | "transfer" | "credit" | "debit"
): FallbackIconConfig => {
  // Normalize transaction type
  const normalizedType = normalizeTransactionType(transactionType);

  // Define base colors for each transaction type
  const baseColors = {
    income: "#10B981", // Green for income
    expense: "#EF4444", // Red for expense
    transfer: "#3B82F6", // Blue for transfer
  };

  // Get the base color for this transaction type
  const baseColor = baseColors[normalizedType] || baseColors.expense;

  switch (normalizedType) {
    case "income":
      return {
        icon: <ArrowDownLeft size={22} color="#FFFFFF" strokeWidth={2.5} />, // White arrow down-left (money coming IN)
        emoji: "💰", // Money bag emoji for income
        borderColor: baseColor, // Green border
        backgroundColor: baseColor, // Green background for icon
        textColor: "#065F46", // Dark green text
      };

    case "expense":
      return {
        icon: <ArrowUpRight size={22} color="#FFFFFF" strokeWidth={2.5} />, // White arrow up-right (money going OUT)
        emoji: "💸", // Money with wings emoji for expenses
        borderColor: baseColor, // Red border
        backgroundColor: baseColor, // Red background for icon
        textColor: "#991B1B", // Dark red text
      };

    case "transfer":
      return {
        icon: <Repeat size={22} color="#FFFFFF" strokeWidth={2.5} />, // White repeat/transfer icon with thicker stroke
        emoji: "🔄", // Refresh symbol for transfers
        borderColor: baseColor, // Blue border
        backgroundColor: baseColor, // Blue background for icon
        textColor: "#1E40AF", // Dark blue text
      };

    default:
      // Default to expense for unknown types
      return {
        icon: <ArrowUpRight size={22} color="#FFFFFF" strokeWidth={2.5} />, // Arrow up-right for expense
        emoji: "💸",
        borderColor: baseColors.expense,
        backgroundColor: baseColors.expense,
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
  // If an icon is explicitly provided from the database, use it
  if (icon && icon.trim() !== "" && icon !== "null") {
    // Check if it's a Lucide icon name (starts with capital letter or is a known icon name)
    // This handles both properly capitalized icon names and lowercase ones
    const isPotentialIconName =
      // Standard capitalized format (e.g., "Utensils")
      (icon.charAt(0) === icon.charAt(0).toUpperCase() &&
        icon.length > 1 &&
        /^[A-Z][a-zA-Z0-9]*$/.test(icon)) ||
      // Lowercase format that might be a valid icon name (e.g., "utensils")
      (/^[a-z][a-zA-Z0-9]*$/.test(icon) && icon.length > 1);

    // Check if it's an emoji
    const isEmoji = icon.length <= 2 || /\p{Emoji}/u.test(icon);

    // If it's either a potential icon name or emoji, don't use fallback
    if (isPotentialIconName || isEmoji) {
      return false;
    }
  }

  // Otherwise fall back to the default transaction type icons
  return true;
};
