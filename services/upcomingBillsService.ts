import { supabase } from "../lib/supabase/client";
import type { Database } from "../types/supabase";
import { isAfter, isBefore, isEqual, startOfDay, endOfDay } from 'date-fns';
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap, 
  type RelationshipDefinition 
} from '../utils/tableMapping';

// Type for Upcoming Bill from database schema
export type UpcomingBill = Database['public']['Tables']['upcoming_bills']['Row'] & {
  account_name?: string;
  credit_card_name?: string;
  subcategory_name?: string;
  is_overdue?: boolean;
  due_status: 'overdue' | 'today' | 'upcoming';
};

export type UpcomingBillInsert = Database['public']['Tables']['upcoming_bills']['Insert'];
export type UpcomingBillUpdate = Database['public']['Tables']['upcoming_bills']['Update'];

export type BillStatus = 'upcoming' | 'pending' | 'paid' | 'overdue';

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

// Helper function to get the appropriate table name (DEPRECATED)
const getTableName = (isDemo: boolean = false): string => {
  console.warn('getTableName in upcomingBillsService is deprecated. Use getTableMapping instead.');
  return isDemo ? 'upcoming_bills' : 'upcoming_bills_real';
};

// Helper function to get the appropriate budget subcategories table name (DEPRECATED)  
const getBudgetSubcategoriesTableName = (isDemo: boolean = false): string => {
  console.warn('getBudgetSubcategoriesTableName is deprecated. Use getTableMapping instead.');
  return isDemo ? 'budget_subcategories' : 'budget_subcategories_real';
};

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
    
    const newBill = {
      ...bill,
      user_id: user.id,
      status: bill.status || 'upcoming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .insert([newBill])
      .select(selectQuery)
      .single();

    if (error) {
      console.error("Error adding upcoming bill:", error);
      throw error;
    }

    return transformUpcomingBillResponse(data);
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
    const tableName = getTableName(isDemo);
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as any)
      .from(tableName)
      .update(updatedData)
      .eq('id', id)
      .select(`
        *,
        accounts!upcoming_bills_account_id_fkey(name),
        credit_cards!upcoming_bills_credit_card_id_fkey(name),
        budget_subcategories!upcoming_bills_subcategory_id_fkey(name)
      `)
      .single();

    if (error) {
      console.error("Error updating upcoming bill:", error);
      throw error;
    }

    return transformUpcomingBillResponse(data);
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
    const tableName = getTableName(isDemo);

    const { error } = await (supabase as any)
      .from(tableName)
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
      account_id: autopay && autopaySource === 'account' ? accountId : null,
      credit_card_id: autopay && autopaySource === 'credit_card' ? creditCardId : null,
    };

    return await updateUpcomingBill(id, updates, isDemo);
  } catch (error) {
    console.error("Error in updateBillAutopay:", error);
    throw error;
  }
}; 