# Database Configuration & Connection Guide

## 🔐 Secure Credential Storage

Your database credentials are now securely stored and will never be committed to Git!

### Files Created:
- **`config/database.env`** - Your actual credentials (Git ignored) ✅
- **`config/database.env.example`** - Template for others (Git tracked)
- **`scripts/db-connect.sh`** - Database connection helper
- **`scripts/quick-connect.sh`** - Quick access commands

---

## 🚀 Quick Start

### Option 1: Use Quick Connect Script (Easiest)

```bash
# Connect to database interactively
./scripts/quick-connect.sh connect

# Run verification
./scripts/quick-connect.sh verify

# Upload SQL file
./scripts/quick-connect.sh upload scripts/upload-transactions-october.sql

# Run a query
./scripts/quick-connect.sh query 'SELECT COUNT(*) FROM accounts_real;'
```

### Option 2: Use Helper Functions

```bash
# Source the helper script
source scripts/db-connect.sh

# Now you can use these functions:
db_connect                              # Interactive connection
db_run_file scripts/final-verification.sql   # Run SQL file
db_query 'SELECT * FROM accounts_real;'      # Run query
```

### Option 3: Manual Connection (If needed)

```bash
# Load environment variables
source config/database.env

# Connect
export PATH="$PSQL_PATH:$PATH"
export PGPASSWORD="$SUPABASE_DB_PASSWORD"
psql -h "$SUPABASE_DB_HOST" -p "$SUPABASE_DB_PORT" -d "$SUPABASE_DB_NAME" -U "$SUPABASE_DB_USER"
```

---

## 📋 Configuration File Details

### Location: `config/database.env`

```bash
# Database Connection
SUPABASE_DB_HOST=db.fzzbfgnmbchhmqepwmer.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=KO5wgsWET2KgAvwr

# User & Account IDs
USER_ID=6679ae58-a6fb-4d2f-8f23-dd7fafe973d9
ICICI_ACCOUNT_ID=fd551095-58a9-4f12-b00e-2fd182e68403
IDFC_ACCOUNT_ID=328c756a-b05e-4925-a9ae-852f7fb18b4e
# ... more account IDs
```

### ✅ Security Features:
- ✅ File is in `.gitignore` - won't be committed
- ✅ Password stored once, used everywhere
- ✅ No hardcoded credentials in scripts
- ✅ Example file provided for team members

---

## 🎯 Common Use Cases

### 1. Upload October Statement

```bash
# Create your upload script first: scripts/upload-transactions-october.sql
# Then run:
./scripts/quick-connect.sh upload scripts/upload-transactions-october.sql
```

### 2. Verify Data

```bash
./scripts/quick-connect.sh verify
```

### 3. Check Account Balances

```bash
./scripts/quick-connect.sh query "
  SELECT name, current_balance, institution 
  FROM accounts_real 
  WHERE user_id = '$USER_ID' 
  ORDER BY current_balance DESC;
"
```

### 4. Check Transaction Count

```bash
./scripts/quick-connect.sh query "
  SELECT type, COUNT(*) as count, SUM(amount) as total
  FROM transactions_real 
  WHERE user_id = '$USER_ID' 
    AND date >= '2025-09-01'
  GROUP BY type;
"
```

### 5. Interactive Exploration

```bash
# Connect and explore manually
./scripts/quick-connect.sh connect

# Now you're in psql, can run any SQL:
\dt                    # List tables
\d transactions_real   # Describe table
SELECT * FROM accounts_real;
```

---

## 🔧 Setup for New Team Members

### Step 1: Copy Example File
```bash
cp config/database.env.example config/database.env
```

### Step 2: Fill in Your Credentials
Edit `config/database.env` with your:
- Supabase host
- Database password
- User ID
- Account IDs

### Step 3: Test Connection
```bash
./scripts/quick-connect.sh connect
```

---

## 📚 Available Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_DB_HOST` | Database host | `db.xxx.supabase.co` |
| `SUPABASE_DB_PORT` | Port number | `5432` |
| `SUPABASE_DB_NAME` | Database name | `postgres` |
| `SUPABASE_DB_USER` | Username | `postgres` |
| `SUPABASE_DB_PASSWORD` | Password | Your secure password |
| `DATABASE_URL` | Full connection string | Complete URL |
| `PSQL_PATH` | PostgreSQL bin path | `/opt/homebrew/opt/postgresql@16/bin` |
| `USER_ID` | Your user UUID | `6679ae58-...` |
| `ICICI_ACCOUNT_ID` | ICICI account UUID | `fd551095-...` |
| `IDFC_ACCOUNT_ID` | IDFC account UUID | `328c756a-...` |

---

## 🛡️ Security Best Practices

### ✅ DO:
- ✅ Keep `config/database.env` secure
- ✅ Use the helper scripts
- ✅ Verify `.gitignore` includes `config/database.env`
- ✅ Share `database.env.example` with team
- ✅ Rotate passwords periodically

### ❌ DON'T:
- ❌ Commit `config/database.env` to Git
- ❌ Share passwords in plain text
- ❌ Hardcode credentials in scripts
- ❌ Use production credentials in development

---

## 🔍 Troubleshooting

### Problem: "database.env file not found"
**Solution:**
```bash
# Check if file exists
ls -la config/database.env

# If not, create from example
cp config/database.env.example config/database.env
# Then edit with your credentials
```

### Problem: "Permission denied"
**Solution:**
```bash
chmod +x scripts/db-connect.sh
chmod +x scripts/quick-connect.sh
```

### Problem: "psql: command not found"
**Solution:**
```bash
# Install PostgreSQL
brew install postgresql@16

# Update PSQL_PATH in config/database.env
PSQL_PATH=/opt/homebrew/opt/postgresql@16/bin
```

### Problem: "Password authentication failed"
**Solution:**
1. Verify password in Supabase Dashboard
2. Reset password if needed
3. Update `SUPABASE_DB_PASSWORD` in `config/database.env`

---

## 📖 Examples

### Example 1: Upload October Data
```bash
# 1. Create upload script with your data
nano scripts/upload-transactions-october.sql

# 2. Upload
./scripts/quick-connect.sh upload scripts/upload-transactions-october.sql

# 3. Verify
./scripts/quick-connect.sh verify
```

### Example 2: Quick Balance Check
```bash
source scripts/db-connect.sh
db_query "
  SELECT 
    name,
    current_balance,
    account_status
  FROM accounts_real 
  WHERE user_id = '$USER_ID'
  ORDER BY name;
"
```

### Example 3: Monthly Report
```bash
./scripts/quick-connect.sh query "
  WITH monthly_summary AS (
    SELECT 
      DATE_TRUNC('month', date) as month,
      type,
      COUNT(*) as txn_count,
      SUM(amount) as total_amount
    FROM transactions_real
    WHERE user_id = '$USER_ID'
      AND date >= '2025-01-01'
    GROUP BY 1, 2
  )
  SELECT 
    TO_CHAR(month, 'Month YYYY') as month,
    type,
    txn_count,
    total_amount
  FROM monthly_summary
  ORDER BY month DESC, type;
"
```

---

## ✅ You're All Set!

**No more typing credentials every time!** Just use:
- `./scripts/quick-connect.sh verify` for quick checks
- `./scripts/quick-connect.sh upload <file>` for uploads
- `source scripts/db-connect.sh` for advanced usage

**All credentials are safely stored in `config/database.env` and never committed to Git!** 🔐

