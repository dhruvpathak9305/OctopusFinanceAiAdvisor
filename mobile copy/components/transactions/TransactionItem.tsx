import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit, Trash2, ArrowRightLeft } from "lucide-react";
import { getIconConfig, getDarkModeClass } from "@/shared/icons/categoryIcons";
import { getCategoryChipClasses, getOutlineChipClasses } from "@/shared/styles/chipColors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransactionItemProps {
  transaction: {
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
  };
  onEdit?: (transactionId: number | string) => void;
  onDelete?: (transactionId: number | string) => Promise<boolean>;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction,
  onEdit,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get icon configuration based on category and subcategory
  const getIconInfo = () => {
    // Try to get icon based on subcategory first, fallback to category
    const iconConfig = getIconConfig(
      transaction.category || transaction.type,
      transaction.subcategory
    );
    
    return {
      icon: iconConfig.icon || transaction.icon.replace('fa-', ''),
      bgColor: iconConfig.background || 'bg-gray-50',
      textColor: iconConfig.iconColor || 'text-gray-500',
      darkBgColor: getDarkModeClass(iconConfig.background || 'bg-gray-50')
    };
  };

  // Helper to get amount text color based on transaction type
  const getAmountColor = () => {
    if (transaction.type === 'income') 
      return 'text-emerald dark:text-emerald';
    if (transaction.type === 'transfer') 
      return 'text-blue-500 dark:text-blue-400';
    return 'text-coral dark:text-coral';
  };

  // Toggle action buttons visibility
  const toggleActions = () => {
    setShowActions(!showActions);
  };
  
  // Handle mouse enter
  const handleMouseEnter = () => {
    setShowActions(true);
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setShowActions(false);
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the transaction item click event
    if (onEdit) {
      onEdit(transaction.id);
    }
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the transaction item click event
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        const success = await onDelete(transaction.id);
        if (success) {
          setDeleteDialogOpen(false);
        } else {
          // Handle delete failure
          console.error('Failed to delete transaction');
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Get icon info for this transaction
  const iconInfo = getIconInfo();

  return (
    <>
      <div 
        className="py-3 px-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 active:bg-gray-100 dark:active:bg-gray-800/70"
        onClick={toggleActions}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${iconInfo.bgColor} ${iconInfo.darkBgColor} flex items-center justify-center shadow-sm`}>
              <i className={`fas fa-${iconInfo.icon} text-sm ${iconInfo.textColor}`}></i>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{transaction.description}</p>
                {transaction.isRecurring && (
                  <i className="fas fa-sync-alt text-[10px] text-gray-400 dark:text-gray-500" title="Recurring Transaction"></i>
                )}
              </div>
              {transaction.type !== 'transfer' ? (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  <i className="fas fa-credit-card mr-1.5 text-[10px]"></i>
                  {transaction.account}
                </p>
              ) : (
                <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  <span className="truncate max-w-[80px]">{transaction.fromAccount}</span>
                  <i className="fas fa-arrow-right text-[10px] text-gray-400 dark:text-gray-500 mx-1"></i>
                  <span className="truncate max-w-[80px]">{transaction.toAccount}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              {transaction.type === 'transfer' && (
                <ArrowRightLeft className="h-3.5 w-3.5 mr-1 text-blue-500 dark:text-blue-400" />
              )}
              <p className={`text-sm font-semibold ${getAmountColor()} whitespace-nowrap`}>
                {transaction.type === 'income' ? '+$' : transaction.type === 'expense' ? '-$' : '$'}
                {transaction.amount.replace(/[^0-9,.]/g, '')}
              </p>
            </div>
            <div className={cn(
              "flex gap-2 mt-1",
              "opacity-100" // Always visible
            )}>
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 -m-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Edit transaction"
                onClick={handleEditClick}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button 
                className="text-gray-400 hover:text-coral dark:hover:text-coral transition-colors p-1.5 -m-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Delete transaction"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        {(transaction.type !== 'transfer' && transaction.category) || 
         (transaction.subcategory && transaction.category !== 'NEEDS') || 
         transaction.note ? (
          <div className="mt-2 ml-[48px]">
            <div className="flex flex-wrap gap-1.5">
              {transaction.type !== 'transfer' && transaction.category && (
                <Badge className={`${getCategoryChipClasses(transaction.category)} text-[10px] font-medium px-1.5 py-0.5 rounded-md`}>
                  {transaction.category === 'NEEDS' && transaction.subcategory ? (
                    <>NEEDS <i className="fas fa-arrow-right mx-1 text-[8px]"></i> {transaction.subcategory}</>
                  ) : transaction.category}
                </Badge>
              )}
              
              {transaction.subcategory && transaction.category !== 'NEEDS' && (
                <Badge variant="outline" className={`${getOutlineChipClasses(transaction.category)} text-[10px] font-medium px-1.5 py-0.5 rounded-md`}>
                  {transaction.subcategory}
                </Badge>
              )}
            </div>
            
            {transaction.note && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 truncate max-w-[200px]">
                <i className="fas fa-sticky-note mr-1"></i>
                {transaction.note}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-coral hover:bg-coral/90 text-white" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionItem; 