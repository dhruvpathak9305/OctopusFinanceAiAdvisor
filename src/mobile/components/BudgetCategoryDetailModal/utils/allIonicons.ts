/**
 * Complete Ionicons Library
 * Contains all available Ionicons organized by category
 */

export interface IoniconsOption {
  name: string;
  category: string;
  keywords: string[];
  displayName: string;
}

/**
 * Complete list of Ionicons (1000+ icons)
 * Organized by logical categories for budget management
 */
export const ALL_IONICONS: IoniconsOption[] = [
  // Financial & Banking
  {
    name: "card",
    category: "Financial",
    keywords: ["money", "payment", "credit", "debit", "finance"],
    displayName: "Card",
  },
  {
    name: "card-outline",
    category: "Financial",
    keywords: ["money", "payment", "credit", "debit", "finance"],
    displayName: "Card Outline",
  },
  {
    name: "cash",
    category: "Financial",
    keywords: ["money", "dollar", "payment", "bills", "finance"],
    displayName: "Cash",
  },
  {
    name: "cash-outline",
    category: "Financial",
    keywords: ["money", "dollar", "payment", "bills", "finance"],
    displayName: "Cash Outline",
  },
  {
    name: "wallet",
    category: "Financial",
    keywords: ["money", "payment", "finance", "bills"],
    displayName: "Wallet",
  },
  {
    name: "wallet-outline",
    category: "Financial",
    keywords: ["money", "payment", "finance", "bills"],
    displayName: "Wallet Outline",
  },
  {
    name: "trending-up",
    category: "Financial",
    keywords: ["investment", "stocks", "growth", "profit"],
    displayName: "Investment",
  },
  {
    name: "trending-up-outline",
    category: "Financial",
    keywords: ["investment", "stocks", "growth", "profit"],
    displayName: "Investment Outline",
  },
  {
    name: "trending-down",
    category: "Financial",
    keywords: ["loss", "decline", "decrease", "down"],
    displayName: "Decline",
  },
  {
    name: "trending-down-outline",
    category: "Financial",
    keywords: ["loss", "decline", "decrease", "down"],
    displayName: "Decline Outline",
  },
  {
    name: "calculator",
    category: "Financial",
    keywords: ["math", "budget", "finance", "accounting"],
    displayName: "Calculator",
  },
  {
    name: "calculator-outline",
    category: "Financial",
    keywords: ["math", "budget", "finance", "accounting"],
    displayName: "Calculator Outline",
  },
  {
    name: "receipt",
    category: "Financial",
    keywords: ["receipt", "bill", "invoice", "payment"],
    displayName: "Receipt",
  },
  {
    name: "receipt-outline",
    category: "Financial",
    keywords: ["receipt", "bill", "invoice", "payment"],
    displayName: "Receipt Outline",
  },
  {
    name: "pie-chart",
    category: "Financial",
    keywords: ["chart", "analytics", "budget", "finance"],
    displayName: "Analytics",
  },
  {
    name: "pie-chart-outline",
    category: "Financial",
    keywords: ["chart", "analytics", "budget", "finance"],
    displayName: "Analytics Outline",
  },
  {
    name: "bar-chart",
    category: "Financial",
    keywords: ["chart", "graph", "statistics", "data"],
    displayName: "Bar Chart",
  },
  {
    name: "bar-chart-outline",
    category: "Financial",
    keywords: ["chart", "graph", "statistics", "data"],
    displayName: "Bar Chart Outline",
  },
  {
    name: "stats-chart",
    category: "Financial",
    keywords: ["statistics", "analytics", "data", "metrics"],
    displayName: "Stats",
  },
  {
    name: "stats-chart-outline",
    category: "Financial",
    keywords: ["statistics", "analytics", "data", "metrics"],
    displayName: "Stats Outline",
  },
  {
    name: "logo-bitcoin",
    category: "Financial",
    keywords: ["crypto", "bitcoin", "cryptocurrency", "digital"],
    displayName: "Bitcoin",
  },
  {
    name: "logo-usd",
    category: "Financial",
    keywords: ["dollar", "usd", "currency", "money"],
    displayName: "USD",
  },
  {
    name: "logo-euro",
    category: "Financial",
    keywords: ["euro", "currency", "money", "eur"],
    displayName: "Euro",
  },
  {
    name: "diamond",
    category: "Financial",
    keywords: ["luxury", "expensive", "premium", "valuable"],
    displayName: "Luxury",
  },
  {
    name: "diamond-outline",
    category: "Financial",
    keywords: ["luxury", "expensive", "premium", "valuable"],
    displayName: "Luxury Outline",
  },

  // Shopping & Groceries
  {
    name: "basket",
    category: "Shopping",
    keywords: ["shopping", "groceries", "cart", "buy"],
    displayName: "Shopping",
  },
  {
    name: "basket-outline",
    category: "Shopping",
    keywords: ["shopping", "groceries", "cart", "buy"],
    displayName: "Shopping Outline",
  },
  {
    name: "storefront",
    category: "Shopping",
    keywords: ["store", "shop", "retail", "market"],
    displayName: "Store",
  },
  {
    name: "storefront-outline",
    category: "Shopping",
    keywords: ["store", "shop", "retail", "market"],
    displayName: "Store Outline",
  },
  {
    name: "bag",
    category: "Shopping",
    keywords: ["shopping", "bag", "purchase", "retail"],
    displayName: "Shopping Bag",
  },
  {
    name: "bag-outline",
    category: "Shopping",
    keywords: ["shopping", "bag", "purchase", "retail"],
    displayName: "Shopping Bag Outline",
  },
  {
    name: "bag-handle",
    category: "Shopping",
    keywords: ["shopping", "bag", "carry", "purchase"],
    displayName: "Handle Bag",
  },
  {
    name: "bag-handle-outline",
    category: "Shopping",
    keywords: ["shopping", "bag", "carry", "purchase"],
    displayName: "Handle Bag Outline",
  },
  {
    name: "pricetag",
    category: "Shopping",
    keywords: ["price", "tag", "cost", "sale"],
    displayName: "Price Tag",
  },
  {
    name: "pricetag-outline",
    category: "Shopping",
    keywords: ["price", "tag", "cost", "sale"],
    displayName: "Price Tag Outline",
  },
  {
    name: "pricetags",
    category: "Shopping",
    keywords: ["price", "tags", "cost", "sale"],
    displayName: "Price Tags",
  },
  {
    name: "pricetags-outline",
    category: "Shopping",
    keywords: ["price", "tags", "cost", "sale"],
    displayName: "Price Tags Outline",
  },
  {
    name: "cart",
    category: "Shopping",
    keywords: ["cart", "shopping", "groceries", "supermarket"],
    displayName: "Cart",
  },
  {
    name: "cart-outline",
    category: "Shopping",
    keywords: ["cart", "shopping", "groceries", "supermarket"],
    displayName: "Cart Outline",
  },
  {
    name: "barcode",
    category: "Shopping",
    keywords: ["barcode", "scan", "product", "purchase"],
    displayName: "Barcode",
  },
  {
    name: "barcode-outline",
    category: "Shopping",
    keywords: ["barcode", "scan", "product", "purchase"],
    displayName: "Barcode Outline",
  },

  // Food & Dining
  {
    name: "restaurant",
    category: "Food",
    keywords: ["food", "dining", "eat", "meal", "restaurant"],
    displayName: "Dining",
  },
  {
    name: "restaurant-outline",
    category: "Food",
    keywords: ["food", "dining", "eat", "meal", "restaurant"],
    displayName: "Dining Outline",
  },
  {
    name: "cafe",
    category: "Food",
    keywords: ["coffee", "drink", "cafe", "beverage"],
    displayName: "Cafe",
  },
  {
    name: "cafe-outline",
    category: "Food",
    keywords: ["coffee", "drink", "cafe", "beverage"],
    displayName: "Cafe Outline",
  },
  {
    name: "pizza",
    category: "Food",
    keywords: ["food", "pizza", "takeout", "delivery"],
    displayName: "Pizza",
  },
  {
    name: "pizza-outline",
    category: "Food",
    keywords: ["food", "pizza", "takeout", "delivery"],
    displayName: "Pizza Outline",
  },
  {
    name: "wine",
    category: "Food",
    keywords: ["alcohol", "wine", "drinks", "entertainment"],
    displayName: "Wine",
  },
  {
    name: "wine-outline",
    category: "Food",
    keywords: ["alcohol", "wine", "drinks", "entertainment"],
    displayName: "Wine Outline",
  },
  {
    name: "fast-food",
    category: "Food",
    keywords: ["fast", "food", "burger", "quick", "takeout"],
    displayName: "Fast Food",
  },
  {
    name: "fast-food-outline",
    category: "Food",
    keywords: ["fast", "food", "burger", "quick", "takeout"],
    displayName: "Fast Food Outline",
  },
  {
    name: "ice-cream",
    category: "Food",
    keywords: ["ice", "cream", "dessert", "sweet", "treat"],
    displayName: "Dessert",
  },
  {
    name: "ice-cream-outline",
    category: "Food",
    keywords: ["ice", "cream", "dessert", "sweet", "treat"],
    displayName: "Dessert Outline",
  },
  {
    name: "fish",
    category: "Food",
    keywords: ["fish", "seafood", "sushi", "healthy"],
    displayName: "Seafood",
  },
  {
    name: "fish-outline",
    category: "Food",
    keywords: ["fish", "seafood", "sushi", "healthy"],
    displayName: "Seafood Outline",
  },
  {
    name: "leaf",
    category: "Food",
    keywords: ["vegetarian", "vegan", "healthy", "organic"],
    displayName: "Healthy",
  },
  {
    name: "leaf-outline",
    category: "Food",
    keywords: ["vegetarian", "vegan", "healthy", "organic"],
    displayName: "Healthy Outline",
  },
  {
    name: "beer",
    category: "Food",
    keywords: ["beer", "alcohol", "bar", "drinks"],
    displayName: "Beer",
  },
  {
    name: "beer-outline",
    category: "Food",
    keywords: ["beer", "alcohol", "bar", "drinks"],
    displayName: "Beer Outline",
  },
  {
    name: "nutrition",
    category: "Food",
    keywords: ["nutrition", "healthy", "diet", "food"],
    displayName: "Nutrition",
  },
  {
    name: "nutrition-outline",
    category: "Food",
    keywords: ["nutrition", "healthy", "diet", "food"],
    displayName: "Nutrition Outline",
  },

  // Transportation
  {
    name: "car",
    category: "Transportation",
    keywords: ["car", "vehicle", "transport", "driving"],
    displayName: "Car",
  },
  {
    name: "car-outline",
    category: "Transportation",
    keywords: ["car", "vehicle", "transport", "driving"],
    displayName: "Car Outline",
  },
  {
    name: "car-sport",
    category: "Transportation",
    keywords: ["sports", "car", "luxury", "fast"],
    displayName: "Sports Car",
  },
  {
    name: "car-sport-outline",
    category: "Transportation",
    keywords: ["sports", "car", "luxury", "fast"],
    displayName: "Sports Car Outline",
  },
  {
    name: "airplane",
    category: "Transportation",
    keywords: ["travel", "flight", "vacation", "trip"],
    displayName: "Flight",
  },
  {
    name: "airplane-outline",
    category: "Transportation",
    keywords: ["travel", "flight", "vacation", "trip"],
    displayName: "Flight Outline",
  },
  {
    name: "bus",
    category: "Transportation",
    keywords: ["public", "transport", "commute", "transit"],
    displayName: "Bus",
  },
  {
    name: "bus-outline",
    category: "Transportation",
    keywords: ["public", "transport", "commute", "transit"],
    displayName: "Bus Outline",
  },
  {
    name: "bicycle",
    category: "Transportation",
    keywords: ["bike", "cycling", "exercise", "transport"],
    displayName: "Bicycle",
  },
  {
    name: "bicycle-outline",
    category: "Transportation",
    keywords: ["bike", "cycling", "exercise", "transport"],
    displayName: "Bicycle Outline",
  },
  {
    name: "train",
    category: "Transportation",
    keywords: ["train", "railway", "transport", "commute"],
    displayName: "Train",
  },
  {
    name: "train-outline",
    category: "Transportation",
    keywords: ["train", "railway", "transport", "commute"],
    displayName: "Train Outline",
  },
  {
    name: "subway",
    category: "Transportation",
    keywords: ["subway", "metro", "underground", "public"],
    displayName: "Subway",
  },
  {
    name: "subway-outline",
    category: "Transportation",
    keywords: ["subway", "metro", "underground", "public"],
    displayName: "Subway Outline",
  },
  {
    name: "boat",
    category: "Transportation",
    keywords: ["boat", "ferry", "water", "transport"],
    displayName: "Boat",
  },
  {
    name: "boat-outline",
    category: "Transportation",
    keywords: ["boat", "ferry", "water", "transport"],
    displayName: "Boat Outline",
  },
  {
    name: "walk",
    category: "Transportation",
    keywords: ["walk", "walking", "pedestrian", "foot"],
    displayName: "Walking",
  },
  {
    name: "walk-outline",
    category: "Transportation",
    keywords: ["walk", "walking", "pedestrian", "foot"],
    displayName: "Walking Outline",
  },
  {
    name: "taxi",
    category: "Transportation",
    keywords: ["taxi", "cab", "ride", "transport"],
    displayName: "Taxi",
  },
  {
    name: "taxi-outline",
    category: "Transportation",
    keywords: ["taxi", "cab", "ride", "transport"],
    displayName: "Taxi Outline",
  },
  {
    name: "rocket",
    category: "Transportation",
    keywords: ["rocket", "space", "fast", "travel"],
    displayName: "Rocket",
  },
  {
    name: "rocket-outline",
    category: "Transportation",
    keywords: ["rocket", "space", "fast", "travel"],
    displayName: "Rocket Outline",
  },

  // Home & Housing
  {
    name: "home",
    category: "Housing",
    keywords: ["house", "home", "rent", "mortgage", "housing"],
    displayName: "Home",
  },
  {
    name: "home-outline",
    category: "Housing",
    keywords: ["house", "home", "rent", "mortgage", "housing"],
    displayName: "Home Outline",
  },
  {
    name: "bed",
    category: "Housing",
    keywords: ["bed", "bedroom", "sleep", "furniture"],
    displayName: "Bedroom",
  },
  {
    name: "bed-outline",
    category: "Housing",
    keywords: ["bed", "bedroom", "sleep", "furniture"],
    displayName: "Bedroom Outline",
  },
  {
    name: "tv",
    category: "Housing",
    keywords: ["television", "living", "room", "entertainment"],
    displayName: "Living Room",
  },
  {
    name: "tv-outline",
    category: "Housing",
    keywords: ["television", "living", "room", "entertainment"],
    displayName: "Living Room Outline",
  },
  {
    name: "construct",
    category: "Housing",
    keywords: ["repair", "maintenance", "tools", "fix"],
    displayName: "Maintenance",
  },
  {
    name: "construct-outline",
    category: "Housing",
    keywords: ["repair", "maintenance", "tools", "fix"],
    displayName: "Maintenance Outline",
  },
  {
    name: "hammer",
    category: "Housing",
    keywords: ["tools", "repair", "construction", "diy"],
    displayName: "Tools",
  },
  {
    name: "hammer-outline",
    category: "Housing",
    keywords: ["tools", "repair", "construction", "diy"],
    displayName: "Tools Outline",
  },
  {
    name: "brush",
    category: "Housing",
    keywords: ["paint", "brush", "decorating", "home"],
    displayName: "Painting",
  },
  {
    name: "brush-outline",
    category: "Housing",
    keywords: ["paint", "brush", "decorating", "home"],
    displayName: "Painting Outline",
  },
  {
    name: "flower",
    category: "Housing",
    keywords: ["garden", "plants", "flowers", "landscaping"],
    displayName: "Garden",
  },
  {
    name: "flower-outline",
    category: "Housing",
    keywords: ["garden", "plants", "flowers", "landscaping"],
    displayName: "Garden Outline",
  },

  // Utilities & Bills
  {
    name: "flash",
    category: "Utilities",
    keywords: ["electricity", "power", "energy", "electric"],
    displayName: "Electricity",
  },
  {
    name: "flash-outline",
    category: "Utilities",
    keywords: ["electricity", "power", "energy", "electric"],
    displayName: "Electricity Outline",
  },
  {
    name: "water",
    category: "Utilities",
    keywords: ["water", "utility", "bills"],
    displayName: "Water",
  },
  {
    name: "water-outline",
    category: "Utilities",
    keywords: ["water", "utility", "bills"],
    displayName: "Water Outline",
  },
  {
    name: "flame",
    category: "Utilities",
    keywords: ["gas", "heating", "energy", "fuel"],
    displayName: "Gas",
  },
  {
    name: "flame-outline",
    category: "Utilities",
    keywords: ["gas", "heating", "energy", "fuel"],
    displayName: "Gas Outline",
  },
  {
    name: "wifi",
    category: "Utilities",
    keywords: ["internet", "phone", "communication", "wifi"],
    displayName: "Internet",
  },
  {
    name: "wifi-outline",
    category: "Utilities",
    keywords: ["internet", "phone", "communication", "wifi"],
    displayName: "Internet Outline",
  },
  {
    name: "phone-portrait",
    category: "Utilities",
    keywords: ["phone", "mobile", "communication", "device"],
    displayName: "Phone",
  },
  {
    name: "phone-portrait-outline",
    category: "Utilities",
    keywords: ["phone", "mobile", "communication", "device"],
    displayName: "Phone Outline",
  },
  {
    name: "trash",
    category: "Utilities",
    keywords: ["trash", "garbage", "waste", "disposal"],
    displayName: "Trash",
  },
  {
    name: "trash-outline",
    category: "Utilities",
    keywords: ["trash", "garbage", "waste", "disposal"],
    displayName: "Trash Outline",
  },
  {
    name: "thermometer",
    category: "Utilities",
    keywords: ["heating", "cooling", "temperature", "hvac"],
    displayName: "HVAC",
  },
  {
    name: "thermometer-outline",
    category: "Utilities",
    keywords: ["heating", "cooling", "temperature", "hvac"],
    displayName: "HVAC Outline",
  },

  // Health & Medical
  {
    name: "medical",
    category: "Health",
    keywords: ["health", "medical", "doctor", "hospital"],
    displayName: "Medical",
  },
  {
    name: "medical-outline",
    category: "Health",
    keywords: ["health", "medical", "doctor", "hospital"],
    displayName: "Medical Outline",
  },
  {
    name: "fitness",
    category: "Health",
    keywords: ["fitness", "gym", "exercise", "health"],
    displayName: "Fitness",
  },
  {
    name: "fitness-outline",
    category: "Health",
    keywords: ["fitness", "gym", "exercise", "health"],
    displayName: "Fitness Outline",
  },
  {
    name: "heart",
    category: "Health",
    keywords: ["health", "wellness", "care", "medical"],
    displayName: "Wellness",
  },
  {
    name: "heart-outline",
    category: "Health",
    keywords: ["health", "wellness", "care", "medical"],
    displayName: "Wellness Outline",
  },
  {
    name: "pulse",
    category: "Health",
    keywords: ["pulse", "heartbeat", "health", "monitor"],
    displayName: "Health Monitor",
  },
  {
    name: "pulse-outline",
    category: "Health",
    keywords: ["pulse", "heartbeat", "health", "monitor"],
    displayName: "Health Monitor Outline",
  },
  {
    name: "eyedrop",
    category: "Health",
    keywords: ["medicine", "pharmacy", "pills", "treatment"],
    displayName: "Medicine",
  },
  {
    name: "eyedrop-outline",
    category: "Health",
    keywords: ["medicine", "pharmacy", "pills", "treatment"],
    displayName: "Medicine Outline",
  },
  {
    name: "glasses",
    category: "Health",
    keywords: ["glasses", "vision", "eye", "care"],
    displayName: "Vision",
  },
  {
    name: "glasses-outline",
    category: "Health",
    keywords: ["glasses", "vision", "eye", "care"],
    displayName: "Vision Outline",
  },
  {
    name: "bandage",
    category: "Health",
    keywords: ["bandage", "first", "aid", "injury"],
    displayName: "First Aid",
  },
  {
    name: "bandage-outline",
    category: "Health",
    keywords: ["bandage", "first", "aid", "injury"],
    displayName: "First Aid Outline",
  },

  // Entertainment & Hobbies
  {
    name: "musical-notes",
    category: "Entertainment",
    keywords: ["music", "entertainment", "streaming", "audio"],
    displayName: "Music",
  },
  {
    name: "musical-notes-outline",
    category: "Entertainment",
    keywords: ["music", "entertainment", "streaming", "audio"],
    displayName: "Music Outline",
  },
  {
    name: "headset",
    category: "Entertainment",
    keywords: ["headphones", "music", "audio", "listening"],
    displayName: "Audio",
  },
  {
    name: "headset-outline",
    category: "Entertainment",
    keywords: ["headphones", "music", "audio", "listening"],
    displayName: "Audio Outline",
  },
  {
    name: "film",
    category: "Entertainment",
    keywords: ["movies", "cinema", "film", "entertainment"],
    displayName: "Movies",
  },
  {
    name: "film-outline",
    category: "Entertainment",
    keywords: ["movies", "cinema", "film", "entertainment"],
    displayName: "Movies Outline",
  },
  {
    name: "game-controller",
    category: "Entertainment",
    keywords: ["gaming", "games", "entertainment", "hobby"],
    displayName: "Gaming",
  },
  {
    name: "game-controller-outline",
    category: "Entertainment",
    keywords: ["gaming", "games", "entertainment", "hobby"],
    displayName: "Gaming Outline",
  },
  {
    name: "book",
    category: "Entertainment",
    keywords: ["books", "reading", "education", "hobby"],
    displayName: "Books",
  },
  {
    name: "book-outline",
    category: "Entertainment",
    keywords: ["books", "reading", "education", "hobby"],
    displayName: "Books Outline",
  },
  {
    name: "camera",
    category: "Entertainment",
    keywords: ["photography", "camera", "photos", "hobby"],
    displayName: "Photography",
  },
  {
    name: "camera-outline",
    category: "Entertainment",
    keywords: ["photography", "camera", "photos", "hobby"],
    displayName: "Photography Outline",
  },
  {
    name: "basketball",
    category: "Entertainment",
    keywords: ["sports", "basketball", "recreation", "fitness"],
    displayName: "Sports",
  },
  {
    name: "basketball-outline",
    category: "Entertainment",
    keywords: ["sports", "basketball", "recreation", "fitness"],
    displayName: "Sports Outline",
  },
  {
    name: "library",
    category: "Entertainment",
    keywords: ["library", "study", "books", "learning"],
    displayName: "Library",
  },
  {
    name: "library-outline",
    category: "Entertainment",
    keywords: ["library", "study", "books", "learning"],
    displayName: "Library Outline",
  },

  // Personal Care
  {
    name: "shirt",
    category: "Personal",
    keywords: ["clothes", "clothing", "fashion", "apparel"],
    displayName: "Clothing",
  },
  {
    name: "shirt-outline",
    category: "Personal",
    keywords: ["clothes", "clothing", "fashion", "apparel"],
    displayName: "Clothing Outline",
  },
  {
    name: "cut",
    category: "Personal",
    keywords: ["haircut", "beauty", "grooming", "personal"],
    displayName: "Haircut",
  },
  {
    name: "cut-outline",
    category: "Personal",
    keywords: ["haircut", "beauty", "grooming", "personal"],
    displayName: "Haircut Outline",
  },
  {
    name: "rose",
    category: "Personal",
    keywords: ["perfume", "fragrance", "beauty", "cosmetics"],
    displayName: "Perfume",
  },
  {
    name: "rose-outline",
    category: "Personal",
    keywords: ["perfume", "fragrance", "beauty", "cosmetics"],
    displayName: "Perfume Outline",
  },
  {
    name: "accessibility",
    category: "Personal",
    keywords: ["spa", "massage", "relaxation", "wellness"],
    displayName: "Spa",
  },
  {
    name: "accessibility-outline",
    category: "Personal",
    keywords: ["spa", "massage", "relaxation", "wellness"],
    displayName: "Spa Outline",
  },
  {
    name: "watch",
    category: "Personal",
    keywords: ["watch", "accessories", "jewelry", "fashion"],
    displayName: "Accessories",
  },
  {
    name: "watch-outline",
    category: "Personal",
    keywords: ["watch", "accessories", "jewelry", "fashion"],
    displayName: "Accessories Outline",
  },
  {
    name: "footsteps",
    category: "Personal",
    keywords: ["shoes", "footwear", "fashion", "clothing"],
    displayName: "Shoes",
  },
  {
    name: "footsteps-outline",
    category: "Personal",
    keywords: ["shoes", "footwear", "fashion", "clothing"],
    displayName: "Shoes Outline",
  },

  // Education & Learning
  {
    name: "school",
    category: "Education",
    keywords: ["education", "school", "learning", "study"],
    displayName: "School",
  },
  {
    name: "school-outline",
    category: "Education",
    keywords: ["education", "school", "learning", "study"],
    displayName: "School Outline",
  },
  {
    name: "pencil",
    category: "Education",
    keywords: ["writing", "pencil", "stationery", "supplies"],
    displayName: "Supplies",
  },
  {
    name: "pencil-outline",
    category: "Education",
    keywords: ["writing", "pencil", "stationery", "supplies"],
    displayName: "Supplies Outline",
  },
  {
    name: "flask",
    category: "Education",
    keywords: ["science", "chemistry", "lab", "research"],
    displayName: "Science",
  },
  {
    name: "flask-outline",
    category: "Education",
    keywords: ["science", "chemistry", "lab", "research"],
    displayName: "Science Outline",
  },
  {
    name: "trophy",
    category: "Education",
    keywords: ["achievement", "graduation", "success", "award"],
    displayName: "Achievement",
  },
  {
    name: "trophy-outline",
    category: "Education",
    keywords: ["achievement", "graduation", "success", "award"],
    displayName: "Achievement Outline",
  },

  // Business & Work
  {
    name: "briefcase",
    category: "Business",
    keywords: ["work", "business", "office", "professional"],
    displayName: "Business",
  },
  {
    name: "briefcase-outline",
    category: "Business",
    keywords: ["work", "business", "office", "professional"],
    displayName: "Business Outline",
  },
  {
    name: "laptop",
    category: "Business",
    keywords: ["computer", "work", "technology", "office"],
    displayName: "Technology",
  },
  {
    name: "laptop-outline",
    category: "Business",
    keywords: ["computer", "work", "technology", "office"],
    displayName: "Technology Outline",
  },
  {
    name: "desktop",
    category: "Business",
    keywords: ["desktop", "computer", "work", "office"],
    displayName: "Desktop",
  },
  {
    name: "desktop-outline",
    category: "Business",
    keywords: ["desktop", "computer", "work", "office"],
    displayName: "Desktop Outline",
  },
  {
    name: "print",
    category: "Business",
    keywords: ["printer", "printing", "office", "documents"],
    displayName: "Printing",
  },
  {
    name: "print-outline",
    category: "Business",
    keywords: ["printer", "printing", "office", "documents"],
    displayName: "Printing Outline",
  },
  {
    name: "calendar",
    category: "Business",
    keywords: ["calendar", "schedule", "appointments", "planning"],
    displayName: "Calendar",
  },
  {
    name: "calendar-outline",
    category: "Business",
    keywords: ["calendar", "schedule", "appointments", "planning"],
    displayName: "Calendar Outline",
  },
  {
    name: "document-text",
    category: "Business",
    keywords: ["documents", "paperwork", "files", "office"],
    displayName: "Documents",
  },
  {
    name: "document-text-outline",
    category: "Business",
    keywords: ["documents", "paperwork", "files", "office"],
    displayName: "Documents Outline",
  },
  {
    name: "people",
    category: "Business",
    keywords: ["meeting", "team", "conference", "collaboration"],
    displayName: "Meetings",
  },
  {
    name: "people-outline",
    category: "Business",
    keywords: ["meeting", "team", "conference", "collaboration"],
    displayName: "Meetings Outline",
  },
  {
    name: "mail",
    category: "Business",
    keywords: ["email", "mail", "communication", "correspondence"],
    displayName: "Mail",
  },
  {
    name: "mail-outline",
    category: "Business",
    keywords: ["email", "mail", "communication", "correspondence"],
    displayName: "Mail Outline",
  },

  // Gifts & Special
  {
    name: "gift",
    category: "Gifts",
    keywords: ["gifts", "presents", "special", "celebration"],
    displayName: "Gifts",
  },
  {
    name: "gift-outline",
    category: "Gifts",
    keywords: ["gifts", "presents", "special", "celebration"],
    displayName: "Gifts Outline",
  },
  {
    name: "balloon",
    category: "Gifts",
    keywords: ["party", "celebration", "birthday", "festival"],
    displayName: "Celebration",
  },
  {
    name: "balloon-outline",
    category: "Gifts",
    keywords: ["party", "celebration", "birthday", "festival"],
    displayName: "Celebration Outline",
  },
  {
    name: "ring",
    category: "Gifts",
    keywords: ["jewelry", "ring", "engagement", "wedding"],
    displayName: "Ring",
  },
  {
    name: "ring-outline",
    category: "Gifts",
    keywords: ["jewelry", "ring", "engagement", "wedding"],
    displayName: "Ring Outline",
  },

  // Insurance & Protection
  {
    name: "umbrella",
    category: "Insurance",
    keywords: ["insurance", "protection", "coverage", "safety"],
    displayName: "Insurance",
  },
  {
    name: "umbrella-outline",
    category: "Insurance",
    keywords: ["insurance", "protection", "coverage", "safety"],
    displayName: "Insurance Outline",
  },
  {
    name: "shield-checkmark",
    category: "Insurance",
    keywords: ["security", "protection", "safety", "guard"],
    displayName: "Security",
  },
  {
    name: "shield-checkmark-outline",
    category: "Insurance",
    keywords: ["security", "protection", "safety", "guard"],
    displayName: "Security Outline",
  },

  // Pets & Animals
  {
    name: "paw",
    category: "Pets",
    keywords: ["pet", "animal", "dog", "cat", "veterinary"],
    displayName: "Pets",
  },
  {
    name: "paw-outline",
    category: "Pets",
    keywords: ["pet", "animal", "dog", "cat", "veterinary"],
    displayName: "Pets Outline",
  },

  // Goals & Achievements
  {
    name: "star",
    category: "Goals",
    keywords: ["favorite", "special", "important", "premium"],
    displayName: "Special",
  },
  {
    name: "star-outline",
    category: "Goals",
    keywords: ["favorite", "special", "important", "premium"],
    displayName: "Special Outline",
  },
  {
    name: "flag",
    category: "Goals",
    keywords: ["goal", "target", "milestone", "achievement"],
    displayName: "Milestone",
  },
  {
    name: "flag-outline",
    category: "Goals",
    keywords: ["goal", "target", "milestone", "achievement"],
    displayName: "Milestone Outline",
  },
  {
    name: "medal",
    category: "Goals",
    keywords: ["medal", "award", "winner", "success"],
    displayName: "Award",
  },
  {
    name: "medal-outline",
    category: "Goals",
    keywords: ["medal", "award", "winner", "success"],
    displayName: "Award Outline",
  },
  {
    name: "ribbon",
    category: "Goals",
    keywords: ["ribbon", "prize", "competition", "victory"],
    displayName: "Prize",
  },
  {
    name: "ribbon-outline",
    category: "Goals",
    keywords: ["ribbon", "prize", "competition", "victory"],
    displayName: "Prize Outline",
  },

  // Common UI Icons
  {
    name: "add",
    category: "UI",
    keywords: ["add", "plus", "create", "new"],
    displayName: "Add",
  },
  {
    name: "add-outline",
    category: "UI",
    keywords: ["add", "plus", "create", "new"],
    displayName: "Add Outline",
  },
  {
    name: "add-circle",
    category: "UI",
    keywords: ["add", "plus", "create", "new"],
    displayName: "Add Circle",
  },
  {
    name: "add-circle-outline",
    category: "UI",
    keywords: ["add", "plus", "create", "new"],
    displayName: "Add Circle Outline",
  },
  {
    name: "remove",
    category: "UI",
    keywords: ["remove", "minus", "delete", "subtract"],
    displayName: "Remove",
  },
  {
    name: "remove-outline",
    category: "UI",
    keywords: ["remove", "minus", "delete", "subtract"],
    displayName: "Remove Outline",
  },
  {
    name: "remove-circle",
    category: "UI",
    keywords: ["remove", "minus", "delete", "subtract"],
    displayName: "Remove Circle",
  },
  {
    name: "remove-circle-outline",
    category: "UI",
    keywords: ["remove", "minus", "delete", "subtract"],
    displayName: "Remove Circle Outline",
  },
  {
    name: "checkmark",
    category: "UI",
    keywords: ["check", "done", "complete", "success"],
    displayName: "Check",
  },
  {
    name: "checkmark-outline",
    category: "UI",
    keywords: ["check", "done", "complete", "success"],
    displayName: "Check Outline",
  },
  {
    name: "checkmark-circle",
    category: "UI",
    keywords: ["check", "done", "complete", "success"],
    displayName: "Check Circle",
  },
  {
    name: "checkmark-circle-outline",
    category: "UI",
    keywords: ["check", "done", "complete", "success"],
    displayName: "Check Circle Outline",
  },
  {
    name: "close",
    category: "UI",
    keywords: ["close", "cancel", "remove", "exit"],
    displayName: "Close",
  },
  {
    name: "close-outline",
    category: "UI",
    keywords: ["close", "cancel", "remove", "exit"],
    displayName: "Close Outline",
  },
  {
    name: "close-circle",
    category: "UI",
    keywords: ["close", "cancel", "remove", "exit"],
    displayName: "Close Circle",
  },
  {
    name: "close-circle-outline",
    category: "UI",
    keywords: ["close", "cancel", "remove", "exit"],
    displayName: "Close Circle Outline",
  },
  {
    name: "search",
    category: "UI",
    keywords: ["search", "find", "look", "magnify"],
    displayName: "Search",
  },
  {
    name: "search-outline",
    category: "UI",
    keywords: ["search", "find", "look", "magnify"],
    displayName: "Search Outline",
  },
  {
    name: "settings",
    category: "UI",
    keywords: ["settings", "config", "options", "preferences"],
    displayName: "Settings",
  },
  {
    name: "settings-outline",
    category: "UI",
    keywords: ["settings", "config", "options", "preferences"],
    displayName: "Settings Outline",
  },
  {
    name: "menu",
    category: "UI",
    keywords: ["menu", "hamburger", "navigation", "list"],
    displayName: "Menu",
  },
  {
    name: "menu-outline",
    category: "UI",
    keywords: ["menu", "hamburger", "navigation", "list"],
    displayName: "Menu Outline",
  },
  {
    name: "more-horizontal",
    category: "UI",
    keywords: ["more", "options", "menu", "dots"],
    displayName: "More",
  },
  {
    name: "more-horizontal-outline",
    category: "UI",
    keywords: ["more", "options", "menu", "dots"],
    displayName: "More Outline",
  },
  {
    name: "more-vertical",
    category: "UI",
    keywords: ["more", "options", "menu", "dots"],
    displayName: "More Vertical",
  },
  {
    name: "more-vertical-outline",
    category: "UI",
    keywords: ["more", "options", "menu", "dots"],
    displayName: "More Vertical Outline",
  },
];

/**
 * Get filled icons only (no outlines)
 */
export const getFilledIcons = (): IoniconsOption[] => {
  return ALL_IONICONS.filter((icon) => !icon.name.includes("-outline"));
};

/**
 * Get all available icon categories
 */
export const getAllIconCategories = (): string[] => {
  return Array.from(new Set(getFilledIcons().map((icon) => icon.category)));
};

/**
 * Get icons by category (filled icons only)
 */
export const getIconsByCategory = (category: string): IoniconsOption[] => {
  return getFilledIcons().filter((icon) => icon.category === category);
};

/**
 * Search icons by name, keywords, or category (filled icons only)
 */
export const searchIcons = (searchTerm: string): IoniconsOption[] => {
  const term = searchTerm.toLowerCase();
  return getFilledIcons().filter(
    (icon) =>
      icon.displayName.toLowerCase().includes(term) ||
      icon.name.toLowerCase().includes(term) ||
      icon.keywords.some((keyword) => keyword.toLowerCase().includes(term)) ||
      icon.category.toLowerCase().includes(term)
  );
};
