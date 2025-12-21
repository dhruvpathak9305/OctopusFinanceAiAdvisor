/**
 * =============================================================================
 * CREDIT CARDS SERVICE - LOCAL-FIRST IMPLEMENTATION
 * =============================================================================
 * 
 * Local-first version of credit cards service using repositories.
 * Provides faster loading and offline support.
 */

import { CreditCardsRepository, CreditCard, CreditCardInsert, CreditCardUpdate } from './repositories/creditCardsRepository';
import { getQueryCache, generateCacheKey } from './repositories/queryCache';

/**
 * Credit card summary statistics
 */
export interface CreditCardSummary {
  totalCreditLimit: number;
  totalCurrentBalance: number;
  totalAvailableCredit: number;
  averageUtilization: number;
  totalCards: number;
  highUtilizationCards: number; // Cards with >70% utilization
  upcomingDueDates: number; // Cards with due dates in next 7 days
}

/**
 * Credit card with calculated utilization
 */
export interface CreditCardWithUtilization extends CreditCard {
  utilizationPercentage: number;
  availableCredit: number;
  daysUntilDue?: number;
  isOverdue?: boolean;
}

/**
 * Fetch all credit cards from local DB
 */
export async function fetchCreditCardsLocal(
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardWithUtilization[]> {
  const startTime = Date.now();
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    // Check cache first
    const cache = getQueryCache();
    const cacheKey = generateCacheKey('credit_cards_local', { user_id: userId });
    const cached = cache.get<CreditCardWithUtilization[]>(cacheKey);
    
    if (cached !== null) {
      console.log(`📦 Credit cards cache hit (${Date.now() - startTime}ms)`);
      return cached;
    }

    // Fetch from local DB
    const cards = await repo.findAll({
      user_id: userId,
      orderBy: 'name',
      orderDirection: 'ASC',
      limit: 1000, // No practical limit for credit cards
    });

    // Calculate utilization and enrich data
    const enrichedCards: CreditCardWithUtilization[] = cards.map(card => {
      const utilizationPercentage = card.credit_limit > 0
        ? Math.round((card.current_balance / card.credit_limit) * 100)
        : 0;
      
      const availableCredit = Math.max(0, card.credit_limit - card.current_balance);
      
      // Calculate days until due date
      let daysUntilDue: number | undefined;
      let isOverdue = false;
      if (card.due_date) {
        const dueDate = new Date(card.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isOverdue = daysUntilDue < 0;
      }

      return {
        ...card,
        utilizationPercentage,
        availableCredit,
        daysUntilDue,
        isOverdue,
      };
    });

    // Cache the result (5 min TTL)
    cache.set(cacheKey, enrichedCards, 5 * 60 * 1000);

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${enrichedCards.length} credit cards from local DB in ${duration}ms`);

    return enrichedCards;
  } catch (error) {
    console.error('❌ Error fetching credit cards from local DB:', error);
    throw error;
  }
}

/**
 * Fetch credit card summary statistics
 */
export async function fetchCreditCardSummary(
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardSummary> {
  const startTime = Date.now();
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    // Check cache first
    const cache = getQueryCache();
    const cacheKey = generateCacheKey('credit_cards_summary', { user_id: userId });
    const cached = cache.get<CreditCardSummary>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    // Fetch aggregated data
    const [totalLimit, totalBalance, avgUtilization, allCards, highUtilCards, upcomingDue] = await Promise.all([
      repo.getTotalCreditLimit(),
      repo.getTotalCurrentBalance(),
      repo.getAverageUtilization(),
      repo.findAll({ user_id: userId, limit: 1000 }),
      repo.findHighUtilization(70),
      repo.findUpcomingDueDates(7),
    ]);

    const summary: CreditCardSummary = {
      totalCreditLimit: totalLimit,
      totalCurrentBalance: totalBalance,
      totalAvailableCredit: Math.max(0, totalLimit - totalBalance),
      averageUtilization: Math.round(avgUtilization * 10) / 10,
      totalCards: allCards.length,
      highUtilizationCards: highUtilCards.length,
      upcomingDueDates: upcomingDue.length,
    };

    // Cache the result (2 min TTL)
    cache.set(cacheKey, summary, 2 * 60 * 1000);

    const duration = Date.now() - startTime;
    console.log(`✅ Calculated credit card summary in ${duration}ms`);

    return summary;
  } catch (error) {
    console.error('❌ Error calculating credit card summary:', error);
    throw error;
  }
}

/**
 * Fetch a single credit card by ID
 */
export async function fetchCreditCardById(
  id: string,
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardWithUtilization | null> {
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    const card = await repo.findById(id);
    
    if (!card) {
      return null;
    }

    // Calculate utilization
    const utilizationPercentage = card.credit_limit > 0
      ? Math.round((card.current_balance / card.credit_limit) * 100)
      : 0;
    
    const availableCredit = Math.max(0, card.credit_limit - card.current_balance);
    
    // Calculate days until due date
    let daysUntilDue: number | undefined;
    let isOverdue = false;
    if (card.due_date) {
      const dueDate = new Date(card.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - today.getTime();
      daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isOverdue = daysUntilDue < 0;
    }

    return {
      ...card,
      utilizationPercentage,
      availableCredit,
      daysUntilDue,
      isOverdue,
    };
  } catch (error) {
    console.error('❌ Error fetching credit card by ID:', error);
    throw error;
  }
}

/**
 * Add a new credit card (local-first)
 */
export async function addCreditCardLocal(
  cardData: Omit<CreditCardInsert, 'user_id'>,
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardWithUtilization> {
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    const newCard = await repo.create({
      ...cardData,
      user_id: userId,
    });

    // Invalidate cache
    getQueryCache().clearTable('credit_cards_local');

    // Calculate utilization for return
    const utilizationPercentage = newCard.credit_limit > 0
      ? Math.round((newCard.current_balance / newCard.credit_limit) * 100)
      : 0;
    
    const availableCredit = Math.max(0, newCard.credit_limit - newCard.current_balance);

    return {
      ...newCard,
      utilizationPercentage,
      availableCredit,
    };
  } catch (error) {
    console.error('❌ Error adding credit card:', error);
    throw error;
  }
}

/**
 * Update an existing credit card (local-first)
 */
export async function updateCreditCardLocal(
  id: string,
  cardData: Partial<CreditCardUpdate>,
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardWithUtilization> {
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    const updatedCard = await repo.update(id, {
      ...cardData,
      id,
    });

    // Invalidate cache
    getQueryCache().clearTable('credit_cards_local');

    // Calculate utilization for return
    const utilizationPercentage = updatedCard.credit_limit > 0
      ? Math.round((updatedCard.current_balance / updatedCard.credit_limit) * 100)
      : 0;
    
    const availableCredit = Math.max(0, updatedCard.credit_limit - updatedCard.current_balance);

    return {
      ...updatedCard,
      utilizationPercentage,
      availableCredit,
    };
  } catch (error) {
    console.error('❌ Error updating credit card:', error);
    throw error;
  }
}

/**
 * Delete a credit card (soft delete)
 */
export async function deleteCreditCardLocal(
  id: string,
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<void> {
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    await repo.delete(id);

    // Invalidate cache
    getQueryCache().clearTable('credit_cards_local');
  } catch (error) {
    console.error('❌ Error deleting credit card:', error);
    throw error;
  }
}

/**
 * Get credit cards by institution
 */
export async function fetchCreditCardsByInstitution(
  institution: string,
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardWithUtilization[]> {
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    const cards = await repo.findAll({
      user_id: userId,
      institution,
      orderBy: 'name',
      orderDirection: 'ASC',
    });

    // Calculate utilization
    return cards.map(card => {
      const utilizationPercentage = card.credit_limit > 0
        ? Math.round((card.current_balance / card.credit_limit) * 100)
        : 0;
      
      const availableCredit = Math.max(0, card.credit_limit - card.current_balance);

      return {
        ...card,
        utilizationPercentage,
        availableCredit,
      };
    });
  } catch (error) {
    console.error('❌ Error fetching credit cards by institution:', error);
    throw error;
  }
}

/**
 * Get credit cards with high utilization
 */
export async function fetchHighUtilizationCards(
  threshold: number = 70,
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardWithUtilization[]> {
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    const cards = await repo.findHighUtilization(threshold);

    // Calculate utilization
    return cards.map(card => {
      const utilizationPercentage = card.credit_limit > 0
        ? Math.round((card.current_balance / card.credit_limit) * 100)
        : 0;
      
      const availableCredit = Math.max(0, card.credit_limit - card.current_balance);

      return {
        ...card,
        utilizationPercentage,
        availableCredit,
      };
    });
  } catch (error) {
    console.error('❌ Error fetching high utilization cards:', error);
    throw error;
  }
}

/**
 * Get credit cards with upcoming due dates
 */
export async function fetchUpcomingDueDateCards(
  days: number = 7,
  userId: string,
  isPremium: boolean = false,
  isOnline: boolean = false
): Promise<CreditCardWithUtilization[]> {
  const repo = new CreditCardsRepository(userId, isPremium, isOnline);
  
  try {
    const cards = await repo.findUpcomingDueDates(days);

    // Calculate utilization and days until due
    return cards.map(card => {
      const utilizationPercentage = card.credit_limit > 0
        ? Math.round((card.current_balance / card.credit_limit) * 100)
        : 0;
      
      const availableCredit = Math.max(0, card.credit_limit - card.current_balance);
      
      let daysUntilDue: number | undefined;
      let isOverdue = false;
      if (card.due_date) {
        const dueDate = new Date(card.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isOverdue = daysUntilDue < 0;
      }

      return {
        ...card,
        utilizationPercentage,
        availableCredit,
        daysUntilDue,
        isOverdue,
      };
    });
  } catch (error) {
    console.error('❌ Error fetching upcoming due date cards:', error);
    throw error;
  }
}


