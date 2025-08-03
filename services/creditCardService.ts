import { supabase } from "../lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "../types/supabase";
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap 
} from '../utils/tableMapping';

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  logoUrl?: string;
  lastFourDigits: string;
  creditLimit: number;
  currentBalance: number;
  dueDate: string;
  billingCycle?: string;
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

// Maps the database credit card to the application model
const mapDbCreditCardToModel = (dbCard: Database["public"]["Tables"]["credit_cards"]["Row"]): CreditCard => {
  return {
    id: dbCard.id,
    name: dbCard.name,
    bank: dbCard.institution || "",
    logoUrl: dbCard.logo_url,
    lastFourDigits: dbCard.last_four_digits.toString(),
    creditLimit: dbCard.credit_limit,
    currentBalance: dbCard.current_balance,
    dueDate: dbCard.due_date,
    billingCycle: dbCard.billing_cycle,
  };
};

// Maps the application credit card model to the database format
const mapModelToDbCreditCard = (card: Omit<CreditCard, 'id'>, userId: string) => {
  return {
    name: card.name,
    institution: card.bank,
    logo_url: card.logoUrl,
    last_four_digits: Number(card.lastFourDigits),
    credit_limit: card.creditLimit,
    current_balance: card.currentBalance,
    due_date: card.dueDate,
    billing_cycle: card.billingCycle,
    user_id: userId,
  };
};

// Fetch all credit cards for the current user
export const fetchCreditCards = async (isDemo: boolean = false): Promise<CreditCard[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Fetch credit cards from the database using dynamic table name
    const { data, error } = await (supabase as any)
      .from(tableMap.credit_cards)
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error fetching credit cards:", error);
      toast.error("Failed to fetch credit cards", {
        description: error.message
      });
      throw error;
    }
    
    // Map and return the credit cards
    return (data || []).map(card => mapDbCreditCardToModel(card));
  } catch (error) {
    console.error("Error in fetchCreditCards:", error);
    throw error;
  }
};

// Add a new credit card
export const addCreditCard = async (card: Omit<CreditCard, 'id'>, isDemo: boolean = false): Promise<CreditCard> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Map the credit card to the database model
    const dbCard = mapModelToDbCreditCard(card, user.id);
    
    // Insert the credit card into the database using dynamic table name
    const { data, error } = await (supabase as any)
      .from(tableMap.credit_cards)
      .insert(dbCard)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding credit card:", error);
      toast.error("Failed to add credit card", {
        description: error.message
      });
      throw error;
    }
    
    toast.success("Credit card added successfully");
    return mapDbCreditCardToModel(data);
  } catch (error) {
    console.error("Error in addCreditCard:", error);
    throw error;
  }
};

// Update an existing credit card
export const updateCreditCard = async (id: string, updates: Partial<CreditCard>, isDemo: boolean = false): Promise<CreditCard> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Convert application model to database model
    const dbUpdates: Partial<Database["public"]["Tables"]["credit_cards"]["Update"]> = {};
    if ('name' in updates) dbUpdates.name = updates.name;
    if ('bank' in updates) dbUpdates.institution = updates.bank;
    if ('logoUrl' in updates) dbUpdates.logo_url = updates.logoUrl;
    if ('lastFourDigits' in updates) dbUpdates.last_four_digits = Number(updates.lastFourDigits);
    if ('creditLimit' in updates) dbUpdates.credit_limit = updates.creditLimit;
    if ('currentBalance' in updates) dbUpdates.current_balance = updates.currentBalance;
    if ('dueDate' in updates) dbUpdates.due_date = updates.dueDate;
    if ('billingCycle' in updates) dbUpdates.billing_cycle = updates.billingCycle;
    
    // Update the credit card in the database using dynamic table name
    const { data, error } = await (supabase as any)
      .from(tableMap.credit_cards)
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating credit card:", error);
      toast.error("Failed to update credit card", {
        description: error.message
      });
      throw error;
    }
    
    toast.success("Credit card updated successfully");
    return mapDbCreditCardToModel(data);
  } catch (error) {
    console.error("Error in updateCreditCard:", error);
    throw error;
  }
};

// Delete a credit card
export const deleteCreditCard = async (id: string, isDemo: boolean = false): Promise<void> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Delete the credit card from the database using dynamic table name
    const { error } = await (supabase as any)
      .from(tableMap.credit_cards)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error deleting credit card:", error);
      toast.error("Failed to delete credit card", {
        description: error.message
      });
      throw error;
    }
    
    toast.success("Credit card deleted successfully");
  } catch (error) {
    console.error("Error in deleteCreditCard:", error);
    throw error;
  }
};

// Fetch credit cards history for charts
export const fetchCreditCardsHistory = async (months: number = 12, isDemo: boolean = false): Promise<{ date: string; value: number }[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    try {
      // Fetch credit card transactions to build historical view
      const { data, error } = await (supabase as any)
        .from(tableMap.transactions)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_credit_card', true)
        .order('date', { ascending: true });
      
      if (error) {
        console.error("Error fetching credit card transactions:", error);
        throw error;
      }
      
      // Construct a timeline of credit card balances
      const now = new Date();
      const history: { date: string; value: number }[] = [];
      let runningBalance = 0;
      
      // Create data points for each month
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthString = date.toISOString().slice(0, 7); // YYYY-MM format
        
        // Find transactions for this month
        const monthTransactions = (data || []).filter((transaction: any) => {
          const transactionDate = new Date(transaction.date);
          const transactionMonth = transactionDate.toISOString().slice(0, 7);
          return transactionMonth === monthString;
        });
        
        // Calculate balance change for the month (for credit cards, expenses increase balance)
        const monthChange = monthTransactions.reduce((sum: number, tx: any) => {
          if (tx.type === 'expense') {
            return sum + tx.amount; // Credit card expenses increase the balance
          } else if (tx.type === 'income') {
            return sum - tx.amount; // Payments reduce the balance
          }
          return sum;
        }, 0);
        
        runningBalance += monthChange;
        
        history.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          value: Math.max(0, runningBalance) // Ensure non-negative balance
        });
      }
      
      return history.length > 0 ? history : generatePlaceholderHistory(months);
    } catch (error) {
      console.error("Error processing credit card history:", error);
      // Return placeholder data on any processing error
      return generatePlaceholderHistory(months);
    }
  } catch (error) {
    console.error("Error in fetchCreditCardsHistory:", error);
    // Return placeholder data on authentication or other errors
    return generatePlaceholderHistory(months);
  }
};

// Generate placeholder history data
const generatePlaceholderHistory = (months: number = 12): { date: string; value: number }[] => {
  const history: { date: string; value: number }[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const baseValue = 1000 + Math.random() * 2000; // Random value between 1000-3000
    
    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short' }),
      value: Math.round(baseValue)
    });
  }
  
  return history;
};

// Fetch credit card balance history from dedicated history table
export async function fetchCreditCardBalanceHistory(userId: string, months: number = 12, isDemo: boolean = false): Promise<{ date: string; creditLimit: number; currentBalance: number }[]> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);
    
    // Use dynamic table name for credit card history
    const { data, error } = await (supabase as any)
      .from(tableMap.credit_card_history || 'credit_card_history')
      .select('snapshot_date, credit_limit, current_balance')
      .eq('user_id', userId)
      .gte('snapshot_date', startDate.toISOString())
      .lte('snapshot_date', endDate.toISOString())
      .order('snapshot_date', { ascending: true });

    if (error) {
      console.error("Error fetching credit card balance history:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      // Return placeholder data if no history found
      const placeholderData: { date: string; creditLimit: number; currentBalance: number }[] = [];
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        placeholderData.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          creditLimit: 5000,
          currentBalance: 1500 + Math.random() * 2000
        });
      }
      return placeholderData;
    }

    // Transform data to expected format
    return data.map((row: any) => ({
      date: new Date(row.snapshot_date).toLocaleDateString('en-US', { month: 'short' }),
      creditLimit: row.credit_limit,
      currentBalance: row.current_balance
    }));
  } catch (error) {
    console.error("Error in fetchCreditCardBalanceHistory:", error);
    // Return placeholder data on error
    const placeholderData: { date: string; creditLimit: number; currentBalance: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      placeholderData.push({
        date: date.toLocaleDateString('en-US', { month: 'short' }),
        creditLimit: 5000,
        currentBalance: 1500 + Math.random() * 2000
      });
    }
    return placeholderData;
  }
} 