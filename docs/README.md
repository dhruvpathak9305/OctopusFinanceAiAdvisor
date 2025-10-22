# 📚 Documentation Index

Welcome to the OctopusFinancer documentation directory.

## 🚀 Quick Start

**New to the project?** Start here:
1. [../README.md](../README.md) - Project overview
2. [../SETUP.md](../SETUP.md) - Setup instructions  
3. [../START_HERE.md](../START_HERE.md) - Getting started guide

## 📂 Documentation Structure

### 📘 [Guides](./guides/) - 4 Essential Guides
- [DATABASE_SETUP_GUIDE.md](./guides/DATABASE_SETUP_GUIDE.md) - Database setup
- [authentication-setup.md](./guides/authentication-setup.md) - Service key setup  
- [TRANSACTION_UPLOAD_MASTER_GUIDE.md](./guides/TRANSACTION_UPLOAD_MASTER_GUIDE.md) - Complete upload guide
- [transaction-uploads-quick-start.md](./guides/transaction-uploads-quick-start.md) - Quick reference

### 📕 [Reference](./reference/)
Quick reference materials and lookup tables.

### 📗 [Features](./features/)
Feature-specific documentation:
- [Dashboard](./features/dashboard/) - Financial dashboard
- [Net Worth](./features/net-worth/) - Net worth tracking

### 📤 [Uploads](./uploads/)
Transaction upload documentation by bank:
- [HDFC](./uploads/HDFC/) - HDFC Bank uploads by month
- [ICICI](./uploads/ICICI/) - ICICI Bank uploads by month
- [IDFC](./uploads/IDFC/) - IDFC Bank uploads by month
- [Axis](./uploads/Axis/), [Jupiter](./uploads/Jupiter/), [Kotak](./uploads/Kotak/)
- [Templates](./uploads/_templates/) - Upload templates

### ✅ [Verification](./verification/)
Data verification scripts and reports.

### 📊 [Budget Progress](./budget-progress/)
Budget and progress tracking.

### 💸 [Expense Splitting](./expense-splitting/)
Group expense splitting system.

## 🗂️ Related Resources

- **[Scripts](../scripts/README.md)** - All available scripts
- **[Database](../database/)** - Database functions, migrations, triggers
- **[Services](../services/)** - Backend service layer

## 🎯 Common Tasks

### Transaction Uploads
1. Check [uploads/](./uploads/) for bank-specific guides
2. Use [templates](./uploads/_templates/)
3. Run verification scripts from [../scripts/verification/](../scripts/verification/)

### Balance & MoM Issues
```bash
# Check MoM calculation
node scripts/check-mom-calculation.js

# Force balance sync
node scripts/force-balance-sync.js

# Populate history
node scripts/populate-with-service-key.js
```

### Transfer Issues
- Review [verification/](./verification/) for transfer checks
- Check database functions in [../database/functions/](../database/functions/)

---

**Last Updated:** October 21, 2025
