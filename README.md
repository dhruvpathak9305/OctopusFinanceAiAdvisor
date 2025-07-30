# 🐙 Octopus Finance AI Advisor

A cross-platform financial advisor app built with React Native, Expo Router, and TypeScript.

## 📁 **Recommended Folder Structure**

```
OctopusFinanceAiAdvisor/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Landing page
│   ├── (dashboard)/             # Dashboard feature group
│   │   ├── _layout.tsx          # Dashboard tabs layout
│   │   ├── index.tsx            # Dashboard overview
│   │   ├── analytics.tsx        # Market analytics
│   │   └── insights.tsx         # AI insights
│   ├── (auth)/                  # Authentication screens
│   │   ├── _layout.tsx          # Auth layout
│   │   ├── login.tsx           # Login screen
│   │   ├── register.tsx        # Registration
│   │   └── forgot-password.tsx # Password reset
│   ├── (portfolio)/             # Portfolio management
│   │   ├── _layout.tsx          # Portfolio layout
│   │   ├── index.tsx           # Portfolio overview
│   │   ├── holdings.tsx        # Holdings list
│   │   └── transactions.tsx    # Transaction history
│   └── platform/               # Platform-specific demos
│       ├── web.tsx             # Web demo
│       ├── mobile.tsx          # Mobile demo
│       ├── ios.tsx             # iOS demo
│       └── android.tsx         # Android demo
├── components/                  # Reusable components
│   ├── ui/                     # Basic UI components
│   │   ├── Button.tsx          # Cross-platform button
│   │   ├── Button.web.tsx      # Web-specific button
│   │   ├── Card.tsx            # Card component
│   │   └── Header.tsx          # Header component
│   ├── forms/                  # Form components
│   │   ├── Input.tsx           # Text input
│   │   ├── Select.tsx          # Select dropdown
│   │   └── Checkbox.tsx        # Checkbox
│   ├── charts/                 # Chart components
│   │   ├── LineChart.tsx       # Line chart
│   │   ├── PieChart.tsx        # Pie chart
│   │   └── BarChart.tsx        # Bar chart
│   └── platform/               # Platform-specific layouts
│       ├── WebLayout.tsx       # Desktop layout wrapper
│       └── MobileLayout.tsx    # Mobile layout wrapper
├── hooks/                      # Custom React hooks
│   ├── usePlatform.ts         # Platform detection
│   ├── usePortfolio.ts        # Portfolio data
│   └── useAuth.ts             # Authentication
├── utils/                      # Utility functions
│   ├── formatting.ts          # Data formatting
│   ├── validation.ts          # Form validation
│   └── api.ts                 # API helpers
├── constants/                  # App constants
│   ├── Colors.ts              # Color palette
│   ├── Fonts.ts               # Typography
│   └── Config.ts              # App configuration
├── types/                      # TypeScript definitions
│   └── index.ts               # Global types
└── assets/                    # Static assets
    ├── images/                # Images
    ├── icons/                 # Icons
    └── fonts/                 # Custom fonts
```

## 🎯 **Key Benefits of This Structure**

### 1. **Platform-Specific Development**
- **File Extensions**: Use `.web.tsx`, `.native.tsx`, `.ios.tsx`, `.android.tsx` for platform-specific implementations
- **Platform Layouts**: Dedicated layout components for web and mobile experiences
- **Responsive Design**: Built-in platform detection and responsive utilities

### 2. **Feature-Based Organization**
- **Route Groups**: Use `(feature)` folders for logical grouping
- **Colocation**: Keep related components, hooks, and utilities together
- **Scalability**: Easy to add new features without cluttering the structure

### 3. **Shared Components**
- **Cross-Platform**: Components that work on all platforms by default
- **Platform Overrides**: Specific implementations when needed
- **Consistent API**: Same props interface across platforms

## 🚀 **Development Workflow**

### **Creating a New Feature**
1. Create a route group: `app/(feature-name)/`
2. Add layout: `app/(feature-name)/_layout.tsx`
3. Add screens: `app/(feature-name)/screen-name.tsx`
4. Create components: `components/feature-name/`

### **Platform-Specific Components**
```typescript
// components/ui/Button.tsx (default)
export const Button = () => { /* cross-platform implementation */ }

// components/ui/Button.web.tsx (web-specific)
export const Button = () => { /* web-optimized with hover effects */ }

// components/ui/Button.native.tsx (mobile-specific)  
export const Button = () => { /* mobile-optimized with haptics */ }
```

### **Using Platform Detection**
```typescript
import { usePlatform } from '../hooks/usePlatform';

const MyComponent = () => {
  const { isWeb, isNative, getStyleForPlatform } = usePlatform();
  
  const styles = getStyleForPlatform({
    web: { cursor: 'pointer' },
    native: { elevation: 4 },
    default: { borderRadius: 8 }
  });
  
  return <View style={styles}>...</View>;
};
```

## 📱 **Platform Support**

- **Web**: Desktop-optimized with hover effects, large layouts
- **iOS**: Native iOS design patterns, Apple ecosystem integration
- **Android**: Material Design, Android-specific features
- **Universal**: Shared business logic and core functionality

## 🎨 **Styling Strategy**

- **Constants**: Centralized colors, fonts, and spacing
- **Platform Variants**: Different styles per platform when needed
- **Responsive**: Automatic adaptation to screen sizes
- **Theme Support**: Easy to implement light/dark modes

## 🔧 **Getting Started**

   ```bash
# Install dependencies
   pnpm install

# Start development server
pnpm start

# Platform-specific development
pnpm run web     # Web development
pnpm run ios     # iOS simulator
pnpm run android # Android emulator
```

## 📝 **Best Practices**

1. **Start with cross-platform components**, add platform-specific variants only when needed
2. **Use route groups** to organize related screens
3. **Keep business logic** in custom hooks
4. **Centralize styling** in constants and shared components
5. **Type everything** with TypeScript for better developer experience

This structure scales from small apps to enterprise-level applications while maintaining clean separation of concerns and platform-specific optimizations! 🚀 