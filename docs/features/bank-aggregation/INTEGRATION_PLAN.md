# 🚀 Setu Integration - Complete Implementation Plan

## ✅ Your Setu Test Credentials

```
Client ID: d70f2b6c-9791-4e12-b62f-5a7998068525
Client Secret: Pl2NlWeXDh0bjxaq7WhLosLFqlKXhffI
Environment: Sandbox/Test
Base URL: https://fiu-uat.setu.co/api
```

---

## 📊 **ALL DATA You Can Fetch from Setu**

### 1. **Account Profile Data**

```json
{
  "Profile": {
    "Holders": {
      "name": "John Doe",
      "dob": "1990-01-15",
      "mobile": "9876543210",
      "email": "john@example.com",
      "pan": "ABCDE1234F",
      "ckycCompliance": true
    }
  }
}
```

**What you get:**
- ✅ Account holder name
- ✅ Date of birth
- ✅ Mobile number
- ✅ Email address
- ✅ PAN number
- ✅ KYC compliance status

---

### 2. **Account Summary (Balance & Details)**

```json
{
  "Summary": {
    "currentBalance": "50000.00",
    "currency": "INR",
    "balanceDateTime": "2025-01-24T10:30:00.000Z",
    "type": "SAVINGS",
    "branch": "Mumbai Main Branch",
    "facility": "OD",  // Overdraft facility
    "ifscCode": "HDFC0001234",
    "micrCode": "400240001",
    "openingDate": "2020-01-01",
    "currentODLimit": "25000.00",
    "drawingLimit": "25000.00",
    "status": "ACTIVE"
  }
}
```

**What you get:**
- ✅ **Current balance** (real-time)
- ✅ Currency
- ✅ Balance timestamp
- ✅ Account type (Savings/Current/OD)
- ✅ Branch name
- ✅ IFSC code
- ✅ MICR code
- ✅ Account opening date
- ✅ Overdraft limit (if applicable)
- ✅ Drawing limit
- ✅ Account status

---

### 3. **Transaction History**

```json
{
  "Transactions": {
    "startDate": "2024-01-01",
    "endDate": "2025-01-24",
    "Transaction": [
      {
        "txnId": "TXN20250124001",
        "type": "DEBIT",  // or "CREDIT"
        "mode": "UPI",  // UPI, NEFT, RTGS, IMPS, CARD, CASH, CHEQUE, ATM
        "amount": "500.00",
        "currentBalance": "49500.00",
        "transactionTimestamp": "2025-01-24T14:30:00.000Z",
        "valueDate": "2025-01-24",
        "narration": "UPI-AMAZON-9876543210-Payment to Amazon",
        "reference": "UPI/REF/304521345678"
      }
    ]
  }
}
```

**What you get:**
- ✅ **All transactions** (up to 12 months history)
- ✅ Transaction ID
- ✅ Type (Credit/Debit)
- ✅ Payment mode (UPI/NEFT/RTGS/IMPS/etc.)
- ✅ Amount
- ✅ Balance after transaction
- ✅ Transaction date & time
- ✅ Value date
- ✅ Narration/Description
- ✅ Reference number

**Transaction Modes Available:**
- `UPI` - UPI payments
- `NEFT` - National Electronic Funds Transfer
- `RTGS` - Real Time Gross Settlement
- `IMPS` - Immediate Payment Service
- `CARD` - Card payments
- `CASH` - Cash deposits/withdrawals
- `CHEQUE` - Cheque transactions
- `ATM` - ATM transactions
- `NETBANKING` - Net banking transfers
- `MOBILE` - Mobile banking
- `BILL_PAY` - Bill payments
- `OTHER` - Other modes

---

### 4. **Fixed Deposit (FD) Data**

```json
{
  "type": "TERM-DEPOSIT",
  "Summary": {
    "principalAmount": "100000.00",
    "currentValue": "105000.00",
    "interestRate": "6.5",
    "tenureMonths": 12,
    "maturityDate": "2026-01-24",
    "maturityAmount": "106500.00",
    "openingDate": "2025-01-24",
    "status": "ACTIVE"
  }
}
```

**What you get:**
- ✅ Principal amount
- ✅ Current value
- ✅ Interest rate
- ✅ Tenure (months)
- ✅ Maturity date
- ✅ Maturity amount
- ✅ Opening date
- ✅ Status

---

### 5. **Recurring Deposit (RD) Data**

```json
{
  "type": "RECURRING-DEPOSIT",
  "Summary": {
    "installmentAmount": "5000.00",
    "totalInstallments": 12,
    "paidInstallments": 6,
    "currentValue": "30500.00",
    "interestRate": "6.0",
    "maturityDate": "2025-12-31",
    "maturityAmount": "62000.00"
  }
}
```

**What you get:**
- ✅ Monthly installment
- ✅ Total installments
- ✅ Paid installments
- ✅ Current value
- ✅ Interest rate
- ✅ Maturity date
- ✅ Expected maturity amount

---

### 6. **Credit Card Data**

```json
{
  "type": "CREDIT_CARD",
  "Profile": {
    "cardNumber": "XXXX-XXXX-XXXX-1234",
    "cardType": "VISA",
    "nameOnCard": "JOHN DOE",
    "expiryDate": "12/28"
  },
  "Summary": {
    "currentBalance": "-25000.00",  // Negative = outstanding
    "creditLimit": "100000.00",
    "availableCredit": "75000.00",
    "dueDate": "2025-02-05",
    "minimumDue": "2500.00",
    "lastStatementDate": "2025-01-05",
    "lastStatementBalance": "22000.00"
  },
  "Transactions": [
    {
      "txnId": "CC20250124001",
      "type": "DEBIT",
      "amount": "2500.00",
      "merchantName": "AMAZON",
      "merchantCategory": "Online Shopping",
      "transactionTimestamp": "2025-01-24T15:30:00.000Z"
    }
  ]
}
```

**What you get:**
- ✅ Masked card number
- ✅ Card type (Visa/Mastercard/Rupay)
- ✅ Name on card
- ✅ Expiry date
- ✅ **Outstanding balance**
- ✅ **Credit limit**
- ✅ **Available credit**
- ✅ Due date
- ✅ Minimum payment due
- ✅ Last statement date & balance
- ✅ **All credit card transactions**
- ✅ Merchant names
- ✅ Merchant categories

---

### 7. **Mutual Fund Data**

```json
{
  "type": "MUTUAL-FUNDS",
  "Profile": {
    "schemeName": "HDFC Equity Fund - Direct Growth",
    "schemeCode": "123456",
    "folioNumber": "12345678/12",
    "panNumber": "ABCDE1234F"
  },
  "Summary": {
    "units": "1250.543",
    "nav": "850.25",
    "currentValue": "1063337.08",
    "investedValue": "900000.00",
    "gain": "163337.08",
    "gainPercentage": "18.15"
  },
  "Transactions": [
    {
      "txnDate": "2025-01-15",
      "type": "PURCHASE",
      "units": "50.123",
      "nav": "845.50",
      "amount": "42379.00"
    }
  ]
}
```

**What you get:**
- ✅ Scheme name
- ✅ Folio number
- ✅ Units held
- ✅ Current NAV
- ✅ **Current value**
- ✅ **Invested amount**
- ✅ **Gains/Loss**
- ✅ Gain percentage
- ✅ Purchase/redemption history

---

### 8. **Insurance Policy Data**

```json
{
  "type": "INSURANCE-POLICIES",
  "Profile": {
    "policyNumber": "LIC/123456789",
    "policyType": "TERM_LIFE",
    "policyHolder": "John Doe",
    "nominee": "Jane Doe",
    "sumAssured": "5000000.00"
  },
  "Summary": {
    "premiumAmount": "25000.00",
    "frequency": "YEARLY",
    "policyTerm": 20,
    "maturityDate": "2045-01-01",
    "status": "ACTIVE",
    "nextPremiumDate": "2026-01-01"
  }
}
```

**What you get:**
- ✅ Policy number
- ✅ Policy type
- ✅ Sum assured
- ✅ Premium amount
- ✅ Payment frequency
- ✅ Policy term
- ✅ Maturity date
- ✅ Next premium date
- ✅ Status

---

### 9. **NPS (National Pension System) Data**

```json
{
  "type": "NPS",
  "Profile": {
    "pranNumber": "123456789012",
    "schemeType": "TIER_1"
  },
  "Summary": {
    "currentValue": "450000.00",
    "totalContribution": "400000.00",
    "employerContribution": "150000.00",
    "employeeContribution": "250000.00",
    "returns": "50000.00",
    "returnsPercentage": "12.5"
  }
}
```

**What you get:**
- ✅ PRAN number
- ✅ Scheme type (Tier 1/Tier 2)
- ✅ Current corpus value
- ✅ Total contributions
- ✅ Employer contributions
- ✅ Employee contributions
- ✅ Returns

---

### 10. **Demat Account / Equities**

```json
{
  "type": "EQUITIES",
  "Profile": {
    "dematAccountNumber": "1234567890123456",
    "dpId": "IN123456",
    "dpName": "CDSL"
  },
  "Holdings": [
    {
      "isin": "INE009A01021",
      "scriptName": "Infosys Ltd",
      "quantity": "100",
      "averagePrice": "1450.00",
      "currentPrice": "1580.00",
      "investedValue": "145000.00",
      "currentValue": "158000.00",
      "gain": "13000.00",
      "gainPercentage": "8.97"
    }
  ]
}
```

**What you get:**
- ✅ Demat account number
- ✅ DP ID & name
- ✅ **All stock holdings**
- ✅ ISIN codes
- ✅ Quantity held
- ✅ Average buy price
- ✅ Current market price
- ✅ **Portfolio value**
- ✅ **Gains/Loss per stock**

---

## 🎯 **Complete Data Summary**

### Financial Accounts:
1. ✅ **Bank Savings/Current** - Balance, transactions
2. ✅ **Fixed Deposits** - All FDs with maturity details
3. ✅ **Recurring Deposits** - RD status and installments
4. ✅ **Credit Cards** - Limit, outstanding, all transactions
5. ✅ **Overdraft** - OD limit and usage

### Investments:
6. ✅ **Mutual Funds** - NAV, units, current value, gains
7. ✅ **Stocks/Equities** - Holdings, prices, P&L
8. ✅ **NPS** - Corpus value, contributions
9. ✅ **Bonds** - Bond holdings and interest
10. ✅ **ETFs** - Exchange Traded Funds

### Insurance & Others:
11. ✅ **Life Insurance** - Policies, premiums
12. ✅ **Health Insurance** - Coverage details
13. ✅ **PPF** - Public Provident Fund balance
14. ✅ **EPF** - Employee Provident Fund

---

## 🚀 **Step-by-Step Integration Plan**

### **Phase 1: Setup (30 minutes) - TODAY**

```bash
# 1. Store credentials securely
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# 2. Deploy Edge Functions
supabase functions deploy setu-create-consent
supabase functions deploy setu-check-consent
supabase functions deploy setu-create-session
supabase functions deploy setu-get-session

# 3. Set Supabase secrets
supabase secrets set SETU_CLIENT_ID="d70f2b6c-9791-4e12-b62f-5a7998068525"
supabase secrets set SETU_CLIENT_SECRET="Pl2NlWeXDh0bjxaq7WhLosLFqlKXhffI"
supabase secrets set SETU_BASE_URL="https://fiu-uat.setu.co/api"

# 4. Run database migration
psql -h YOUR_HOST -U postgres -d postgres \
  -f database/migrations/20250124_bank_connections.sql
```

### **Phase 2: Test Integration (1 hour)**

```typescript
// Test consent creation
const { data } = await supabase.functions.invoke('setu-create-consent', {
  body: {
    consentRequest: { /* ... */ },
    userId: 'test-user-id'
  }
});

// Open consent URL in browser
console.log('Visit:', data.url);

// After user approves, check status
const { data: status } = await supabase.functions.invoke('setu-check-consent', {
  body: { consentId: data.id }
});

// Fetch transactions
const { data: sessionData } = await supabase.functions.invoke('setu-create-session', {
  body: {
    consentId: data.id,
    dataRange: { from: '2024-01-01', to: '2025-01-24' }
  }
});
```

### **Phase 3: Build UI (2-3 hours)**

Create these screens:
1. Bank connection list
2. "Connect Bank" button → Opens Setu consent
3. Transaction sync status
4. Manual sync button
5. Disconnect option

### **Phase 4: Production (1 week)**

1. ✅ Test with 5-10 real users
2. ✅ Monitor error rates
3. ✅ Optimize sync frequency
4. ✅ Add error handling
5. ✅ Move to production credentials

---

## 📋 **Complete Checklist**

### Setup:
- [x] ✅ Setu account created
- [x] ✅ Test credentials received
- [x] ✅ .env.setu file created (DON'T commit!)
- [x] ✅ Edge Functions created (4 functions)
- [x] ✅ Database migration created
- [ ] 🔄 Deploy Edge Functions
- [ ] 🔄 Set Supabase secrets
- [ ] 🔄 Run database migration

### Testing:
- [ ] Test consent creation
- [ ] Test user approval flow
- [ ] Test transaction fetching
- [ ] Test data import
- [ ] Verify duplicate detection

### Production:
- [ ] Get production credentials from Setu
- [ ] Replace test credentials
- [ ] Add error monitoring
- [ ] Set up logging
- [ ] Create user documentation

---

## 🎯 **Next Immediate Steps**

Run these commands RIGHT NOW:

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# 1. Deploy all Edge Functions
supabase functions deploy setu-create-consent
supabase functions deploy setu-check-consent
supabase functions deploy setu-create-session
supabase functions deploy setu-get-session

# 2. Set secrets
supabase secrets set SETU_CLIENT_ID="d70f2b6c-9791-4e12-b62f-5a7998068525"
supabase secrets set SETU_CLIENT_SECRET="Pl2NlWeXDh0bjxaq7WhLosLFklKXhffI"
supabase secrets set SETU_BASE_URL="https://fiu-uat.setu.co/api"

# 3. Verify secrets
supabase secrets list

# 4. Test Edge Function
supabase functions invoke setu-create-consent --method POST \
  --body '{"consentRequest":{"Detail":{}},"userId":"test"}'
```

---

**Ready to start? Let me know if you want me to guide you through the deployment!** 🚀

