# 🔐 Script Authentication - Quick Start

Your scripts need authentication to access the database. Here's how to fix it in **2 minutes**:

---

## 🚀 Super Quick Start

```bash
# 1. Run the setup helper
./scripts/setup-service-key.sh

# 2. Populate balance history
node scripts/populate-with-service-key.js

# 3. Refresh your app - done! ✅
```

That's it! Your accounts card will now show:
- ✅ Real historical chart (12 months)
- ✅ Actual MoM growth percentage
- ✅ No more "No historical data"

---

## 📋 What the Setup Script Does

The interactive setup (`./scripts/setup-service-key.sh`) will:

1. **Open Supabase Dashboard** in your browser
2. **Prompt you** to copy your service_role key
3. **Save it securely** to `config/database.env`
4. **Update .gitignore** to keep it secret
5. **Show success message** when ready

---

## 🔑 Manual Setup (if needed)

If you prefer to do it manually:

### Step 1: Get Service Role Key

1. Go to: https://supabase.com/dashboard/project/fzzbfgnmbchhmqepwmer/settings/api
2. Find "service_role" under "Project API keys"
3. Click the eye icon to reveal it
4. Copy the entire key

### Step 2: Add to Config

Open `config/database.env` and add:

```bash
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here"
```

### Step 3: Run Script

```bash
node scripts/populate-with-service-key.js
```

---

## ❓ Why Do I Need This?

**The Problem**:
- Your database has Row Level Security (RLS) enabled
- RLS says: "Users can only see their own data"
- Scripts use anon key → not authenticated → RLS blocks access
- Result: "No accounts found" error

**The Solution**:
- Service role key = admin access
- Bypasses RLS (like sudo for your database)
- Scripts can now access your data
- Balance history gets populated correctly

---

## 🔒 Is This Safe?

**Yes**, as long as you:
- ✅ Keep service key in `config/database.env`
- ✅ Ensure `config/database.env` is in `.gitignore`
- ✅ Never commit it to git
- ✅ Never use it in client-side code
- ✅ Only use it in server-side scripts

**Think of it like your database password** - powerful but safe when kept secret.

---

## 📊 Expected Output

After running the script, you'll see (example with 3 accounts, your actual count may vary):

```
🔄 Populating Balance History (Authenticated with Service Role)...
📊 This will process ALL accounts in accounts_real table

📊 Step 1: Fetching all accounts (bypassing RLS)...
✅ Found 3 accounts in database:
   - HDFC Bank: ₹50,780
   - ICICI Bank: ₹133,850
   - IDFC FIRST Bank: ₹112,000

...

✅ SUCCESS! Balance history populated

📈 What happens next:
  • Historical chart will now display on Accounts card
  • Shows last 12 months of balance trends
  • MoM growth percentage is calculated from real data

🔄 Refresh your app to see the changes!
```

---

## 🐛 Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY not found"
**Fix**: Run `./scripts/setup-service-key.sh` first

### "No accounts found"
**Fix**: You're still using anon key - check your `config/database.env`

### "JWT expired" or "Invalid JWT"
**Fix**: Copy the correct service_role key from Supabase Dashboard

### Chart still shows "No historical data"
**Fix**: Check if data was inserted:
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM account_balance_history_real;
```

---

## 📚 Full Documentation

For detailed explanations, see:

- **`AUTHENTICATION_SOLUTION_COMPLETE.md`** - Complete guide
- **`docs/SCRIPT_AUTHENTICATION_GUIDE.md`** - All auth methods
- **`docs/BALANCE_HISTORY_AND_MOM_CALCULATION.md`** - How it works

---

## ✅ Checklist

Before you start:
- [ ] I have access to Supabase Dashboard
- [ ] I can copy the service_role key
- [ ] My `.gitignore` includes `config/database.env`

After setup:
- [ ] Ran `./scripts/setup-service-key.sh`
- [ ] Service key saved to `config/database.env`
- [ ] Ran `node scripts/populate-with-service-key.js`
- [ ] Script completed successfully
- [ ] Refreshed app
- [ ] Accounts card shows historical chart
- [ ] Accounts card shows real MoM growth %

---

## 🎯 Summary

| What | Command |
|------|---------|
| **Setup** | `./scripts/setup-service-key.sh` |
| **Populate** | `node scripts/populate-with-service-key.js` |
| **Check** | Refresh app, look at Accounts card |

**Total time**: 2-3 minutes  
**Difficulty**: Easy  
**Result**: Working historical charts and MoM growth! 🎉

---

**Questions?** Read `AUTHENTICATION_SOLUTION_COMPLETE.md` for full details.

