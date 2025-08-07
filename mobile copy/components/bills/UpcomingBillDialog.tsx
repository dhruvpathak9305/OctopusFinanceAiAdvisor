import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpcomingBills, UpcomingBill } from '@/hooks/useUpcomingBills';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCreditCards } from '@/contexts/CreditCardContext';
import { useBudgetCategories } from '@/desktop/hooks/useBudgetCategories';
import CategorySelector from "@/components/budget/CategorySelector";
import SubcategorySelector from "@/components/budget/SubcategorySelector";
import { useTransactions } from '@/mobile/hooks/useTransactions';
import { useToast } from '@/common/hooks/use-toast';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { updateTransaction } from '@/services/transactionsService';

// Required field indicator component
const RequiredFieldIndicator = () => (
  <span className="text-red-500 ml-1" title="This field is required">*</span>
);

interface UpcomingBillDialogProps {
  onClose: () => void;
  billToEdit: UpcomingBill | null;
}

const UpcomingBillDialog: React.FC<UpcomingBillDialogProps> = ({ 
  onClose,
  billToEdit 
}) => {
  // State for the form
  const [name, setName] = useState(billToEdit?.name || '');
  const [amount, setAmount] = useState(billToEdit?.amount.toString() || '');
  const [description, setDescription] = useState(billToEdit?.description || '');
  const [dueDate, setDueDate] = useState<Date>(billToEdit?.due_date ? new Date(billToEdit.due_date) : new Date());
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>(
    (billToEdit?.frequency as any) || 'monthly'
  );
  const [isAutopay, setIsAutopay] = useState(billToEdit?.autopay || false);
  const [autopaySource, setAutopaySource] = useState<'account' | 'credit_card'>(
    (billToEdit?.autopay_source as any) || 'account'
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(billToEdit?.account_id || null);
  const [selectedCreditCardId, setSelectedCreditCardId] = useState<string | null>(billToEdit?.credit_card_id || null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(billToEdit?.category_id || null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(billToEdit?.subcategory_id || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(billToEdit?.end_date ? new Date(billToEdit.end_date) : null);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  // Get accounts, credit cards, and categories
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const { updateUpcomingBill } = useUpcomingBills();
  const { categories, subcategories } = useBudgetCategories();
  const { toast } = useToast();
  const { isDemo } = useDemoMode();
  const { fetchTransactions } = useTransactions();
  
  // Utility function to clear specific validation errors
  const clearValidationError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Valid amount greater than 0 is required';
    }
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (!frequency) newErrors.frequency = 'Frequency is required';
    
    if (isAutopay) {
      if (autopaySource === 'account' && !selectedAccountId) {
        newErrors.account = 'Please select an account for autopay';
      }
      if (autopaySource === 'credit_card' && !selectedCreditCardId) {
        newErrors.creditCard = 'Please select a credit card for autopay';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null); // Reset subcategory when category changes
    clearValidationError('category');
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string, subcategoryName: string) => {
    setSelectedSubcategoryId(subcategoryId);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (billToEdit) {
        // Update existing bill
        const updateData = {
          name,
          amount: parseFloat(amount),
          description: description || null,
          due_date: dueDate.toISOString(),
          frequency,
          end_date: endDate ? endDate.toISOString() : null,
          autopay: isAutopay,
          autopay_source: autopaySource,
          account_id: autopaySource === 'account' ? selectedAccountId : null,
          credit_card_id: autopaySource === 'credit_card' ? selectedCreditCardId : null,
          category_id: selectedCategoryId,
          subcategory_id: selectedSubcategoryId
        };
        
        // Update the bill
        const updatedBill = await updateUpcomingBill(billToEdit.id, updateData);
        
        // If transaction_id exists and certain fields changed, also update the linked transaction
        if (billToEdit.transaction_id && updatedBill) {
          // Update only fields that are relevant to both transaction and bill
          const transactionUpdateData: any = {
            name,
            amount: parseFloat(amount),
            description: description || null,
            category_id: selectedCategoryId,
            subcategory_id: selectedSubcategoryId,
            is_recurring: true, // Ensure it stays marked as recurring
            recurrence_pattern: frequency,
            recurrence_end_date: endDate ? endDate.toISOString() : null
          };
          
          // Update the linked transaction
          await updateTransaction(billToEdit.transaction_id, transactionUpdateData, isDemo);
        }
      }
      
      toast({
        title: "Bill updated",
        description: "Your bill has been updated successfully.",
      });

      await fetchTransactions(); // Refresh transactions
      onClose();
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: "Error",
        description: "Failed to update bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px] p-0 bg-white dark:bg-gray-900 overflow-auto max-h-[90vh]">
      <DialogHeader className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
          {billToEdit ? 'Edit Bill' : 'Add Bill'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Bill Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Bill Name<RequiredFieldIndicator />
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) clearValidationError('name');
            }}
            placeholder="Rent, Electric, Netflix, etc."
            className={cn(
              "bg-white dark:bg-gray-950",
              errors.name && "border-red-500 dark:border-red-500"
            )}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">
            Amount<RequiredFieldIndicator />
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (e.target.value && parseFloat(e.target.value) > 0) {
                clearValidationError('amount');
              }
            }}
            placeholder="0.00"
            className={cn(
              "bg-white dark:bg-gray-950",
              errors.amount && "border-red-500 dark:border-red-500"
            )}
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
        
        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-sm font-medium">
            Due Date<RequiredFieldIndicator />
          </Label>
          <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                id="dueDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white dark:bg-gray-950",
                  !dueDate && "text-muted-foreground",
                  errors.dueDate && "border-red-500 dark:border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-950">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  if (date) {
                    setDueDate(date);
                    setDueDatePickerOpen(false);
                    clearValidationError('dueDate');
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
        </div>
        
        {/* Frequency */}
        <div className="space-y-2">
          <Label htmlFor="frequency" className="text-sm font-medium">
            Frequency<RequiredFieldIndicator />
          </Label>
          <Select 
            value={frequency} 
            onValueChange={(value) => {
              setFrequency(value as any);
              clearValidationError('frequency');
            }}
          >
            <SelectTrigger 
              id="frequency" 
              className={cn(
                "bg-white dark:bg-gray-950",
                errors.frequency && "border-red-500 dark:border-red-500"
              )}
            >
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-950">
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.frequency && <p className="text-red-500 text-xs mt-1">{errors.frequency}</p>}
        </div>
        
        {/* End Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-medium">End Date (Optional)</Label>
          <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white dark:bg-gray-950",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>No end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-950">
              <div className="p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs w-full justify-start mb-2"
                  onClick={() => {
                    setEndDate(null);
                    setEndDatePickerOpen(false);
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-2" />
                  Clear end date
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => {
                  setEndDate(date);
                  setEndDatePickerOpen(false);
                }}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Autopay Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="autopay" className="text-sm font-medium">Enable Autopay</Label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsAutopay(!isAutopay)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                isAutopay ? 'bg-emerald dark:bg-emerald' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              role="switch"
              aria-checked={isAutopay}
            >
              <span
                className={`${
                  isAutopay ? 'translate-x-4' : 'translate-x-0.5'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        </div>
        
        {/* Autopay Source Selection (only visible if autopay is enabled) */}
        {isAutopay && (
          <div className="space-y-2">
            <Label htmlFor="autopaySource" className="text-sm font-medium">
              Autopay Source<RequiredFieldIndicator />
            </Label>
            <Select 
              value={autopaySource} 
              onValueChange={(value) => {
                setAutopaySource(value as any);
                // Reset account/card selection when changing source type
                if (value === 'account') {
                  setSelectedCreditCardId(null);
                } else {
                  setSelectedAccountId(null);
                }
              }}
            >
              <SelectTrigger id="autopaySource" className="bg-white dark:bg-gray-950">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950">
                <SelectItem value="account">Bank Account</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Account Selection (only visible if autopay is enabled and source is account) */}
        {isAutopay && autopaySource === 'account' && (
          <div className="space-y-2">
            <Label htmlFor="account" className="text-sm font-medium">
              Select Account<RequiredFieldIndicator />
            </Label>
            <Select 
              value={selectedAccountId || ''} 
              onValueChange={(val) => {
                setSelectedAccountId(val);
                clearValidationError('account');
              }}
            >
              <SelectTrigger 
                id="account" 
                className={cn(
                  "bg-white dark:bg-gray-950",
                  errors.account && "border-red-500 dark:border-red-500"
                )}
              >
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950">
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account && <p className="text-red-500 text-xs mt-1">{errors.account}</p>}
          </div>
        )}
        
        {/* Credit Card Selection (only visible if autopay is enabled and source is credit card) */}
        {isAutopay && autopaySource === 'credit_card' && (
          <div className="space-y-2">
            <Label htmlFor="creditCard" className="text-sm font-medium">
              Select Credit Card<RequiredFieldIndicator />
            </Label>
            <Select 
              value={selectedCreditCardId || ''} 
              onValueChange={(val) => {
                setSelectedCreditCardId(val);
                clearValidationError('creditCard');
              }}
            >
              <SelectTrigger 
                id="creditCard" 
                className={cn(
                  "bg-white dark:bg-gray-950",
                  errors.creditCard && "border-red-500 dark:border-red-500"
                )}
              >
                <SelectValue placeholder="Select credit card" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950">
                {creditCards.map(card => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.creditCard && <p className="text-red-500 text-xs mt-1">{errors.creditCard}</p>}
          </div>
        )}
        
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">Category</Label>
          <CategorySelector 
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
            onAddCategory={() => {}}
            isLoading={false}
          />
        </div>
        
        {/* Subcategory Selection (only visible if category is selected) */}
        {selectedCategoryId && (
          <div className="space-y-2">
            <Label htmlFor="subcategory" className="text-sm font-medium">Subcategory</Label>
            <SubcategorySelector 
              subcategories={subcategories}
              categoryId={selectedCategoryId}
              selectedSubcategoryId={selectedSubcategoryId}
              onSubcategoryChange={handleSubcategoryChange}
              onAddSubcategory={() => {}}
              isLoading={false}
            />
          </div>
        )}
        
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details about this bill"
            className="bg-white dark:bg-gray-950 min-h-[80px]"
          />
        </div>
        
        {/* Submit and Cancel Buttons */}
        <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100 dark:border-gray-800">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="bg-white dark:bg-transparent"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald hover:bg-emerald/90 text-white"
          >
            {isSubmitting ? 'Saving...' : billToEdit ? 'Save Changes' : 'Add Bill'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default UpcomingBillDialog; 