import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../contexts/AuthContext";
import { AdvancedBudgetingProvider } from "../../contexts/AdvancedBudgetingContext";
import { BudgetProvider } from "../../contexts/BudgetContext";
import { AccountsProvider } from '../../contexts/AccountsContext';
import { CreditCardProvider } from '../../contexts/CreditCardContext';
import { TransactionProvider } from '../../contexts/TransactionContext';
import { NetWorthProvider } from '../../contexts/NetWorthContext';
import { ThemeProvider } from "../../common/providers/ThemeProvider";
import MobileBottomNav from '../components/navigation/MobileBottomNav';
import MobileHeader from '../components/navigation/MobileHeader';
import { mobileRouteConfig } from '../routes/mobileRoutes';
import MobileProtectedRoute from '../components/auth/MobileProtectedRoute';
import { DemoModeProvider } from '../../contexts/DemoModeContext';

const MobileLayout: React.FC = () => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider>
          <AuthProvider>
            <DemoModeProvider>
              <BudgetProvider>
                <AccountsProvider>
                  <CreditCardProvider>
                    <TransactionProvider>
                      <NetWorthProvider>
                                                  <AdvancedBudgetingProvider>
                          <div className="min-h-screen flex flex-col bg-background">
                            <MobileHeader />
                            <main className="flex-1 pb-16 pt-14 px-4  bg-gray-50 dark:bg-gray-900">
                              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                                <Routes>
                                  {/* Routes are now configured directly from mobileRouteConfig */}
                                  {mobileRouteConfig.map((route) => {
                                    if (route.requiresAuth) {
                                      return (
                                        <Route
                                          key={route.path}
                                          path={route.path}
                                          element={
                                            <MobileProtectedRoute>
                                              <route.component />
                                            </MobileProtectedRoute>
                                          }
                                        />
                                      );
                                    }
                                    return (
                                      <Route key={route.path} path={route.path} element={<route.component />} />
                                    );
                                  })}
                                </Routes>
                              </Suspense>
                            </main>
                            <MobileBottomNav />
                          </div>
                        </AdvancedBudgetingProvider>
                      </NetWorthProvider>
                    </TransactionProvider>
                  </CreditCardProvider>
                </AccountsProvider>
              </BudgetProvider>
            </DemoModeProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default MobileLayout; 