import { BudgetSubcategory, SortMode } from "../types";

/**
 * Modern icon system using Ionicons
 */
export interface IconOption {
  name: string;
  category: string;
  keywords: string[];
  displayName: string;
}

export const AVAILABLE_ICONS: IconOption[] = [
  // Financial & Banking
  {
    name: "card",
    category: "Financial",
    keywords: ["money", "payment", "credit", "debit", "finance"],
    displayName: "Card",
  },
  {
    name: "cash",
    category: "Financial",
    keywords: ["money", "dollar", "payment", "bills", "finance"],
    displayName: "Cash",
  },
  {
    name: "wallet",
    category: "Financial",
    keywords: ["money", "payment", "finance", "bills"],
    displayName: "Wallet",
  },
  {
    name: "trending-up",
    category: "Financial",
    keywords: ["investment", "stocks", "growth", "profit"],
    displayName: "Investment",
  },
  {
    name: "calculator",
    category: "Financial",
    keywords: ["math", "budget", "finance", "accounting"],
    displayName: "Calculator",
  },
  {
    name: "bank",
    category: "Financial",
    keywords: ["bank", "banking", "account", "finance"],
    displayName: "Bank",
  },
  {
    name: "logo-bitcoin",
    category: "Financial",
    keywords: ["crypto", "bitcoin", "cryptocurrency", "digital"],
    displayName: "Crypto",
  },
  {
    name: "receipt",
    category: "Financial",
    keywords: ["receipt", "bill", "invoice", "payment"],
    displayName: "Receipt",
  },
  {
    name: "pie-chart",
    category: "Financial",
    keywords: ["chart", "analytics", "budget", "finance"],
    displayName: "Analytics",
  },
  {
    name: "diamond",
    category: "Financial",
    keywords: ["luxury", "expensive", "premium", "valuable"],
    displayName: "Luxury",
  },

  // Shopping & Groceries
  {
    name: "basket",
    category: "Shopping",
    keywords: ["shopping", "groceries", "cart", "buy"],
    displayName: "Shopping",
  },
  {
    name: "storefront",
    category: "Shopping",
    keywords: ["store", "shop", "retail", "market"],
    displayName: "Store",
  },
  {
    name: "bag",
    category: "Shopping",
    keywords: ["shopping", "bag", "purchase", "retail"],
    displayName: "Shopping Bag",
  },
  {
    name: "pricetag",
    category: "Shopping",
    keywords: ["price", "tag", "cost", "sale"],
    displayName: "Price Tag",
  },
  {
    name: "cart",
    category: "Shopping",
    keywords: ["cart", "shopping", "groceries", "supermarket"],
    displayName: "Cart",
  },
  {
    name: "barcode",
    category: "Shopping",
    keywords: ["barcode", "scan", "product", "purchase"],
    displayName: "Barcode",
  },

  // Food & Dining
  {
    name: "restaurant",
    category: "Food",
    keywords: ["food", "dining", "eat", "meal", "restaurant"],
    displayName: "Dining",
  },
  {
    name: "cafe",
    category: "Food",
    keywords: ["coffee", "drink", "cafe", "beverage"],
    displayName: "Cafe",
  },
  {
    name: "pizza",
    category: "Food",
    keywords: ["food", "pizza", "takeout", "delivery"],
    displayName: "Pizza",
  },
  {
    name: "wine",
    category: "Food",
    keywords: ["alcohol", "wine", "drinks", "entertainment"],
    displayName: "Wine",
  },
  {
    name: "fast-food",
    category: "Food",
    keywords: ["fast", "food", "burger", "quick", "takeout"],
    displayName: "Fast Food",
  },
  {
    name: "ice-cream",
    category: "Food",
    keywords: ["ice", "cream", "dessert", "sweet", "treat"],
    displayName: "Dessert",
  },
  {
    name: "fish",
    category: "Food",
    keywords: ["fish", "seafood", "sushi", "healthy"],
    displayName: "Seafood",
  },
  {
    name: "leaf",
    category: "Food",
    keywords: ["vegetarian", "vegan", "healthy", "organic"],
    displayName: "Healthy",
  },
  {
    name: "beer",
    category: "Food",
    keywords: ["beer", "alcohol", "bar", "drinks"],
    displayName: "Beer",
  },

  // Transportation
  {
    name: "car",
    category: "Transportation",
    keywords: ["car", "vehicle", "transport", "driving"],
    displayName: "Car",
  },
  {
    name: "airplane",
    category: "Transportation",
    keywords: ["travel", "flight", "vacation", "trip"],
    displayName: "Flight",
  },
  {
    name: "bus",
    category: "Transportation",
    keywords: ["public", "transport", "commute", "transit"],
    displayName: "Bus",
  },
  {
    name: "bicycle",
    category: "Transportation",
    keywords: ["bike", "cycling", "exercise", "transport"],
    displayName: "Bicycle",
  },
  {
    name: "train",
    category: "Transportation",
    keywords: ["train", "railway", "transport", "commute"],
    displayName: "Train",
  },
  {
    name: "subway",
    category: "Transportation",
    keywords: ["subway", "metro", "underground", "public"],
    displayName: "Subway",
  },
  {
    name: "boat",
    category: "Transportation",
    keywords: ["boat", "ferry", "water", "transport"],
    displayName: "Boat",
  },
  {
    name: "walk",
    category: "Transportation",
    keywords: ["walk", "walking", "pedestrian", "foot"],
    displayName: "Walking",
  },
  {
    name: "car-sport",
    category: "Transportation",
    keywords: ["sports", "car", "luxury", "fast"],
    displayName: "Sports Car",
  },
  {
    name: "taxi",
    category: "Transportation",
    keywords: ["taxi", "cab", "ride", "transport"],
    displayName: "Taxi",
  },
  {
    name: "rocket",
    category: "Transportation",
    keywords: ["rocket", "space", "fast", "travel"],
    displayName: "Rocket",
  },

  // Housing & Home
  {
    name: "home",
    category: "Housing",
    keywords: ["house", "home", "rent", "mortgage", "housing"],
    displayName: "Home",
  },
  {
    name: "bed",
    category: "Housing",
    keywords: ["bed", "bedroom", "sleep", "furniture"],
    displayName: "Bedroom",
  },
  {
    name: "tv",
    category: "Housing",
    keywords: ["television", "living", "room", "entertainment"],
    displayName: "Living Room",
  },
  {
    name: "restaurant",
    category: "Housing",
    keywords: ["kitchen", "cooking", "dining", "food"],
    displayName: "Kitchen",
  },
  {
    name: "construct",
    category: "Housing",
    keywords: ["repair", "maintenance", "tools", "fix"],
    displayName: "Maintenance",
  },
  {
    name: "hammer",
    category: "Housing",
    keywords: ["tools", "repair", "construction", "diy"],
    displayName: "Tools",
  },
  {
    name: "brush",
    category: "Housing",
    keywords: ["paint", "brush", "decorating", "home"],
    displayName: "Painting",
  },
  {
    name: "flower",
    category: "Housing",
    keywords: ["garden", "plants", "flowers", "landscaping"],
    displayName: "Garden",
  },

  // Utilities & Bills
  {
    name: "flash",
    category: "Utilities",
    keywords: ["electricity", "power", "energy", "electric"],
    displayName: "Electricity",
  },
  {
    name: "water",
    category: "Utilities",
    keywords: ["water", "utility", "bills"],
    displayName: "Water",
  },
  {
    name: "flame",
    category: "Utilities",
    keywords: ["gas", "heating", "energy", "fuel"],
    displayName: "Gas",
  },
  {
    name: "wifi",
    category: "Utilities",
    keywords: ["internet", "phone", "communication", "wifi"],
    displayName: "Internet",
  },
  {
    name: "phone-portrait",
    category: "Utilities",
    keywords: ["phone", "mobile", "communication", "device"],
    displayName: "Phone",
  },
  {
    name: "trash",
    category: "Utilities",
    keywords: ["trash", "garbage", "waste", "disposal"],
    displayName: "Trash",
  },
  {
    name: "thermometer",
    category: "Utilities",
    keywords: ["heating", "cooling", "temperature", "hvac"],
    displayName: "HVAC",
  },

  // Health & Medical
  {
    name: "medical",
    category: "Health",
    keywords: ["health", "medical", "doctor", "hospital"],
    displayName: "Medical",
  },
  {
    name: "fitness",
    category: "Health",
    keywords: ["fitness", "gym", "exercise", "health"],
    displayName: "Fitness",
  },
  {
    name: "heart",
    category: "Health",
    keywords: ["health", "wellness", "care", "medical"],
    displayName: "Wellness",
  },
  {
    name: "pulse",
    category: "Health",
    keywords: ["pulse", "heartbeat", "health", "monitor"],
    displayName: "Health Monitor",
  },
  {
    name: "eyedrop",
    category: "Health",
    keywords: ["medicine", "pharmacy", "pills", "treatment"],
    displayName: "Medicine",
  },
  {
    name: "glasses",
    category: "Health",
    keywords: ["glasses", "vision", "eye", "care"],
    displayName: "Vision",
  },
  {
    name: "bandage",
    category: "Health",
    keywords: ["bandage", "first", "aid", "injury"],
    displayName: "First Aid",
  },

  // Entertainment & Hobbies
  {
    name: "musical-notes",
    category: "Entertainment",
    keywords: ["music", "entertainment", "streaming", "audio"],
    displayName: "Music",
  },
  {
    name: "headset",
    category: "Entertainment",
    keywords: ["headphones", "music", "audio", "listening"],
    displayName: "Audio",
  },
  {
    name: "film",
    category: "Entertainment",
    keywords: ["movies", "cinema", "film", "entertainment"],
    displayName: "Movies",
  },
  {
    name: "game-controller",
    category: "Entertainment",
    keywords: ["gaming", "games", "entertainment", "hobby"],
    displayName: "Gaming",
  },
  {
    name: "book",
    category: "Entertainment",
    keywords: ["books", "reading", "education", "hobby"],
    displayName: "Books",
  },
  {
    name: "camera",
    category: "Entertainment",
    keywords: ["photography", "camera", "photos", "hobby"],
    displayName: "Photography",
  },
  {
    name: "brush",
    category: "Entertainment",
    keywords: ["art", "painting", "creative", "hobby"],
    displayName: "Art",
  },
  {
    name: "musical-note",
    category: "Entertainment",
    keywords: ["instrument", "music", "playing", "hobby"],
    displayName: "Instrument",
  },
  {
    name: "basketball",
    category: "Entertainment",
    keywords: ["sports", "basketball", "recreation", "fitness"],
    displayName: "Sports",
  },
  {
    name: "library",
    category: "Entertainment",
    keywords: ["library", "study", "books", "learning"],
    displayName: "Library",
  },

  // Personal Care & Beauty
  {
    name: "shirt",
    category: "Personal",
    keywords: ["clothes", "clothing", "fashion", "apparel"],
    displayName: "Clothing",
  },
  {
    name: "cut",
    category: "Personal",
    keywords: ["haircut", "beauty", "grooming", "personal"],
    displayName: "Haircut",
  },
  {
    name: "rose",
    category: "Personal",
    keywords: ["perfume", "fragrance", "beauty", "cosmetics"],
    displayName: "Perfume",
  },
  {
    name: "accessibility",
    category: "Personal",
    keywords: ["spa", "massage", "relaxation", "wellness"],
    displayName: "Spa",
  },
  {
    name: "watch",
    category: "Personal",
    keywords: ["watch", "accessories", "jewelry", "fashion"],
    displayName: "Accessories",
  },
  {
    name: "footsteps",
    category: "Personal",
    keywords: ["shoes", "footwear", "fashion", "clothing"],
    displayName: "Shoes",
  },

  // Education & Learning
  {
    name: "school",
    category: "Education",
    keywords: ["education", "school", "learning", "study"],
    displayName: "School",
  },
  {
    name: "library",
    category: "Education",
    keywords: ["university", "college", "higher", "education"],
    displayName: "University",
  },
  {
    name: "pencil",
    category: "Education",
    keywords: ["writing", "pencil", "stationery", "supplies"],
    displayName: "Supplies",
  },
  {
    name: "flask",
    category: "Education",
    keywords: ["science", "chemistry", "lab", "research"],
    displayName: "Science",
  },
  {
    name: "trophy",
    category: "Education",
    keywords: ["achievement", "graduation", "success", "award"],
    displayName: "Achievement",
  },

  // Business & Work
  {
    name: "briefcase",
    category: "Business",
    keywords: ["work", "business", "office", "professional"],
    displayName: "Business",
  },
  {
    name: "laptop",
    category: "Business",
    keywords: ["computer", "work", "technology", "office"],
    displayName: "Technology",
  },
  {
    name: "desktop",
    category: "Business",
    keywords: ["desktop", "computer", "work", "office"],
    displayName: "Desktop",
  },
  {
    name: "print",
    category: "Business",
    keywords: ["printer", "printing", "office", "documents"],
    displayName: "Printing",
  },
  {
    name: "calendar",
    category: "Business",
    keywords: ["calendar", "schedule", "appointments", "planning"],
    displayName: "Calendar",
  },
  {
    name: "document-text",
    category: "Business",
    keywords: ["documents", "paperwork", "files", "office"],
    displayName: "Documents",
  },
  {
    name: "people",
    category: "Business",
    keywords: ["meeting", "team", "conference", "collaboration"],
    displayName: "Meetings",
  },
  {
    name: "mail",
    category: "Business",
    keywords: ["email", "mail", "communication", "correspondence"],
    displayName: "Mail",
  },

  // Gifts & Special Occasions
  {
    name: "gift",
    category: "Gifts",
    keywords: ["gifts", "presents", "special", "celebration"],
    displayName: "Gifts",
  },
  {
    name: "balloon",
    category: "Gifts",
    keywords: ["party", "celebration", "birthday", "festival"],
    displayName: "Celebration",
  },
  {
    name: "flower",
    category: "Gifts",
    keywords: ["flowers", "romantic", "anniversary", "special"],
    displayName: "Flowers",
  },
  {
    name: "heart",
    category: "Gifts",
    keywords: ["love", "valentine", "romantic", "relationship"],
    displayName: "Romance",
  },
  {
    name: "diamond",
    category: "Gifts",
    keywords: ["jewelry", "ring", "engagement", "wedding"],
    displayName: "Jewelry",
  },

  // Insurance & Protection
  {
    name: "umbrella",
    category: "Insurance",
    keywords: ["insurance", "protection", "coverage", "safety"],
    displayName: "Insurance",
  },
  {
    name: "shield-checkmark",
    category: "Insurance",
    keywords: ["security", "protection", "safety", "guard"],
    displayName: "Security",
  },
  {
    name: "car",
    category: "Insurance",
    keywords: ["auto", "car", "vehicle", "insurance"],
    displayName: "Auto Insurance",
  },
  {
    name: "home",
    category: "Insurance",
    keywords: ["home", "house", "property", "insurance"],
    displayName: "Home Insurance",
  },
  {
    name: "medical",
    category: "Insurance",
    keywords: ["health", "medical", "coverage", "insurance"],
    displayName: "Health Insurance",
  },

  // Pets & Animals
  {
    name: "paw",
    category: "Pets",
    keywords: ["pet", "animal", "dog", "cat", "veterinary"],
    displayName: "Pets",
  },
  {
    name: "heart",
    category: "Pets",
    keywords: ["veterinary", "vet", "animal", "care"],
    displayName: "Vet Care",
  },
  {
    name: "restaurant",
    category: "Pets",
    keywords: ["pet", "food", "feeding", "supplies"],
    displayName: "Pet Food",
  },
  {
    name: "happy",
    category: "Pets",
    keywords: ["grooming", "pet", "care", "beauty"],
    displayName: "Pet Grooming",
  },

  // Goals & Achievements
  {
    name: "trophy",
    category: "Goals",
    keywords: ["achievement", "goal", "success", "reward"],
    displayName: "Achievement",
  },
  {
    name: "star",
    category: "Goals",
    keywords: ["favorite", "special", "important", "premium"],
    displayName: "Special",
  },
  {
    name: "flag",
    category: "Goals",
    keywords: ["goal", "target", "milestone", "achievement"],
    displayName: "Milestone",
  },
  {
    name: "medal",
    category: "Goals",
    keywords: ["medal", "award", "winner", "success"],
    displayName: "Award",
  },
  {
    name: "ribbon",
    category: "Goals",
    keywords: ["ribbon", "prize", "competition", "victory"],
    displayName: "Prize",
  },
];

/**
 * Legacy emoji icons for backward compatibility
 */
export const EMOJI_ICONS = [
  "💰",
  "🛒",
  "🍽️",
  "🚗",
  "🏠",
  "💊",
  "🎓",
  "✈️",
  "🎬",
  "👕",
  "🧮",
  "⚡",
  "🎯",
  "💳",
  "🎵",
  "🏆",
  "🏥",
  "🚌",
  "🎮",
  "📚",
  "☕",
  "💡",
  "🎨",
  "🏃",
];

/**
 * Color palette interface
 */
export interface ColorOption {
  hex: string;
  name: string;
  category: string;
}

/**
 * Expanded color palette with categories
 */
export const AVAILABLE_COLORS: ColorOption[] = [
  // Primary Colors
  { hex: "#EF4444", name: "Red", category: "Primary" },
  { hex: "#F97316", name: "Orange", category: "Primary" },
  { hex: "#F59E0B", name: "Amber", category: "Primary" },
  { hex: "#EAB308", name: "Yellow", category: "Primary" },
  { hex: "#84CC16", name: "Lime", category: "Primary" },
  { hex: "#10B981", name: "Green", category: "Primary" },
  { hex: "#14B8A6", name: "Teal", category: "Primary" },
  { hex: "#06B6D4", name: "Cyan", category: "Primary" },

  // Cool Colors
  { hex: "#0EA5E9", name: "Sky", category: "Cool" },
  { hex: "#3B82F6", name: "Blue", category: "Cool" },
  { hex: "#6366F1", name: "Indigo", category: "Cool" },
  { hex: "#8B5CF6", name: "Purple", category: "Cool" },
  { hex: "#A855F7", name: "Violet", category: "Cool" },
  { hex: "#C084FC", name: "Lavender", category: "Cool" },
  { hex: "#EC4899", name: "Pink", category: "Cool" },
  { hex: "#F472B6", name: "Rose", category: "Cool" },

  // Warm Colors
  { hex: "#DC2626", name: "Deep Red", category: "Warm" },
  { hex: "#EA580C", name: "Deep Orange", category: "Warm" },
  { hex: "#D97706", name: "Deep Amber", category: "Warm" },
  { hex: "#CA8A04", name: "Deep Yellow", category: "Warm" },
  { hex: "#BE185D", name: "Deep Pink", category: "Warm" },
  { hex: "#7C2D12", name: "Brown", category: "Warm" },

  // Neutral Colors
  { hex: "#374151", name: "Gray", category: "Neutral" },
  { hex: "#6B7280", name: "Silver", category: "Neutral" },
  { hex: "#1F2937", name: "Charcoal", category: "Neutral" },
  { hex: "#111827", name: "Black", category: "Neutral" },

  // Pastel Colors
  { hex: "#FEE2E2", name: "Soft Red", category: "Pastel" },
  { hex: "#FED7AA", name: "Soft Orange", category: "Pastel" },
  { hex: "#FEF3C7", name: "Soft Yellow", category: "Pastel" },
  { hex: "#D1FAE5", name: "Soft Green", category: "Pastel" },
  { hex: "#DBEAFE", name: "Soft Blue", category: "Pastel" },
  { hex: "#E0E7FF", name: "Soft Indigo", category: "Pastel" },
  { hex: "#EDE9FE", name: "Soft Purple", category: "Pastel" },
  { hex: "#FCE7F3", name: "Soft Pink", category: "Pastel" },
];

/**
 * Legacy color array for backward compatibility
 */
export const LEGACY_COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#A855F7",
];

/**
 * Get color categories for organization
 */
export const getColorCategories = (): string[] => {
  return Array.from(new Set(AVAILABLE_COLORS.map((color) => color.category)));
};

/**
 * Get colors by category
 */
export const getColorsByCategory = (category: string): ColorOption[] => {
  return AVAILABLE_COLORS.filter((color) => color.category === category);
};

/**
 * Sort options configuration
 */
export const SORT_OPTIONS = [
  { key: "name" as SortMode, label: "Name", icon: "text" },
  { key: "amount" as SortMode, label: "Amount", icon: "cash" },
  { key: "percentage" as SortMode, label: "Percentage", icon: "pie-chart" },
  { key: "remaining" as SortMode, label: "Remaining", icon: "trending-up" },
];

/**
 * Sort subcategories based on selected mode
 */
export const sortSubcategories = (
  subcategories: BudgetSubcategory[],
  sortMode: SortMode
): BudgetSubcategory[] => {
  return [...subcategories].sort((a, b) => {
    switch (sortMode) {
      case "name":
        return a.name.localeCompare(b.name);

      case "amount":
        return (b.current_spend || 0) - (a.current_spend || 0);

      case "percentage":
        const percentA =
          a.amount > 0 ? ((a.current_spend || 0) / a.amount) * 100 : 0;
        const percentB =
          b.amount > 0 ? ((b.current_spend || 0) / b.amount) * 100 : 0;
        return percentB - percentA;

      case "remaining":
        const remainingA = a.amount - (a.current_spend || 0);
        const remainingB = b.amount - (b.current_spend || 0);
        return remainingA - remainingB;

      default:
        return 0;
    }
  });
};

/**
 * Create a new subcategory with default values
 */
export const createNewSubcategory = (
  name: string,
  budgetAmount: number,
  spent: number = 0,
  icon: string = AVAILABLE_ICONS[0]?.name || "card",
  color: string = AVAILABLE_COLORS[0]?.hex || "#10B981"
): Omit<BudgetSubcategory, "id"> => ({
  category_id: "",
  name: name.trim(),
  amount: budgetAmount,
  color,
  icon,
  current_spend: spent,
});

/**
 * Update existing subcategory
 */
export const updateSubcategory = (
  subcategory: BudgetSubcategory,
  updates: Partial<Omit<BudgetSubcategory, "id">>
): BudgetSubcategory => ({
  ...subcategory,
  ...updates,
  name: updates.name ? updates.name.trim() : subcategory.name,
});

/**
 * Generate unique ID for new subcategory
 */
export const generateSubcategoryId = (): string => {
  return `subcategory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if subcategory is over budget
 */
export const isOverBudget = (subcategory: BudgetSubcategory): boolean => {
  return (subcategory.current_spend || 0) > subcategory.amount;
};

/**
 * Get subcategory status
 */
export const getSubcategoryStatus = (
  subcategory: BudgetSubcategory
): "safe" | "warning" | "danger" | "over" => {
  const percentage =
    subcategory.amount > 0
      ? ((subcategory.current_spend || 0) / subcategory.amount) * 100
      : 0;

  if (percentage > 100) return "over";
  if (percentage > 90) return "danger";
  if (percentage > 70) return "warning";
  return "safe";
};

/**
 * Mock subcategories data for development
 */
export const getMockSubcategories = (): BudgetSubcategory[] => [
  {
    id: "1",
    category_id: "1",
    name: "Rent/Mortgage",
    amount: 1500.0,
    current_spend: 1500.0,
    color: "#10B981",
    icon: "🏠",
  },
  {
    id: "2",
    category_id: "1",
    name: "Utilities",
    amount: 200.0,
    current_spend: 145.75,
    color: "#3B82F6",
    icon: "⚡",
  },
  {
    id: "3",
    category_id: "1",
    name: "Groceries",
    amount: 400.0,
    current_spend: 130.5,
    color: "#F59E0B",
    icon: "🛒",
  },
  {
    id: "4",
    category_id: "1",
    name: "Transportation",
    amount: 150.0,
    current_spend: 89.25,
    color: "#8B5CF6",
    icon: "🚗",
  },
  {
    id: "5",
    category_id: "1",
    name: "Insurance",
    amount: 300.0,
    current_spend: 0,
    color: "#EC4899",
    icon: "🛡️",
  },
  {
    id: "6",
    category_id: "1",
    name: "Healthcare",
    amount: 200.0,
    current_spend: 45.0,
    color: "#06B6D4",
    icon: "🏥",
  },
];
