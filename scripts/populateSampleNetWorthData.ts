/**
 * Script to populate sample net worth data
 */

import {
  initializeDefaultCategories,
  createSampleNetWorthEntries,
  fetchFormattedCategoriesForUI,
} from "../services/netWorthService";

async function populateSampleData() {
  console.log("🏗️  Populating sample net worth data...\n");

  const isDemo = false; // Use real tables

  try {
    // 1. Initialize categories
    console.log("1. Initializing default categories...");
    await initializeDefaultCategories(isDemo);
    console.log("✅ Categories initialized\n");

    // 2. Create sample entries
    console.log("2. Creating sample net worth entries...");
    await createSampleNetWorthEntries(isDemo);
    console.log("✅ Sample entries created\n");

    // 3. Verify data
    console.log("3. Verifying data...");
    const [assets, liabilities] = await Promise.all([
      fetchFormattedCategoriesForUI("asset", isDemo),
      fetchFormattedCategoriesForUI("liability", isDemo),
    ]);

    console.log(`✅ Assets: ${assets.length} categories`);
    let totalAssets = 0;
    assets.forEach((cat) => {
      if (cat.value > 0) {
        console.log(
          `   - ${cat.name}: ₹${(cat.value / 100000).toFixed(1)}L (${
            cat.percentage
          }%) - ${cat.items} items`
        );
        totalAssets += cat.value;
      }
    });

    console.log(`✅ Liabilities: ${liabilities.length} categories`);
    let totalLiabilities = 0;
    liabilities.forEach((cat) => {
      if (cat.value > 0) {
        console.log(
          `   - ${cat.name}: ₹${(cat.value / 100000).toFixed(1)}L (${
            cat.percentage
          }%) - ${cat.items} items`
        );
        totalLiabilities += cat.value;
      }
    });

    const netWorth = totalAssets - totalLiabilities;
    console.log(`\n💰 Total Assets: ₹${(totalAssets / 100000).toFixed(1)}L`);
    console.log(
      `💳 Total Liabilities: ₹${(totalLiabilities / 100000).toFixed(1)}L`
    );
    console.log(`📊 Net Worth: ₹${(netWorth / 100000).toFixed(1)}L`);

    console.log(
      "\n🎉 Sample data populated successfully! Your app should now show values."
    );
  } catch (error) {
    console.error("❌ Failed to populate sample data:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateSampleData()
    .then(() => {
      console.log("\n✨ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script failed:", error);
      process.exit(1);
    });
}

export { populateSampleData };
