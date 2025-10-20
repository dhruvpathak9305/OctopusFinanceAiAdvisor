/**
 * =============================================================================
 * NET WORTH CRUD OPERATIONS TEST SCRIPT
 * =============================================================================
 *
 * This script demonstrates how to use the enhanced CRUD operations for
 * net worth categories and subcategories.
 *
 * Usage: npx tsx scripts/testNetWorthCRUD.ts
 */

import {
  fetchCategories,
  fetchSubcategories,
  createCategory,
  createSubcategory,
  updateCategory,
  updateSubcategory,
  deleteCategory,
  deleteSubcategory,
  bulkCreateCategories,
  reorderCategories,
  reorderSubcategories,
  fetchCategoriesWithSubcategories,
  searchCategoriesAndSubcategories,
  initializeDefaultCategories,
} from "../services/netWorthService";

import type {
  CreateCategoryInput,
  CreateSubcategoryInput,
  UpdateCategoryInput,
  UpdateSubcategoryInput,
  BulkCreateCategoryInput,
} from "../types/netWorth";

async function testCRUDOperations() {
  console.log("🚀 Starting Net Worth CRUD Operations Test...\n");

  try {
    // Test 1: Initialize default categories
    console.log("📋 Test 1: Initialize Default Categories");
    await initializeDefaultCategories(true); // Use demo mode
    console.log("✅ Default categories initialized\n");

    // Test 2: Fetch all categories
    console.log("📋 Test 2: Fetch All Categories");
    const allCategories = await fetchCategories("all", true);
    console.log(`✅ Found ${allCategories.length} categories`);
    allCategories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.type}) - ${cat.icon}`);
    });
    console.log("");

    // Test 3: Fetch categories with subcategories
    console.log("📋 Test 3: Fetch Categories with Subcategories");
    const categoriesWithSubs = await fetchCategoriesWithSubcategories(
      "asset",
      true
    );
    console.log(
      `✅ Found ${categoriesWithSubs.length} asset categories with subcategories`
    );
    categoriesWithSubs.forEach((cat) => {
      console.log(
        `  - ${cat.name}: ${cat.subcategories?.length || 0} subcategories`
      );
      cat.subcategories?.forEach((sub) => {
        console.log(`    • ${sub.name}`);
      });
    });
    console.log("");

    // Test 4: Create a new category
    console.log("📋 Test 4: Create New Category");
    const newCategoryData: CreateCategoryInput = {
      name: "Test Assets",
      type: "asset",
      color: "#FF6B6B",
      icon: "🧪",
      description: "Test category for demonstration",
      sort_order: 99,
    };
    const newCategory = await createCategory(newCategoryData, true);
    console.log(
      `✅ Created category: ${newCategory.name} (ID: ${newCategory.id})\n`
    );

    // Test 5: Create subcategories for the new category
    console.log("📋 Test 5: Create Subcategories");
    const subcategoryNames = ["Test Sub 1", "Test Sub 2", "Test Sub 3"];
    const createdSubcategories = [];

    for (let i = 0; i < subcategoryNames.length; i++) {
      const subcategoryData: CreateSubcategoryInput = {
        category_id: newCategory.id,
        name: subcategoryNames[i],
        description: `Test subcategory ${i + 1}`,
        sort_order: i + 1,
      };
      const subcategory = await createSubcategory(subcategoryData, true);
      createdSubcategories.push(subcategory);
      console.log(`✅ Created subcategory: ${subcategory.name}`);
    }
    console.log("");

    // Test 6: Update category
    console.log("📋 Test 6: Update Category");
    const updateData: UpdateCategoryInput = {
      id: newCategory.id,
      name: "Updated Test Assets",
      color: "#4ECDC4",
      description: "Updated description for test category",
    };
    const updatedCategory = await updateCategory(updateData, true);
    console.log(`✅ Updated category: ${updatedCategory.name}\n`);

    // Test 7: Update subcategory
    console.log("📋 Test 7: Update Subcategory");
    const subcategoryUpdateData: UpdateSubcategoryInput = {
      id: createdSubcategories[0].id,
      name: "Updated Test Sub 1",
      description: "Updated subcategory description",
    };
    const updatedSubcategory = await updateSubcategory(
      subcategoryUpdateData,
      true
    );
    console.log(`✅ Updated subcategory: ${updatedSubcategory.name}\n`);

    // Test 8: Search functionality
    console.log("📋 Test 8: Search Categories and Subcategories");
    const searchResults = await searchCategoriesAndSubcategories(
      "Cash",
      "asset",
      true
    );
    console.log(`✅ Search for "Cash" found:`);
    console.log(`  - Categories: ${searchResults.categories.length}`);
    console.log(`  - Subcategories: ${searchResults.subcategories.length}`);
    searchResults.categories.forEach((cat) => {
      console.log(`    Category: ${cat.name}`);
    });
    searchResults.subcategories.forEach((sub) => {
      console.log(`    Subcategory: ${sub.name} (in ${sub.category?.name})`);
    });
    console.log("");

    // Test 9: Reorder subcategories
    console.log("📋 Test 9: Reorder Subcategories");
    const reorderItems = createdSubcategories.map((sub, index) => ({
      id: sub.id,
      sort_order: createdSubcategories.length - index, // Reverse order
    }));
    await reorderSubcategories(newCategory.id, reorderItems, true);
    console.log("✅ Reordered subcategories\n");

    // Test 10: Bulk create categories
    console.log("📋 Test 10: Bulk Create Categories");
    const bulkData: BulkCreateCategoryInput[] = [
      {
        name: "Bulk Test Assets",
        type: "asset",
        color: "#95E1D3",
        icon: "📦",
        subcategories: ["Bulk Sub 1", "Bulk Sub 2"],
      },
      {
        name: "Bulk Test Liabilities",
        type: "liability",
        color: "#F38BA8",
        icon: "📋",
        subcategories: ["Bulk Liability 1", "Bulk Liability 2"],
      },
    ];
    const bulkResults = await bulkCreateCategories(bulkData, true);
    console.log(
      `✅ Bulk created ${bulkResults.length} categories with subcategories`
    );
    bulkResults.forEach((result) => {
      console.log(
        `  - ${result.category.name}: ${result.subcategories.length} subcategories`
      );
    });
    console.log("");

    // Test 11: Clean up - Delete test categories
    console.log("📋 Test 11: Clean Up - Delete Test Categories");

    // Delete the individual test category
    await deleteSubcategory(createdSubcategories[0].id, true);
    await deleteSubcategory(createdSubcategories[1].id, true);
    await deleteSubcategory(createdSubcategories[2].id, true);
    await deleteCategory(newCategory.id, true);
    console.log("✅ Deleted individual test category and subcategories");

    // Delete bulk created categories
    for (const result of bulkResults) {
      for (const subcategory of result.subcategories) {
        await deleteSubcategory(subcategory.id, true);
      }
      await deleteCategory(result.category.id, true);
    }
    console.log("✅ Deleted bulk created categories and subcategories\n");

    console.log("🎉 All CRUD operations completed successfully!");
  } catch (error) {
    console.error("❌ Error during CRUD operations:", error);
    throw error;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testCRUDOperations()
    .then(() => {
      console.log("\n✅ Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test failed:", error);
      process.exit(1);
    });
}

export { testCRUDOperations };

