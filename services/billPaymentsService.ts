import { supabase } from "../lib/supabase/client";
import type { Database } from "../types/supabase";
import { getTableName } from '../constants/TableNames';
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap 
} from '../utils/tableMapping';

// Type for Bill Payment from database schema
export type BillPayment = Database['public']['Tables']['bill_payments']['Row'] & {
  account_name?: string;
  credit_card_name?: string;
  bill_name?: string;
};

export type BillPaymentInsert = Database['public']['Tables']['bill_payments']['Insert'];
export type BillPaymentUpdate = Database['public']['Tables']['bill_payments']['Update'];

export interface BillPaymentFilter {
  billId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'all';
  paymentDateFrom?: string;
  paymentDateTo?: string;
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

// Fetch bill payments with filtering
export const fetchBillPayments = async (
  filters: BillPaymentFilter = {},
  isDemo: boolean = false
): Promise<BillPayment[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Build select query - try with relationships, fallback to simple select if it fails
    let query = (supabase as any)
      .from(tableMap.bill_payments)
      .select('*')
      .eq('user_id', user.id);
    
    // Apply filters
    if (filters.billId) {
      query = query.eq('bill_id', filters.billId);
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    if (filters.paymentDateFrom) {
      query = query.gte('payment_date', filters.paymentDateFrom);
    }
    
    if (filters.paymentDateTo) {
      query = query.lte('payment_date', filters.paymentDateTo);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    // Order by payment date (descending - most recent first)
    query = query.order('payment_date', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching bill payments:", error);
      throw error;
    }
    
    if (data) {
      // Return data without relationship names (can be fetched separately if needed)
      return data.map((item: any) => ({
        ...item,
        account_name: null,
        credit_card_name: null,
        bill_name: null,
      })) as BillPayment[];
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchBillPayments:", error);
    throw error;
  }
};

// Add a new bill payment
export const addBillPayment = async (
  payment: Omit<BillPaymentInsert, 'user_id'>,
  isDemo: boolean = false
): Promise<BillPayment> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    const newPayment = {
      ...payment,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert payment - use simple select to avoid foreign key relationship issues
    const { data, error } = await (supabase as any)
      .from(tableMap.bill_payments)
      .insert([newPayment])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding bill payment:", error);
      throw error;
    }
    
    // Return payment without relationship data (relationships can be fetched separately if needed)
    return {
      ...data,
      account_name: null,
      credit_card_name: null,
      bill_name: null,
    } as BillPayment;
  } catch (error) {
    console.error("Error in addBillPayment:", error);
    throw error;
  }
};

// Update an existing bill payment
export const updateBillPayment = async (
  id: string,
  updates: Partial<BillPaymentUpdate>,
  isDemo: boolean = false
): Promise<BillPayment> => {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await (supabase as any)
      .from(tableMap.bill_payments)
      .update(updatedData)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error updating bill payment:", error);
      throw error;
    }
    
    // Return payment without relationship data
    return {
      ...data,
      account_name: null,
      credit_card_name: null,
      bill_name: null,
    } as BillPayment;
  } catch (error) {
    console.error("Error in updateBillPayment:", error);
    throw error;
  }
};

// Delete a bill payment
export const deleteBillPayment = async (
  id: string,
  isDemo: boolean = false
): Promise<void> => {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { error } = await (supabase as any)
      .from(tableMap.bill_payments)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting bill payment:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteBillPayment:", error);
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
}> => {
  try {
    const payments = await fetchBillPayments({ billId, status: 'completed' }, isDemo);
    
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paymentCount = payments.length;
    const lastPayment = payments[0] || null; // Already sorted by date desc
    const averagePayment = paymentCount > 0 ? totalPaid / paymentCount : 0;
    
    return {
      totalPaid,
      paymentCount,
      lastPaymentDate: lastPayment?.payment_date || null,
      averagePayment,
    };
  } catch (error) {
    console.error("Error in getBillPaymentStats:", error);
    throw error;
  }
};

