import { useState, useEffect, useCallback } from 'react';
import {
  fetchBillPayments,
  addBillPayment,
  updateBillPayment,
  deleteBillPayment,
  getBillPaymentStats,
  type BillPayment,
  type BillPaymentFilter,
} from '../services/billPaymentsService';
export interface UseBillPaymentsOptions {
  billId?: string;
  filters?: BillPaymentFilter;
  autoFetch?: boolean;
  isDemo?: boolean;
}

export function useBillPayments(options: UseBillPaymentsOptions = {}) {
  const {
    billId,
    filters = {},
    autoFetch = true,
    isDemo = false,
  } = options;

  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [stats, setStats] = useState<{
    totalPaid: number;
    paymentCount: number;
    lastPaymentDate: string | null;
    averagePayment: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    if (!billId && !filters.billId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const paymentFilters: BillPaymentFilter = {
        ...filters,
        billId: billId || filters.billId,
      };
      
      const data = await fetchBillPayments(paymentFilters, isDemo);
      setPayments(data);
      
      // Fetch stats if billId is available
      if (billId || filters.billId) {
        const paymentStats = await getBillPaymentStats(billId || filters.billId!, isDemo);
        setStats(paymentStats);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch payments';
      setError(errorMessage);
      console.error('Failed to fetch payments:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [billId, filters, isDemo]);

  // Add payment
  const addPayment = useCallback(async (payment: Omit<BillPayment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newPayment = await addBillPayment(payment, isDemo);
      
      // Refresh payments list
      await fetchPayments();
      
      console.log('Payment added successfully');
      
      return newPayment;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add payment';
      setError(errorMessage);
      console.error('Failed to add payment:', errorMessage);
      throw err;
    }
  }, [isDemo, fetchPayments]);

  // Update payment
  const updatePayment = useCallback(async (id: string, updates: Partial<BillPayment>) => {
    try {
      setError(null);
      const updatedPayment = await updateBillPayment(id, updates, isDemo);
      
      // Refresh payments list
      await fetchPayments();
      
      console.log('Payment updated successfully');
      
      return updatedPayment;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update payment';
      setError(errorMessage);
      console.error('Failed to update payment:', errorMessage);
      throw err;
    }
  }, [isDemo, fetchPayments]);

  // Delete payment
  const removePayment = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteBillPayment(id, isDemo);
      
      // Refresh payments list
      await fetchPayments();
      
      console.log('Payment deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete payment';
      setError(errorMessage);
      console.error('Failed to delete payment:', errorMessage);
      throw err;
    }
  }, [isDemo, fetchPayments]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && (billId || filters.billId)) {
      fetchPayments();
    }
  }, [autoFetch, billId, filters.billId, fetchPayments]);

  return {
    payments,
    stats,
    loading,
    error,
    fetchPayments,
    addPayment,
    updatePayment,
    removePayment,
    refresh: fetchPayments,
  };
}

