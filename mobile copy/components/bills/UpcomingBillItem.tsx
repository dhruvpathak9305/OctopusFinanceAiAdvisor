import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit, Trash2, CreditCard, Wallet, AlertCircle, Check } from "lucide-react";
import { getIconConfig, getDarkModeClass } from "@/shared/icons/categoryIcons";
import { getCategoryChipClasses, getOutlineChipClasses } from "@/shared/styles/chipColors";
import { UpcomingBill } from '@/hooks/useUpcomingBills';
import { format, differenceInDays } from 'date-fns';
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

interface UpcomingBillItemProps {
  bill: UpcomingBill;
  onEdit?: (billId: string) => void;
  onDelete?: (billId: string) => Promise<boolean>;
  onMarkPaid?: (billId: string) => Promise<UpcomingBill | null>;
}

const UpcomingBillItem: React.FC<UpcomingBillItemProps> = ({ 
  bill,
  onEdit,
  onDelete,
  onMarkPaid
}) => {
  const [showActions, setShowActions] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Get icon configuration based on category
  const getIconInfo = () => {
    // Try to get icon based on category
    const iconConfig = getIconConfig(
      bill.category_name || 'Bills',
      bill.subcategory_name
    );
    
    return {
      icon: iconConfig.icon || 'credit-card',
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
        }
      } catch (error) {
        console.error('Error deleting bill:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the bill item click event
    if (onMarkPaid) {
      setIsPaying(true);
      try {
        await onMarkPaid(bill.id);
      } catch (error) {
        console.error('Error marking bill as paid:', error);
      } finally {
        setIsPaying(false);
      }
    }
  };

  // Format due date
  const formatDueDate = () => {
    const dueDate = new Date(bill.due_date);
    return format(dueDate, 'MMM d');
  };

  // Calculate days until due
  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(bill.due_date);
    return differenceInDays(dueDate, today);
  };

  // Get status badge style
  const getStatusBadge = () => {
    const daysUntilDue = getDaysUntilDue();
    
    if (bill.status === 'paid') {
      return (
        <Badge className="bg-emerald/10 text-emerald hover:bg-emerald/20 text-[10px] font-medium px-1.5 py-0.5">
          <Check className="w-3 h-3 mr-1" />
          Paid
        </Badge>
      );
    } else if (daysUntilDue === 0) {
      return (
        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] font-medium px-1.5 py-0.5">
          <AlertCircle className="w-3 h-3 mr-1" />
          Due Today
        </Badge>
      );
    } 
    else if (daysUntilDue < 0) {
      return (
        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] font-medium px-1.5 py-0.5">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    else if (daysUntilDue <= 3) {
      return (
        <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[10px] font-medium px-1.5 py-0.5">
          <AlertCircle className="w-3 h-3 mr-1" />
          Due Soon
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[10px] font-medium px-1.5 py-0.5">
          {daysUntilDue} days
        </Badge>
      );
    }
  };

  // Show autopay source
  const getAutopaySource = () => {
    if (!bill.autopay) return null;
    
    return (
      <div className="flex items-center gap-1 mt-1">
        <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-[10px] font-medium px-1 py-0.5 rounded-md">
          {bill.autopay_source === 'account' ? (
            <>
              <Wallet className="w-2.5 h-2.5 mr-1" />
              {bill.account_name || 'Bank Account'}
            </>
          ) : (
            <>
              <CreditCard className="w-2.5 h-2.5 mr-1" />
              {bill.credit_card_name || 'Credit Card'}
            </>
          )}
        </Badge>
      </div>
    );
  };

  // Get icon info for this bill
  const iconInfo = getIconInfo();

  return (
    <>
      <div 
        className="py-3 px-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
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
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[9px] font-medium px-1 py-0 h-4">Auto</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Due: {formatDueDate()}
                </p>
                <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                {getStatusBadge()}
              </div>
              {getAutopaySource()}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
              ${parseFloat(bill.amount.toString()).toFixed(2)}
            </p>
            
            <div className={cn(
              "transition-all flex gap-2 mt-1 duration-200",
              showActions ? "opacity-100" : "opacity-0"
            )}>
              {bill.status !== 'paid' && onMarkPaid && (
                <button 
                  className="text-gray-400 hover:text-emerald dark:hover:text-emerald transition-colors p-1 -m-1"
                  aria-label="Mark as paid"
                  onClick={handleMarkAsPaid}
                  disabled={isPaying}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 -m-1"
                aria-label="Edit bill"
                onClick={handleEditClick}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button 
                className="text-gray-400 hover:text-coral dark:hover:text-coral transition-colors p-1 -m-1"
                aria-label="Delete bill"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        {bill.category_name && (
          <div className="mt-2 ml-[48px]">
            <div className="flex flex-wrap gap-1.5">
              <Badge className={`${getCategoryChipClasses(bill.category_name)} text-[10px] font-medium px-1.5 py-0.5 rounded-md`}>
                {bill.category_name}
              </Badge>
              
              {bill.subcategory_name && (
                <Badge variant="outline" className={`${getOutlineChipClasses(bill.category_name)} text-[10px] font-medium px-1.5 py-0.5 rounded-md`}>
                  {bill.subcategory_name}
                </Badge>
              )}
            </div>
            
            {bill.description && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 truncate max-w-[200px]">
                <i className="fas fa-sticky-note mr-1"></i>
                {bill.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete Bill</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this bill? This action cannot be undone.
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

export default UpcomingBillItem; 