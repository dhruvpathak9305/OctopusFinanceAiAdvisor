import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MOBILE_ROUTES } from "../../routes/mobileRoutes";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === MOBILE_ROUTES.HOME;
  const { user, signOut, loading } = useAuth();
  const { isDemo, toggleDemoMode } = useDemoMode();

  // Only show the demo toggle on dashboard and other app pages, not the home page
  const shouldShowDemoToggle = !isHomePage && location.pathname !== "/auth";

  // Get page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case MOBILE_ROUTES.HOME:
      case MOBILE_ROUTES.DASHBOARD:
        return "OctopusFinancer";
      case MOBILE_ROUTES.PORTFOLIO:
        return "Portfolio";
      case MOBILE_ROUTES.TRAVEL:
        return "Travel";
      case MOBILE_ROUTES.GOALS:
        return "Goals";
      case MOBILE_ROUTES.SETTINGS:
        return "Settings";
      default:
        return "OctopusFinancer";
    }
  };

  // Get header icon based on route
  const getHeaderIcon = () => {
    switch (location.pathname) {
      case MOBILE_ROUTES.HOME:
      case MOBILE_ROUTES.DASHBOARD:
        return "fa-chart-line";
      case MOBILE_ROUTES.PORTFOLIO:
        return "fa-chart-pie";
      case MOBILE_ROUTES.TRAVEL:
        return "fa-plane";
      case MOBILE_ROUTES.GOALS:
        return "fa-bullseye";
      case MOBILE_ROUTES.SETTINGS:
        return "fa-cog";
      default:
        return "fa-chart-line";
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate(MOBILE_ROUTES.HOME);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white dark:bg-gray-900 z-50 px-3 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div
          onClick={() => navigate(MOBILE_ROUTES.HOME)}
          className="flex items-center cursor-pointer"
        >
          <i
            className={`fas ${getHeaderIcon()} text-green-500 text-sm mr-1.5`}
          ></i>
          <h1 className="text-base font-semibold text-green-500">
            {getPageTitle()}
          </h1>
        </div>

        {shouldShowDemoToggle && (
          <div className="ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleDemoMode();
              }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 h-6 rounded-full text-[10px] font-medium transition-colors duration-200",
                isDemo
                  ? "bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-700"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <FlaskConical className="h-3 w-3" />
              <span>Demo</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1.5">
        <ThemeToggle
          className="relative z-10 border border-gray-100 dark:border-gray-700 rounded-full shadow-sm bg-white dark:bg-gray-800"
          iconSize={3}
        />

        {loading ? (
          <div className="w-14 h-7 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : user ? (
          <Button
            variant="ghost"
            className="text-xs h-7 px-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleLogout}
          >
            Logout
          </Button>
        ) : isHomePage ? (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              className="text-xs h-7 px-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="text-xs h-7 px-2.5 bg-green-500 hover:bg-green-600 text-white rounded-md"
              onClick={() => navigate("/auth")}
            >
              Sign up
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <i className="fas fa-bell text-gray-500 dark:text-gray-400 text-sm"></i>
          </Button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
