/**
 * useIPO Hook
 * Manages IPO data and user applications
 */

import { useState, useEffect, useCallback } from 'react';
import { IPOService } from '../services/ipoService';
import type {
  IPO,
  IPOApplication,
  IPOApplicationInput,
  IPOStatus,
} from '../types/portfolio-extended';

export interface UseIPOReturn {
  // Data
  ipos: IPO[];
  upcomingIPOs: IPO[];
  myApplications: IPOApplication[];
  statistics: {
    total_applied: number;
    total_allotted: number;
    total_invested: number;
    total_gains: number;
    success_rate: number;
  };
  
  // Loading & Error
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchIPOs: (status?: IPOStatus) => Promise<void>;
  fetchUpcomingIPOs: () => Promise<void>;
  fetchMyApplications: () => Promise<void>;
  applyForIPO: (input: IPOApplicationInput) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useIPO = (): UseIPOReturn => {
  const [ipos, setIPOs] = useState<IPO[]>([]);
  const [upcomingIPOs, setUpcomingIPOs] = useState<IPO[]>([]);
  const [myApplications, setMyApplications] = useState<IPOApplication[]>([]);
  const [statistics, setStatistics] = useState({
    total_applied: 0,
    total_allotted: 0,
    total_invested: 0,
    total_gains: 0,
    success_rate: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch IPOs
  const fetchIPOs = useCallback(async (status?: IPOStatus) => {
    try {
      setError(null);
      const data = await IPOService.getIPOs(status);
      setIPOs(data);
    } catch (err) {
      console.error('Error fetching IPOs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch IPOs');
    }
  }, []);

  // Fetch upcoming IPOs
  const fetchUpcomingIPOs = useCallback(async () => {
    try {
      setError(null);
      const data = await IPOService.getUpcomingIPOs();
      setUpcomingIPOs(data);
    } catch (err) {
      console.error('Error fetching upcoming IPOs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming IPOs');
    }
  }, []);

  // Fetch user's applications
  const fetchMyApplications = useCallback(async () => {
    try {
      setError(null);
      const data = await IPOService.getUserApplications();
      setMyApplications(data);
      
      // Fetch statistics
      const stats = await IPOService.getIPOStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    }
  }, []);

  // Apply for IPO
  const applyForIPO = useCallback(async (input: IPOApplicationInput): Promise<boolean> => {
    try {
      setError(null);
      await IPOService.applyForIPO(input);
      
      // Refresh applications
      await fetchMyApplications();
      
      return true;
    } catch (err) {
      console.error('Error applying for IPO:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply for IPO');
      return false;
    }
  }, [fetchMyApplications]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchIPOs(),
      fetchUpcomingIPOs(),
      fetchMyApplications(),
    ]);
    setLoading(false);
  }, [fetchIPOs, fetchUpcomingIPOs, fetchMyApplications]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // Data
    ipos,
    upcomingIPOs,
    myApplications,
    statistics,
    
    // Loading & Error
    loading,
    error,
    
    // Actions
    fetchIPOs,
    fetchUpcomingIPOs,
    fetchMyApplications,
    applyForIPO,
    refreshData,
  };
};

