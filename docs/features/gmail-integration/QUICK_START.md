# 📧 Gmail Integration - Quick Start

Get bank transaction emails automatically imported into your app in under 30 minutes!

## 🎯 What You'll Get

✅ **Real-time transaction imports** from bank emails  
✅ **AI-powered parsing** of transaction details  
✅ **Zero manual entry** for email-based transactions  
✅ **Automatic categorization** using existing AI service  

## ⚡ Quick Setup (3 Steps)

### 1️⃣ Google Cloud Setup (10 min)

```bash
# 1. Enable Gmail API
https://console.cloud.google.com/apis/library/gmail.googleapis.com

# 2. Create OAuth Credentials
https://console.cloud.google.com/apis/credentials

# 3. Create Pub/Sub Topic
gcloud pubsub topics create gmail-notifications

# 4. Create Push Subscription (after deploying Edge Function)
gcloud pubsub subscriptions create gmail-webhook-subscription \
  --topic=gmail-notifications \
  --push-endpoint=https://YOUR_PROJECT.supabase.co/functions/v1/gmail-webhook
```

### 2️⃣ Supabase Setup (10 min)

```bash
# 1. Run database migration
supabase db push --include-all --include-seed

# 2. Set secrets
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set GMAIL_CLIENT_ID=your_client_id
supabase secrets set GMAIL_CLIENT_SECRET=your_client_secret

# 3. Deploy Edge Functions
supabase functions deploy parse-email-transaction
supabase functions deploy gmail-webhook
```

### 3️⃣ App Setup (10 min)

```typescript
// 1. Initialize service (app startup)
import GmailIntegrationService from './services/gmailIntegrationService';

GmailIntegrationService.initialize({
  clientId: process.env.EXPO_PUBLIC_GMAIL_CLIENT_ID!,
  clientSecret: process.env.EXPO_PUBLIC_GMAIL_CLIENT_SECRET!,
  redirectUri: 'octopus-finance-advisor://auth/callback',
});

// 2. Add Gmail connect button
import { useGmailIntegration } from './services/gmailIntegrationService';

function Settings() {
  const { isConnected, connectGmail, syncEmails } = useGmailIntegration();
  
  return (
    <View>
      {isConnected ? (
        <Button title="Sync Emails" onPress={() => syncEmails(userId)} />
      ) : (
        <Button title="Connect Gmail" onPress={connectGmail} />
      )}
    </View>
  );
}

// 3. Handle OAuth redirect (app/_layout.tsx)
Linking.addEventListener('url', async (event) => {
  if (event.url.includes('auth/callback')) {
    const { queryParams } = Linking.parse(event.url);
    if (queryParams.code) {
      await GmailIntegrationService.exchangeAuthCode(queryParams.code);
      await GmailIntegrationService.setupPushNotifications(
        'projects/YOUR_PROJECT/topics/gmail-notifications'
      );
    }
  }
});
```

## 🧪 Test It

1. **Connect Gmail**: Open app → Settings → Connect Gmail
2. **Send test email**: Send yourself a transaction email or forward one from your bank
3. **Wait 5-10 seconds**: Webhook processes the email
4. **Check transactions**: Should appear automatically!

## 📱 Supported Banks

Out of the box:
- HDFC Bank
- ICICI Bank
- State Bank of India (SBI)
- Axis Bank
- Kotak Mahindra Bank
- Paytm
- PhonePe
- Amazon Pay

**Add more**: Edit `bankDomains` array in `gmail-webhook/index.ts`

## 🎨 Customization

### Filter specific email types

```typescript
// In gmailIntegrationService.ts, modify the Gmail query:
const query = [
  'from:(*@yourbank.com)',
  'subject:(transaction OR credited OR debited)',
  'newer_than:7d',  // Change time range
  '-label:spam',    // Exclude spam
].join(' ');
```

### Customize AI parsing

```typescript
// In parse-email-transaction/index.ts, update the prompt:
const systemPrompt = `Extract transaction details...
Include these additional fields:
- merchant_category: Category like "Restaurant", "Gas Station"
- payment_method: "Credit Card", "Debit Card", "UPI"
- location: Transaction location if available
...`;
```

### Add custom transaction types

```typescript
// Modify category detection based on keywords
if (body.includes('EMI')) {
  category = 'Loan Payment';
  type = 'expense';
} else if (body.includes('dividend')) {
  category = 'Investment Income';
  type = 'income';
}
```

## 🐛 Common Issues

### "OAuth redirect not working"
**Solution**: Check `app.config.js` has correct scheme configured

### "Webhook not receiving notifications"
**Solution**: Verify Pub/Sub subscription endpoint URL matches deployed function

### "Transactions not parsing correctly"
**Solution**: Check Edge Function logs: `supabase functions logs parse-email-transaction`

### "Duplicate transactions"
**Solution**: Duplicate detection is built-in using `metadata->>'email_id'`

## 🔒 Security Notes

- Tokens stored securely in Expo SecureStore
- Client secret never exposed in app (only in Edge Functions)
- RLS policies protect user data
- OAuth refresh token automatically refreshes expired tokens
- Webhook validates Pub/Sub messages

## 📊 Monitoring

```sql
-- Check import success rate
SELECT 
  COUNT(*) FILTER (WHERE metadata->>'source' = 'gmail_webhook') as gmail_imports,
  COUNT(*) as total_transactions,
  ROUND(100.0 * COUNT(*) FILTER (WHERE metadata->>'source' = 'gmail_webhook') / COUNT(*), 2) as percentage
FROM transactions_real
WHERE created_at > NOW() - INTERVAL '30 days';
```

## 🚀 Production Checklist

- [ ] Gmail API OAuth consent screen verified by Google
- [ ] Pub/Sub topic has proper IAM permissions
- [ ] Edge Functions deployed and tested
- [ ] Environment variables set in Supabase
- [ ] Database migration applied
- [ ] Deep linking tested on iOS and Android
- [ ] Error handling and logging implemented
- [ ] User notifications configured
- [ ] Privacy policy updated (mentions Gmail access)
- [ ] Help documentation created for users

## 📚 Learn More

- **Full Setup Guide**: [SETUP.md](./SETUP.md)
- **Architecture Details**: See service file comments
- **Gmail API Docs**: https://developers.google.com/gmail/api
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

## 💡 Tips

1. **Test with forwarded emails first** before connecting real bank accounts
2. **Start with one bank** and expand after testing
3. **Monitor Edge Function logs** for the first few days
4. **Set up alerts** for failed imports
5. **Educate users** about what emails will be imported

## 🎯 Next Features to Add

- [ ] Email attachment parsing (PDF statements)
- [ ] Custom email filters per user
- [ ] Multi-language email support
- [ ] Email-based bill reminders
- [ ] Transaction conflict resolution UI
- [ ] Import history dashboard

---

**Need Help?** Check the full [SETUP.md](./SETUP.md) guide or Edge Function logs.

