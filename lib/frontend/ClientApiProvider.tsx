'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { ClientApi } from './application/adapters/ClientApi';
import { ClientApiPort } from './application/ports/ClientApiPort';

const ClientApiContext = createContext<ClientApiPort | null>(null);

interface ClientApiProviderProps {
  children: ReactNode;
}

export function ClientApiProvider({ children }: ClientApiProviderProps) {
  const clientApi = useMemo(() => new ClientApi((...args) => fetch(...args)), []);

  return (
    <ClientApiContext.Provider value={clientApi}>
      {children}
    </ClientApiContext.Provider>
  );
}

export function useClientApi(): ClientApiPort {
  const context = useContext(ClientApiContext);
  
  if (!context) {
    throw new Error('useClientApi must be used within a ClientApiProvider');
  }
  
  return context;
}
