# 📚 Gmail Integration - API Reference

Complete reference for all Gmail Integration Service methods and hooks.

## 📦 Service: `GmailIntegrationService`

### Initialization

#### `initialize(config: GmailConfig): void`

Initialize the Gmail service with OAuth credentials.

```typescript
import GmailIntegrationService from './services/gmailIntegrationService';

GmailIntegrationService.initialize({
  clientId: 'your-client-id.apps.googleusercontent.com',
  clientSecret: 'your-client-secret',
  redirectUri: 'octopus-finance-advisor://auth/callback',
});
```

**Parameters:**
- `config.clientId` - OAuth 2.0 Client ID from Google Cloud Console
- `config.clientSecret` - OAuth 2.0 Client Secret
- `config.redirectUri` - Redirect URI for OAuth callback

---

### OAuth Methods

#### `getAuthUrl(): string`

Get the Gmail OAuth authorization URL to redirect users.

```typescript
const authUrl = GmailIntegrationService.getAuthUrl();
Linking.openURL(authUrl);
```

**Returns:** Authorization URL string

**Scopes Requested:**
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.modify`

---

#### `exchangeAuthCode(code: string): Promise<GmailTokens>`

Exchange OAuth authorization code for access and refresh tokens.

```typescript
// After OAuth redirect
const tokens = await GmailIntegrationService.exchangeAuthCode(authCode);
```

**Parameters:**
- `code` - Authorization code from OAuth callback

**Returns:** Token object containing:
- `accessToken` - OAuth access token
- `refreshToken` - OAuth refresh token
- `expiryTime` - Token expiry timestamp (Unix)

**Throws:** Error if exchange fails

---

#### `isAuthenticated(): Promise<boolean>`

Check if user has connected their Gmail account.

```typescript
const isConnected = await GmailIntegrationService.isAuthenticated();
```

**Returns:** `true` if tokens are stored, `false` otherwise

---

#### `disconnect(): Promise<void>`

Disconnect Gmail integration and clear stored tokens.

```typescript
await GmailIntegrationService.disconnect();
```

**Side Effects:**
- Stops Gmail watch
- Clears all stored tokens
- Logs disconnection

---

### Gmail API Methods

#### `setupPushNotifications(topicName: string): Promise<void>`

Set up Gmail push notifications via Google Cloud Pub/Sub.

```typescript
await GmailIntegrationService.setupPushNotifications(
  'projects/my-project/topics/gmail-notifications'
);
```

**Parameters:**
- `topicName` - Full Pub/Sub topic name

**Requirements:**
- Topic must exist in Google Cloud
- IAM permissions must be configured
- Push subscription must point to webhook

**Throws:** Error if setup fails

---

#### `stopWatch(): Promise<void>`

Stop watching Gmail for new emails.

```typescript
await GmailIntegrationService.stopWatch();
```

**Note:** Watch expires after 7 days and must be renewed.

---

#### `fetchBankEmails(maxResults?: number): Promise<ParsedEmailTransaction[]>`

Fetch recent bank transaction emails from Gmail.

```typescript
const emails = await GmailIntegrationService.fetchBankEmails(20);

emails.forEach(email => {
  console.log(`${email.subject}: ${email.transaction?.amount}`);
});
```

**Parameters:**
- `maxResults` - Maximum emails to fetch (default: 10)

**Returns:** Array of parsed email transactions

**Query:** Automatically filters for:
- Known bank domains (HDFC, ICICI, SBI, etc.)
- Transaction keywords (debited, credited, payment)
- Recent emails (last 7 days)

---

#### `importEmailTransaction(email: ParsedEmailTransaction, userId: string): Promise<string | null>`

Import a single email transaction to the database.

```typescript
const transactionId = await GmailIntegrationService.importEmailTransaction(
  emailData,
  userId
);
```

**Parameters:**
- `email` - Parsed email transaction object
- `userId` - User's ID

**Returns:** Transaction ID if imported, `null` if no transaction data

**Features:**
- Automatic duplicate detection
- Metadata storage for traceability
- RLS security enforced

---

#### `syncBankEmails(userId: string): Promise<number>`

Sync recent bank emails and import transactions.

```typescript
const importCount = await GmailIntegrationService.syncBankEmails(userId);
console.log(`Imported ${importCount} transactions`);
```

**Parameters:**
- `userId` - User's ID

**Returns:** Number of transactions imported

**Features:**
- Fetches up to 20 recent emails
- Parses each email using AI
- Checks for duplicates
- Imports valid transactions
- Logs import status

---

## 🪝 Hook: `useGmailIntegration()`

React hook for Gmail integration in components.

### Usage

```typescript
import { useGmailIntegration } from './services/gmailIntegrationService';

function GmailSettings() {
  const { 
    isConnected, 
    isLoading, 
    connectGmail, 
    disconnectGmail, 
    syncEmails 
  } = useGmailIntegration();

  // Component logic...
}
```

### Properties

#### `isConnected: boolean`

Whether Gmail is currently connected.

```typescript
{isConnected ? (
  <Text>✅ Gmail Connected</Text>
) : (
  <Text>❌ Not Connected</Text>
)}
```

---

#### `isLoading: boolean`

Whether an operation is in progress.

```typescript
<Button 
  title="Sync" 
  onPress={syncEmails} 
  disabled={isLoading} 
/>
```

---

### Methods

#### `connectGmail(): Promise<void>`

Initiate Gmail OAuth flow.

```typescript
<Button title="Connect Gmail" onPress={connectGmail} />
```

**Flow:**
1. Gets authorization URL
2. Opens URL in browser/webview
3. User grants permissions
4. Redirects back to app
5. App exchanges code for tokens

---

#### `disconnectGmail(): Promise<void>`

Disconnect Gmail integration.

```typescript
<Button title="Disconnect" onPress={disconnectGmail} />
```

**Side Effects:**
- Updates `isConnected` to `false`
- Clears stored tokens

---

#### `syncEmails(userId: string): Promise<number>`

Manually sync bank emails.

```typescript
const handleSync = async () => {
  const count = await syncEmails(userId);
  Alert.alert('Success', `Imported ${count} transactions`);
};
```

**Returns:** Number of transactions imported

---

## 🔧 Types

### `GmailConfig`

```typescript
interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}
```

### `GmailTokens`

```typescript
interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  expiryTime: number; // Unix timestamp
}
```

### `ParsedEmailTransaction`

```typescript
interface ParsedEmailTransaction {
  subject: string;
  from: string;
  body: string;
  date: string; // ISO 8601
  messageId: string;
  transaction: {
    name: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string; // ISO 8601
    bank?: string;
    accountNumber?: string;
    balance?: number;
  } | null;
}
```

---

## 🔐 Security

### Token Storage

Tokens are stored securely using Expo SecureStore:

```typescript
// Automatically handled by the service
await SecureStore.setItemAsync('gmail_access_token', token);
```

**Storage Keys:**
- `gmail_access_token`
- `gmail_refresh_token`
- `gmail_token_expiry`
- `gmail_watch_history_id`

### Token Refresh

Tokens are automatically refreshed before expiry:

```typescript
// Happens automatically in getAccessToken()
if (Date.now() >= tokens.expiryTime - 300000) {
  // Refresh 5 minutes before expiry
  await refreshAccessToken();
}
```

### RLS Policies

Database access is protected by Row Level Security:

```sql
-- Users can only access their own integrations
CREATE POLICY "Users can view own integrations"
  ON user_integrations
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📊 Database Functions

### `get_user_gmail_settings(user_id: UUID)`

Get user's Gmail settings and statistics.

```typescript
const { data } = await supabase
  .rpc('get_user_gmail_settings', { p_user_id: userId });

console.log(`Total imports: ${data.total_imports}`);
console.log(`Success rate: ${data.successful_imports / data.total_imports * 100}%`);
```

**Returns:**
- `gmail_enabled`
- `gmail_email`
- `gmail_last_sync_at`
- `total_imports`
- `successful_imports`
- `failed_imports`

---

### `get_recent_email_imports(user_id: UUID, limit: INTEGER)`

Get recent email import history.

```typescript
const { data } = await supabase
  .rpc('get_recent_email_imports', { 
    p_user_id: userId,
    p_limit: 20 
  });

data.forEach(log => {
  console.log(`${log.email_subject} - ${log.status}`);
});
```

**Returns:** Array of import logs with:
- `email_subject`
- `email_from`
- `email_date`
- `status`
- `transaction_id`
- `parsed_amount`
- `parsed_category`
- `created_at`

---

### `get_email_import_stats(user_id: UUID, days: INTEGER)`

Get email import statistics over time.

```typescript
const { data } = await supabase
  .rpc('get_email_import_stats', { 
    p_user_id: userId,
    p_days: 30 
  });

console.log(`Success rate: ${data.import_success_rate}%`);
console.log(`Total imported: ₹${data.total_amount_imported}`);
```

**Returns:**
- `total_emails`
- `successful_imports`
- `failed_imports`
- `duplicate_emails`
- `skipped_emails`
- `total_amount_imported`
- `avg_processing_time_ms`
- `most_common_bank`
- `import_success_rate`

---

## ⚡ Edge Functions

### `parse-email-transaction`

Parse transaction details from email content using AI.

**Endpoint:** `https://PROJECT.supabase.co/functions/v1/parse-email-transaction`

**Request:**
```typescript
const response = await supabase.functions.invoke('parse-email-transaction', {
  body: {
    subject: 'Transaction alert',
    body: 'Your account has been debited...',
    from: 'alerts@hdfcbank.com',
  },
});
```

**Response:**
```typescript
{
  transaction: {
    name: 'Account Debit',
    amount: 500,
    type: 'expense',
    category: 'Shopping',
    date: '2025-01-24',
    bank: 'HDFC',
    accountNumber: '1234',
    balance: 10000
  },
  metadata: {
    subject: 'Transaction alert',
    from: 'alerts@hdfcbank.com',
    parsedAt: '2025-01-24T10:30:00Z'
  }
}
```

---

### `gmail-webhook`

Webhook handler for Gmail push notifications.

**Endpoint:** `https://PROJECT.supabase.co/functions/v1/gmail-webhook`

**Triggered by:** Google Cloud Pub/Sub when new email arrives

**Process:**
1. Receives Pub/Sub message
2. Fetches new messages from Gmail
3. Parses transactions using AI
4. Imports to database
5. Triggers real-time notification

**Monitoring:**
```bash
# View webhook logs
supabase functions logs gmail-webhook --tail
```

---

## 🎯 Best Practices

### 1. Token Management

```typescript
// Always check authentication before API calls
if (await GmailIntegrationService.isAuthenticated()) {
  await GmailIntegrationService.syncBankEmails(userId);
} else {
  // Prompt user to connect Gmail
  await connectGmail();
}
```

### 2. Error Handling

```typescript
try {
  await GmailIntegrationService.syncBankEmails(userId);
} catch (error) {
  if (error.message.includes('unauthorized')) {
    // Token expired or revoked - re-authenticate
    await GmailIntegrationService.disconnect();
    // Prompt user to reconnect
  } else {
    // Handle other errors
    console.error('Sync failed:', error);
  }
}
```

### 3. User Feedback

```typescript
const handleSync = async () => {
  setLoading(true);
  try {
    const count = await syncEmails(userId);
    Toast.show({
      type: 'success',
      text1: 'Sync Complete',
      text2: `Imported ${count} new transactions`,
    });
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Sync Failed',
      text2: error.message,
    });
  } finally {
    setLoading(false);
  }
};
```

### 4. Periodic Sync

```typescript
// Set up periodic sync (e.g., every hour)
useEffect(() => {
  const interval = setInterval(async () => {
    if (isConnected && user) {
      await syncEmails(user.id);
    }
  }, 3600000); // 1 hour

  return () => clearInterval(interval);
}, [isConnected, user]);
```

---

## 🔍 Debugging

### Enable Debug Logs

```typescript
// Add to service initialization
console.log('Gmail Integration initialized:', {
  clientId: config.clientId.substring(0, 10) + '...',
  redirectUri: config.redirectUri,
});
```

### Check Token Status

```typescript
const tokens = await SecureStore.getItemAsync('gmail_access_token');
const expiry = await SecureStore.getItemAsync('gmail_token_expiry');

console.log('Token exists:', !!tokens);
console.log('Expires at:', new Date(parseInt(expiry)));
console.log('Is expired:', Date.now() >= parseInt(expiry));
```

### Monitor Edge Functions

```bash
# Real-time logs
supabase functions logs gmail-webhook --tail

# Filter errors
supabase functions logs gmail-webhook | grep ERROR
```

---

## 📖 Examples

See `/docs/features/gmail-integration/EXAMPLES.md` for complete code examples.

## 🐛 Troubleshooting

See `/docs/features/gmail-integration/SETUP.md` for common issues and solutions.

---

**Last Updated:** January 24, 2025  
**Version:** 1.0.0




