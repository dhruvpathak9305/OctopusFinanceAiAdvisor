# 🐙 Octopus Organizer

**Smart Personal Finance Management with AI-Powered Transaction Analysis**

A cross-platform React Native app that automatically analyzes bank SMS, imports statements, and tracks your finances with intelligent categorization.

## ✨ Key Features

- 📱 **SMS Transaction Analysis**: AI extracts details from bank SMS (85%+ accuracy)
- 📊 **Bank Statement Import**: Support for HDFC, ICICI, SBI, AXIS CSV formats
- 💰 **Smart Budgeting**: Category-based budget tracking with progress indicators
- 🏦 **Multi-Account**: Track bank accounts, credit cards, and net worth
- 🤖 **AI Categorization**: OpenAI-powered transaction categorization
- 📈 **Real-time Sync**: Multi-device synchronization via Supabase
- 🎨 **Modern UI**: Clean, responsive design with dark/light themes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and OpenAI keys

# Start development server
npm run start

# Run on specific platforms
npm run ios
npm run android
npm run web
```

## 📖 Documentation

### 🚀 Quick Access
- **[📚 Complete Documentation Index](docs/README.md)** - All documentation organized by category
- **[📊 Transaction Upload Guide](docs/guides/TRANSACTION_UPLOAD_MASTER_GUIDE.md)** - Upload any bank statement
- **[🏦 Account Mapping](ACCOUNT_MAPPING.json)** - Bank account IDs reference
- **[📈 Upload Status](docs/reference/UPLOAD_STATUS.md)** - Current upload status

### 📁 Documentation Structure
```
docs/
├── guides/              # Step-by-step tutorials (setup, uploads, features)
├── uploads/             # Monthly upload documentation
├── verification/        # Upload verification reports
├── archives/            # Completed sessions and summaries
├── reference/           # Schemas, features, and references
└── README.md           # Complete documentation index
```

### 🎯 Essential Guides
- **[Setup Guide](SETUP.md)** - Initial installation and configuration
- **[Database Setup](docs/guides/DATABASE_SETUP_GUIDE.md)** - Database configuration
- **[Features Overview](docs/reference/FEATURES.md)** - Complete feature list
- **[Execution Guide](docs/guides/COMPLETE_EXECUTION_GUIDE.md)** - System deployment

## 🛠️ Tech Stack

- **Framework**: React Native with Expo Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: OpenAI GPT-4 via OpenRouter
- **State Management**: React Context + Custom Hooks
- **Testing**: Jest + React Native Testing Library
- **Styling**: React Native StyleSheet

## 📱 Platform Support

- ✅ **iOS**: Native app with Expo build
- ✅ **Android**: Native app with Expo build
- ✅ **Web**: Progressive Web App
- ✅ **Cross-platform**: Single codebase for all platforms

## 🏦 Bank Integration

**SMS Analysis**: HDFC, ICICI, SBI, AXIS, KOTAK, PNB, UPI transactions
**CSV Import**: HDFC, ICICI, SBI, AXIS bank statement formats

## 🎯 Core Functionality

1. **Transaction Management**: Add manually, import CSV, or analyze SMS
2. **Budget Tracking**: Set monthly budgets and track spending by category
3. **Account Overview**: Monitor multiple bank accounts and credit cards
4. **AI Insights**: Automatic transaction categorization and merchant detection
5. **Real-time Sync**: Access your data across all devices

---

**Built with ❤️ using React Native, TypeScript, Supabase, and OpenAI**
