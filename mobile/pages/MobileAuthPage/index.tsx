import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from '@/common/providers/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import MobileAuthForm from "@/components/auth/MobileAuthForm";
import { useAuth } from '@/contexts/AuthContext';
import { MOBILE_ROUTES } from '../../routes/mobileRoutes';

const MobileAuthPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(MOBILE_ROUTES.DASHBOARD);
    }
  }, [user, loading, navigate]);

  // Don't render the form until we've checked auth status
  if (loading) {
    return (
      <div className={`flex flex-col min-h-screen w-full max-w-[430px] mx-auto relative ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
        <main className="flex-1 px-4 pt-4 pb-4 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="inline-block rounded-full h-12 w-12 border-4 border-l-emerald border-r-emerald border-b-transparent border-t-transparent animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen w-full max-w-[430px] mx-auto relative ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <main className="flex-1 px-4 pt-4 pb-4">

        <div className="text-center mb-6">
        <div className="w-12 h-12 bg-emerald rounded-full flex items-center justify-center mb-4 mx-auto">
          <i className="fas fa-water text-lg text-black"></i>
          </div>
        <h5 className="text-md font-bold">Welcome to Octopus Financer</h5>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center mt-1`}>
            Your personal finance assistant
          </p>
        </div>

        {/* Auth Form Component */}
        <Card className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} p-4 mb-6`}>
          <MobileAuthForm />
        </Card>

        {/* Features Section */}
        <div className="space-y-6 mb-6">
          <h2 className="text-lg font-bold">Why Choose OctopusFinancer?</h2>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-chart-bar text-emerald text-xs"></i>
            </div>
            <div>
              <h3 className="font-medium text-sm">Smart Budget Tracking</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                Automatically categorize transactions and get insights on your spending habits.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-bullseye text-emerald text-xs"></i>
            </div>
            <div>
              <h3 className="font-medium text-sm">Financial Goal Planning</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                Set savings goals and track your progress with visual dashboards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-brain text-emerald text-xs"></i>
            </div>
            <div>
              <h3 className="font-medium text-sm">AI-Powered Insights</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                Get personalized recommendations to optimize your financial decisions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Tab Bar
      <nav className={`fixed bottom-0 w-full max-w-[430px] border-t grid grid-cols-5 py-2 px-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
          <i className={`fas fa-home text-lg ${isDark ? 'text-gray-500' : 'text-gray-600'}`}></i>
          <span className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Home</span>
        </div>
        <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
          <i className={`fas fa-chart-line text-lg ${isDark ? 'text-gray-500' : 'text-gray-600'}`}></i>
          <span className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Insights</span>
        </div>
        <div className="flex flex-col items-center justify-center cursor-pointer">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center -mt-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <i className={`fas fa-plus-circle text-2xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}></i>
          </div>
          <span className={`text-[10px] mt-0 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Add</span>
        </div>
        <div className="flex flex-col items-center justify-center cursor-pointer">
          <i className={`fas fa-credit-card text-lg ${isDark ? 'text-gray-500' : 'text-gray-600'}`}></i>
          <span className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Accounts</span>
        </div>
        <div className="flex flex-col items-center justify-center cursor-pointer">
          <i className="fas fa-user text-emerald text-lg"></i>
          <span className="text-[10px] mt-1 text-emerald">Profile</span>
        </div>
      </nav> */}
    </div>
  );
};

export default MobileAuthPage;
