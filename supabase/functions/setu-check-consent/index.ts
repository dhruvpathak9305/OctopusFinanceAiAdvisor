/**
 * =============================================================================
 * SUPABASE EDGE FUNCTION: Setu - Check Consent Status
 * =============================================================================
 * 
 * Checks the status of a consent request and retrieves linked accounts.
 * 
 * Deploy: supabase functions deploy setu-check-consent
 * =============================================================================
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SETU_CLIENT_ID = Deno.env.get('SETU_CLIENT_ID') || '';
const SETU_CLIENT_SECRET = Deno.env.get('SETU_CLIENT_SECRET') || '';
const SETU_BASE_URL = Deno.env.get('SETU_BASE_URL') || 'https://fiu-uat.setu.co/api';

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
    throw new Error(`Setu authentication failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Check consent status
 */
async function checkConsent(token: string, consentId: string) {
  const response = await fetch(`${SETU_BASE_URL}/v2/consents/${consentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-client-id': SETU_CLIENT_ID,
      'x-client-secret': SETU_CLIENT_SECRET,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to check consent:', error);
    throw new Error(`Consent check failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Main handler
 */
serve(async (req) => {
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
    const { consentId } = await req.json();

    if (!consentId) {
      return new Response(
        JSON.stringify({ error: 'Missing consentId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const token = await getSetuToken();
    const consentData = await checkConsent(token, consentId);

    return new Response(
      JSON.stringify({
        success: true,
        status: consentData.status,
        consentHandle: consentData.consentHandle,
        Accounts: consentData.Accounts || [],
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

