/**
 * Autopay Service
 * 
 * This service handles automatic payment processing for recurring bills and due bills.
 * 
 * Use Cases:
 * - Process automatic payments for bills that are due today and have autopay enabled
 * - Update status of non-autopay bills from 'upcoming' to 'pending' when they become due
 * - Create recurring bills for the next payment cycle after processing autopay
 * - Handle both bank account and credit card autopay sources
 * - Calculate next due dates based on bill frequency (monthly, weekly, yearly, etc.)
 * - Manage bill end dates to prevent creating bills beyond their expiration
 * 
 * Key Functions:
 * - processAutopayForDueBills(): Processes all bills due today with autopay enabled
 * - updatePendingBillStatuses(): Updates bills due today without autopay to pending status
 * - calculateNextDueDate(): Helper function to calculate next payment due date
 * 
 * This service is typically called by scheduled tasks or cron jobs to automate bill payments.
 */

import { supabase } from "../lib/supabase/client";
import { UpcomingBill } from '../hooks/useUpcomingBills';
import { Transaction } from '../src/mobile/hooks/useTransactions';
import { Database } from '../types/supabase';
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap 
} from '../utils/tableMapping';

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);
  
  // Validate consistency during development
  if (process.env.NODE_ENV === 'development') {
    validateTableConsistency(tableMap);
  }
  
  return tableMap;
};

type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

/**
 * Processes autopay for bills that are due today
 * This function would typically be called by a cron job or scheduled task
 */
export async function processAutopayForDueBills(isDemo: boolean = false) {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const tableMap = getTableMapping(isDemo);
    
    // Get all bills due today with autopay enabled using dynamic table names
    const { data: dueBills, error } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .select(`
        *,
        accounts:${tableMap.accounts}!upcoming_bills_account_id_fkey(id, name, type),
        credit_cards:${tableMap.credit_cards}!upcoming_bills_credit_card_id_fkey(id, name),
        budget_categories:${tableMap.budget_categories}!upcoming_bills_category_id_fkey(id, name),
        budget_subcategories:${tableMap.budget_subcategories}!upcoming_bills_subcategory_id_fkey(id, name)
      `)
      .eq('due_date', today)
      .eq('autopay', true)
      .eq('status', 'upcoming');
    
    if (error) {
      console.error('Error fetching due bills:', error);
      throw error;
    }
    
    if (!dueBills || dueBills.length === 0) {
      console.log('No bills due today with autopay enabled');
      return { processed: 0, errors: 0 };
    }
    
    // Process each due bill
    let processedCount = 0;
    let errorCount = 0;
    
    for (const bill of dueBills) {
      try {
        // Create a transaction for the bill payment
        const transactionData: TransactionInsert = {
          name: `Autopay: ${bill.name}`,
          description: `Automatic payment for ${bill.name}`,
          amount: bill.amount,
          date: today,
          type: 'expense',
          merchant: bill.name,
          is_recurring: true,
          parent_transaction_id: bill.transaction_id,
          category_id: bill.category_id,
          subcategory_id: bill.subcategory_id,
          user_id: bill.user_id,
          source_account_type: bill.autopay_source === 'account' ? (bill.accounts?.type as any || 'bank') : 'credit_card'
        };
        
        // Set source account based on autopay_source
        if (bill.autopay_source === 'account' && bill.account_id) {
          transactionData.source_account_id = bill.account_id;
          transactionData.source_account_name = bill.accounts?.name;
        } else if (bill.autopay_source === 'credit_card' && bill.credit_card_id) {
          transactionData.source_account_id = bill.credit_card_id;
          transactionData.source_account_name = bill.credit_cards?.name;
        }
        
        // Insert the transaction using dynamic table name
        const { data: newTransaction, error: transactionError } = await (supabase as any)
          .from(tableMap.transactions)
          .insert(transactionData)
          .select();
        
        if (transactionError) {
          console.error('Error creating autopay transaction:', transactionError);
          throw transactionError;
        }
        
        // Update the bill status to paid using dynamic table name
        const { error: updateError } = await (supabase as any)
          .from(tableMap.upcoming_bills)
          .update({ status: 'paid' })
          .eq('id', bill.id);
        
        if (updateError) {
          console.error('Error updating bill status:', updateError);
          throw updateError;
        }
        
        // Determine next due date based on frequency and create the next bill
        const nextDueDate = calculateNextDueDate(today, bill.frequency);
        
        // Check if we should create a next bill based on end date
        const shouldCreateNextBill = nextDueDate && (
          // Create next bill if there's no end date
          !bill.end_date || 
          // Or if the next due date is before or equal to the end date
          new Date(nextDueDate) <= new Date(bill.end_date)
        );
        
        if (shouldCreateNextBill && nextDueDate) {
          // Create next recurring bill using dynamic table name
          const nextBill = {
            user_id: bill.user_id,
            transaction_id: bill.transaction_id,
            name: bill.name,
            amount: bill.amount,
            due_date: nextDueDate,
            frequency: bill.frequency,
            autopay: bill.autopay,
            autopay_source: bill.autopay_source,
            account_id: bill.account_id,
            credit_card_id: bill.credit_card_id,
            category_id: bill.category_id,
            subcategory_id: bill.subcategory_id,
            status: 'upcoming',
            description: bill.description,
            end_date: bill.end_date
          };
          
          const { error: nextBillError } = await (supabase as any)
            .from(tableMap.upcoming_bills)
            .insert([nextBill]);
          
          if (nextBillError) {
            console.error('Error creating next recurring bill:', nextBillError);
            throw nextBillError;
          }
        }
        
        processedCount++;
      } catch (err) {
        console.error(`Error processing autopay for bill ${bill.id}:`, err);
        errorCount++;
      }
    }
    
    return { processed: processedCount, errors: errorCount };
  } catch (err) {
    console.error('Error in processAutopayForDueBills:', err);
    throw err;
  }
}

/**
 * Updates the status of non-autopay bills that are due today to 'pending'
 */
export async function updatePendingBillStatuses(isDemo: boolean = false) {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const tableMap = getTableMapping(isDemo);
    
    // Update all bills due today with autopay disabled to 'pending' using dynamic table name
    const { data, error } = await (supabase as any)
      .from(tableMap.upcoming_bills)
      .update({ status: 'pending' })
      .eq('due_date', today)
      .eq('autopay', false)
      .eq('status', 'upcoming')
      .select();
    
    if (error) {
      console.error('Error updating pending bill statuses:', error);
      throw error;
    }
    
    return { updated: data ? data.length : 0 };
  } catch (err) {
    console.error('Error in updatePendingBillStatuses:', err);
    throw err;
  }
}

/**
 * Calculates the next due date based on frequency
 */
function calculateNextDueDate(currentDateStr: string, frequency: string): string | null {
  const currentDate = new Date(currentDateStr);
  let nextDate: Date;
  
  switch (frequency) {
    case 'weekly':
      nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate = new Date(currentDate);
      nextDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate = new Date(currentDate);
      nextDate.setMonth(currentDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate = new Date(currentDate);
      nextDate.setFullYear(currentDate.getFullYear() + 1);
      break;
    default:
      return null;
  }
  
  return nextDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
} 