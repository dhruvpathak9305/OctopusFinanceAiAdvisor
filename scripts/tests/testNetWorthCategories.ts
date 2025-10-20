/**
 * Test script to verify Net Worth categories and subcategories are working correctly
 */

import {
  fetchCategories,
  fetchSubcategories,
  fetchCategoriesWithSubcategories,
  fetchFormattedCategoriesForUI,
  initializeDefaultCategories,
} from "../services/netWorthService";

async function testNetWorthCategories() {
  console.log("🧪 Testing Net Worth Categories and Subcategories...\n");

  const isDemo = false; // Test with real tables

  try {
    // 1. Initialize default categories
    console.log("1. Initializing default categories...");
    await initializeDefaultCategories(isDemo);
    console.log("✅ Default categories initialized\n");

    // 2. Fetch all categories
    console.log("2. Fetching all categories...");
    const categories = await fetchCategories(isDemo);
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach((cat) => {
      console.log(
        `   - ${cat.name} (${cat.type}) - ${cat.color || "no color"}`
      );
    });
    console.log("");

    // 3. Fetch categories with subcategories
    console.log("3. Fetching categories with subcategories...");
    const assetsWithSubs = await fetchCategoriesWithSubcategories(
      "asset",
      isDemo
    );
    const liabilitiesWithSubs = await fetchCategoriesWithSubcategories(
      "liability",
      isDemo
    );

    console.log(`✅ Assets: ${assetsWithSubs.length} categories`);
    assetsWithSubs.forEach((cat) => {
      console.log(
        `   - ${cat.name}: ${cat.subcategories?.length || 0} subcategories`
      );
      cat.subcategories?.forEach((sub: any) => {
        console.log(`     • ${sub.name}`);
      });
    });

    console.log(`✅ Liabilities: ${liabilitiesWithSubs.length} categories`);
    liabilitiesWithSubs.forEach((cat) => {
      console.log(
        `   - ${cat.name}: ${cat.subcategories?.length || 0} subcategories`
      );
      cat.subcategories?.forEach((sub: any) => {
        console.log(`     • ${sub.name}`);
      });
    });
    console.log("");

    // 4. Test formatted data for UI
    console.log("4. Testing formatted data for mobile UI...");
    const formattedAssets = await fetchFormattedCategoriesForUI(
      "asset",
      isDemo
    );
    const formattedLiabilities = await fetchFormattedCategoriesForUI(
      "liability",
      isDemo
    );

    console.log(`✅ Formatted Assets: ${formattedAssets.length} categories`);
    formattedAssets.forEach((cat) => {
      console.log(`   - ${cat.name}: ₹${cat.value} (${cat.items} items)`);
    });

    console.log(
      `✅ Formatted Liabilities: ${formattedLiabilities.length} categories`
    );
    formattedLiabilities.forEach((cat) => {
      console.log(`   - ${cat.name}: ₹${cat.value} (${cat.items} items)`);
    });

    console.log(
      "\n🎉 All tests passed! Net Worth categories are working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testNetWorthCategories()
    .then(() => {
      console.log("\n✨ Test completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed with error:", error);
      process.exit(1);
    });
}

export { testNetWorthCategories };
