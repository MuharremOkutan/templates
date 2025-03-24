import * as React from "react";

interface TabsContextType {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, className = "", children }: TabsProps) {
  const [selectedTab, setSelectedTab] = React.useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className = "", children }: TabsListProps) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md p-1 ${className}`}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value, className = "", children }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }
  
  const { selectedTab, setSelectedTab } = context;
  const isSelected = selectedTab === value;
  
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none ${
        isSelected ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-400"
      } ${className}`}
      onClick={() => setSelectedTab(value)}
      data-state={isSelected ? "active" : "inactive"}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className = "", children }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }
  
  const { selectedTab } = context;
  
  if (selectedTab !== value) {
    return null;
  }
  
  return <div className={className}>{children}</div>;
} 