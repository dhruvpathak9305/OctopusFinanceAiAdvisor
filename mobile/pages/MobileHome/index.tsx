import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTheme } from '@/common/providers/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { MOBILE_ROUTES } from '../../routes/mobileRoutes';
import { useDemoMode } from '@/contexts/DemoModeContext';

const MobileHome: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const navigate = useNavigate();
  const { setIsDemo } = useDemoMode();

  const handleNavigateToDashboard = () => {
    navigate(MOBILE_ROUTES.DASHBOARD);
  };
  
  const handleTryDemo = () => {
    try {
      setIsDemo(true);
      navigate(MOBILE_ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error setting demo mode:', error);
    }
  };
  
  const handleGoToDashboard = () => {
    try {
      setIsDemo(false);
      navigate(MOBILE_ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error navigating to dashboard:', error);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen w-full max-w-[430px] mx-auto relative ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <main className="flex-1 pt-4">
        {/* Hero Section */}
        <section className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold leading-tight">
            Take control of <span className="text-emerald block">your financial future</span>
          </h1>
          <p className={`text-xs mt-1.5 mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            OctopusFinancer helps you track, budget, and optimize your finances with powerful AI insights.
          </p>

          {/* Feature List */}
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-chart-line text-emerald text-xs"></i>
              </div>
              <div>
                <h3 className="font-medium text-sm">Smart Transaction Analysis</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Automatically categorize and analyze your spending patterns</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-emerald text-xs"></i>
              </div>
              <div>
                <h3 className="font-medium text-sm">AI Financial Advisor</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Get personalized recommendations to improve your financial health</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-university text-emerald text-xs"></i>
              </div>
              <div>
                <h3 className="font-medium text-sm">Multi-Account Management</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Connect and manage all your financial accounts in one place</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button 
              className="bg-emerald hover:bg-emerald/90 text-black flex-1 rounded-md text-xs h-9"
              onClick={handleTryDemo}
            >
              Try Demo <i className="fas fa-arrow-right ml-1.5"></i>
            </Button>
            <Button variant="outline" className={`flex-1 rounded-md text-xs h-9 ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
              Learn More
            </Button>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="px-4 mb-8">
          <Card className="bg-emerald border-emerald overflow-hidden shadow-lg">
            <div className="p-3 text-black">
              <h2 className="font-bold text-base">Dashboard Preview</h2>
              <p className="text-xs opacity-80">Get instant insights into your financial health</p>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-black/10 p-2 rounded-lg">
                  <p className="text-2xs font-medium">Needs</p>
                  <p className="text-xs font-bold">65% of budget</p>
                  <Progress value={65} className="h-1 mt-1.5 bg-black/20" />
                </div>
                <div className="bg-black/10 p-2 rounded-lg">
                  <p className="text-2xs font-medium">Wants</p>
                  <p className="text-xs font-bold">30% of budget</p>
                  <Progress value={30} className="h-1 mt-1.5 bg-black/20" />
                </div>
                <div className="bg-black/10 p-2 rounded-lg">
                  <p className="text-2xs font-medium">Save</p>
                  <p className="text-xs font-bold">5% of budget</p>
                  <Progress value={5} className="h-1 mt-1.5 bg-black/20" />
                </div>
              </div>

              <Button 
                className="mt-3 bg-darkGreen hover:bg-darkGreen/80 text-white text-xs w-full rounded-md h-8"
                onClick={handleGoToDashboard}
              >
                Go to Dashboard <i className="fas fa-chevron-right ml-1.5"></i>
              </Button>
            </div>
          </Card>
        </section>

        {/* Features Section */}
        <section className="px-4 mb-8">
          <h2 className="text-xl font-bold text-center mb-1.5">Powerful Features for Better Finance</h2>
          <p className={`text-sm text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            OctopusFinancer combines smart app automation with powerful insights.
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Card className={`p-3 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center mb-2">
                <i className="fas fa-chart-pie text-emerald text-sm"></i>
              </div>
              <h3 className="font-medium text-base mb-0.5">Smart Budgeting</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Effortlessly create and manage budgets based on the 50/30/20 rule or customize to fit your financial goals.
              </p>
            </Card>

            <Card className={`p-3 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center mb-2">
                <i className="fas fa-brain text-emerald text-sm"></i>
              </div>
              <h3 className="font-medium text-base mb-0.5">AI-Powered Insights</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Get personalized recommendations and insights powered by advanced AI patterns from your spending data.
              </p>
            </Card>

            <Card className={`p-3 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center mb-2">
                <i className="fas fa-tags text-emerald text-sm"></i>
              </div>
              <h3 className="font-medium text-base mb-0.5">Automatic Categorization</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Transactions are automatically categorized using machine learning, saving you hours of manual work.
              </p>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 mb-8">
          <h2 className="text-xl font-bold text-center mb-1.5">What Our Users Say</h2>
          <p className={`text-sm text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Join thousands who've transformed their finances with OctopusFinancer.
          </p>

          <div className="overflow-x-auto pb-3 -mx-4 px-4">
            <div className="flex gap-3 w-max">
              <Card className={`p-3 w-[250px] flex-shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex text-yellow-400 mb-1.5">
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                </div>
                <p className="text-xs italic mb-2">
                  "OctopusFinancer helped me save an extra $470 each month by identifying unnecessary subscriptions."
                </p>
                <p className="text-2xs font-medium">Sarah J. <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Marketing Specialist</span></p>
              </Card>

              <Card className={`p-3 w-[250px] flex-shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex text-yellow-400 mb-1.5">
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                </div>
                <p className="text-xs italic mb-2">
                  "The AI categorization is incredibly accurate. I no longer spend hours organizing expenses."
                </p>
                <p className="text-2xs font-medium">Michael T. <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Software Engineer</span></p>
              </Card>

              <Card className={`p-3 w-[250px] flex-shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex text-yellow-400 mb-1.5">
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                </div>
                <p className="text-xs italic mb-2">
                  "I've tried many budgeting apps, but the goal tracker finally helped me achieve my goals."
                </p>
                <p className="text-2xs font-medium">Ana L. <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Healthcare Professional</span></p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 mb-8">
          <Card className={`p-4 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="text-lg font-bold mb-1.5">Ready to Transform Your Finances?</h2>
            <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Join OctopusFinancer today and start your journey toward financial wellness with AI-powered insights.
            </p>
            <div className="space-y-2">
              <Button className="bg-emerald hover:bg-emerald/80 text-black w-full rounded-md text-xs h-8">
                Get Started For Free
              </Button>
              <Button variant="outline" className={`w-full rounded-md text-xs h-8 ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                View Plans
              </Button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default MobileHome;