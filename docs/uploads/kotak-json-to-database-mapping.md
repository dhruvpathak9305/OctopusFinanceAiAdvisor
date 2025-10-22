# Kotak Statement JSON to Database Mapping Reference

## Overview

This document shows how the Kotak Mahindra Bank statement JSON data was transformed into database transaction format.

---

## Account Mapping

### JSON Input
```json
{
  "statement_info": {
    "account_number": "3712733310",
    "customer_relation_number": "237964982"
  },
  "account_holder_details": {
    "primary_account_holder": "PUSHPA PATHAK"
  }
}
```

### Database Output
```json
{
  "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
  "source_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
  "destination_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2"
}
```

**Mapping Logic:**
- Account number → Lookup in ACCOUNT_MAPPING.json → Get account_id
- Account holder name → Informational (stored in account record)
- CRN → Not directly used, but validates account relationship

---

## Transaction Type Mapping

### 1. FD Maturity Transaction

#### JSON Input
```json
{
  "sl_no": 1,
  "transaction_date": "2025-07-23",
  "transaction_time": "04:21:52",
  "value_date": "2025-07-23",
  "description": "FD MATURITY PROCEEDS :8280309098/23-07-25/PUSHPA TO",
  "amount": 522433.00,
  "type": "CR",
  "balance": 551675.74,
  "balance_type": "CR",
  "category": "fd_maturity"
}
```

#### Database Transaction
```json
{
  "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
  "name": "FD Maturity - 8280309098",
  "description": "FD MATURITY PROCEEDS :8280309098/23-07-25/PUSHPA TO",
  "amount": 522433.00,
  "date": "2025-07-23",
  "type": "income",
  "source_account_type": "investment",
  "source_account_name": "Kotak Fixed Deposit",
  "destination_account_type": "bank",
  "destination_account_name": "Kotak Mahindra Bank - Pushpa",
  "destination_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
  "is_recurring": false,
  "is_credit_card": false,
  "bank_reference_number": "8280309098-20250723",
  "metadata": {
    "bank_reference": "8280309098-20250723",
    "fd_number": "8280309098",
    "fd_maturity_date": "2025-07-23",
    "original_description": "FD MATURITY PROCEEDS :8280309098/23-07-25/PUSHPA TO",
    "balance_after_transaction": 551675.74,
    "transaction_time": "04:21:52",
    "value_date": "2025-07-23",
    ...
  }
}
```

**Transformation Rules:**
- `type: "CR"` → `type: "income"`
- Extract FD number from description → `fd_number: "8280309098"`
- Create unique reference → `{fd_number}-{date}`
- Balance stored in metadata
- Transaction time stored in metadata

---

### 2. Sweep Transfer Transaction

#### JSON Input
```json
{
  "sl_no": 2,
  "transaction_date": "2025-07-24",
  "transaction_time": "00:22:13",
  "value_date": "2025-07-23",
  "description": "SWEEP TRANSFER TO [8291582858]",
  "amount": 500000.00,
  "type": "DR",
  "balance": 51675.74,
  "balance_type": "CR",
  "category": "sweep_transfer",
  "sweep_account": "8291582858"
}
```

#### Database Transaction
```json
{
  "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
  "name": "Auto Sweep Transfer",
  "description": "SWEEP TRANSFER TO [8291582858]",
  "amount": 500000.00,
  "date": "2025-07-24",
  "type": "transfer",
  "source_account_type": "bank",
  "source_account_name": "Kotak Mahindra Bank - Pushpa",
  "source_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
  "destination_account_type": "investment",
  "destination_account_name": "Kotak Fixed Deposit - 8291582858",
  "is_recurring": false,
  "is_credit_card": false,
  "bank_reference_number": "SWEEP-8291582858-20250724",
  "metadata": {
    "bank_reference": "SWEEP-8291582858-20250724",
    "sweep_account": "8291582858",
    "original_description": "SWEEP TRANSFER TO [8291582858]",
    "balance_after_transaction": 51675.74,
    "transaction_time": "00:22:13",
    "value_date": "2025-07-23",
    "transaction_type": "auto_sweep",
    ...
  }
}
```

**Transformation Rules:**
- `type: "DR"` → `type: "transfer"`
- Extract sweep account from description → `sweep_account: "8291582858"`
- Create unique reference → `SWEEP-{account}-{date}`
- Source = savings account, Destination = FD account
- Value date different from transaction date (stored in metadata)

---

### 3. Credit Card Payment Transaction

#### JSON Input
```json
{
  "sl_no": 3,
  "transaction_date": "2025-08-07",
  "transaction_time": "12:36",
  "value_date": "2025-08-07",
  "description": "BILL PAID TO CREDIT CARD 9856 811CC-737895d5-58e9-",
  "amount": 590.00,
  "type": "DR",
  "balance": 51085.74,
  "balance_type": "CR",
  "category": "credit_card_bill",
  "credit_card_last_digits": "9856",
  "transaction_id": "811CC-737895d5-58e9-"
}
```

#### Database Transaction
```json
{
  "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
  "name": "Credit Card Bill Payment",
  "description": "BILL PAID TO CREDIT CARD 9856 811CC-737895d5-58e9-",
  "amount": 590.00,
  "date": "2025-08-07",
  "type": "expense",
  "source_account_type": "bank",
  "source_account_name": "Kotak Mahindra Bank - Pushpa",
  "source_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
  "destination_account_type": "credit_card",
  "destination_account_name": "Kotak Credit Card - 9856",
  "is_recurring": false,
  "is_credit_card": true,
  "bank_reference_number": "811CC-737895d5-58e9-20250807",
  "metadata": {
    "bank_reference": "811CC-737895d5-58e9-20250807",
    "credit_card_last_four": "9856",
    "transaction_id": "811CC-737895d5-58e9-",
    "original_description": "BILL PAID TO CREDIT CARD 9856 811CC-737895d5-58e9-",
    "balance_after_transaction": 51085.74,
    "transaction_time": "12:36",
    "value_date": "2025-08-07",
    ...
  }
}
```

**Transformation Rules:**
- `type: "DR"` + `category: "credit_card_bill"` → `type: "expense"`
- Extract card digits from description → `credit_card_last_four: "9856"`
- `is_credit_card: true`
- Create reference from transaction ID

---

### 4. Interest Credit Transaction

#### JSON Input
```json
{
  "sl_no": 6,
  "transaction_date": "2025-10-01",
  "transaction_time": "02:49",
  "value_date": "2025-09-30",
  "description": "Int.Pd:3712733310:01-07-2025 to 30-09-2025",
  "cheque_ref_no": "293",
  "amount": 293.00,
  "type": "CR",
  "balance": 51723.74,
  "balance_type": "CR",
  "category": "interest_paid",
  "interest_period": {
    "from": "2025-07-01",
    "to": "2025-09-30"
  }
}
```

#### Database Transaction
```json
{
  "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
  "name": "Quarterly Interest - Savings Account",
  "description": "Int.Pd:3712733310:01-07-2025 to 30-09-2025",
  "amount": 293.00,
  "date": "2025-10-01",
  "type": "income",
  "source_account_type": "bank",
  "source_account_name": "Kotak Mahindra Bank",
  "destination_account_type": "bank",
  "destination_account_name": "Kotak Mahindra Bank - Pushpa",
  "destination_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
  "is_recurring": true,
  "is_credit_card": false,
  "bank_reference_number": "3712733310-INT-20251001",
  "metadata": {
    "bank_reference": "3712733310-INT-20251001",
    "cheque_ref_no": "293",
    "interest_period_from": "2025-07-01",
    "interest_period_to": "2025-09-30",
    "original_description": "Int.Pd:3712733310:01-07-2025 to 30-09-2025",
    "balance_after_transaction": 51723.74,
    "transaction_time": "02:49",
    "value_date": "2025-09-30",
    "transaction_category": "interest_paid",
    ...
  }
}
```

**Transformation Rules:**
- `type: "CR"` + `category: "interest_paid"` → `type: "income"`
- `is_recurring: true` (interest is quarterly)
- Extract interest period from JSON → metadata fields
- Create unique reference → `{account}-INT-{date}`
- Value date is end of interest period

---

## General Transformation Rules

### Type Mapping

| JSON Type | JSON Category | Database Type | Logic |
|-----------|---------------|---------------|-------|
| CR | fd_maturity | income | Money coming in from FD |
| CR | interest_paid | income | Interest credit |
| DR | sweep_transfer | transfer | Internal transfer to FD |
| DR | credit_card_bill | expense | Payment going out |
| DR | (other) | expense | Money going out |
| CR | (other) | income | Money coming in |

### Account Type Logic

```javascript
// For Income (CR transactions)
if (category === 'fd_maturity') {
  source_account_type = 'investment'
  source_account_name = 'Kotak Fixed Deposit'
  destination_account_type = 'bank'
  destination_account_id = kotak_savings_account_id
}

if (category === 'interest_paid') {
  source_account_type = 'bank'
  source_account_name = 'Kotak Mahindra Bank'
  destination_account_type = 'bank'
  destination_account_id = kotak_account_id
}

// For Transfers (DR sweep transactions)
if (category === 'sweep_transfer') {
  source_account_type = 'bank'
  source_account_id = kotak_savings_account_id
  destination_account_type = 'investment'
  destination_account_name = 'Kotak Fixed Deposit - {sweep_account}'
}

// For Expenses (DR credit card)
if (category === 'credit_card_bill') {
  source_account_type = 'bank'
  source_account_id = kotak_savings_account_id
  destination_account_type = 'credit_card'
  destination_account_name = 'Kotak Credit Card - {last_4}'
}
```

### Metadata Fields

**Always Included:**
```json
{
  "bank_reference": "Unique identifier",
  "original_description": "Raw description from statement",
  "upload_source": "kotak_statement_upload",
  "upload_date": "2025-10-22",
  "account_number": "Full account number",
  "account_last_four": "Last 4 digits",
  "balance_after_transaction": 0.00,
  "bank_name": "Kotak Mahindra Bank",
  "statement_period": "July-October 2025"
}
```

**Conditionally Included:**
```json
{
  // For all transactions with time
  "transaction_time": "HH:MM:SS",
  
  // If value_date != transaction_date
  "value_date": "YYYY-MM-DD",
  
  // For FD maturities
  "fd_number": "8280309098",
  "fd_maturity_date": "2025-07-23",
  
  // For sweep transfers
  "sweep_account": "8291582858",
  "transaction_type": "auto_sweep",
  
  // For credit card payments
  "credit_card_last_four": "9856",
  "transaction_id": "811CC-737895d5-58e9-",
  
  // For interest credits
  "interest_period_from": "2025-07-01",
  "interest_period_to": "2025-09-30",
  "cheque_ref_no": "293",
  "transaction_category": "interest_paid"
}
```

---

## Bank Reference Number Generation

### Format Rules

```javascript
function generateBankReference(transaction) {
  const date = transaction.transaction_date.replace(/-/g, '')
  
  switch (transaction.category) {
    case 'fd_maturity':
      return `${transaction.fd_number}-${date}`
      // Example: 8280309098-20250723
    
    case 'sweep_transfer':
      return `SWEEP-${transaction.sweep_account}-${date}`
      // Example: SWEEP-8291582858-20250724
    
    case 'interest_paid':
      return `${transaction.account_number}-INT-${date}`
      // Example: 3712733310-INT-20251001
    
    case 'credit_card_bill':
      return `${transaction.transaction_id}-${date}`
      // Example: 811CC-737895d5-58e9-20250807
    
    default:
      return `${transaction.account_number}-${date}-${transaction.sl_no}`
  }
}
```

**Purpose:**
- Ensures uniqueness for duplicate detection
- Allows safe re-running of upload scripts
- Helps in reconciliation and debugging

---

## Complete Example: Side-by-Side Comparison

### JSON Statement Extract
```json
{
  "statement_info": {
    "account_number": "3712733310",
    "statement_period": {
      "from": "2025-07-22",
      "to": "2025-10-22"
    }
  },
  "account_summary": {
    "closing_balance": 51723.74,
    "closing_balance_type": "CR"
  },
  "transactions": [
    {
      "sl_no": 1,
      "transaction_date": "2025-07-23",
      "transaction_time": "04:21:52",
      "value_date": "2025-07-23",
      "description": "FD MATURITY PROCEEDS :8280309098/23-07-25/PUSHPA TO",
      "amount": 522433.00,
      "type": "CR",
      "balance": 551675.74,
      "balance_type": "CR",
      "category": "fd_maturity",
      "fd_number": "8280309098",
      "maturity_date": "2025-07-23"
    }
  ]
}
```

### Database SQL Insert
```sql
{
  "user_id": "6679ae58-a6fb-4d2f-8f23-dd7fafe973d9",
  "name": "FD Maturity - 8280309098",
  "description": "FD MATURITY PROCEEDS :8280309098/23-07-25/PUSHPA TO",
  "amount": 522433.00,
  "date": "2025-07-23",
  "type": "income",
  "source_account_type": "investment",
  "source_account_name": "Kotak Fixed Deposit",
  "destination_account_type": "bank",
  "destination_account_name": "Kotak Mahindra Bank - Pushpa",
  "destination_account_id": "db0683f0-4a26-45bf-8943-98755f6f7aa2",
  "is_recurring": false,
  "is_credit_card": false,
  "bank_reference_number": "8280309098-20250723",
  "metadata": {
    "bank_reference": "8280309098-20250723",
    "fd_number": "8280309098",
    "fd_maturity_date": "2025-07-23",
    "original_description": "FD MATURITY PROCEEDS :8280309098/23-07-25/PUSHPA TO",
    "upload_source": "kotak_statement_upload",
    "upload_date": "2025-10-22",
    "account_number": "3712733310",
    "account_last_four": "3310",
    "balance_after_transaction": 551675.74,
    "bank_name": "Kotak Mahindra Bank",
    "statement_period": "July-October 2025",
    "transaction_time": "04:21:52",
    "value_date": "2025-07-23"
  }
}
```

---

## Field Mapping Table

| JSON Field | Database Field | Transformation |
|------------|----------------|----------------|
| `statement_info.account_number` | Lookup → `destination_account_id` | Via ACCOUNT_MAPPING.json |
| `transaction_date` | `date` | Direct copy |
| `transaction_time` | `metadata.transaction_time` | Stored as string |
| `value_date` | `metadata.value_date` | Only if different from transaction_date |
| `description` | `description` + `metadata.original_description` | Direct copy |
| `amount` | `amount` | Direct copy |
| `type` (CR/DR) | `type` (income/expense/transfer) | Via category logic |
| `balance` | `metadata.balance_after_transaction` | Direct copy |
| `category` | Determines `type` and account types | Custom logic |
| `cheque_ref_no` | `metadata.cheque_ref_no` | If present |
| Generated | `user_id` | Constant user ID |
| Generated | `name` | Friendly transaction name |
| Generated | `bank_reference_number` | Unique per transaction |
| Generated | `source_account_type` | Based on category |
| Generated | `destination_account_type` | Based on category |
| Generated | `is_recurring` | Based on category |
| Generated | `is_credit_card` | Based on category |
| Generated | `metadata.upload_source` | Constant |
| Generated | `metadata.upload_date` | Current date |

---

## Key Differences: JSON vs Database

### 1. Structure
- **JSON:** Statement-centric, account-level summary
- **Database:** Transaction-centric, normalized schema

### 2. Balance Tracking
- **JSON:** Balance after each transaction
- **Database:** Balance stored in metadata, calculated via aggregation

### 3. Account Relationships
- **JSON:** Account number only
- **Database:** UUID references to account records

### 4. Transaction Classification
- **JSON:** Simple CR/DR + category
- **Database:** Rich type system (income/expense/transfer) + account types

### 5. Metadata
- **JSON:** Flat structure with specific fields
- **Database:** Nested JSON metadata for flexibility

### 6. Duplicate Prevention
- **JSON:** Serial numbers
- **Database:** Unique bank reference numbers

---

## Best Practices

### 1. Always Include Bank Reference
Every transaction must have a unique `bank_reference_number` for duplicate detection.

### 2. Preserve Original Description
Store raw statement description in `metadata.original_description` for auditing.

### 3. Use Consistent Account Types
Stick to standard types: `bank`, `investment`, `credit_card`, `digital_wallet`

### 4. Mark Recurring Transactions
Interest credits, salary, subscriptions should have `is_recurring: true`

### 5. Track Value Dates
When value_date ≠ transaction_date, store both for accurate reconciliation.

### 6. Use Meaningful Names
Generate human-friendly transaction names, not raw descriptions.

### 7. Complete Metadata
Include all relevant fields in metadata for future analysis and debugging.

---

## Related Documentation

- [Upload Script](../../scripts/uploads/upload-transactions-kotak-july-october-2025.sql)
- [Upload Instructions](../../scripts/uploads/KOTAK_UPLOAD_INSTRUCTIONS.md)
- [Full Documentation](./kotak-statement-upload-july-october-2025.md)
- [Database Schema](../reference/database-schema.md)

---

This mapping ensures:
- ✅ No data loss from original statement
- ✅ Proper categorization for analysis
- ✅ Duplicate prevention
- ✅ Easy reconciliation
- ✅ Flexible querying and reporting

