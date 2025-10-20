/**
 * POPULATE NET WORTH DATABASE FROM MOBILE APP DATA
 * =============================================================================
 *
 * This script extracts the asset and liability data from your mobile app
 * and populates the database using the existing CRUD service functions.
 *
 * Usage: npx tsx scripts/populateNetWorthFromMobileData.ts
 */

import {
  createCategory,
  createSubcategory,
  bulkCreateCategories,
  fetchCategories,
} from "../services/netWorthService";

import type {
  CreateCategoryInput,
  CreateSubcategoryInput,
  BulkCreateCategoryInput,
} from "../types/netWorth";

// =============================================================================
// MOBILE APP DATA EXTRACTION
// =============================================================================

const MOBILE_ASSET_CATEGORIES = [
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
];

const MOBILE_LIABILITY_CATEGORIES = [
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
];

// =============================================================================
// TRANSFORMATION FUNCTIONS
// =============================================================================

function transformAssetCategoryToBulkInput(
  mobileCategory: any
): BulkCreateCategoryInput {
  return {
    name: mobileCategory.name,
    type: "asset",
    icon: mobileCategory.icon,
    color: mobileCategory.color,
    description: `${
      mobileCategory.name
    } - Value: ₹${mobileCategory.value.toLocaleString()}`,
    sort_order: parseInt(mobileCategory.id),
    subcategories: mobileCategory.assets?.map((asset: any) => asset.name) || [],
  };
}

function transformLiabilityCategoryToBulkInput(
  mobileCategory: any
): BulkCreateCategoryInput {
  return {
    name: mobileCategory.name,
    type: "liability",
    icon: mobileCategory.icon,
    color: mobileCategory.color,
    description: `${
      mobileCategory.name
    } - Value: ₹${mobileCategory.value.toLocaleString()} | Bank: ${
      mobileCategory.bank
    } | EMI: ₹${mobileCategory.emi}`,
    sort_order: parseInt(mobileCategory.id.replace("l", "")),
    subcategories: mobileCategory.subcategories || [],
  };
}

// =============================================================================
// POPULATION FUNCTIONS
// =============================================================================

async function populateAssetCategories(isDemo: boolean = false) {
  console.log("🏦 Populating Asset Categories...");

  const assetBulkData = MOBILE_ASSET_CATEGORIES.map(
    transformAssetCategoryToBulkInput
  );

  try {
    const results = await bulkCreateCategories(assetBulkData, isDemo);
    console.log(`✅ Created ${results.length} asset categories:`);
    results.forEach((result) => {
      console.log(
        `  - ${result.category.name}: ${result.subcategories.length} subcategories`
      );
    });
  } catch (error) {
    console.error("❌ Error creating asset categories:", error);
    throw error;
  }
}

async function populateLiabilityCategories(isDemo: boolean = false) {
  console.log("💳 Populating Liability Categories...");

  const liabilityBulkData = MOBILE_LIABILITY_CATEGORIES.map(
    transformLiabilityCategoryToBulkInput
  );

  try {
    const results = await bulkCreateCategories(liabilityBulkData, isDemo);
    console.log(`✅ Created ${results.length} liability categories:`);
    results.forEach((result) => {
      console.log(
        `  - ${result.category.name}: ${result.subcategories.length} subcategories`
      );
    });
  } catch (error) {
    console.error("❌ Error creating liability categories:", error);
    throw error;
  }
}

async function verifyPopulation(isDemo: boolean = false) {
  console.log("🔍 Verifying Population...");

  try {
    const allCategories = await fetchCategories("all", isDemo);
    const assetCategories = allCategories.filter((cat) => cat.type === "asset");
    const liabilityCategories = allCategories.filter(
      (cat) => cat.type === "liability"
    );

    console.log(`✅ Total Categories: ${allCategories.length}`);
    console.log(`  - Assets: ${assetCategories.length}`);
    console.log(`  - Liabilities: ${liabilityCategories.length}`);

    console.log("\n📊 Asset Categories:");
    assetCategories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.icon}) - ${cat.color}`);
    });

    console.log("\n💸 Liability Categories:");
    liabilityCategories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.icon}) - ${cat.color}`);
    });
  } catch (error) {
    console.error("❌ Error verifying population:", error);
    throw error;
  }
}

// =============================================================================
// MAIN EXECUTION FUNCTION
// =============================================================================

async function populateNetWorthFromMobileData(isDemo: boolean = false) {
  const mode = isDemo ? "DEMO" : "PRODUCTION";
  console.log(
    `🚀 Starting Net Worth Population from Mobile Data (${mode})...\n`
  );

  try {
    // Check if categories already exist
    const existingCategories = await fetchCategories("all", isDemo);
    if (existingCategories.length > 0) {
      console.log(
        `⚠️  Found ${existingCategories.length} existing categories. This will update/merge with existing data.\n`
      );
    }

    // Populate assets
    await populateAssetCategories(isDemo);
    console.log("");

    // Populate liabilities
    await populateLiabilityCategories(isDemo);
    console.log("");

    // Verify the population
    await verifyPopulation(isDemo);

    console.log("\n🎉 Net Worth data population completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("  1. Check your Supabase dashboard to verify the data");
    console.log("  2. Update your mobile app to use the database categories");
    console.log("  3. Test the net worth calculations with real data");
  } catch (error) {
    console.error("\n❌ Population failed:", error);
    throw error;
  }
}

// =============================================================================
// SCRIPT EXECUTION
// =============================================================================

if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);
  const isDemo = args.includes("--demo");
  const isProduction = args.includes("--production");

  if (!isDemo && !isProduction) {
    console.log("❌ Please specify mode: --demo or --production");
    console.log("Usage:");
    console.log("  npx tsx scripts/populateNetWorthFromMobileData.ts --demo");
    console.log(
      "  npx tsx scripts/populateNetWorthFromMobileData.ts --production"
    );
    process.exit(1);
  }

  populateNetWorthFromMobileData(isDemo)
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

export { populateNetWorthFromMobileData };

