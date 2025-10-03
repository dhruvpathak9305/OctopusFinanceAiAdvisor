# Net Worth Categories & Subcategories CRUD Operations Plan

## 📊 Database Schema Analysis

Based on the Supabase types analysis, we have the following table structure:

### **Categories Tables**

- `net_worth_categories` (demo)
- `net_worth_categories_real` (production)

**Schema:**

```typescript
{
  id: string (UUID, auto-generated)
  name: string (required)
  type: "asset" | "liability" (required)
  color: string | null
  icon: string | null
  description: string | null
  sort_order: number | null
  is_active: boolean | null (default: true)
  created_at: string | null (auto)
  updated_at: string | null (auto)
}
```

### **Subcategories Tables**

- `net_worth_subcategories` (demo)
- `net_worth_subcategories_real` (production)

**Schema:**

```typescript
{
  id: string (UUID, auto-generated)
  category_id: string (required, FK to categories)
  name: string (required)
  description: string | null
  sort_order: number | null
  is_active: boolean | null (default: true)
  created_at: string | null (auto)
  updated_at: string | null (auto)
}
```

## 🔐 Security & RLS Policies

### **Categories RLS:**

- Categories are **shared reference data** - viewable by all authenticated users
- No user-specific ownership (global categories)

### **Subcategories RLS:**

- Subcategories are **shared reference data** - viewable by all authenticated users
- Inherit security from parent categories

## 🛠️ CRUD Operations Plan

### **1. Categories CRUD**

#### **Create Category**

```typescript
interface CreateCategoryInput {
  name: string;
  type: 'asset' | 'liability';
  color?: string;
  icon?: string;
  description?: string;
  sort_order?: number;
}

const createCategory = async (
  categoryData: CreateCategoryInput,
  isDemo: boolean = false
): Promise<NetWorthCategory>
```

**Implementation:**

- Use existing `createCategory` function in `netWorthService.ts`
- Add validation for required fields
- Auto-generate sort_order if not provided
- Handle demo/real table mapping

#### **Read Categories**

```typescript
const fetchCategories = async (
  type?: 'asset' | 'liability' | 'all',
  isDemo: boolean = false
): Promise<NetWorthCategory[]>
```

**Implementation:**

- Use existing `fetchCategories` function
- Add filtering by type (asset/liability)
- Order by sort_order, then name
- Include active/inactive filtering

#### **Update Category**

```typescript
interface UpdateCategoryInput {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

const updateCategory = async (
  categoryData: UpdateCategoryInput,
  isDemo: boolean = false
): Promise<NetWorthCategory>
```

**Implementation:**

- New function needed in `netWorthService.ts`
- Validate category exists
- Update only provided fields
- Auto-update `updated_at` timestamp

#### **Delete Category**

```typescript
const deleteCategory = async (
  categoryId: string,
  isDemo: boolean = false
): Promise<void>
```

**Implementation:**

- Soft delete: Set `is_active = false`
- Check for existing subcategories and entries
- Cascade deactivation to subcategories
- Prevent deletion if entries exist

### **2. Subcategories CRUD**

#### **Create Subcategory**

```typescript
interface CreateSubcategoryInput {
  category_id: string;
  name: string;
  description?: string;
  sort_order?: number;
}

const createSubcategory = async (
  subcategoryData: CreateSubcategoryInput,
  isDemo: boolean = false
): Promise<NetWorthSubcategory>
```

**Implementation:**

- Use existing `createSubcategory` function
- Validate parent category exists
- Auto-generate sort_order within category
- Handle demo/real table mapping

#### **Read Subcategories**

```typescript
const fetchSubcategories = async (
  categoryId?: string,
  isDemo: boolean = false
): Promise<NetWorthSubcategory[]>

const fetchSubcategoriesByCategory = async (
  categoryId: string,
  isDemo: boolean = false
): Promise<NetWorthSubcategory[]>
```

**Implementation:**

- Use existing `fetchSubcategories` function
- Add category-specific filtering
- Order by sort_order, then name
- Include active/inactive filtering

#### **Update Subcategory**

```typescript
interface UpdateSubcategoryInput {
  id: string;
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

const updateSubcategory = async (
  subcategoryData: UpdateSubcategoryInput,
  isDemo: boolean = false
): Promise<NetWorthSubcategory>
```

**Implementation:**

- New function needed in `netWorthService.ts`
- Validate subcategory exists
- Update only provided fields
- Auto-update `updated_at` timestamp

#### **Delete Subcategory**

```typescript
const deleteSubcategory = async (
  subcategoryId: string,
  isDemo: boolean = false
): Promise<void>
```

**Implementation:**

- Soft delete: Set `is_active = false`
- Check for existing entries
- Prevent deletion if entries exist
- Option to reassign entries to default subcategory

### **3. Bulk Operations**

#### **Bulk Create Categories**

```typescript
const bulkCreateCategories = async (
  categories: CreateCategoryInput[],
  isDemo: boolean = false
): Promise<NetWorthCategory[]>
```

#### **Reorder Categories/Subcategories**

```typescript
interface ReorderItem {
  id: string;
  sort_order: number;
}

const reorderCategories = async (
  items: ReorderItem[],
  isDemo: boolean = false
): Promise<void>

const reorderSubcategories = async (
  categoryId: string,
  items: ReorderItem[],
  isDemo: boolean = false
): Promise<void>
```

## 📱 Mobile UI Integration

### **Category Management Screen**

- List all categories (Assets/Liabilities tabs)
- Add new category button
- Edit category (tap to edit)
- Reorder categories (drag & drop)
- Delete category (swipe action)

### **Subcategory Management Screen**

- List subcategories by category
- Add new subcategory button
- Edit subcategory (tap to edit)
- Reorder subcategories (drag & drop)
- Delete subcategory (swipe action)

### **Category Picker Component**

- Hierarchical picker (Category → Subcategory)
- Search functionality
- Recent/frequently used categories
- Quick add new category/subcategory

## 🔄 Data Flow & State Management

### **Context Integration**

```typescript
// NetWorthContext.tsx additions
interface NetWorthContextType {
  // Existing...
  categories: NetWorthCategory[];
  subcategories: NetWorthSubcategory[];

  // New methods
  createCategory: (data: CreateCategoryInput) => Promise<void>;
  updateCategory: (data: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  createSubcategory: (data: CreateSubcategoryInput) => Promise<void>;
  updateSubcategory: (data: UpdateSubcategoryInput) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;

  reorderCategories: (items: ReorderItem[]) => Promise<void>;
  reorderSubcategories: (
    categoryId: string,
    items: ReorderItem[]
  ) => Promise<void>;
}
```

### **Optimistic Updates**

- Update UI immediately
- Rollback on error
- Show loading states
- Handle offline scenarios

## 🎨 Default Categories & Subcategories

### **Asset Categories**

```typescript
const defaultAssetCategories = [
  {
    name: "Cash & Cash Equivalents",
    type: "asset",
    icon: "💰",
    color: "#10B981",
    subcategories: [
      "Savings Account",
      "Checking Account",
      "Money Market",
      "Cash",
    ],
  },
  {
    name: "Investments",
    type: "asset",
    icon: "📈",
    color: "#3B82F6",
    subcategories: ["Stocks", "Bonds", "Mutual Funds", "ETFs", "Crypto"],
  },
  {
    name: "Real Estate",
    type: "asset",
    icon: "🏠",
    color: "#F59E0B",
    subcategories: ["Primary Residence", "Investment Property", "REITs"],
  },
  {
    name: "Retirement Accounts",
    type: "asset",
    icon: "🏦",
    color: "#8B5CF6",
    subcategories: ["401(k)", "IRA", "Roth IRA", "Pension"],
  },
  {
    name: "Personal Property",
    type: "asset",
    icon: "🚗",
    color: "#EF4444",
    subcategories: ["Vehicles", "Jewelry", "Art", "Electronics"],
  },
];
```

### **Liability Categories**

```typescript
const defaultLiabilityCategories = [
  {
    name: "Credit Cards",
    type: "liability",
    icon: "💳",
    color: "#EF4444",
    subcategories: ["Visa", "Mastercard", "American Express", "Store Cards"],
  },
  {
    name: "Loans",
    type: "liability",
    icon: "🏦",
    color: "#F59E0B",
    subcategories: [
      "Personal Loan",
      "Auto Loan",
      "Student Loan",
      "Business Loan",
    ],
  },
  {
    name: "Mortgages",
    type: "liability",
    icon: "🏠",
    color: "#8B5CF6",
    subcategories: ["Primary Mortgage", "Second Mortgage", "HELOC"],
  },
  {
    name: "Other Debts",
    type: "liability",
    icon: "📄",
    color: "#6B7280",
    subcategories: ["Medical Debt", "Tax Debt", "Family Loans"],
  },
];
```

## 🧪 Testing Strategy

### **Unit Tests**

- CRUD operations for categories
- CRUD operations for subcategories
- Validation logic
- Error handling

### **Integration Tests**

- Database operations
- RLS policy enforcement
- Demo/real table switching

### **E2E Tests**

- Category management flow
- Subcategory management flow
- Net worth entry creation with categories

## 📈 Performance Considerations

### **Caching Strategy**

- Cache categories and subcategories (rarely change)
- Invalidate cache on CRUD operations
- Use React Query for client-side caching

### **Database Optimization**

- Index on `sort_order` for fast ordering
- Index on `category_id` for subcategory lookups
- Index on `type` for asset/liability filtering

### **UI Optimization**

- Virtualized lists for large category sets
- Debounced search
- Lazy loading of subcategories

## 🚀 Implementation Priority

### **Phase 1: Core CRUD**

1. ✅ Categories read (existing)
2. ✅ Subcategories read (existing)
3. ✅ Category create (existing)
4. ✅ Subcategory create (existing)
5. 🔄 Category update (new)
6. 🔄 Subcategory update (new)
7. 🔄 Category delete (new)
8. 🔄 Subcategory delete (new)

### **Phase 2: Enhanced Features**

1. Bulk operations
2. Reordering functionality
3. Default categories seeding
4. Advanced filtering

### **Phase 3: UI Integration**

1. Category management screens
2. Category picker component
3. Context integration
4. Optimistic updates

### **Phase 4: Polish**

1. Comprehensive testing
2. Performance optimization
3. Offline support
4. Analytics integration

## 📋 Next Steps

1. **Implement missing CRUD functions** in `netWorthService.ts`
2. **Create category management UI components**
3. **Update NetWorthContext** with new methods
4. **Add default categories seeding** functionality
5. **Implement comprehensive testing**

This plan provides a complete roadmap for implementing robust CRUD operations for net worth categories and subcategories while maintaining consistency with the existing codebase architecture.

