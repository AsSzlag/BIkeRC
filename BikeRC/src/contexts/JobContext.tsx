import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { type UploadResponse, type JobContextType, type JobResponseData } from '../types/job';
import { JobContext } from './JobContextValue';

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<UploadResponse[]>([]);
  const [latest_analysis_job_id, setLatestAnalysisJobId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('bikerc_jobs');
      const savedLatestAnalysisId = localStorage.getItem('bikerc_latest_analysis_job_id');
      
      if (savedJobs) {
        setJobs(JSON.parse(savedJobs));
      }
      
      if (savedLatestAnalysisId) {
        setLatestAnalysisJobId(savedLatestAnalysisId);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    try {
      localStorage.setItem('bikerc_jobs', JSON.stringify(jobs));
    } catch (error) {
      console.error('Error saving jobs to localStorage:', error);
    }
  }, [jobs]);

  // Save latest analysis job ID to localStorage whenever it changes
  useEffect(() => {
    try {
      if (latest_analysis_job_id) {
        localStorage.setItem('bikerc_latest_analysis_job_id', latest_analysis_job_id);
      } else {
        localStorage.removeItem('bikerc_latest_analysis_job_id');
      }
    } catch (error) {
      console.error('Error saving latest analysis job ID to localStorage:', error);
    }
  }, [latest_analysis_job_id]);

  const addJob = useCallback((job: UploadResponse) => {
    setJobs(prev => {
      // Check if job already exists, if so update it
      const existingIndex = prev.findIndex(j => j.job_id === job.job_id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...job };
        return updated;
      }
      // Add new job at the beginning
      return [job, ...prev];
    });
    
    // Set as latest analysis job if it's an analysis
    if (job.type === 'analysis') {
      setLatestAnalysisJobId(job.job_id);
    }
  }, []);

  const updateJob = useCallback((jobId: string, updates: Partial<UploadResponse>) => {
    setJobs(prev => 
      prev.map(job => 
        job.job_id === jobId 
          ? { ...job, ...updates }
          : job
      )
    );
  }, []);

  const getJob = useCallback((jobId: string) => {
    return jobs.find(job => job.job_id === jobId);
  }, [jobs]);

  const getJobsByType = useCallback((type: 'measurement' | 'analysis') => {
    return jobs.filter(job => job.type === type);
  }, [jobs]);

  const removeJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(job => job.job_id !== jobId));
  }, []);

  const clearJobs = useCallback(() => {
    setJobs([]);
  }, []);

  const saveJobResponseData = useCallback((data: JobResponseData) => {
    try {
      const key = `bikerc_job_response_${data.job_id}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Saved job response data for job ${data.job_id}:`, data);
    } catch (error) {
      console.error('Error saving job response data to localStorage:', error);
    }
  }, []);

  const getJobResponseData = useCallback((jobId: string): JobResponseData | null => {
    try {
      const key = `bikerc_job_response_${jobId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading job response data from localStorage:', error);
      return null;
    }
  }, []);

  const value: JobContextType = {
    jobs,
    latest_analysis_job_id,
    addJob,
    updateJob,
    getJob,
    getJobsByType,
    removeJob,
    clearJobs,
    setLatestAnalysisJobId,
    saveJobResponseData,
    getJobResponseData,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
