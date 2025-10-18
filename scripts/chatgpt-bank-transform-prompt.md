# 🏦 ChatGPT Bank Statement Transformation Prompt

## 📋 **Copy-Paste Prompt for ChatGPT**

```
You are helping me prepare my bank transactions for bulk upload into my Supabase database table `transactions_real`.

I'm providing you with a raw CSV/Excel bank statement downloaded from my bank.
Please convert it into a **JSON array** matching the exact schema required by my database.

---

## ✅ **Target JSON Schema (transactions_real table)**

Each transaction object should have the following structure:

```json
{
  "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
  "name": "Transaction Name/Title",
  "description": "Full bank narration/details (optional)",
  "amount": 1549.00,
  "date": "2025-09-12T00:00:00Z",
  "type": "expense",
  "source_account_type": "bank",
  "source_account_name": "ICICI Savings",
  "source_account_id": null,
  "destination_account_type": null,
  "destination_account_name": null,
  "destination_account_id": null,
  "category_id": null,
  "subcategory_id": null,
  "merchant": "Amazon",
  "icon": null,
  "is_recurring": false,
  "recurrence_pattern": null,
  "recurrence_end_date": null,
  "parent_transaction_id": null,
  "interest_rate": null,
  "loan_term_months": null,
  "is_credit_card": false,
  "metadata": {
    "bank_reference": "123456789",
    "original_description": "IMPS/UPI/Amazon Purchase",
    "upload_source": "chatgpt_bulk_upload",
    "upload_date": "2025-10-18"
  }
}
```

---

## 📊 **Field Specifications**

### **Required Fields** (MUST be present)

| Field                  | Type    | Description                                                     | Example Values                       |
| ---------------------- | ------- | --------------------------------------------------------------- | ------------------------------------ |
| `user_id`              | UUID    | My user ID (already set)                                        | `"6679ae58-a6fb-4d2f-8f23-dd7fafe973d9"` |
| `name`                 | String  | Short transaction title (max 50 chars recommended)              | `"Amazon Purchase"`, `"Salary Credit"` |
| `amount`               | Number  | **Always positive** (type determines debit/credit)              | `1549.00`, `75000.00`                |
| `type`                 | String  | Transaction type (see below)                                    | `"expense"`, `"income"`, `"transfer"` |
| `source_account_type`  | String  | Account type (see below)                                        | `"bank"`, `"credit_card"`, `"cash"`  |

### **Optional Fields** (Can be null or omitted)

| Field                      | Type    | Description                                    | Example Values                    |
| -------------------------- | ------- | ---------------------------------------------- | --------------------------------- |
| `description`              | String  | Full bank narration/details                    | `"UPI/Amazon/4012345678/Payment"` |
| `date`                     | ISO8601 | Transaction date in ISO format                 | `"2025-09-12T00:00:00Z"`          |
| `source_account_id`        | UUID    | Source account UUID (if known)                 | `"abc123..."`                     |
| `source_account_name`      | String  | Source account name                            | `"ICICI Savings Account"`         |
| `destination_account_id`   | UUID    | Destination account UUID (for transfers/income)| `"def456..."`                     |
| `destination_account_name` | String  | Destination account name                       | `"HDFC Current Account"`          |
| `destination_account_type` | String  | Destination account type (for transfers)       | `"bank"`, `"digital_wallet"`      |
| `merchant`                 | String  | Merchant/vendor name                           | `"Amazon"`, `"Swiggy"`, `"Zomato"`|
| `category_id`              | UUID    | Budget category UUID (leave null for now)      | `null`                            |
| `subcategory_id`           | UUID    | Budget subcategory UUID (leave null for now)   | `null`                            |
| `icon`                     | String  | Icon name (leave null)                         | `null`                            |
| `is_recurring`             | Boolean | Is this a recurring transaction?               | `false`                           |
| `recurrence_pattern`       | String  | Cron-like pattern (for recurring only)         | `null`                            |
| `recurrence_end_date`      | ISO8601 | End date for recurrence                        | `null`                            |
| `parent_transaction_id`    | UUID    | Parent transaction (for splits)                | `null`                            |
| `interest_rate`            | Number  | Interest rate (for loans)                      | `null`                            |
| `loan_term_months`         | Integer | Loan term in months                            | `null`                            |
| `is_credit_card`           | Boolean | Is this a credit card transaction?             | `false`                           |
| `metadata`                 | Object  | Additional data (see below)                    | `{...}`                           |

---

## 🔤 **Valid Values for Enums**

### Transaction Types (`type`)
- `"income"` - Money coming in (salary, refunds, etc.)
- `"expense"` - Money going out (purchases, bills, etc.)
- `"transfer"` - Moving money between own accounts
- `"loan"` - Taking a loan
- `"loan_repayment"` - Repaying a loan
- `"debt"` - Borrowing money
- `"debt_collection"` - Collecting borrowed money

### Account Types (`source_account_type` / `destination_account_type`)
- `"bank"` - Bank account
- `"credit_card"` - Credit card
- `"cash"` - Cash
- `"digital_wallet"` - UPI/PayTM/Google Pay/PhonePe
- `"investment"` - Investment account
- `"other"` - Other types

---

## 🧾 **Metadata Structure** (Optional but Recommended)

```json
"metadata": {
  "bank_reference": "Bank's transaction reference number",
  "original_description": "Original bank narration (unmodified)",
  "upload_source": "chatgpt_bulk_upload",
  "upload_date": "2025-10-18",
  "account_last_four": "1234",
  "balance_after_transaction": 52583.67,
  "bank_name": "ICICI",
  "statement_period": "September 2025"
}
```

---

## ⚙️ **Transformation Rules**

1. **Date Format**: Convert all dates to ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`)
2. **Amount**: Always use **positive numbers**. Use `type` field to indicate debit/credit
   - Debit/withdrawal → `type: "expense"`, `amount: 1500.00`
   - Credit/deposit → `type: "income"`, `amount: 5000.00`
3. **Transaction Name**: Create a concise, meaningful name from the bank description
   - `"ATD/Auto Debit CC/0318..."` → `"Credit Card Payment"`
   - `"UPI/Amazon/Pay..."` → `"Amazon Purchase"`
   - `"NEFT-SALARY..."` → `"Salary Credit"`
4. **Merchant Extraction**: Extract merchant name if identifiable
   - Look for: Amazon, Flipkart, Swiggy, Zomato, Netflix, etc.
5. **Skip Invalid Rows**: Ignore header rows, summary rows, balance rows
6. **Preserve Original**: Store the original bank description in `metadata.original_description`
7. **Set user_id**: Use the UUID I provide for ALL transactions

---

## 📤 **Output Format**

Output **ONLY** the JSON array, ready to be saved and uploaded:

```json
[
  {
    "user_id": "YOUR_USER_UUID",
    "name": "Amazon Purchase",
    "description": "UPI/Amazon/401234567890/Payment",
    "amount": 1549.00,
    "date": "2025-09-12T00:00:00Z",
    "type": "expense",
    "source_account_type": "bank",
    "source_account_name": "ICICI Savings",
    "merchant": "Amazon",
    "metadata": {
      "bank_reference": "123456789",
      "original_description": "UPI/Amazon/401234567890/Payment",
      "upload_source": "chatgpt_bulk_upload",
      "upload_date": "2025-10-18"
    }
  },
  {
    "user_id": "YOUR_USER_UUID",
    "name": "Salary Credit",
    "description": "NEFT CR-HDFC0003861-Company Name-Salary for Sep",
    "amount": 75000.00,
    "date": "2025-09-01T00:00:00Z",
    "type": "income",
    "source_account_type": "bank",
    "destination_account_name": "ICICI Savings",
    "merchant": null,
    "metadata": {
      "bank_reference": "987654321",
      "original_description": "NEFT CR-HDFC0003861-Company Name-Salary for Sep",
      "upload_source": "chatgpt_bulk_upload",
      "upload_date": "2025-10-18"
    }
  }
]
```

---

## 🎯 **Now Here's My Data:**

**User ID**: `YOUR_USER_UUID_HERE`  
**Bank Name**: `BANK_NAME_HERE` (e.g., ICICI, HDFC, Axis, SBI)  
**Account Name**: `ACCOUNT_NAME_HERE` (e.g., ICICI Savings Account)  
**Statement Period**: `MONTH_YEAR` (e.g., September 2025)  

**CSV/Excel Data**:
```
[PASTE YOUR BANK STATEMENT CSV/EXCEL DATA HERE]
```

---

## ✅ **Quality Checks**

Before outputting, verify:
- [ ] All transactions have `user_id`, `name`, `amount`, `type`, `source_account_type`
- [ ] All amounts are positive numbers
- [ ] All dates are in ISO 8601 format
- [ ] Transaction types are valid (income/expense/transfer/etc.)
- [ ] Account types are valid (bank/credit_card/cash/digital_wallet/investment/other)
- [ ] JSON is valid and properly formatted
- [ ] No header rows or summary rows included
- [ ] Metadata contains original description for reference

---

**Transform the data now and output ONLY the JSON array.**
```

---

## 💡 **Usage Instructions**

1. **Copy the entire prompt above**
2. **Replace placeholders**:
   - `YOUR_USER_UUID_HERE` → Your actual user UUID
   - `BANK_NAME_HERE` → Bank name (ICICI, HDFC, etc.)
   - `ACCOUNT_NAME_HERE` → Account name
   - `MONTH_YEAR` → Statement period
3. **Paste your CSV/Excel data** at the bottom
4. **Send to ChatGPT**
5. **Save the JSON output** as `transactions_BANK_MONTH.json`
6. **Upload using the SQL script**

---

## 📌 **Example Usage**

```
**User ID**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
**Bank Name**: `ICICI`
**Account Name**: `ICICI Savings Account`
**Statement Period**: `September 2025`

**CSV/Excel Data**:
DATE,PARTICULARS,WITHDRAWALS,DEPOSITS,BALANCE
01/09/25,NEFT CR-HDFC0003861-Salary,,75000.00,120000.00
12/09/25,UPI/Amazon/401234567890/Payment,1549.00,,118451.00
```

ChatGPT will output the properly formatted JSON ready for upload.

