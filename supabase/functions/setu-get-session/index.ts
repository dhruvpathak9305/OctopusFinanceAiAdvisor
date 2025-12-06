/**
 * =============================================================================
 * SUPABASE EDGE FUNCTION: Setu - Get Session Data
 * =============================================================================
 * 
 * Retrieves account data from a completed session.
 * This includes transactions, balances, and account profiles.
 * 
 * Deploy: supabase functions deploy setu-get-session
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

async function getSession(token: string, sessionId: string) {
  const response = await fetch(`${SETU_BASE_URL}/v2/sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-client-id': SETU_CLIENT_ID,
      'x-client-secret': SETU_CLIENT_SECRET,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get session:', error);
    throw new Error(`Session retrieval failed: ${response.status}`);
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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing sessionId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const token = await getSetuToken();
    const sessionData = await getSession(token, sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        status: sessionData.status,
        Accounts: sessionData.Accounts || [],
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

