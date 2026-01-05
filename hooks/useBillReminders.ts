import { useState, useEffect, useCallback } from 'react';
import {
  fetchBillReminders,
  addBillReminder,
  updateBillReminder,
  deleteBillReminder,
  markReminderAsSent,
  createRemindersForBill,
  getPendingReminders,
  type BillReminder,
  type BillReminderFilter,
} from '../services/billRemindersService';
export interface UseBillRemindersOptions {
  billId?: string;
  filters?: BillReminderFilter;
  autoFetch?: boolean;
  isDemo?: boolean;
}

export function useBillReminders(options: UseBillRemindersOptions = {}) {
  const {
    billId,
    filters = {},
    autoFetch = true,
    isDemo = false,
  } = options;

  const [reminders, setReminders] = useState<BillReminder[]>([]);
  const [pendingReminders, setPendingReminders] = useState<BillReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    if (!billId && !filters.billId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const reminderFilters: BillReminderFilter = {
        ...filters,
        billId: billId || filters.billId,
      };
      
      const data = await fetchBillReminders(reminderFilters, isDemo);
      setReminders(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch reminders';
      setError(errorMessage);
      console.error('Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [billId, filters, isDemo]);

  // Fetch pending reminders
  const fetchPendingReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pending = await getPendingReminders(isDemo);
      setPendingReminders(pending);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch pending reminders';
      setError(errorMessage);
      console.error('Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  // Add reminder
  const addReminder = useCallback(async (reminder: Omit<BillReminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newReminder = await addBillReminder(reminder, isDemo);
      
      // Refresh reminders list
      await fetchReminders();
      
      console.log('Reminder added successfully');
      
      return newReminder;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add reminder';
      setError(errorMessage);
      console.error('Error:', errorMessage);
      throw err;
    }
  }, [isDemo, fetchReminders]);

  // Create reminders for a bill
  const createReminders = useCallback(async (dueDate: string, reminderDaysBefore: number[]) => {
    if (!billId) {
      throw new Error('Bill ID is required to create reminders');
    }
    
    try {
      setError(null);
      const createdReminders = await createRemindersForBill(billId, dueDate, reminderDaysBefore, isDemo);
      
      // Refresh reminders list
      await fetchReminders();
      
      console.log(`${createdReminders.length} reminder(s) created successfully`);
      
      return createdReminders;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create reminders';
      setError(errorMessage);
      console.error('Error:', errorMessage);
      throw err;
    }
  }, [billId, isDemo, fetchReminders, toast]);

  // Update reminder
  const updateReminder = useCallback(async (id: string, updates: Partial<BillReminder>) => {
    try {
      setError(null);
      const updatedReminder = await updateBillReminder(id, updates, isDemo);
      
      // Refresh reminders list
      await fetchReminders();
      
      console.log('Reminder updated successfully');
      
      return updatedReminder;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update reminder';
      setError(errorMessage);
      console.error('Error:', errorMessage);
      throw err;
    }
  }, [isDemo, fetchReminders]);

  // Mark reminder as sent
  const markAsSent = useCallback(async (id: string, deliveryMethod: 'push' | 'email' | 'sms' | 'in_app') => {
    try {
      setError(null);
      const updatedReminder = await markReminderAsSent(id, deliveryMethod, isDemo);
      
      // Refresh reminders list
      await fetchReminders();
      
      return updatedReminder;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark reminder as sent';
      setError(errorMessage);
      console.error('Error:', errorMessage);
      throw err;
    }
  }, [isDemo, fetchReminders]);

  // Delete reminder
  const removeReminder = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteBillReminder(id, isDemo);
      
      // Refresh reminders list
      await fetchReminders();
      
      console.log('Reminder deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete reminder';
      setError(errorMessage);
      console.error('Error:', errorMessage);
      throw err;
    }
  }, [isDemo, fetchReminders]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && (billId || filters.billId)) {
      fetchReminders();
    }
  }, [autoFetch, billId, filters.billId, fetchReminders]);

  return {
    reminders,
    pendingReminders,
    loading,
    error,
    fetchReminders,
    fetchPendingReminders,
    addReminder,
    createReminders,
    updateReminder,
    markAsSent,
    removeReminder,
    refresh: fetchReminders,
  };
}

