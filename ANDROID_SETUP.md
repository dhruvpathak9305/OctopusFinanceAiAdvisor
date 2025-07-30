# 🤖 Android Development Setup Guide

## Option 1: Quick Setup with Android Studio (Recommended)

### 1. Install Android Studio
```bash
# Download from: https://developer.android.com/studio
# Or via Homebrew:
brew install --cask android-studio
```

### 2. Setup Android SDK
1. **Open Android Studio**
2. **Go to Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. **Install Required SDK Platforms:**
   - Android 14 (API 34) ✅
   - Android 13 (API 33) ✅  
   - Android 12 (API 31) ✅

4. **Install SDK Tools:**
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

### 3. Set Environment Variables
Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### 4. Reload Shell & Verify
```bash
source ~/.zshrc
adb --version  # Should show Android Debug Bridge version
```

---

## Option 2: Command Line Setup

### 1. Install Android SDK via Homebrew
```bash
# Install Android SDK
brew install --cask android-sdk

# Install required packages
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager "system-images;android-34;google_apis;arm64-v8a"
```

### 2. Create Virtual Device
```bash
# Create AVD (Android Virtual Device)
avdmanager create avd -n "Pixel_7_API_34" -k "system-images;android-34;google_apis;arm64-v8a"
```

### 3. Set Environment Variables
```bash
# For Homebrew installation
export ANDROID_HOME=/usr/local/share/android-sdk  # Intel Mac
export ANDROID_HOME=/opt/homebrew/share/android-sdk  # Apple Silicon Mac

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## 🚀 Testing Your Setup

### 1. Start Android Emulator
```bash
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_7_API_34
```

### 2. Run Your Expo App
```bash
# In your project directory
pnpm start

# Press 'a' to open on Android
# Or scan QR code with Expo Go app
```

---

## 🐛 Troubleshooting

### Problem: `adb: command not found`
**Solution:** Add Android SDK to PATH
```bash
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Problem: `No emulators found`
**Solution:** Create an AVD
```bash
# Via Android Studio: Tools → Device Manager → Create Device
# Or command line:
avdmanager create avd -n "MyEmulator" -k "system-images;android-34;google_apis;arm64-v8a"
```

### Problem: `ANDROID_HOME not set`
**Solution:** Set environment variable
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # Android Studio
export ANDROID_HOME=/opt/homebrew/share/android-sdk  # Homebrew
```

### Problem: Emulator too slow
**Solution:** Enable hardware acceleration
- **Intel Mac:** Install HAXM via Android Studio
- **Apple Silicon Mac:** Hardware acceleration is built-in

---

## ⚡ Quick Commands

```bash
# Check Android setup
npx @react-native-community/cli doctor

# List connected devices
adb devices

# Install app to device
npx expo install --android

# View device logs
adb logcat

# Kill ADB server (if stuck)
adb kill-server && adb start-server
```

---

## 📱 Physical Device Setup

### 1. Enable Developer Options
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**

### 2. Connect Device
```bash
# Connect via USB
adb devices  # Should show your device

# Connect wirelessly (Android 11+)
adb tcpip 5555
adb connect DEVICE_IP:5555
```

---

## ✅ Verification Checklist

- [ ] Android Studio installed
- [ ] SDK platforms installed (API 31, 33, 34)
- [ ] SDK tools installed
- [ ] Environment variables set
- [ ] `adb --version` works
- [ ] Emulator can start
- [ ] Expo app runs on Android

**Need help?** Check [Expo Android development docs](https://docs.expo.dev/workflow/android-studio-emulator/) 