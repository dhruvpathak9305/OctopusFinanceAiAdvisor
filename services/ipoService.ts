/**
 * IPO Service
 * Manages IPO data and user applications
 */

import { supabase } from '../lib/supabase/client';
import type {
  IPO,
  IPOStatus,
  IPOApplication,
  IPOApplicationInput,
  IPOApplicationCategory,
} from '../types/portfolio-extended';

export class IPOService {
  // =====================================================
  // IPO CRUD OPERATIONS
  // =====================================================

  /**
   * Get all IPOs with optional status filter
   */
  static async getIPOs(status?: IPOStatus): Promise<IPO[]> {
    try {
      let query = supabase.from('ipos').select('*').order('open_date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching IPOs:', error);
      return [];
    }
  }

  /**
   * Get upcoming IPOs
   */
  static async getUpcomingIPOs(): Promise<IPO[]> {
    try {
      const { data, error } = await supabase
        .from('ipos')
        .select('*')
        .in('status', ['upcoming', 'open'])
        .order('open_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming IPOs:', error);
      return [];
    }
  }

  /**
   * Get listed IPOs
   */
  static async getListedIPOs(): Promise<IPO[]> {
    try {
      const { data, error } = await supabase
        .from('ipos')
        .select('*')
        .eq('status', 'listed')
        .order('listing_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching listed IPOs:', error);
      return [];
    }
  }

  /**
   * Get single IPO by ID
   */
  static async getIPO(ipoId: string): Promise<IPO | null> {
    try {
      const { data, error } = await supabase
        .from('ipos')
        .select('*')
        .eq('id', ipoId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching IPO:', error);
      return null;
    }
  }

  // =====================================================
  // IPO APPLICATION OPERATIONS
  // =====================================================

  /**
   * Get user's IPO applications
   */
  static async getUserApplications(userId?: string): Promise<IPOApplication[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ipo_applications')
        .select(`
          *,
          ipo:ipos(*)
        `)
        .eq('user_id', targetUserId)
        .order('application_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching IPO applications:', error);
      return [];
    }
  }

  /**
   * Get user's application for specific IPO
   */
  static async getApplication(ipoId: string): Promise<IPOApplication | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ipo_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('ipo_id', ipoId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching IPO application:', error);
      return null;
    }
  }

  /**
   * Apply for IPO
   */
  static async applyForIPO(input: IPOApplicationInput): Promise<IPOApplication> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get IPO details to calculate total amount
      const ipo = await this.getIPO(input.ipo_id);
      
      if (!ipo) {
        throw new Error('IPO not found');
      }

      const totalAmount = input.num_lots * (ipo.lot_size || 0) * input.bid_price;

      const { data, error } = await supabase
        .from('ipo_applications')
        .insert({
          user_id: user.id,
          ipo_id: input.ipo_id,
          num_lots: input.num_lots,
          bid_price: input.bid_price,
          total_amount: totalAmount,
          upi_id: input.upi_id,
          application_date: new Date().toISOString().split('T')[0],
          application_category: input.application_category || 'retail',
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error applying for IPO:', error);
      throw error;
    }
  }

  /**
   * Update IPO application
   */
  static async updateApplication(
    applicationId: string,
    updates: Partial<IPOApplication>
  ): Promise<IPOApplication> {
    try {
      const { data, error } = await supabase
        .from('ipo_applications')
        .update(updates)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating IPO application:', error);
      throw error;
    }
  }

  /**
   * Update allotment status
   */
  static async updateAllotmentStatus(
    applicationId: string,
    allottedShares: number,
    refundAmount: number
  ): Promise<void> {
    try {
      const allotmentStatus =
        allottedShares > 0 ? (allottedShares < 100 ? 'partially_allotted' : 'allotted') : 'not_allotted';

      await supabase
        .from('ipo_applications')
        .update({
          allotment_status: allotmentStatus,
          allotted_shares: allottedShares,
          refund_amount: refundAmount,
        })
        .eq('id', applicationId);
    } catch (error) {
      console.error('Error updating allotment status:', error);
      throw error;
    }
  }

  /**
   * Update listing gains
   */
  static async updateListingGains(
    applicationId: string,
    listingPrice: number
  ): Promise<void> {
    try {
      // Get application details
      const { data: application, error: appError } = await supabase
        .from('ipo_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      const listingGain = application.allotted_shares * (listingPrice - application.bid_price);
      const listingGainPct = ((listingPrice - application.bid_price) / application.bid_price) * 100;

      await supabase
        .from('ipo_applications')
        .update({
          listing_gain: listingGain,
          listing_gain_pct: listingGainPct,
        })
        .eq('id', applicationId);
    } catch (error) {
      console.error('Error updating listing gains:', error);
      throw error;
    }
  }

  // =====================================================
  // IPO ANALYTICS
  // =====================================================

  /**
   * Get IPO statistics for user
   */
  static async getIPOStatistics(userId?: string): Promise<{
    total_applied: number;
    total_allotted: number;
    total_invested: number;
    total_gains: number;
    success_rate: number;
  }> {
    try {
      const applications = await this.getUserApplications(userId);

      const stats = {
        total_applied: applications.length,
        total_allotted: applications.filter(
          app => app.allotment_status === 'allotted' || app.allotment_status === 'partially_allotted'
        ).length,
        total_invested: applications
          .filter(app => app.allotment_status !== 'not_allotted')
          .reduce((sum, app) => sum + app.total_amount, 0),
        total_gains: applications.reduce((sum, app) => sum + (app.listing_gain || 0), 0),
        success_rate: 0,
      };

      stats.success_rate = stats.total_applied > 0 ? (stats.total_allotted / stats.total_applied) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching IPO statistics:', error);
      return {
        total_applied: 0,
        total_allotted: 0,
        total_invested: 0,
        total_gains: 0,
        success_rate: 0,
      };
    }
  }

  // =====================================================
  // UTILITIES
  // =====================================================

  /**
   * Calculate IPO investment amount
   */
  static calculateInvestmentAmount(
    numLots: number,
    lotSize: number,
    pricePerShare: number
  ): number {
    return numLots * lotSize * pricePerShare;
  }

  /**
   * Get application category based on amount
   */
  static getApplicationCategory(amount: number): IPOApplicationCategory {
    if (amount < 200000) return 'retail';
    if (amount < 1000000) return 'hni';
    return 'shn';
  }

  /**
   * Check if IPO is currently open
   */
  static isIPOOpen(ipo: IPO): boolean {
    const now = new Date();
    const openDate = new Date(ipo.open_date || '');
    const closeDate = new Date(ipo.close_date || '');

    return now >= openDate && now <= closeDate && ipo.status === 'open';
  }

  /**
   * Get days until opening
   */
  static getDaysUntilOpen(ipo: IPO): number {
    const now = new Date();
    const openDate = new Date(ipo.open_date || '');
    
    const diffTime = openDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Format IPO date range
   */
  static formatDateRange(openDate: string, closeDate: string): string {
    const open = new Date(openDate);
    const close = new Date(closeDate);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

    return `${open.toLocaleDateString('en-IN', options)} - ${close.toLocaleDateString('en-IN', options)}`;
  }

  /**
   * Get subscription status color
   */
  static getSubscriptionColor(subscription: number): string {
    if (subscription >= 10) return '#059669'; // High demand - green
    if (subscription >= 3) return '#10B981'; // Good demand - green
    if (subscription >= 1) return '#F59E0B'; // Subscribed - amber
    return '#EF4444'; // Under-subscribed - red
  }

  /**
   * Format subscription multiple
   */
  static formatSubscription(value: number): string {
    return `${value.toFixed(2)}x`;
  }
}

