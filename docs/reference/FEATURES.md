# 📱 OctopusFinance AI Advisor - Features

## 🚀 Core Features

### **💰 Transaction Management**

- **Manual Entry**: Add income, expense, and transfer transactions
- **SMS Analysis**: AI-powered parsing of bank SMS with 85%+ accuracy
- **Bank Statement Upload**: CSV/Excel import with validation and preview
- **Bulk Transaction Upload**: Process hundreds of transactions at once
- **Smart Categorization**: Automatic transaction categorization

### **📊 Budget Management**

- **Category Management**: Create and organize budget categories
- **Subcategory Tracking**: Detailed expense breakdowns
- **Budget vs Actual**: Real-time spending comparisons
- **Progress Visualization**: Charts and progress indicators

### **🏦 Account & Credit Card Tracking**

- **Multiple Accounts**: Bank accounts, savings, credit cards
- **Real-time Balances**: Track account balances and credit utilization
- **Transaction History**: Complete audit trail per account
- **Net Worth Calculation**: Total portfolio overview

### **🤖 AI-Powered Analysis**

- **SMS Transaction Parsing**: Extract amount, merchant, category from bank SMS
- **OpenAI Integration**: Smart transaction categorization and insights
- **Pattern Recognition**: Learn from user spending habits
- **Merchant Normalization**: Standardize merchant names

## 🔧 Technical Features

### **📱 Cross-Platform**

- **React Native**: iOS and Android support
- **Expo Framework**: Fast development and deployment
- **Responsive Design**: Works on phones and tablets
- **Dark/Light Mode**: Theme customization

### **🔒 Data & Security**

- **Supabase Backend**: Secure cloud database
- **Real-time Sync**: Multi-device synchronization
- **Demo Mode**: Test with sample data
- **Local Processing**: SMS analysis on-device

### **📈 Import & Export**

- **CSV Import**: HDFC, ICICI, SBI, AXIS bank statements
- **Format Validation**: Error checking and data cleaning
- **Duplicate Detection**: Prevent double entries
- **Bulk Processing**: Handle large datasets efficiently

## 🏦 Bank Support

### **SMS Analysis**:

HDFC, ICICI, SBI, AXIS, KOTAK, PNB, IDFC, Paytm, UPI transactions

### **CSV Import**:

- HDFC Bank statements
- ICICI Bank statements
- SBI Bank statements
- AXIS Bank statements
- Generic CSV formats

## 📊 Reports & Analytics

### **Financial Summary**

- Net worth tracking
- Monthly income/expense trends
- Account balance overview
- Credit card utilization

### **Budget Analysis**

- Category-wise spending
- Budget vs actual comparisons
- Spending trends over time
- Goal tracking progress

## 🛠️ Development Notes

### **Architecture**

- React Native + Expo
- TypeScript throughout
- Modular service architecture
- Context-based state management

### **Key Services**

- `transactionsService.ts`: Transaction CRUD operations
- `bulkTransactionService.ts`: Bulk import processing
- `smsAnalyzer/`: AI-powered SMS parsing
- `csvParsers/`: Bank statement processing
- `budgetService.ts`: Budget management

### **Database**

- Supabase PostgreSQL
- Real-time subscriptions
- Row Level Security (RLS)
- Automated backups

## 🚀 Quick Start

1. **Install**: `npm install`
2. **Setup Environment**: Configure Supabase and OpenAI keys
3. **Run**: `npm expo start`
4. **Build**: `npm run build:ios` or `npm run build:android`

## 📝 Usage

1. **Add Accounts**: Set up bank accounts and credit cards
2. **Create Budget**: Define categories and monthly budgets
3. **Import Data**: Upload bank statements or add transactions manually
4. **Track Spending**: Monitor expenses against budget
5. **Analyze Trends**: Review reports and insights

---

**Built with ❤️ using React Native, TypeScript, Supabase, and OpenAI**
