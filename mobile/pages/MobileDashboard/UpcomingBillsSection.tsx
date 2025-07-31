import React, { useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ErrorBoundary from '@/common/components/ErrorBoundary';
import { PlusCircle, Loader, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpcomingBill, useUpcomingBills } from '@/hooks/useUpcomingBills';
import UpcomingBillItem from '@/mobile/components/bills/UpcomingBillItem';
import UpcomingBillDialog from '@/mobile/components/bills/UpcomingBillDialog';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import QuickAddButton from '@/components/common/QuickAddButton';
// Import sample data for testing
import { sampleUpcomingBills } from '@/data/sampleUpcomingBills';

interface UpcomingBillsSectionProps {
  className?: string;
  useTestData?: boolean; // Add prop to toggle test data
}

// Component to group bills by due date
const BillGroup: React.FC<{
  date: string;
  bills: UpcomingBill[];
  onEdit?: (billId: string) => void;
  onDelete?: (billId: string) => Promise<boolean>;
  onMarkPaid?: (billId: string) => Promise<UpcomingBill | null>;
}> = ({ date, bills, onEdit, onDelete, onMarkPaid }) => {
  // Format the date string for display
  const formatGroupDate = (dateStr: string) => {
    const today = new Date();
    const billDate = new Date(dateStr);
    
    // Check if it's today
    if (
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (
      billDate.getDate() === tomorrow.getDate() &&
      billDate.getMonth() === tomorrow.getMonth() &&
      billDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow';
    }
    
    // Check if it's within this week
    const dayDiff = Math.round((billDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff > 0 && dayDiff < 7) {
      return format(billDate, 'EEEE'); // Return day name (Monday, Tuesday, etc)
    }
    
    // Otherwise, show the full date
    return format(billDate, 'MMM d, yyyy');
  };
  
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center px-4 py-2">
        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-md mr-2">
          <CalendarDays className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {formatGroupDate(date)}
        </span>
      </div>
      
      <Card className="border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
        {bills.map((bill) => (
          <UpcomingBillItem 
            key={bill.id} 
            bill={bill} 
            onEdit={onEdit}
            onDelete={onDelete}
            onMarkPaid={onMarkPaid}
          />
        ))}
      </Card>
    </div>
  );
};

const UpcomingBillsSection: React.FC<UpcomingBillsSectionProps> = ({
  className = "",
  useTestData = false // Default to false
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("month");
  const [billToEdit, setBillToEdit] = useState<UpcomingBill | null>(null);
  
  // Use the upcoming bills hook with filter
  const { 
    upcomingBills: apiUpcomingBills, 
    loading, 
    error,
    refreshBills,
    updateUpcomingBill,
    deleteUpcomingBill,
    markBillAsPaid
  } = useUpcomingBills({
    status: 'upcoming',
    dueWithin: selectedFilter as 'week' | 'month' | 'all',
    limit: 10
  });
  
  // Use either test data or API data based on the prop
  const upcomingBills = useTestData ? sampleUpcomingBills : apiUpcomingBills;

  // Function to handle filter change
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
  };

  // Function to handle bill edit
  const handleEditBill = useCallback((billId: string) => {
    const bill = upcomingBills.find(b => b.id === billId);
      if (bill) {
        setBillToEdit(bill);
        setIsDialogOpen(true);
    }
  }, [upcomingBills]);

  // Function to handle bill delete
  const handleDeleteBill = useCallback(async (billId: string) => {
    try {
      if (useTestData) {
        // Mock delete for test data
        toast({
          title: "Bill deleted (test mode)",
          description: "The bill would be deleted in production",
          variant: "default",
        });
        return true;
      }
      
      const success = await deleteUpcomingBill(billId);
      
      if (success) {
        toast({
          title: "Bill deleted",
          description: "The bill has been successfully deleted",
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to delete bill",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the bill",
        variant: "destructive",
      });
      return false;
    }
  }, [deleteUpcomingBill, useTestData]);

  // Handle dialog close and reset edit state
  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setBillToEdit(null);
    // Refresh bills after dialog closes
    if (!useTestData) {
    refreshBills();
    }
  }, [refreshBills, useTestData]);

  // Mark a bill as paid
  const handleMarkBillAsPaid = useCallback(async (billId: string) => {
    try {
      if (useTestData) {
        // Mock mark as paid for test data
        const bill = sampleUpcomingBills.find(b => b.id === billId);
        if (bill) {
          const updatedBill = { ...bill, status: 'paid' };
          toast({
            title: "Bill marked as paid (test mode)",
            description: "The bill would be marked as paid in production",
            variant: "default",
          });
          return updatedBill;
        }
        return null;
      }
      
      const updatedBill = await markBillAsPaid(billId);
      
      if (updatedBill) {
        toast({
          title: "Bill marked as paid",
          description: "The bill has been marked as paid",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to mark bill as paid",
          variant: "destructive",
        });
      }
      
      return updatedBill;
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      toast({
        title: "Error",
        description: "An error occurred while marking the bill as paid",
        variant: "destructive",
      });
      return null;
    }
  }, [markBillAsPaid, useTestData]);

  // Group bills by due date
  const groupBillsByDueDate = () => {
    const grouped: { [date: string]: UpcomingBill[] } = {};
    
    upcomingBills.forEach(bill => {
      // Use the date part only (YYYY-MM-DD)
      const datePart = bill.due_date.split('T')[0];
      
      if (!grouped[datePart]) {
        grouped[datePart] = [];
      }
      
      grouped[datePart].push(bill);
    });
    
    return grouped;
  };

  // Check if we have any bills
  const isEmpty = !loading && upcomingBills.length === 0;
  
  // Group the bills by due date
  const groupedBills = groupBillsByDueDate();

  return (
    <ErrorBoundary>
      <div className={`mb-6 ${className}`}>
      <Card className="pt-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden relative">

        <div className="flex justify-between items-center mb-3 px-4">
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">Upcoming Bills</h4>
          
          <div className="flex items-center gap-2">
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[110px] h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="all">All Bills</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs font-medium text-emerald dark:text-emerald hover:text-emerald hover:bg-green-50 dark:hover:text-emerald dark:hover:bg-green-900/20 p-0"
                >
                  View all
                </Button>
              </DialogTrigger>
              {isDialogOpen && (
                <UpcomingBillDialog 
                onClose={handleDialogClose} 
                billToEdit={billToEdit}
              />
              )}
            </Dialog>
          </div>
        </div>

        <div className="px-3">
          {useTestData ? (
            // Always show sample data when in test mode
            <div className="overflow-y-auto max-h-[450px] pr-1 rounded-lg overflow-x-hidden relative">
              {Object.entries(groupedBills)
                .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                .map(([date, bills]) => (
                  <BillGroup
                    key={date}
                    date={date}
                    bills={bills}
                    onEdit={handleEditBill}
                    onDelete={handleDeleteBill}
                    onMarkPaid={handleMarkBillAsPaid}
                  />
                ))
              }
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="h-8 w-8 text-primary animate-spin mb-2 dark:text-green-400" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
            </div>
          ) : isEmpty ? (
            <Card className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-emerald dark:text-emerald" />
                </div>
                <h5 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">No upcoming bills</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Stay on top of your finances by adding your recurring bills</p>
                <QuickAddButton />
              </div>
            </Card>
          ) : (
            <div className="overflow-y-auto max-h-[450px] pr-1 rounded-lg overflow-x-hidden relative">
              {Object.entries(groupedBills)
                .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                .map(([date, bills]) => (
                  <BillGroup 
                    key={date}
                    date={date}
                    bills={bills}
                    onEdit={handleEditBill}
                    onDelete={handleDeleteBill}
                    onMarkPaid={handleMarkBillAsPaid}
                  />
                ))
              }
            </div>
          )}
        </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default UpcomingBillsSection; 