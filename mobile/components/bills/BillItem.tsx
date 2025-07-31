import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Calendar, ToggleLeft, ToggleRight } from "lucide-react";
import { getIconConfig, getDarkModeClass } from "@/shared/icons/categoryIcons";
import { getCategoryChipClasses } from "@/shared/styles/chipColors";
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

interface BillItemProps {
  bill: {
    id: string | number;
    name: string;
    amount: number | string;
    dueDate: string;
    category?: string;
    subcategory?: string;
    autopay?: boolean;
    icon?: string;
    originalBill?: any; // Optional reference to the original bill object
  };
  onEdit?: (billId: string | number) => void;
  onDelete?: (billId: string | number) => Promise<boolean>;
  className?: string;
}

const BillItem: React.FC<BillItemProps> = ({ 
  bill,
  onEdit,
  onDelete,
  className
}) => {
  const [showActions, setShowActions] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get icon configuration based on category
  const getIconInfo = () => {
    // Try to get icon based on category
    const iconConfig = getIconConfig(bill.category || 'Housing');
    
    return {
      icon: iconConfig.icon || (bill.icon?.replace('fa-', '') || 'receipt'),
      bgColor: iconConfig.background || 'bg-gray-50',
      textColor: iconConfig.iconColor || 'text-gray-500',
      darkBgColor: getDarkModeClass(iconConfig.background || 'bg-gray-50')
    };
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
    e.stopPropagation(); // Prevent the bill item click event
    if (onEdit) {
      onEdit(bill.id);
    }
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the bill item click event
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        const success = await onDelete(bill.id);
        if (success) {
          setDeleteDialogOpen(false);
        } else {
          // Handle delete failure
          console.error('Failed to delete bill');
        }
      } catch (error) {
        console.error('Error deleting bill:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Format due date text and determine color
  const formatDueDate = () => {
    const dateText = `Due ${bill.dueDate}`;
    
    // Determine if the date is close (within 3 days) or past due
    const dueDate = bill.dueDate.split(' ')[1]; // Assuming format is "Apr 30"
    const month = bill.dueDate.split(' ')[0]; // "Apr"
    
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'short' });
    const currentDay = now.getDate();
    
    const isDueThisMonth = month.toLowerCase() === currentMonth.toLowerCase();
    const dayOfMonth = parseInt(dueDate, 10);
    
    // Check if due date is in the past
    if (isDueThisMonth && dayOfMonth < currentDay) {
      return { text: dateText, color: 'text-red-600 dark:text-red-400' };
    }
    
    // Check if due date is coming up soon (within 3 days)
    if (isDueThisMonth && dayOfMonth - currentDay <= 3 && dayOfMonth >= currentDay) {
      return { text: dateText, color: 'text-amber-600 dark:text-amber-400' };
    }
    
    // Default for dates further in the future
    return { text: dateText, color: 'text-gray-500 dark:text-gray-400' };
  };

  // Format the amount for display
  const formatAmount = () => {
    // If amount is already a string with formatting
    if (typeof bill.amount === 'string' && bill.amount.includes('$')) {
      return bill.amount;
    }
    
    // If amount is a number, format it as a currency string
    const numAmount = typeof bill.amount === 'string' 
      ? parseFloat(bill.amount.replace(/[^0-9.-]+/g, '')) 
      : bill.amount;
    
    return `$${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Get icon info for this bill
  const iconInfo = getIconInfo();
  const dueInfo = formatDueDate();
  const formattedAmount = formatAmount();

  return (
    <>
      <div 
        className={cn(
          "py-3 px-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 active:bg-gray-100 dark:active:bg-gray-800/70",
          className
        )}
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
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{bill.name}</p>
                {bill.autopay && (
                  <div className="flex items-center" title="Autopay enabled">
                    <ToggleRight className="h-3.5 w-3.5 mr-0.5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Autopay</span>
                  </div>
                )}
              </div>
              <p className={`text-xs font-medium ${dueInfo.color} mt-0.5 flex items-center`}>
                <Calendar className="h-3 w-3 mr-1.5" />
                {dueInfo.text}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{formattedAmount}</p>
            
            {bill.category && (
              <Badge className={`${getCategoryChipClasses(bill.category)} text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-1`}>
                {bill.category}
              </Badge>
            )}
            
            <div className={cn(
              "transition-all flex gap-2 mt-1 duration-200",
              showActions ? "opacity-100" : "opacity-0"
            )}>
              {onEdit && (
                <button 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 -m-1"
                  aria-label="Edit bill"
                  onClick={handleEditClick}
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button 
                  className="text-gray-400 hover:text-coral dark:hover:text-coral transition-colors p-1 -m-1"
                  aria-label="Delete bill"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete Bill</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Are you sure you want to delete <span className="font-semibold">{bill.name}</span>? This action cannot be undone.
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

export default BillItem; 