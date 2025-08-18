import Constants from 'expo-constants';

export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  openai: {
    apiKey: string;
    baseUrl: string;
    siteUrl: string;
    siteName: string;
  };
}

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    const extra = Constants.expoConfig?.extra;
    
    this.config = {
      supabase: {
        url: extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
        anonKey: extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      openai: {
        apiKey: extra?.openaiApiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
        baseUrl: extra?.openaiBaseUrl || process.env.EXPO_PUBLIC_OPENAI_BASE_URL || '',
        siteUrl: extra?.openaiSiteUrl || process.env.EXPO_PUBLIC_SITE_URL || '',
        siteName: extra?.openaiSiteName || process.env.EXPO_PUBLIC_SITE_NAME || '',
      },
    };
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public getSupabaseConfig() {
    return this.config.supabase;
  }

  public getOpenAIConfig() {
    return this.config.openai;
  }

  public isOpenAIAvailable(): boolean {
    return !!(this.config.openai.apiKey && this.config.openai.baseUrl);
  }
}

export default ConfigService;

