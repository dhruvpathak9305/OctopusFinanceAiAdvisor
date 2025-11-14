# 📧 Gmail Integration for OctopusFinance

> Automatically import bank transaction emails in real-time using Gmail API and AI parsing

## 🎯 Overview

The Gmail Integration feature enables users to automatically import bank transactions from their email notifications. No more manual data entry for every transaction email you receive!

### Key Features

✅ **Real-time Import** - Transactions appear in your app within seconds of email arrival  
✅ **AI-Powered Parsing** - Extracts amount, category, merchant, and more  
✅ **Multi-Bank Support** - Works with HDFC, ICICI, SBI, Axis, and more  
✅ **Duplicate Detection** - Never imports the same transaction twice  
✅ **Secure OAuth** - Uses Google's secure authentication  
✅ **Privacy-First** - Email content is not stored, only transaction details  

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 30 minutes
- **[Complete Setup Guide](./SETUP.md)** - Detailed setup instructions
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Required
- Google Cloud account
- Supabase project
- OpenAI API key
- React Native app with Expo
```

### 2. Quick Setup

```bash
# 1. Enable Gmail API in Google Cloud Console
# 2. Create OAuth 2.0 credentials
# 3. Create Pub/Sub topic and subscription

# 4. Deploy Edge Functions
supabase functions deploy parse-email-transaction
supabase functions deploy gmail-webhook

# 5. Run database migration
psql -f database/migrations/20250124_gmail_integration.sql
```

### 3. Initialize in Your App

```typescript
import GmailIntegrationService from './services/gmailIntegrationService';

// App startup
GmailIntegrationService.initialize({
  clientId: process.env.EXPO_PUBLIC_GMAIL_CLIENT_ID!,
  clientSecret: process.env.EXPO_PUBLIC_GMAIL_CLIENT_SECRET!,
  redirectUri: 'octopus-finance-advisor://auth/callback',
});
```

### 4. Add UI Component

```typescript
import GmailIntegrationSettings from './src/mobile/pages/GmailIntegrationSettings';

// Add to your navigation
<Stack.Screen 
  name="GmailSettings" 
  component={GmailIntegrationSettings} 
/>
```

## 🏗️ Architecture

```
┌──────────────┐
│   Gmail API  │ Watches for new emails
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Google Pub/Sub  │ Real-time notifications
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│  Supabase Edge Function  │ Webhook handler
│   (gmail-webhook)        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  AI Parser (OpenAI)      │ Extracts transaction details
│  (parse-email-txn)       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Supabase Database       │ Stores transactions
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  React Native App        │ Real-time updates via Supabase
└──────────────────────────┘
```

## 📊 What Gets Imported

From a typical bank email like:

```
Subject: Transaction Alert
From: alerts@hdfcbank.com

Your account XX1234 has been debited with Rs.500.00 
on 24-Oct-25 at AMAZON. Avl Bal: Rs.10,000.00
```

We extract:

- **Name**: "Amazon"
- **Amount**: 500.00
- **Type**: "expense"
- **Category**: "Shopping" (AI-detected)
- **Date**: 2025-10-24
- **Bank**: "HDFC"
- **Account**: "1234"
- **Balance**: 10,000.00

## 🏦 Supported Banks

**Currently Supported:**
- HDFC Bank (`*@hdfcbank.com`)
- ICICI Bank (`*@icicibank.com`)
- State Bank of India (`*@sbi.co.in`)
- Axis Bank (`*@axisbank.com`)
- Kotak Mahindra Bank (`*@kotak.com`)
- Paytm (`*@paytm.com`)
- PhonePe (`*@phonepe.com`)
- Amazon Pay (`*@amazonpay.in`)

**Easy to Add More:**
Edit the `bankDomains` array in `supabase/functions/gmail-webhook/index.ts`

## 🔐 Security & Privacy

### What We Access
- ✅ Read emails from known bank domains only
- ✅ Extract transaction details using AI
- ✅ Store only transaction data (not email content)

### What We DON'T Do
- ❌ Read personal or non-financial emails
- ❌ Store complete email content
- ❌ Access sent emails or drafts
- ❌ Modify or delete emails
- ❌ Share data with third parties

### Security Measures
- 🔒 OAuth 2.0 secure authentication
- 🔒 Tokens stored in Expo SecureStore
- 🔒 Row Level Security (RLS) on database
- 🔒 HTTPS for all API calls
- 🔒 Automatic token refresh
- 🔒 Client secret never exposed in app

## 📱 User Experience

### First Time Setup (2 steps)
1. User clicks "Connect Gmail"
2. User grants permissions in Google OAuth screen
3. Done! Transactions start importing automatically

### Daily Use
- User receives bank email → Transaction appears in app automatically
- User can manually sync: "Sync Now" button
- User sees import statistics and recent imports
- User can disconnect anytime

## 📈 Monitoring & Analytics

### Built-in Analytics

Track integration performance with database functions:

```typescript
// Get user statistics
const stats = await supabase.rpc('get_user_gmail_settings', { 
  p_user_id: userId 
});

// Get recent imports
const imports = await supabase.rpc('get_recent_email_imports', { 
  p_user_id: userId,
  p_limit: 20
});

// Get detailed stats
const analytics = await supabase.rpc('get_email_import_stats', { 
  p_user_id: userId,
  p_days: 30
});
```

### Metrics Tracked
- Total emails processed
- Successful imports
- Failed imports
- Duplicate detections
- Success rate percentage
- Total amount imported
- Average processing time
- Most common bank

## 🧪 Testing

### Manual Testing

```bash
# 1. Connect Gmail in app
# 2. Send yourself a test email with this content:

Subject: Transaction Alert
From: test@hdfcbank.com

Your account XX1234 has been debited with Rs.100.00
on 24-Oct-25 at TEST MERCHANT. Avl Bal: Rs.5,000.00

# 3. Wait 5-10 seconds
# 4. Check transactions in app
```

### Debug Logs

```bash
# View Edge Function logs
supabase functions logs gmail-webhook --tail
supabase functions logs parse-email-transaction --tail

# Filter for errors
supabase functions logs gmail-webhook | grep ERROR
```

## 🐛 Common Issues

### OAuth Redirect Not Working
**Problem:** Clicking "Connect Gmail" but nothing happens  
**Solution:** Check `app.config.js` has correct URL scheme configured

### Webhook Not Receiving Notifications
**Problem:** Emails arrive but transactions don't import  
**Solution:** 
- Verify Pub/Sub subscription endpoint URL
- Check IAM permissions in Google Cloud
- Review Edge Function logs

### Transactions Not Parsing
**Problem:** Emails processed but no transactions created  
**Solution:**
- Check if email is from supported bank
- Review AI parsing logs in `parse-email-transaction`
- Test email format manually

### Token Expired Errors
**Problem:** "Unauthorized" or "Token expired" errors  
**Solution:**
- Token auto-refresh should handle this
- If persists, user needs to reconnect Gmail
- Check `gmail_token_expiry` in database

## 🔧 Customization

### Add New Banks

```typescript
// In gmail-webhook/index.ts
const bankDomains = [
  'hdfcbank.com',
  'icicibank.com',
  // Add your bank here
  'yourbank.com',
];
```

### Customize Email Filters

```typescript
// In gmailIntegrationService.ts
const query = [
  'from:(*@yourbank.com)',
  'subject:(transaction OR payment)',
  'newer_than:7d',  // Change time range
  '-label:spam',    // Exclude spam
].join(' ');
```

### Improve AI Parsing

Edit the system prompt in `parse-email-transaction/index.ts` to include:
- More bank-specific patterns
- Additional transaction types
- Better category classification
- Multi-language support

## 📊 Database Schema

### Tables Created

1. **`user_integrations`** - Stores OAuth tokens and settings
2. **`email_import_logs`** - Tracks import history and status

### Functions Added

1. **`get_user_gmail_settings()`** - Get user's integration status
2. **`get_recent_email_imports()`** - Get recent import history
3. **`get_email_import_stats()`** - Calculate statistics

## 🚀 Production Checklist

Before going live:

- [ ] OAuth consent screen verified by Google
- [ ] Production credentials configured
- [ ] Pub/Sub topic and subscription created
- [ ] Edge Functions deployed and tested
- [ ] Database migration applied
- [ ] Deep linking tested on iOS and Android
- [ ] Error handling and logging implemented
- [ ] User documentation created
- [ ] Privacy policy updated
- [ ] Support process defined

## 📖 Complete Documentation

- [Quick Start Guide](./QUICK_START.md) - 30-minute setup
- [Setup Guide](./SETUP.md) - Detailed instructions
- [API Reference](./API_REFERENCE.md) - Complete API docs

## 🎯 Roadmap

Future enhancements:

- [ ] Email attachment parsing (PDF statements)
- [ ] Custom email filters per user
- [ ] Multi-language email support
- [ ] Email-based bill reminders
- [ ] Transaction conflict resolution UI
- [ ] Import history dashboard
- [ ] Support for Outlook/Yahoo emails
- [ ] Bulk historical email import

## 💬 Support

Having issues? 

1. Check [SETUP.md](./SETUP.md) troubleshooting section
2. Review Edge Function logs
3. Test with forwarded emails first
4. Check Google Cloud Console for API errors

## 📄 License

This feature is part of OctopusFinance and follows the project's license.

---

**Built with ❤️ for OctopusFinance**  
**Last Updated:** January 24, 2025  
**Version:** 1.0.0




