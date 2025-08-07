import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import MobileCircularBudgetProgress from '@/components/dashboard/MobileCircularBudgetProgress';
import BudgetSubcategories from '@/components/common/BudgetSubcategories';
import { useFetchBudgetSubcategories } from '@/hooks/useFetchBudgetSubcategories';
import { getIconConfig } from '@/shared/icons/categoryIcons';
import { getCategoryColorConfig } from '@/shared/styles/chipColors';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BudgetCategoryType, 
  filterCategoriesByType,
  getBudgetTypeDisplayName 
} from '@/utils/budgetCategoryTypes';

// Define time period type for better type safety
type TimePeriod = 'monthly' | 'quarterly' | 'yearly';

interface BudgetProgressSectionProps {
  className?: string;
}

const BudgetProgressSection: React.FC<BudgetProgressSectionProps> = ({ className = "" }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [typeFilter, setTypeFilter] = useState<BudgetCategoryType>('expense');
  const [activeBudgetSubcategory, setActiveBudgetSubcategory] = useState<number | null>(null);
  
  // Fetch budget data using our custom hook
  const { budgetData, loading, error } = useFetchBudgetSubcategories(timePeriod);

  // Filter budget data based on the selected type
  const filteredBudgetData = filterCategoriesByType(budgetData, typeFilter);

  // Toggle budget subcategories visibility
  const toggleSubcategories = (index: number) => {
    setActiveBudgetSubcategory(activeBudgetSubcategory === index ? null : index);
  };

  // Handle time period change
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value as TimePeriod);
  };

  // Handle type filter change
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value as BudgetCategoryType);
    setActiveBudgetSubcategory(null); // Reset active subcategory when filter changes
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Budget Progress</h3>
        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className="w-[90px] h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Time Period Filter */}
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-[110px] h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="h-8 w-8 text-primary animate-spin mb-2 dark:text-green-400" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-32">
          <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
        </div>
      ) : filteredBudgetData.length === 0 ? (
        <div className="flex justify-center items-center h-32 px-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No {getBudgetTypeDisplayName(typeFilter).toLowerCase()} categories found
          </span>
        </div>
      ) : (
        <>
          {/* Budget categories */}
          <div className="grid grid-cols-3 gap-3 px-4 mb-4">
            {filteredBudgetData.map((category, index) => {
              const iconConfig = getIconConfig(category.name);
              const colorConfig = getCategoryColorConfig(category.name);
              
              return (
                <Card 
                  key={`${category.name}-${index}`}
                  className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer relative group overflow-hidden flex flex-col items-center justify-center py-2 min-h-[130px] border-gray-200 dark:border-gray-700"
                  onClick={() => toggleSubcategories(index)}
                >                  
                  {/* Category Icon - Updated with proper styling */}
                  <div className={`w-8 h-8 rounded-full ${colorConfig.bgColor} ${colorConfig.darkBgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                    <i
                      className={`fas fa-${iconConfig.icon} text-sm ${colorConfig.textColor} ${colorConfig.darkTextColor}`}
                    ></i>
                  </div>
                  
                  {/* Budget Progress Chart - Using Mobile Friendly Version */}
                  <div className="flex-1 flex items-center justify-center w-full">
                    <MobileCircularBudgetProgress
                      title={category.name}
                      percentage={category.percentage}
                      color={category.color}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Subcategory details - displayed full width below all categories */}
          {activeBudgetSubcategory !== null && filteredBudgetData[activeBudgetSubcategory] && (
            <div className="px-4 mb-4">
              <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm w-full animate-in slide-in-from-bottom duration-300 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: filteredBudgetData[activeBudgetSubcategory].color }}></div>
                    <h4 className="text-md font-semibold dark:text-gray-200">{filteredBudgetData[activeBudgetSubcategory].name}</h4>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBudgetSubcategory(null);
                    }}
                  >
                    <i className="fas fa-times text-gray-500 dark:text-gray-400"></i>
                  </Button>
                </div>
                <BudgetSubcategories 
                  showDetails={true}
                  color={filteredBudgetData[activeBudgetSubcategory].color}
                  subcategories={filteredBudgetData[activeBudgetSubcategory].subcategories}
                  total={{ 
                    spent: filteredBudgetData[activeBudgetSubcategory].amount, 
                    limit: filteredBudgetData[activeBudgetSubcategory].limit 
                  }}
                />
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetProgressSection; 