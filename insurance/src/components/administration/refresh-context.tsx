'use client';

import React, { createContext, useContext, useState } from 'react';

interface RefreshContextType {
  customerAgentRefreshTrigger: number;
  policyAgentRefreshTrigger: number;
  refreshTrigger: number; // Added for supervisor management
  triggerCustomerAgentRefresh: () => void;
  triggerPolicyAgentRefresh: () => void;
  triggerRefresh: () => void; // Added for supervisor management
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [customerAgentRefreshTrigger, setCustomerAgentRefreshTrigger] = useState(0);
  const [policyAgentRefreshTrigger, setPolicyAgentRefreshTrigger] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerCustomerAgentRefresh = () => {
    setCustomerAgentRefreshTrigger(prev => prev + 1);
  };

  const triggerPolicyAgentRefresh = () => {
    setPolicyAgentRefreshTrigger(prev => prev + 1);
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <RefreshContext.Provider 
      value={{ 
        customerAgentRefreshTrigger, 
        policyAgentRefreshTrigger, 
        refreshTrigger,
        triggerCustomerAgentRefresh, 
        triggerPolicyAgentRefresh,
        triggerRefresh
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefreshContext() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefreshContext must be used within a RefreshProvider');
  }
  return context;
}
