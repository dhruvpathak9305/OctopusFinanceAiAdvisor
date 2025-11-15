/**
 * =============================================================================
 * BANK AGGREGATION SERVICE - Setu Account Aggregator
 * =============================================================================
 * 
 * This service integrates with Setu (Account Aggregator) to fetch bank
 * transactions, credit card data, and account balances directly from banks.
 * 
 * This is how Google Pay, PhonePe, CRED, and other fintech apps work!
 * 
 * Features:
 * - Direct bank account connection (100+ Indian banks)
 * - Real-time transaction sync
 * - Credit card transactions
 * - Account balances
 * - User consent management
 * - Multi-account support
 * - Automatic periodic sync
 * 
 * Provider: Setu (by Pine Labs) - RBI-approved Account Aggregator
 * Website: https://setu.co/
 * 
 * @see docs/features/bank-aggregation/SETU_IMPLEMENTATION.md
 * =============================================================================
 */

import { supabase } from '../lib/supabase/client';

// Setu API Configuration
const SETU_BASE_URL = process.env.EXPO_PUBLIC_SETU_BASE_URL || 'https://api.setu.co/api/v2';

// Financial Institution Types supported by Setu
export type FIType = 
  | 'DEPOSIT'           // Bank accounts
  | 'TERM-DEPOSIT'      // Fixed deposits
  | 'RECURRING-DEPOSIT' // Recurring deposits
  | 'SIP'               // Systematic Investment Plans
  | 'MUTUAL-FUNDS'      // Mutual funds
  | 'EQUITIES'          // Stocks
  | 'INSURANCE-POLICIES'// Insurance
  | 'NPS'               // National Pension System
  | 'ETF'               // Exchange Traded Funds
  | 'BONDS'             // Bonds
  | 'DEBENTURES';       // Debentures

export type ConsentStatus = 
  | 'PENDING'   // Waiting for user approval
  | 'ACTIVE'    // Approved and active
  | 'EXPIRED'   // Consent expired
  | 'REVOKED'   // User revoked consent
  | 'REJECTED'  // User rejected consent
  | 'PAUSED';   // Temporarily paused

export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionMode = 'UPI' | 'NEFT' | 'RTGS' | 'IMPS' | 'CARD' | 'CASH' | 'CHEQUE' | 'OTHER';

interface ConsentRequest {
  consentStart: string; // ISO date
  consentExpiry: string; // ISO date
  customerId: string; // User email/ID
  fiTypes: FIType[];
  dataRangeFrom: string; // ISO date
  dataRangeTo: string; // ISO date
  consentMode?: 'VIEW' | 'STORE' | 'QUERY' | 'STREAM';
  fetchType?: 'ONETIME' | 'PERIODIC';
  frequency?: {
    unit: 'HOUR' | 'DAY' | 'MONTH' | 'YEAR';
    value: number;
  };
  dataLife?: {
    unit: 'MONTH' | 'YEAR';
    value: number;
  };
  purposeCode?: string; // e.g., '101' for wealth management
}

interface ConsentResponse {
  id: string; // Consent request ID
  url: string; // URL to redirect user for approval
  status: ConsentStatus;
}

interface BankAccount {
  linkRefNumber: string;
  FIType: FIType;
  accType: string; // SAVINGS, CURRENT, CREDIT_CARD
  maskedAccNumber: string; // XXXXXXXX1234
  institutionName?: string;
}

interface Transaction {
  txnId: string;
  type: TransactionType;
  mode: TransactionMode;
  amount: string;
  currentBalance: string;
  transactionTimestamp: string; // ISO datetime
  valueDate: string; // YYYY-MM-DD
  narration: string;
  reference: string;
}

interface AccountData {
  linkRefNumber: string;
  maskedAccNumber: string;
  type: string;
  Profile?: {
    Holders: {
      name: string;
      email?: string;
      mobile?: string;
    };
  };
  Summary: {
    currentBalance: string;
    currency: string;
    balanceDateTime: string;
  };
  Transactions?: {
    startDate: string;
    endDate: string;
    Transaction: Transaction[];
  };
}

interface BankConnection {
  id: string;
  user_id: string;
  provider: string;
  status: string;
  consent_id: string;
  consent_handle: string;
  account_link_ref: string;
  masked_account_number: string;
  account_type: string;
  fi_type: FIType;
  institution_name?: string;
  last_synced_at?: string;
  consent_expiry?: string;
}

/**
 * Bank Aggregation Service - Setu Integration
 */
export class BankAggregationService {
  /**
   * Create a consent request to connect user's bank account
   * This initiates the bank linking flow
   */
  static async createConsentRequest(
    userId: string,
    options: Partial<ConsentRequest> = {}
  ): Promise<ConsentResponse> {
    try {
      const user = await this.getUser(userId);
      
      const now = new Date();
      const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      
      const consentRequest = {
        Detail: {
          consentStart: options.consentStart || now.toISOString(),
          consentExpiry: options.consentExpiry || oneYearLater.toISOString(),
          Customer: {
            id: user.email || options.customerId || userId,
          },
          FIDataRange: {
            from: options.dataRangeFrom || oneYearAgo.toISOString(),
            to: options.dataRangeTo || now.toISOString(),
          },
          consentMode: options.consentMode || 'STORE',
          consentTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY'],
          fetchType: options.fetchType || 'PERIODIC',
          Frequency: options.frequency || {
            unit: 'HOUR',
            value: 1, // Sync every hour
          },
          DataFilter: [
            {
              type: 'TRANSACTIONAMOUNT',
              operator: '>=',
              value: '0', // All transactions
            },
          ],
          DataLife: options.dataLife || {
            unit: 'MONTH',
            value: 12, // Store data for 12 months
          },
          DataConsumer: {
            id: 'octopusfinance-app',
          },
          Purpose: {
            code: options.purposeCode || '101',
            text: 'Personal Finance Management and Budget Tracking',
          },
          fiTypes: options.fiTypes || ['DEPOSIT'], // Bank accounts by default
        },
      };

      // Call Supabase Edge Function to create consent
      // (keeps Setu API keys secure on server-side)
      const { data, error } = await supabase.functions.invoke('setu-create-consent', {
        body: { consentRequest, userId },
      });

      if (error) throw error;

      // Store consent request in database
      await supabase.from('bank_connections').insert({
        user_id: userId,
        provider: 'setu',
        status: 'pending',
        consent_id: data.id,
        consent_expiry: consentRequest.Detail.consentExpiry,
        metadata: {
          consent_url: data.url,
          fi_types: consentRequest.Detail.fiTypes,
        },
      });

      return {
        id: data.id,
        url: data.url,
        status: 'PENDING',
      };
    } catch (error) {
      console.error('Failed to create consent request:', error);
      throw error;
    }
  }

  /**
   * Check consent status
   */
  static async checkConsentStatus(consentId: string): Promise<{
    status: ConsentStatus;
    accounts: BankAccount[];
    consentHandle?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('setu-check-consent', {
        body: { consentId },
      });

      if (error) throw error;

      // Update database with consent status
      if (data.status === 'ACTIVE') {
        // Store linked accounts
        for (const account of data.Accounts || []) {
          await supabase.from('bank_connections').upsert({
            consent_id: consentId,
            consent_handle: data.consentHandle,
            status: 'active',
            account_link_ref: account.linkRefNumber,
            masked_account_number: account.maskedAccNumber,
            account_type: account.accType,
            fi_type: account.FIType,
            institution_name: account.institutionName,
          });
        }
      }

      return {
        status: data.status,
        accounts: data.Accounts || [],
        consentHandle: data.consentHandle,
      };
    } catch (error) {
      console.error('Failed to check consent status:', error);
      throw error;
    }
  }

  /**
   * Fetch account data (transactions, balance, profile)
   */
  static async fetchAccountData(
    consentId: string,
    options: {
      from?: string; // ISO date
      to?: string; // ISO date
      format?: 'json' | 'xml';
    } = {}
  ): Promise<AccountData[]> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Create data session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'setu-create-session',
        {
          body: {
            consentId,
            dataRange: {
              from: options.from || thirtyDaysAgo.toISOString(),
              to: options.to || now.toISOString(),
            },
            format: options.format || 'json',
          },
        }
      );

      if (sessionError) throw sessionError;

      const sessionId = sessionData.id;

      // Poll session until complete (max 30 seconds)
      let attempts = 0;
      const maxAttempts = 30;
      let sessionStatus = 'PENDING';

      while (sessionStatus === 'PENDING' && attempts < maxAttempts) {
        await this.sleep(1000); // Wait 1 second

        const { data: statusData, error: statusError } = await supabase.functions.invoke(
          'setu-get-session',
          {
            body: { sessionId },
          }
        );

        if (statusError) throw statusError;

        sessionStatus = statusData.status;
        attempts++;

        if (sessionStatus === 'COMPLETED') {
          return statusData.Accounts || [];
        } else if (sessionStatus === 'FAILED') {
          throw new Error('Data fetch session failed');
        }
      }

      if (sessionStatus === 'PENDING') {
        throw new Error('Data fetch timeout - taking too long');
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch account data:', error);
      throw error;
    }
  }

  /**
   * Sync transactions from bank account
   */
  static async syncBankAccount(
    connectionId: string,
    userId: string
  ): Promise<{
    imported: number;
    skipped: number;
    errors: number;
  }> {
    try {
      const startTime = Date.now();

      // Get connection details
      const { data: connection, error: connError } = await supabase
        .from('bank_connections')
        .select('*')
        .eq('id', connectionId)
        .eq('user_id', userId)
        .single();

      if (connError || !connection) {
        throw new Error('Bank connection not found');
      }

      if (connection.status !== 'active') {
        throw new Error('Bank connection not active');
      }

      // Determine date range for sync
      const now = new Date();
      const lastSyncDate = connection.last_synced_at 
        ? new Date(connection.last_synced_at)
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      // Fetch account data
      const accounts = await this.fetchAccountData(connection.consent_id, {
        from: lastSyncDate.toISOString(),
        to: now.toISOString(),
      });

      let imported = 0;
      let skipped = 0;
      let errors = 0;

      for (const account of accounts) {
        if (account.linkRefNumber !== connection.account_link_ref) {
          continue; // Skip if not this connection's account
        }

        // Import transactions
        if (account.Transactions?.Transaction) {
          for (const txn of account.Transactions.Transaction) {
            try {
              // Check if transaction already exists
              const { data: existing } = await supabase
                .from('transactions_real')
                .select('id')
                .eq('user_id', userId)
                .eq('metadata->>setu_txn_id', txn.txnId)
                .single();

              if (existing) {
                skipped++;
                continue;
              }

              // Import transaction
              const { error: insertError } = await supabase
                .from('transactions_real')
                .insert({
                  user_id: userId,
                  name: this.parseTransactionName(txn.narration),
                  amount: parseFloat(txn.amount),
                  type: txn.type === 'CREDIT' ? 'income' : 'expense',
                  date: txn.valueDate,
                  source_account_name: connection.institution_name || 'Bank Account',
                  source_account_type: connection.account_type.toLowerCase(),
                  merchant: this.extractMerchant(txn.narration),
                  description: txn.narration,
                  metadata: {
                    source: 'setu',
                    connection_id: connectionId,
                    setu_txn_id: txn.txnId,
                    transaction_mode: txn.mode,
                    reference: txn.reference,
                    balance_after: parseFloat(txn.currentBalance),
                    masked_account: connection.masked_account_number,
                  },
                });

              if (insertError) {
                console.error('Failed to insert transaction:', insertError);
                errors++;
              } else {
                imported++;
              }
            } catch (txnError) {
              console.error('Error processing transaction:', txnError);
              errors++;
            }
          }
        }

        // Update account balance
        if (account.Summary) {
          // TODO: Update balance in accounts table or balance_real table
        }
      }

      // Update connection sync status
      await supabase
        .from('bank_connections')
        .update({
          last_synced_at: now.toISOString(),
          last_transaction_date: now.toISOString().split('T')[0],
        })
        .eq('id', connectionId);

      // Log sync result
      const processingTime = Date.now() - startTime;
      await supabase.from('bank_sync_logs').insert({
        connection_id: connectionId,
        user_id: userId,
        sync_type: 'manual',
        status: errors > 0 ? 'partial' : 'success',
        transactions_fetched: accounts[0]?.Transactions?.Transaction?.length || 0,
        transactions_imported: imported,
        transactions_skipped: skipped,
        processing_time_ms: processingTime,
      });

      console.log(`✅ Bank sync complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);

      return { imported, skipped, errors };
    } catch (error) {
      console.error('Failed to sync bank account:', error);
      
      // Log failed sync
      await supabase.from('bank_sync_logs').insert({
        connection_id: connectionId,
        user_id: userId,
        sync_type: 'manual',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Get user's bank connections
   */
  static async getUserConnections(userId: string): Promise<BankConnection[]> {
    const { data, error } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get user connections:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Revoke consent and disconnect bank account
   */
  static async disconnectBankAccount(connectionId: string, userId: string): Promise<void> {
    try {
      const { data: connection } = await supabase
        .from('bank_connections')
        .select('consent_id')
        .eq('id', connectionId)
        .eq('user_id', userId)
        .single();

      if (!connection) {
        throw new Error('Connection not found');
      }

      // Call Setu to revoke consent
      await supabase.functions.invoke('setu-revoke-consent', {
        body: { consentId: connection.consent_id },
      });

      // Update database
      await supabase
        .from('bank_connections')
        .update({ status: 'revoked' })
        .eq('id', connectionId);

      console.log('✅ Bank account disconnected');
    } catch (error) {
      console.error('Failed to disconnect bank account:', error);
      throw error;
    }
  }

  /**
   * Helper: Parse transaction name from narration
   */
  private static parseTransactionName(narration: string): string {
    // Extract merchant name from narration
    // Example: "UPI/AMAZON/9876543210" -> "Amazon Payment"
    if (narration.includes('UPI/')) {
      const parts = narration.split('/');
      if (parts.length > 1) {
        const merchant = parts[1].trim();
        return `${this.titleCase(merchant)} Payment`;
      }
    }
    
    // Example: "NEFT-SALARY-CREDIT" -> "Salary Credit"
    if (narration.includes('SALARY')) {
      return 'Salary Credit';
    }

    // Default: clean up narration
    return narration
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .trim()
      .substring(0, 100);
  }

  /**
   * Helper: Extract merchant from narration
   */
  private static extractMerchant(narration: string): string | undefined {
    if (narration.includes('UPI/')) {
      const parts = narration.split('/');
      if (parts.length > 1) {
        return this.titleCase(parts[1].trim());
      }
    }
    return undefined;
  }

  /**
   * Helper: Title case
   */
  private static titleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper: Sleep
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper: Get user
   */
  private static async getUser(userId: string) {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }
}

/**
 * React Hook for Bank Aggregation
 */
export function useBankAggregation(userId: string) {
  const [connections, setConnections] = React.useState<BankConnection[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const data = await BankAggregationService.getUserConnections(userId);
      setConnections(data);
    } finally {
      setIsLoading(false);
    }
  };

  const connectBank = async (options?: Partial<ConsentRequest>) => {
    setIsLoading(true);
    try {
      return await BankAggregationService.createConsentRequest(userId, options);
    } finally {
      setIsLoading(false);
    }
  };

  const syncConnection = async (connectionId: string) => {
    setIsSyncing(true);
    try {
      return await BankAggregationService.syncBankAccount(connectionId, userId);
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectBank = async (connectionId: string) => {
    setIsLoading(true);
    try {
      await BankAggregationService.disconnectBankAccount(connectionId, userId);
      await loadConnections();
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (userId) {
      loadConnections();
    }
  }, [userId]);

  return {
    connections,
    isLoading,
    isSyncing,
    connectBank,
    syncConnection,
    disconnectBank,
    refresh: loadConnections,
  };
}

import React from 'react';
export default BankAggregationService;

