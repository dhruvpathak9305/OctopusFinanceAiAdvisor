# 🏦 Setu Account Aggregator - Implementation Guide

> Complete implementation of Setu AA for direct bank transaction fetching

## 🎯 What is Setu Account Aggregator?

**Setu** (by Pine Labs) is an RBI-approved Account Aggregator that provides:
- Direct access to 100+ Indian banks
- Real-time transaction sync
- User consent-based access
- End-to-end encryption
- Simple REST APIs

**Used by:** CRED, Groww, Paytm Money, and many fintech apps

**Website:** https://setu.co/

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    USER FLOW                                 │
└──────────────────────────────────────────────────────────────┘
                              │
      1. User clicks "Connect Bank Account"
                              │
                              ▼
      2. Your app → Setu API: Request consent
                              │
                              ▼
      3. User redirected to bank login (secure)
                              │
                              ▼
      4. User approves consent in bank portal
                              │
                              ▼
      5. Bank → Setu: Consent approved
                              │
                              ▼
      6. Setu → Your app: Consent token received
                              │
                              ▼
      7. Your app → Setu: Fetch transactions
                              │
                              ▼
      8. Setu → Bank: Request encrypted data
                              │
                              ▼
      9. Bank → Setu: Send encrypted transactions
                              │
                              ▼
     10. Setu → Your app: Decrypted transactions
                              │
                              ▼
     11. Store in database + Update UI 🎉
```

## 🚀 Setup Steps

### Step 1: Sign Up for Setu

1. Go to https://setu.co/
2. Click "Get Started" or "Sign Up"
3. Fill in company details
4. Get API keys (sandbox and production)
5. Choose plan (Free tier: 100 accounts/month)

### Step 2: Get Credentials

After signup, you'll receive:
- **Client ID** - Your app identifier
- **Client Secret** - API authentication
- **x-client-id** - Request header
- **x-client-secret** - Request header
- **Sandbox URLs** - For testing
- **Production URLs** - For live

### Step 3: Understand Setu's Data Types

Setu provides these financial data types (FITypes):

- **DEPOSIT** - Bank accounts (savings, current)
- **TERM-DEPOSIT** - Fixed deposits, recurring deposits
- **RECURRING-DEPOSIT** - RDs
- **SIP** - Systematic Investment Plans
- **CP** - Commercial Paper
- **GOVT-SECURITIES** - Government securities
- **EQUITIES** - Stocks, shares
- **BONDS** - Corporate bonds
- **DEBENTURES** - Company debentures
- **MUTUAL-FUNDS** - Mutual fund investments
- **ETF** - Exchange Traded Funds
- **IDR** - Indian Depository Receipts
- **CIS** - Collective Investment Schemes
- **AIF** - Alternative Investment Funds
- **INSURANCE-POLICIES** - Life/health insurance
- **NPS** - National Pension System
- **INVIT** - Infrastructure Investment Trusts
- **REIT** - Real Estate Investment Trusts
- **OTHER** - Other financial instruments

## 📋 API Flow

### 1. Create Consent Request

```typescript
POST https://api.setu.co/api/v2/consents

{
  "Detail": {
    "consentStart": "2025-01-24T00:00:00.000Z",
    "consentExpiry": "2026-01-24T23:59:59.999Z",
    "Customer": {
      "id": "user@example.com"
    },
    "FIDataRange": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2025-01-24T23:59:59.999Z"
    },
    "consentMode": "STORE",
    "consentTypes": ["TRANSACTIONS", "PROFILE", "SUMMARY"],
    "fetchType": "PERIODIC",
    "Frequency": {
      "unit": "HOUR",
      "value": 1
    },
    "DataFilter": [
      {
        "type": "TRANSACTIONAMOUNT",
        "operator": ">=",
        "value": "0"
      }
    ],
    "DataLife": {
      "unit": "MONTH",
      "value": 12
    },
    "DataConsumer": {
      "id": "your-app-id"
    },
    "Purpose": {
      "code": "101",
      "text": "Personal Finance Management"
    },
    "fiTypes": ["DEPOSIT", "TERM-DEPOSIT"]
  }
}
```

**Response:**
```json
{
  "id": "consent-request-id",
  "url": "https://anumati.setu.co/consent/request-id",
  "status": "PENDING"
}
```

### 2. User Approves Consent

Redirect user to: `consent.url`

User will:
1. Select their bank
2. Login to bank (OAuth/NetBanking)
3. Review consent details
4. Approve consent

### 3. Check Consent Status

```typescript
GET https://api.setu.co/api/v2/consents/{consentId}
```

**Response:**
```json
{
  "status": "ACTIVE",
  "consentHandle": "consent-handle-id",
  "Accounts": [
    {
      "linkRefNumber": "account-link-ref-1",
      "FIType": "DEPOSIT",
      "accType": "SAVINGS",
      "maskedAccNumber": "XXXXXXXX1234"
    }
  ]
}
```

### 4. Fetch Account Data

```typescript
POST https://api.setu.co/api/v2/sessions

{
  "consentId": "consent-request-id",
  "DataRange": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2025-01-24T23:59:59.999Z"
  },
  "format": "json"
}
```

**Response:**
```json
{
  "id": "session-id",
  "status": "PENDING"
}
```

### 5. Get Transaction Data

```typescript
GET https://api.setu.co/api/v2/sessions/{sessionId}
```

**Response:**
```json
{
  "status": "COMPLETED",
  "Accounts": [
    {
      "linkRefNumber": "account-link-ref-1",
      "maskedAccNumber": "XXXXXXXX1234",
      "type": "SAVINGS",
      "Profile": {
        "Holders": {
          "name": "John Doe",
          "email": "john@example.com",
          "mobile": "9876543210"
        }
      },
      "Summary": {
        "currentBalance": "50000.00",
        "currency": "INR",
        "balanceDateTime": "2025-01-24T10:30:00.000Z"
      },
      "Transactions": {
        "startDate": "2024-01-01",
        "endDate": "2025-01-24",
        "Transaction": [
          {
            "txnId": "txn-001",
            "type": "DEBIT",
            "mode": "UPI",
            "amount": "500.00",
            "currentBalance": "49500.00",
            "transactionTimestamp": "2025-01-23T14:30:00.000Z",
            "valueDate": "2025-01-23",
            "narration": "UPI/AMAZON/9876543210",
            "reference": "UPI-REF-001"
          },
          {
            "txnId": "txn-002",
            "type": "CREDIT",
            "mode": "NEFT",
            "amount": "10000.00",
            "currentBalance": "50000.00",
            "transactionTimestamp": "2025-01-24T09:00:00.000Z",
            "valueDate": "2025-01-24",
            "narration": "Salary Credit",
            "reference": "NEFT-REF-002"
          }
        ]
      }
    }
  ]
}
```

## 💾 Database Schema

Run this migration to store Setu connections:

```sql
-- Account aggregator connections
CREATE TABLE IF NOT EXISTS bank_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Connection details
  provider VARCHAR(50) NOT NULL, -- 'setu', 'plaid', 'finbox'
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'revoked', 'error')),
  
  -- Setu specific
  consent_id TEXT,
  consent_handle TEXT,
  consent_status TEXT,
  consent_expiry TIMESTAMP WITH TIME ZONE,
  
  -- Account details
  account_link_ref TEXT UNIQUE,
  masked_account_number TEXT,
  account_type TEXT, -- 'SAVINGS', 'CURRENT', 'CREDIT_CARD'
  fi_type TEXT, -- 'DEPOSIT', 'TERM-DEPOSIT', etc.
  institution_name TEXT,
  
  -- Sync details
  last_synced_at TIMESTAMP WITH TIME ZONE,
  last_transaction_date DATE,
  sync_frequency_hours INTEGER DEFAULT 1,
  auto_sync_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, account_link_ref)
);

-- Indexes
CREATE INDEX idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX idx_bank_connections_status ON bank_connections(status) WHERE status = 'active';
CREATE INDEX idx_bank_connections_consent_id ON bank_connections(consent_id);
CREATE INDEX idx_bank_connections_last_synced ON bank_connections(last_synced_at);

-- RLS Policies
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON bank_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON bank_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON bank_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON bank_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Sync logs
CREATE TABLE IF NOT EXISTS bank_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  sync_type VARCHAR(50) NOT NULL, -- 'manual', 'auto', 'initial'
  status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
  
  transactions_fetched INTEGER DEFAULT 0,
  transactions_imported INTEGER DEFAULT 0,
  transactions_skipped INTEGER DEFAULT 0,
  
  start_date DATE,
  end_date DATE,
  
  error_message TEXT,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bank_sync_logs_connection_id ON bank_sync_logs(connection_id);
CREATE INDEX idx_bank_sync_logs_user_id ON bank_sync_logs(user_id);
CREATE INDEX idx_bank_sync_logs_created_at ON bank_sync_logs(created_at DESC);
```

## 📊 Purpose Codes

Setu requires a "purpose" for consent. Common codes:

| Code | Purpose |
|------|---------|
| 101 | Wealth management service |
| 102 | Customer spending patterns, budget or other reportings |
| 103 | Aggregated statement |
| 104 | Explicit consent for monitoring of the accounts |
| 105 | Facilitate a transaction |
| 106 | Other |

## 🔐 Security Best Practices

1. **Never store Client Secret in app** - Keep it server-side only
2. **Use HTTPS** for all API calls
3. **Validate consent status** before each data fetch
4. **Encrypt sensitive data** in database
5. **Log all consent actions** for audit trail
6. **Implement token refresh** for long-running consents
7. **Handle consent revocation** gracefully

## 💰 Pricing (Setu)

**Free Tier:**
- 100 linked accounts/month
- Full API access
- Sandbox environment

**Startup:**
- ₹3 per account/month
- 1000 accounts included
- Support via email

**Growth:**
- ₹2.50 per account/month
- 5000+ accounts
- Priority support

**Enterprise:**
- Custom pricing
- Dedicated account manager
- SLA guarantees

## 🧪 Testing

### Sandbox Mode

Setu provides test banks for sandbox:

1. **Test Bank** - Use for testing consent flow
2. **Sample Data** - Pre-populated transactions
3. **No Real Money** - Safe to test

**Test Credentials:**
- Username: `test@setu.co`
- Password: `test123`
- OTP: `123456`

## 📖 Next Steps

I'll now create:
1. ✅ Setu Integration Service (TypeScript)
2. ✅ Bank Connection UI (React Native)
3. ✅ Consent Flow Handler
4. ✅ Transaction Sync Logic
5. ✅ Supabase Edge Functions
6. ✅ Complete Setup Guide

Ready to implement? 🚀

