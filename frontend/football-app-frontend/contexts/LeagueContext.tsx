// contexts/LeagueContext.tsx
"use client";
import React, { createContext, useContext, useState } from 'react';
import { LeagueData } from '../app/league/page'; // Adjust the import path as needed

interface LeagueContextType {
  leagueData: LeagueData | null;
  setLeagueData: (data: LeagueData) => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export const LeagueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);

  return (
    <LeagueContext.Provider value={{ leagueData, setLeagueData }}>
      {children}
    </LeagueContext.Provider>
  );
};

export function useLeague() {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}