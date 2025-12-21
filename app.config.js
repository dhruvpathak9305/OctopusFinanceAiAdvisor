import 'dotenv/config';

export default {
  expo: {
    name: "OctopusFinanceAiAdvisor",
    slug: "OctopusFinanceAiAdvisor",
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
      bundleIdentifier: "com.anonymous.OctopusFinanceAiAdvisor"
    },
    android: {
      package: "com.octopusfinance.advisor",
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
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fzzbfgnmbchhmqepwmer.supabase.co',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNqbwOSrm1AiWpBbZjiRmNn0U',
      
      // OpenAI configuration
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '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',
      openaiBaseUrl: process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
      openaiSiteUrl: process.env.EXPO_PUBLIC_SITE_URL || 'https://octopusfinanceadvisor.com',
      openaiSiteName: process.env.EXPO_PUBLIC_SITE_NAME || 'OctopusFinanceAIAdvisor',
    },
  },
}; 