# 📊 Connecting Your Stock Market & Mutual Fund Holdings

## Overview
You can connect and manage your real stock market and mutual fund holdings in several ways. This guide covers all available methods.

---

## ✅ Method 1: Manual Entry (Available Now!)

The **fastest and easiest** way to add your holdings.

### How to Add Holdings Manually:

1. **Open Portfolio Screen**
2. **Click "+ Add Holding" Button**
3. **Fill in the Form**:
   - **Asset Type**: Stock, Mutual Fund, ETF, or Bond
   - **Symbol/Ticker**: Stock symbol (e.g., RELIANCE, TCS) or Mutual Fund Scheme Code
   - **Name**: Full name of the asset
   - **Quantity**: Number of shares/units you own
   - **Purchase Price**: Average price you paid per share/unit
   - **Purchase Date**: When you bought it (optional)
   - **Notes**: Any additional information (optional)

4. **Click "Add Holding"**

### Example - Adding a Stock:
```
Asset Type: Stock
Symbol: RELIANCE
Name: Reliance Industries Ltd
Quantity: 10
Purchase Price: ₹2,400
Purchase Date: 2024-01-15
```

### Example - Adding a Mutual Fund:
```
Asset Type: Mutual Fund
Symbol: 119551
Name: HDFC Top 100 Fund - Direct Plan - Growth
Quantity: 100
Purchase Price: ₹650.50
Purchase Date: 2023-06-01
```

### ✅ Advantages:
- ✅ Immediate - works right now
- ✅ Complete control over your data
- ✅ No API keys or integrations needed
- ✅ Works for any stock/MF from any exchange

### ❌ Limitations:
- Need to manually update prices
- Need to add each holding one by one

---

## 🔌 Method 2: Broker API Integration (Coming Soon)

Connect your broker account to automatically sync holdings.

### Supported Brokers (Implementation Ready):

#### 🇮🇳 Indian Brokers:

**1. Zerodha Kite Connect**
- **Best for**: Zerodha users
- **Data**: Real-time holdings, P&L, trades
- **Cost**: ₹2,000/month (Kite Connect API)
- **Setup**: Register for API access at https://kite.trade/

**2. Upstox API**
- **Best for**: Upstox users
- **Data**: Holdings, positions, orders
- **Cost**: Free tier available
- **Setup**: Apply at https://upstox.com/developer/

**3. AngelOne SmartAPI**
- **Best for**: Angel Broking users
- **Data**: Portfolio, holdings, trades
- **Cost**: Free for basic usage
- **Setup**: Register at https://smartapi.angelbroking.com/

**4. 5Paisa**
- **Best for**: 5Paisa users
- **Data**: Holdings, P&L
- **Cost**: Free

### How to Connect (Once Implemented):

1. **Go to Settings → Integrations**
2. **Select Your Broker**
3. **Enter API Credentials**
   - API Key
   - API Secret
   - Client ID (if required)
4. **Authorize Access**
5. **Holdings Sync Automatically**

### ✅ Advantages:
- ✅ Automatic sync
- ✅ Real-time updates
- ✅ Includes all holdings automatically
- ✅ P&L calculations automatic

### ❌ Limitations:
- API fees (for some brokers)
- Requires API registration
- Data limited to one broker

---

## 📄 Method 3: CSV/Excel Import (Coming Soon)

Upload your holdings from a spreadsheet.

### CSV Format Required:

```csv
asset_type,symbol,name,quantity,purchase_price,purchase_date
stock,RELIANCE,Reliance Industries Ltd,10,2400,2024-01-15
stock,TCS,Tata Consultancy Services,5,3500,2023-11-20
mutual_fund,119551,HDFC Top 100 Fund,100,650.50,2023-06-01
etf,NIFTYBEES,Nippon India ETF Nifty BeES,50,220.75,2024-02-10
```

### Steps:

1. **Export holdings from your broker** (if available)
2. **Or create your own CSV** with the format above
3. **Go to Portfolio → Import**
4. **Upload CSV File**
5. **Review & Confirm** imported holdings

### ✅ Advantages:
- ✅ Bulk import (add 100s of holdings at once)
- ✅ Easy to prepare offline
- ✅ Works with any broker's export

### ❌ Limitations:
- Need to create/export CSV
- One-time import (not auto-sync)

---

## 🏦 Method 4: CAMS/Karvy Integration for Mutual Funds (Coming Soon)

Sync mutual fund holdings from CAMS or Karvy.

### What is CAMS/Karvy?
- **Registrar & Transfer Agents** for mutual funds
- Maintain records of your MF investments
- Most Indian mutual funds use CAMS or Karvy

### How to Connect:

1. **Get your CAMS/Karvy Statement**
   - Via email (monthly consolidated statement)
   - Or download from their website

2. **Method A: Email Forward**
   - Forward statement to: holdings@yourapp.com
   - System auto-imports holdings

3. **Method B: Manual Upload**
   - Upload PDF statement
   - System extracts holdings automatically

4. **Method C: API Integration**
   - Provide CAMS login credentials (secure)
   - Auto-sync monthly

### Data Imported:
- All mutual fund schemes
- Folios
- Current units
- Purchase history
- Current NAV
- Gains/losses

### ✅ Advantages:
- ✅ All mutual funds in one go
- ✅ Accurate data from official source
- ✅ Includes purchase history

### ❌ Limitations:
- Only mutual funds (not stocks)
- Statement may be delayed

---

## 🔗 Method 5: Demat Account Linking (Future)

Direct link to your Demat account.

### Supported Depositories:
- **NSDL** (National Securities Depository Limited)
- **CDSL** (Central Depository Services Limited)

### How it Will Work:

1. **Link Demat Account**
   - Enter DP ID and Client ID
   - Verify via OTP

2. **Holdings Auto-Sync**
   - All stocks automatically imported
   - Updates when you buy/sell

### ✅ Advantages:
- ✅ Most comprehensive
- ✅ Official source
- ✅ Includes all holdings across brokers

---

## 🎯 Recommended Approach

### For Quick Start (Now):
✅ **Use Manual Entry**
- Add your top 10-20 holdings manually
- Takes 10-15 minutes
- Immediate access to portfolio tracking

### For Complete Automation (Later):
1. **Connect Broker API** - for stocks & real-time data
2. **Link CAMS/Karvy** - for mutual funds
3. **Use CSV Import** - for any other holdings

---

## 📊 What Happens After Adding Holdings?

Once your holdings are added, you'll automatically see:

### 1. **Portfolio Summary**
- Total portfolio value
- Total invested amount
- Gains/losses (₹ and %)
- XIRR (returns)

### 2. **Asset Allocation**
- Breakdown by asset type (stocks, MFs, ETFs)
- Percentage allocation
- Visual pie chart

### 3. **Holdings List**
- All your holdings
- Current price vs purchase price
- Gain/loss for each
- Quantity and value

### 4. **Performance Tracking**
- Daily/weekly/monthly returns
- Top performers
- Underperformers
- Comparison with benchmarks (Nifty 50, Sensex)

### 5. **Automatic Updates**
- Prices update automatically
- Portfolio value recalculates
- P&L updates in real-time

---

## 🔐 Data Security

### Your Holdings Data is:
- ✅ **Encrypted** - All data encrypted at rest and in transit
- ✅ **Private** - Only you can see your holdings
- ✅ **Secure** - Stored in secure Supabase database
- ✅ **Row-Level Security** - Database-level access controls

### API Credentials:
- Stored encrypted
- Never logged or exposed
- Can be revoked anytime
- Separate credentials per integration

---

## 💡 Tips & Best Practices

### 1. **Start Small**
- Add your top holdings first
- Verify calculations are correct
- Then add remaining holdings

### 2. **Keep Records**
- Save your purchase confirmations
- Note down average prices
- Keep track of dividends received

### 3. **Regular Updates**
- Update when you buy/sell
- Review allocations monthly
- Rebalance if needed

### 4. **Use Categories**
- Tag holdings (long-term, short-term, trading)
- Create multiple portfolios (Retirement, Growth, Income)
- Set notes for investment thesis

---

## 🆘 Troubleshooting

### Issue: "Can't find my mutual fund"
**Solution**:
- Search by scheme code instead of name
- Use AMFI code (6-digit number)
- Check AMFI website for correct code

### Issue: "Wrong purchase price"
**Solution**:
- Use your **average** purchase price
- If bought multiple times, calculate average
- Formula: Total Amount Invested ÷ Total Quantity

### Issue: "Portfolio value seems wrong"
**Solution**:
- Verify quantities are correct
- Check if prices are updating
- Click "Refresh" to update prices
- Ensure market is open for real-time prices

---

## 📞 Need Help?

### Resources:
- **Stock Symbols**: Search at https://www.nseindia.com/
- **MF Scheme Codes**: https://www.amfiindia.com/
- **Broker API Docs**: Check your broker's developer portal

### Support:
- In-app help: Settings → Help & Support
- Email: support@yourapp.com
- Documentation: docs.yourapp.com

---

## 🚀 Getting Started Right Now

### Quick 5-Minute Setup:

1. **Click "+ Add Holding"** in Portfolio screen
2. **Add your biggest holding** (e.g., if you have 100 shares of Reliance)
3. **See it appear** in your portfolio
4. **Watch price updates** automatically
5. **Repeat** for other holdings

That's it! You're now tracking your portfolio! 🎉

---

## 📈 Example: Full Portfolio Setup

### Sample Portfolio Entry:

```
STOCKS (60% allocation):
- RELIANCE: 10 shares @ ₹2,400 = ₹24,000
- TCS: 5 shares @ ₹3,500 = ₹17,500
- INFY: 15 shares @ ₹1,600 = ₹24,000
- HDFCBANK: 8 shares @ ₹1,650 = ₹13,200

MUTUAL FUNDS (30% allocation):
- HDFC Top 100 Fund: 100 units @ ₹650 = ₹65,000
- SBI Bluechip Fund: 80 units @ ₹550 = ₹44,000

ETFs (10% allocation):
- NIFTYBEES: 50 units @ ₹220 = ₹11,000

TOTAL PORTFOLIO: ₹1,98,700
```

Add each of these one by one using the "+ Add Holding" button!

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0

