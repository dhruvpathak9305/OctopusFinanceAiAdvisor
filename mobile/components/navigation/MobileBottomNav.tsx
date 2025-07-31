import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MOBILE_ROUTES } from '../../routes/mobileRoutes';
import { useTheme } from "@/common/providers/ThemeProvider";

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const isActive = (path: string) => {
    // Treat home and dashboard as the same for navigation purposes
    if (path === MOBILE_ROUTES.HOME) {
      return currentPath === MOBILE_ROUTES.HOME || currentPath === MOBILE_ROUTES.DASHBOARD;
    }
    return currentPath === path;
  };

  const renderNavItem = (path: string, icon: string, label: string) => {
    const active = isActive(path);

    if (active) {
      return (
        <div className="flex flex-col items-center justify-center h-full cursor-pointer" onClick={() => navigate(path)}>
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center  ${isDark ? 'bg-gray-200/40' : 'bg-gray-800/00'
              }`}
          >
            <i
              className={`fas ${icon} text-xl ${active ? 'text-emerald-500' : 'text-white'
                }`}
            />
          </div>
          <span className={`text-[10px] mt-0 ${active ? 'text-emerald-500 font-semibold' : isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            {label}
          </span>
        </div>
      );
    }

    return (
      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center h-full rounded-none space-y-0 hover:bg-accent hover:text-accent-foreground"
        onClick={() => navigate(path)}
      >
        <i className={`fas ${icon} text-lg mb-0.5 ${active ? 'text-emerald-500' : 'text-muted-foreground'}`} />
        <span className="text-[10px] leading-none">{label}</span>
      </Button>
    );
  };

  return (
    <nav className="fixed bottom-0 w-full bg-background border-t border-border z-50 dark:bg-gray-950">
      <div className="grid grid-cols-5 h-16">
        {renderNavItem(MOBILE_ROUTES.DASHBOARD, 'fa-home', 'Dashboard')}
        {renderNavItem(MOBILE_ROUTES.PORTFOLIO, 'fa-chart-pie', 'Portfolio')}
        {renderNavItem(MOBILE_ROUTES.GOALS, 'fa-bullseye', 'Goals')}
        {renderNavItem(MOBILE_ROUTES.TRAVEL, 'fa-plane', 'Travel')}
        {renderNavItem(MOBILE_ROUTES.SETTINGS, 'fa-cog', 'Settings')}
      </div>
    </nav>
  );
};

export default MobileBottomNav; 