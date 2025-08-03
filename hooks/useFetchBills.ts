import { useState, useEffect, useCallback } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase/client";
import { Database } from '../types/supabase';

export type Bill = Database['public']['Tables']['upcoming_bills']['Row'] & {
  category_name?: string;
  subcategory_name?: string;
};

export type BillFilter = {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
  status?: 'pending' | 'paid' | 'overdue' | 'all';
  categoryId?: string;
  searchTerm?: string;
  limit?: number;
};

export type GroupedBills = {
  [dueWindow: string]: {
    total: number;
    bills: Bill[];
  };
};

export function useFetchBills(filter: BillFilter = { dateRange: 'month', limit: 20 }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [groupedBills, setGroupedBills] = useState<GroupedBills>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh/refetch bills
  const refreshBills = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Function to add a bill to the local state
  const addBill = useCallback(async (bill: Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Add user_id to the bill data
      const billWithUserId = {
        ...bill,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert the bill
      const { data, error: insertError } = await supabase
        .from('upcoming_bills')
        .insert([billWithUserId])
        .select(`
          *,
          budget_categories(name),
          budget_subcategories(name)
        `);
      
      if (insertError) throw insertError;
      
      if (data && data.length > 0) {
        // Create a complete bill object with category and subcategory names
        const newBill = {
          ...data[0],
          category_name: data[0].budget_categories?.name || null,
          subcategory_name: data[0].budget_subcategories?.name || null
        } as Bill;
        
        // Add to local state to avoid refetching
        setBills(prev => {
          const updated = [...prev, newBill];
          // Sort by due date (ascending)
          return sortBills(updated);
        });
        
        // Update grouped bills
        updateGroupedBills([...bills, newBill]);
        
        return newBill;
      }
      return null;
    } catch (err) {
      console.error('Error adding bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to add bill');
      return null;
    }
  }, [bills]);

  // Function to update a bill
  const updateBill = useCallback(async (id: string, updates: Partial<Omit<Bill, 'id' | 'user_id'>>) => {
    try {
      setError(null);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Update the bill in the database
      const { data, error: updateError } = await supabase
        .from('upcoming_bills')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          budget_categories(name),
          budget_subcategories(name)
        `);
      
      if (updateError) throw updateError;
      
      if (data && data.length > 0) {
        // Create updated bill object with category and subcategory names
        const updatedBill = {
          ...data[0],
          category_name: data[0].budget_categories?.name || null,
          subcategory_name: data[0].budget_subcategories?.name || null
        } as Bill;
        
        // Update local state
        setBills(prev => {
          const updatedBills = prev.map(b => 
            b.id === id ? updatedBill : b
          );
          // Sort bills again in case due date changed
          return sortBills(updatedBills);
        });
        
        // Update grouped bills
        const updatedBillsList = bills.map(b => 
          b.id === id ? updatedBill : b
        );
        
        updateGroupedBills(updatedBillsList);
        
        return updatedBill;
      }
      return null;
    } catch (err) {
      console.error('Error updating bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to update bill');
      return null;
    }
  }, [bills]);

  // Function to delete a bill
  const deleteBill = useCallback(async (id: string) => {
    try {
      setError(null);
      
      // Delete the bill from the database
      const { error: deleteError } = await supabase
        .from('upcoming_bills')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Remove from local state
      setBills(prev => prev.filter(b => b.id !== id));
      
      // Update grouped bills
      const updatedBills = bills.filter(b => b.id !== id);
      updateGroupedBills(updatedBills);
      
      return true;
    } catch (err) {
      console.error('Error deleting bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete bill');
      return false;
    }
  }, [bills]);

  // Helper function to sort bills by due date (soonest first)
  const sortBills = (billsList: Bill[]): Bill[] => {
    return [...billsList].sort((a, b) => {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  };

  // Helper function to group bills into due windows (This Week, Next Week, Later)
  const updateGroupedBills = (billsList: Bill[]) => {
    const today = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(today.getDate() + 7);
    
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);
    
    const grouped: GroupedBills = {
      'Due This Week': {
        total: 0,
        bills: []
      },
      'Due Next Week': {
        total: 0,
        bills: []
      },
      'Due Later': {
        total: 0,
        bills: []
      }
    };
    
    // Group bills by due window
    billsList.forEach(bill => {
      const dueDate = new Date(bill.due_date);
      let dueWindow = 'Due Later';
      
      if (dueDate <= oneWeekLater) {
        dueWindow = 'Due This Week';
      } else if (dueDate <= twoWeeksLater) {
        dueWindow = 'Due Next Week';
      }
      
      // Add bill to the appropriate group
      grouped[dueWindow].bills.push(bill);
      grouped[dueWindow].total += bill.amount;
    });
    
    // Sort bills within each group by due date
    Object.keys(grouped).forEach(window => {
      grouped[window].bills.sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
    });
    
    setGroupedBills(grouped);
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Start building the query
        let query = supabase
          .from('upcoming_bills')
          .select(`
            *,
            budget_categories(name),
            budget_subcategories(name)
          `)
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });

        // Apply date range filter
        const now = new Date();
        let endDate = new Date();
        
        switch (filter.dateRange) {
          case 'week':
            endDate.setDate(now.getDate() + 7);
            break;
          case 'month':
            endDate.setMonth(now.getMonth() + 1);
            break;
          case 'quarter':
            endDate.setMonth(now.getMonth() + 3);
            break;
          case 'year':
            endDate.setFullYear(now.getFullYear() + 1);
            break;
          case 'all':
            // No date filtering
            break;
          default:
            endDate.setMonth(now.getMonth() + 1); // Default to next month
        }
        
        if (filter.dateRange !== 'all') {
          query = query.lte('due_date', endDate.toISOString());
        }

        // Apply status filter
        if (filter.status && filter.status !== 'all') {
          query = query.eq('status', filter.status);
        }

        // Apply category filter
        if (filter.categoryId) {
          query = query.eq('category_id', filter.categoryId);
        }

        // Apply search term filter
        if (filter.searchTerm) {
          query = query.or(`name.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`);
        }

        // Apply limit
        if (filter.limit) {
          query = query.limit(filter.limit);
        }

        // Execute the query
        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (data) {
          // Transform the data
          const transformedData = data.map(bill => ({
            ...bill,
            category_name: bill.budget_categories?.name || null,
            subcategory_name: bill.budget_subcategories?.name || null
          })) as Bill[];

          // Sort bills by due date (soonest first)
          const sortedBills = sortBills(transformedData);
          
          setBills(sortedBills);
          
          // Group bills by due window
          updateGroupedBills(sortedBills);
        }
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [filter, refreshTrigger]);

  return { 
    bills, 
    groupedBills, 
    loading, 
    error,
    refreshBills,
    addBill,
    updateBill,
    deleteBill
  };
} 