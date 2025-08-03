// Platform types
export type PlatformType = 'web' | 'ios' | 'android' | 'native';

// Navigation types
export interface NavigationItem {
  title: string;
  route: string;
  icon?: string;
}

// Financial data types
export interface PortfolioData {
  totalValue: number;
  todayChange: number;
  todayChangePercent: number;
  holdings: Holding[];
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  change: number;
  changePercent: number;
}

// UI Component types
export interface ButtonVariant {
  primary: string;
  secondary: string;
  outline: string;
}

export interface ComponentSize {
  small: string;
  medium: string;
  large: string;
}

// Layout types
export interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showTabBar?: boolean;
  maxWidth?: number;
  padding?: number;
}

// Chart data types
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface ChartData {
  data: ChartDataPoint[];
  color?: string;
  label?: string;
}

// Supabase types
export type { Database } from './supabase';
export type { User, Session, AuthError } from '@supabase/supabase-js'; 