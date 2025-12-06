# 🚀 Setu Integration - Deployment Guide

## ✅ Current Status

**Files Created:**
- ✅ 4 Supabase Edge Functions (setu-*)
- ✅ Database migration (20250124_bank_connections.sql)
- ✅ Service layer (bankAggregationService.ts)
- ✅ Documentation complete

**Next Step:** Install Supabase CLI and deploy

---

## 📋 Step 1: Install Supabase CLI

### For macOS (Using Homebrew - Recommended):

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Supabase CLI
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### Alternative: Using npm

```bash
npm install -g supabase
```

### Alternative: Download Binary Directly

```bash
# Download latest release
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_darwin_amd64.tar.gz -o supabase.tar.gz

# Extract
tar -xzf supabase.tar.gz

# Move to PATH
sudo mv supabase /usr/local/bin/

# Verify
supabase --version
```

---

## 📋 Step 2: Login to Supabase

```bash
# Login with your Supabase account
supabase login

# This will open a browser window to authenticate
# Or you can use access token directly:
# supabase login --token YOUR_ACCESS_TOKEN
```

**Get your access token:**
1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new token
3. Copy and use it

---

## 📋 Step 3: Link Your Project

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Find your project ref at:
# https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general
```

---

## 📋 Step 4: Deploy Edge Functions

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Deploy all Setu functions
supabase functions deploy setu-create-consent
supabase functions deploy setu-check-consent
supabase functions deploy setu-create-session
supabase functions deploy setu-get-session

# Optional: Deploy with no verification
supabase functions deploy setu-create-consent --no-verify-jwt
```

---

## 📋 Step 5: Set Environment Secrets

```bash
# Set Setu credentials (keeps them secure server-side)
supabase secrets set SETU_CLIENT_ID="d70f2b6c-9791-4e12-b62f-5a7998068525"
supabase secrets set SETU_CLIENT_SECRET="Pl2NlWeXDh0bjxaq7WhLosLFqlKXhffI"
supabase secrets set SETU_BASE_URL="https://fiu-uat.setu.co/api"

# Verify secrets are set
supabase secrets list
```

---

## 📋 Step 6: Run Database Migration

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Option A: Using Supabase CLI (Recommended)
supabase db push

# Option B: Using psql directly
# Get connection string from Supabase dashboard
psql "postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST].supabase.co:5432/postgres" \
  -f database/migrations/20250124_bank_connections.sql

# Option C: Via Supabase Dashboard
# Go to SQL Editor → paste contents of migration file → Run
```

---

## 📋 Step 7: Test Deployment

```bash
# Test Edge Function
supabase functions invoke setu-create-consent \
  --method POST \
  --body '{
    "consentRequest": {
      "Detail": {
        "consentStart": "2025-01-24T00:00:00.000Z",
        "consentExpiry": "2026-01-24T23:59:59.999Z",
        "Customer": {"id": "test@example.com"},
        "FIDataRange": {
          "from": "2024-01-01T00:00:00.000Z",
          "to": "2025-01-24T23:59:59.999Z"
        },
        "consentMode": "STORE",
        "consentTypes": ["TRANSACTIONS"],
        "fetchType": "ONETIME",
        "DataConsumer": {"id": "octopusfinance"},
        "Purpose": {"code": "101", "text": "Testing"},
        "fiTypes": ["DEPOSIT"]
      }
    },
    "userId": "test-user-123"
  }'

# Should return: {"success": true, "id": "...", "url": "...", "status": "PENDING"}
```

---

## 🔍 Verify Everything is Working

### Check Edge Functions Deployed:

```bash
# List all functions
supabase functions list

# Should show:
# - setu-create-consent
# - setu-check-consent
# - setu-create-session
# - setu-get-session
```

### Check Secrets Set:

```bash
# List secrets (values hidden)
supabase secrets list

# Should show:
# - SETU_CLIENT_ID
# - SETU_CLIENT_SECRET
# - SETU_BASE_URL
```

### Check Database Tables:

```bash
# Connect to database
supabase db remote connect

# In psql prompt:
# \dt bank*
# Should show: bank_connections, bank_sync_logs
```

---

## 📊 Alternative: Deploy via Supabase Dashboard

If CLI doesn't work, you can deploy manually:

### 1. Edge Functions (Dashboard Method):

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/functions
2. Click "Create a new function"
3. For each function (setu-create-consent, etc.):
   - Name: `setu-create-consent`
   - Paste code from `supabase/functions/setu-create-consent/index.ts`
   - Click "Deploy function"
4. Repeat for all 4 functions

### 2. Secrets (Dashboard Method):

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/vault
2. Click "New secret"
3. Add each secret:
   - Name: `SETU_CLIENT_ID`, Value: `d70f2b6c-9791-4e12-b62f-5a7998068525`
   - Name: `SETU_CLIENT_SECRET`, Value: `Pl2NlWeXDh0bjxaq7WhLosLFqlKXhffI`
   - Name: `SETU_BASE_URL`, Value: `https://fiu-uat.setu.co/api`

### 3. Database Migration (Dashboard Method):

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy entire contents of `database/migrations/20250124_bank_connections.sql`
3. Paste in SQL Editor
4. Click "Run"
5. Verify: Check "Table Editor" → should see `bank_connections` and `bank_sync_logs`

---

## ✅ Phase 1 Completion Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] 4 Edge Functions deployed
- [ ] 3 Secrets set
- [ ] Database migration run
- [ ] Test function invoked successfully
- [ ] Verified tables created
- [ ] `.gitignore` updated

---

## 🐛 Troubleshooting

### "Command not found: supabase"
**Solution:** Install Supabase CLI using one of the methods above

### "Not logged in"
**Solution:** Run `supabase login` and authenticate

### "Project not linked"
**Solution:** Run `supabase link --project-ref YOUR_PROJECT_REF`

### "Function deployment failed"
**Solution:** Check function logs: `supabase functions logs setu-create-consent`

### "Secrets not working"
**Solution:** 
1. Verify secrets: `supabase secrets list`
2. Redeploy functions after setting secrets
3. Check Edge Function logs for errors

### "Database migration failed"
**Solution:**
1. Check if tables already exist
2. Try via SQL Editor in Supabase Dashboard
3. Check for syntax errors in migration file

---

## 📞 Need Help?

**Supabase CLI Issues:**
- Docs: https://supabase.com/docs/guides/cli
- GitHub: https://github.com/supabase/cli

**Setu Integration Issues:**
- Check: `docs/features/bank-aggregation/INTEGRATION_PLAN.md`
- Setu Docs: https://docs.setu.co/

---

## 🎯 What's Next After Phase 1?

Once deployment is complete:

**Phase 2: Test Integration (1-2 hours)**
- Test consent creation flow
- Test with Setu sandbox account
- Verify transaction fetching
- Check data import to database

**Phase 3: Build UI (2-3 hours)**
- Create BankConnectionSettings screen
- Add "Connect Bank" button
- Show connected accounts
- Manual sync functionality

**Phase 4: Production (1 week)**
- Get production Setu credentials
- Thorough testing with real banks
- Error handling & edge cases
- User documentation
- Launch! 🚀

---

**Current Status:** ✅ All files created, ready for deployment  
**Next Step:** Install Supabase CLI and run deployment commands  
**Time Required:** 15-30 minutes

