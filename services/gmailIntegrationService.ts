/**
 * =============================================================================
 * GMAIL INTEGRATION SERVICE
 * =============================================================================
 * 
 * This service provides Gmail API integration for real-time bank transaction
 * email notifications. It enables users to automatically import transactions
 * from their bank notification emails.
 * 
 * Features:
 * - OAuth 2.0 authentication with Gmail
 * - Real-time email notifications via Gmail Push (Pub/Sub)
 * - Email filtering for bank transactions
 * - AI-powered email parsing to extract transaction details
 * - Automatic transaction creation in the database
 * 
 * Setup Requirements:
 * 1. Enable Gmail API in Google Cloud Console
 * 2. Create OAuth 2.0 credentials (Web application)
 * 3. Set up Google Cloud Pub/Sub topic
 * 4. Deploy Supabase Edge Function for webhook handling
 * 5. Configure environment variables
 * 
 * @see docs/features/gmail-integration/SETUP.md
 * =============================================================================
 */

import { supabase } from '../lib/supabase/client';
import * as SecureStore from 'expo-secure-store';

// Gmail API Configuration
const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

// Secure storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gmail_access_token',
  REFRESH_TOKEN: 'gmail_refresh_token',
  EXPIRY_TIME: 'gmail_token_expiry',
  WATCH_HISTORY_ID: 'gmail_watch_history_id',
};

/**
 * Gmail OAuth Configuration
 * Add these to your environment variables
 */
interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  expiryTime: number; // Unix timestamp
}

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload?: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
    }>;
  };
}

interface ParsedEmailTransaction {
  subject: string;
  from: string;
  body: string;
  date: string;
  messageId: string;
  transaction: {
    name: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    bank?: string;
    accountNumber?: string;
    balance?: number;
  } | null;
}

/**
 * Gmail Integration Service
 */
export class GmailIntegrationService {
  private static config: GmailConfig | null = null;

  /**
   * Initialize Gmail configuration
   * Call this on app startup with your OAuth credentials
   */
  static initialize(config: GmailConfig) {
    this.config = config;
  }

  /**
   * Get the Gmail OAuth authorization URL
   * Redirect user to this URL to grant permissions
   */
  static getAuthUrl(): string {
    if (!this.config) {
      throw new Error('Gmail configuration not initialized');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: GMAIL_SCOPES.join(' '),
      access_type: 'offline', // Request refresh token
      prompt: 'consent', // Force consent screen to get refresh token
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  static async exchangeAuthCode(code: string): Promise<GmailTokens> {
    if (!this.config) {
      throw new Error('Gmail configuration not initialized');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to exchange auth code: ${error.error_description}`);
    }

    const data = await response.json();
    const tokens: GmailTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiryTime: Date.now() + data.expires_in * 1000,
    };

    // Store tokens securely
    await this.storeTokens(tokens);
    return tokens;
  }

  /**
   * Store tokens securely
   */
  private static async storeTokens(tokens: GmailTokens): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.EXPIRY_TIME, tokens.expiryTime.toString());
  }

  /**
   * Get stored tokens
   */
  private static async getStoredTokens(): Promise<GmailTokens | null> {
    const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    const expiryTime = await SecureStore.getItemAsync(STORAGE_KEYS.EXPIRY_TIME);

    if (!accessToken || !refreshToken || !expiryTime) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiryTime: parseInt(expiryTime),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  private static async refreshAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('Gmail configuration not initialized');
    }

    const tokens = await this.getStoredTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: tokens.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${error.error_description}`);
    }

    const data = await response.json();
    const newTokens: GmailTokens = {
      accessToken: data.access_token,
      refreshToken: tokens.refreshToken, // Refresh token doesn't change
      expiryTime: Date.now() + data.expires_in * 1000,
    };

    await this.storeTokens(newTokens);
    return newTokens.accessToken;
  }

  /**
   * Get valid access token (refreshes if expired)
   */
  private static async getAccessToken(): Promise<string> {
    const tokens = await this.getStoredTokens();
    if (!tokens) {
      throw new Error('User not authenticated with Gmail');
    }

    // Check if token is expired or about to expire (5 min buffer)
    if (Date.now() >= tokens.expiryTime - 300000) {
      return await this.refreshAccessToken();
    }

    return tokens.accessToken;
  }

  /**
   * Check if user is authenticated with Gmail
   */
  static async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getStoredTokens();
    return tokens !== null;
  }

  /**
   * Disconnect Gmail integration
   */
  static async disconnect(): Promise<void> {
    // Stop watching for new emails
    try {
      await this.stopWatch();
    } catch (error) {
      console.warn('Failed to stop Gmail watch:', error);
    }

    // Clear stored tokens
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.EXPIRY_TIME);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.WATCH_HISTORY_ID);

    console.log('✅ Gmail integration disconnected');
  }

  /**
   * Set up Gmail Push notifications (watch for new emails)
   * This requires a Google Cloud Pub/Sub topic configured
   */
  static async setupPushNotifications(topicName: string): Promise<void> {
    const accessToken = await this.getAccessToken();
    const userId = 'me'; // 'me' refers to authenticated user

    // Label IDs to watch (INBOX for all new emails)
    const labelIds = ['INBOX'];

    const response = await fetch(`${GMAIL_API_BASE}/users/${userId}/watch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicName,
        labelIds,
        labelFilterAction: 'include', // Only watch specified labels
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to setup Gmail watch: ${error.error?.message}`);
    }

    const data = await response.json();
    console.log('✅ Gmail watch setup successful:', data);

    // Store history ID for incremental sync
    if (data.historyId) {
      await SecureStore.setItemAsync(STORAGE_KEYS.WATCH_HISTORY_ID, data.historyId);
    }
  }

  /**
   * Stop watching Gmail for new emails
   */
  static async stopWatch(): Promise<void> {
    const accessToken = await this.getAccessToken();
    const userId = 'me';

    const response = await fetch(`${GMAIL_API_BASE}/users/${userId}/stop`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to stop Gmail watch: ${error.error?.message}`);
    }

    console.log('✅ Gmail watch stopped');
  }

  /**
   * Fetch recent bank transaction emails
   * Filters emails from known banks and payment services
   */
  static async fetchBankEmails(maxResults: number = 10): Promise<ParsedEmailTransaction[]> {
    const accessToken = await this.getAccessToken();
    const userId = 'me';

    // Build Gmail query for bank transaction emails
    // Customize this query based on your banks
    const query = [
      'from:(*@hdfcbank.com OR *@icicibank.com OR *@sbi.co.in OR *@axisbank.com',
      'OR *@kotak.com OR *@paytm.com OR *@amazonpay.in OR *@phonepe.com)',
      'subject:(transaction OR credited OR debited OR payment OR statement)',
      'newer_than:7d', // Last 7 days
    ].join(' ');

    // Search for emails
    const searchResponse = await fetch(
      `${GMAIL_API_BASE}/users/${userId}/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to search Gmail messages');
    }

    const searchData = await searchResponse.json();
    const messages = searchData.messages || [];

    if (messages.length === 0) {
      console.log('No bank transaction emails found');
      return [];
    }

    // Fetch full details for each message
    const parsedEmails: ParsedEmailTransaction[] = [];
    for (const message of messages) {
      try {
        const email = await this.fetchEmailDetails(message.id);
        parsedEmails.push(email);
      } catch (error) {
        console.error(`Failed to parse email ${message.id}:`, error);
      }
    }

    return parsedEmails;
  }

  /**
   * Fetch and parse email details
   */
  private static async fetchEmailDetails(messageId: string): Promise<ParsedEmailTransaction> {
    const accessToken = await this.getAccessToken();
    const userId = 'me';

    const response = await fetch(
      `${GMAIL_API_BASE}/users/${userId}/messages/${messageId}?format=full`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch email ${messageId}`);
    }

    const data: GmailMessage = await response.json();

    // Extract email headers
    const headers = data.payload?.headers || [];
    const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '';
    const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || '';
    const dateStr = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';

    // Extract email body
    let body = '';
    if (data.payload?.body?.data) {
      body = this.decodeBase64Url(data.payload.body.data);
    } else if (data.payload?.parts) {
      // Multi-part email
      for (const part of data.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = this.decodeBase64Url(part.body.data);
          break;
        }
      }
    }

    // Parse transaction from email content
    const transaction = await this.parseTransactionFromEmail(subject, body, from);

    return {
      subject,
      from,
      body: body.substring(0, 500), // Truncate for storage
      date: new Date(dateStr).toISOString(),
      messageId: data.id,
      transaction,
    };
  }

  /**
   * Decode Gmail base64url encoded content
   */
  private static decodeBase64Url(data: string): string {
    // Convert base64url to base64
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      // Decode base64 to string
      return atob(base64);
    } catch (error) {
      console.error('Failed to decode base64 email content:', error);
      return '';
    }
  }

  /**
   * Parse transaction details from email content using AI
   */
  private static async parseTransactionFromEmail(
    subject: string,
    body: string,
    from: string
  ): Promise<ParsedEmailTransaction['transaction']> {
    // Call Supabase Edge Function to parse using AI
    try {
      const { data, error } = await supabase.functions.invoke('parse-email-transaction', {
        body: {
          subject,
          body,
          from,
        },
      });

      if (error) {
        console.error('Failed to parse email transaction:', error);
        return null;
      }

      return data?.transaction || null;
    } catch (error) {
      console.error('Error calling parse-email-transaction function:', error);
      return null;
    }
  }

  /**
   * Import transaction from parsed email
   * Automatically creates transaction in the database
   */
  static async importEmailTransaction(
    email: ParsedEmailTransaction,
    userId: string
  ): Promise<string | null> {
    if (!email.transaction) {
      console.warn('No transaction data in email');
      return null;
    }

    try {
      // Insert transaction into database
      const { data, error } = await supabase
        .from('transactions_real')
        .insert({
          user_id: userId,
          name: email.transaction.name,
          amount: email.transaction.amount,
          type: email.transaction.type,
          // category_id should be resolved from category name, but for now we'll skip it
          // The app can let users categorize later if needed
          date: email.transaction.date,
          source_account_name: email.transaction.bank,
          source_account_type: 'bank', // Default type
          description: `Imported from email: ${email.subject}`,
          merchant: email.transaction.name,
          metadata: {
            source: 'gmail',
            email_id: email.messageId,
            email_from: email.from,
            email_subject: email.subject,
            parsed_category: email.transaction.category,
            account_number_last4: email.transaction.accountNumber,
            balance_after: email.transaction.balance,
          },
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Transaction imported from email:', data.id);
      return data.id;
    } catch (error) {
      console.error('Failed to import email transaction:', error);
      throw error;
    }
  }

  /**
   * Sync recent bank emails and import transactions
   * This can be called manually or triggered by push notifications
   */
  static async syncBankEmails(userId: string): Promise<number> {
    console.log('📧 Syncing bank emails...');

    const emails = await this.fetchBankEmails(20);
    console.log(`Found ${emails.length} bank transaction emails`);

    let importedCount = 0;
    for (const email of emails) {
      if (email.transaction) {
        try {
          // Check if transaction already exists (avoid duplicates)
          const { data: existing } = await supabase
            .from('transactions_real')
            .select('id')
            .eq('user_id', userId)
            .eq('metadata->>email_id', email.messageId)
            .single();

          if (!existing) {
            await this.importEmailTransaction(email, userId);
            importedCount++;
          } else {
            console.log(`Transaction already imported from email ${email.messageId}`);
          }
        } catch (error) {
          console.error(`Failed to import email transaction:`, error);
        }
      }
    }

    console.log(`✅ Imported ${importedCount} new transactions from emails`);
    return importedCount;
  }
}

/**
 * Hook for React components to use Gmail integration
 */
export function useGmailIntegration() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const checkConnection = async () => {
    const connected = await GmailIntegrationService.isAuthenticated();
    setIsConnected(connected);
  };

  const connectGmail = async () => {
    try {
      setIsLoading(true);
      const authUrl = GmailIntegrationService.getAuthUrl();
      // Open auth URL in browser/webview
      // Handle OAuth redirect and call exchangeAuthCode
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGmail = async () => {
    try {
      setIsLoading(true);
      await GmailIntegrationService.disconnect();
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const syncEmails = async (userId: string) => {
    try {
      setIsLoading(true);
      return await GmailIntegrationService.syncBankEmails(userId);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkConnection();
  }, []);

  return {
    isConnected,
    isLoading,
    connectGmail,
    disconnectGmail,
    syncEmails,
  };
}

// Re-export for convenience
import React from 'react';
export default GmailIntegrationService;

