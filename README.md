# 🐙 OctopusFinance AI Advisor

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

- **[Setup Guide](SETUP.md)** - Complete installation and configuration
- **[Features](FEATURES.md)** - Detailed feature overview
- **[Bank Statement Guide](BANK_STATEMENT_FORMATS_GUIDE.md)** - Supported CSV formats
- **[Styling Guide](STYLING_GUIDE.md)** - UI theming and components
- **[Balance System Guide](BALANCE_SYSTEM_MASTER_GUIDE.md)** - Database balance calculations

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
