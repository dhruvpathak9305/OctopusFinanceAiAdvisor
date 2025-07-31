import React from 'react';
import BillItem from './BillItem';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface BillGroupProps {
  title: string;
  total: number;
  bills: Array<{
    id: string | number;
    name: string;
    amount: number | string;
    dueDate: string;
    category?: string;
    subcategory?: string;
    autopay?: boolean;
    icon?: string;
    originalBill?: any;
  }>;
  onEditBill?: (billId: string | number) => void;
  onDeleteBill?: (billId: string | number) => Promise<boolean>;
  className?: string;
}

const BillGroup: React.FC<BillGroupProps> = ({ 
  title, 
  total, 
  bills, 
  onEditBill,
  onDeleteBill,
  className
}) => {
  // Get background color based on the title for visual distinction
  const getBgColor = () => {
    if (title.includes('This Week')) 
      return 'bg-red-50/70 dark:bg-red-900/20';
    else if (title.includes('Next Week')) 
      return 'bg-amber-50/70 dark:bg-amber-900/20';
    else 
      return 'bg-blue-50/70 dark:bg-blue-900/20';
  };
  
  // Format the total amount as currency
  const formatTotal = () => {
    return `$${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };
  
  return (
    <div className={cn(
      "flex flex-col rounded-lg overflow-hidden mb-3 shadow-sm border border-gray-100 dark:border-gray-800",
      className
    )}>
      <div className={cn(
        "px-4 py-2 sticky top-0 z-10 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-800",
        getBgColor()
      )}>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap flex items-center">
            {title}
            <ChevronRight className="h-3 w-3 ml-1 text-gray-400" />
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 flex items-center whitespace-nowrap">
              Total: {formatTotal()}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-b-lg divide-y divide-gray-100 dark:divide-gray-800">
        {bills.length === 0 ? (
          <div className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No bills in this period
          </div>
        ) : (
          bills.map((bill) => (
            <BillItem 
              key={bill.id} 
              bill={bill} 
              onEdit={onEditBill}
              onDelete={onDeleteBill}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BillGroup; 