# 🚀 Octopus Organizer Setup Guide

## Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd OctopusOrganizer
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
EXPO_PUBLIC_OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

### 3. Database Setup

1. Create Supabase project
2. Run migrations from `database/migrations/`
3. Set up RLS policies (see `database/schema/`)

### 4. Run Development Server

```bash
# Start Expo development server
npm run start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Build for Production

### iOS

```bash
npm run build:ios
```

### Android

```bash
npm run build:android
```

## Key Configuration

### App Config (`app.config.js`)

- URL scheme: `octopus-finance-advisor://`
- Bundle identifier: `com.anonymous.OctopusFinanceAiAdvisor`

### Supabase Tables

- `accounts_real`: User accounts
- `transactions_real`: Transaction records
- `budget_categories_real`: Budget categories
- `credit_cards_real`: Credit card data

### OpenAI Integration

- Model: GPT-4 via OpenRouter
- Used for: Transaction categorization and SMS analysis
- Fallback: Local pattern matching

## Features Enabled

✅ **Transaction Management**: Manual entry, SMS analysis, CSV import
✅ **Budget Tracking**: Category-based budgeting with progress tracking  
✅ **Account Management**: Multiple accounts and credit cards
✅ **Bank Statement Import**: HDFC, ICICI, SBI, AXIS formats
✅ **AI Analysis**: Smart categorization and merchant detection
✅ **Real-time Sync**: Multi-device synchronization

## Troubleshooting

### Common Issues

- **Metro bundler**: Clear cache with `npm run start -- --clear`
- **iOS build**: Update Xcode and CocoaPods
- **Android build**: Check Android SDK and Java version
- **Supabase**: Verify RLS policies and API keys

### Database Issues

- Run balance recalculation: See `database/BALANCE_SYSTEM_UTILITIES.sql`
- Reset demo data: Toggle demo mode in app settings
- Migration issues: Check `database/migrations/` for latest schema

## Development Notes

### Architecture

- **Framework**: React Native with Expo
- **State**: Context API + hooks
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4 via OpenRouter
- **Testing**: Jest + React Native Testing Library

### Key Services

- `transactionsService.ts`: Transaction CRUD
- `bulkTransactionService.ts`: CSV import and bulk operations
- `smsAnalyzer.ts`: AI-powered SMS parsing
- `budgetService.ts`: Budget management
- `accountsService.ts`: Account operations

### File Structure

```
src/
├── mobile/           # Mobile app components
├── desktop/          # Desktop web components
├── components/       # Shared UI components
├── contexts/         # React contexts
├── services/         # Business logic
├── hooks/           # Custom React hooks
├── utils/           # Helper functions
└── types/           # TypeScript definitions
```

---

**Ready to build the future of personal finance! 💰**
