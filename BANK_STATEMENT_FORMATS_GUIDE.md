# 🏦 Bank Statement Formats Guide

## 📋 Supported File Formats

Your application now supports multiple bank statement formats and will automatically detect the best parsing strategy.

### ✅ **Fully Supported Formats**

#### 1. **Standard Transaction CSV**
```
Date,Description,Amount,Type
01/15/2024,Salary Deposit,5000.00,Credit
01/16/2024,Grocery Store,-120.50,Debit
01/17/2024,Gas Station,-45.00,Debit
```

#### 2. **Bank Statement Format (Your Format)**
```
DATE,MODE,PARTICULARS,DEPOSITS,WITHDRAWALS,BALANCE
1/7/25,B/F,Balance Forward,0,0,5107087.82
8/7/25,CREDIT CARD,ATD/Auto Debit CC0xx0318,0,15630.8,5091457.02
8/7/25,UPI,Policybaza/paytm...,0,2230,5089227.02
30-07-2025,NEFT,CITIN52025073000382738-WM GLOBAL TECHNOLOGY,224861,0,5213909.02
```

#### 3. **Alternative Bank Statement Formats**
```
Date,Narration,Debit,Credit,Balance
01/15/2024,Salary Credit,0,5000.00,15000.00
01/16/2024,ATM Withdrawal,120.50,0,14879.50
```

```
Transaction Date,Description,Amount,Type
2024-01-15,Monthly Salary,5000.00,Income
2024-01-16,Supermarket,-85.30,Expense
```

### 🔍 **Automatic Format Detection**

The system uses **4 intelligent parsing strategies**:

1. **Standard Transaction**: Date, Description, Amount columns
2. **Bank Statement**: DATE, PARTICULARS, DEPOSITS, WITHDRAWALS
3. **Pattern Matching**: Finds transaction patterns in any row
4. **Amount Extraction**: Extracts numeric values as potential amounts

### 🤖 **AI-Powered Parsing**

When you upload a CSV file:
- **AI automatically detects** your bank statement format
- **Intelligently categorizes** transactions (Income, Bills, Shopping, etc.)
- **Extracts merchant names** from descriptions
- **Maps transaction types** to database schema
- **Provides confidence scores** for parsing accuracy

## 📱 **User Confirmation System**

### **Step-by-Step Process**

1. **Upload File**: Select your bank statement CSV
2. **AI Processing**: AI analyzes and parses transactions
3. **Review Modal**: Review all parsed transactions before saving
4. **User Confirmation**: Confirm or modify transactions
5. **Database Save**: Transactions saved to `transactions_real` table

### **Confirmation Modal Features**

- **Transaction Summary**: Total count, credits, debits
- **Individual Review**: Each transaction with date, description, amount
- **Edit Capability**: Modify transaction details if needed
- **Batch Operations**: Confirm all or select specific transactions
- **Database Preview**: Shows exactly what will be saved

## 🗄️ **Database Schema Compatibility**

### **Output Format for `transactions_real` Table**

```typescript
{
  id: "ai_parsed_uuid",
  user_id: "your_user_id",
  name: "CREDIT CARD Auto Debit CC0xx0318",
  description: "CREDIT CARD Auto Debit CC0xx0318",
  amount: 15630.80,
  date: "2025-07-08T00:00:00Z",
  type: "expense",
  category_id: "bills_payments_uuid",
  subcategory_id: "credit_card_uuid",
  icon: "credit-card",
  merchant: "Credit Card",
  source_account_id: "your_account_id",
  source_account_type: "bank",
  metadata: {
    original_description: "CREDIT CARD - ATD/Auto Debit CC0xx0318",
    ai_parsed: true,
    mode: "CREDIT CARD",
    reference: "CC0xx0318",
    confidence_score: 0.95
  }
}
```

## 🚀 **How to Use**

### **1. Prepare Your CSV**
- Export bank statement as CSV
- Ensure it contains transaction data (not just headers)
- Include date, description, and amount columns

### **2. Upload and Parse**
- Tap "Upload Bank Statement"
- Select your CSV file
- Wait for AI processing (usually 5-10 seconds)

### **3. Review and Confirm**
- Check parsed transactions in confirmation modal
- Verify amounts, dates, and descriptions
- Modify any incorrect entries if needed

### **4. Save to Database**
- Tap "✅ Confirm & Save"
- Transactions saved to your database
- View in transactions list

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"No valid transactions found"**
- **Cause**: CSV contains only headers/information, no transaction data
- **Solution**: Export actual transaction list, not account summary

#### **"CSV Format Issue"**
- **Cause**: Unsupported column structure
- **Solution**: Use one of the supported formats above

#### **"AI parsing failed"**
- **Cause**: OpenAI service unavailable or file too complex
- **Solution**: System automatically falls back to basic parsing

### **Best Practices**

1. **Use Standard Exports**: Download CSV directly from your bank
2. **Include Headers**: Ensure first row contains column names
3. **Clean Data**: Remove extra formatting, use standard date formats
4. **Transaction Focus**: Export only transaction data, not account summaries

## 📊 **Example: Your Bank Statement**

Based on your uploaded statement, the system will extract:

| Date | Description | Amount | Type | Category |
|------|-------------|---------|------|----------|
| 1/7/25 | Balance Forward | 0.00 | - | Balance |
| 8/7/25 | CREDIT CARD Auto Debit | 15,630.80 | Debit | Bills & Payments |
| 8/7/25 | UPI Policybazaar/Paytm | 2,230.00 | Debit | Shopping |
| 8/7/25 | UPI Self Transfer | 50,000.00 | Debit | Transfers |
| 11/7/25 | UPI Apple Services | 179.00 | Debit | Subscriptions |
| 30-07-2025 | NEFT Salary | 224,861.00 | Credit | Income |
| 30-07-2025 | CREDIT CARD Auto Debit | 11,887.05 | Debit | Bills & Payments |

## 🎯 **Next Steps**

1. **Test with Your CSV**: Upload your actual bank statement
2. **Verify Parsing**: Check that all transactions are extracted correctly
3. **Review Categories**: Confirm AI categorization is accurate
4. **Save to Database**: Use confirmation modal to save transactions
5. **Monitor Results**: Check database for saved transactions

---

**Need Help?** The system provides detailed error messages and fallback parsing to ensure your transactions are always captured accurately.

