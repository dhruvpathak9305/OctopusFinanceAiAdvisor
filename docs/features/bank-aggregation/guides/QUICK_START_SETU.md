# 🚀 Setu Integration - Quick Start (Your Next 15 Minutes)

## ⚠️ **Current Status**

✅ **ALL CODE IS READY!**  
⏳ **Waiting for:** Supabase CLI installation & deployment

---

## 📋 **3 Steps to Complete Phase 1**

### **Step 1: Install Supabase CLI (2 minutes)**

```bash
# For macOS (Recommended):
brew install supabase/tap/supabase

# Verify installation:
supabase --version
```

**Don't have Homebrew?**
```bash
# Install Homebrew first:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

### **Step 2: Deploy Everything (10 minutes)**

```bash
# Navigate to project
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Login to Supabase
supabase login

# Link your project (get YOUR_PROJECT_REF from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all 4 Edge Functions
supabase functions deploy setu-create-consent
supabase functions deploy setu-check-consent
supabase functions deploy setu-create-session
supabase functions deploy setu-get-session

# Set credentials (secure, server-side)
supabase secrets set SETU_CLIENT_ID="d70f2b6c-9791-4e12-b62f-5a7998068525"
supabase secrets set SETU_CLIENT_SECRET="Pl2NlWeXDh0bjxaq7WhLosLFqlKXhffI"
supabase secrets set SETU_BASE_URL="https://fiu-uat.setu.co/api"

# Run database migration
supabase db push
```

---

### **Step 3: Verify (3 minutes)**

```bash
# Check functions deployed
supabase functions list
# Should show: setu-create-consent, setu-check-consent, setu-create-session, setu-get-session

# Check secrets set
supabase secrets list
# Should show: SETU_CLIENT_ID, SETU_CLIENT_SECRET, SETU_BASE_URL

# Test a function
supabase functions invoke setu-create-consent --method POST \
  --body '{"consentRequest":{"Detail":{}},"userId":"test"}'
# Should return: {"success":true,...}
```

---

## ⚡ **Alternative: Deploy Without CLI (Dashboard Method)**

If CLI installation fails, deploy manually via Supabase Dashboard:

### **1. Deploy Edge Functions:**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/functions
2. Click "Create a new function"
3. Copy code from each function file and deploy:
   - `supabase/functions/setu-create-consent/index.ts`
   - `supabase/functions/setu-check-consent/index.ts`
   - `supabase/functions/setu-create-session/index.ts`
   - `supabase/functions/setu-get-session/index.ts`

### **2. Set Secrets:**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/vault
2. Click "New secret" for each:
   - `SETU_CLIENT_ID` = `d70f2b6c-9791-4e12-b62f-5a7998068525`
   - `SETU_CLIENT_SECRET` = `Pl2NlWeXDh0bjxaq7WhLosLFqlKXhffI`
   - `SETU_BASE_URL` = `https://fiu-uat.setu.co/api`

### **3. Run Migration:**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy entire content of `database/migrations/20250124_bank_connections.sql`
3. Paste and click "Run"

---

## 🎯 **What You'll Have After This**

✅ **4 Edge Functions** deployed on Supabase  
✅ **3 Secrets** configured (secure, server-side)  
✅ **2 Database Tables** created (bank_connections, bank_sync_logs)  
✅ **Direct bank integration** like Google Pay/PhonePe!  

---

## 📊 **What You Can Fetch**

Once deployed, you can automatically fetch:

### **Bank Data:**
- ✅ Current balance (real-time)
- ✅ All transactions (12 months history)
- ✅ Account details (IFSC, branch, type)

### **Credit Cards:**
- ✅ Outstanding balance
- ✅ Credit limit & available credit
- ✅ All transactions with merchants

### **Investments:**
- ✅ Mutual funds (NAV, units, P&L)
- ✅ Stocks (holdings, current value)
- ✅ NPS (corpus, contributions)
- ✅ Fixed deposits (maturity, interest)

### **Others:**
- ✅ Insurance policies
- ✅ Recurring deposits
- ✅ PPF/EPF accounts

---

## 🔍 **Troubleshooting**

### "command not found: supabase"
→ Install CLI using brew command above

### "Not logged in"
→ Run `supabase login`

### "Project not found"
→ Run `supabase link --project-ref YOUR_PROJECT_REF`

### "Function deployment failed"
→ Check logs: `supabase functions logs setu-create-consent`

---

## 📚 **Full Documentation**

For detailed info, see:
- **DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **PHASE_1_COMPLETION_STATUS.md** - What's done, what's pending
- **SETU_CREDENTIALS.md** - Credentials management
- **docs/features/bank-aggregation/INTEGRATION_PLAN.md** - Full integration plan

---

## 🎉 **After Deployment**

Once Phase 1 is complete, you can:

1. **Test with Setu Sandbox** - Use test bank accounts
2. **Build UI** - Create bank connection screen
3. **Fetch Transactions** - Start importing real data
4. **Go to Production** - Get real Setu credentials

---

**Total Time:** 15 minutes  
**Status:** Ready to deploy  
**Next Step:** Install Supabase CLI and run commands above

