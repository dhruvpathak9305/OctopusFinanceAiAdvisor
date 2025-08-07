import React from 'react';
import { Tabs as UITabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabData {
  value: string;
  label: string;
  icon: string;
  content: React.ReactNode;
}

export interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabData[];
}

const Tabs: React.FC<TabsProps> = ({
  activeTab,
  onTabChange,
  tabs,
}) => {
  // Find the active tab content
  const activeTabData = tabs.find(tab => tab.value === activeTab);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Tab Headers */}
      <UITabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10 bg-gray-100 dark:bg-gray-800 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-500 py-1.5 sm:py-2"
            >
              <i className={`${tab.icon} mr-1 text-xs sm:text-sm`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </UITabs>
      
      {/* Active Tab Content with main content area */}
      <main className="flex-1 py-2 sm:py-4">
        {activeTabData && activeTabData.content}
      </main>
    </div>
  );
};

export default Tabs; 