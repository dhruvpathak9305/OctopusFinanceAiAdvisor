# 📂 Scripts Directory

## 🎯 Files You'll Use

### 1. `chatgpt-bank-transform-prompt.md`
**Use:** Every month to convert bank CSV to JSON
- Copy entire prompt
- Paste to ChatGPT with your CSV
- Get JSON output with your user_id already set

### 2. `upload-bulk-transactions.sql`
**Use:** Every month to upload transformed JSON
- Open in Supabase SQL Editor
- Replace example JSON with ChatGPT output
- Run to upload transactions

### 3. `account-bank-mapping.json`
**Use:** Reference for your account IDs
- Already has your user_id and ICICI account_id
- Add other bank accounts as you create them

---

## 📋 Quick Workflow

```
1. Download bank CSV
   ↓
2. Use chatgpt-bank-transform-prompt.md with ChatGPT
   ↓
3. Get JSON output
   ↓
4. Use upload-bulk-transactions.sql in Supabase
   ↓
5. Done!
```

---

For complete setup instructions, see: `/EXECUTION_ORDER.md`
