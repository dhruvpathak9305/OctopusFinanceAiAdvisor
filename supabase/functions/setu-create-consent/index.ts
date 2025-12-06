/**
 * =============================================================================
 * SUPABASE EDGE FUNCTION: Setu - Create Consent
 * =============================================================================
 * 
 * Creates a consent request with Setu to link user's bank account.
 * This initiates the bank account linking flow.
 * 
 * Deploy: supabase functions deploy setu-create-consent
 * 
 * Environment Variables Required:
 * - SETU_CLIENT_ID
 * - SETU_CLIENT_SECRET
 * - SETU_BASE_URL
 * =============================================================================
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SETU_CLIENT_ID = Deno.env.get('SETU_CLIENT_ID') || '';
const SETU_CLIENT_SECRET = Deno.env.get('SETU_CLIENT_SECRET') || '';
const SETU_BASE_URL = Deno.env.get('SETU_BASE_URL') || 'https://fiu-uat.setu.co/api';

interface ConsentRequest {
  consentRequest: {
    Detail: {
      consentStart: string;
      consentExpiry: string;
      Customer: { id: string };
      FIDataRange: { from: string; to: string };
      consentMode: string;
      consentTypes: string[];
      fetchType: string;
      Frequency?: { unit: string; value: number };
      DataFilter?: Array<{ type: string; operator: string; value: string }>;
      DataLife?: { unit: string; value: number };
      DataConsumer: { id: string };
      Purpose: { code: string; text: string };
      fiTypes: string[];
    };
  };
  userId: string;
}

/**
 * Get Setu access token
 */
async function getSetuToken(): Promise<string> {
  const credentials = btoa(`${SETU_CLIENT_ID}:${SETU_CLIENT_SECRET}`);
  
  const response = await fetch(`${SETU_BASE_URL}/v1/auth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get Setu token:', error);
    throw new Error(`Setu authentication failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create consent request with Setu
 */
async function createConsent(
  token: string,
  consentRequest: any
): Promise<{ id: string; url: string; status: string }> {
  const response = await fetch(`${SETU_BASE_URL}/v2/consents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-client-id': SETU_CLIENT_ID,
      'x-client-secret': SETU_CLIENT_SECRET,
    },
    body: JSON.stringify(consentRequest),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to create consent:', error);
    throw new Error(`Consent creation failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    url: data.url,
    status: data.status,
  };
}

/**
 * Main handler
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const requestData: ConsentRequest = await req.json();

    // Validate request
    if (!requestData.consentRequest || !requestData.userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log('Creating Setu consent for user:', requestData.userId);

    // Get Setu access token
    const token = await getSetuToken();
    console.log('✅ Setu token obtained');

    // Create consent request
    const consent = await createConsent(token, requestData.consentRequest);
    console.log('✅ Consent created:', consent.id);

    return new Response(
      JSON.stringify({
        success: true,
        id: consent.id,
        url: consent.url,
        status: consent.status,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

