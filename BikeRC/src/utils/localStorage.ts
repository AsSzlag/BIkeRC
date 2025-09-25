// Utility functions for localStorage management

export const STORAGE_KEYS = {
  JOBS: 'bikerc_jobs',
  LATEST_ANALYSIS_JOB_ID: 'bikerc_latest_analysis_job_id',
  JOB_RESPONSE_PREFIX: 'bikerc_job_response_',
  JOB_METADATA: 'bikerc_job_metadata',
  JOBS_WITH_METADATA: 'bikerc_jobs_with_metadata',
} as const;

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

export const clearAllBikeRCData = (): void => {
  try {
    // Remove all BikeRC-related data
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key === STORAGE_KEYS.JOB_RESPONSE_PREFIX) {
        // Remove all job response data
        const keys = Object.keys(localStorage);
        keys.forEach(storageKey => {
          if (storageKey.startsWith(key)) {
            localStorage.removeItem(storageKey);
          }
        });
      } else {
        localStorage.removeItem(key);
      }
    });
    console.log('Cleared all BikeRC data from localStorage');
  } catch (error) {
    console.error('Error clearing BikeRC data from localStorage:', error);
  }
};

export const getStorageSize = (): { used: number; available: number } => {
  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Estimate available space (most browsers have 5-10MB limit)
    const available = 5 * 1024 * 1024 - used; // 5MB - used
    
    return { used, available };
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return { used: 0, available: 0 };
  }
};
