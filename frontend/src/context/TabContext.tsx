import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SidebarContextType {
  selectedItem: number;
  updateSelectedItem: (index: number) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const updateSelectedItem = (index: number) => {
    setSelectedItem(index);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const value: SidebarContextType = {
    selectedItem,
    updateSelectedItem,
    sidebarOpen,
    toggleSidebar
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;