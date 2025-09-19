// Types for job data
export interface UploadResponse {
  job_id: string;
  filename: string;
  message: string;
  estimated_wait_time: string;
  queue_position: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  created_at?: string;
  client_name?: string;
  bike_model?: string;
  type: 'measurement' | 'analysis';
}

export interface JobResponseData {
  job_id: string;
  files?: string[];
  links?: string[];
  analysis_results?: any;
  download_urls?: string[];
  created_at: string;
}

export interface JobContextType {
  jobs: UploadResponse[];
  latest_analysis_job_id: string | null;
  addJob: (job: UploadResponse) => void;
  updateJob: (jobId: string, updates: Partial<UploadResponse>) => void;
  getJob: (jobId: string) => UploadResponse | undefined;
  getJobsByType: (type: 'measurement' | 'analysis') => UploadResponse[];
  removeJob: (jobId: string) => void;
  clearJobs: () => void;
  setLatestAnalysisJobId: (jobId: string) => void;
  saveJobResponseData: (data: JobResponseData) => void;
  getJobResponseData: (jobId: string) => JobResponseData | null;
}
