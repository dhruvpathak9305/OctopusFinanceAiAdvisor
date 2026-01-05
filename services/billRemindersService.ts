import { supabase } from "../lib/supabase/client";
import type { Database } from "../types/supabase";
import { getTableMap, validateTableConsistency, type TableMap } from '../utils/tableMapping';
import { addDays, format, isBefore, isAfter, isEqual, startOfDay } from 'date-fns';

// Type for Bill Reminder from database schema
export type BillReminder = Database['public']['Tables']['bill_reminders']['Row'] & {
  bill_name?: string;
};

export type BillReminderInsert = Database['public']['Tables']['bill_reminders']['Insert'];
export type BillReminderUpdate = Database['public']['Tables']['bill_reminders']['Update'];

export interface BillReminderFilter {
  billId?: string;
  reminderDateFrom?: string;
  reminderDateTo?: string;
  deliveryStatus?: 'pending' | 'sent' | 'failed' | 'cancelled' | 'all';
  reminderType?: 'due_date' | 'days_before' | 'overdue' | 'custom' | 'all';
  limit?: number;
}

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);
  
  if (process.env.NODE_ENV === 'development') {
    validateTableConsistency(tableMap);
  }
  
  return tableMap;
};

// Fetch bill reminders with filtering
export const fetchBillReminders = async (
  filters: BillReminderFilter = {},
  isDemo: boolean = false
): Promise<BillReminder[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    let query = (supabase as any)
      .from(tableMap.bill_reminders)
      .select(`
        *,
        upcoming_bills:upcoming_bills!bill_reminders_bill_id_fkey(name)
      `)
      .eq('user_id', user.id);
    
    // Apply filters
    if (filters.billId) {
      query = query.eq('bill_id', filters.billId);
    }
    
    if (filters.reminderDateFrom) {
      query = query.gte('reminder_date', filters.reminderDateFrom);
    }
    
    if (filters.reminderDateTo) {
      query = query.lte('reminder_date', filters.reminderDateTo);
    }
    
    if (filters.deliveryStatus && filters.deliveryStatus !== 'all') {
      query = query.eq('delivery_status', filters.deliveryStatus);
    }
    
    if (filters.reminderType && filters.reminderType !== 'all') {
      query = query.eq('reminder_type', filters.reminderType);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    // Order by reminder date (ascending - upcoming first)
    query = query.order('reminder_date', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching bill reminders:", error);
      throw error;
    }
    
    if (data) {
      return data.map((item: any) => ({
        ...item,
        bill_name: item.upcoming_bills?.name || null,
        upcoming_bills: undefined,
      })) as BillReminder[];
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchBillReminders:", error);
    throw error;
  }
};

// Add a new bill reminder
export const addBillReminder = async (
  reminder: Omit<BillReminderInsert, 'user_id'>,
  isDemo: boolean = false
): Promise<BillReminder> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    const newReminder = {
      ...reminder,
      user_id: user.id,
      delivery_status: reminder.delivery_status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await (supabase as any)
      .from(tableMap.bill_reminders)
      .insert([newReminder])
      .select(`
        *,
        upcoming_bills:upcoming_bills!bill_reminders_bill_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error("Error adding bill reminder:", error);
      throw error;
    }
    
    return {
      ...data,
      bill_name: data.upcoming_bills?.name || null,
      upcoming_bills: undefined,
    } as BillReminder;
  } catch (error) {
    console.error("Error in addBillReminder:", error);
    throw error;
  }
};

// Update an existing bill reminder
export const updateBillReminder = async (
  id: string,
  updates: Partial<BillReminderUpdate>,
  isDemo: boolean = false
): Promise<BillReminder> => {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await (supabase as any)
      .from(tableMap.bill_reminders)
      .update(updatedData)
      .eq('id', id)
      .select(`
        *,
        upcoming_bills:upcoming_bills!bill_reminders_bill_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error("Error updating bill reminder:", error);
      throw error;
    }
    
    return {
      ...data,
      bill_name: data.upcoming_bills?.name || null,
      upcoming_bills: undefined,
    } as BillReminder;
  } catch (error) {
    console.error("Error in updateBillReminder:", error);
    throw error;
  }
};

// Delete a bill reminder
export const deleteBillReminder = async (
  id: string,
  isDemo: boolean = false
): Promise<void> => {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { error } = await (supabase as any)
      .from(tableMap.bill_reminders)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting bill reminder:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteBillReminder:", error);
    throw error;
  }
};

// Mark reminder as sent
export const markReminderAsSent = async (
  id: string,
  deliveryMethod: 'push' | 'email' | 'sms' | 'in_app',
  isDemo: boolean = false
): Promise<BillReminder> => {
  try {
    return await updateBillReminder(
      id,
      {
        delivery_status: 'sent',
        delivery_method: deliveryMethod,
        sent_at: new Date().toISOString(),
      },
      isDemo
    );
  } catch (error) {
    console.error("Error in markReminderAsSent:", error);
    throw error;
  }
};

// Create reminders for a bill based on reminder_days_before
export const createRemindersForBill = async (
  billId: string,
  dueDate: string,
  reminderDaysBefore: number[],
  isDemo: boolean = false
): Promise<BillReminder[]> => {
  try {
    const reminders: BillReminder[] = [];
    const due = new Date(dueDate);
    
    for (const daysBefore of reminderDaysBefore) {
      const reminderDate = addDays(due, -daysBefore);
      const reminderDateStr = format(reminderDate, 'yyyy-MM-dd');
      
      // Only create reminder if date is in the future
      if (isAfter(reminderDate, new Date()) || isEqual(startOfDay(reminderDate), startOfDay(new Date()))) {
        const reminder = await addBillReminder({
          bill_id: billId,
          reminder_date: reminderDateStr,
          reminder_type: 'days_before',
          days_before: daysBefore,
          delivery_status: 'pending',
        }, isDemo);
        
        reminders.push(reminder);
      }
    }
    
    return reminders;
  } catch (error) {
    console.error("Error in createRemindersForBill:", error);
    throw error;
  }
};

// Get pending reminders that need to be sent
export const getPendingReminders = async (
  isDemo: boolean = false
): Promise<BillReminder[]> => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    return await fetchBillReminders({
      reminderDateTo: today,
      deliveryStatus: 'pending',
    }, isDemo);
  } catch (error) {
    console.error("Error in getPendingReminders:", error);
    throw error;
  }
};

