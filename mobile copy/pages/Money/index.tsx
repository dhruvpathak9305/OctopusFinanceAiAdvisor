import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "@/common/providers/ThemeProvider";
import { useResponsive } from "@/common/hooks/useResponsive";
import Tabs, { TabData } from "./components/Tabs";
import AccountsSection from "./components/AccountsSection";
import CreditCardsSection from "./components/CreditCardsSection";
import NetWorthSection from "./components/NetWorthSection";

const MoneyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize from URL params or default to "accounts"
    return searchParams.get('tab') || 'accounts';
  });

  const { resolvedTheme } = useTheme();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  // Handle URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    setSearchParams(newSearchParams);
  };

  const handleManageCard = (cardId: string) => {
    // Navigate to card management or open modal
    console.log("Manage card:", cardId);
  };

  const handleViewBreakdown = (cardId: string) => {
    // Navigate to breakdown page or open modal
    console.log("View breakdown for card:", cardId);
  };

  const handleAccountSelect = (account: any) => {
    // Handle account selection (could navigate to account details)
    console.log('Selected account:', account);
  };

  // Define tabs configuration
  const tabs: TabData[] = [
    {
      value: "accounts",
      label: "Accounts",
      icon: "fas fa-university",
      content: <AccountsSection onAccountSelect={handleAccountSelect} />,
    },
    {
      value: "credit-cards",
      label: "Credit Cards",
      icon: "fas fa-credit-card",
      content: (
        <CreditCardsSection
          onManageCard={handleManageCard}
          onViewBreakdown={handleViewBreakdown}
        />
      ),
    },
    {
      value: "net-worth",
      label: "Net Worth",
      icon: "fas fa-chart-line",
      content: <NetWorthSection />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <i className="fas fa-arrow-left text-foreground"></i>
            </button>
            <div>
              <h1
                className={`font-bold text-foreground ${
                  isMobile ? "text-xl" : "text-2xl"
                }`}
              >
                Money
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your accounts and cards
              </p>
            </div>
          </div>
        </div>

        {/* Tabs with content */}
        <div className="px-1 pb-4">
          <Tabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabs={tabs}
          />
        </div>
      </div>
    </div>
  );
};

export default MoneyPage;
