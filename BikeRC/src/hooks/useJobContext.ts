import { useContext } from 'react';
import { JobContext } from '../contexts/JobContextValue';

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};
