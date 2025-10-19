# 🔐 Credentials & Connection Management

## ✅ Problem Solved!

**You asked:** "Why are we not saving these passwords or URL and SQL connections in some secrets files so that every time you are not asking me this?"

**Answer:** Done! Your credentials are now securely stored and automatically loaded! 🎉

---

## 📁 Files Created

### 1. **`config/database.env`** ✅
- **Contains:** All your database credentials and account IDs
- **Security:** Added to `.gitignore` - will NEVER be committed to Git
- **Usage:** Automatically loaded by all scripts

### 2. **`config/database.env.example`** ✅
- **Contains:** Template with placeholder values
- **Purpose:** For team members or future setup
- **Safe:** Can be committed to Git

### 3. **`scripts/db-connect.sh`** ✅
- **Purpose:** Helper script that loads credentials
- **Functions:** `db_connect`, `db_run_file`, `db_query`
- **Usage:** Source this file to use helper functions

### 4. **`scripts/quick-connect.sh`** ✅
- **Purpose:** Quick one-line commands for common tasks
- **No setup needed:** Just run and it works!
- **Examples below**

---

## 🚀 How to Use (Super Simple!)

### Quick Commands (No typing credentials!)

```bash
# Verify system status
./scripts/quick-connect.sh verify

# Connect to database interactively
./scripts/quick-connect.sh connect

# Upload a file
./scripts/quick-connect.sh upload scripts/upload-transactions-october.sql

# Run a query
./scripts/quick-connect.sh query 'SELECT COUNT(*) FROM accounts_real;'
```

**That's it!** No passwords, no hosts, no ports to remember! 🎯

---

## 📊 What's Stored in `config/database.env`

```bash
# Database Connection (Loaded automatically)
SUPABASE_DB_HOST=db.fzzbfgnmbchhmqepwmer.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=KO5wgsWET2KgAvwr

# User ID (Your main user)
USER_ID=6679ae58-a6fb-4d2f-8f23-dd7fafe973d9

# All Account IDs (For easy reference)
ICICI_ACCOUNT_ID=fd551095-58a9-4f12-b00e-2fd182e68403
IDFC_ACCOUNT_ID=328c756a-b05e-4925-a9ae-852f7fb18b4e
AXIS_ACCOUNT_ID=0de24177-a088-4453-bf59-9b6c79946a5d
HDFC_ACCOUNT_ID=c5b2eb82-1159-4710-8d5d-de16ee0e6233
KOTAK_ACCOUNT_ID=db0683f0-4a26-45bf-8943-98755f6f7aa2
KOTAK_JOINT_ACCOUNT_ID=f288c939-4ba1-4bd4-abd0-31951e19ee08
JUPITER_ACCOUNT_ID=67f0dcb5-f0a7-41c9-855d-a22acdf8b59e
```

---

## 🔒 Security Features

### ✅ What We Did:
1. **Added to `.gitignore`** - Your credentials will NEVER be pushed to Git
2. **Secure file location** - In `config/` directory
3. **Example file provided** - Team members can set up their own
4. **Password hidden in output** - Shows `**********` instead of actual password
5. **Environment variables** - Not hardcoded in scripts

### ✅ Git Status:
```
config/database.env         ← YOUR CREDENTIALS (Git ignored ✅)
config/database.env.example ← TEMPLATE (Git tracked ✅)
```

---

## 📖 Usage Examples

### Example 1: Quick Verification
```bash
./scripts/quick-connect.sh verify
```
**Output:**
```
✅ Loading environment variables from config/database.env...
✅ Environment variables loaded successfully
📊 Database Connection Info:
   Host: db.fzzbfgnmbchhmqepwmer.supabase.co
   Password: ********** (hidden)
🎉 SYSTEM READY FOR OCTOBER UPLOAD!
```

### Example 2: Upload October Data
```bash
# First create your upload file
nano scripts/upload-transactions-october.sql

# Then upload (one command, no credentials needed!)
./scripts/quick-connect.sh upload scripts/upload-transactions-october.sql
```

### Example 3: Quick Balance Check
```bash
./scripts/quick-connect.sh query "
  SELECT name, current_balance 
  FROM accounts_real 
  WHERE user_id = '$USER_ID'
  ORDER BY current_balance DESC;
"
```

### Example 4: Interactive Session
```bash
# Connect interactively
./scripts/quick-connect.sh connect

# Now in psql, explore freely:
SELECT * FROM accounts_real;
SELECT COUNT(*) FROM transactions_real;
\q  # to quit
```

---

## 🎯 Common Workflows

### Daily Verification
```bash
./scripts/quick-connect.sh verify
```

### Monthly Upload
```bash
# 1. Prepare data file
# 2. Upload
./scripts/quick-connect.sh upload scripts/upload-transactions-october.sql
# 3. Verify
./scripts/quick-connect.sh verify
```

### Quick Checks
```bash
# Check accounts
./scripts/quick-connect.sh query "SELECT * FROM accounts_real;"

# Check latest transactions
./scripts/quick-connect.sh query "
  SELECT * FROM transactions_real 
  ORDER BY created_at DESC LIMIT 10;
"
```

---

## 🔧 Advanced Usage

### Using Helper Functions

```bash
# Load helper functions
source scripts/db-connect.sh

# Use functions directly
db_connect                              # Interactive connection
db_run_file scripts/final-verification.sql   # Run file
db_query "SELECT COUNT(*) FROM accounts_real;" # Run query
```

### Environment Variables Available

After sourcing `db-connect.sh`, you have access to:
- `$USER_ID` - Your user ID
- `$ICICI_ACCOUNT_ID` - ICICI account ID
- `$IDFC_ACCOUNT_ID` - IDFC account ID
- All other account IDs
- All database connection variables

---

## 📝 Updating Credentials

### If Password Changes:
```bash
# 1. Edit the file
nano config/database.env

# 2. Update SUPABASE_DB_PASSWORD
SUPABASE_DB_PASSWORD=your_new_password

# 3. Save and test
./scripts/quick-connect.sh verify
```

### If Adding New Accounts:
```bash
# 1. Edit the file
nano config/database.env

# 2. Add new account ID
NEW_ACCOUNT_ID=your-new-account-uuid

# 3. Save - it's automatically available
echo $NEW_ACCOUNT_ID
```

---

## 🆘 Troubleshooting

### Problem: "database.env file not found"
```bash
# Check if it exists
ls -la config/database.env

# If missing, create from example
cp config/database.env.example config/database.env
nano config/database.env  # Fill in your values
```

### Problem: "Permission denied"
```bash
chmod +x scripts/db-connect.sh
chmod +x scripts/quick-connect.sh
```

### Problem: Variables not loading
```bash
# Source the script properly
source scripts/db-connect.sh

# Or use quick-connect (it sources automatically)
./scripts/quick-connect.sh verify
```

---

## ✅ Benefits

### Before (Manual Every Time):
```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export PGPASSWORD='KO5wgsWET2KgAvwr'
psql -h db.fzzbfgnmbchhmqepwmer.supabase.co -p 5432 -d postgres -U postgres -f scripts/verify.sql
```

### After (One Simple Command):
```bash
./scripts/quick-connect.sh verify
```

**That's a huge improvement!** 🚀

---

## 📚 Related Documentation

- **`DATABASE_SETUP_GUIDE.md`** - Comprehensive setup guide
- **`ACCOUNT_MAPPING.json`** - All account details
- **`SYSTEM_STATUS_SUMMARY.md`** - Current system status
- **`OCTOBER_UPLOAD_GUIDE.md`** - Guide for next upload

---

## 🎉 You're All Set!

**No more typing credentials!** Everything is automated and secure.

### Quick Reference:
```bash
# Verify
./scripts/quick-connect.sh verify

# Upload
./scripts/quick-connect.sh upload <file>

# Connect
./scripts/quick-connect.sh connect

# Query
./scripts/quick-connect.sh query '<sql>'
```

**Your credentials are secure, and you'll never be asked to enter them again!** 🔐✅

---

*Created: October 19, 2025*  
*Status: ✅ Active & Secure*

