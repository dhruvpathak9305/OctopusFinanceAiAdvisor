import {
  BudgetCategoryType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryType,
  filterCategoriesByType,
  getBudgetTypeDisplayName,
  mapCategoryTypeToDatabase,
  isValidBudgetCategoryType
} from '../budgetCategoryTypes';

describe('budgetCategoryTypes', () => {
  describe('Constants', () => {
    it('should have correct expense categories', () => {
      expect(EXPENSE_CATEGORIES).toEqual([
        'Needs',
        'NEEDS', 
        'Wants',
        'WANTS',
        'Save',
        'SAVE'
      ]);
    });

    it('should have correct income categories', () => {
      expect(INCOME_CATEGORIES).toEqual([
        'Earned Income',
        'EARNED INCOME',
        'Passive Income', 
        'PASSIVE INCOME',
        'Government & Benefits',
        'GOVERNMENT & BENEFITS',
        'Windfall Income',
        'WINDFALL INCOME', 
        'Side Income',
        'SIDE INCOME',
        'Reimbursement',
        'REIMBURSEMENT',
        'Reimbursements',
        'REIMBURSEMENTS'
      ]);
    });
  });

  describe('getCategoryType', () => {
    it('should return "expense" for expense categories (name-based)', () => {
      expect(getCategoryType('Needs')).toBe('expense');
      expect(getCategoryType('NEEDS')).toBe('expense');
      expect(getCategoryType('Wants')).toBe('expense');
      expect(getCategoryType('WANTS')).toBe('expense');
      expect(getCategoryType('Save')).toBe('expense');
      expect(getCategoryType('SAVE')).toBe('expense');
    });

    it('should return "income" for income categories (name-based)', () => {
      expect(getCategoryType('Earned Income')).toBe('income');
      expect(getCategoryType('EARNED INCOME')).toBe('income');
      expect(getCategoryType('Passive Income')).toBe('income');
      expect(getCategoryType('PASSIVE INCOME')).toBe('income');
      expect(getCategoryType('Government & Benefits')).toBe('income');
      expect(getCategoryType('GOVERNMENT & BENEFITS')).toBe('income');
      expect(getCategoryType('Windfall Income')).toBe('income');
      expect(getCategoryType('WINDFALL INCOME')).toBe('income');
      expect(getCategoryType('Side Income')).toBe('income');
      expect(getCategoryType('SIDE INCOME')).toBe('income');
      expect(getCategoryType('Reimbursement')).toBe('income');
      expect(getCategoryType('REIMBURSEMENT')).toBe('income');
      expect(getCategoryType('Reimbursements')).toBe('income');
      expect(getCategoryType('REIMBURSEMENTS')).toBe('income');
    });

    it('should prioritize database category_type over name-based categorization', () => {
      // A category that would be expense by name, but income by database type
      expect(getCategoryType('Custom Category', 'income')).toBe('income');
      expect(getCategoryType('Custom Category', 'expense')).toBe('expense');
      
      // Even if name suggests income, database type should win
      expect(getCategoryType('Earned Income', 'expense')).toBe('expense');
    });

    it('should handle case insensitive database category_type', () => {
      expect(getCategoryType('Custom Category', 'INCOME')).toBe('income');
      expect(getCategoryType('Custom Category', 'Income')).toBe('income');
      expect(getCategoryType('Custom Category', 'EXPENSE')).toBe('expense');
      expect(getCategoryType('Custom Category', 'Expense')).toBe('expense');
    });

    it('should fall back to name-based categorization when database type is invalid', () => {
      expect(getCategoryType('Needs', 'invalid_type')).toBe('expense');
      expect(getCategoryType('Earned Income', 'invalid_type')).toBe('income');
    });

    it('should return "expense" as default for unknown categories', () => {
      expect(getCategoryType('Unknown Category')).toBe('expense');
      expect(getCategoryType('Random Name')).toBe('expense');
      expect(getCategoryType('')).toBe('expense');
    });

    it('should handle null/undefined database category_type', () => {
      expect(getCategoryType('Needs', null)).toBe('expense');
      expect(getCategoryType('Earned Income', undefined)).toBe('income');
    });

    it('should handle case sensitivity correctly for name-based fallback', () => {
      expect(getCategoryType('needs')).toBe('expense'); // lowercase should default to expense
      expect(getCategoryType('earned income')).toBe('expense'); // lowercase should default to expense
    });
  });

  describe('filterCategoriesByType', () => {
    const mockCategories = [
      { name: 'Needs', amount: 1000, category_type: 'expense' },
      { name: 'Wants', amount: 500, category_type: 'expense' },
      { name: 'Save', amount: 300, category_type: 'expense' },
      { name: 'Earned Income', amount: 5000, category_type: 'income' },
      { name: 'Side Income', amount: 1000, category_type: 'income' },
      { name: 'Passive Income', amount: 200, category_type: 'income' },
      { name: 'REIMBURSEMENTS', amount: 150, category_type: 'income' },
      { name: 'Unknown Category', amount: 100 } // No category_type - should use name fallback
    ];

    it('should return all categories when type is "all"', () => {
      const result = filterCategoriesByType(mockCategories, 'all');
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(8);
    });

    it('should return only expense categories when type is "expense"', () => {
      const result = filterCategoriesByType(mockCategories, 'expense');
      
      expect(result).toHaveLength(4); // Needs, Wants, Save, Unknown Category (defaults to expense)
      expect(result.map(cat => cat.name)).toEqual([
        'Needs',
        'Wants', 
        'Save',
        'Unknown Category'
      ]);
    });

    it('should return only income categories when type is "income"', () => {
      const result = filterCategoriesByType(mockCategories, 'income');
      
      expect(result).toHaveLength(4); // Earned Income, Side Income, Passive Income, REIMBURSEMENTS
      expect(result.map(cat => cat.name)).toEqual([
        'Earned Income',
        'Side Income',
        'Passive Income',
        'REIMBURSEMENTS'
      ]);
    });

    it('should use database category_type when available', () => {
      const categoriesWithDbTypes = [
        { name: 'Custom Expense', amount: 100, category_type: 'expense' },
        { name: 'Custom Income', amount: 200, category_type: 'income' },
        { name: 'Needs', amount: 300, category_type: 'income' }, // Override: normally expense but marked as income
      ];

      const expenseResult = filterCategoriesByType(categoriesWithDbTypes, 'expense');
      const incomeResult = filterCategoriesByType(categoriesWithDbTypes, 'income');

      expect(expenseResult).toHaveLength(1);
      expect(expenseResult[0].name).toBe('Custom Expense');
      
      expect(incomeResult).toHaveLength(2);
      expect(incomeResult.map(cat => cat.name)).toEqual(['Custom Income', 'Needs']);
    });

    it('should handle mixed categories (some with category_type, some without)', () => {
      const mixedCategories = [
        { name: 'Needs', amount: 1000 }, // No category_type - use name
        { name: 'Custom Category', amount: 500, category_type: 'income' }, // Has category_type
        { name: 'EARNED INCOME', amount: 2000 }, // No category_type - use name
      ];

      const expenseResult = filterCategoriesByType(mixedCategories, 'expense');
      const incomeResult = filterCategoriesByType(mixedCategories, 'income');

      expect(expenseResult).toHaveLength(1);
      expect(expenseResult[0].name).toBe('Needs');
      
      expect(incomeResult).toHaveLength(2);
      expect(incomeResult.map(cat => cat.name)).toEqual(['Custom Category', 'EARNED INCOME']);
    });

    it('should handle empty array', () => {
      const result = filterCategoriesByType([], 'expense');
      expect(result).toEqual([]);
    });

    it('should preserve original object structure', () => {
      const result = filterCategoriesByType(mockCategories, 'expense');
      
      result.forEach(category => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('amount');
        expect(typeof category.amount).toBe('number');
      });
    });

    it('should work with different object structures', () => {
      const categoriesWithDifferentProps = [
        { name: 'Needs', value: 100, id: 1, category_type: 'expense' },
        { name: 'Earned Income', value: 200, id: 2, category_type: 'income' }
      ];

      const expenseResult = filterCategoriesByType(categoriesWithDifferentProps, 'expense');
      const incomeResult = filterCategoriesByType(categoriesWithDifferentProps, 'income');

      expect(expenseResult).toHaveLength(1);
      expect(expenseResult[0].name).toBe('Needs');
      expect(incomeResult).toHaveLength(1);
      expect(incomeResult[0].name).toBe('Earned Income');
    });

    it('should correctly categorize REIMBURSEMENTS as income (bug fix test)', () => {
      const categoriesWithReimbursements = [
        { name: 'REIMBURSEMENTS', amount: 500, category_type: 'income' },
        { name: 'Reimbursement', amount: 300, category_type: 'income' },
        { name: 'Needs', amount: 1000, category_type: 'expense' },
        { name: 'Wants', amount: 400, category_type: 'expense' }
      ];

      const incomeResult = filterCategoriesByType(categoriesWithReimbursements, 'income');
      const expenseResult = filterCategoriesByType(categoriesWithReimbursements, 'expense');

      // REIMBURSEMENTS and Reimbursement should be in income
      expect(incomeResult).toHaveLength(2);
      expect(incomeResult.map(cat => cat.name)).toEqual(['REIMBURSEMENTS', 'Reimbursement']);
      
      // Needs and Wants should be in expense
      expect(expenseResult).toHaveLength(2);
      expect(expenseResult.map(cat => cat.name)).toEqual(['Needs', 'Wants']);
    });

    it('should handle case variations in reimbursement categories', () => {
      const reimbursementVariations = [
        { name: 'Reimbursement', amount: 100 }, // No category_type - use name (income)
        { name: 'REIMBURSEMENT', amount: 200 }, // No category_type - use name (income)
        { name: 'reimbursement', amount: 300 }, // No category_type - lowercase defaults to expense
        { name: 'Reimbursements', amount: 400 } // No category_type - use name (income)
      ];

      const incomeResult = filterCategoriesByType(reimbursementVariations, 'income');
      const expenseResult = filterCategoriesByType(reimbursementVariations, 'expense');

      expect(incomeResult).toHaveLength(3); // Exact matches for both singular and plural
      expect(incomeResult.map(cat => cat.name)).toEqual(['Reimbursement', 'REIMBURSEMENT', 'Reimbursements']);
      
      expect(expenseResult).toHaveLength(1); // Only lowercase defaults to expense
      expect(expenseResult.map(cat => cat.name)).toEqual(['reimbursement']);
    });
  });

  describe('getBudgetTypeDisplayName', () => {
    it('should return correct display names for valid types', () => {
      expect(getBudgetTypeDisplayName('expense')).toBe('Expense');
      expect(getBudgetTypeDisplayName('income')).toBe('Income');
      expect(getBudgetTypeDisplayName('all')).toBe('All');
    });

    it('should return "Expense" as default for invalid types', () => {
      expect(getBudgetTypeDisplayName('invalid' as BudgetCategoryType)).toBe('Expense');
      expect(getBudgetTypeDisplayName(undefined as any)).toBe('Expense');
      expect(getBudgetTypeDisplayName(null as any)).toBe('Expense');
    });

    it('should handle case sensitivity', () => {
      expect(getBudgetTypeDisplayName('EXPENSE' as BudgetCategoryType)).toBe('Expense');
      expect(getBudgetTypeDisplayName('Income' as BudgetCategoryType)).toBe('Expense'); // Should default
    });
  });

  describe('mapCategoryTypeToDatabase', () => {
    it('should map frontend types to database values', () => {
      expect(mapCategoryTypeToDatabase('expense')).toBe('expense');
      expect(mapCategoryTypeToDatabase('income')).toBe('income');
      expect(mapCategoryTypeToDatabase('all')).toBe('all');
    });

    it('should return "expense" as default for invalid types', () => {
      expect(mapCategoryTypeToDatabase('invalid' as BudgetCategoryType)).toBe('expense');
    });
  });

  describe('isValidBudgetCategoryType', () => {
    it('should validate correct budget category types', () => {
      expect(isValidBudgetCategoryType('expense')).toBe(true);
      expect(isValidBudgetCategoryType('income')).toBe(true);
      expect(isValidBudgetCategoryType('all')).toBe(true);
    });

    it('should reject invalid budget category types', () => {
      expect(isValidBudgetCategoryType('invalid')).toBe(false);
      expect(isValidBudgetCategoryType('')).toBe(false);
      expect(isValidBudgetCategoryType('EXPENSE')).toBe(false);
      expect(isValidBudgetCategoryType('Income')).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should work with TypeScript types correctly', () => {
      const categories: Array<{ name: string; id: number; category_type?: string }> = [
        { name: 'Needs', id: 1, category_type: 'expense' },
        { name: 'Earned Income', id: 2, category_type: 'income' }
      ];

      const result = filterCategoriesByType(categories, 'expense');
      
      // TypeScript should infer the correct return type
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('id');
      expect(typeof result[0].id).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('should handle categories with special characters', () => {
      const specialCategories = [
        { name: 'Government & Benefits', amount: 1000, category_type: 'income' },
        { name: 'Side Income', amount: 500, category_type: 'income' }
      ];

      const incomeResult = filterCategoriesByType(specialCategories, 'income');
      expect(incomeResult).toHaveLength(2);
    });

    it('should handle empty strings and whitespace', () => {
      const categoriesWithEmptyNames = [
        { name: '', amount: 100 },
        { name: '   ', amount: 200 },
        { name: 'Needs', amount: 300 }
      ];

      const result = filterCategoriesByType(categoriesWithEmptyNames, 'expense');
      expect(result).toHaveLength(3); // All should default to expense
    });

    it('should handle null and undefined names gracefully', () => {
      const categoriesWithNullNames = [
        { name: null as any, amount: 100 },
        { name: undefined as any, amount: 200 },
        { name: 'Needs', amount: 300 }
      ];

      expect(() => {
        filterCategoriesByType(categoriesWithNullNames, 'expense');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        name: i % 2 === 0 ? 'Needs' : 'Earned Income',
        amount: i,
        category_type: i % 2 === 0 ? 'expense' : 'income'
      }));

      const start = performance.now();
      const result = filterCategoriesByType(largeArray, 'expense');
      const end = performance.now();

      expect(result).toHaveLength(500); // Half should be expense
      expect(end - start).toBeLessThan(100); // Should complete in reasonable time
    });
  });
}); 