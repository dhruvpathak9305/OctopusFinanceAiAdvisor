import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import FixedDepositsModal from "../../components/modals/FixedDepositsModal";
import {
  fetchFormattedCategoriesForUI,
  initializeDefaultCategories,
  createSampleNetWorthEntries,
} from "../../../../services/netWorthService";
import { fetchFormattedCategoriesForUILocal } from "../../../../services/netWorthServiceLocal";
import { useUnifiedAuth } from "../../../../contexts/UnifiedAuthContext";
import { useSubscription } from "../../../../contexts/SubscriptionContext";
import networkMonitor from "../../../../services/sync/networkMonitor";
import { getQueryCache, generateCacheKey } from "../../../../services/repositories/queryCache";

// Import the new Add Net Worth Entry Modal
import AddNetWorthEntryModal from "../../components/NetWorth/AddNetWorthEntryModal";

// Utility function to format currency values
const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const isNegative = value < 0;
  const sign = isNegative ? "-" : "";

  if (absValue >= 10000000) {
    // 1 crore and above
    return `${sign}₹${(absValue / 10000000).toFixed(1)}Cr`;
  } else if (absValue >= 100000) {
    // 1 lakh and above
    return `${sign}₹${(absValue / 100000).toFixed(1)}L`;
  } else if (absValue >= 1000) {
    // 1 thousand and above
    return `${sign}₹${(absValue / 1000).toFixed(1)}K`;
  } else {
    return `${sign}₹${absValue.toFixed(0)}`;
  }
};

interface AssetItem {
  id: string;
  name: string;
  category: string;
  value: number;
  percentage: number;
  icon: string;
  color: string;
  items?: number;
  date?: string;
}

interface AssetCategory {
  id: string;
  name: string;
  value: number;
  percentage: number;
  items: number;
  icon: string;
  color: string;
  assets: AssetItem[];
  // Optional properties for system cards
  isSystemCard?: boolean;
  subcategories?: any[];
  bank?: string;
  emi?: number;
  remaining?: number;
  category?: string;
}

const MobileNetWorth: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const route = useRoute();
  const { isDemo } = useDemoMode();
  const { user } = useUnifiedAuth();
  const { isPremium } = useSubscription();
  const isOnline = networkMonitor.isCurrentlyOnline();
  const userId = user?.id || 'offline_user';
  
  // Fixed Deposits Modal state
  const [showFixedDepositsModal, setShowFixedDepositsModal] = useState(false);
  // Track which overlay was open before FD modal, so we can restore it on close
  const [previousOverlay, setPreviousOverlay] = useState<
    "asset_subcategory" | "liability_subcategory" | null
  >(null);

  const openFixedDepositsModal = () => {
    // Record current overlay
    if (showAssetSubcategoryModal) {
      setPreviousOverlay("asset_subcategory");
    } else if (showSubcategoryModal) {
      setPreviousOverlay("liability_subcategory");
    } else {
      setPreviousOverlay(null);
    }

    // Close any other overlays first
    setShowAssetSubcategoryModal(false);
    setShowSubcategoryModal(false);
    setShowPopupMenu(false);

    // Open FD modal after overlays are closed
    setTimeout(() => setShowFixedDepositsModal(true), 150);
  };

  const handleCloseFixedDepositsModal = () => {
    setShowFixedDepositsModal(false);
    // Restore the overlay that was previously open
    if (previousOverlay) {
      setTimeout(() => {
        if (previousOverlay === "asset_subcategory") {
          setShowAssetSubcategoryModal(true);
        } else if (previousOverlay === "liability_subcategory") {
          setShowSubcategoryModal(true);
        }
        setPreviousOverlay(null);
      }, 120);
    }
  };

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] =
    useState<AssetCategory | null>(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<
    "largest" | "smallest" | "newest" | "oldest"
  >("largest");
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedView, setSelectedView] = useState<"assets" | "liabilities">(
    "assets"
  );
  const [selectedLiability, setSelectedLiability] = useState<any>(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedLiabilitySubcategories, setSelectedLiabilitySubcategories] =
    useState<any[]>([]);
  const [selectedAssetSubcategories, setSelectedAssetSubcategories] = useState<
    any[]
  >([]);
  const [showAssetSubcategoryModal, setShowAssetSubcategoryModal] =
    useState(false);
  const [subcategoryViewMode, setSubcategoryViewMode] = useState<"list" | "grid">("list");

  // Add Net Worth Entry Modal state
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [selectedEntryCategory, setSelectedEntryCategory] =
    useState<string>("");
  const [selectedEntrySubcategory, setSelectedEntrySubcategory] =
    useState<string>("");
  const [entryType, setEntryType] = useState<"asset" | "liability">("asset");

  // Popup menu state
  const [showPopupMenu, setShowPopupMenu] = useState(false);
  const [selectedItemForMenu, setSelectedItemForMenu] = useState<any>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Real data state
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [liabilityCategories, setLiabilityCategories] = useState<
    AssetCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculated values from real data
  const totalAssets = assetCategories.reduce((sum, cat) => sum + cat.value, 0);
  const totalLiabilities = liabilityCategories.reduce(
    (sum, cat) => sum + cat.value,
    0
  );
  const netWorth = totalAssets - totalLiabilities;
  // Note: Bank accounts and credit cards are automatically included via system cards in fetchFormattedCategoriesForUI
  const assetAllocation =
    totalAssets + totalLiabilities > 0
      ? ((totalAssets / (totalAssets + totalLiabilities)) * 100).toFixed(1)
      : "0.0";

  // TODO: These should be calculated from historical data
  const monthlyChange = 0; // Will be implemented with historical data
  const percentageGrowth = 0; // Will be implemented with historical data

  // Handle route params to show add asset modal
  useEffect(() => {
    if (route.params && (route.params as any).showAddAssetModal) {
      setShowAddAssetModal(true);
    }
  }, [route.params]);

  // Fetch real data from database (local-first)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize default categories if needed
        await initializeDefaultCategories(isDemo);

        // DON'T create sample entries - let user add their own data
        // await createSampleNetWorthEntries(isDemo);

        // Use local-first service for faster loading
        console.log("📊 Net Worth: Fetching from local DB (user:", userId, ", premium:", isPremium, ")");
        const [assets, liabilities] = await Promise.all([
          fetchFormattedCategoriesForUILocal("asset", userId, isPremium).catch(err => {
            console.error("❌ Error fetching assets from local:", err);
            throw err;
          }),
          fetchFormattedCategoriesForUILocal("liability", userId, isPremium).catch(err => {
            console.error("❌ Error fetching liabilities from local:", err);
            throw err;
          }),
        ]);

        console.log("🔍 Debug: Fetched assets:", assets);
        console.log("🔍 Debug: Assets count:", assets.length);
        console.log(
          "🔍 Debug: System cards in assets:",
          assets.filter((a) => a.isSystemCard)
        );

        setAssetCategories(assets);
        setLiabilityCategories(liabilities);
        setLoading(false); // Set loading to false immediately after success
        console.log("✅ Net Worth: Data loaded successfully from local DB");
      } catch (err) {
        console.error("❌ Error fetching net worth data from local:", err);
        console.error("❌ Error details:", err instanceof Error ? err.stack : err);
        setError(err instanceof Error ? err.message : "Failed to load data");

        // Fallback: try Supabase service if local fails
        try {
          console.log("⚠️ Net Worth: Local fetch failed, trying Supabase fallback...");
          const [assets, liabilities] = await Promise.all([
            fetchFormattedCategoriesForUI("asset", isDemo),
            fetchFormattedCategoriesForUI("liability", isDemo),
          ]);
          setAssetCategories(assets);
          setLiabilityCategories(liabilities);
          setLoading(false);
          console.log("✅ Net Worth: Data loaded from Supabase fallback");
        } catch (fallbackErr) {
          console.error("❌ Error with Supabase fallback:", fallbackErr);
          // Final fallback to sample data
          setAssetCategories(sampleAssetCategories as any);
          setLiabilityCategories(sampleLiabilityCategories as any);
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchData();
    }
  }, [isDemo, userId, isPremium]);

  // Handler for opening Add Entry Modal
  const handleAddEntry = (
    categoryId: string,
    subcategoryId: string,
    type: "asset" | "liability"
  ) => {
    setSelectedEntryCategory(categoryId);
    setSelectedEntrySubcategory(subcategoryId);
    setEntryType(type);
    setShowAddEntryModal(true);
  };

  const handleEntryModalSave = () => {
    // Refresh data after adding new entry
    setShowAddEntryModal(false);
    
    // Clear cache to force fresh data
    const cache = getQueryCache();
    cache.clearTable('net_worth_entries_local');
    cache.delete(generateCacheKey('net_worth_asset', { userId, type: 'asset' }));
    cache.delete(generateCacheKey('net_worth_liability', { userId, type: 'liability' }));
    
    // Trigger data refresh
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize default categories if needed
        await initializeDefaultCategories(isDemo);

        // Use local-first service for faster loading
        const [assets, liabilities] = await Promise.all([
          fetchFormattedCategoriesForUILocal("asset", userId, isPremium),
          fetchFormattedCategoriesForUILocal("liability", userId, isPremium),
        ]);

        setAssetCategories(assets);
        setLiabilityCategories(liabilities);
      } catch (error) {
        console.error("Error fetching net worth data:", error);
        setError("Failed to load net worth data. Please try again.");
        
        // Fallback to Supabase if local fails
        try {
          const [assets, liabilities] = await Promise.all([
            fetchFormattedCategoriesForUI("asset", isDemo),
            fetchFormattedCategoriesForUI("liability", isDemo),
          ]);
          setAssetCategories(assets);
          setLiabilityCategories(liabilities);
        } catch (fallbackErr) {
          console.error("Error with fallback fetch:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    // Actually call the fetchData function
    if (userId) {
      fetchData();
    }
  };

  // Popup menu handlers
  const handleThreeDotsPress = (item: any, event: any) => {
    console.log("🔍 Three dots pressed for:", item.name);

    try {
      let touchX = 300; // Default to right side of screen
      let touchY = 400; // Default middle

      if (event && event.nativeEvent) {
        // Get the touch coordinates relative to the screen
        if (event.nativeEvent.pageX && event.nativeEvent.pageY) {
          touchX = event.nativeEvent.pageX;
          touchY = event.nativeEvent.pageY;
          console.log("🔍 Got page coordinates:", { touchX, touchY });
        } else if (
          event.nativeEvent.locationX !== undefined &&
          event.nativeEvent.locationY !== undefined
        ) {
          // For locationX/Y, we need to add some offset since it's relative to the component
          touchX = event.nativeEvent.locationX + 250; // Approximate offset for the card position
          touchY = event.nativeEvent.locationY + 200; // Approximate offset for scroll position
          console.log("🔍 Got location coordinates with offset:", {
            touchX,
            touchY,
          });
        }
      }

      // Position menu closer to the right, near the three dots button
      const menuWidth = 160; // Width of our smaller popup menu
      const menuX = Math.max(10, Math.min(touchX - 80, 250)); // Move it left to stay on screen (was touchX - 20)
      const menuY = Math.max(80, Math.min(touchY - 20, 600)); // Keep same vertical positioning

      console.log("🔍 Final popup menu position:", { x: menuX, y: menuY });

      setSelectedItemForMenu(item);
      setMenuPosition({ x: menuX, y: menuY });
      setShowPopupMenu(true);

      console.log("🔍 Popup menu state set to true");
    } catch (error) {
      console.error("Error in handleThreeDotsPress:", error);

      // Fallback: show menu at a reasonable position (more to the right)
      setSelectedItemForMenu(item);
      setMenuPosition({ x: 180, y: 300 }); // Moved from x: 100 to x: 180
      setShowPopupMenu(true);
    }
  };

  const handleMenuAction = (action: "add" | "view" | "edit" | "delete") => {
    switch (action) {
      case "add":
        console.log("Add entry for:", selectedItemForMenu);
        setShowPopupMenu(false);
        // Trigger add entry modal
        if (selectedItemForMenu) {
          const categoryId =
            selectedLiability?.id || selectedCategory?.id || "";
          const subcategoryId = selectedItemForMenu.id || "";
          const type = selectedLiability ? "liability" : "asset";
          handleAddEntry(categoryId, subcategoryId, type);
        }
        break;
      case "view":
        console.log("🏦 View item:", selectedItemForMenu);
        // Check if this is Fixed Deposits
        const itemName = selectedItemForMenu?.name?.toLowerCase() || "";
        const categoryName = selectedItemForMenu?.category?.toLowerCase() || "";
        console.log("🏦 Checking names:", { itemName, categoryName });
        
        if (itemName.includes("fixed deposit") || categoryName.includes("fixed deposit")) {
          console.log("🏦 Opening Fixed Deposits modal from View Details");
          setSelectedItemForMenu(null);
          openFixedDepositsModal();
        } else {
          console.log("🏦 Not a Fixed Deposit item, showing default view");
          setShowPopupMenu(false);
          // Add view logic here - could open a detailed view modal for other items
        }
        break;
      case "edit":
        console.log("Edit item:", selectedItemForMenu);
        setShowPopupMenu(false);
        // Add edit logic here - could open edit modal
        break;
      case "delete":
        console.log("Delete item:", selectedItemForMenu);
        setShowPopupMenu(false);
        // Add delete logic here - could show confirmation dialog
        break;
    }

    if (action !== "view" || !selectedItemForMenu?.name?.toLowerCase().includes("fixed deposit")) {
      setSelectedItemForMenu(null);
    }
  };

  const closePopupMenu = () => {
    setShowPopupMenu(false);
    setSelectedItemForMenu(null);
  };

  // Sample data - fallback if database fetch fails
  const sampleAssetCategories: AssetCategory[] = [
    {
      id: "1",
      name: "Cash & Cash Equivalents",
      value: 170000,
      percentage: 1.6,
      items: 3,
      icon: "cash",
      color: "#10B981",
      assets: [
        {
          id: "1a",
          name: "Savings Bank Account",
          category: "Cash",
          value: 120000,
          percentage: 71,
          icon: "card",
          color: "#10B981",
        },
        {
          id: "1b",
          name: "Current Account",
          category: "Cash",
          value: 30000,
          percentage: 18,
          icon: "wallet",
          color: "#10B981",
        },
        {
          id: "1c",
          name: "Digital Wallets",
          category: "Cash",
          value: 20000,
          percentage: 11,
          icon: "phone-portrait",
          color: "#10B981",
        },
      ],
    },
    {
      id: "2",
      name: "Equity Investments",
      value: 510000,
      percentage: 4.8,
      items: 4,
      icon: "trending-up",
      color: "#3B82F6",
      assets: [
        {
          id: "2a",
          name: "Direct Stocks/Shares",
          category: "Equity",
          value: 300000,
          percentage: 59,
          icon: "trending-up",
          color: "#3B82F6",
        },
        {
          id: "2b",
          name: "Equity Mutual Funds",
          category: "Equity",
          value: 150000,
          percentage: 29,
          icon: "bar-chart",
          color: "#3B82F6",
        },
        {
          id: "2c",
          name: "ETFs",
          category: "Equity",
          value: 60000,
          percentage: 12,
          icon: "analytics",
          color: "#3B82F6",
        },
      ],
    },
    {
      id: "3",
      name: "Debt & Fixed Income",
      value: 450000,
      percentage: 4.2,
      items: 3,
      icon: "trending-down",
      color: "#8B5CF6",
      assets: [
        {
          id: "3a",
          name: "Fixed Deposits",
          category: "Debt",
          value: 250000,
          percentage: 56,
          icon: "time",
          color: "#8B5CF6",
        },
        {
          id: "3b",
          name: "Government Securities",
          category: "Debt",
          value: 150000,
          percentage: 33,
          icon: "shield",
          color: "#8B5CF6",
        },
        {
          id: "3c",
          name: "Corporate Bonds",
          category: "Debt",
          value: 50000,
          percentage: 11,
          icon: "business",
          color: "#8B5CF6",
        },
      ],
    },
    {
      id: "4",
      name: "Retirement & Pension Funds",
      value: 660000,
      percentage: 6.2,
      items: 3,
      icon: "shield-checkmark",
      color: "#06B6D4",
      assets: [
        {
          id: "4a",
          name: "Employee Provident Fund",
          category: "Pension",
          value: 400000,
          percentage: 61,
          icon: "shield-checkmark",
          color: "#06B6D4",
        },
        {
          id: "4b",
          name: "Public Provident Fund",
          category: "Pension",
          value: 200000,
          percentage: 30,
          icon: "shield",
          color: "#06B6D4",
        },
        {
          id: "4c",
          name: "National Pension System",
          category: "Pension",
          value: 60000,
          percentage: 9,
          icon: "person",
          color: "#06B6D4",
        },
      ],
    },
    {
      id: "5",
      name: "Insurance (Investment)",
      value: 320000,
      percentage: 3.0,
      items: 2,
      icon: "shield",
      color: "#EC4899",
      assets: [
        {
          id: "5a",
          name: "ULIP Plans",
          category: "Insurance",
          value: 200000,
          percentage: 63,
          icon: "shield",
          color: "#EC4899",
        },
        {
          id: "5b",
          name: "Endowment Plans",
          category: "Insurance",
          value: 120000,
          percentage: 37,
          icon: "heart",
          color: "#EC4899",
        },
      ],
    },
    {
      id: "6",
      name: "Real Estate",
      value: 4630000,
      percentage: 43.1,
      items: 2,
      icon: "home",
      color: "#F59E0B",
      assets: [
        {
          id: "6a",
          name: "Primary Residence",
          category: "Property",
          value: 4000000,
          percentage: 86,
          icon: "home",
          color: "#F59E0B",
        },
        {
          id: "6b",
          name: "Rental Property",
          category: "Property",
          value: 630000,
          percentage: 14,
          icon: "business",
          color: "#F59E0B",
        },
      ],
    },
    {
      id: "7",
      name: "Precious Metals & Commodities",
      value: 2850000,
      percentage: 26.6,
      items: 2,
      icon: "diamond",
      color: "#EAB308",
      assets: [
        {
          id: "7a",
          name: "Physical Gold",
          category: "Precious Metals",
          value: 1500000,
          percentage: 53,
          icon: "diamond",
          color: "#EAB308",
        },
        {
          id: "7b",
          name: "Gold ETFs",
          category: "Precious Metals",
          value: 1350000,
          percentage: 47,
          icon: "trending-up",
          color: "#EAB308",
        },
      ],
    },
    {
      id: "8",
      name: "Digital & Crypto Assets",
      value: 180000,
      percentage: 1.7,
      items: 2,
      icon: "logo-bitcoin",
      color: "#F97316",
      assets: [
        {
          id: "8a",
          name: "Bitcoin",
          category: "Crypto",
          value: 100000,
          percentage: 56,
          icon: "logo-bitcoin",
          color: "#F97316",
        },
        {
          id: "8b",
          name: "Ethereum",
          category: "Crypto",
          value: 80000,
          percentage: 44,
          icon: "logo-bitcoin",
          color: "#F97316",
        },
      ],
    },
    {
      id: "9",
      name: "Business & Entrepreneurial",
      value: 800000,
      percentage: 7.4,
      items: 2,
      icon: "business",
      color: "#EF4444",
      assets: [
        {
          id: "9a",
          name: "Private Equity",
          category: "Business",
          value: 500000,
          percentage: 63,
          icon: "business",
          color: "#EF4444",
        },
        {
          id: "9b",
          name: "Intellectual Property",
          category: "Business",
          value: 300000,
          percentage: 37,
          icon: "document-text",
          color: "#EF4444",
        },
      ],
    },
    {
      id: "10",
      name: "Vehicles",
      value: 280000,
      percentage: 2.6,
      items: 2,
      icon: "car",
      color: "#84CC16",
      assets: [
        {
          id: "10a",
          name: "Personal Car",
          category: "Transport",
          value: 180000,
          percentage: 64,
          icon: "car",
          color: "#84CC16",
        },
        {
          id: "10b",
          name: "Two-Wheeler",
          category: "Transport",
          value: 100000,
          percentage: 36,
          icon: "bicycle",
          color: "#84CC16",
        },
      ],
    },
    {
      id: "11",
      name: "Personal Valuables",
      value: 150000,
      percentage: 1.4,
      items: 2,
      icon: "diamond",
      color: "#A855F7",
      assets: [
        {
          id: "11a",
          name: "Jewelry",
          category: "Valuables",
          value: 80000,
          percentage: 53,
          icon: "diamond",
          color: "#A855F7",
        },
        {
          id: "11b",
          name: "Luxury Watches",
          category: "Valuables",
          value: 70000,
          percentage: 47,
          icon: "time",
          color: "#A855F7",
        },
      ],
    },
    {
      id: "12",
      name: "Personal Property",
      value: 80000,
      percentage: 0.7,
      items: 2,
      icon: "phone-portrait",
      color: "#14B8A6",
      assets: [
        {
          id: "12a",
          name: "Electronics",
          category: "Property",
          value: 50000,
          percentage: 63,
          icon: "phone-portrait",
          color: "#14B8A6",
        },
        {
          id: "12b",
          name: "Furniture",
          category: "Property",
          value: 30000,
          percentage: 37,
          icon: "home",
          color: "#14B8A6",
        },
      ],
    },
    {
      id: "13",
      name: "Education Savings",
      value: 60000,
      percentage: 0.6,
      items: 1,
      icon: "school",
      color: "#6366F1",
      assets: [
        {
          id: "13a",
          name: "Child Education Fund",
          category: "Education",
          value: 60000,
          percentage: 100,
          icon: "school",
          color: "#6366F1",
        },
      ],
    },
    {
      id: "14",
      name: "Alternative Investments",
      value: 200000,
      percentage: 1.9,
      items: 2,
      icon: "leaf",
      color: "#10B981",
      assets: [
        {
          id: "14a",
          name: "Private Equity Funds",
          category: "Alternative",
          value: 120000,
          percentage: 60,
          icon: "leaf",
          color: "#10B981",
        },
        {
          id: "14b",
          name: "P2P Lending",
          category: "Alternative",
          value: 80000,
          percentage: 40,
          icon: "people",
          color: "#10B981",
        },
      ],
    },
    {
      id: "15",
      name: "Receivables",
      value: 100000,
      percentage: 0.9,
      items: 2,
      icon: "arrow-back",
      color: "#0EA5E9",
      assets: [
        {
          id: "15a",
          name: "Loans Given",
          category: "Receivables",
          value: 60000,
          percentage: 60,
          icon: "arrow-back",
          color: "#0EA5E9",
        },
        {
          id: "15b",
          name: "Tax Refund Due",
          category: "Receivables",
          value: 40000,
          percentage: 40,
          icon: "document",
          color: "#0EA5E9",
        },
      ],
    },
    {
      id: "16",
      name: "Miscellaneous Assets",
      value: 50000,
      percentage: 0.5,
      items: 1,
      icon: "ellipsis-horizontal",
      color: "#78716C",
      assets: [
        {
          id: "16a",
          name: "Collectibles",
          category: "Miscellaneous",
          value: 50000,
          percentage: 100,
          icon: "trophy",
          color: "#78716C",
        },
      ],
    },
  ];

  // Sample liabilities data - fallback if database fetch fails
  const sampleLiabilityCategories = [
    {
      id: "l1",
      name: "Housing Loans",
      category: "Mortgage",
      value: 1800000,
      percentage: 60,
      icon: "home",
      color: "#EF4444",
      bank: "HDFC Bank",
      emi: 25000,
      remaining: 72,
      subcategories: [
        "Home Loan (Primary Residence)",
        "Home Loan (Second Home)",
        "Plot Purchase Loan",
        "Home Construction Loan",
        "Home Improvement Loan",
        "Home Extension Loan",
        "Loan Against Property (LAP)",
        "Balance Transfer Housing Loan",
        "Top-up Home Loan",
        "Bridge Loan (Real Estate)",
      ],
    },
    {
      id: "l2",
      name: "Vehicle Loans",
      category: "Vehicle Loan",
      value: 450000,
      percentage: 15,
      icon: "car",
      color: "#F59E0B",
      bank: "ICICI Bank",
      emi: 12000,
      remaining: 36,
      subcategories: [
        "New Car Loan",
        "Used Car Loan",
        "Two-Wheeler Loan",
        "Electric Vehicle Loan",
        "Commercial Vehicle Loan",
        "Tractor Loan",
        "Heavy Equipment Loan",
        "Refinanced Vehicle Loan",
      ],
    },
    {
      id: "l3",
      name: "Personal Loans",
      category: "Personal Loan",
      value: 200000,
      percentage: 7,
      icon: "person",
      color: "#06B6D4",
      bank: "Axis Bank",
      emi: 8000,
      remaining: 30,
      subcategories: [
        "Unsecured Personal Loan",
        "Wedding Loan",
        "Medical Emergency Loan",
        "Travel/Vacation Loan",
        "Home Renovation Loan (Personal)",
        "Debt Consolidation Loan",
        "Top-up Personal Loan",
        "Instant Personal Loan (App-based)",
      ],
    },
    {
      id: "l4",
      name: "Education Loans",
      category: "Student Loan",
      value: 150000,
      percentage: 5,
      icon: "school",
      color: "#10B981",
      bank: "SBI",
      emi: 5000,
      remaining: 36,
      subcategories: [
        "Higher Education Loan (Domestic)",
        "Study Abroad Loan",
        "Professional Course Loan (MBA, Medical, etc.)",
        "Skill Development Loan",
        "Vocational Training Loan",
        "Education Loan for Children",
      ],
    },
    {
      id: "l5",
      name: "Credit Card Debt",
      category: "Credit Card",
      value: 350000,
      percentage: 12,
      icon: "card",
      color: "#8B5CF6",
      bank: "SBI Card",
      emi: 15000,
      remaining: 24,
      subcategories: [
        "Credit Card Outstanding (Bank 1)",
        "Credit Card Outstanding (Bank 2)",
        "Credit Card EMI Conversion",
        "Store Credit Card Debt",
        "Co-branded Credit Card Debt",
        "Credit Card Balance Transfer",
        "Minimum Due/Revolving Credit",
      ],
    },
    {
      id: "l6",
      name: "Business Loans",
      category: "Business Loan",
      value: 50000,
      percentage: 1,
      icon: "business",
      color: "#F97316",
      bank: "Kotak Bank",
      emi: 2000,
      remaining: 24,
      subcategories: [
        "Business Term Loan",
        "Working Capital Loan",
        "MSME/SME Loan",
        "Mudra Loan (Shishu/Kishore/Tarun)",
        "Startup Business Loan",
        "Machinery & Equipment Loan",
        "Inventory Financing",
        "Business Line of Credit",
        "Trade Credit/Vendor Credit",
        "Invoice Discounting/Factoring",
        "Letter of Credit",
        "Bank Guarantee (Liability)",
      ],
    },
    {
      id: "l7",
      name: "Loans Against Assets",
      category: "Asset Loan",
      value: 80000,
      percentage: 3,
      icon: "shield",
      color: "#EC4899",
      bank: "HDFC Bank",
      emi: 3000,
      remaining: 18,
      subcategories: [
        "Gold Loan",
        "Loan Against Securities (Shares/MF)",
        "Loan Against Fixed Deposit",
        "Loan Against Insurance Policy",
        "Loan Against PPF (Partial)",
        "Loan Against NSC",
        "Loan Against Property (Non-Housing)",
        "Loan Against Salary",
      ],
    },
    {
      id: "l8",
      name: "Short-Term Credit",
      category: "Micro Credit",
      value: 30000,
      percentage: 1,
      icon: "clock",
      color: "#14B8A6",
      bank: "Paytm",
      emi: 1500,
      remaining: 12,
      subcategories: [
        "Payday Loans",
        "Cash Advance",
        "Salary Advance (Employer)",
        "Overdraft Facility (OD)",
        "Buy Now Pay Later (BNPL)",
        "Consumer Durable EMI",
        "Mobile/Electronics Financing",
        "Peer-to-Peer (P2P) Loans Taken",
      ],
    },
    {
      id: "l9",
      name: "Tax & Government Dues",
      category: "Tax",
      value: 25000,
      percentage: 1,
      icon: "document-text",
      color: "#6366F1",
      bank: "Income Tax",
      emi: 0,
      remaining: 0,
      subcategories: [
        "Income Tax Payable",
        "Advance Tax Shortfall",
        "TDS/TCS Shortfall",
        "GST Payable",
        "Property Tax Outstanding",
        "Professional Tax Arrears",
        "Capital Gains Tax Liability",
        "Wealth Tax (if applicable)",
        "Municipal Taxes",
        "Toll Tax/Traffic Fines",
      ],
    },
    {
      id: "l10",
      name: "Utility Bills",
      category: "Utilities",
      value: 15000,
      percentage: 1,
      icon: "receipt",
      color: "#A855F7",
      bank: "Various",
      emi: 500,
      remaining: 1,
      subcategories: [
        "Electricity Bill Outstanding",
        "Water Bill Outstanding",
        "Gas/LPG Bill Outstanding",
        "Internet/Broadband Bill",
        "Mobile Phone Bill",
        "DTH/Cable TV Bill",
        "Society Maintenance Charges",
        "Apartment Association Dues",
        "Property Management Fees",
      ],
    },
    {
      id: "l11",
      name: "Insurance Premiums",
      category: "Insurance",
      value: 20000,
      percentage: 1,
      icon: "shield-checkmark",
      color: "#0891B2",
      bank: "LIC",
      emi: 2000,
      remaining: 12,
      subcategories: [
        "Life Insurance Premium Due",
        "Health Insurance Premium Due",
        "Vehicle Insurance Premium Due",
        "Home Insurance Premium Due",
        "Travel Insurance Premium Due",
        "Professional Indemnity Premium",
        "Directors & Officers Insurance",
        "Cyber Insurance Premium",
      ],
    },
    {
      id: "l12",
      name: "Legal Obligations",
      category: "Legal",
      value: 10000,
      percentage: 0,
      icon: "hammer",
      color: "#DC2626",
      bank: "Court",
      emi: 0,
      remaining: 0,
      subcategories: [
        "Alimony Payments",
        "Child Support Payments",
        "Legal Settlement Obligations",
        "Court-ordered Compensation",
        "Lawsuit Liabilities",
        "Arbitration Awards Payable",
        "Penalty/Fine Payments",
      ],
    },
    {
      id: "l13",
      name: "Personal Borrowings",
      category: "Personal",
      value: 50000,
      percentage: 2,
      icon: "people",
      color: "#84CC16",
      bank: "Family",
      emi: 0,
      remaining: 0,
      subcategories: [
        "Money Borrowed from Parents",
        "Money Borrowed from Siblings",
        "Money Borrowed from Friends",
        "Money Borrowed from Relatives",
        "Chit Fund Installments",
        "Community Group Loans",
        "Informal/Undocumented Loans",
        "Business Partner Payables",
        "Joint Family Financial Obligations",
      ],
    },
    {
      id: "l14",
      name: "Subscriptions",
      category: "Subscription",
      value: 5000,
      percentage: 0,
      icon: "refresh",
      color: "#F472B6",
      bank: "Various",
      emi: 500,
      remaining: 12,
      subcategories: [
        "OTT Subscriptions (Netflix, Prime, etc.)",
        "Software Subscriptions (Office, Adobe, etc.)",
        "Cloud Storage Subscriptions",
        "Music Streaming (Spotify, Apple Music)",
        "Gym/Fitness Membership",
        "Club Membership Fees",
        "Professional Association Fees",
        "Magazine/Newspaper Subscriptions",
        "Annual Maintenance Contracts (AMC)",
        "Domain & Hosting Renewals",
      ],
    },
    {
      id: "l15",
      name: "Trading Liabilities",
      category: "Trading",
      value: 30000,
      percentage: 1,
      icon: "trending-down",
      color: "#7C3AED",
      bank: "Zerodha",
      emi: 0,
      remaining: 0,
      subcategories: [
        "Margin Trading Facility (MTF)",
        "Futures & Options (Mark-to-Market Loss)",
        "Short Selling Liability",
        "Securities Borrowing",
        "Broker Financing",
        "Demat Account Charges Due",
        "Exchange Transaction Fees Due",
        "Crypto Exchange Debt",
        "Margin Call Obligations",
      ],
    },
    {
      id: "l16",
      name: "Miscellaneous",
      category: "Miscellaneous",
      value: 10000,
      percentage: 0,
      icon: "ellipsis-horizontal",
      color: "#78716C",
      bank: "Various",
      emi: 0,
      remaining: 0,
      subcategories: [
        "Advance Received (Goods/Services Pending)",
        "Security Deposit Received (To be Returned)",
        "Rent Deposit (Landlord - To Tenant)",
        "Pre-paid Services (Unused)",
        "Gift Cards/Vouchers Issued",
        "Pending Warranty Claims",
        "Post-dated Cheques Issued",
        "Contractor Payments Pending",
        "Vendor Payables",
        "Accrued Expenses (Unpaid)",
        "Deferred Payment Obligations",
      ],
    },
  ];

  const renderGridItem = ({
    item,
    index,
  }: {
    item: AssetCategory;
    index: number;
  }) => {
    // Check if this is a system card (accounts or credit cards)
    const isSystemCard = (item as any).isSystemCard || false;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.gridItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            // Add subtle visual indicator for system cards
            borderWidth: isSystemCard ? 2 : 1,
            borderStyle: isSystemCard ? "solid" : "solid",
          },
        ]}
        onPress={() => {
          // Check if this is Fixed Deposits - open modal
          if (item.name?.toLowerCase().includes("fixed deposit")) {
            console.log("🏦 Opening Fixed Deposits modal from grid");
            openFixedDepositsModal();
            return;
          }

          setSelectedLiability(item);

          // For system cards (Bank Accounts, Credit Cards), use subcategories
          // For regular categories, use assets
          let subcategoryData;

          if (isSystemCard && (item as any).subcategories) {
            // System card: use subcategories directly
            subcategoryData = (item as any).subcategories.map(
              (subcategory: any, index: number) => ({
                id: subcategory.id,
                name: subcategory.name,
                value: subcategory.value,
                percentage: subcategory.percentage || 0,
                icon: subcategory.icon,
                color: subcategory.color,
                bank: subcategory.institution || "Various Banks",
                emi: subcategory.emi || 0,
                remaining: subcategory.remaining || 0,
                category: subcategory.category || item.name,
                notes: `Details for ${subcategory.name}`,
                isSystemCard: true,
                // Additional system card specific fields
                institution: subcategory.institution,
                account_type: subcategory.account_type,
                account_number: subcategory.account_number,
                credit_limit: subcategory.credit_limit,
                available_credit: subcategory.available_credit,
                card_number: subcategory.card_number,
              })
            );
          } else {
            // Regular category: use assets
            subcategoryData =
              item.assets?.map((asset, index) => ({
                id: asset.id,
                name: asset.name,
                value: asset.value,
                percentage: asset.percentage,
                icon: asset.icon,
                color: asset.color,
                bank: "Various Banks",
                emi: 0,
                remaining: 0,
                category: asset.category,
                notes: `Details for ${asset.name}`,
                isSystemCard: false,
              })) || [];
          }

          setSelectedAssetSubcategories(subcategoryData);
          setShowAssetSubcategoryModal(true);
        }}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}
        >
          <Ionicons name={item.icon as any} size={24} color={item.color} />
          {/* Add system card indicator */}
          {isSystemCard && (
            <View style={styles.systemCardBadge}>
              <Ionicons
                name="shield-checkmark"
                size={12}
                color={colors.primary}
              />
            </View>
          )}
        </View>
        <Text
          style={[styles.categoryName, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text style={[styles.categoryValue, { color: item.color }]}>
          {formatCurrency(item.value)}
        </Text>
        <Text
          style={[styles.categoryPercentage, { color: colors.textSecondary }]}
        >
          {item.percentage}%
        </Text>
        <Text style={[styles.categoryItems, { color: colors.textSecondary }]}>
          {item.items} items
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }: { item: AssetCategory }) => {
    // Check if this is a system card (accounts or credit cards)
    const isSystemCard = (item as any).isSystemCard || false;

    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            // Add subtle visual indicator for system cards
            borderWidth: isSystemCard ? 2 : 1,
            borderStyle: isSystemCard ? "solid" : "solid",
          },
        ]}
        onPress={() => {
          setSelectedLiability(item);

          // For system cards (Bank Accounts, Credit Cards), use subcategories
          // For regular categories, use assets
          let subcategoryData;

          if (isSystemCard && (item as any).subcategories) {
            // System card: use subcategories directly
            subcategoryData = (item as any).subcategories.map(
              (subcategory: any, index: number) => ({
                id: subcategory.id,
                name: subcategory.name,
                value: subcategory.value,
                percentage: subcategory.percentage || 0,
                icon: subcategory.icon,
                color: subcategory.color,
                bank: subcategory.institution || "Various Banks",
                emi: subcategory.emi || 0,
                remaining: subcategory.remaining || 0,
                category: subcategory.category || item.name,
                notes: `Details for ${subcategory.name}`,
                isSystemCard: true,
                // Additional system card specific fields
                institution: subcategory.institution,
                account_type: subcategory.account_type,
                account_number: subcategory.account_number,
                credit_limit: subcategory.credit_limit,
                available_credit: subcategory.available_credit,
                card_number: subcategory.card_number,
              })
            );
          } else {
            // Regular category: use assets
            subcategoryData =
              item.assets?.map((asset, index) => ({
                id: asset.id,
                name: asset.name,
                value: asset.value,
                percentage: asset.percentage,
                icon: asset.icon,
                color: asset.color,
                bank: "Various Banks",
                emi: 0,
                remaining: 0,
                category: asset.category,
                notes: `Details for ${asset.name}`,
                isSystemCard: false,
              })) || [];
          }

          setSelectedAssetSubcategories(subcategoryData);
          setShowAssetSubcategoryModal(true);
        }}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}
        >
          <Ionicons name={item.icon as any} size={24} color={item.color} />
          {/* Add system card indicator */}
          {isSystemCard && (
            <View style={styles.systemCardBadge}>
              <Ionicons
                name="shield-checkmark"
                size={12}
                color={colors.primary}
              />
            </View>
          )}
        </View>
        <View style={styles.listItemContent}>
          <Text style={[styles.categoryName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.categoryItems, { color: colors.textSecondary }]}>
            {item.items} items
          </Text>
        </View>
        <View style={styles.listItemRight}>
          <Text style={[styles.categoryValue, { color: item.color }]}>
            {formatCurrency(item.value)}
          </Text>
          <Text
            style={[styles.categoryPercentage, { color: colors.textSecondary }]}
          >
            {item.percentage}%
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderAssetDetail = ({ item }: { item: AssetItem }) => (
    <View
      style={[
        styles.assetDetailItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.assetDetailContent}>
        <Text style={[styles.assetName, { color: colors.text }]}>
          {item.name}
        </Text>
        {item.date && (
          <Text style={[styles.assetDate, { color: colors.textSecondary }]}>
            {item.date}
          </Text>
        )}
      </View>
      <View style={styles.assetDetailRight}>
        <Text style={[styles.assetValue, { color: colors.text }]}>
          {formatCurrency(item.value)}
        </Text>
        <View style={styles.assetActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background },
            ]}
          >
            <Ionicons name="eye" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background },
            ]}
          >
            <Ionicons name="pencil" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background },
            ]}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Show skeleton loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header Skeleton */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <View
              style={[
                styles.skeletonText,
                styles.skeletonTitle,
                { backgroundColor: colors.border },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                styles.skeletonSubtitle,
                { backgroundColor: colors.border },
              ]}
            />
          </View>
          <View
            style={[styles.skeletonAvatar, { backgroundColor: colors.border }]}
          />
        </View>

        <ScrollView style={styles.container}>
          {/* Navigation Skeleton */}
          <View style={styles.fullNavContainer}>
            <View
              style={[styles.skeletonNav, { backgroundColor: colors.border }]}
            />
          </View>

          {/* Main Net Worth Card Skeleton */}
          <View style={styles.summaryContainer}>
            <View
              style={[
                styles.skeletonCard,
                styles.skeletonMainNetWorthCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.skeletonNetWorthHeader}>
                <View style={styles.skeletonNetWorthTitleContainer}>
                  <View
                    style={[
                      styles.skeletonIcon,
                      styles.skeletonNetWorthIcon,
                      { backgroundColor: colors.primary + "40" },
                    ]}
                  />
                  <View
                    style={[
                      styles.skeletonText,
                      styles.skeletonNetWorthTitle,
                      { backgroundColor: colors.border },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.skeletonCircle,
                    styles.skeletonAddButton,
                    { backgroundColor: colors.primary + "60" },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.skeletonText,
                  styles.skeletonMainValue,
                  { backgroundColor: colors.border },
                ]}
              />
              <View style={styles.skeletonNetWorthFooter}>
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonChangeText,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonChip,
                    { backgroundColor: colors.primary + "40" },
                  ]}
                />
              </View>
            </View>

            {/* Assets and Liabilities Cards Skeleton */}
            <View style={styles.summaryRow}>
              <View
                style={[
                  styles.skeletonCard,
                  styles.skeletonAssetCard,
                  {
                    backgroundColor: "#10B98120",
                    borderColor: "#10B98140",
                  },
                ]}
              >
                <View style={styles.skeletonAssetHeader}>
                  <View style={styles.skeletonAssetTitleRow}>
                    <View
                      style={[
                        styles.skeletonIcon,
                        styles.skeletonAssetIcon,
                        { backgroundColor: "#10B98160" },
                      ]}
                    />
                    <View style={styles.skeletonAssetTitleContainer}>
                      <View
                        style={[
                          styles.skeletonText,
                          styles.skeletonAssetTitle,
                          { backgroundColor: "#10B98160" },
                        ]}
                      />
                      <View
                        style={[
                          styles.skeletonText,
                          styles.skeletonAssetSubtitle,
                          { backgroundColor: "#10B98140" },
                        ]}
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      styles.skeletonCircle,
                      styles.skeletonSmallCircle,
                      { backgroundColor: "#10B98160" },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonAssetValue,
                    { backgroundColor: "#10B98160" },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonAssetPercentage,
                    { backgroundColor: "#10B98140" },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.skeletonCard,
                  styles.skeletonLiabilityCard,
                  { backgroundColor: "#EF444420", borderColor: "#EF444440" },
                ]}
              >
                <View style={styles.skeletonAssetHeader}>
                  <View style={styles.skeletonAssetTitleRow}>
                    <View
                      style={[
                        styles.skeletonIcon,
                        styles.skeletonAssetIcon,
                        { backgroundColor: "#EF444460" },
                      ]}
                    />
                    <View style={styles.skeletonAssetTitleContainer}>
                      <View
                        style={[
                          styles.skeletonText,
                          styles.skeletonAssetTitle,
                          { backgroundColor: "#EF444460" },
                        ]}
                      />
                      <View
                        style={[
                          styles.skeletonText,
                          styles.skeletonAssetSubtitle,
                          { backgroundColor: "#EF444440" },
                        ]}
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      styles.skeletonCircle,
                      styles.skeletonSmallCircle,
                      { backgroundColor: "#EF444460" },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonAssetValue,
                    { backgroundColor: "#EF444460" },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonAssetPercentage,
                    { backgroundColor: "#EF444440" },
                  ]}
                />
              </View>
            </View>

            {/* Asset Allocation Bar Skeleton */}
            <View style={styles.skeletonAllocationContainer}>
              <View style={styles.skeletonAllocationHeader}>
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonAllocationTitle,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonAllocationPercentage,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.skeletonProgressBar,
                  { backgroundColor: colors.border + "40" },
                ]}
              >
                <View
                  style={[
                    styles.skeletonProgressFill,
                    { backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <View style={styles.skeletonAllocationLabels}>
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonAllocationLabel,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonAllocationLabel,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Generation Section Skeleton */}
          <View style={styles.skeletonGenerationContainer}>
            <View style={styles.skeletonGenerationHeader}>
              <View
                style={[
                  styles.skeletonText,
                  styles.skeletonGenerationTitle,
                  { backgroundColor: colors.border },
                ]}
              />
              <View style={styles.skeletonGenerationButtons}>
                <View
                  style={[
                    styles.skeletonCircle,
                    styles.skeletonGenerationButton,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonCircle,
                    styles.skeletonGenerationButton,
                    { backgroundColor: colors.primary + "40" },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonCircle,
                    styles.skeletonGenerationButton,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Asset Breakdown Section Skeleton */}
          <View style={styles.skeletonBreakdownContainer}>
            <View style={styles.skeletonBreakdownHeader}>
              <View
                style={[
                  styles.skeletonText,
                  styles.skeletonBreakdownTitle,
                  { backgroundColor: colors.border },
                ]}
              />
              <View
                style={[
                  styles.skeletonButton,
                  { backgroundColor: colors.primary + "40" },
                ]}
              />
            </View>
          </View>

          {/* Categories Grid Skeleton */}
          <View style={styles.categoriesContainer}>
            {[
              { id: 1, isSystem: true, color: "#10B981" },
              { id: 2, isSystem: false, color: "#10B981" },
              { id: 3, isSystem: false, color: "#10B981" },
              { id: 4, isSystem: false, color: "#EF4444" },
              { id: 5, isSystem: false, color: "#EF4444" },
              { id: 6, isSystem: false, color: "#EF4444" },
            ].map((item) => (
              <View
                key={item.id}
                style={[
                  styles.skeletonGridItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: item.isSystem
                      ? item.color + "40"
                      : colors.border,
                    borderWidth: item.isSystem ? 2 : 1,
                  },
                ]}
              >
                {item.isSystem && (
                  <View
                    style={[
                      styles.skeletonShieldBadge,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <View
                      style={[
                        styles.skeletonShieldIcon,
                        { backgroundColor: "white" },
                      ]}
                    />
                  </View>
                )}
                <View style={styles.skeletonGridContent}>
                  <View
                    style={[
                      styles.skeletonIcon,
                      { backgroundColor: item.color + "40" },
                    ]}
                  />
                  <View
                    style={[
                      styles.skeletonText,
                      styles.skeletonGridTitle,
                      { backgroundColor: colors.border },
                    ]}
                  />
                  <View
                    style={[
                      styles.skeletonText,
                      styles.skeletonGridValue,
                      { backgroundColor: item.color + "60" },
                    ]}
                  />
                  <View style={styles.skeletonGridFooter}>
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonGridPercentage,
                        { backgroundColor: item.color + "40" },
                      ]}
                    />
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonGridItems,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Financial Summary Skeleton */}
          <View
            style={[
              styles.skeletonFinancialSummary,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.skeletonSummaryHeader}>
              <View style={styles.skeletonSummaryTitleRow}>
                <View
                  style={[
                    styles.skeletonEmoji,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonText,
                    styles.skeletonSummaryTitle,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.skeletonButton,
                  styles.skeletonSummaryButton,
                  { backgroundColor: colors.primary + "40" },
                ]}
              />
            </View>
            <View style={styles.skeletonCompactGrid}>
              <View style={styles.skeletonCompactRow}>
                <View
                  style={[
                    styles.skeletonCompactItem,
                    { backgroundColor: colors.primary + "10" },
                  ]}
                >
                  <View
                    style={[
                      styles.skeletonEmoji,
                      { backgroundColor: colors.primary + "40" },
                    ]}
                  />
                  <View style={styles.skeletonCompactText}>
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonCompactNumber,
                        { backgroundColor: colors.primary + "60" },
                      ]}
                    />
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonCompactLabel,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                </View>
                <View
                  style={[
                    styles.skeletonCompactItem,
                    { backgroundColor: colors.primary + "10" },
                  ]}
                >
                  <View
                    style={[
                      styles.skeletonEmoji,
                      { backgroundColor: colors.primary + "40" },
                    ]}
                  />
                  <View style={styles.skeletonCompactText}>
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonCompactNumber,
                        { backgroundColor: colors.primary + "60" },
                      ]}
                    />
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonCompactLabel,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.skeletonCompactRow}>
                <View
                  style={[
                    styles.skeletonCompactItem,
                    { backgroundColor: "#F59E0B10" },
                  ]}
                >
                  <View
                    style={[
                      styles.skeletonEmoji,
                      { backgroundColor: "#F59E0B40" },
                    ]}
                  />
                  <View style={styles.skeletonCompactText}>
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonCompactNumber,
                        { backgroundColor: "#F59E0B60" },
                      ]}
                    />
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonCompactLabel,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                </View>
                <View
                  style={[
                    styles.skeletonCompactItem,
                    { backgroundColor: "#8B5CF610" },
                  ]}
                >
                  <View
                    style={[
                      styles.skeletonEmoji,
                      { backgroundColor: "#8B5CF640" },
                    ]}
                  />
                  <View style={styles.skeletonCompactText}>
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonCompactNumber,
                        { backgroundColor: "#8B5CF660" },
                      ]}
                    />
                    <View
                      style={[
                        styles.skeletonText,
                        styles.skeletonCompactLabel,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="alert-circle" size={32} color="#EF4444" />
        <Text style={[styles.errorText, { color: "#EF4444" }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            // Trigger data refetch by updating the dependency
            setLoading(true);
            setError(null);
          }}
        >
          <Text style={[styles.retryButtonText, { color: colors.background }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Money
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Manage your accounts and cards
          </Text>
        </View>
      </View>

      {/* Full Width Navigation Buttons */}
      <View
        style={[
          styles.fullNavContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View
          style={[styles.fullNavButtonGroup, { backgroundColor: colors.card }]}
        >
          <TouchableOpacity
            style={[styles.fullNavButton]}
            onPress={() => (navigation as any).navigate("MobileAccounts")}
          >
            <Ionicons name="wallet" size={14} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
              Accounts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fullNavButton]}
            onPress={() => (navigation as any).navigate("MobileCredit")}
          >
            <Ionicons name="card" size={14} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
              Credit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.fullNavButton,
              styles.activeFullNav,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="trending-up" size={14} color="white" />
            <Text style={[styles.fullNavText, { color: "white" }]}>Net</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Net Worth Summary - Beautiful & Modern */}
        <View style={[styles.netWorthCard, { backgroundColor: colors.card }]}>
          {/* Header with Gradient Background */}
          <View
            style={[
              styles.netWorthHeader,
              { backgroundColor: `${colors.primary}08` },
            ]}
          >
            <View style={styles.netWorthTitleSection}>
              <View style={styles.netWorthTitleRow}>
                <Ionicons name="trending-up" size={18} color={colors.primary} />
                <Text style={[styles.netWorthTitle, { color: colors.text }]}>
                  Net Worth
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddAssetModal(true)}
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Main Value with Visual Enhancement */}
          <View style={styles.netWorthValueSection}>
            <View style={styles.netWorthValueRow}>
              <Text style={[styles.netWorthValue, { color: colors.text }]}>
                ₹{netWorth.toLocaleString("en-IN")}
              </Text>
              <View
                style={[
                  styles.trendBadgeInline,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="arrow-up" size={10} color="white" />
                <Text style={[styles.trendTextInline, { color: "white" }]}>
                  {percentageGrowth > 0 ? "+" : ""}
                  {percentageGrowth.toFixed(1)}%
                </Text>
              </View>
            </View>
            <View style={styles.netWorthChangeRow}>
              <Ionicons name="trending-up" size={12} color={colors.primary} />
              <Text style={[styles.netWorthSubtext, { color: colors.primary }]}>
                {monthlyChange === 0
                  ? "No change from last month"
                  : `${monthlyChange > 0 ? "+" : ""}₹${Math.abs(
                      monthlyChange
                    ).toLocaleString("en-IN")} since last month`}
              </Text>
            </View>
          </View>

          {/* Assets & Liabilities Interactive Buttons */}
          <View style={styles.assetsLiabilitiesSection}>
            <TouchableOpacity
              style={[
                styles.assetCard,
                {
                  backgroundColor:
                    selectedView === "assets" ? "#10B981" : "#F0FDF4",
                  borderColor:
                    selectedView === "assets" ? "#059669" : "#D1FAE5",
                  borderWidth: selectedView === "assets" ? 2 : 1.5,
                  elevation: selectedView === "assets" ? 12 : 6,
                  shadowColor: selectedView === "assets" ? "#10B981" : "#000",
                  shadowOffset: {
                    width: 0,
                    height: selectedView === "assets" ? 6 : 3,
                  },
                  shadowOpacity: selectedView === "assets" ? 0.25 : 0.12,
                  shadowRadius: selectedView === "assets" ? 12 : 8,
                  transform: [{ scale: selectedView === "assets" ? 1.03 : 1 }],
                },
              ]}
              onPress={() => setSelectedView("assets")}
              activeOpacity={0.8}
            >
              <View style={styles.assetCardHeader}>
                <View
                  style={[
                    styles.assetIcon,
                    {
                      backgroundColor:
                        selectedView === "assets"
                          ? "rgba(255,255,255,0.2)"
                          : "#10B981",
                    },
                  ]}
                >
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color={selectedView === "assets" ? "white" : "white"}
                  />
                </View>
                <Text
                  style={[
                    styles.assetLabel,
                    {
                      color: selectedView === "assets" ? "white" : "#059669",
                      fontWeight: selectedView === "assets" ? "800" : "700",
                    },
                  ]}
                >
                  Total Assets
                </Text>
                <TouchableOpacity
                  style={[
                    styles.cardQuickAddButton,
                    {
                      backgroundColor:
                        selectedView === "assets"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(16,185,129,0.1)",
                      borderColor:
                        selectedView === "assets"
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(16,185,129,0.2)",
                    },
                  ]}
                  onPress={() => {
                    setSelectedEntryCategory("");
                    setSelectedEntrySubcategory("");
                    setEntryType("asset");
                    setShowAddEntryModal(true);
                  }}
                >
                  <Ionicons
                    name="add"
                    size={12}
                    color={selectedView === "assets" ? "white" : "#10B981"}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.cardValue,
                  {
                    color: selectedView === "assets" ? "white" : "#10B981",
                  },
                ]}
              >
                {formatCurrency(totalAssets)}
              </Text>
              <Text
                style={[
                  styles.cardSubtext,
                  {
                    color:
                      selectedView === "assets"
                        ? "rgba(255,255,255,0.9)"
                        : "#047857",
                  },
                ]}
              >
                {totalAssets + totalLiabilities === 0
                  ? "0.0% of portfolio"
                  : `${(
                      (totalAssets / (totalAssets + totalLiabilities)) *
                      100
                    ).toFixed(1)}% of portfolio`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.liabilityCard,
                {
                  backgroundColor:
                    selectedView === "liabilities" ? "#EF4444" : "#FEF2F2",
                  borderColor:
                    selectedView === "liabilities" ? "#DC2626" : "#FECACA",
                  borderWidth: selectedView === "liabilities" ? 2 : 1.5,
                  elevation: selectedView === "liabilities" ? 12 : 6,
                  shadowColor:
                    selectedView === "liabilities" ? "#EF4444" : "#000",
                  shadowOffset: {
                    width: 0,
                    height: selectedView === "liabilities" ? 6 : 3,
                  },
                  shadowOpacity: selectedView === "liabilities" ? 0.25 : 0.12,
                  shadowRadius: selectedView === "liabilities" ? 12 : 8,
                  transform: [
                    { scale: selectedView === "liabilities" ? 1.03 : 1 },
                  ],
                },
              ]}
              onPress={() => setSelectedView("liabilities")}
              activeOpacity={0.8}
            >
              <View style={styles.liabilityCardHeader}>
                <View
                  style={[
                    styles.liabilityIcon,
                    {
                      backgroundColor:
                        selectedView === "liabilities"
                          ? "rgba(255,255,255,0.2)"
                          : "#EF4444",
                    },
                  ]}
                >
                  <Ionicons
                    name="trending-down"
                    size={16}
                    color={selectedView === "liabilities" ? "white" : "white"}
                  />
                </View>
                <Text
                  style={[
                    styles.liabilityLabel,
                    {
                      color:
                        selectedView === "liabilities" ? "white" : "#DC2626",
                      fontWeight:
                        selectedView === "liabilities" ? "800" : "700",
                    },
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.8}
                >
                  Total{"\n"}Liabilities
                </Text>
                <TouchableOpacity
                  style={[
                    styles.cardQuickAddButton,
                    {
                      backgroundColor:
                        selectedView === "liabilities"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(239,68,68,0.1)",
                      borderColor:
                        selectedView === "liabilities"
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(239,68,68,0.2)",
                    },
                  ]}
                  onPress={() => {
                    setSelectedEntryCategory("");
                    setSelectedEntrySubcategory("");
                    setEntryType("liability");
                    setShowAddEntryModal(true);
                  }}
                >
                  <Ionicons
                    name="add"
                    size={12}
                    color={selectedView === "liabilities" ? "white" : "#EF4444"}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.cardValue,
                  {
                    color: selectedView === "liabilities" ? "white" : "#EF4444",
                  },
                ]}
              >
                {formatCurrency(totalLiabilities)}
              </Text>
              <Text
                style={[
                  styles.cardSubtext,
                  {
                    color:
                      selectedView === "liabilities"
                        ? "rgba(255,255,255,0.9)"
                        : "#B91C1C",
                  },
                ]}
              >
                {totalAssets + totalLiabilities === 0
                  ? "0.0% of portfolio"
                  : `${(
                      (totalLiabilities / (totalAssets + totalLiabilities)) *
                      100
                    ).toFixed(1)}% of portfolio`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text
                style={[styles.progressTitle, { color: colors.textSecondary }]}
              >
                Asset Allocation
              </Text>
              <Text
                style={[styles.progressPercentage, { color: colors.primary }]}
              >
                {assetAllocation}%
              </Text>
            </View>
            <View
              style={[styles.progressBar, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${assetAllocation}%` as any,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: colors.primary }]}>
                Assets
              </Text>
              <Text style={[styles.progressLabel, { color: "#EF4444" }]}>
                Liabilities
              </Text>
            </View>
          </View>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <Text
            style={[styles.generationText, { color: colors.textSecondary }]}
          >
            Generation
          </Text>
          <Ionicons name="eye" size={16} color={colors.textSecondary} />

          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    viewMode === "list" ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setViewMode("list")}
            >
              <Ionicons
                name="list"
                size={16}
                color={viewMode === "list" ? "white" : colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    viewMode === "grid" ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setViewMode("grid")}
            >
              <Ionicons
                name="grid"
                size={16}
                color={viewMode === "grid" ? "white" : colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, { backgroundColor: colors.card }]}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons
                name="swap-vertical"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Assets/Liabilities List */}
        {selectedView === "assets" && (
          <View style={styles.detailedListSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.detailedListTitle, { color: colors.text }]}>
                Asset Breakdown
              </Text>
              <TouchableOpacity
                style={[
                  styles.sectionAddButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setSelectedEntryCategory("");
                  setSelectedEntrySubcategory("");
                  setEntryType("asset");
                  setShowAddEntryModal(true);
                }}
              >
                <Ionicons name="add" size={16} color="white" />
                <Text style={styles.sectionAddButtonText}>Add Asset</Text>
              </TouchableOpacity>
            </View>
            {viewMode === "grid" ? (
              <View style={styles.categoriesContainer}>
                {assetCategories.map((item, index) =>
                  renderGridItem({ item, index })
                )}
              </View>
            ) : (
              <View style={styles.detailedListContainer}>
                {assetCategories.map((item, index) => {
                  const isSystemCard = (item as any).isSystemCard || false;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.detailedListItem,
                        {
                          backgroundColor: colors.card,
                          borderLeftWidth: isSystemCard ? 4 : 0,
                          borderLeftColor: isSystemCard
                            ? colors.primary
                            : "transparent",
                        },
                      ]}
                      onPress={() => {
                        // Check if this is Fixed Deposits - open modal
                        if (item.name?.toLowerCase().includes("fixed deposit")) {
                          console.log("🏦 Opening Fixed Deposits modal from list");
                          openFixedDepositsModal();
                          return;
                        }
                        setSelectedCategory(item);
                      }}
                    >
                      <View
                        style={[
                          styles.detailedListIcon,
                          { backgroundColor: `${item.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={20}
                          color={item.color}
                        />
                        {isSystemCard && (
                          <View
                            style={[
                              styles.systemCardBadge,
                              {
                                top: -4,
                                right: -4,
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                              },
                            ]}
                          >
                            <Ionicons
                              name="shield-checkmark"
                              size={10}
                              color={colors.primary}
                            />
                          </View>
                        )}
                      </View>
                      <View style={styles.detailedListContent}>
                        <Text
                          style={[
                            styles.detailedListName,
                            { color: colors.text },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={[
                            styles.detailedListCategory,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {item.items} items • {item.percentage}%
                        </Text>
                      </View>
                      <View style={styles.detailedListRight}>
                        <Text
                          style={[
                            styles.detailedListValue,
                            { color: item.color },
                          ]}
                        >
                          {formatCurrency(item.value)}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {selectedView === "liabilities" && (
          <View style={styles.detailedListSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.detailedListTitle, { color: colors.text }]}>
                Liability Breakdown
              </Text>
              <TouchableOpacity
                style={[
                  styles.sectionAddButton,
                  { backgroundColor: "#EF4444" },
                ]}
                onPress={() => {
                  setSelectedEntryCategory("");
                  setSelectedEntrySubcategory("");
                  setEntryType("liability");
                  setShowAddEntryModal(true);
                }}
              >
                <Ionicons name="add" size={16} color="white" />
                <Text style={styles.sectionAddButtonText}>Add Liability</Text>
              </TouchableOpacity>
            </View>
            {viewMode === "grid" ? (
              <View style={styles.categoriesContainer}>
                {liabilityCategories.map((item, index) => {
                  // Check if this is a system card (credit cards)
                  const isSystemCard = (item as any).isSystemCard || false;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.gridItem,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          // Add subtle visual indicator for system cards
                          borderWidth: isSystemCard ? 2 : 1,
                          borderStyle: isSystemCard ? "solid" : "solid",
                        },
                      ]}
                      onPress={() => {
                        setSelectedLiability(item);

                        // For system cards (Credit Cards), use subcategories
                        // For regular categories, create sample data from subcategories array
                        let subcategoryData;

                        if (isSystemCard && (item as any).subcategories) {
                          // System card: use subcategories directly
                          subcategoryData = (item as any).subcategories.map(
                            (subcategory: any, index: number) => ({
                              id: subcategory.id,
                              name: subcategory.name,
                              value: subcategory.value,
                              percentage: subcategory.percentage || 0, // Use the percentage from service
                              icon: subcategory.icon,
                              color: subcategory.color,
                              bank: subcategory.institution || "Various Banks",
                              emi: subcategory.emi || 0,
                              remaining: subcategory.remaining || 0,
                              category: subcategory.category || item.name,
                              notes: `Details for ${subcategory.name}`,
                              isSystemCard: true,
                              // Additional system card specific fields
                              institution: subcategory.institution,
                              account_type: subcategory.account_type,
                              account_number: subcategory.account_number,
                              credit_limit: subcategory.credit_limit,
                              available_credit: subcategory.available_credit,
                              card_number: subcategory.card_number,
                            })
                          );
                        } else {
                          // Regular category: create sample data from subcategories array
                          subcategoryData =
                            item.subcategories?.map(
                              (sub: string, index: number) => ({
                                id: `${item.id}_sub_${index}`,
                                name: sub,
                                value: Math.floor(
                                  (item.value /
                                    (item.subcategories?.length || 1)) *
                                    (0.8 + Math.random() * 0.4)
                                ), // Randomize values
                                percentage:
                                  (100 / (item.subcategories?.length || 1)) *
                                  (0.8 + Math.random() * 0.4),
                                icon: item.icon,
                                color: item.color,
                                bank: item.bank,
                                emi: Math.floor(
                                  (item.emi || 0) /
                                    (item.subcategories?.length || 1)
                                ),
                                remaining:
                                  Math.floor(
                                    (item.remaining || 0) /
                                      (item.subcategories?.length || 1)
                                  ) || 1,
                                category: item.category,
                                notes: `Details for ${sub}`,
                                isSystemCard: false,
                              })
                            ) || [];
                        }

                        setSelectedLiabilitySubcategories(subcategoryData);
                        setShowSubcategoryModal(true);
                      }}
                    >
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: `${item.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={24}
                          color={item.color}
                        />
                        {/* Add system card indicator */}
                        {isSystemCard && (
                          <View style={styles.systemCardBadge}>
                            <Ionicons
                              name="shield-checkmark"
                              size={12}
                              color={colors.primary}
                            />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[styles.categoryName, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.categoryValue, { color: item.color }]}
                      >
                        {formatCurrency(item.value)}
                      </Text>
                      <Text
                        style={[
                          styles.categoryPercentage,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.percentage}%
                      </Text>
                      <Text
                        style={[
                          styles.categoryItems,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.items} items
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.detailedListContainer}>
                {liabilityCategories.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.detailedListItem,
                      { backgroundColor: colors.card },
                    ]}
                    onPress={() => {
                      setSelectedLiability(item);
                      // Create detailed subcategory data with sample values
                      const subcategoryData =
                        item.subcategories?.map(
                          (sub: string, index: number) => ({
                            id: `${item.id}_sub_${index}`,
                            name: sub,
                            value: Math.floor(
                              (item.value / (item.subcategories?.length || 1)) *
                                (0.8 + Math.random() * 0.4)
                            ), // Randomize values
                            percentage:
                              (100 / (item.subcategories?.length || 1)) *
                              (0.8 + Math.random() * 0.4),
                            icon: item.icon,
                            color: item.color,
                            bank: item.bank,
                            emi: Math.floor(
                              (item.emi || 0) /
                                (item.subcategories?.length || 1)
                            ),
                            remaining:
                              Math.floor(
                                (item.remaining || 0) /
                                  (item.subcategories?.length || 1)
                              ) || 1,
                            category: item.category,
                            notes: `Details for ${sub}`,
                          })
                        ) || [];
                      setSelectedLiabilitySubcategories(subcategoryData);
                      setShowSubcategoryModal(true);
                    }}
                  >
                    <View
                      style={[
                        styles.detailedListIcon,
                        { backgroundColor: `${item.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>
                    <View style={styles.detailedListContent}>
                      <Text
                        style={[
                          styles.detailedListName,
                          { color: colors.text },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.detailedListCategory,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.bank || "Various Banks"} • EMI: ₹
                        {(item.emi || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailedListRight}>
                      <Text
                        style={[
                          styles.detailedListValue,
                          { color: item.color },
                        ]}
                      >
                        {formatCurrency(item.value)}
                      </Text>
                      <Text
                        style={[
                          styles.detailedListRemaining,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.remaining} months
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Compact Financial Insights */}
        <View
          style={[
            styles.financialSummary,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleRow}>
              <Text style={styles.summaryEmoji}>💡</Text>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                Key Insights
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.summaryBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.summaryBadgeText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.compactSummaryGrid}>
            <View style={styles.compactSummaryRow}>
              <View
                style={[
                  styles.compactSummaryItem,
                  { backgroundColor: `${colors.primary}08` },
                ]}
              >
                <View style={styles.compactItemContent}>
                  <Text style={styles.compactIcon}>🏛️</Text>
                  <View style={styles.compactTextContainer}>
                    <Text
                      style={[styles.compactNumber, { color: colors.primary }]}
                    >
                      {assetCategories.length}
                    </Text>
                    <Text
                      style={[
                        styles.compactLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Categories
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.compactSummaryItem,
                  { backgroundColor: `${colors.primary}08` },
                ]}
              >
                <View style={styles.compactItemContent}>
                  <Text style={styles.compactIcon}>📊</Text>
                  <View style={styles.compactTextContainer}>
                    <Text
                      style={[styles.compactNumber, { color: colors.primary }]}
                    >
                      {assetCategories.reduce((sum, cat) => sum + cat.items, 0)}
                    </Text>
                    <Text
                      style={[
                        styles.compactLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Holdings
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.compactSummaryRow}>
              <View
                style={[
                  styles.compactSummaryItem,
                  { backgroundColor: "#F59E0B08" },
                ]}
              >
                <View style={styles.compactItemContent}>
                  <Text style={styles.compactIcon}>💰</Text>
                  <View style={styles.compactTextContainer}>
                    <Text
                      style={[styles.compactNumber, { color: "#F59E0B" }]}
                      numberOfLines={1}
                    >
                      {formatCurrency(
                        Math.max(...assetCategories.map((cat) => cat.value))
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.compactLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Top Asset
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.compactSummaryItem,
                  { backgroundColor: "#8B5CF608" },
                ]}
              >
                <View style={styles.compactItemContent}>
                  <Text style={styles.compactIcon}>🎯</Text>
                  <View style={styles.compactTextContainer}>
                    <Text style={[styles.compactNumber, { color: "#8B5CF6" }]}>
                      {Math.max(
                        ...assetCategories.map((cat) => cat.percentage)
                      )}
                      %
                    </Text>
                    <Text
                      style={[
                        styles.compactLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Allocation
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.floatingActionButton,
          { backgroundColor: colors.primary },
        ]}
        onPress={() => {
          setSelectedEntryCategory("");
          setSelectedEntrySubcategory("");
          setEntryType(selectedView === "liabilities" ? "liability" : "asset");
          setShowAddEntryModal(true);
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <Modal visible={showAddAssetModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.addAssetModal,
                { backgroundColor: colors.background },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Add New Asset Class
                </Text>
                <TouchableOpacity onPress={() => setShowAddAssetModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Category Name *
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="e.g., Custom Investment Category"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Category *
                  </Text>
                  <View style={styles.formFieldRow}>
                    <TouchableOpacity
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Select category
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Subcategory *
                  </Text>
                  <View style={styles.formFieldRow}>
                    <TouchableOpacity
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Select subcategory
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Value (₹) *
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Enter amount in rupees"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Notes (Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Additional details about this asset..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.toggleField}>
                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                      Include in Net Worth
                    </Text>
                    <Text
                      style={[
                        styles.fieldSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Whether to include this asset in net worth calculations
                    </Text>
                  </View>
                  <View
                    style={[styles.toggle, { backgroundColor: colors.primary }]}
                  >
                    <View
                      style={[styles.toggleThumb, { backgroundColor: "white" }]}
                    />
                  </View>
                </View>

                <View style={styles.toggleField}>
                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                      Active Asset
                    </Text>
                    <Text
                      style={[
                        styles.fieldSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Whether this asset is currently active/held
                    </Text>
                  </View>
                  <View
                    style={[styles.toggle, { backgroundColor: colors.primary }]}
                  >
                    <View
                      style={[styles.toggleThumb, { backgroundColor: "white" }]}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setShowAddAssetModal(false)}
                >
                  <Text style={styles.createButtonText}>Create Category</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowAddAssetModal(false)}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: colors.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <Modal visible={showSortModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.sortModalOverlay}
            onPress={() => setShowSortModal(false)}
          >
            <View
              style={[
                styles.sortModal,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder("largest");
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>
                  Largest First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder("smallest");
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>
                  Smallest First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder("newest");
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>
                  Recently Updated
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder("oldest");
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>
                  Oldest First
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Subcategory Detail Screen */}
      {showSubcategoryModal && selectedLiability && (
        <Modal visible={showSubcategoryModal} animationType="slide">
          <View
            style={[
              styles.subcategoryScreen,
              { backgroundColor: colors.background },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.subcategoryScreenHeader,
                { backgroundColor: colors.card },
              ]}
            >
              <TouchableOpacity
                style={styles.subcategoryBackButton}
                onPress={() => setShowSubcategoryModal(false)}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text
                style={[styles.subcategoryScreenTitle, { color: colors.text }]}
              >
                {selectedLiability.name}
              </Text>
              <View style={styles.subcategoryHeaderActions}>
                <TouchableOpacity
                  style={styles.subcategoryAddButton}
                  onPress={() =>
                    handleAddEntry(
                      selectedView === "assets"
                        ? selectedCategory?.id || ""
                        : selectedLiability?.id || "",
                      "",
                      selectedView === "assets" ? "asset" : "liability"
                    )
                  }
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.subcategoryMoreButton}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Summary Card */}
            <View
              style={[
                styles.subcategorySummaryCard,
                { backgroundColor: colors.card },
              ]}
            >
              <View style={styles.subcategorySummaryHeader}>
                <View
                  style={[
                    styles.subcategorySummaryIcon,
                    { backgroundColor: `${selectedLiability.color}20` },
                  ]}
                >
                  <Ionicons
                    name={selectedLiability.icon as any}
                    size={24}
                    color={selectedLiability.color}
                  />
                </View>
                <View style={styles.subcategorySummaryContent}>
                  <Text
                    style={[
                      styles.subcategorySummaryTitle,
                      { color: colors.text },
                    ]}
                  >
                    {selectedLiability.name}
                  </Text>
                  <Text
                    style={[
                      styles.subcategorySummarySubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedLiabilitySubcategories.length} items •{" "}
                    {selectedLiability.percentage}%
                  </Text>
                </View>
                <View style={styles.subcategorySummaryValue}>
                  <Text
                    style={[
                      styles.subcategorySummaryAmount,
                      { color: selectedLiability.color },
                    ]}
                  >
                    {formatCurrency(selectedLiability.value)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Subcategory List */}
            <ScrollView style={styles.subcategoryListContainer}>
              {selectedLiabilitySubcategories.map((subcategory, index) => (
                <View
                  key={subcategory.id}
                  style={[
                    styles.enhancedSubcategoryCard,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.text,
                      borderLeftColor: subcategory.color,
                    },
                  ]}
                >
                  {/* Single Row Layout: Badge + Icon + Info + Amount + Three Dots */}
                  <View style={styles.cardSingleRow}>
                    <View style={styles.cardNumberBadge}>
                      <Text
                        style={[
                          styles.cardNumberText,
                          { color: subcategory.color },
                        ]}
                      >
                        #{index + 1}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cardIcon,
                        {
                          backgroundColor: `${subcategory.color}15`,
                          borderWidth: 2,
                          borderColor: `${subcategory.color}30`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={subcategory.icon as any}
                        size={24}
                        color={subcategory.color}
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text
                        style={[styles.cardTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {typeof subcategory.name === "string"
                          ? subcategory.name
                          : "Unknown Item"}
                      </Text>
                      <Text
                        style={[
                          styles.cardSubtitle,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {subcategory.isSystemCard
                          ? `${subcategory.institution || "Unknown"}`
                          : `${subcategory.bank}`}
                      </Text>
                      <Text
                        style={[
                          styles.cardAccountDetails,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {subcategory.isSystemCard
                          ? `${subcategory.account_type || "Account"} • ${
                              subcategory.account_number || "****"
                            }`
                          : `${subcategory.percentage.toFixed(
                              1
                            )}% of portfolio`}
                      </Text>
                    </View>
                    <View style={styles.cardAmountSection}>
                      <Text
                        style={[
                          styles.cardAmount,
                          { color: subcategory.color },
                        ]}
                      >
                        {formatCurrency(subcategory.value)}
                      </Text>
                      <Text
                        style={[
                          styles.cardPercentage,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {subcategory.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardThreeDotsButton}
                      onPress={(event) =>
                        handleThreeDotsPress(subcategory, event)
                      }
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Financial Summary */}
            <View
              style={[
                styles.subcategoryFinancialSummary,
                { backgroundColor: colors.card },
              ]}
            >
              <Text
                style={[
                  styles.subcategoryFinancialTitle,
                  { color: colors.text },
                ]}
              >
                Financial Summary
              </Text>
              <View style={styles.subcategoryFinancialGrid}>
                <View style={styles.subcategoryFinancialItem}>
                  <Text
                    style={[
                      styles.subcategoryFinancialNumber,
                      { color: colors.primary },
                    ]}
                  >
                    {selectedLiabilitySubcategories.length}
                  </Text>
                  <Text
                    style={[
                      styles.subcategoryFinancialLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Subcategories
                  </Text>
                </View>
                <View style={styles.subcategoryFinancialItem}>
                  <Text
                    style={[
                      styles.subcategoryFinancialNumber,
                      { color: colors.primary },
                    ]}
                  >
                    {formatCurrency(selectedLiability.value)}
                  </Text>
                  <Text
                    style={[
                      styles.subcategoryFinancialLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Total Amount
                  </Text>
                </View>
                <View style={styles.subcategoryFinancialItem}>
                  <Text
                    style={[
                      styles.subcategoryFinancialNumber,
                      { color: selectedLiability.color },
                    ]}
                  >
                    ₹{(selectedLiability.emi || 0).toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      styles.subcategoryFinancialLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Monthly EMI
                  </Text>
                </View>
                <View style={styles.subcategoryFinancialItem}>
                  <Text
                    style={[
                      styles.subcategoryFinancialNumber,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedLiability.remaining}
                  </Text>
                  <Text
                    style={[
                      styles.subcategoryFinancialLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Months Left
                  </Text>
                </View>
              </View>
            </View>

            {/* Popup Menu for Liability Subcategories - Inside Modal */}
            {showPopupMenu && (
              <Modal
                transparent={true}
                visible={showPopupMenu}
                onRequestClose={closePopupMenu}
              >
                <TouchableWithoutFeedback onPress={closePopupMenu}>
                  <View style={styles.popupOverlay}>
                    <View
                      style={[
                        styles.popupMenu,
                        styles.smallerPopupMenu, // Make it smaller
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          top: menuPosition.y,
                          left: menuPosition.x,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={[styles.popupMenuItem, styles.smallerMenuItem]}
                        onPress={() => handleMenuAction("add")}
                      >
                        <View
                          style={[
                            styles.popupMenuIcon,
                            styles.smallerMenuIcon,
                            { backgroundColor: `${colors.primary}20` },
                          ]}
                        >
                          <Ionicons
                            name="add"
                            size={14}
                            color={colors.primary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.popupMenuText,
                            styles.smallerMenuText,
                            { color: colors.text, fontWeight: "600" },
                          ]}
                        >
                          Add Entry
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.popupMenuSeparator,
                          { backgroundColor: colors.border },
                        ]}
                      />

                      <TouchableOpacity
                        style={[styles.popupMenuItem, styles.smallerMenuItem]}
                        onPress={() => handleMenuAction("view")}
                      >
                        <View
                          style={[
                            styles.popupMenuIcon,
                            styles.smallerMenuIcon,
                            { backgroundColor: `${colors.primary}10` },
                          ]}
                        >
                          <Ionicons
                            name="eye-outline"
                            size={14}
                            color={colors.primary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.popupMenuText,
                            styles.smallerMenuText,
                            { color: colors.text },
                          ]}
                        >
                          View Details
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.popupMenuSeparator,
                          { backgroundColor: colors.border },
                        ]}
                      />

                      <TouchableOpacity
                        style={[styles.popupMenuItem, styles.smallerMenuItem]}
                        onPress={() => handleMenuAction("edit")}
                      >
                        <View
                          style={[
                            styles.popupMenuIcon,
                            styles.smallerMenuIcon,
                            { backgroundColor: `${colors.textSecondary}10` },
                          ]}
                        >
                          <Ionicons
                            name="create-outline"
                            size={14}
                            color={colors.textSecondary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.popupMenuText,
                            styles.smallerMenuText,
                            { color: colors.text },
                          ]}
                        >
                          Edit Entry
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.popupMenuSeparator,
                          { backgroundColor: colors.border },
                        ]}
                      />

                      <TouchableOpacity
                        style={[styles.popupMenuItem, styles.smallerMenuItem]}
                        onPress={() => handleMenuAction("delete")}
                      >
                        <View
                          style={[
                            styles.popupMenuIcon,
                            styles.smallerMenuIcon,
                            { backgroundColor: "#EF444420" },
                          ]}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={14}
                            color="#EF4444"
                          />
                        </View>
                        <Text
                          style={[
                            styles.popupMenuText,
                            styles.smallerMenuText,
                            { color: "#EF4444" },
                          ]}
                        >
                          Delete Entry
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}
          </View>
        </Modal>
      )}

      {/* Asset Subcategory Detail Screen */}
      {showAssetSubcategoryModal && selectedLiability && (
        <Modal visible={showAssetSubcategoryModal} animationType="slide">
          <View
            style={[
              styles.subcategoryScreen,
              { backgroundColor: colors.background },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.subcategoryScreenHeader,
                { backgroundColor: colors.card },
              ]}
            >
              <TouchableOpacity
                style={styles.subcategoryBackButton}
                onPress={() => setShowAssetSubcategoryModal(false)}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text
                style={[styles.subcategoryScreenTitle, { color: colors.text }]}
              >
                {selectedLiability.name}
              </Text>
              <View style={styles.subcategoryHeaderActions}>
                {/* View Toggle Button */}
                <TouchableOpacity
                  style={[
                    styles.viewToggleButton,
                    { backgroundColor: `${colors.primary}20` },
                  ]}
                  onPress={() =>
                    setSubcategoryViewMode((prev) =>
                      prev === "list" ? "grid" : "list"
                    )
                  }
                >
                  <Ionicons
                    name={subcategoryViewMode === "list" ? "grid" : "list"}
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.subcategoryAddButton}
                  onPress={() =>
                    handleAddEntry(
                      selectedView === "assets"
                        ? selectedCategory?.id || ""
                        : selectedLiability?.id || "",
                      "",
                      selectedView === "assets" ? "asset" : "liability"
                    )
                  }
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.subcategoryMoreButton}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Summary Card */}
            <View
              style={[
                styles.subcategorySummaryCard,
                { backgroundColor: colors.card },
              ]}
            >
              <View style={styles.subcategorySummaryHeader}>
                <View
                  style={[
                    styles.subcategorySummaryIcon,
                    { backgroundColor: `${selectedLiability.color}20` },
                  ]}
                >
                  <Ionicons
                    name={selectedLiability.icon as any}
                    size={24}
                    color={selectedLiability.color}
                  />
                </View>
                <View style={styles.subcategorySummaryContent}>
                  <Text
                    style={[
                      styles.subcategorySummaryTitle,
                      { color: colors.text },
                    ]}
                  >
                    {selectedLiability.name}
                  </Text>
                  <Text
                    style={[
                      styles.subcategorySummarySubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedAssetSubcategories.length} items •{" "}
                    {selectedLiability.percentage}%
                  </Text>
                </View>
                <View style={styles.subcategorySummaryValue}>
                  <Text
                    style={[
                      styles.subcategorySummaryAmount,
                      { color: selectedLiability.color },
                    ]}
                  >
                    {formatCurrency(selectedLiability.value)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Subcategory List or Grid */}
            <ScrollView style={styles.subcategoryListContainer}>
              {subcategoryViewMode === "list" ? (
                // LIST VIEW
                <>
                  {selectedAssetSubcategories.map((subcategory, index) => (
                    <View
                      key={subcategory.id}
                      style={[
                        styles.enhancedSubcategoryCard,
                        {
                          backgroundColor: colors.card,
                          shadowColor: colors.text,
                          borderLeftColor: subcategory.color,
                        },
                      ]}
                    >
                      {/* Single Row Layout: Badge + Icon + Info + Amount + Three Dots */}
                      <View style={styles.cardSingleRow}>
                        <View style={styles.cardNumberBadge}>
                          <Text
                            style={[
                              styles.cardNumberText,
                              { color: subcategory.color },
                            ]}
                          >
                            #{index + 1}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.cardIcon,
                            {
                              backgroundColor: `${subcategory.color}15`,
                              borderWidth: 2,
                              borderColor: `${subcategory.color}30`,
                            },
                          ]}
                        >
                          <Ionicons
                            name={subcategory.icon as any}
                            size={24}
                            color={subcategory.color}
                          />
                        </View>
                        <View style={styles.cardInfo}>
                          <Text
                            style={[styles.cardTitle, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {subcategory.name}
                          </Text>
                          <Text
                            style={[
                              styles.cardSubtitle,
                              { color: colors.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {subcategory.isSystemCard
                              ? `${subcategory.institution || "Unknown"}`
                              : `${subcategory.bank}`}
                          </Text>
                          <Text
                            style={[
                              styles.cardAccountDetails,
                              { color: colors.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {subcategory.isSystemCard
                              ? `${subcategory.account_type || "Account"} • ${
                                  subcategory.account_number || "****"
                                }`
                              : `${subcategory.percentage.toFixed(
                                  1
                                )}% of portfolio`}
                          </Text>
                        </View>
                        <View style={styles.cardAmountSection}>
                          <Text
                            style={[
                              styles.cardAmount,
                              { color: subcategory.color },
                            ]}
                          >
                            {formatCurrency(subcategory.value)}
                          </Text>
                          <Text
                            style={[
                              styles.cardPercentage,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {subcategory.percentage.toFixed(1)}%
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.cardThreeDotsButton}
                          onPress={(event) =>
                            handleThreeDotsPress(subcategory, event)
                          }
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={16}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              ) : (
                // GRID VIEW
                <View style={styles.gridContainer}>
                  {selectedAssetSubcategories.map((subcategory, index) => (
                    <View
                      key={subcategory.id}
                      style={[
                        styles.gridCard,
                        {
                          backgroundColor: colors.card,
                          shadowColor: colors.text,
                        },
                      ]}
                    >
                      {/* Header with Badge and Three Dots */}
                      <View style={styles.gridCardHeader}>
                        <View
                          style={[
                            styles.gridCardBadge,
                            { backgroundColor: `${subcategory.color}20` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.gridCardBadgeText,
                              { color: subcategory.color },
                            ]}
                          >
                            #{index + 1}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.gridCardMenuButton}
                          onPress={(event) =>
                            handleThreeDotsPress(subcategory, event)
                          }
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={16}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Icon */}
                      <View
                        style={[
                          styles.gridCardIcon,
                          {
                            backgroundColor: `${subcategory.color}15`,
                            borderColor: `${subcategory.color}30`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={subcategory.icon as any}
                          size={24}
                          color={subcategory.color}
                        />
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1, justifyContent: "center" }}>
                        <Text
                          style={[styles.gridCardTitle, { color: colors.text }]}
                          numberOfLines={2}
                        >
                          {subcategory.name}
                        </Text>
                        <Text
                          style={[
                            styles.gridCardBank,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {subcategory.isSystemCard
                            ? `${subcategory.institution || "Unknown"}`
                            : `${subcategory.bank}`}
                        </Text>
                      </View>

                      {/* Amount */}
                      <View>
                        <Text
                          style={[
                            styles.gridCardAmount,
                            { color: subcategory.color },
                          ]}
                        >
                          {formatCurrency(subcategory.value)}
                        </Text>
                        <Text
                          style={[
                            styles.gridCardPercentage,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {subcategory.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Financial Summary */}
            <View
              style={[
                styles.subcategoryFinancialSummary,
                { backgroundColor: colors.card },
              ]}
            >
              <Text
                style={[
                  styles.subcategoryFinancialTitle,
                  { color: colors.text },
                ]}
              >
                Financial Summary
              </Text>
              <View style={styles.subcategoryFinancialGrid}>
                <View style={styles.subcategoryFinancialItem}>
                  <Text
                    style={[
                      styles.subcategoryFinancialNumber,
                      { color: colors.primary },
                    ]}
                  >
                    {selectedAssetSubcategories.length}
                  </Text>
                  <Text
                    style={[
                      styles.subcategoryFinancialLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Subcategories
                  </Text>
                </View>
                <View style={styles.subcategoryFinancialItem}>
                  <Text
                    style={[
                      styles.subcategoryFinancialNumber,
                      { color: colors.primary },
                    ]}
                  >
                    {formatCurrency(selectedLiability.value)}
                  </Text>
                  <Text
                    style={[
                      styles.subcategoryFinancialLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Total Value
                  </Text>
                </View>
                <View style={styles.subcategoryFinancialItem}>
                  <Text
                    style={[
                      styles.subcategoryFinancialNumber,
                      { color: selectedLiability.color },
                    ]}
                  >
                    {selectedLiability.percentage}%
                  </Text>
                  <Text
                    style={[
                      styles.subcategoryFinancialLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Portfolio %
                  </Text>
                </View>
                <View style={styles.subcategoryFinancialItem}>
                  <Text
                    style={[
                      styles.subcategoryFinancialNumber,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedLiability.items}
                  </Text>
                  <Text
                    style={[
                      styles.subcategoryFinancialLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Total Items
                  </Text>
                </View>
              </View>
            </View>

            {/* Popup Menu for Asset Subcategories - Inside Modal */}
            {showPopupMenu && (
              <Modal
                transparent={true}
                visible={showPopupMenu}
                onRequestClose={closePopupMenu}
              >
                <TouchableWithoutFeedback onPress={closePopupMenu}>
                  <View style={styles.popupOverlay}>
                    <View
                      style={[
                        styles.popupMenu,
                        styles.smallerPopupMenu, // Make it smaller
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          top: menuPosition.y,
                          left: menuPosition.x,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={[styles.popupMenuItem, styles.smallerMenuItem]}
                        onPress={() => handleMenuAction("add")}
                      >
                        <View
                          style={[
                            styles.popupMenuIcon,
                            styles.smallerMenuIcon,
                            { backgroundColor: `${colors.primary}20` },
                          ]}
                        >
                          <Ionicons
                            name="add"
                            size={14}
                            color={colors.primary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.popupMenuText,
                            styles.smallerMenuText,
                            { color: colors.text, fontWeight: "600" },
                          ]}
                        >
                          Add Entry
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.popupMenuSeparator,
                          { backgroundColor: colors.border },
                        ]}
                      />

                      <TouchableOpacity
                        style={[styles.popupMenuItem, styles.smallerMenuItem]}
                        onPress={() => handleMenuAction("view")}
                      >
                        <View
                          style={[
                            styles.popupMenuIcon,
                            styles.smallerMenuIcon,
                            { backgroundColor: `${colors.primary}10` },
                          ]}
                        >
                          <Ionicons
                            name="eye-outline"
                            size={14}
                            color={colors.primary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.popupMenuText,
                            styles.smallerMenuText,
                            { color: colors.text },
                          ]}
                        >
                          View Details
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.popupMenuSeparator,
                          { backgroundColor: colors.border },
                        ]}
                      />

                      <TouchableOpacity
                        style={[styles.popupMenuItem, styles.smallerMenuItem]}
                        onPress={() => handleMenuAction("edit")}
                      >
                        <View
                          style={[
                            styles.popupMenuIcon,
                            styles.smallerMenuIcon,
                            { backgroundColor: `${colors.textSecondary}10` },
                          ]}
                        >
                          <Ionicons
                            name="create-outline"
                            size={14}
                            color={colors.textSecondary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.popupMenuText,
                            styles.smallerMenuText,
                            { color: colors.text },
                          ]}
                        >
                          Edit Entry
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.popupMenuSeparator,
                          { backgroundColor: colors.border },
                        ]}
                      />

                      <TouchableOpacity
                        style={[styles.popupMenuItem, styles.smallerMenuItem]}
                        onPress={() => handleMenuAction("delete")}
                      >
                        <View
                          style={[
                            styles.popupMenuIcon,
                            styles.smallerMenuIcon,
                            { backgroundColor: "#EF444420" },
                          ]}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={14}
                            color="#EF4444"
                          />
                        </View>
                        <Text
                          style={[
                            styles.popupMenuText,
                            styles.smallerMenuText,
                            { color: "#EF4444" },
                          ]}
                        >
                          Delete Entry
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}
          </View>
        </Modal>
      )}

      {/* Add Net Worth Entry Modal */}
      <AddNetWorthEntryModal
        visible={showAddEntryModal}
        onClose={() => setShowAddEntryModal(false)}
        onSave={handleEntryModalSave}
        categoryType={entryType}
        preSelectedCategory={selectedEntryCategory}
        preSelectedSubcategory={selectedEntrySubcategory}
      />

      {/* Fixed Deposits Modal */}
      <FixedDepositsModal
        visible={showFixedDepositsModal}
        onClose={() => setShowFixedDepositsModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  fullNavContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fullNavButtonGroup: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
  },
  fullNavButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 5,
  },
  activeFullNav: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  fullNavText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: "auto",
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  netWorthCard: {
    margin: 12,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: "hidden",
  },
  netWorthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  netWorthTitleSection: {
    flex: 1,
  },
  netWorthTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  netWorthTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
    alignSelf: "flex-start",
  },
  trendText: {
    fontSize: 11,
    fontWeight: "700",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  netWorthValueSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  netWorthValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 12,
  },
  netWorthValue: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    flex: 1,
  },
  trendBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  trendTextInline: {
    fontSize: 12,
    fontWeight: "700",
  },
  netWorthChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  netWorthSubtext: {
    fontSize: 13,
    fontWeight: "600",
  },
  assetsLiabilitiesSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  assetCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginHorizontal: 4,
    position: "relative",
    overflow: "hidden",
  },
  assetCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  assetIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  assetLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "left",
    lineHeight: 14,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  assetValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtext: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.9,
  },
  assetSubtext: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.9,
  },
  liabilityCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginHorizontal: 4,
    position: "relative",
    overflow: "hidden",
  },
  liabilityCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  liabilityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  liabilityLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "left",
    lineHeight: 14,
  },
  liabilityValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  liabilitySubtext: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.9,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  detailedListSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  detailedListTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailedListContainer: {
    gap: 8,
  },
  detailedListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  detailedListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailedListContent: {
    flex: 1,
  },
  detailedListName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  detailedListCategory: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailedListRight: {
    alignItems: "flex-end",
  },
  detailedListValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  detailedListRemaining: {
    fontSize: 11,
    fontWeight: "500",
  },
  subcategoryScreen: {
    flex: 1,
  },
  subcategoryScreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  subcategoryBackButton: {
    padding: 8,
  },
  subcategoryScreenTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  subcategoryHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  subcategoryAddButton: {
    padding: 8,
    marginRight: 8,
  },
  subcategoryMoreButton: {
    padding: 8,
  },
  subcategorySummaryCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subcategorySummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  subcategorySummaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subcategorySummaryContent: {
    flex: 1,
  },
  subcategorySummaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subcategorySummarySubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  subcategorySummaryValue: {
    alignItems: "flex-end",
  },
  subcategorySummaryAmount: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  subcategoryListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Grid View Styles - Matching Asset Breakdown card sizes
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  gridCard: {
    width: "31.5%", // 3 columns like Asset Breakdown
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    minHeight: 140,
    justifyContent: "space-between",
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  gridCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  gridCardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridCardBadgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  gridCardMenuButton: {
    padding: 2,
    marginTop: -2,
    marginRight: -4,
  },
  gridCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
    borderWidth: 2,
  },
  gridCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    minHeight: 32,
    lineHeight: 16,
  },
  gridCardBank: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  gridCardAmount: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  gridCardPercentage: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  subcategoryListItem: {
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  subcategoryListItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  subcategoryListItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subcategoryListItemDetails: {
    flex: 1,
  },
  subcategoryListItemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  subcategoryListItemBank: {
    fontSize: 14,
    fontWeight: "500",
  },
  subcategoryListItemValue: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  subcategoryListItemAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  subcategoryListItemPercentage: {
    fontSize: 12,
    fontWeight: "500",
  },
  subcategoryListItemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  subcategoryActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  subcategoryFinancialSummary: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subcategoryFinancialTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  subcategoryFinancialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  subcategoryFinancialItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 12,
  },
  subcategoryFinancialNumber: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subcategoryFinancialLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  assetsLiabilities: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  assetLiabilityItem: {
    alignItems: "center",
  },
  alLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  alValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  assetsLiabilitiesCompact: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  assetLiabilityItemCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alTextContainer: {
    flex: 1,
  },
  alLabelCompact: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 1,
  },
  alValueCompact: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarCompact: {
    height: 3,
    borderRadius: 2,
  },
  progressFillCompact: {
    height: "100%",
    width: "78.5%",
    borderRadius: 2,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  generationText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toggleButtons: {
    flexDirection: "row",
    marginLeft: "auto",
    gap: 4,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  categoriesWrapper: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 0, // Further reduced to maximize card space
    paddingBottom: 20,
  },
  gridItem: {
    width: "31.8%", // Optimized to use maximum available space while maintaining 3 columns
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },
  systemCardBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    minHeight: 32,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    marginBottom: 2,
  },
  categoryItems: {
    fontSize: 11,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemRight: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  categorySummary: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13, // Slightly smaller but more refined
    fontWeight: "600", // Bolder
    textAlign: "center",
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  summaryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  summarySubtext: {
    fontSize: 13,
  },
  assetDetails: {
    flex: 1,
    paddingHorizontal: 20,
  },
  assetDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  assetDetailContent: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  assetDate: {
    fontSize: 12,
  },
  assetDetailRight: {
    alignItems: "flex-end",
  },
  assetActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  financialSummary: {
    margin: 20,
    marginTop: 20, // Reduced top margin
    padding: 16, // Reduced padding for compactness
    borderRadius: 16, // Slightly less rounded
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12, // Reduced margin
  },
  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryEmoji: {
    fontSize: 18,
  },
  summaryTitle: {
    fontSize: 18, // Reduced font size for compactness
    fontWeight: "700", // Slightly less bold
    letterSpacing: -0.3,
  },
  summaryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  summaryBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 20, // Increased margin
    padding: 16, // Added padding
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.02)", // Subtle background
  },
  highlightedItem: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryIcon: {
    fontSize: 24,
  },
  summaryNumber: {
    fontSize: 28, // Increased font size
    fontWeight: "800", // Bolder
    marginBottom: 6,
    letterSpacing: -0.8,
  },
  primaryNumber: {
    textShadowColor: "rgba(16, 185, 129, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  goldNumber: {
    textShadowColor: "rgba(245, 158, 11, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  purpleNumber: {
    textShadowColor: "rgba(139, 92, 246, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Compact Summary Styles
  compactSummaryGrid: {
    gap: 8,
  },
  compactSummaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  compactSummaryItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  compactItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compactIcon: {
    fontSize: 20,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactNumber: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Enhanced Skeleton Loading Styles
  skeletonText: {
    borderRadius: 4,
    opacity: 0.6,
  },
  skeletonTitle: {
    width: "60%",
    height: 20,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: "40%",
    height: 14,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.6,
  },
  skeletonNav: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    opacity: 0.6,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },

  // Main Net Worth Card Skeleton
  skeletonMainNetWorthCard: {
    height: 140,
    justifyContent: "space-between",
  },
  skeletonNetWorthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  skeletonNetWorthTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skeletonNetWorthIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  skeletonNetWorthTitle: {
    width: 80,
    height: 16,
  },
  skeletonAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  skeletonMainValue: {
    width: "60%",
    height: 32,
    marginBottom: 12,
  },
  skeletonNetWorthFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonChangeText: {
    width: "50%",
    height: 14,
  },
  skeletonChip: {
    width: 60,
    height: 24,
    borderRadius: 12,
  },
  skeletonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.6,
  },

  // Asset/Liability Cards Skeleton
  skeletonAssetCard: {
    flex: 1,
    marginRight: 8,
    height: 120,
    justifyContent: "space-between",
  },
  skeletonLiabilityCard: {
    flex: 1,
    marginLeft: 8,
    height: 120,
    justifyContent: "space-between",
  },
  skeletonAssetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  skeletonAssetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  skeletonAssetIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  skeletonAssetTitleContainer: {
    flex: 1,
  },
  skeletonAssetTitle: {
    width: "80%",
    height: 14,
    marginBottom: 4,
  },
  skeletonAssetSubtitle: {
    width: "60%",
    height: 12,
  },
  skeletonSmallCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  skeletonAssetValue: {
    width: "50%",
    height: 24,
    marginBottom: 8,
  },
  skeletonAssetPercentage: {
    width: "70%",
    height: 12,
  },

  // Asset Allocation Skeleton
  skeletonAllocationContainer: {
    marginTop: 16,
  },
  skeletonAllocationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skeletonAllocationTitle: {
    width: "40%",
    height: 16,
  },
  skeletonAllocationPercentage: {
    width: "20%",
    height: 16,
  },
  skeletonProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  skeletonProgressFill: {
    width: "75%",
    height: "100%",
    borderRadius: 4,
  },
  skeletonAllocationLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonAllocationLabel: {
    width: "25%",
    height: 12,
  },

  // Generation Section Skeleton
  skeletonGenerationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  skeletonGenerationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonGenerationTitle: {
    width: "30%",
    height: 18,
  },
  skeletonGenerationButtons: {
    flexDirection: "row",
    gap: 8,
  },
  skeletonGenerationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  // Breakdown Section Skeleton
  skeletonBreakdownContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  skeletonBreakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonBreakdownTitle: {
    width: "40%",
    height: 20,
  },
  skeletonButton: {
    width: 100,
    height: 32,
    borderRadius: 16,
  },

  // Grid Items Skeleton
  skeletonGridItem: {
    width: "31.8%",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
    marginBottom: 12,
  },
  skeletonGridContent: {
    alignItems: "center",
    width: "100%",
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
    opacity: 0.6,
  },
  skeletonGridTitle: {
    width: "80%",
    height: 14,
    marginBottom: 4,
  },
  skeletonGridValue: {
    width: "60%",
    height: 18,
    marginBottom: 4,
  },
  skeletonGridSubtext: {
    width: "50%",
    height: 12,
  },
  skeletonGridFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    width: "100%",
  },
  skeletonGridPercentage: {
    width: "30%",
    height: 12,
  },
  skeletonGridItems: {
    width: "40%",
    height: 12,
  },
  skeletonShieldBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  skeletonShieldIcon: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },

  // Financial Summary Skeleton
  skeletonFinancialSummary: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  skeletonSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  skeletonSummaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skeletonEmoji: {
    width: 18,
    height: 18,
    borderRadius: 9,
    opacity: 0.6,
  },
  skeletonSummaryTitle: {
    width: 80,
    height: 18,
  },
  skeletonSummaryButton: {
    width: 70,
    height: 28,
    borderRadius: 14,
  },

  // Compact Grid Skeleton
  skeletonCompactGrid: {
    gap: 8,
  },
  skeletonCompactRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  skeletonCompactItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skeletonCompactText: {
    flex: 1,
  },
  skeletonCompactNumber: {
    width: 30,
    height: 16,
    marginBottom: 4,
  },
  skeletonCompactLabel: {
    width: 50,
    height: 11,
  },
  summaryContainer: {
    paddingHorizontal: 20,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  addAssetModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalContent: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  formFieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  fieldSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
  },
  toggleField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignSelf: "flex-end",
  },
  modalButtons: {
    padding: 20,
    gap: 12,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Sort modal styles
  sortModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  sortModal: {
    marginHorizontal: 40,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sortOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  // New Add Entry Button Styles
  floatingActionButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionAddButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  sectionAddButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  cardQuickAddButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginLeft: "auto",
  },

  // Clean Subcategory Card Styles
  enhancedSubcategoryCard: {
    marginHorizontal: 0, // Full width like header card
    marginVertical: 8, // Good separation
    borderRadius: 16, // Modern rounded corners
    borderLeftWidth: 4, // Accent border
    padding: 16, // Clean spacing
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },

  // New single row card layout styles
  cardSingleRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "right",
  },
  cardAmountSection: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  cardPercentage: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
  cardThreeDotsButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  enhancedCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  enhancedCardIcon: {
    width: 44, // Increased for better prominence
    height: 44, // Increased for better prominence
    borderRadius: 12, // Increased for modern look
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14, // Increased for better spacing
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  enhancedCardInfo: {
    flex: 1,
  },
  enhancedCardTitle: {
    fontSize: 16, // Increased for better readability
    fontWeight: "700",
    marginBottom: 3, // Increased for better spacing
    letterSpacing: -0.3, // Tighter letter spacing for modern look
  },
  enhancedCardSubtitle: {
    fontSize: 14, // Increased for better readability
    fontWeight: "500",
    opacity: 0.8, // Subtle opacity for hierarchy
  },
  enhancedCardRight: {
    alignItems: "flex-end",
  },
  enhancedCardAmount: {
    fontSize: 18, // Increased for better prominence
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: -0.5, // Tighter spacing for numbers
  },
  enhancedCardPercentage: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8, // Subtle opacity for hierarchy
  },
  enhancedCardDetails: {
    flexDirection: "row",
    justifyContent: "space-between", // Changed from flexWrap
    alignItems: "center",
    marginBottom: 8, // Reduced from 16
    paddingVertical: 6, // Reduced padding
  },
  enhancedCardDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // Reduced from 6
  },
  enhancedCardDetailText: {
    fontSize: 12, // Reduced from 13
    fontWeight: "500",
  },
  enhancedCardActions: {
    flexDirection: "row",
    justifyContent: "space-around", // Changed from space-between
    alignItems: "center",
    paddingTop: 8, // Reduced from 12
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  enhancedActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8, // Reduced from 12
    paddingVertical: 6, // Reduced from 8
    borderRadius: 6, // Reduced from 8
    minWidth: 32, // Reduced from 40
  },
  primaryAction: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12, // Reduced from 16
    gap: 4, // Reduced from 6
  },
  secondaryAction: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  enhancedActionText: {
    color: "white",
    fontSize: 12, // Reduced from 13
    fontWeight: "600",
  },

  // New styles for three-dot menu and full-width cards
  enhancedCardAmountContainer: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  threeDotsButton: {
    padding: 10, // Increased for better touch target
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)", // Subtle background
    marginLeft: 8, // Add margin for spacing
  },
  addEntryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  addEntryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // Updated card number badge styles - positioned relative to icon
  cardNumberBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 2,
  },
  cardNumberText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // New card element styles
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative", // For badge positioning
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
    opacity: 0.8,
  },
  cardAccountDetails: {
    fontSize: 11,
    fontWeight: "400",
    opacity: 0.6,
    fontStyle: "italic",
  },

  // Enhanced popup menu styles
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Darker overlay for better visibility
  },
  popupMenu: {
    position: "absolute",
    minWidth: 180,
    maxWidth: 220,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 8, // Increased shadow
    },
    shadowOpacity: 0.25, // Increased opacity
    shadowRadius: 16, // Increased radius
    elevation: 16, // Increased elevation for Android
    paddingVertical: 12,
    zIndex: 9999, // Ensure it's on top
  },
  // Smaller popup menu for subcategory modals
  smallerPopupMenu: {
    minWidth: 140,
    maxWidth: 160,
    borderRadius: 12,
    paddingVertical: 8,
  },
  popupMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18, // Increased padding
    paddingVertical: 14, // Increased padding
    gap: 14, // Increased gap
  },
  // Smaller menu items
  smallerMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  primaryMenuItem: {
    backgroundColor: "rgba(0,0,0,0.02)", // Subtle highlight for primary action
  },
  popupMenuIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // Smaller menu icons
  smallerMenuIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  popupMenuText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  // Smaller menu text
  smallerMenuText: {
    fontSize: 13,
    fontWeight: "500",
  },
  popupMenuSeparator: {
    height: 1,
    marginHorizontal: 18, // Increased margin
    opacity: 0.3, // More subtle
  },
});

export default MobileNetWorth;
