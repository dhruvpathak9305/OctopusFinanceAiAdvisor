/**
 * =============================================================================
 * SUPABASE EDGE FUNCTION: Setu - Consent Callback
 * =============================================================================
 * 
 * This function receives the redirect after user approves/rejects consent.
 * It displays a simple success/error page and updates the database.
 * 
 * Deploy: supabase functions deploy setu-consent-callback
 * =============================================================================
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS for preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Parse query parameters
    const url = new URL(req.url);
    const consentId = url.searchParams.get('consentId');
    const status = url.searchParams.get('status');
    const ecreq = url.searchParams.get('ecreq');
    const resdate = url.searchParams.get('resdate');

    console.log('Consent callback received:', {
      consentId,
      status,
      ecreq,
      resdate,
    });

    // Update database if we have consent ID
    if (consentId) {
      try {
        await supabase
          .from('bank_connections')
          .update({
            status: status === 'ACTIVE' ? 'active' : 'rejected',
            updated_at: new Date().toISOString(),
            metadata: {
              callback_received_at: new Date().toISOString(),
              callback_status: status,
              ecreq,
              resdate,
            },
          })
          .eq('consent_id', consentId);

        console.log('Database updated for consent:', consentId);
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }
    }

    // Return success page
    const html = generateResponsePage(status, consentId);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Callback error:', error);

    const errorHtml = generateErrorPage();

    return new Response(errorHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

/**
 * Generate success/rejection response page
 */
function generateResponsePage(status: string | null, consentId: string | null): string {
  const isSuccess = status === 'ACTIVE';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? 'Bank Connected!' : 'Connection Failed'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideUp 0.5s ease-out;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      animation: scaleIn 0.5s ease-out 0.2s both;
    }
    
    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }
    
    .icon.success {
      background: linear-gradient(135deg, #00D09C 0%, #00B88A 100%);
    }
    
    .icon.error {
      background: linear-gradient(135deg, #FF4757 0%, #FF3838 100%);
    }
    
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
    }
    
    p {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #00D09C 0%, #00B88A 100%);
      color: white;
      padding: 16px 48px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(0, 208, 156, 0.3);
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 208, 156, 0.4);
    }
    
    .button:active {
      transform: translateY(0);
    }
    
    .details {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #e5e5e5;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    .detail-label {
      color: #999;
    }
    
    .detail-value {
      color: #333;
      font-weight: 500;
    }
    
    .footer {
      margin-top: 24px;
      font-size: 12px;
      color: #999;
    }
    
    .logo {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #00D09C 0%, #00B88A 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Octopus Organizer</div>
    
    ${isSuccess ? `
      <div class="icon success">✓</div>
      <h1>Bank Connected!</h1>
      <p>Your bank account has been successfully linked to Octopus Organizer. You can now start tracking your transactions automatically.</p>
    ` : `
      <div class="icon error">✕</div>
      <h1>Connection Failed</h1>
      <p>The bank connection was not approved. Please try again or contact support if you continue to face issues.</p>
    `}
    
    <a href="#" class="button" onclick="closeWindow()">
      ${isSuccess ? 'Return to App' : 'Try Again'}
    </a>
    
    ${consentId ? `
      <div class="details">
        <div class="detail-item">
          <span class="detail-label">Consent ID:</span>
          <span class="detail-value">${consentId.substring(0, 12)}...</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status:</span>
          <span class="detail-value">${status || 'Unknown'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${new Date().toLocaleString()}</span>
        </div>
      </div>
    ` : ''}
    
    <div class="footer">
      🔒 Secured by Setu Account Aggregator (RBI Approved)
    </div>
  </div>
  
  <script>
    function closeWindow() {
      // Try to close the window
      window.close();
      
      // If window doesn't close (browser restriction), show message
      setTimeout(() => {
        alert('You can now close this window and return to Octopus Organizer app.');
      }, 500);
    }
    
    // Auto-close after 5 seconds on success
    ${isSuccess ? `
      setTimeout(() => {
        closeWindow();
      }, 5000);
    ` : ''}
  </script>
</body>
</html>`;
}

/**
 * Generate error page
 */
function generateErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 480px;
      text-align: center;
    }
    
    h1 {
      color: #FF4757;
      margin-bottom: 16px;
    }
    
    p {
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ Error</h1>
    <p>Something went wrong. Please contact support.</p>
  </div>
</body>
</html>`;
}

