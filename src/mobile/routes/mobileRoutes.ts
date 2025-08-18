import { lazy } from 'react';
import MobileDashboard from '../pages/MobileDashboard';
import MobilePortfolio from '../pages/MobilePortfolio';
import MobileGoals from '../pages/MobileGoals';
import MobileSettings from '../pages/MobileSettings';
import MobileTravel from '../pages/MobileTravel';
import MobileTransactions from '../pages/MobileTransactions';
import MobileHome from '../pages/MobileHome';
import MobileAuth from '../pages/MobileAuth';
import MobileMoney from '../pages/MobileMoney';
import MobileBankStatements from '../pages/MobileBankStatements';

export const MOBILE_ROUTES = {
  HOME: 'Home',
  AUTH: 'Auth',
  DASHBOARD: 'Dashboard',
  PORTFOLIO: 'Portfolio',
  GOALS: 'Goals',
  TRAVEL: 'Travel',
  SETTINGS: 'Settings',
  TRANSACTIONS: 'Transactions',
  MONEY: 'Money',
  BANK_STATEMENTS: 'BankStatements',
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
    icon: '🏠',
    requiresAuth: false,
  },
  {
    path: MOBILE_ROUTES.AUTH,
    component: MobileAuth,
    title: 'Auth',
    icon: '🔐',
    requiresAuth: false,
  },
  {
    path: MOBILE_ROUTES.DASHBOARD,
    component: MobileDashboard,
    title: 'Dashboard',
    icon: '📊',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.PORTFOLIO,
    component: MobilePortfolio,
    title: 'Portfolio',
    icon: '📈',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.GOALS,
    component: MobileGoals,
    title: 'Goals',
    icon: '🎯',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.TRAVEL,
    component: MobileTravel,
    title: 'Travel',
    icon: '✈️',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.MONEY,
    component: MobileMoney,
    title: 'Money',
    icon: '💰',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.SETTINGS,
    component: MobileSettings,
    title: 'Settings',
    icon: '⚙️',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.TRANSACTIONS,
    component: MobileTransactions,
    title: 'Transactions',
    icon: '💳',
    requiresAuth: true,
  },
  {
    path: MOBILE_ROUTES.BANK_STATEMENTS,
    component: MobileBankStatements,
    title: 'Bank Statements',
    icon: '📄',
    requiresAuth: true,
  },
]; 