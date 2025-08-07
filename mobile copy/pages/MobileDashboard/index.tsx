import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { Dialog } from "@/components/ui/dialog";
import QuickAddButton from '@/components/common/QuickAddButton';
import MobileTravel from '@/components/dashboard/MobileTravel';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Import Financial Advisor Chat and SMS Analysis Chat
import { FinancialAdvisorChat } from '@/components/financialAdvisorChat';
import SmsAnalysisChat from '@/components/dashboard/SmsAnalysisChat';

// Import all the sub-components
import Header from './Header';
import BudgetProgressSection from './BudgetProgressSection';
import RecentTransactionsSection from './RecentTransactionsSection';
import UpcomingBillsSection from './UpcomingBillsSection';

// Import individual financial summary cards
import { 
  NetWorthCard, 
  AccountsCard, 
  CreditCardCard, 
  MonthlyIncomeCard, 
  MonthlyExpenseCard 
} from '@/mobile/components/FinancialSummary';

// Define types for fixed data
const financialData = {
  netWorth: {
    value: "$42,680",
    change: "+3.6%",
    trend: "up"
  },
  accounts: {
    value: "$4,000.00",
    change: "+1.0%",
    trend: "up"
  },
  creditCardDebt: {
    value: "$2,000.00",
    change: "-2.7%",
    trend: "down"
  },
  monthlyIncome: {
    value: "$4,850.00",
    change: "+3.8%",
    trend: "up"
  },
  monthlyExpenses: {
    value: "$3,280.45",
    change: "+2.2%",
    trend: "up"
  }
};

// Category icons mapping
const categoryIcons = {
  "Home Decor": "fa-home",
  "Healthcare": "fa-heartbeat",
  "Transportation": "fa-car",
  "Utilities": "fa-bolt",
  "Subscriptions": "fa-calendar-check"
};

// Card background images - using placeholder URLs
const cardBackgroundImages = {
  netWorth: "https://readdy.ai/api/search-image?query=abstract%20financial%20chart%20with%20green%20upward%20trend%20line%20on%20soft%20white%20background%2C%20minimalist%20design%2C%20clean%20professional%20look%2C%20subtle%20grid%20pattern%2C%20financial%20data%20visualization%2C%20centered%20composition%2C%20high%20quality%20rendering&width=300&height=150&seq=1&orientation=landscape",
  accounts: "https://readdy.ai/api/search-image?query=abstract%20banking%20chart%20with%20blue%20line%20graph%20on%20clean%20white%20background%2C%20minimalist%20financial%20data%20visualization%2C%20subtle%20grid%20pattern%2C%20professional%20look%2C%20centered%20composition%2C%20high%20quality%20rendering%2C%20soft%20gradients&width=300&height=150&seq=2&orientation=landscape",
  creditCard: "https://readdy.ai/api/search-image?query=abstract%20credit%20card%20debt%20visualization%20with%20red%20downward%20trend%20line%20on%20clean%20white%20background%2C%20minimalist%20financial%20chart%2C%20subtle%20grid%20pattern%2C%20professional%20look%2C%20centered%20composition%2C%20high%20quality%20rendering&width=300&height=150&seq=3&orientation=landscape",
  income: "https://readdy.ai/api/search-image?query=abstract%20income%20chart%20with%20green%20upward%20trend%20line%20on%20clean%20white%20background%2C%20minimalist%20financial%20visualization%2C%20subtle%20grid%20pattern%2C%20professional%20look%2C%20centered%20composition%2C%20high%20quality%20rendering%2C%20monthly%20data%20points&width=300&height=150&seq=4&orientation=landscape",
  expenses: "https://readdy.ai/api/search-image?query=abstract%20expense%20chart%20with%20orange%20trend%20line%20on%20clean%20white%20background%2C%20minimalist%20financial%20visualization%2C%20subtle%20grid%20pattern%2C%20professional%20look%2C%20centered%20composition%2C%20high%20quality%20rendering%2C%20monthly%20spending%20visualization&width=300&height=150&seq=5&orientation=landscape"
};

// Mock data for transactions
const recentTransactions = [
  { id: 1, category: "Home Decor", date: "May 14", amount: "$125.00", type: "expense" },
  { id: 2, category: "Healthcare", date: "May 13", amount: "$220.50", type: "expense" },
  { id: 3, category: "Transportation", date: "May 12", amount: "$45.00", type: "expense" },
  { id: 4, category: "Utilities", date: "May 11", amount: "$157.75", type: "expense" },
  { id: 5, category: "Subscriptions", date: "May 10", amount: "$15.99", type: "expense" }
];

// Mock data for upcoming bills
const upcomingBills = [
  { id: 1, name: "Rent", amount: "$1,050.00", dueDate: "Apr 30" },
  { id: 2, name: "Electricity", amount: "$85.32", dueDate: "Apr 15" },
  { id: 3, name: "Internet", amount: "$65.99", dueDate: "Apr 21" }
];

// Inner component that uses the context
const MobileDashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeBottomTab, setActiveBottomTab] = useState("dashboard");
  const navigate = useNavigate();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [useTestData, setUseTestData] = useState(true); // Default to true for testing

  // If the travel tab is active, show the travel component
  if (activeBottomTab === "travel") {
    // Render only the MobileTravel component in full-screen
    return <MobileTravel activeMainTab="travel" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="flex-1 mt-4">
        {/* Financial Dashboard Title with Theme Toggle */}
        <Header 
          title="Financial Dashboard"
          subtitle="Track, analyze, and optimize your finances in one place"
        />

        {/* Financial Summary Cards - Direct Implementation */}
        <div className="mb-6 overflow-x-auto whitespace-nowrap">
          <Swiper
            spaceBetween={12}
            slidesPerView={1.15}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="w-full"
          >
            <SwiperSlide>
              <NetWorthCard backgroundImage={cardBackgroundImages.netWorth} />
            </SwiperSlide>

            <SwiperSlide>
              <AccountsCard backgroundImage={cardBackgroundImages.accounts} />
            </SwiperSlide>

            <SwiperSlide>
              <CreditCardCard backgroundImage={cardBackgroundImages.creditCard} />
            </SwiperSlide>

            <SwiperSlide>
              <MonthlyIncomeCard backgroundImage={cardBackgroundImages.income} />
            </SwiperSlide>

            <SwiperSlide>
              <MonthlyExpenseCard backgroundImage={cardBackgroundImages.expenses} />
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-10 bg-gray-100 dark:bg-gray-800 p-1">
            <TabsTrigger
              value="overview"
              className="text-xs font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-500"
            >
              <i className="fas fa-chart-pie mr-1"></i> Overview
            </TabsTrigger>
            <TabsTrigger
              value="sms"
              className="text-xs font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-500"
            >
              <i className="fas fa-message mr-1"></i> SMS Analysis
            </TabsTrigger>
            <TabsTrigger
              value="advisor"
              className="text-xs font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-500"
            >
              <i className="fas fa-user-tie mr-1"></i> Financial Advisor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {/* Budget Progress Section */}
            <BudgetProgressSection />

            {/* Recent Transactions Section - updated to use new implementation */}
            <RecentTransactionsSection />

            {/* Upcoming Bills Section */}
            <UpcomingBillsSection useTestData={useTestData} />
          </TabsContent>

          <TabsContent value="sms" className="mt-4">
            <SmsAnalysisChat />
          </TabsContent>

          <TabsContent value="advisor" className="mt-4">
            <FinancialAdvisorChat />
          </TabsContent>
        </Tabs>
      </main>

      {/* Quick Add Button */}
      <QuickAddButton
        bottomSpacing={20}
        rightSpacing={4}
      />

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        {/* ... existing dialog content ... */}
      </Dialog>
    </div>
  );
};

// Remove ChatProvider usage
const MobileDashboard: React.FC = () => {
  return <MobileDashboardContent />;
};

export default MobileDashboard; 