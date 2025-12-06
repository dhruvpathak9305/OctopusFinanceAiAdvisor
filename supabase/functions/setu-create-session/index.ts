/**
 * =============================================================================
 * SUPABASE EDGE FUNCTION: Setu - Create Data Session
 * =============================================================================
 * 
 * Creates a data fetch session to retrieve account data from banks.
 * 
 * Deploy: supabase functions deploy setu-create-session
 * =============================================================================
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SETU_CLIENT_ID = Deno.env.get('SETU_CLIENT_ID') || '';
const SETU_CLIENT_SECRET = Deno.env.get('SETU_CLIENT_SECRET') || '';
const SETU_BASE_URL = Deno.env.get('SETU_BASE_URL') || 'https://fiu-uat.setu.co/api';

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

async function createSession(token: string, sessionRequest: any) {
  const response = await fetch(`${SETU_BASE_URL}/v2/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-client-id': SETU_CLIENT_ID,
      'x-client-secret': SETU_CLIENT_SECRET,
    },
    body: JSON.stringify(sessionRequest),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to create session:', error);
    throw new Error(`Session creation failed: ${response.status}`);
  }

  return await response.json();
}

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
    const { consentId, dataRange, format } = await req.json();

    if (!consentId || !dataRange) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const token = await getSetuToken();
    
    const sessionRequest = {
      consentId,
      DataRange: dataRange,
      format: format || 'json',
    };

    const session = await createSession(token, sessionRequest);

    return new Response(
      JSON.stringify({
        success: true,
        id: session.id,
        status: session.status,
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

