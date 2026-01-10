import 'dotenv/config';

export default {
  expo: {
    name: "Octopus Organizer",
    slug: "octopusorganizer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    // Disable new architecture for Expo Go / managed workflow stability
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.octopus.organizer",
      infoPlist: {
        NSCameraUsageDescription: "The app needs access to your camera to scan receipts and capture documents.",
        NSPhotoLibraryUsageDescription: "The app needs access to your photos to upload receipts and documents.",
        NSFaceIDUsageDescription: "Authenticate to access your financial data securely.",
        NSLocationWhenInUseUsageDescription: "The app needs access to your location to show your position on the travel map."
      }
    },
    android: {
      package: "com.octopus.organizer",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    scheme: "octopus-organizer",
    plugins: [
      [
        "expo-router",
        {
          root: "./app"
        }
      ],
      "expo-secure-store",
      "expo-sqlite"
    ],
    extra: {
      // EAS Build configuration
      eas: {
        projectId: "89b76a8e-e300-455c-9331-b6741c55b012"
      },
      // Supabase configuration
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fzzbfgnmbchhmqepwmer.supabase.co', // URL is usually not a secret, but good to env-var
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,

      // OpenAI configuration
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      openaiBaseUrl: process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
      openaiSiteUrl: process.env.EXPO_PUBLIC_SITE_URL || 'https://octopusfinanceadvisor.com',
      openaiSiteName: process.env.EXPO_PUBLIC_SITE_NAME || 'Octopus Organizer',
    },
  },
}; 