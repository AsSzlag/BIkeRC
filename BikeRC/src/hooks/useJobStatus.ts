import { useEffect, useCallback, useRef } from 'react';
import { useJobContext } from './useJobContext';
import { type UploadResponse } from '../types/job';
import apiService from '../services/ApiService';

export const useJobStatus = () => {
  const { jobs, updateJob } = useJobContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkJobStatus = useCallback(async (job: UploadResponse) => {
    try {
      console.log(`Checking status for job: ${job.job_id}`);
      const status = await apiService.getVideoJobStatus(job.job_id);
      
      // Update job with new status
      updateJob(job.job_id, {
        status: status.status,
        estimated_wait_time: status.estimated_wait_time || job.estimated_wait_time,
        queue_position: status.queue_position || job.queue_position,
      });

      console.log(`Job ${job.job_id} status:`, status);
      return status;
    } catch (error) {
      console.error(`Error checking status for job ${job.job_id}:`, error);
      // Mark as failed if we can't get status
      updateJob(job.job_id, { status: 'failed' });
    }
  }, [updateJob]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only poll jobs that are pending or processing
    const activeJobs = jobs.filter(job => 
      job.status === 'pending' || job.status === 'processing'
    );

    if (activeJobs.length === 0) {
      return;
    }

    console.log(`Starting polling for ${activeJobs.length} active jobs`);

    intervalRef.current = setInterval(async () => {
      for (const job of activeJobs) {
        await checkJobStatus(job);
      }
    }, 5000); // Poll every 5 seconds
  }, [jobs, checkJobStatus]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Stopped job status polling');
    }
  }, []);

  // Start/stop polling based on active jobs
  useEffect(() => {
    const activeJobs = jobs.filter(job => 
      job.status === 'pending' || job.status === 'processing'
    );

    if (activeJobs.length > 0) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [jobs, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    checkJobStatus,
    startPolling,
    stopPolling,
  };
};
