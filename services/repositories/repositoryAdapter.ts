/**
 * =============================================================================
 * REPOSITORY ADAPTER - BRIDGE BETWEEN SERVICES AND REPOSITORIES
 * =============================================================================
 * 
 * Provides adapter functions to use repositories while maintaining
 * backward compatibility with existing service APIs.
 */

import offlineAuth from '../auth/offlineAuth';
import subscriptionService from '../subscription/subscriptionService';
import { TransactionsRepository, TransactionFilters as RepoTransactionFilters } from './transactionsRepository';
import { AccountsRepository, AccountFilters as RepoAccountFilters } from './accountsRepository';
import { BudgetCategoriesRepository, BudgetFilters as RepoBudgetFilters } from './budgetRepository';
import { NetWorthEntriesRepository, NetWorthFilters as RepoNetWorthFilters } from './netWorthRepository';
import { Transaction } from '../../types/transactions';
import { Account } from '../repositories/accountsRepository';

/**
 * Get repository instances with current user context
 */
export async function getRepositoryContext() {
  const identity = await offlineAuth.getUserIdentity();
  const status = await subscriptionService.checkSubscriptionStatus();
  const networkMonitor = (await import('../sync/networkMonitor')).default;
  const isOnline = networkMonitor.isCurrentlyOnline();

  return {
    userId: identity.userId,
    isPremium: identity.isPremium,
    isOnline,
  };
}

/**
 * Transactions repository adapter
 */
export async function getTransactionsRepository(): Promise<TransactionsRepository> {
  const context = await getRepositoryContext();
  const repo = new TransactionsRepository(context.userId, context.isPremium, context.isOnline);
  return repo;
}

/**
 * Accounts repository adapter
 */
export async function getAccountsRepository(): Promise<AccountsRepository> {
  const context = await getRepositoryContext();
  const repo = new AccountsRepository(context.userId, context.isPremium, context.isOnline);
  return repo;
}

/**
 * Budget categories repository adapter
 */
export async function getBudgetCategoriesRepository(): Promise<BudgetCategoriesRepository> {
  const context = await getRepositoryContext();
  const repo = new BudgetCategoriesRepository(context.userId, context.isPremium, context.isOnline);
  return repo;
}

/**
 * Net worth entries repository adapter
 */
export async function getNetWorthEntriesRepository(): Promise<NetWorthEntriesRepository> {
  const context = await getRepositoryContext();
  const repo = new NetWorthEntriesRepository(context.userId, context.isPremium, context.isOnline);
  return repo;
}

/**
 * Convert service TransactionFilters to repository TransactionFilters
 */
export function convertTransactionFilters(
  filters: any,
  userId: string
): RepoTransactionFilters {
  return {
    user_id: userId,
    type: filters.type,
    dateRange: filters.dateRange,
    amountRange: filters.amountRange,
    institution: filters.institution,
    category: filters.category,
    subcategory: filters.subcategory,
    accountId: filters.accountId,
    destinationAccountId: filters.destinationAccountId,
    isCreditCard: filters.isCreditCard,
    searchQuery: filters.searchQuery,
    limit: filters.limit,
    offset: filters.offset,
    orderBy: 'date',
    orderDirection: 'DESC',
  };
}

/**
 * Convert service AccountFilters to repository AccountFilters
 */
export function convertAccountFilters(filters: any, userId: string): RepoAccountFilters {
  return {
    user_id: userId,
    type: filters.type,
    institution: filters.institution,
    isActive: filters.isActive,
    searchQuery: filters.searchQuery,
  };
}

