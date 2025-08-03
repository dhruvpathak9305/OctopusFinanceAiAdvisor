import 'dotenv/config';

export default {
  expo: {
    name: "OctopusFinanceAiAdvisor",
    slug: "OctopusFinanceAiAdvisor",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.OctopusFinanceAiAdvisor"
    },
    android: {
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
    scheme: "octopus-finance-advisor",
    plugins: [
      [
        "expo-router",
        {
          root: "./app"
        }
      ]
    ],
    extra: {
      // Supabase configuration
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fzzbfgnmbchhmqepwmer.supabase.co',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U',
    },
  },
}; 