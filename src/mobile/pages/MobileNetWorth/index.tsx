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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import {
  fetchFormattedCategoriesForUI,
  initializeDefaultCategories,
  createSampleNetWorthEntries,
} from "../../../../services/netWorthService";

// Import the new Add Net Worth Entry Modal
import AddNetWorthEntryModal from "../../components/NetWorth/AddNetWorthEntryModal";

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
}

const MobileNetWorth: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const route = useRoute();
  const { isDemo } = useDemoMode();

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

  // Add Net Worth Entry Modal state
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [selectedEntryCategory, setSelectedEntryCategory] =
    useState<string>("");
  const [selectedEntrySubcategory, setSelectedEntrySubcategory] =
    useState<string>("");
  const [entryType, setEntryType] = useState<"asset" | "liability">("asset");

  // Real data state
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [liabilityCategories, setLiabilityCategories] = useState<
    AssetCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle route params to show add asset modal
  useEffect(() => {
    if (route.params && (route.params as any).showAddAssetModal) {
      setShowAddAssetModal(true);
    }
  }, [route.params]);

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize default categories if needed
        await initializeDefaultCategories(isDemo);

        // Create sample net worth entries if needed
        await createSampleNetWorthEntries(isDemo);

        // Fetch assets and liabilities
        const [assets, liabilities] = await Promise.all([
          fetchFormattedCategoriesForUI("asset", isDemo),
          fetchFormattedCategoriesForUI("liability", isDemo),
        ]);

        setAssetCategories(assets);
        setLiabilityCategories(liabilities);
      } catch (err) {
        console.error("Error fetching net worth data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");

        // Fallback to sample data if there's an error
        setAssetCategories(sampleAssetCategories);
        setLiabilityCategories(sampleLiabilityCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDemo]);

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
    // Trigger data refresh
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize default categories if needed
        await initializeDefaultCategories(isDemo);

        // Create sample entries if needed
        await createSampleNetWorthEntries(isDemo);

        // Fetch formatted data for UI
        const data = await fetchFormattedCategoriesForUI(isDemo);

        // Separate assets and liabilities
        const assets = data.filter((cat) => cat.type === "asset");
        const liabilities = data.filter((cat) => cat.type === "liability");

        setAssetCategories(assets);
        setLiabilityCategories(liabilities);
      } catch (error) {
        console.error("Error fetching net worth data:", error);
        setError("Failed to load net worth data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const totalAssets = assetCategories.reduce((sum, cat) => sum + cat.value, 0);
  const totalLiabilities = liabilityCategories.reduce(
    (sum, cat) => sum + cat.value,
    0
  );

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
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.gridItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => {
          setSelectedLiability(item);
          // Use existing assets data as subcategories
          const subcategoryData =
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
            })) || [];
          setSelectedAssetSubcategories(subcategoryData);
          setShowAssetSubcategoryModal(true);
        }}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}
        >
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <Text
          style={[styles.categoryName, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text style={[styles.categoryValue, { color: item.color }]}>
          ₹{(item.value / 100000).toFixed(1)}L
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

  const renderListItem = ({ item }: { item: AssetCategory }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => {
        setSelectedLiability(item);
        // Use existing assets data as subcategories
        const subcategoryData =
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
          })) || [];
        setSelectedAssetSubcategories(subcategoryData);
        setShowAssetSubcategoryModal(true);
      }}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}
      >
        <Ionicons name={item.icon as any} size={24} color={item.color} />
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
          ₹{(item.value / 100000).toFixed(1)}L
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
          ₹{(item.value / 100000).toFixed(2)}L
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

  // Show loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="refresh" size={32} color={colors.textSecondary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Net Worth Data...
        </Text>
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
            <Ionicons name="wallet" size={16} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
              Accounts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fullNavButton]}
            onPress={() => (navigation as any).navigate("MobileCredit")}
          >
            <Ionicons name="card" size={16} color={colors.textSecondary} />
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
            <Ionicons name="trending-up" size={16} color="white" />
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
              <View
                style={[styles.trendBadge, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="arrow-up" size={10} color="white" />
                <Text style={[styles.trendText, { color: "white" }]}>
                  +8.5%
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
            <Text style={[styles.netWorthValue, { color: colors.text }]}>
              ₹77,17,500
            </Text>
            <View style={styles.netWorthChangeRow}>
              <Ionicons name="trending-up" size={12} color={colors.primary} />
              <Text style={[styles.netWorthSubtext, { color: colors.primary }]}>
                +₹6,12,000 since last month
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
                  styles.assetValue,
                  {
                    color: selectedView === "assets" ? "white" : "#10B981",
                  },
                ]}
              >
                ₹{(totalAssets / 10000000).toFixed(1)}Cr
              </Text>
              <Text
                style={[
                  styles.assetSubtext,
                  {
                    color:
                      selectedView === "assets"
                        ? "rgba(255,255,255,0.9)"
                        : "#047857",
                  },
                ]}
              >
                {(
                  (totalAssets / (totalAssets + totalLiabilities)) *
                  100
                ).toFixed(1)}
                % of portfolio
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
                >
                  Total Liabilities
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
                  styles.liabilityValue,
                  {
                    color: selectedView === "liabilities" ? "white" : "#EF4444",
                  },
                ]}
              >
                ₹{(totalLiabilities / 100000).toFixed(1)}L
              </Text>
              <Text
                style={[
                  styles.liabilitySubtext,
                  {
                    color:
                      selectedView === "liabilities"
                        ? "rgba(255,255,255,0.9)"
                        : "#B91C1C",
                  },
                ]}
              >
                {(
                  (totalLiabilities / (totalAssets + totalLiabilities)) *
                  100
                ).toFixed(1)}
                % of portfolio
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
                78.5%
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
                    width: "78.5%",
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
                {assetCategories.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.detailedListItem,
                      { backgroundColor: colors.card },
                    ]}
                    onPress={() => setSelectedCategory(item)}
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
                        ₹{(item.value / 100000).toFixed(1)}L
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
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
                {liabilityCategories.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.gridItem,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
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
                              (item.value / item.subcategories.length) *
                                (0.8 + Math.random() * 0.4)
                            ), // Randomize values
                            percentage:
                              (100 / item.subcategories.length) *
                              (0.8 + Math.random() * 0.4),
                            icon: item.icon,
                            color: item.color,
                            bank: item.bank,
                            emi: Math.floor(
                              item.emi / item.subcategories.length
                            ),
                            remaining:
                              Math.floor(
                                item.remaining / item.subcategories.length
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
                        styles.iconContainer,
                        { backgroundColor: `${item.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={24}
                        color={item.color}
                      />
                    </View>
                    <Text
                      style={[styles.categoryName, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.categoryValue, { color: item.color }]}>
                      ₹{(item.value / 100000).toFixed(1)}L
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
                      {item.bank}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                              (item.value / item.subcategories.length) *
                                (0.8 + Math.random() * 0.4)
                            ), // Randomize values
                            percentage:
                              (100 / item.subcategories.length) *
                              (0.8 + Math.random() * 0.4),
                            icon: item.icon,
                            color: item.color,
                            bank: item.bank,
                            emi: Math.floor(
                              item.emi / item.subcategories.length
                            ),
                            remaining:
                              Math.floor(
                                item.remaining / item.subcategories.length
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
                        {item.bank} • EMI: ₹{item.emi.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailedListRight}>
                      <Text
                        style={[
                          styles.detailedListValue,
                          { color: item.color },
                        ]}
                      >
                        ₹{(item.value / 100000).toFixed(1)}L
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

        {/* Financial Summary */}
        <View
          style={[
            styles.financialSummary,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Financial Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                {assetCategories.length}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Asset Classes
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                {assetCategories.reduce((sum, cat) => sum + cat.items, 0)}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Total Assets
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: "#F59E0B" }]}>
                ₹{Math.max(...assetCategories.map((cat) => cat.value)) / 100000}
                L
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Largest Asset
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: "#8B5CF6" }]}>
                {Math.max(...assetCategories.map((cat) => cat.percentage))}%
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Top Allocation
              </Text>
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
                    ₹{(selectedLiability.value / 100000).toFixed(1)}L
                  </Text>
                  <Ionicons
                    name="chevron-up"
                    size={16}
                    color={selectedLiability.color}
                  />
                </View>
              </View>
            </View>

            {/* Subcategory List */}
            <ScrollView style={styles.subcategoryListContainer}>
              {selectedLiabilitySubcategories.map((subcategory, index) => (
                <View
                  key={subcategory.id}
                  style={[
                    styles.subcategoryListItem,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <View style={styles.subcategoryListItemContent}>
                    <View
                      style={[
                        styles.subcategoryListItemIcon,
                        { backgroundColor: `${subcategory.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={subcategory.icon as any}
                        size={20}
                        color={subcategory.color}
                      />
                    </View>
                    <View style={styles.subcategoryListItemDetails}>
                      <Text
                        style={[
                          styles.subcategoryListItemName,
                          { color: colors.text },
                        ]}
                      >
                        {subcategory.name}
                      </Text>
                      <Text
                        style={[
                          styles.subcategoryListItemBank,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {subcategory.bank} • EMI: ₹
                        {subcategory.emi.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.subcategoryListItemValue}>
                      <Text
                        style={[
                          styles.subcategoryListItemAmount,
                          { color: subcategory.color },
                        ]}
                      >
                        ₹{(subcategory.value / 100000).toFixed(1)}L
                      </Text>
                      <Text
                        style={[
                          styles.subcategoryListItemPercentage,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {subcategory.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.subcategoryListItemActions}>
                      <TouchableOpacity
                        style={styles.subcategoryActionButton}
                        onPress={() =>
                          handleAddEntry(
                            selectedLiability?.id || "",
                            subcategory.id || "",
                            "liability"
                          )
                        }
                      >
                        <Ionicons name="add" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.subcategoryActionButton}>
                        <Ionicons
                          name="eye"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.subcategoryActionButton}>
                        <Ionicons
                          name="pencil"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.subcategoryActionButton}>
                        <Ionicons
                          name="trash"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
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
                    ₹{(selectedLiability.value / 100000).toFixed(1)}L
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
                    ₹{(selectedLiability.value / 100000).toFixed(1)}L
                  </Text>
                  <Ionicons
                    name="chevron-up"
                    size={16}
                    color={selectedLiability.color}
                  />
                </View>
              </View>
            </View>

            {/* Subcategory List */}
            <ScrollView style={styles.subcategoryListContainer}>
              {selectedAssetSubcategories.map((subcategory, index) => (
                <View
                  key={subcategory.id}
                  style={[
                    styles.subcategoryListItem,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <View style={styles.subcategoryListItemContent}>
                    <View
                      style={[
                        styles.subcategoryListItemIcon,
                        { backgroundColor: `${subcategory.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={subcategory.icon as any}
                        size={20}
                        color={subcategory.color}
                      />
                    </View>
                    <View style={styles.subcategoryListItemDetails}>
                      <Text
                        style={[
                          styles.subcategoryListItemName,
                          { color: colors.text },
                        ]}
                      >
                        {subcategory.name}
                      </Text>
                      <Text
                        style={[
                          styles.subcategoryListItemBank,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {subcategory.bank} • Investment
                      </Text>
                    </View>
                    <View style={styles.subcategoryListItemValue}>
                      <Text
                        style={[
                          styles.subcategoryListItemAmount,
                          { color: subcategory.color },
                        ]}
                      >
                        ₹{(subcategory.value / 100000).toFixed(1)}L
                      </Text>
                      <Text
                        style={[
                          styles.subcategoryListItemPercentage,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {subcategory.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.subcategoryListItemActions}>
                      <TouchableOpacity
                        style={styles.subcategoryActionButton}
                        onPress={() =>
                          handleAddEntry(
                            selectedCategory?.id || "",
                            subcategory.id || "",
                            "asset"
                          )
                        }
                      >
                        <Ionicons name="add" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.subcategoryActionButton}>
                        <Ionicons
                          name="eye"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.subcategoryActionButton}>
                        <Ionicons
                          name="pencil"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.subcategoryActionButton}>
                        <Ionicons
                          name="trash"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
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
                    ₹{(selectedLiability.value / 100000).toFixed(1)}L
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
    paddingVertical: 16,
  },
  fullNavButtonGroup: {
    flexDirection: "row",
    borderRadius: 25,
    padding: 4,
  },
  fullNavButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeFullNav: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullNavText: {
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 16,
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
  netWorthValue: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.5,
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
  },
  assetValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
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
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    width: "78%",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  gridItem: {
    width: "32%",
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
    fontSize: 14,
    fontWeight: "500",
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
  assetValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
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
    marginTop: 30,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
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
  addButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
});

export default MobileNetWorth;
