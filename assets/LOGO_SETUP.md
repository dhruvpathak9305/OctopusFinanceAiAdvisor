# Logo Setup Instructions

## Required Image Files

To use the theme-aware logo system, you need to add two logo image files to the `assets/` folder:

1. **`octopus-logo-light.webp`** - Blue octopus logo for light theme
   - Vibrant blue background with bright green octopus
   - Golden financial symbols (dollar coin, bar chart, shield, piggy bank, briefcase, house)
   - Bright, energetic appearance

2. **`octopus-logo-dark.webp`** - Black/dark octopus logo for dark theme
   - Dark charcoal/black background with glowing green octopus
   - Same golden financial symbols with softer glow
   - Professional, elegant appearance

## How to Add the Files

### Option 1: Direct File Copy
1. Copy your logo image files to the `assets/` folder
2. Rename them to:
   - `octopus-logo-light.webp` (for the blue/light theme version)
   - `octopus-logo-dark.webp` (for the black/dark theme version)

### Option 2: Using Terminal
```bash
# Navigate to your project root
cd /Users/dhruvpathak9305/GitHub_Repo/OctopusFinanceAiAdvisor

# Copy your logo files (replace SOURCE_PATH with your actual file paths)
cp SOURCE_PATH/light-logo.webp assets/octopus-logo-light.webp
cp SOURCE_PATH/dark-logo.webp assets/octopus-logo-dark.webp
```

### File Format Requirements
- **Format**: `.webp` (recommended) or `.png`
- **Size**: Recommended 512x512px or higher for best quality
- **Aspect Ratio**: Square (1:1)

## File Locations

Place both files in:
```
/assets/octopus-logo-light.webp
/assets/octopus-logo-dark.webp
```

## Verification

After adding the files, verify they exist:
```bash
ls -la assets/octopus-logo-*.webp
```

You should see both files listed.

## Usage

The logo component automatically switches between light and dark logos based on the current theme:

- **Light Theme**: Uses `octopus-logo-light.webp` (blue octopus)
- **Dark Theme**: Uses `octopus-logo-dark.webp` (black octopus)

## Components Updated

The following components now use the theme-aware logo:

- `components/pages/WebHomeContent.tsx` - Web home page header
- `components/layout/WebPageLayout.tsx` - Web page layout header
- `src/desktop/components/navigation/DesktopHeader.tsx` - Desktop header
- `src/mobile/components/navigation/MobileHeader.tsx` - Mobile header

## Logo Component

The `components/common/Logo.tsx` component handles the theme switching automatically. You can use it anywhere with:

```tsx
import { Logo } from '../common/Logo';

// Logo only
<Logo size={32} />

// Logo with text
<Logo size={32} showText={true} />
```

## Troubleshooting

If you see build errors about missing files:
1. Ensure both logo files exist in the `assets/` folder
2. Check that filenames match exactly: `octopus-logo-light.webp` and `octopus-logo-dark.webp`
3. Verify file permissions allow reading
4. Restart your development server after adding the files

