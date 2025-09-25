import axiosConfig from '../config/axios';

// Types for API responses
export interface Measurement {
  id: string;
  client: string;
  bike: string;
  status: string;
  date: string;
  measurements?: {
    height: number;
    inseam: number;
    torso: number;
    arm: number;
    shoulderWidth: number;
  };
  notes?: string;
}

export interface Analysis {
  id: string;
  client: string;
  bike: string;
  status: string;
  date: string;
  results?: Record<string, unknown>;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Mo2s Video Processing API Types
export interface VideoProcessingJob {
  id: string;
  job_id: string;
  filename: string;
  message: string;
  estimated_wait_time: string;
  queue_position: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputUrl?: string;
  outputUrl?: string;
  progress?: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface VideoDownloadRequest {
  videoId: string;
  format?: 'mp4' | 'avi' | 'mov';
  quality?: 'low' | 'medium' | 'high';
}

export interface VideoDownloadResponse {
  downloadUrl: string;
  expiresAt: string;
  filename: string;
  size: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
}

// Base API Service Class
class ApiService {
  constructor() {
    // Initialize the service
  }

  // Generic HTTP methods
  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await axiosConfig.get(url, { params });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private async post<T>(url: string, data?: unknown): Promise<T> {
    try {
      const response = await axiosConfig.post(url, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private async put<T>(url: string, data?: unknown): Promise<T> {
    try {
      const response = await axiosConfig.put(url, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private async delete<T>(url: string): Promise<T> {
    try {
      const response = await axiosConfig.delete(url);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    const axiosError = error as {
      response?: {
        data?: { message?: string; code?: string };
        status?: number;
      };
      message?: string;
    };
    
    const apiError: ApiError = {
      message: axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred',
      status: axiosError.response?.status || 500,
      code: axiosError.response?.data?.code,
    };
    return apiError;
  }

  // Measurements API Methods
  async getMeasurements(
    page: number = 1, 
    limit: number = 10, 
    sortBy?: string, 
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<Measurement>> {
    const params: Record<string, unknown> = { page, limit };
    
    if (sortBy) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder || 'asc';
    }
    
    return this.get<PaginatedResponse<Measurement>>('/measurements', params);
  }


  async getMeasurement(id: string): Promise<Measurement> {
    return this.get<Measurement>(`/measurements/${id}`);
  }

  async createMeasurement(measurement: Omit<Measurement, 'id'>): Promise<Measurement> {
    return this.post<Measurement>('/measurements', measurement);
  }

  async updateMeasurement(id: string, measurement: Partial<Measurement>): Promise<Measurement> {
    return this.put<Measurement>(`/measurements/${id}`, measurement);
  }

  async deleteMeasurement(id: string): Promise<void> {
    return this.delete<void>(`/measurements/${id}`);
  }

  // Analyses API Methods
  async getAnalyses(
    page: number = 1, 
    limit: number = 10, 
    sortBy?: string, 
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<Analysis>> {
    const params: Record<string, unknown> = { page, limit };
    
    if (sortBy) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder || 'asc';
    }
    
    return this.get<PaginatedResponse<Analysis>>('/analyses', params);
  }

  async getAnalysis(id: string): Promise<Analysis> {
    return this.get<Analysis>(`/analyses/${id}`);
  }

  async createAnalysis(analysis: Omit<Analysis, 'id'>): Promise<Analysis> {
    return this.post<Analysis>('/analyses', analysis);
  }

  async updateAnalysis(id: string, analysis: Partial<Analysis>): Promise<Analysis> {
    return this.put<Analysis>(`/analyses/${id}`, analysis);
  }

  async deleteAnalysis(id: string): Promise<void> {
    return this.delete<void>(`/analyses/${id}`);
  }

  // Authentication API Methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', { email, password });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async register(userData: { email: string; password: string; name: string }): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', userData);
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post<void>('/auth/logout');
    } finally {
      // Always remove token from localStorage
      localStorage.removeItem('authToken');
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/auth/me');
  }

  // Settings API Methods
  async getSettings(): Promise<User> {
    return this.get<User>('/settings');
  }

  async updateSettings(settings: {
    firstName?: string;
    lastName?: string;
    address?: string;
    email?: string;
    phone?: string;
  }): Promise<User> {
    return this.put<User>('/settings', settings);
  }

  // Utility Methods
  async uploadFile(file: File, endpoint: string = '/upload'): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axiosConfig.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await axiosConfig.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Mo2s Video Processing API Methods
  
  /**
   * Performs a health check to verify the Mo2s API's availability
   * Based on: https://api-mo2s.netrix.com.pl/docs#/default/health_check_health_get
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.get<HealthCheckResponse>('/health');
  }

  async getAllJobs(): Promise<VideoProcessingJob[]> {
    return this.get<VideoProcessingJob[]>('/api/jobs');
  }

  /**
   * Test method to get root endpoint data
   * This is a basic test to verify API connectivity
   */
  async getTest(): Promise<{ message: string; timestamp: string; status: string }> {
    return this.get<{ message: string; timestamp: string; status: string }>('/test');
  }

  /**
   * Downloads a video by ID
   * Based on the API documentation for video download functionality
   */
  async downloadVideo(videoId: string, format: 'mp4' | 'avi' | 'mov' = 'mp4'): Promise<VideoDownloadResponse> {
    return this.get<VideoDownloadResponse>(`/api/download/video/${videoId}`, { format });
  }

  /**
   * Gets video processing job status
   */
  async getVideoJobStatus(jobId: string): Promise<VideoProcessingJob> {
    return this.get<VideoProcessingJob>(`/api/jobs/${jobId}`);
  }

  /**
   * Creates a new video processing job
   */
  async createVideoJob(inputUrl: string, options?: {
    format?: 'mp4' | 'avi' | 'mov';
    quality?: 'low' | 'medium' | 'high';
    processingType?: 'convert' | 'compress' | 'enhance';
  }): Promise<VideoProcessingJob> {
    return this.post<VideoProcessingJob>('/api/jobs', {
      inputUrl,
      ...options
    });
  }

  /**
   * Lists all video processing jobs
   */
  async getVideoJobs(page: number = 1, limit: number = 10): Promise<PaginatedResponse<VideoProcessingJob>> {
    return this.get<PaginatedResponse<VideoProcessingJob>>('/api/jobs', { page, limit });
  }

  getJobDetails(jobId: string): Promise<VideoProcessingJob> {
    return this.get<VideoProcessingJob>(`/api/job/${jobId}/details`);
  }

  /**
   * Cancels a video processing job
   */
  async cancelVideoJob(jobId: string): Promise<void> {
    return this.delete<void>(`/api/jobs/${jobId}`);
  }

  async uplaodVideo(file: File): Promise<VideoProcessingJob> {
    return this.post<VideoProcessingJob>('/api/upload', { file });
  }

  /**
   * Downloads processed video file
   */
  async downloadProcessedVideo(jobId: string): Promise<Blob> {
    try {
      const response = await axiosConfig.get(`/api/jobs/${jobId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Uploads a video file for processing
   */
  async uploadVideo(file: File, options?: {
    format?: 'mp4' | 'avi' | 'mov';
    quality?: 'low' | 'medium' | 'high';
    processingType?: 'convert' | 'compress' | 'enhance';
  }): Promise<VideoProcessingJob> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
    }
    
    try {
      const response = await axiosConfig.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Gets API usage statistics
   */
  async getApiStats(): Promise<{
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
  }> {
    return this.get<{
      totalJobs: number;
      completedJobs: number;
      failedJobs: number;
      totalProcessingTime: number;
      averageProcessingTime: number;
    }>('/api/stats');
  }

  /**
   * Gets available video formats and quality options
   */
  async getVideoOptions(): Promise<{
    formats: string[];
    qualities: string[];
    processingTypes: string[];
  }> {
    return this.get<{
      formats: string[];
      qualities: string[];
      processingTypes: string[];
    }>('/api/options');
  }

  /**
   * Uploads a measurement video with metadata
   */
  async uploadMeasurement(formData: FormData): Promise<VideoProcessingJob> {
    try {
      const response = await axiosConfig.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Search method
  async search(query: string, type?: 'measurements' | 'analyses' | 'all'): Promise<{
    measurements?: Measurement[];
    analyses?: Analysis[];
    total: number;
  }> {
    const params: Record<string, unknown> = { q: query };
    if (type && type !== 'all') {
      params.type = type;
    }
    
    return this.get<{
      measurements?: Measurement[];
      analyses?: Analysis[];
      total: number;
    }>('/search', params);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual API methods for convenience
export const {
  // Measurements
  getMeasurements,
  getMeasurement,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  
  // Analyses
  getAnalyses,
  getAnalysis,
  createAnalysis,
  updateAnalysis,
  deleteAnalysis,
  
  // Auth
  login,
  register,
  logout,
  getCurrentUser,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Utilities
  uploadFile,
  downloadFile,
  healthCheck,
  search,
  
  // Mo2s Video Processing API
  getTest,
  downloadVideo,
  getVideoJobStatus,
  createVideoJob,
  getVideoJobs,
  cancelVideoJob,
  downloadProcessedVideo,
  uploadVideo,
  uploadMeasurement,
  getApiStats,
  getVideoOptions,
} = apiService;
