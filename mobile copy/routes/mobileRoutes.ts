import { lazy } from 'react';
import MobileDashboard from '../pages/MobileDashboard/index';
import MobilePortfolio from '../pages/MobilePortfolio';
import MobileGoals from '../pages/MobileGoals';
import MobileSettings from '../pages/MobileSettings';
import MobileTravel from '../pages/MobileTravel';
import MobileTransactions from '../pages/MobileTransactions/index';
import MobileHome from '../pages/MobileHome/index';
import MobileAuth from '../pages/MobileAuthPage/index';
import MoneyPage from '../pages/Money/index';

export const MOBILE_ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  PORTFOLIO: '/portfolio',
  GOALS: '/goals',
  TRAVEL: '/travel',
  SETTINGS: '/settings',
  TRANSACTIONS: '/transactions',
  MONEY: '/money',
} as const;

export interface MobileRouteConfig {
  path: string;
  component: React.ComponentType;
  title: string;
  icon: string;
  requiresAuth?: boolean;
}

export const mobileRouteConfig: MobileRouteConfig[] = [
  {
    path: MOBILE_ROUTES.HOME,
    component: MobileHome,
    title: 'Home',
    icon: 'home',
    requiresAuth: false,
  },
  {
    path: MOBILE_ROUTES.AUTH,
    component: MobileAuth,
    title: 'Auth',
    icon: 'home',
    requiresAuth: false,
  },
  {
    path: MOBILE_ROUTES.DASHBOARD,
    component: MobileDashboard,
    title: 'Dashboard',
    icon: 'home',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.PORTFOLIO,
    component: MobilePortfolio,
    title: 'Portfolio',
    icon: 'chart-line',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.GOALS,
    component: MobileGoals,
    title: 'Goals',
    icon: 'bullseye',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.TRAVEL,
    component: MobileTravel,
    title: 'Travel',
    icon: 'plane',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.MONEY,
    component: MoneyPage,
    title: 'Money',
    icon: 'wallet',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.SETTINGS,
    component: MobileSettings,
    title: 'Settings',
    icon: 'cog',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.TRANSACTIONS,
    component: MobileTransactions,
    title: 'Transactions',
    icon: 'credit-card',
  },
]; 