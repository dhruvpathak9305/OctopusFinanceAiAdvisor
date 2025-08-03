import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "../lib/supabase/client";
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';
import { useToast } from '../common/hooks/use-toast';
import { isAfter, isBefore, isEqual, startOfDay, endOfDay } from 'date-fns';

// Function to determine bill due status
const getBillDueStatus = (dueDate: string): 'overdue' | 'today' | 'upcoming' => {
  const today = startOfDay(new Date());
  const billDueDate = startOfDay(new Date(dueDate));
  
  if (isBefore(billDueDate, today)) {
    return 'overdue';
  } else if (isEqual(billDueDate, today)) {
    return 'today';
  }
  return 'upcoming';
};

// Type for bill status
export type BillStatus = 'upcoming' | 'overdue' | 'paid' | 'deleted';

// Type for Upcoming Bill from database schema
export type UpcomingBill = Database['public']['Tables']['upcoming_bills']['Row'] & {
  account_name?: string;
  credit_card_name?: string;
  category_name?: string;
  subcategory_name?: string;
  is_overdue?: boolean;
  due_status: 'overdue' | 'today' | 'upcoming';
};

// Type for Upcoming Bill Insert
export type UpcomingBillInsert = Database['public']['Tables']['upcoming_bills']['Insert'];

// Filter for fetching upcoming bills
export type UpcomingBillsFilter = {
  status?: BillStatus | 'all';
  dueWithin?: 'week' | 'month' | 'all';
  includeOverdue?: boolean;
  limit?: number;
};

// Cache for bills data
interface BillsCache {
  [key: string]: {
    data: UpcomingBill[];
    timestamp: number;
    filter: UpcomingBillsFilter;
  }
}

// Global cache object for bills
const billsCache: BillsCache = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Debounce time for error toasts (3 seconds)
const ERROR_TOAST_DEBOUNCE = 3000;

// Function to generate a cache key based on user ID and filter
const generateCacheKey = (userId: string, filter: UpcomingBillsFilter) => {
  return `${userId}-${filter.status}-${filter.dueWithin}-${filter.includeOverdue}-${filter.limit}`;
};

// Function to check if cache is valid
const isCacheValid = (cacheKey: string) => {
  if (!billsCache[cacheKey]) return false;
  
  const now = Date.now();
  return (now - billsCache[cacheKey].timestamp) < CACHE_EXPIRATION;
};

// Standalone function to add a bill without using the hook
export async function addUpcomingBill(bill: Omit<UpcomingBillInsert, 'user_id'>) {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newBill = {
      ...bill,
      user_id: user.id,
      status: bill.status || 'upcoming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error: insertError } = await supabase
      .from('upcoming_bills')
      .insert([newBill])
      .select(`
        *,
        accounts!upcoming_bills_account_id_fkey(name),
        credit_cards!upcoming_bills_credit_card_id_fkey(name),
        budget_categories!upcoming_bills_category_id_fkey(name),
        budget_subcategories!upcoming_bills_subcategory_id_fkey(name)
      `);

    if (insertError) throw insertError;

    if (data && data.length > 0) {
      // Invalidate cache for this user to ensure fresh data on next fetch
      Object.keys(billsCache).forEach(key => {
        if (key.startsWith(user.id)) {
          delete billsCache[key];
        }
      });
      
      const transformedBill = {
        ...data[0],
        account_name: data[0].accounts?.name,
        credit_card_name: data[0].credit_cards?.name,
        category_name: data[0].budget_categories?.name,
        subcategory_name: data[0].budget_subcategories?.name,
        is_overdue: isBefore(startOfDay(new Date(data[0].due_date)), startOfDay(new Date())),
        due_status: getBillDueStatus(data[0].due_date)
      };
      
      return transformedBill;
    }
    return null;
  } catch (err) {
    console.error('Error adding upcoming bill:', err);
    return null;
  }
}

export function useUpcomingBills(filter: UpcomingBillsFilter = { 
  status: 'all', 
  dueWithin: 'all', 
  includeOverdue: true,
  limit: 50 
}) {
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Store the last filter in a ref to prevent unnecessary refetches
  const lastFilterRef = useRef<string>(JSON.stringify(filter));
  
  // Reference to keep track of whether fetch is in progress
  const fetchInProgressRef = useRef(false);
  
  // Reference for the last error toast timestamp
  const lastErrorToastRef = useRef<number>(0);

  // Function to refresh bills
  const refreshBills = useCallback(() => {
    if (user) {
      Object.keys(billsCache).forEach(key => {
        if (key.startsWith(user.id)) {
          delete billsCache[key];
        }
      });
      setRefreshTrigger(prev => prev + 1);
    }
  }, [user]);

  // Function to show error toast with debounce
  const showErrorToast = useCallback((message: string) => {
    const now = Date.now();
    if (now - lastErrorToastRef.current > ERROR_TOAST_DEBOUNCE) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      lastErrorToastRef.current = now;
    }
  }, [toast]);

  // Function to check if a bill is valid based on end_date
  const isBillValid = (bill: Database['public']['Tables']['upcoming_bills']['Row']) => {
    if (!bill.end_date) return true;
    const today = startOfDay(new Date());
    const endDate = startOfDay(new Date(bill.end_date));
    return isAfter(endDate, today) || isEqual(endDate, today);
  };

  // Function to check if a bill is overdue
  const isBillOverdue = (bill: UpcomingBill) => {
    const today = startOfDay(new Date());
    const dueDate = startOfDay(new Date(bill.due_date));
    return isBefore(dueDate, today);
  };

  // Function to fetch upcoming bills
  useEffect(() => {
    const fetchUpcomingBills = async () => {
      if (!user || fetchInProgressRef.current) return;
      
      try {
        // Check if filter has changed
        const currentFilterStr = JSON.stringify(filter);
        if (currentFilterStr === lastFilterRef.current && upcomingBills.length > 0) {
          return; // Skip if filter hasn't changed and we have data
        }
        lastFilterRef.current = currentFilterStr;
        
        // Generate cache key
        const cacheKey = generateCacheKey(user.id, filter);
        
        // Check cache first
        if (isCacheValid(cacheKey)) {
          setUpcomingBills(billsCache[cacheKey].data);
          setLoading(false);
          return;
        }
        
        // Set loading state and track fetch progress
        setLoading(true);
        setError(null);
        fetchInProgressRef.current = true;

        let query = supabase
          .from('upcoming_bills')
          .select(`
            *,
            accounts!upcoming_bills_account_id_fkey(name),
            credit_cards!upcoming_bills_credit_card_id_fkey(name),
            budget_categories!upcoming_bills_category_id_fkey(name),
            budget_subcategories!upcoming_bills_subcategory_id_fkey(name)
          `)
          .eq('user_id', user.id);

        // Apply status filter
        if (filter.status && filter.status !== 'all') {
          query = query.eq('status', filter.status);
        } else {
          // By default, only show upcoming and overdue bills
          query = query.in('status', ['upcoming', 'overdue']);
        }

        // Apply due date filter with overdue consideration
        if (filter.dueWithin && filter.dueWithin !== 'all') {
          const today = startOfDay(new Date());
          let endDate = new Date();

          if (filter.dueWithin === 'week') {
            endDate.setDate(today.getDate() + 7);
          } else if (filter.dueWithin === 'month') {
            endDate.setMonth(today.getMonth() + 1);
          }

          if (filter.includeOverdue) {
            query = query.lte('due_date', endOfDay(endDate).toISOString());
          } else {
            query = query
              .gte('due_date', today.toISOString())
              .lte('due_date', endOfDay(endDate).toISOString());
          }
        }

        // Apply limit if specified
        if (filter.limit) {
          query = query.limit(filter.limit);
        }

        // Order by due date (ascending)
        query = query.order('due_date', { ascending: true });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (data) {
          // Transform and filter the data
          const transformedData: UpcomingBill[] = data
            .filter(bill => isBillValid(bill)) // Filter out expired bills
            .map(bill => ({
              ...bill,
              account_name: bill.accounts?.name,
              credit_card_name: bill.credit_cards?.name,
              category_name: bill.budget_categories?.name,
              subcategory_name: bill.budget_subcategories?.name,
              is_overdue: isBefore(startOfDay(new Date(bill.due_date)), startOfDay(new Date())),
              due_status: getBillDueStatus(bill.due_date)
            }));

          // Update cache
          billsCache[cacheKey] = {
            data: transformedData,
            timestamp: Date.now(),
            filter: { ...filter }
          };
          
          setUpcomingBills(transformedData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching upcoming bills:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch upcoming bills';
        setError(errorMessage);
        showErrorToast(errorMessage);
      } finally {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    };

    fetchUpcomingBills();
  }, [user, filter, refreshTrigger, showErrorToast, isBillValid, getBillDueStatus]);

  // Add a new upcoming bill (hook version)
  const addBill = useCallback(async (bill: Omit<UpcomingBillInsert, 'user_id'>) => {
    try {
      setError(null);
      
      // Use the standalone function to add the bill
      const newBill = await addUpcomingBill(bill);
      
      if (newBill) {
        // Update local state
        setUpcomingBills(prev => 
          [...prev, newBill].sort((a, b) => 
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          )
        );
        
        toast({
          title: 'Success',
          description: 'Upcoming bill added successfully',
        });
        
        return newBill;
      }
      return null;
    } catch (err) {
      console.error('Error adding upcoming bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to add upcoming bill');
      toast({
        title: 'Error',
        description: 'Failed to add upcoming bill',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Update an existing upcoming bill
  const updateUpcomingBill = useCallback(async (id: string, updates: Partial<Omit<UpcomingBill, 'id' | 'user_id'>>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setError(null);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateError } = await supabase
        .from('upcoming_bills')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          accounts!upcoming_bills_account_id_fkey(name),
          credit_cards!upcoming_bills_credit_card_id_fkey(name),
          budget_categories!upcoming_bills_category_id_fkey(name),
          budget_subcategories!upcoming_bills_subcategory_id_fkey(name)
        `);

      if (updateError) throw updateError;

      if (data && data.length > 0) {
        const updatedBill = {
          ...data[0],
          account_name: data[0].accounts?.name,
          credit_card_name: data[0].credit_cards?.name,
          category_name: data[0].budget_categories?.name,
          subcategory_name: data[0].budget_subcategories?.name,
          is_overdue: isBefore(startOfDay(new Date(data[0].due_date)), startOfDay(new Date())),
          due_status: getBillDueStatus(data[0].due_date)
        };

        // Update local state
        setUpcomingBills(prev => 
          prev.map(bill => bill.id === id ? updatedBill : bill)
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        );
        
        // Invalidate cache for this user
        if (user) {
          Object.keys(billsCache).forEach(key => {
            if (key.startsWith(user.id)) {
              delete billsCache[key];
            }
          });
        }

        toast({
          title: 'Success',
          description: 'Upcoming bill updated successfully',
        });

        return updatedBill;
      }
      return null;
    } catch (err) {
      console.error('Error updating upcoming bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to update upcoming bill');
      toast({
        title: 'Error',
        description: 'Failed to update upcoming bill',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast, getBillDueStatus]);

  // Delete an upcoming bill
  const deleteBill = useCallback(async (id: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setError(null);

      // Store the bill data before deletion for potential rollback
      const { data: billToDelete } = await supabase
        .from('upcoming_bills')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      const { error: deleteError } = await supabase
        .from('upcoming_bills')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setUpcomingBills(prev => prev.filter(bill => bill.id !== id));
      
      // Invalidate cache
      Object.keys(billsCache).forEach(key => {
        if (key.startsWith(user.id)) {
          delete billsCache[key];
        }
      });

      toast({
        title: 'Success',
        description: 'Bill deleted successfully',
      });

      return true;
    } catch (err) {
      console.error('Error deleting bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete bill');
      toast({
        title: 'Error',
        description: 'Failed to delete bill',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  // Mark a bill as paid
  const markBillAsPaid = useCallback(async (id: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setError(null);

      const updateData = {
        status: 'paid' as const,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateError } = await supabase
        .from('upcoming_bills')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          accounts:accounts!upcoming_bills_account_id_fkey(name),
          credit_cards:credit_cards!upcoming_bills_credit_card_id_fkey(name),
          budget_categories:budget_categories!upcoming_bills_category_id_fkey(name),
          budget_subcategories:budget_subcategories!upcoming_bills_subcategory_id_fkey(name)
        `);

      if (updateError) throw updateError;

      if (data && data.length > 0) {
        const updatedBill = {
          ...data[0],
          account_name: data[0].accounts?.name,
          credit_card_name: data[0].credit_cards?.name,
          category_name: data[0].budget_categories?.name,
          subcategory_name: data[0].budget_subcategories?.name,
          is_overdue: isBefore(startOfDay(new Date(data[0].due_date)), startOfDay(new Date())),
          due_status: getBillDueStatus(data[0].due_date)
        };

        // Remove the paid bill from local state
        setUpcomingBills(prev => prev.filter(bill => bill.id !== id));
        
        // Invalidate cache
        if (user) {
          Object.keys(billsCache).forEach(key => {
            if (key.startsWith(user.id)) {
              delete billsCache[key];
            }
          });
        }

        toast({
          title: 'Success',
          description: 'Bill marked as paid',
        });

        return updatedBill;
      }
      return null;
    } catch (err) {
      console.error('Error marking bill as paid:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark bill as paid');
      toast({
        title: 'Error',
        description: 'Failed to mark bill as paid',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast, getBillDueStatus]);

  // Update autopay settings for a bill
  const updateBillAutopay = useCallback(async (
    id: string, 
    autopay: boolean, 
    autopaySource: string, 
    accountOrCardId: string | null
  ) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setError(null);

      const updateData: Partial<UpcomingBill> = {
        autopay,
        autopay_source: autopaySource,
        updated_at: new Date().toISOString()
      };

      // Update the appropriate ID field based on the autopay source
      if (autopaySource === 'bank') {
        updateData.account_id = accountOrCardId;
        updateData.credit_card_id = null;
      } else if (autopaySource === 'credit_card') {
        updateData.credit_card_id = accountOrCardId;
        updateData.account_id = null;
      } else {
        // If autopay is disabled ('none'), clear both fields
        updateData.account_id = null;
        updateData.credit_card_id = null;
      }

      const { data, error: updateError } = await supabase
        .from('upcoming_bills')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          accounts!upcoming_bills_account_id_fkey(name),
          credit_cards!upcoming_bills_credit_card_id_fkey(name),
          budget_categories!upcoming_bills_category_id_fkey(name),
          budget_subcategories!upcoming_bills_subcategory_id_fkey(name)
        `);

      if (updateError) throw updateError;

      if (data && data.length > 0) {
        const updatedBill = {
          ...data[0],
          account_name: data[0].accounts?.name,
          credit_card_name: data[0].credit_cards?.name,
          category_name: data[0].budget_categories?.name,
          subcategory_name: data[0].budget_subcategories?.name,
          is_overdue: isBefore(startOfDay(new Date(data[0].due_date)), startOfDay(new Date())),
          due_status: getBillDueStatus(data[0].due_date)
        };

        // Update local state
        setUpcomingBills(prev => 
          prev.map(bill => bill.id === id ? updatedBill : bill)
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        );
        
        // Invalidate cache for this user
        if (user) {
          Object.keys(billsCache).forEach(key => {
            if (key.startsWith(user.id)) {
              delete billsCache[key];
            }
          });
        }

        toast({
          title: 'Success',
          description: autopay 
            ? 'Autopay enabled successfully' 
            : 'Autopay disabled successfully',
        });

        return updatedBill;
      }
      return null;
    } catch (err) {
      console.error('Error updating bill autopay settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update autopay settings');
      toast({
        title: 'Error',
        description: 'Failed to update autopay settings',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast, getBillDueStatus]);

  return {
    upcomingBills,
    loading,
    error,
    refreshBills,
    addUpcomingBill: addBill,
    updateUpcomingBill,
    deleteUpcomingBill: deleteBill,
    markBillAsPaid,
    isBillOverdue,
    updateBillAutopay
  };
} 