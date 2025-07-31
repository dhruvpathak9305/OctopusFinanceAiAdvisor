import React from 'react';
import TransactionItem from './TransactionItem';
import { ArrowDown, ArrowUp, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionGroupProps {
  date: string;
  dayData: {
    income: number;
    expense: number;
    transfer: number;
    transactions: Array<{
      id: number | string;
      description: string;
      isRecurring?: boolean;
      account?: string;
      fromAccount?: string;
      toAccount?: string;
      type: 'income' | 'expense' | 'transfer';
      amount: string;
      category?: string;
      subcategory?: string;
      note?: string;
      icon: string;
    }>;
  };
  onEditTransaction?: (transactionId: number | string) => void;
  onDeleteTransaction?: (transactionId: number | string) => Promise<boolean>;
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({ 
  date, 
  dayData, 
  onEditTransaction,
  onDeleteTransaction 
}) => {
  // Get background color based on primary transaction type for the day
  const getBgColor = () => {
    // Find the dominant transaction type by comparing amounts
    const { income, expense, transfer } = dayData;
    const maxValue = Math.max(income, expense, transfer);
    
    if (maxValue === transfer && transfer > 0) 
      return 'bg-blue-50/70 dark:bg-blue-900/20';
    else if (maxValue === income && income > 0) 
      return 'bg-green-50/70 dark:bg-green-900/20';
    else if (maxValue === expense && expense > 0)
      return 'bg-red-50/70 dark:bg-red-900/20';
    
    // Default fallback
    return 'bg-gray-50/70 dark:bg-gray-800/20';
  };
  
  return (
    <div className="flex flex-col rounded-lg overflow-hidden mb-3 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className={cn(
        "px-4 py-2 sticky top-0 z-10 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-800",
        getBgColor()
      )}>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{date}</h4>
          <div className="flex items-center gap-2">
            {/* Always show income, even if 0 */}
            <span className={`text-[10px] font-medium ${dayData.income > 0 ? 'text-emerald dark:text-emerald' : 'text-gray-400 dark:text-gray-500'} flex items-center whitespace-nowrap`}>
              <ArrowDown className={`h-[9px] w-[9px] mr-1 stroke-[3] ${dayData.income > 0 ? '' : 'opacity-50'}`} />
              +${dayData.income.toFixed(2)}
            </span>
            
            {/* Always show expense, even if 0 */}
            <span className={`text-[10px] font-medium ${dayData.expense > 0 ? 'text-coral dark:text-coral' : 'text-gray-400 dark:text-gray-500'} flex items-center whitespace-nowrap`}>
              <ArrowUp className={`h-[9px] w-[9px] mr-1 stroke-[3] ${dayData.expense > 0 ? '' : 'opacity-50'}`} />
              -${dayData.expense.toFixed(2)}
            </span>
            
            {/* Always show transfer, even if 0 */}
            <span className={`text-[10px] font-medium ${dayData.transfer > 0 ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} flex items-center whitespace-nowrap`}>
              <ArrowRightLeft className={`h-[9px] w-[9px] mr-1 stroke-[3] ${dayData.transfer > 0 ? '' : 'opacity-50'}`} />
              ${dayData.transfer.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-b-lg divide-y divide-gray-100 dark:divide-gray-800">
        {dayData.transactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionGroup; 