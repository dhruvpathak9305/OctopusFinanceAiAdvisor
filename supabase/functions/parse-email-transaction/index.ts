/**
 * =============================================================================
 * SUPABASE EDGE FUNCTION: Parse Email Transaction
 * =============================================================================
 * 
 * This Edge Function parses bank transaction details from email content using AI.
 * It's called by the Gmail Integration Service to extract structured transaction
 * data from bank notification emails.
 * 
 * Deploy this function to Supabase:
 * ```bash
 * supabase functions deploy parse-email-transaction
 * ```
 * 
 * Set environment variables:
 * ```bash
 * supabase secrets set OPENAI_API_KEY=your_key
 * supabase secrets set OPENAI_BASE_URL=https://openrouter.ai/api/v1
 * ```
 * =============================================================================
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const OPENAI_BASE_URL = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1';

interface ParseEmailRequest {
  subject: string;
  body: string;
  from: string;
}

interface ParsedTransaction {
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO format
  bank?: string;
  accountNumber?: string;
  balance?: number;
}

/**
 * Parse transaction details from email using AI
 */
async function parseEmailTransaction(request: ParseEmailRequest): Promise<ParsedTransaction | null> {
  const systemPrompt = `You are a financial transaction parser. Extract transaction details from bank notification emails.

Return a JSON object with the following fields:
- name: Transaction description/merchant name
- amount: Transaction amount (number)
- type: "income" or "expense"
- category: Category name (e.g., "Groceries", "Salary", "Shopping", "Transfer")
- date: Transaction date in ISO format (YYYY-MM-DD)
- bank: Bank name (if identifiable)
- accountNumber: Last 4 digits of account number (if available)
- balance: Account balance after transaction (if available)

If the email doesn't contain a valid transaction, return null.

Examples of bank email formats:
- "Your account XXXXXX1234 has been debited with Rs.500.00 on 24-Oct-25 at SWIGGY. Avl Bal: Rs.10,000.00"
- "Rs.15,000 credited to your account XX1234 on 24-10-2025. Salary payment from ABC Corp."
- "You have spent Rs.2,500.00 at AMAZON on your Credit Card XX5678 on 24/10/2025"`;

  const userPrompt = `Parse this bank transaction email:

Subject: ${request.subject}
From: ${request.from}

Body:
${request.body}

Return JSON with transaction details or null if not a valid transaction email.`;

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using faster, cheaper model for email parsing
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for consistent parsing
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.warn('No content in OpenAI response');
      return null;
    }

    const parsed = JSON.parse(content);

    // Validate parsed transaction
    if (!parsed || parsed === null) {
      return null;
    }

    if (
      typeof parsed.name !== 'string' ||
      typeof parsed.amount !== 'number' ||
      !['income', 'expense'].includes(parsed.type) ||
      typeof parsed.category !== 'string' ||
      !parsed.date
    ) {
      console.warn('Invalid transaction format from AI:', parsed);
      return null;
    }

    return parsed as ParsedTransaction;
  } catch (error) {
    console.error('Failed to parse email transaction:', error);
    return null;
  }
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
    const requestData: ParseEmailRequest = await req.json();

    // Validate request
    if (!requestData.subject || !requestData.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: subject, body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Parse transaction
    const transaction = await parseEmailTransaction(requestData);

    return new Response(
      JSON.stringify({
        transaction,
        metadata: {
          subject: requestData.subject,
          from: requestData.from,
          parsedAt: new Date().toISOString(),
        },
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
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
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

