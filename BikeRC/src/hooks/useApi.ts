import { useState, useEffect } from 'react';
import { measurementsAPI, analysesAPI, settingsAPI } from '../services/api';
import type { Measurement, Analysis } from '../services/api';

// Custom hook for measurements
export const useMeasurements = (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
  const [data, setData] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await measurementsAPI.getMeasurements(page, limit, sortBy, sortOrder);
      setData(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch measurements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, sortBy, sortOrder]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, totalPages, total, refetch };
};

// Custom hook for analyses
export const useAnalyses = (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
  const [data, setData] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await analysesAPI.getAnalyses(page, limit, sortBy, sortOrder);
      setData(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, sortBy, sortOrder]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, totalPages, total, refetch };
};

// Custom hook for settings
export const useSettings = () => {
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await settingsAPI.updateSettings(newSettings);
      setSettings(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, updateSettings, refetch: fetchSettings };
};
