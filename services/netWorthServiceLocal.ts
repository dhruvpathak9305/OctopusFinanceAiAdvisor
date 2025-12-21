/**
 * =============================================================================
 * NET WORTH SERVICE - LOCAL-FIRST IMPLEMENTATION
 * =============================================================================
 * 
 * Local-first version of net worth service using repositories.
 * Provides faster loading and offline support.
 */

import { 
  NetWorthCategoriesRepository, 
  NetWorthSubcategoriesRepository, 
  NetWorthEntriesRepository 
} from './repositories/netWorthRepository';
import { AccountsRepository } from './repositories/accountsRepository';
import { getQueryCache, generateCacheKey } from './repositories/queryCache';
import { getLocalDb } from './localDb';
import { fetchFixedDepositsForNetWorth } from './fixedDepositsService'; // Still use Supabase for FDs until we add FD table

/**
 * Get categories with their subcategories from local DB
 */
export async function fetchCategoriesWithSubcategoriesLocal(
  type?: 'asset' | 'liability',
  userId?: string
): Promise<any[]> {
  // Categories are global (no user_id), so we use a dummy user_id
  const categoriesRepo = new NetWorthCategoriesRepository('global', false, false);
  
  // Build filter
  const filter: any = {};
  if (type) {
    filter.type = type;
  }
  filter.orderBy = 'sort_order';
  filter.orderDirection = 'ASC';
  
  // Get all categories (no limit for categories - they're typically < 50)
  const categories = await categoriesRepo.findAll({ ...filter, limit: 1000 });
  
  // Get subcategories for each category
  const subcategoriesRepo = new NetWorthSubcategoriesRepository('global', false, false);
  const categoriesWithSubs = await Promise.all(
    categories
      .filter(cat => cat.is_active !== false)
      .map(async (category) => {
        const subcategories = await subcategoriesRepo.findAll({ 
          category_id: category.id,
          limit: 1000,
          orderBy: 'sort_order',
          orderDirection: 'ASC',
        });
        return {
          ...category,
          subcategories: subcategories
            .filter(sub => sub.is_active !== false)
            .sort((a, b) => {
              if (a.sort_order && b.sort_order) {
                return a.sort_order - b.sort_order;
              }
              return a.name.localeCompare(b.name);
            }),
        };
      })
  );
  
  // Sort categories
  return categoriesWithSubs.sort((a, b) => {
    if (a.sort_order && b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get entries by category from local DB
 */
export async function fetchEntriesByCategoryLocal(
  categoryId: string,
  userId: string
): Promise<any[]> {
  const entriesRepo = new NetWorthEntriesRepository(userId, false, false);
  
  const entries = await entriesRepo.findAll({
    user_id: userId,
    category_id: categoryId,
    isActive: true,
    limit: 1000, // No limit for entries per category
    orderBy: 'updated_at',
    orderDirection: 'DESC',
  });
  
  // Transform to match the expected format
  return entries.map(entry => ({
    id: entry.id,
    user_id: entry.user_id,
    category_id: entry.category_id,
    subcategory_id: entry.subcategory_id,
    asset_name: entry.asset_name,
    value: entry.value,
    quantity: entry.quantity,
    market_price: entry.market_price,
    date: entry.date,
    notes: entry.notes,
    is_active: entry.is_active,
    is_included_in_net_worth: entry.is_included_in_net_worth,
    linked_source_type: entry.linked_source_type,
    linked_source_id: entry.linked_source_id,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  }));
}

/**
 * Local-first version of fetchFormattedCategoriesForUI
 * Uses local DB with caching for fast loading
 */
export async function fetchFormattedCategoriesForUILocal(
  type: 'asset' | 'liability',
  userId: string,
  isPremium: boolean = false
): Promise<any[]> {
  console.log(`🚀 fetchFormattedCategoriesForUILocal called: type=${type}, userId=${userId}, isPremium=${isPremium}`);
  
  const cache = getQueryCache();
  const cacheKey = generateCacheKey(`net_worth_${type}`, { userId, type });
  
  // Check cache first
  const cached = cache.get<any[]>(cacheKey);
  if (cached !== null) {
    console.log(`✅ Net Worth: Using cached data for ${type}`);
    return cached;
  }
  
  console.log(`📊 Net Worth: Fetching ${type} from local DB...`);
  const startTime = Date.now();
  
  try {
    // 1. Get categories with subcategories from local DB
    const categoriesWithSubs = await fetchCategoriesWithSubcategoriesLocal(type, userId);
    
    // 2. Get entries for each category
    const entriesPromises = categoriesWithSubs.map(async (category) => {
      const entries = await fetchEntriesByCategoryLocal(category.id, userId);
      return { category, entries };
    });
    
    const categoriesWithEntries = await Promise.all(entriesPromises);
    
    // 3. Handle Fixed Deposits (cached from Supabase - they don't change often)
    try {
      // Check if FDs are already in net worth entries (synced)
      const entriesRepo = new NetWorthEntriesRepository(userId, false, false);
      const fdEntries = await entriesRepo.findAll({
        user_id: userId,
        isActive: true,
        limit: 1000,
      });
      
      const existingFDEntries = fdEntries.filter(
        entry => entry.linked_source_type === 'fixed_deposit'
      );
      
      let fdData: any[] = [];
      
      if (existingFDEntries.length > 0) {
        // Use existing FD entries from local DB (already synced)
        console.log(`💰 Found ${existingFDEntries.length} Fixed Deposits in local DB`);
        
        // Group by institution for display
        const fdByInstitution = new Map<string, any[]>();
        existingFDEntries.forEach(entry => {
          const institution = entry.notes?.split(' | ')[0] || 'Unknown';
          if (!fdByInstitution.has(institution)) {
            fdByInstitution.set(institution, []);
          }
          fdByInstitution.get(institution)!.push({
            id: entry.linked_source_id || entry.id,
            name: entry.asset_name,
            value: entry.value,
            principal: entry.market_price || entry.value,
            interest_rate: entry.notes?.match(/(\d+\.?\d*)%/)?.[1] || '0',
            maturity_date: entry.notes?.match(/Matures: (.+)/)?.[1] || '',
            institution,
          });
        });
        
        // Convert to expected format
        fdData = Array.from(fdByInstitution.entries()).map(([institution, fds]) => ({
          id: `fd-${institution.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${institution} Fixed Deposits`,
          institution,
          value: fds.reduce((sum, fd) => sum + fd.value, 0),
          fd_count: fds.length,
          subcategories: fds,
        }));
      } else {
        // Fallback: Fetch from Supabase and cache
        console.log('💰 Checking for Fixed Deposits from Supabase...');
        const cacheKey = generateCacheKey('fixed_deposits_networth', { userId });
        const cachedFDs = cache.get<any[]>(cacheKey);
        
        if (cachedFDs !== null) {
          console.log('✅ Using cached Fixed Deposits');
          fdData = cachedFDs;
        } else {
          fdData = await fetchFixedDepositsForNetWorth(false);
          // Cache for 10 minutes (FDs don't change often)
          cache.set(cacheKey, fdData, 10 * 60 * 1000);
          console.log('💰 FD data fetched from Supabase and cached');
        }
      }
      
      if (fdData.length > 0) {
        const fixedIncomeCategory = categoriesWithEntries.find((cat) =>
          cat.category.name.toLowerCase().includes('debt') ||
          cat.category.name.toLowerCase().includes('fixed income') ||
          cat.category.name.toLowerCase().includes('fixed')
        );
        
        if (fixedIncomeCategory) {
          console.log('💰 Found Fixed Income category:', fixedIncomeCategory.category.name);
          
          const fdSubcategory = fixedIncomeCategory.category.subcategories?.find(
            (sub: any) => sub.name.toLowerCase().includes('fixed deposit')
          );
          
          if (fdSubcategory) {
            console.log('💰 Found Fixed Deposits subcategory, adding FD data');
            
            const totalFDValue = fdData.reduce((sum, bank) => sum + bank.value, 0);
            
            fixedIncomeCategory.entries = [
              ...fixedIncomeCategory.entries,
              ...fdData.flatMap((bank) =>
                bank.subcategories.map((fd) => ({
                  id: fd.id,
                  user_id: userId,
                  asset_name: fd.name,
                  category_id: fixedIncomeCategory.category.id,
                  subcategory_id: fdSubcategory.id,
                  value: fd.value,
                  quantity: 1,
                  market_price: fd.principal,
                  notes: `${fd.institution} | ${fd.interest_rate}% | Matures: ${fd.maturity_date}`,
                  date: new Date().toISOString().split('T')[0],
                  is_active: true,
                  is_included_in_net_worth: true,
                  linked_source_type: 'fixed_deposit' as any,
                  linked_source_id: fd.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  category_name: fixedIncomeCategory.category.name,
                  category_type: type,
                  category_icon: fixedIncomeCategory.category.icon,
                  category_color: fixedIncomeCategory.category.color,
                  subcategory_name: fdSubcategory.name,
                }))
              ),
            ];
            
            console.log('💰 FD entries added to category:', fixedIncomeCategory.entries.length);
          }
        }
      }
    } catch (error) {
      console.error('💰 Error integrating Fixed Deposits:', error);
    }
    
    // 4. Get accounts and credit cards from local DB (optimized)
    let systemCards = [];
    if (type === 'asset') {
      try {
        console.log('🔍 Fetching accounts from local DB...');
        const accountsCard = await fetchAccountsForNetWorthLocal(userId);
        console.log('🔍 Accounts card result:', accountsCard);
        if (accountsCard) {
          console.log('✅ Adding accounts card to system cards (items:', accountsCard.items, ')');
          systemCards.push(accountsCard);
        }
      } catch (error) {
        console.error('❌ Error fetching accounts for net worth:', error);
      }
    } else if (type === 'liability') {
      try {
        console.log('🔍 Fetching credit cards from local DB...');
        const creditCardsCard = await fetchCreditCardsForNetWorthLocal(userId);
        console.log('🔍 Credit cards result:', creditCardsCard);
        if (creditCardsCard) {
          console.log('✅ Adding credit cards to system cards (items:', creditCardsCard.items, ')');
          systemCards.push(creditCardsCard);
        }
      } catch (error) {
        console.error('❌ Error fetching credit cards for net worth:', error);
      }
    }
    
    // 5. Calculate totals
    const regularCategoriesValue = categoriesWithEntries.reduce(
      (sum, { entries }) => {
        return sum + entries.reduce((entrySum, entry) => entrySum + (entry.value || 0), 0);
      },
      0
    );
    
    const systemCardsValue = systemCards.reduce((sum, card) => sum + (card.value || 0), 0);
    const totalPortfolioValue = regularCategoriesValue + systemCardsValue;
    
    console.log(`📊 Net Worth Calculation for ${type}:`, {
      regularCategoriesValue,
      systemCardsValue,
      totalPortfolioValue,
      systemCardsCount: systemCards.length,
      categoriesCount: categoriesWithEntries.length,
    });
    
    // 6. Format categories for UI
    const formattedCategories = categoriesWithEntries.map(({ category, entries }) => {
      const totalValue = entries.reduce((sum, entry) => sum + (entry.value || 0), 0);
      const itemCount = entries.length;
      
      const percentage =
        totalPortfolioValue > 0
          ? (totalValue / totalPortfolioValue) * 100
          : 0;
      
      return {
        id: category.id,
        name: category.name,
        value: totalValue,
        percentage: Math.round(percentage * 10) / 10,
        items: category.subcategories?.length || 0,
        icon: category.icon || (type === 'asset' ? 'trending-up' : 'card'),
        color: category.color || (type === 'asset' ? '#10B981' : '#EF4444'),
        assets:
          category.subcategories?.map((sub: any) => {
            const subEntries = entries.filter(
              (entry) => entry.subcategory_id === sub.id
            );
            const subValue = subEntries.reduce(
              (sum, entry) => sum + (entry.value || 0),
              0
            );
            const subPercentage =
              totalValue > 0 ? (subValue / totalValue) * 100 : 0;
            
            return {
              id: sub.id,
              name: sub.name,
              category: category.name,
              value: subValue,
              percentage: Math.round(subPercentage),
              icon: sub.icon || category.icon || 'cash',
              color: sub.color || category.color || '#10B981',
            };
          }) || [],
      };
    });
    
    // 7. Format system cards
    const formattedSystemCards = systemCards.map((card) => ({
      ...card,
      percentage:
        totalPortfolioValue > 0
          ? Math.round((card.value / totalPortfolioValue) * 100 * 10) / 10
          : 0,
      assets:
        card.subcategories?.map((sub: any) => ({
          ...sub,
          percentage:
            card.value > 0
              ? Math.round((sub.value / card.value) * 100)
              : 0,
        })) || [],
    }));
    
    // 8. Combine and return
    const result = [...formattedSystemCards, ...formattedCategories];
    
    const duration = Date.now() - startTime;
    console.log(`✅ Net Worth: Fetched ${result.length} ${type} categories in ${duration}ms`);
    
    // Cache the result (5 minute TTL)
    cache.set(cacheKey, result, 5 * 60 * 1000);
    
    return result;
  } catch (error) {
    console.error(`❌ Error fetching ${type} from local DB:`, error);
    console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    // Don't throw - return empty array instead to prevent fallback to slow Supabase
    console.warn(`⚠️ Returning empty array for ${type} due to error`);
    return [];
  }
}

/**
 * Fetch accounts with balances from local DB (optimized)
 */
export async function fetchAccountsForNetWorthLocal(userId: string): Promise<any> {
  const startTime = Date.now();
  const db = await getLocalDb();
  const accountsRepo = new AccountsRepository(userId, false, false);
  
  try {
    // Get all active accounts
    const accountsStart = Date.now();
    const accounts = await accountsRepo.findAll({ 
      user_id: userId,
      isActive: true,
      limit: 1000,
    });
    const accountsDuration = Date.now() - accountsStart;
    console.log(`📊 Fetched ${accounts.length} accounts in ${accountsDuration}ms`);
    
    // Get balances for all accounts in one query (optimized batch query)
    const balanceStart = Date.now();
    const accountIds = accounts.map(acc => acc.id);
    let balancesMap = new Map<string, number>();
    
    if (accountIds.length > 0) {
      const placeholders = accountIds.map(() => '?').join(',');
      const balances = await db.getAllAsync<{ account_id: string; current_balance: number }>(
        `SELECT account_id, current_balance FROM balance_local 
         WHERE account_id IN (${placeholders})`,
        accountIds
      );
      
      balances.forEach(b => {
        balancesMap.set(b.account_id, b.current_balance);
      });
      const balanceDuration = Date.now() - balanceStart;
      console.log(`📊 Fetched ${balances.length} balances in ${balanceDuration}ms`);
    }
    
    // Map accounts with balances
    const accountsWithBalances = accounts.map((account) => ({
      ...account,
      current_balance: balancesMap.get(account.id) ?? account.current_balance ?? 0,
    }));
    
    // Calculate total value
    const totalValue = accountsWithBalances.reduce(
      (sum, account) => sum + (account.current_balance ?? 0),
      0
    );
    
    // Format as Net Worth category
    const result = {
      id: 'bank-accounts',
      name: 'Bank Accounts',
      type: 'asset',
      value: totalValue,
      percentage: 0,
      items: accountsWithBalances.length,
      icon: 'business',
      color: '#10B981',
      subcategories: accountsWithBalances.map((account) => ({
        id: account.id,
        name: account.name,
        value: account.current_balance ?? 0,
        percentage:
          totalValue > 0
            ? Math.round(((account.current_balance ?? 0) / totalValue) * 100 * 10) / 10
            : 0,
        institution: account.institution,
        account_type: account.type,
        account_number: account.account_number,
        icon: 'business-outline',
        color: '#10B981',
        isSystemCard: true,
      })),
      isSystemCard: true,
      last_calculated_at: new Date().toISOString(),
    };
    
    const totalDuration = Date.now() - startTime;
    console.log(`✅ Accounts Net Worth: ${accountsWithBalances.length} accounts, ₹${totalValue.toLocaleString('en-IN')} total in ${totalDuration}ms`);
    
    return result;
  } catch (error) {
    console.error('❌ Error fetching accounts from local DB:', error);
    // Return empty fallback
    return {
      id: 'bank-accounts',
      name: 'Bank Accounts',
      type: 'asset',
      value: 0,
      percentage: 0,
      items: 0,
      icon: 'business',
      color: '#10B981',
      subcategories: [],
      isSystemCard: true,
      last_calculated_at: new Date().toISOString(),
    };
  }
}

/**
 * Fetch credit cards from local DB (optimized)
 */
export async function fetchCreditCardsForNetWorthLocal(userId: string): Promise<any> {
  const startTime = Date.now();
  const db = await getLocalDb();
  
  try {
    // Get all credit cards from local DB
    const creditCards = await db.getAllAsync<any>(
      `SELECT * FROM credit_cards_local 
       WHERE user_id = ? AND deleted_offline = 0 
       ORDER BY name ASC`,
      [userId]
    );
    
    console.log(`📊 Fetched ${creditCards.length} credit cards in ${Date.now() - startTime}ms`);
    
    // Calculate total debt (positive value representing liability)
    const totalValue = creditCards.reduce(
      (sum, card) => sum + Math.abs(card.current_balance || 0),
      0
    );
    
    // Format as Net Worth category
    const result = {
      id: 'credit-cards',
      name: 'Credit Cards',
      type: 'liability',
      value: totalValue,
      percentage: 0,
      items: creditCards.length,
      icon: 'card',
      color: '#EF4444',
      subcategories: creditCards.map((card) => ({
        id: card.id,
        name: card.name,
        value: Math.abs(card.current_balance || 0),
        percentage:
          totalValue > 0
            ? Math.round((Math.abs(card.current_balance || 0) / totalValue) * 100 * 10) / 10
            : 0,
        institution: card.institution || 'Unknown',
        credit_limit: card.credit_limit,
        available_credit: (card.credit_limit || 0) - Math.abs(card.current_balance || 0),
        card_number: card.last_four_digits ? `****${card.last_four_digits}` : '****',
        icon: 'card',
        color: '#EF4444',
        isSystemCard: true,
      })),
      isSystemCard: true,
      last_calculated_at: new Date().toISOString(),
    };
    
    const totalDuration = Date.now() - startTime;
    console.log(`✅ Credit Cards Net Worth: ${creditCards.length} cards, ₹${totalValue.toLocaleString('en-IN')} total debt in ${totalDuration}ms`);
    
    return result;
  } catch (error) {
    console.error('❌ Error fetching credit cards from local DB:', error);
    // Return empty fallback
    return {
      id: 'credit-cards',
      name: 'Credit Cards',
      type: 'liability',
      value: 0,
      percentage: 0,
      items: 0,
      icon: 'card',
      color: '#EF4444',
      subcategories: [],
      isSystemCard: true,
      last_calculated_at: new Date().toISOString(),
    };
  }
}

