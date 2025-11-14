# 📧 Gmail Integration Setup Guide

This guide walks you through setting up real-time bank transaction email notifications in OctopusFinance using Gmail API integration.

## 🎯 Overview

The Gmail integration allows users to:
- ✅ Automatically import bank transactions from email notifications
- ✅ Receive real-time notifications when bank emails arrive
- ✅ Parse transaction details using AI (amount, category, merchant, etc.)
- ✅ Avoid manual data entry for email-based transactions
- ✅ Support multiple banks and payment services

## 🏗️ Architecture

```
Gmail → Pub/Sub Topic → Supabase Edge Function → Database → Real-time Notification → App
```

1. **Gmail API** watches user's inbox for new emails
2. **Google Cloud Pub/Sub** receives notifications from Gmail
3. **Supabase Edge Function** (webhook) processes the notification
4. **AI Parser** extracts transaction details from email
5. **Database** stores the transaction
6. **Real-time Subscription** notifies the app
7. **User** sees the transaction instantly in the app

## 📋 Prerequisites

- Google Cloud Platform account
- Supabase project with Edge Functions enabled
- OpenAI API key (for AI parsing)
- React Native app with Expo

## 🚀 Setup Steps

### Step 1: Enable Gmail API in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services > Library**
4. Search for "Gmail API" and enable it
5. Go to **APIs & Services > Credentials**
6. Click **Create Credentials > OAuth 2.0 Client ID**
7. Configure OAuth consent screen:
   - User Type: External (for testing) or Internal (for organization)
   - Add scopes: `gmail.readonly`, `gmail.modify`
   - Add test users (if External)
8. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - For development: `http://localhost:19006/auth/callback`
     - For production: `https://yourdomain.com/auth/callback`
     - For mobile: `octopus-finance-advisor://auth/callback` (custom scheme)
9. Save your **Client ID** and **Client Secret**

### Step 2: Set Up Google Cloud Pub/Sub

1. In Google Cloud Console, go to **Pub/Sub > Topics**
2. Click **Create Topic**
3. Name it: `gmail-notifications` (or your preferred name)
4. Note the full topic name: `projects/YOUR_PROJECT_ID/topics/gmail-notifications`
5. Go to **Pub/Sub > Subscriptions**
6. Click **Create Subscription**
7. Configure:
   - Name: `gmail-webhook-subscription`
   - Topic: `gmail-notifications`
   - Delivery type: **Push**
   - Endpoint URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/gmail-webhook`
   - (You'll get this URL after deploying the Edge Function in Step 4)
8. Grant Gmail API access to publish to this topic:
   - Go to **IAM & Admin > IAM**
   - Add member: `gmail-api-push@system.gserviceaccount.com`
   - Role: **Pub/Sub Publisher**

### Step 3: Configure Supabase

#### 3.1 Create Database Table for User Integrations

Run this SQL in Supabase SQL Editor:

```sql
-- Table to store user Gmail integration settings
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_enabled BOOLEAN DEFAULT false,
  gmail_email TEXT,
  gmail_access_token TEXT,
  gmail_refresh_token TEXT,
  gmail_token_expiry TIMESTAMP WITH TIME ZONE,
  gmail_history_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own integrations
CREATE POLICY "Users can view own integrations"
  ON user_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON user_integrations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON user_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX idx_user_integrations_gmail_email ON user_integrations(gmail_email);
```

#### 3.2 Update Transactions Table (if needed)

Ensure your `transactions_real` table has a `metadata` column to store email information:

```sql
-- Add metadata column if it doesn't exist
ALTER TABLE transactions_real 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index for email_id lookups (for duplicate detection)
CREATE INDEX IF NOT EXISTS idx_transactions_email_id 
ON transactions_real((metadata->>'email_id'));
```

### Step 4: Deploy Supabase Edge Functions

#### 4.1 Install Supabase CLI

```bash
npm install -g supabase
```

#### 4.2 Login to Supabase

```bash
supabase login
```

#### 4.3 Link to Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

#### 4.4 Set Environment Variables

```bash
# Set OpenAI API key for AI parsing
supabase secrets set OPENAI_API_KEY=your_openai_api_key

# Set OpenAI base URL (use OpenRouter or direct OpenAI)
supabase secrets set OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Set Gmail OAuth credentials
supabase secrets set GMAIL_CLIENT_ID=your_gmail_client_id
supabase secrets set GMAIL_CLIENT_SECRET=your_gmail_client_secret
```

#### 4.5 Deploy Edge Functions

```bash
# Deploy parse-email-transaction function
supabase functions deploy parse-email-transaction

# Deploy gmail-webhook function
supabase functions deploy gmail-webhook
```

#### 4.6 Get Function URLs

After deployment, note the URLs:
- Parse function: `https://YOUR_PROJECT.supabase.co/functions/v1/parse-email-transaction`
- Webhook: `https://YOUR_PROJECT.supabase.co/functions/v1/gmail-webhook`

#### 4.7 Update Pub/Sub Subscription

Go back to Google Cloud Pub/Sub and update the subscription endpoint URL with your webhook URL.

### Step 5: Configure React Native App

#### 5.1 Add Environment Variables

Add to your `.env` file:

```env
EXPO_PUBLIC_GMAIL_CLIENT_ID=your_gmail_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GMAIL_CLIENT_SECRET=your_gmail_client_secret
EXPO_PUBLIC_GMAIL_REDIRECT_URI=octopus-finance-advisor://auth/callback
EXPO_PUBLIC_GMAIL_PUBSUB_TOPIC=projects/YOUR_PROJECT_ID/topics/gmail-notifications
```

#### 5.2 Update app.config.js

Add the custom URL scheme:

```javascript
export default {
  // ... other config
  scheme: "octopus-finance-advisor",
  ios: {
    // ... other iOS config
    scheme: "octopus-finance-advisor",
  },
  android: {
    // ... other Android config
    intentFilters: [
      {
        action: "VIEW",
        data: {
          scheme: "octopus-finance-advisor",
        },
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
};
```

#### 5.3 Initialize Gmail Service

In your app's entry point or auth context:

```typescript
import GmailIntegrationService from './services/gmailIntegrationService';

// Initialize with your OAuth config
GmailIntegrationService.initialize({
  clientId: process.env.EXPO_PUBLIC_GMAIL_CLIENT_ID!,
  clientSecret: process.env.EXPO_PUBLIC_GMAIL_CLIENT_SECRET!,
  redirectUri: process.env.EXPO_PUBLIC_GMAIL_REDIRECT_URI!,
});
```

### Step 6: Implement OAuth Flow in Your App

#### 6.1 Create Gmail Settings Screen

Create a new screen for Gmail integration settings:

```typescript
// src/mobile/pages/GmailSettings.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useGmailIntegration } from '../../services/gmailIntegrationService';
import { supabase } from '../../lib/supabase/client';

export function GmailSettings() {
  const { isConnected, isLoading, connectGmail, disconnectGmail, syncEmails } = useGmailIntegration();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleConnect = async () => {
    // Get auth URL
    const authUrl = GmailIntegrationService.getAuthUrl();
    
    // Open in browser (use Linking or WebBrowser)
    await Linking.openURL(authUrl);
    
    // Handle redirect in deep link handler
  };

  const handleSync = async () => {
    if (user) {
      const count = await syncEmails(user.id);
      alert(`Imported ${count} new transactions!`);
    }
  };

  return (
    <View>
      <Text>Gmail Integration</Text>
      
      {isConnected ? (
        <>
          <Text>✅ Connected</Text>
          <Button title="Sync Now" onPress={handleSync} disabled={isLoading} />
          <Button title="Disconnect" onPress={disconnectGmail} disabled={isLoading} />
        </>
      ) : (
        <>
          <Text>Connect your Gmail to automatically import bank transactions</Text>
          <Button title="Connect Gmail" onPress={handleConnect} disabled={isLoading} />
        </>
      )}
    </View>
  );
}
```

#### 6.2 Handle OAuth Redirect

In your app's linking configuration:

```typescript
// app/_layout.tsx or navigation setup
import * as Linking from 'expo-linking';
import GmailIntegrationService from '../services/gmailIntegrationService';

// Handle deep links
Linking.addEventListener('url', async (event) => {
  const url = event.url;
  const { queryParams } = Linking.parse(url);
  
  if (url.startsWith('octopus-finance-advisor://auth/callback')) {
    const code = queryParams.code as string;
    const error = queryParams.error as string;
    
    if (error) {
      console.error('OAuth error:', error);
      return;
    }
    
    if (code) {
      try {
        // Exchange code for tokens
        const tokens = await GmailIntegrationService.exchangeAuthCode(code);
        
        // Set up push notifications
        const topicName = process.env.EXPO_PUBLIC_GMAIL_PUBSUB_TOPIC!;
        await GmailIntegrationService.setupPushNotifications(topicName);
        
        // Save integration to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_integrations').upsert({
            user_id: user.id,
            gmail_enabled: true,
            gmail_email: user.email,
            gmail_access_token: tokens.accessToken,
            gmail_refresh_token: tokens.refreshToken,
            gmail_token_expiry: new Date(tokens.expiryTime).toISOString(),
          });
        }
        
        alert('Gmail connected successfully!');
      } catch (error) {
        console.error('Failed to connect Gmail:', error);
        alert('Failed to connect Gmail');
      }
    }
  }
});
```

## 🧪 Testing

### Test Email Parsing

1. Send yourself a test bank transaction email
2. Wait a few seconds for the webhook to process
3. Check your app's transactions list
4. The transaction should appear automatically

### Test Manual Sync

1. Go to Gmail Settings in your app
2. Click "Sync Now"
3. Should fetch and import recent bank emails

### Debug Webhook

Check Supabase Edge Function logs:

```bash
supabase functions logs gmail-webhook
supabase functions logs parse-email-transaction
```

## 🔐 Security Best Practices

1. **Never expose Client Secret** in your React Native app - keep it in Edge Functions only
2. **Use HTTPS** for all API calls
3. **Validate webhook requests** from Pub/Sub (verify token)
4. **Store tokens securely** using Expo SecureStore
5. **Implement token refresh** before they expire
6. **Add rate limiting** to prevent abuse
7. **Log security events** for audit trails

## 🎨 Customization

### Add More Banks

Edit the bank domain list in `gmail-webhook/index.ts`:

```typescript
const bankDomains = [
  'hdfcbank.com',
  'icicibank.com',
  'sbi.co.in',
  // Add your banks here
];
```

### Customize Email Filters

Modify the Gmail query in `gmailIntegrationService.ts`:

```typescript
const query = [
  'from:(*@yourbank.com)',
  'subject:(transaction OR payment)',
  'newer_than:7d',
].join(' ');
```

### Improve AI Parsing

Update the system prompt in `parse-email-transaction/index.ts` to include:
- More bank-specific patterns
- Additional transaction types
- Better category classification
- Multi-language support

## 🐛 Troubleshooting

### Gmail API Returns 401 Unauthorized
- Token expired: Implement token refresh logic
- Invalid token: Re-authenticate user
- Revoked access: User needs to reconnect

### Webhook Not Receiving Notifications
- Check Pub/Sub subscription status
- Verify endpoint URL is correct
- Check IAM permissions
- Review Edge Function logs

### Transactions Not Importing
- Check AI parsing in Edge Function logs
- Verify bank email format is supported
- Check for duplicate detection logic
- Ensure database permissions are correct

### OAuth Redirect Not Working
- Verify redirect URI matches in Google Console
- Check deep link configuration in app.config.js
- Test with `npx uri-scheme open octopus-finance-advisor://auth/callback --ios`

## 📊 Monitoring

### Track Gmail Integration Usage

```sql
-- Count users with Gmail enabled
SELECT COUNT(*) FROM user_integrations WHERE gmail_enabled = true;

-- Count Gmail-imported transactions
SELECT COUNT(*) FROM transactions_real 
WHERE metadata->>'source' = 'gmail_webhook';

-- Average import time
SELECT 
  DATE(metadata->>'imported_at') as date,
  COUNT(*) as count
FROM transactions_real 
WHERE metadata->>'source' = 'gmail_webhook'
GROUP BY date
ORDER BY date DESC;
```

## 🚀 Next Steps

- [ ] Add support for email attachments (PDF statements)
- [ ] Implement email-based bill reminders
- [ ] Add notification preferences (which banks to watch)
- [ ] Create email filtering rules (custom categories)
- [ ] Build admin dashboard for monitoring
- [ ] Add support for other email providers (Outlook, Yahoo)

## 📚 Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Cloud Pub/Sub](https://cloud.google.com/pubsub/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OAuth 2.0 for Mobile Apps](https://developers.google.com/identity/protocols/oauth2/native-app)

## 💬 Support

If you encounter issues:
1. Check Edge Function logs in Supabase Dashboard
2. Review Google Cloud Pub/Sub metrics
3. Test Gmail API calls manually using OAuth Playground
4. Check this documentation for troubleshooting steps

---

**Built with ❤️ for OctopusFinance**




