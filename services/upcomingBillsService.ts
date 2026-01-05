import { supabase } from "../lib/supabase/client";
import type { Database } from "../types/supabase";
import { isAfter, isBefore, isEqual, startOfDay, endOfDay, addDays, addMonths, addWeeks, addYears, format } from 'date-fns';
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap, 
  type RelationshipDefinition 
} from '../utils/tableMapping';
import { createRemindersForBill } from './billRemindersService';

// Type for Upcoming Bill from database schema
export type UpcomingBill = Database['public']['Tables']['upcoming_bills']['Row'] & {
  account_name?: string;
  credit_card_name?: string;
  subcategory_name?: string;
  is_overdue?: boolean;
  due_status: 'overdue' | 'today' | 'upcoming';
  // New fields from enhanced schema
  next_due_date?: string | null;
  recurrence_pattern?: any; // JSONB
  recurrence_count?: number | null;
  recurrence_end_date?: string | null;
  last_paid_date?: string | null;
  last_paid_amount?: number | null;
  total_paid_amount?: number;
  payment_count?: number;
  reminder_days_before?: number[] | null;
  last_reminder_sent?: string | null;
  reminder_enabled?: boolean;
  is_included_in_budget?: boolean;
  budget_period?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  metadata?: any; // JSONB
};

export type UpcomingBillInsert = Database['public']['Tables']['upcoming_bills']['Insert'];
export type UpcomingBillUpdate = Database['public']['Tables']['upcoming_bills']['Update'];

export type BillStatus = 'upcoming' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'skipped' | 'partial';

export type BillFrequency = 'one-time' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'yearly';

export interface UpcomingBillsFilter {
  status?: BillStatus | 'all';
  dueWithin?: 'week' | 'month' | 'all';
  includeOverdue?: boolean;
  limit?: number;
}

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);
  
  // Validate consistency during development
  if (process.env.NODE_ENV === 'development') {
    validateTableConsistency(tableMap);
  }
  
  return tableMap;
};

// Helper function to build select query with proper relationships for upcoming bills
const buildUpcomingBillsSelectQuery = (tableMap: TableMap): string => {
  // Define the relationships for upcoming bills
  const relationships: RelationshipDefinition[] = [
    {
      table: 'accounts',
      foreignKey: 'account_id',
      columns: 'name',
      alias: 'accounts'
    },
    {
      table: 'credit_cards',
      foreignKey: 'credit_card_id', 
      columns: 'name',
      alias: 'credit_cards'
    },
    {
      table: 'budget_subcategories',
      foreignKey: 'subcategory_id',
      columns: 'name',
      alias: 'budget_subcategories'
    }
  ];

  // Build the select clause with proper foreign key names based on table mapping
  const isDemo = !tableMap.upcoming_bills.includes('_real');
  let selectClause = '*';
  
  if (relationships.length > 0) {
    const relationshipClauses = relationships.map(rel => {
      const targetTable = tableMap[rel.table];
      const sourceTable = tableMap.upcoming_bills;
      
      // Generate proper foreign key name for the current mode
      const fkName = `${sourceTable}_${rel.foreignKey}_fkey`;
      const alias = rel.alias || rel.table as string;
      
      return `${alias}:${targetTable}!${fkName}(${rel.columns})`;
    });
    
    selectClause = `*, ${relationshipClauses.join(', ')}`;
  }
  
  return selectClause;
};

// Note: Using tableMap approach instead of deprecated getTableName functions

// Helper function to determine bill due status
const getBillDueStatus = (dueDate: string): 'overdue' | 'today' | 'upcoming' => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const billDueDate = new Date(dueDate);
  billDueDate.setHours(0, 0, 0, 0);
  
  if (billDueDate < today) {
    return 'overdue';
  } else if (billDueDate.getTime() === today.getTime()) {
    return 'today';
  }
  return 'upcoming';
};

// Helper function to check if a bill is valid based on end_date
const isBillValid = (bill: Database['public']['Tables']['upcoming_bills']['Row']) => {
  if (!bill.end_date) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(bill.end_date);
  endDate.setHours(0, 0, 0, 0);
  return endDate >= today;
};

// Helper function to calculate next due date based on frequency
export const calculateNextDueDate = (
  currentDueDate: string | Date,
  frequency: BillFrequency,
  recurrencePattern?: any
): string | null => {
  const currentDate = typeof currentDueDate === 'string' ? new Date(currentDueDate) : currentDueDate;
  
  switch (frequency) {
    case 'daily':
      return format(addDays(currentDate, 1), 'yyyy-MM-dd');
    case 'weekly':
      return format(addWeeks(currentDate, 1), 'yyyy-MM-dd');
    case 'bi-weekly':
      return format(addWeeks(currentDate, 2), 'yyyy-MM-dd');
    case 'monthly':
      return format(addMonths(currentDate, 1), 'yyyy-MM-dd');
    case 'quarterly':
      return format(addMonths(currentDate, 3), 'yyyy-MM-dd');
    case 'semi-annually':
      return format(addMonths(currentDate, 6), 'yyyy-MM-dd');
    case 'yearly':
      return format(addYears(currentDate, 1), 'yyyy-MM-dd');
    case 'one-time':
    default:
      return null;
  }
};

// Helper function to transform raw database response to standard UpcomingBill format
const transformUpcomingBillResponse = (rawData: any): UpcomingBill => {
  return {
    ...rawData,
    account_name: rawData.accounts?.name || rawData.account_name || null,
    credit_card_name: rawData.credit_cards?.name || rawData.credit_card_name || null,
    subcategory_name: rawData.budget_subcategories?.name || rawData.subcategory_name || null,
    is_overdue: getBillDueStatus(rawData.due_date) === 'overdue',
    due_status: getBillDueStatus(rawData.due_date),
    // Remove nested objects to keep structure clean
    accounts: undefined,
    credit_cards: undefined,
    budget_subcategories: undefined,
  } as UpcomingBill;
};

// Fetch upcoming bills with comprehensive filtering
export const fetchUpcomingBills = async (
  filters: UpcomingBillsFilter = {},
  isDemo: boolean = false
): Promise<UpcomingBill[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    const selectQuery = buildUpcomingBillsSelectQuery(tableMap);
    
    // Use type assertion to handle dynamic table names
    let query = (supabase as any)
      .from(tableMap.upcoming_bills)
      .select(selectQuery)
      .eq('user_id', user.id);
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    } else {
      // By default, only show upcoming and overdue bills
      query = query.in('status', ['upcoming', 'overdue']);
    }
    
    // Apply due date filter with overdue consideration
    if (filters.dueWithin && filters.dueWithin !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let endDate = new Date();

      if (filters.dueWithin === 'week') {
        endDate.setDate(today.getDate() + 7);
      } else if (filters.dueWithin === 'month') {
        endDate.setMonth(today.getMonth() + 1);
      }
      
      endDate.setHours(23, 59, 59, 999);

      if (filters.includeOverdue) {
        query = query.lte('due_date', endDate.toISOString().split('T')[0]);
      } else {
        query = query
          .gte('due_date', today.toISOString().split('T')[0])
          .lte('due_date', endDate.toISOString().split('T')[0]);
      }
    }

    // Apply limit if specified
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    // Order by due date (ascending)
    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching upcoming bills:", error);
      
      // Handle specific relationship errors for better UX
      if (error.code === 'PGRST200' && error.message.includes('relationship')) {
        console.warn('Foreign key relationship error detected:', error.message);
        // Try a fallback query without relationships
        const fallbackQuery = (supabase as any)
          .from(tableMap.upcoming_bills)
          .select('*')
          .eq('user_id', user.id);
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        
        if (fallbackError) {
          throw fallbackError;
        }
        
        // Transform without relationship data
        return (fallbackData || []).map((item: any) => transformUpcomingBillResponse({
          ...item,
          accounts: null,
          credit_cards: null,
          budget_subcategories: null
        }));
      }
      
      throw error;
    }

    if (data) {
      // Transform data using helper function
      return data.map(transformUpcomingBillResponse);
    }

    return [];
  } catch (error) {
    console.error("Error in fetchUpcomingBills:", error);
    throw error;
  }
};

// Helper function to insert bill into local database (using dynamic import)
async function insertBillToLocalDB(bill: any, userId: string): Promise<any> {
  try {
    // Dynamic import to avoid module resolution issues
    // Use require for React Native compatibility
    let getLocalDb: any;
    let SyncStatus: any;
    
    try {
      // @ts-ignore - Dynamic import may not be recognized by TypeScript
      const localDbModule = await import('../localDb');
      getLocalDb = localDbModule.getLocalDb;
      // @ts-ignore
      const schemaModule = await import('../database/localSchema');
      SyncStatus = schemaModule.SyncStatus;
    } catch (importError) {
      // If dynamic import fails, try require (for React Native)
      try {
        // @ts-ignore
        const localDbModule = require('../localDb');
        getLocalDb = localDbModule.getLocalDb;
        // @ts-ignore
        const schemaModule = require('../database/localSchema');
        SyncStatus = schemaModule.SyncStatus;
      } catch (requireError) {
        console.error('Failed to import local DB modules:', requireError);
        throw new Error('Local DB not available');
      }
    }
    
    const db = await getLocalDb();
    const now = Date.now();
    const billId = bill.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert bill data to local DB format
    const localBill: any = {
      id: billId,
      local_id: billId,
      user_id: userId,
      name: bill.name || '',
      description: bill.description || null,
      amount: bill.amount || 0,
      due_date: bill.due_date ? new Date(bill.due_date).toISOString() : null,
      end_date: bill.end_date ? new Date(bill.end_date).toISOString() : null,
      next_due_date: bill.next_due_date ? new Date(bill.next_due_date).toISOString() : null,
      frequency: bill.frequency || 'one-time',
      recurrence_pattern: bill.recurrence_pattern ? JSON.stringify(bill.recurrence_pattern) : null,
      recurrence_count: bill.recurrence_count || null,
      recurrence_end_date: bill.recurrence_end_date ? new Date(bill.recurrence_end_date).toISOString() : null,
      category_id: bill.category_id || null,
      subcategory_id: bill.subcategory_id || null,
      account_id: bill.account_id || null,
      credit_card_id: bill.credit_card_id || null,
      status: bill.status || 'upcoming',
      is_active: 1,
      autopay: bill.autopay ? 1 : 0,
      autopay_source: bill.autopay_source || null,
      autopay_account_id: bill.autopay_account_id || null,
      autopay_credit_card_id: bill.autopay_credit_card_id || null,
      last_paid_date: bill.last_paid_date ? new Date(bill.last_paid_date).toISOString() : null,
      last_paid_amount: bill.last_paid_amount || null,
      total_paid_amount: bill.total_paid_amount || 0,
      payment_count: bill.payment_count || 0,
      reminder_days_before: bill.reminder_days_before ? JSON.stringify(bill.reminder_days_before) : null,
      last_reminder_sent: bill.last_reminder_sent ? new Date(bill.last_reminder_sent).toISOString() : null,
      reminder_enabled: bill.reminder_enabled !== false ? 1 : 0,
      is_included_in_budget: bill.is_included_in_budget !== false ? 1 : 0,
      budget_period: bill.budget_period || null,
      tags: bill.tags ? JSON.stringify(bill.tags) : null,
      notes: bill.notes || null,
      metadata: bill.metadata ? JSON.stringify(bill.metadata) : null,
      transaction_id: bill.transaction_id || null,
      sync_status: SyncStatus.PENDING,
      created_offline: 1,
      updated_offline: 0,
      deleted_offline: 0,
      last_synced_at: null,
      server_version: 0,
      created_at: now,
      updated_at: now,
    };

    // Insert into local DB
    const columns = Object.keys(localBill);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(localBill);

    await db.runAsync(
      `INSERT INTO upcoming_bills_local (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );

    console.log(`✅ Bill inserted into local DB: ${billId}`);

    // Return in Supabase format for compatibility
    return {
      ...bill,
      id: billId,
      user_id: userId,
      created_at: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    };
  } catch (localError: any) {
    console.error('Error inserting into local DB:', localError);
    // If it's a module resolution error, provide a more helpful message
    if (localError?.message?.includes('Cannot find module') || localError?.code === 'MODULE_NOT_FOUND') {
      throw new Error('Local DB module not available. Please ensure the app is properly configured.');
    }
    throw localError;
  }
}

// Add a new upcoming bill
export const addUpcomingBill = async (
  bill: Omit<UpcomingBillInsert, 'user_id'>,
  isDemo: boolean = false
): Promise<UpcomingBill> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    const selectQuery = buildUpcomingBillsSelectQuery(tableMap);
    
    // Calculate next_due_date for recurring bills
    let nextDueDate: string | null = null;
    if (bill.frequency && bill.frequency !== 'one-time' && bill.due_date) {
      nextDueDate = calculateNextDueDate(bill.due_date, bill.frequency as BillFrequency, bill.recurrence_pattern);
    }
    
    // Ensure autopay_source is set when autopay is true (required by database constraint)
    // The constraint requires: if autopay = true, then autopay_source must be set
    // And if autopay_source = 'account', then autopay_account_id must be set
    // And if autopay_source = 'credit_card', then autopay_credit_card_id must be set
    let finalAutopay = bill.autopay || false;
    let autopaySource: string | null = bill.autopay_source || null;
    
    if (finalAutopay) {
      // If autopay is true, we need autopay_source and the corresponding ID
      if (!autopaySource) {
        // Try to determine source from available IDs
        if (bill.autopay_account_id) {
          autopaySource = 'account';
        } else if (bill.autopay_credit_card_id) {
          autopaySource = 'credit_card';
        } else if (bill.account_id) {
          autopaySource = 'account';
          // Use account_id as autopay_account_id if not specified
          if (!bill.autopay_account_id) {
            (bill as any).autopay_account_id = bill.account_id;
          }
        } else if (bill.credit_card_id) {
          autopaySource = 'credit_card';
          // Use credit_card_id as autopay_credit_card_id if not specified
          if (!bill.autopay_credit_card_id) {
            (bill as any).autopay_credit_card_id = bill.credit_card_id;
          }
        } else {
          // No valid autopay source available, disable autopay
          console.warn('Autopay is true but no valid autopay source found. Disabling autopay.');
          finalAutopay = false;
          autopaySource = null;
        }
      } else {
        // autopay_source is set, verify the corresponding ID exists
        if (autopaySource === 'account' && !bill.autopay_account_id && !bill.account_id) {
          console.warn('Autopay source is "account" but no account_id found. Disabling autopay.');
          finalAutopay = false;
          autopaySource = null;
        } else if (autopaySource === 'credit_card' && !bill.autopay_credit_card_id && !bill.credit_card_id) {
          console.warn('Autopay source is "credit_card" but no credit_card_id found. Disabling autopay.');
          finalAutopay = false;
          autopaySource = null;
        } else if (autopaySource === 'account' && !bill.autopay_account_id && bill.account_id) {
          // Use account_id as autopay_account_id
          (bill as any).autopay_account_id = bill.account_id;
        } else if (autopaySource === 'credit_card' && !bill.autopay_credit_card_id && bill.credit_card_id) {
          // Use credit_card_id as autopay_credit_card_id
          (bill as any).autopay_credit_card_id = bill.credit_card_id;
        }
      }
    }

    const newBill = {
      ...bill,
      user_id: user.id,
      status: bill.status || 'upcoming',
      next_due_date: nextDueDate,
      reminder_enabled: bill.reminder_enabled !== undefined ? bill.reminder_enabled : true,
      is_included_in_budget: bill.is_included_in_budget !== undefined ? bill.is_included_in_budget : true,
      total_paid_amount: 0,
      payment_count: 0,
      autopay: finalAutopay,
      autopay_source: autopaySource,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Debug: Log user info to help diagnose RLS issues
    console.log("🔍 Inserting bill with user_id:", user.id);
    console.log("🔍 Bill data:", { ...newBill, user_id: user.id });

    const { data, error } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .insert([newBill])
      .select(selectQuery)
      .single();

    if (error) {
      console.error("Error adding upcoming bill:", error);
      console.error("Error details:", { code: error.code, message: error.message, hint: error.hint });
      
      // If RLS policy error (42501), try local DB fallback
      if (error.code === '42501') {
        console.log("⚠️ RLS policy error detected. Attempting local DB fallback...");
        console.log("💡 This might indicate the RLS policies need to be verified in Supabase.");
        try {
          const localBill = await insertBillToLocalDB(newBill, user.id);
          console.log("✅ Successfully saved to local DB as fallback");
          // Return a transformed bill that matches the expected format
          return {
            ...localBill,
            account_name: undefined,
            credit_card_name: undefined,
            subcategory_name: undefined,
            is_overdue: isBefore(startOfDay(new Date(localBill.due_date)), startOfDay(new Date())),
            due_status: getBillDueStatus(localBill.due_date),
          } as UpcomingBill;
        } catch (localError: any) {
          console.error("❌ Local DB fallback also failed:", localError);
          // Throw a more descriptive error
          throw new Error(`Failed to insert bill: Supabase RLS error and local DB fallback failed. ${localError?.message || ''}`);
        }
      } else {
        // For other errors, still try local DB fallback if not in demo mode
        if (!isDemo) {
          console.log("Attempting local DB fallback for non-RLS error...");
          try {
            const localBill = await insertBillToLocalDB(newBill, user.id);
            return {
              ...localBill,
              account_name: undefined,
              credit_card_name: undefined,
              subcategory_name: undefined,
              is_overdue: isBefore(startOfDay(new Date(localBill.due_date)), startOfDay(new Date())),
              due_status: getBillDueStatus(localBill.due_date),
            } as UpcomingBill;
          } catch (localError) {
            console.error("Local DB fallback failed:", localError);
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    const createdBill = transformUpcomingBillResponse(data);

    // Create reminders if reminder_days_before is provided
    if (createdBill.reminder_days_before && createdBill.reminder_days_before.length > 0 && createdBill.id) {
      try {
        await createRemindersForBill(
          createdBill.id,
          createdBill.due_date,
          createdBill.reminder_days_before,
          isDemo
        );
      } catch (reminderError) {
        console.warn("Error creating reminders for bill:", reminderError);
        // Don't fail the bill creation if reminders fail
      }
    }

    return createdBill;
  } catch (error) {
    console.error("Error in addUpcomingBill:", error);
    throw error;
  }
};

// Update an existing upcoming bill
export const updateUpcomingBill = async (
  id: string,
  updates: Partial<UpcomingBillUpdate>,
  isDemo: boolean = false
): Promise<UpcomingBill> => {
  try {
    const tableMap = getTableMapping(isDemo);
    const selectQuery = buildUpcomingBillsSelectQuery(tableMap);
    
    // If frequency or due_date changed, recalculate next_due_date for recurring bills
    let nextDueDate = updates.next_due_date;
    if (updates.frequency && updates.frequency !== 'one-time' && updates.due_date) {
      nextDueDate = calculateNextDueDate(updates.due_date, updates.frequency as BillFrequency, updates.recurrence_pattern);
    } else if (updates.frequency && updates.frequency !== 'one-time') {
      // If only frequency changed, we need to get current due_date first
      const { data: currentBill } = await (supabase as any)
        .from(tableMap.upcoming_bills)
        .select('due_date, recurrence_pattern')
        .eq('id', id)
        .single();
      
      if (currentBill?.due_date) {
        nextDueDate = calculateNextDueDate(
          currentBill.due_date, 
          updates.frequency as BillFrequency, 
          updates.recurrence_pattern || currentBill.recurrence_pattern
        );
      }
    }
    
    const updatedData = {
      ...updates,
      ...(nextDueDate !== undefined && { next_due_date: nextDueDate }),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .update(updatedData)
      .eq('id', id)
      .select(selectQuery)
      .single();

    if (error) {
      console.error("Error updating upcoming bill:", error);
      throw error;
    }

    const updatedBill = transformUpcomingBillResponse(data);

    // Update reminders if reminder_days_before changed
    if (updates.reminder_days_before !== undefined && updatedBill.id) {
      try {
        // Delete existing reminders and create new ones
        // Note: This is a simple approach - you might want to update existing ones instead
        await createRemindersForBill(
          updatedBill.id,
          updatedBill.due_date,
          updates.reminder_days_before || [],
          isDemo
        );
      } catch (reminderError) {
        console.warn("Error updating reminders for bill:", reminderError);
        // Don't fail the update if reminders fail
      }
    }

    return updatedBill;
  } catch (error) {
    console.error("Error in updateUpcomingBill:", error);
    throw error;
  }
};

// Delete an upcoming bill
export const deleteUpcomingBill = async (
  id: string,
  isDemo: boolean = false
): Promise<void> => {
  try {
    const tableMap = getTableMapping(isDemo);

    const { error } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting upcoming bill:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteUpcomingBill:", error);
    throw error;
  }
};

// Mark a bill as paid
export const markBillAsPaid = async (
  id: string,
  isDemo: boolean = false
): Promise<UpcomingBill> => {
  try {
    return await updateUpcomingBill(id, { status: 'paid' }, isDemo);
  } catch (error) {
    console.error("Error in markBillAsPaid:", error);
    throw error;
  }
};

// Update bill autopay settings
export const updateBillAutopay = async (
  id: string,
  autopay: boolean,
  autopaySource?: 'account' | 'credit_card',
  accountId?: string,
  creditCardId?: string,
  isDemo: boolean = false
): Promise<UpcomingBill> => {
  try {
    const updates: Partial<UpcomingBillUpdate> = {
      autopay,
      autopay_source: autopaySource || 'account',
      autopay_account_id: autopay && autopaySource === 'account' ? accountId : null,
      autopay_credit_card_id: autopay && autopaySource === 'credit_card' ? creditCardId : null,
      account_id: autopay && autopaySource === 'account' ? accountId : null,
      credit_card_id: autopay && autopaySource === 'credit_card' ? creditCardId : null,
    };

    return await updateUpcomingBill(id, updates, isDemo);
  } catch (error) {
    console.error("Error in updateBillAutopay:", error);
    throw error;
  }
};

// Generate next occurrence for a recurring bill
export const generateNextBillOccurrence = async (
  billId: string,
  isDemo: boolean = false
): Promise<UpcomingBill | null> => {
  try {
    const tableMap = getTableMapping(isDemo);
    const selectQuery = buildUpcomingBillsSelectQuery(tableMap);
    
    // Get the original bill
    const { data: originalBill, error: fetchError } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .select(selectQuery)
      .eq('id', billId)
      .single();
    
    if (fetchError || !originalBill) {
      throw new Error("Bill not found");
    }
    
    const bill = transformUpcomingBillResponse(originalBill);
    
    // Check if bill should generate next occurrence
    // Note: is_active is not in the UpcomingBill type, so we check status instead
    if (bill.status !== 'paid' || bill.frequency === 'one-time') {
      return null;
    }
    
    if (!bill.next_due_date) {
      // Calculate next due date if not set
      const nextDue = calculateNextDueDate(bill.due_date, bill.frequency as BillFrequency, bill.recurrence_pattern);
      if (!nextDue) return null;
      
      // Update the original bill with next_due_date
      await updateUpcomingBill(billId, { next_due_date: nextDue }, isDemo);
      bill.next_due_date = nextDue;
    }
    
    // Check if next occurrence already exists
    const { data: existingBill } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .select('id')
      .eq('user_id', bill.user_id)
      .eq('name', bill.name)
      .eq('due_date', bill.next_due_date)
      .in('status', ['upcoming', 'pending'])
      .single();
    
    if (existingBill) {
      return null; // Next occurrence already exists
    }
    
    // Check if bill should end
    if (bill.end_date && new Date(bill.next_due_date) > new Date(bill.end_date)) {
      return null;
    }
    
    if (bill.recurrence_count && bill.payment_count && bill.payment_count >= bill.recurrence_count) {
      return null;
    }
    
    // Create next bill occurrence
    const nextBill = await addUpcomingBill({
      name: bill.name,
      description: bill.description,
      amount: bill.amount,
      due_date: bill.next_due_date!,
      frequency: bill.frequency as any,
      category_id: bill.category_id,
      subcategory_id: bill.subcategory_id,
      account_id: bill.account_id,
      credit_card_id: bill.credit_card_id,
      autopay: bill.autopay || false,
      autopay_source: bill.autopay_source as any,
      autopay_account_id: bill.autopay_account_id,
      autopay_credit_card_id: bill.autopay_credit_card_id,
      status: 'upcoming',
      reminder_enabled: bill.reminder_enabled,
      reminder_days_before: bill.reminder_days_before,
      is_included_in_budget: bill.is_included_in_budget,
      budget_period: bill.budget_period as any,
      tags: bill.tags,
      notes: bill.notes,
      end_date: bill.end_date,
      recurrence_count: bill.recurrence_count,
      recurrence_end_date: bill.recurrence_end_date,
      recurrence_pattern: bill.recurrence_pattern,
      metadata: bill.metadata || {},
    }, isDemo);
    
    return nextBill;
  } catch (error) {
    console.error("Error in generateNextBillOccurrence:", error);
    throw error;
  }
};

// Get payment statistics for a bill
export const getBillPaymentStats = async (
  billId: string,
  isDemo: boolean = false
): Promise<{
  totalPaid: number;
  paymentCount: number;
  lastPaymentDate: string | null;
  averagePayment: number;
  remainingAmount: number;
}> => {
  try {
    const tableMap = getTableMapping(isDemo);
    
    // Get bill details
    const { data: bill, error: billError } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .select('amount, total_paid_amount, payment_count, last_paid_date')
      .eq('id', billId)
      .single();
    
    if (billError || !bill) {
      throw new Error("Bill not found");
    }
    
    const totalPaid = bill.total_paid_amount || 0;
    const paymentCount = bill.payment_count || 0;
    const lastPaymentDate = bill.last_paid_date || null;
    const averagePayment = paymentCount > 0 ? totalPaid / paymentCount : 0;
    const remainingAmount = Math.max(0, (bill.amount || 0) - totalPaid);
    
    return {
      totalPaid,
      paymentCount,
      lastPaymentDate,
      averagePayment,
      remainingAmount,
    };
  } catch (error) {
    console.error("Error in getBillPaymentStats:", error);
    throw error;
  }
}; 