import { createContext } from 'react';
import { type JobContextType } from '../types/job';

export const JobContext = createContext<JobContextType | undefined>(undefined);
