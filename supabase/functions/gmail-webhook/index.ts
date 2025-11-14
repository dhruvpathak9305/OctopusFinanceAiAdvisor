/**
 * =============================================================================
 * SUPABASE EDGE FUNCTION: Gmail Webhook Handler
 * =============================================================================
 * 
 * This Edge Function receives Gmail Push notifications via Google Cloud Pub/Sub.
 * When a new email arrives in the user's inbox, this function is triggered,
 * fetches the email, parses it for transaction data, and imports it to the database.
 * 
 * Setup:
 * 1. Deploy this function: `supabase functions deploy gmail-webhook`
 * 2. Get the function URL from Supabase dashboard
 * 3. Create a Google Cloud Pub/Sub push subscription pointing to this URL
 * 4. Configure Gmail API to publish to the Pub/Sub topic
 * 
 * Environment Variables:
 * - GMAIL_CLIENT_ID: OAuth 2.0 client ID
 * - GMAIL_CLIENT_SECRET: OAuth 2.0 client secret
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access
 * =============================================================================
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';

interface PubSubMessage {
  message: {
    data: string; // Base64 encoded
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface GmailNotification {
  emailAddress: string;
  historyId: string;
}

/**
 * Fetch user's Gmail tokens from database
 */
async function getUserGmailTokens(userId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('user_integrations')
    .select('gmail_access_token, gmail_refresh_token, gmail_token_expiry')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('User Gmail tokens not found');
  }

  return {
    accessToken: data.gmail_access_token,
    refreshToken: data.gmail_refresh_token,
    expiryTime: new Date(data.gmail_token_expiry).getTime(),
  };
}

/**
 * Refresh Gmail access token
 */
async function refreshGmailToken(userId: string, refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GMAIL_CLIENT_ID');
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Gmail token');
  }

  const data = await response.json();
  const newAccessToken = data.access_token;
  const newExpiry = new Date(Date.now() + data.expires_in * 1000).toISOString();

  // Update token in database
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  await supabase
    .from('user_integrations')
    .update({
      gmail_access_token: newAccessToken,
      gmail_token_expiry: newExpiry,
    })
    .eq('user_id', userId);

  return newAccessToken;
}

/**
 * Get valid Gmail access token (refresh if needed)
 */
async function getValidAccessToken(userId: string): Promise<string> {
  const tokens = await getUserGmailTokens(userId);

  // Check if token is expired or about to expire (5 min buffer)
  if (Date.now() >= tokens.expiryTime - 300000) {
    return await refreshGmailToken(userId, tokens.refreshToken);
  }

  return tokens.accessToken;
}

/**
 * Fetch new messages from Gmail history
 */
async function fetchNewMessages(accessToken: string, historyId: string) {
  const userId = 'me';

  const response = await fetch(
    `${GMAIL_API_BASE}/users/${userId}/history?startHistoryId=${historyId}&historyTypes=messageAdded`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      // History ID too old, need full sync
      console.log('History ID expired, performing full sync');
      return [];
    }
    throw new Error('Failed to fetch Gmail history');
  }

  const data = await response.json();
  return data.history || [];
}

/**
 * Process Gmail notification
 */
async function processGmailNotification(notification: GmailNotification) {
  console.log('Processing Gmail notification:', notification);

  // Find user by email address
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: user, error: userError } = await supabase
    .from('user_integrations')
    .select('user_id, gmail_history_id')
    .eq('gmail_email', notification.emailAddress)
    .eq('gmail_enabled', true)
    .single();

  if (userError || !user) {
    console.log('User not found or Gmail integration not enabled');
    return;
  }

  try {
    // Get valid access token
    const accessToken = await getValidAccessToken(user.user_id);

    // Fetch new messages since last history ID
    const history = await fetchNewMessages(accessToken, user.gmail_history_id);

    if (history.length === 0) {
      console.log('No new messages in history');
      return;
    }

    // Extract message IDs from history
    const messageIds: string[] = [];
    for (const item of history) {
      if (item.messagesAdded) {
        for (const added of item.messagesAdded) {
          messageIds.push(added.message.id);
        }
      }
    }

    console.log(`Found ${messageIds.length} new messages`);

    // Process each message
    for (const messageId of messageIds) {
      try {
        // Fetch message details
        const messageResponse = await fetch(
          `${GMAIL_API_BASE}/users/me/messages/${messageId}?format=full`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!messageResponse.ok) {
          console.error(`Failed to fetch message ${messageId}`);
          continue;
        }

        const message = await messageResponse.json();

        // Extract headers
        const headers = message.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';

        // Check if it's from a known bank
        const bankDomains = [
          'hdfcbank.com',
          'icicibank.com',
          'sbi.co.in',
          'axisbank.com',
          'kotak.com',
          'paytm.com',
          'amazonpay.in',
          'phonepe.com',
        ];

        const isFromBank = bankDomains.some((domain) => from.toLowerCase().includes(domain));

        if (!isFromBank) {
          console.log(`Skipping non-bank email from: ${from}`);
          continue;
        }

        // Extract email body
        let body = '';
        if (message.payload?.body?.data) {
          body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (message.payload?.parts) {
          for (const part of message.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              break;
            }
          }
        }

        // Call parse-email-transaction function
        const parseResponse = await fetch(`${SUPABASE_URL}/functions/v1/parse-email-transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ subject, body, from }),
        });

        if (!parseResponse.ok) {
          console.error('Failed to parse email transaction');
          continue;
        }

        const parseData = await parseResponse.json();
        const transaction = parseData.transaction;

        if (!transaction) {
          console.log('No transaction found in email');
          continue;
        }

        // Check for duplicate
        const { data: existing } = await supabase
          .from('transactions_real')
          .select('id')
          .eq('user_id', user.user_id)
          .eq('metadata->>email_id', messageId)
          .single();

        if (existing) {
          console.log(`Transaction already imported from email ${messageId}`);
          continue;
        }

        // Insert transaction
        const { data: inserted, error: insertError } = await supabase
          .from('transactions_real')
          .insert({
            user_id: user.user_id,
            name: transaction.name,
            amount: transaction.amount,
            type: transaction.type,
            category_name: transaction.category,
            transaction_date: transaction.date,
            source_account_name: transaction.bank,
            account_number: transaction.accountNumber,
            notes: `Auto-imported from email: ${subject}`,
            metadata: {
              source: 'gmail_webhook',
              email_id: messageId,
              email_from: from,
              email_subject: subject,
              imported_at: new Date().toISOString(),
            },
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Failed to insert transaction:', insertError);
          continue;
        }

        console.log(`✅ Transaction imported from email ${messageId}:`, inserted.id);

        // TODO: Send real-time notification to user's device
        // This could be done via Supabase Realtime or push notifications

      } catch (messageError) {
        console.error(`Error processing message ${messageId}:`, messageError);
      }
    }

    // Update history ID
    await supabase
      .from('user_integrations')
      .update({ gmail_history_id: notification.historyId })
      .eq('user_id', user.user_id);

    console.log('✅ Gmail notification processed successfully');
  } catch (error) {
    console.error('Error processing Gmail notification:', error);
    throw error;
  }
}

/**
 * Main handler
 */
serve(async (req) => {
  try {
    // Parse Pub/Sub message
    const pubsubMessage: PubSubMessage = await req.json();

    // Decode base64 data
    const decodedData = atob(pubsubMessage.message.data);
    const notification: GmailNotification = JSON.parse(decodedData);

    // Process notification asynchronously
    processGmailNotification(notification).catch((error) => {
      console.error('Failed to process Gmail notification:', error);
    });

    // Respond immediately to Pub/Sub (acknowledgment)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});




