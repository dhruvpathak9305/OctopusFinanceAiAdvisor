import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent } from "@/components/ui/dialog";
import { X, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Bill, useFetchBills } from '@/hooks/useFetchBills';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import { Switch } from '@/components/ui/switch';
import { supabase } from "@/integrations/supabase/client";

// Form schema validation
const formSchema = z.object({
  name: z.string().min(2, 'Bill name must be at least 2 characters'),
  description: z.string().optional(),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val.replace(/[$,]/g, ''))),
    { message: 'Please enter a valid amount' }
  ),
  due_date: z.date({
    required_error: "Please select a due date",
  }),
  is_recurring: z.boolean().default(false),
  autopay: z.boolean().default(false),
  category_id: z.string().optional().nullable(),
  subcategory_id: z.string().optional().nullable(),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
});

type FormValues = z.infer<typeof formSchema>;

interface BillDialogProps {
  onClose?: () => void;
  billToEdit?: Bill | null;
}

const BillDialog: React.FC<BillDialogProps> = ({ onClose, billToEdit }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string, name: string, category_id: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get the addBill and updateBill functions from our custom hook
  const { addBill, updateBill } = useFetchBills();
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      amount: '',
      due_date: new Date(),
      is_recurring: false,
      autopay: false,
      category_id: null,
      subcategory_id: null,
      status: 'pending',
    },
  });
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('budget_categories')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('budget_subcategories')
          .select('id, name, category_id')
          .eq('user_id', user.id)
          .order('name');
        
        if (subcategoriesError) throw subcategoriesError;
        setSubcategories(subcategoriesData || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Initialize form values when editing a bill
  useEffect(() => {
    if (billToEdit) {
      setIsEditMode(true);
      
      // Parse the amount to remove any formatting
      const amountStr = typeof billToEdit.amount === 'string' 
        ? billToEdit.amount 
        : billToEdit.amount.toString();
      
      // Set form values
      form.reset({
        name: billToEdit.name,
        description: billToEdit.description || '',
        amount: amountStr,
        due_date: new Date(billToEdit.due_date),
        is_recurring: billToEdit.is_recurring,
        autopay: billToEdit.autopay,
        category_id: billToEdit.category_id,
        subcategory_id: billToEdit.subcategory_id,
        status: billToEdit.status,
      });
    } else {
      setIsEditMode(false);
      // Reset form to defaults
      form.reset({
        name: '',
        description: '',
        amount: '',
        due_date: new Date(),
        is_recurring: false,
        autopay: false,
        category_id: null,
        subcategory_id: null,
        status: 'pending',
      });
    }
  }, [billToEdit, form]);
  
  // Filter subcategories based on selected category
  const filteredSubcategories = form.watch('category_id') 
    ? subcategories.filter(sub => sub.category_id === form.watch('category_id'))
    : [];
  
  // Parse amount to remove currency formatting
  const parseAmount = (value: string): number => {
    // Remove currency symbol, commas, and other non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    return parseFloat(cleanValue);
  };
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert amount string to number
      const amountValue = parseAmount(values.amount);
      
      // Create/update bill object
      const billData = {
        name: values.name,
        description: values.description || null,
        amount: amountValue,
        due_date: format(values.due_date, 'yyyy-MM-dd'),
        is_recurring: values.is_recurring,
        autopay: values.autopay,
        category_id: values.category_id || null,
        subcategory_id: values.subcategory_id || null,
        status: values.status,
      };
      
      let result;
      
      if (isEditMode && billToEdit) {
        // Update existing bill
        result = await updateBill(billToEdit.id, billData);
        if (result) {
          toast({
            title: "Bill updated",
            description: "The bill has been successfully updated",
          });
        }
      } else {
        // Add new bill
        result = await addBill(billData as Omit<Bill, 'id'>);
        if (result) {
          toast({
            title: "Bill added",
            description: "The bill has been successfully added",
          });
        }
      }
      
      if (result) {
        // Close dialog on success
        if (onClose) onClose();
      } else {
        setError('Failed to save bill');
      }
    } catch (err) {
      console.error('Error saving bill:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="w-full max-w-[400px] max-h-[90vh] p-0 dark:bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditMode ? "Edit Bill" : "Add New Bill"}
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </Alert>
          )}
          
          {/* Bill Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Rent, Electricity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Monthly apartment rent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 50.00" 
                        {...field} 
                        type="text"
                        onChange={(e) => {
                          // Format input as currency
                          let value = e.target.value.replace(/[^0-9.]/g, '');
                          if (value) {
                            // Ensure only one decimal point
                            const parts = value.split('.');
                            if (parts.length > 2) {
                              value = parts[0] + '.' + parts.slice(1).join('');
                            }
                            
                            // Format with $ and commas
                            const num = parseFloat(value);
                            if (!isNaN(num)) {
                              field.onChange(`$${num.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`);
                              return;
                            }
                          }
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subcategory_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={!form.watch('category_id') || filteredSubcategories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        {filteredSubcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-2">
                <FormField
                  control={form.control}
                  name="is_recurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Recurring Bill</FormLabel>
                        <FormDescription>
                          This bill repeats regularly
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="autopay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Autopay</FormLabel>
                        <FormDescription>
                          This bill is paid automatically
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Bottom Action Bar */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-3 w-full">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-emerald hover:bg-emerald/90 text-white rounded-xl py-2.5 shadow-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? 'Saving...' 
                      : isEditMode 
                        ? 'Save Changes' 
                        : 'Add Bill'
                    }
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DialogContent>
  );
};

export default BillDialog; 