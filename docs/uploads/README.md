# 📤 Upload Documentation

**Purpose:** Monthly bank statement upload documentation organized by bank and month

---

## 📁 Directory Structure

```
uploads/
├── README.md (this file)
├── _templates/               # Templates for new uploads
│   ├── UPLOAD_GUIDE_TEMPLATE.md
│   ├── QUALITY_CHECK_TEMPLATE.md
│   └── SUCCESS_SUMMARY_TEMPLATE.md
│
├── ICICI/                    # ICICI Bank uploads
│   ├── 2025-09-September/
│   ├── 2025-10-October/
│   └── YYYY-MM-Month/
│
├── HDFC/                     # HDFC Bank uploads
│   └── YYYY-MM-Month/
│
├── Axis/                     # Axis Bank uploads
│   └── YYYY-MM-Month/
│
├── IDFC/                     # IDFC FIRST Bank uploads
│   └── YYYY-MM-Month/
│
├── Kotak/                    # Kotak Mahindra uploads
│   └── YYYY-MM-Month/
│
└── Jupiter/                  # Jupiter uploads
    └── YYYY-MM-Month/
```

---

## 🏦 Banks

### Active Accounts

| Bank | Folder | Account ID | Status |
|------|--------|------------|--------|
| **ICICI Bank** | `ICICI/` | `fd551095-58a9-4f12-b00e-2fd182e68403` | ✅ Active - Has uploads |
| **HDFC Bank** | `HDFC/` | `c5b2eb82-1159-4710-8d5d-de16ee0e6233` | ⏳ Ready for uploads |
| **Axis Bank** | `Axis/` | `0de24177-a088-4453-bf59-9b6c79946a5d` | ⏳ Ready for uploads |
| **IDFC FIRST** | `IDFC/` | `328c756a-b05e-4925-a9ae-852f7fb18b4e` | ⏳ Ready for uploads |
| **Kotak Mahindra** | `Kotak/` | `db0683f0-4a26-45bf-8943-98755f6f7aa2` | ⏳ Ready for uploads |
| **Jupiter** | `Jupiter/` | `67f0dcb5-f0a7-41c9-855d-a22acdf8b59e` | ⏳ Ready for uploads |

---

## 📋 Upload Folder Naming Convention

### Format
```
[Bank]/YYYY-MM-MonthName/
```

### Examples
```
ICICI/2025-11-November/
HDFC/2025-10-October/
Axis/2025-12-December/
IDFC/2026-01-January/
```

### Why This Format?
- ✅ **Year first** - Easy to sort chronologically
- ✅ **Month number** - Correct ordering (01-12)
- ✅ **Month name** - Human-readable
- ✅ **Consistent** - Works across all banks

---

## 📄 Files in Each Month Folder

### Standard Files (3 files minimum)

1. **`YYYY-MM-MonthName_UPLOAD_GUIDE.md`**
   - Complete upload process
   - Transaction details
   - Verification steps

2. **`YYYY-MM-MonthName_QUALITY_CHECK.md`**
   - Pre-upload verification
   - Data quality checks
   - Balance verification

3. **`YYYY-MM-MonthName_SUCCESS_SUMMARY.md`**
   - Upload results
   - Final verification
   - Statistics

### Example for October 2025 ICICI
```
ICICI/2025-10-October/
├── 2025-10-October_UPLOAD_GUIDE.md
├── 2025-10-October_QUALITY_CHECK.md
└── 2025-10-October_SUCCESS_SUMMARY.md
```

---

## 🎯 Creating New Upload Documentation

### Step 1: Create Month Folder
```bash
# Pattern: [Bank]/YYYY-MM-MonthName/
mkdir -p docs/uploads/HDFC/2025-11-November
```

### Step 2: Copy Templates
```bash
cd docs/uploads/HDFC/2025-11-November

# Copy and rename templates
cp ../../_templates/UPLOAD_GUIDE_TEMPLATE.md \
   2025-11-November_UPLOAD_GUIDE.md

cp ../../_templates/QUALITY_CHECK_TEMPLATE.md \
   2025-11-November_QUALITY_CHECK.md

cp ../../_templates/SUCCESS_SUMMARY_TEMPLATE.md \
   2025-11-November_SUCCESS_SUMMARY.md
```

### Step 3: Fill in Details
- Replace placeholders with actual data
- Update transaction counts
- Add verification results

### Step 4: Update Status
Update `docs/reference/UPLOAD_STATUS.md` with new upload

---

## 📊 Upload History

### ICICI Bank
| Month | Transactions | Status | Documentation |
|-------|--------------|--------|---------------|
| **Oct 2025** | 10 | ✅ Complete | `ICICI/2025-10-October/` |
| **Sept 2025** | 10 | ✅ Complete | `ICICI/2025-09-September/` |

### Other Banks
| Bank | Uploads | Status |
|------|---------|--------|
| HDFC | 0 | ⏳ Awaiting statements |
| Axis | 0 | ⏳ Awaiting statements |
| IDFC | 0 | ⏳ Awaiting statements |
| Kotak | 0 | ⏳ Awaiting statements |
| Jupiter | 0 | ⏳ Awaiting statements |

---

## 🔍 Finding Upload Documentation

### By Bank
```bash
# All ICICI uploads
ls docs/uploads/ICICI/

# All HDFC uploads
ls docs/uploads/HDFC/
```

### By Month
```bash
# Find October 2025 uploads
find docs/uploads -name "*2025-10-October*"

# Find all November uploads
find docs/uploads -name "*2025-11-November*"
```

### Latest Upload
```bash
# Latest for any bank
ls -lt docs/uploads/*/202* | head -3
```

---

## ✅ Quality Standards

### Each Upload Should Include

**Upload Guide:**
- ✅ Transaction data formatted
- ✅ Account IDs verified
- ✅ Upload script created
- ✅ Pre-upload verification
- ✅ Post-upload verification

**Quality Check:**
- ✅ Transaction count verified
- ✅ Balance progression checked
- ✅ No duplicates found
- ✅ All references unique
- ✅ Account IDs correct

**Success Summary:**
- ✅ Upload results documented
- ✅ Final verification complete
- ✅ Statistics recorded
- ✅ Issues (if any) noted
- ✅ Next steps identified

---

## 🎯 Best Practices

### Naming Consistency
- ✅ Always use format: `YYYY-MM-MonthName`
- ✅ Use full month names (January, not Jan)
- ✅ Use 2-digit months (01, not 1)
- ✅ Match folder and file names

### Documentation Completeness
- ✅ Create all three standard files
- ✅ Document before upload (guide + quality check)
- ✅ Document after upload (success summary)
- ✅ Include verification screenshots if helpful

### Organization
- ✅ One folder per bank per month
- ✅ Keep all month docs together
- ✅ Update UPLOAD_STATUS.md after each upload
- ✅ Archive old uploads (keep for reference)

---

## 🔗 Related Documentation

- **Upload Guide:** `../guides/TRANSACTION_UPLOAD_MASTER_GUIDE.md`
- **Quick Start:** `../../QUICK_START_UPLOADS.md`
- **Upload Status:** `../reference/UPLOAD_STATUS.md`
- **Account Mapping:** `../../ACCOUNT_MAPPING.json`

---

## 📝 Templates

### Location
All templates are in `_templates/` directory.

### Available Templates
1. `UPLOAD_GUIDE_TEMPLATE.md` - Upload process template
2. `QUALITY_CHECK_TEMPLATE.md` - Quality verification template
3. `SUCCESS_SUMMARY_TEMPLATE.md` - Success summary template

### Usage
Copy templates to your month folder and fill in the details.

---

## 🎯 Quick Reference

### For New Month Upload
```bash
# 1. Create folder
mkdir docs/uploads/[BANK]/YYYY-MM-MonthName

# 2. Copy templates
cp docs/uploads/_templates/*.md docs/uploads/[BANK]/YYYY-MM-MonthName/

# 3. Rename templates
cd docs/uploads/[BANK]/YYYY-MM-MonthName
mv UPLOAD_GUIDE_TEMPLATE.md YYYY-MM-MonthName_UPLOAD_GUIDE.md
mv QUALITY_CHECK_TEMPLATE.md YYYY-MM-MonthName_QUALITY_CHECK.md
mv SUCCESS_SUMMARY_TEMPLATE.md YYYY-MM-MonthName_SUCCESS_SUMMARY.md

# 4. Fill in details and upload!
```

---

**Organization:** ✅ By Bank → By Month  
**Naming:** ✅ Consistent YYYY-MM-MonthName format  
**Status:** ✅ Production Ready  
**Banks Ready:** 6 (ICICI, HDFC, Axis, IDFC, Kotak, Jupiter)

---

**Last Updated:** October 20, 2025  
**Version:** 2.0 - Bank-Organized Structure

