/**
 * =============================================================================
 * CREDIT CARD ANALYTICS SERVICE
 * =============================================================================
 * 
 * Provides analytics and insights for credit card spending.
 * Calculates trends, category breakdowns, merchant analysis, and patterns.
 */

import { TransactionsRepository } from './repositories/transactionsRepository';
import { CreditCardsRepository } from './repositories/creditCardsRepository';
import { getQueryCache, generateCacheKey } from './repositories/queryCache';

/**
 * Spending trend data point
 */
export interface SpendingTrendPoint {
  date: string; // ISO date string
  month: string; // "Jan", "Feb", etc.
  amount: number;
  transactionCount: number;
}

/**
 * Category spending breakdown
 */
export interface CategorySpending {
  category: string;
  subcategory?: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

/**
 * Merchant spending analysis
 */
export interface MerchantSpending {
  merchant: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  lastTransactionDate: string;
}

/**
 * Utilization pattern over time
 */
export interface UtilizationPattern {
  date: string;
  utilization: number; // percentage
  balance: number;
  limit: number;
}

/**
 * Payment behavior analysis
 */
export interface PaymentBehavior {
  averagePaymentAmount: number;
  averageDaysBetweenPayments: number;
  totalPayments: number;
  lastPaymentDate?: string;
  paymentFrequency: 'regular' | 'irregular' | 'none';
}

/**
 * Spending analysis result
 */
export interface CreditCardAnalytics {
  spendingTrends: SpendingTrendPoint[];
  categoryBreakdown: CategorySpending[];
  topMerchants: MerchantSpending[];
  utilizationPatterns: UtilizationPattern[];
  paymentBehavior: PaymentBehavior;
  totalSpending: number;
  averageMonthlySpending: number;
  spendingVelocity: number; // days until limit reached
}

/**
 * Get spending trends for credit cards
 */
export async function getSpendingTrends(
  userId: string,
  months: number = 6,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<SpendingTrendPoint[]> {
  const startTime = Date.now();
  const cache = getQueryCache();
  const cacheKey = generateCacheKey('cc_spending_trends', { userId, months });
  const cached = cache.get<SpendingTrendPoint[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const transactionsRepo = new TransactionsRepository(userId, isPremium, isOnline);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    // Fetch credit card transactions
    const transactions = await transactionsRepo.findAll({
      user_id: userId,
      isCreditCard: true,
      type: 'expense',
      dateRange: {
        start: startDate,
        end: endDate,
      },
      limit: 10000, // Large limit for historical data
      orderBy: 'date',
      orderDirection: 'ASC',
    });

    // Group by month
    const monthlyData = new Map<string, { amount: number; count: number }>();
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { amount: 0, count: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.amount += Math.abs(tx.amount);
      data.count += 1;
    });

    // Convert to array and sort
    const trends: SpendingTrendPoint[] = Array.from(monthlyData.entries())
      .map(([dateKey, data]) => {
        const [year, month] = dateKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          date: date.toISOString().split('T')[0],
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          amount: data.amount,
          transactionCount: data.count,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Cache for 5 minutes
    cache.set(cacheKey, trends, 5 * 60 * 1000);

    const duration = Date.now() - startTime;
    console.log(`✅ Calculated spending trends in ${duration}ms`);

    return trends;
  } catch (error) {
    console.error('❌ Error calculating spending trends:', error);
    throw error;
  }
}

/**
 * Get category breakdown for credit card spending
 */
export async function getCategoryBreakdown(
  userId: string,
  months: number = 3,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CategorySpending[]> {
  const startTime = Date.now();
  const cache = getQueryCache();
  const cacheKey = generateCacheKey('cc_category_breakdown', { userId, months });
  const cached = cache.get<CategorySpending[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const transactionsRepo = new TransactionsRepository(userId, isPremium, isOnline);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    // Fetch credit card transactions
    const transactions = await transactionsRepo.findAll({
      user_id: userId,
      isCreditCard: true,
      type: 'expense',
      dateRange: {
        start: startDate,
        end: endDate,
      },
      limit: 10000,
    });

    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number; subcategory?: string }>();
    let totalAmount = 0;

    transactions.forEach(tx => {
      const category = tx.category_id || 'Uncategorized';
      const key = category;
      
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { amount: 0, count: 0, subcategory: tx.subcategory_id || undefined });
      }
      
      const data = categoryMap.get(key)!;
      data.amount += Math.abs(tx.amount);
      data.count += 1;
      totalAmount += Math.abs(tx.amount);
    });

    // Convert to array and calculate percentages
    const breakdown: CategorySpending[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        subcategory: data.subcategory,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Cache for 5 minutes
    cache.set(cacheKey, breakdown, 5 * 60 * 1000);

    const duration = Date.now() - startTime;
    console.log(`✅ Calculated category breakdown in ${duration}ms`);

    return breakdown;
  } catch (error) {
    console.error('❌ Error calculating category breakdown:', error);
    throw error;
  }
}

/**
 * Get top merchants by spending
 */
export async function getTopMerchants(
  userId: string,
  limit: number = 10,
  months: number = 3,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<MerchantSpending[]> {
  const startTime = Date.now();
  const cache = getQueryCache();
  const cacheKey = generateCacheKey('cc_top_merchants', { userId, limit, months });
  const cached = cache.get<MerchantSpending[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const transactionsRepo = new TransactionsRepository(userId, isPremium, isOnline);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    // Fetch credit card transactions
    const transactions = await transactionsRepo.findAll({
      user_id: userId,
      isCreditCard: true,
      type: 'expense',
      dateRange: {
        start: startDate,
        end: endDate,
      },
      limit: 10000,
    });

    // Group by merchant
    const merchantMap = new Map<string, { amount: number; count: number; lastDate: string }>();
    let totalAmount = 0;

    transactions.forEach(tx => {
      const merchant = tx.merchant || tx.name || 'Unknown';
      const key = merchant;
      
      if (!merchantMap.has(key)) {
        merchantMap.set(key, { amount: 0, count: 0, lastDate: tx.date });
      }
      
      const data = merchantMap.get(key)!;
      data.amount += Math.abs(tx.amount);
      data.count += 1;
      if (tx.date > data.lastDate) {
        data.lastDate = tx.date;
      }
      totalAmount += Math.abs(tx.amount);
    });

    // Convert to array and calculate percentages
    const merchants: MerchantSpending[] = Array.from(merchantMap.entries())
      .map(([merchant, data]) => ({
        merchant,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        transactionCount: data.count,
        lastTransactionDate: data.lastDate,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);

    // Cache for 5 minutes
    cache.set(cacheKey, merchants, 5 * 60 * 1000);

    const duration = Date.now() - startTime;
    console.log(`✅ Calculated top merchants in ${duration}ms`);

    return merchants;
  } catch (error) {
    console.error('❌ Error calculating top merchants:', error);
    throw error;
  }
}

/**
 * Get utilization patterns over time
 */
export async function getUtilizationPatterns(
  userId: string,
  months: number = 6,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<UtilizationPattern[]> {
  const startTime = Date.now();
  const cache = getQueryCache();
  const cacheKey = generateCacheKey('cc_utilization_patterns', { userId, months });
  const cached = cache.get<UtilizationPattern[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const cardsRepo = new CreditCardsRepository(userId, isPremium, isOnline);
    
    // Get current cards
    const cards = await cardsRepo.findAll({
      user_id: userId,
      limit: 1000,
    });

    // For now, return current utilization (can be enhanced with historical snapshots)
    const patterns: UtilizationPattern[] = cards.map(card => {
      const utilization = card.credit_limit > 0
        ? (card.current_balance / card.credit_limit) * 100
        : 0;
      
      return {
        date: new Date().toISOString().split('T')[0],
        utilization: Math.round(utilization * 10) / 10,
        balance: card.current_balance,
        limit: card.credit_limit,
      };
    });

    // Cache for 2 minutes
    cache.set(cacheKey, patterns, 2 * 60 * 1000);

    const duration = Date.now() - startTime;
    console.log(`✅ Calculated utilization patterns in ${duration}ms`);

    return patterns;
  } catch (error) {
    console.error('❌ Error calculating utilization patterns:', error);
    throw error;
  }
}

/**
 * Analyze payment behavior
 */
export async function getPaymentBehavior(
  userId: string,
  months: number = 6,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<PaymentBehavior> {
  const startTime = Date.now();
  const cache = getQueryCache();
  const cacheKey = generateCacheKey('cc_payment_behavior', { userId, months });
  const cached = cache.get<PaymentBehavior>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const transactionsRepo = new TransactionsRepository(userId, isPremium, isOnline);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    // Fetch credit card payment transactions (income type for credit cards)
    const payments = await transactionsRepo.findAll({
      user_id: userId,
      isCreditCard: true,
      type: 'income', // Payments are income for credit cards
      dateRange: {
        start: startDate,
        end: endDate,
      },
      limit: 10000,
      orderBy: 'date',
      orderDirection: 'ASC',
    });

    if (payments.length === 0) {
      return {
        averagePaymentAmount: 0,
        averageDaysBetweenPayments: 0,
        totalPayments: 0,
        paymentFrequency: 'none',
      };
    }

    const totalAmount = payments.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const averagePaymentAmount = totalAmount / payments.length;

    // Calculate average days between payments
    let totalDays = 0;
    for (let i = 1; i < payments.length; i++) {
      const prevDate = new Date(payments[i - 1].date);
      const currDate = new Date(payments[i].date);
      const daysDiff = Math.ceil((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += daysDiff;
    }
    const averageDaysBetweenPayments = payments.length > 1 ? totalDays / (payments.length - 1) : 0;

    // Determine payment frequency
    let paymentFrequency: 'regular' | 'irregular' | 'none' = 'irregular';
    if (payments.length >= 3) {
      const variance = payments.slice(1).reduce((sum, tx, idx) => {
        const prevDate = new Date(payments[idx].date);
        const currDate = new Date(tx.date);
        const daysDiff = Math.ceil((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.pow(daysDiff - averageDaysBetweenPayments, 2);
      }, 0) / (payments.length - 1);
      
      // If variance is low, payments are regular
      if (variance < 100) { // Less than 10 days variance
        paymentFrequency = 'regular';
      }
    }

    const lastPayment = payments[payments.length - 1];

    const behavior: PaymentBehavior = {
      averagePaymentAmount: Math.round(averagePaymentAmount * 100) / 100,
      averageDaysBetweenPayments: Math.round(averageDaysBetweenPayments),
      totalPayments: payments.length,
      lastPaymentDate: lastPayment.date,
      paymentFrequency,
    };

    // Cache for 5 minutes
    cache.set(cacheKey, behavior, 5 * 60 * 1000);

    const duration = Date.now() - startTime;
    console.log(`✅ Calculated payment behavior in ${duration}ms`);

    return behavior;
  } catch (error) {
    console.error('❌ Error calculating payment behavior:', error);
    throw error;
  }
}

/**
 * Get comprehensive credit card analytics
 */
export async function getCreditCardAnalytics(
  userId: string,
  months: number = 6,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardAnalytics> {
  const startTime = Date.now();

  try {
    // Fetch all analytics in parallel
    const [
      spendingTrends,
      categoryBreakdown,
      topMerchants,
      utilizationPatterns,
      paymentBehavior,
    ] = await Promise.all([
      getSpendingTrends(userId, months, isPremium, isOnline),
      getCategoryBreakdown(userId, Math.min(months, 3), isPremium, isOnline),
      getTopMerchants(userId, 10, Math.min(months, 3), isPremium, isOnline),
      getUtilizationPatterns(userId, months, isPremium, isOnline),
      getPaymentBehavior(userId, months, isPremium, isOnline),
    ]);

    // Calculate totals
    const totalSpending = spendingTrends.reduce((sum, point) => sum + point.amount, 0);
    const averageMonthlySpending = spendingTrends.length > 0
      ? totalSpending / spendingTrends.length
      : 0;

    // Calculate spending velocity (simplified: based on average monthly spending)
    const cardsRepo = new CreditCardsRepository(userId, isPremium, isOnline);
    const totalLimit = await cardsRepo.getTotalCreditLimit();
    const totalBalance = await cardsRepo.getTotalCurrentBalance();
    const availableCredit = Math.max(0, totalLimit - totalBalance);
    
    const spendingVelocity = averageMonthlySpending > 0 && availableCredit > 0
      ? Math.ceil((availableCredit / averageMonthlySpending) * 30) // days until limit reached
      : Infinity;

    const analytics: CreditCardAnalytics = {
      spendingTrends,
      categoryBreakdown,
      topMerchants,
      utilizationPatterns,
      paymentBehavior,
      totalSpending,
      averageMonthlySpending,
      spendingVelocity,
    };

    const duration = Date.now() - startTime;
    console.log(`✅ Calculated comprehensive credit card analytics in ${duration}ms`);

    return analytics;
  } catch (error) {
    console.error('❌ Error calculating credit card analytics:', error);
    throw error;
  }
}



