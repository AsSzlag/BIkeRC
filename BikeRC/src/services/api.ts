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
  results?: any;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Measurements API
export const measurementsAPI = {
  // Get all measurements with pagination
  getMeasurements: async (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder || 'asc');
    }
    
    const response = await axiosConfig.get(`/measurements?${params}`);
    return response.data as PaginatedResponse<Measurement>;
  },

  // Get single measurement by ID
  getMeasurement: async (id: string) => {
    const response = await axiosConfig.get(`/measurements/${id}`);
    return response.data as Measurement;
  },

  // Create new measurement
  createMeasurement: async (measurement: Omit<Measurement, 'id'>) => {
    const response = await axiosConfig.post('/measurements', measurement);
    return response.data as Measurement;
  },

  // Update measurement
  updateMeasurement: async (id: string, measurement: Partial<Measurement>) => {
    const response = await axiosConfig.put(`/measurements/${id}`, measurement);
    return response.data as Measurement;
  },

  // Delete measurement
  deleteMeasurement: async (id: string) => {
    await axiosConfig.delete(`/measurements/${id}`);
  },
};

// Analyses API
export const analysesAPI = {
  // Get all analyses with pagination
  getAnalyses: async (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder || 'asc');
    }
    
    const response = await axiosConfig.get(`/analyses?${params}`);
    return response.data as PaginatedResponse<Analysis>;
  },

  // Get single analysis by ID
  getAnalysis: async (id: string) => {
    const response = await axiosConfig.get(`/analyses/${id}`);
    return response.data as Analysis;
  },

  // Create new analysis
  createAnalysis: async (analysis: Omit<Analysis, 'id'>) => {
    const response = await axiosConfig.post('/analyses', analysis);
    return response.data as Analysis;
  },

  // Update analysis
  updateAnalysis: async (id: string, analysis: Partial<Analysis>) => {
    const response = await axiosConfig.put(`/analyses/${id}`, analysis);
    return response.data as Analysis;
  },

  // Delete analysis
  deleteAnalysis: async (id: string) => {
    await axiosConfig.delete(`/analyses/${id}`);
  },
};

// Auth API
export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    const response = await axiosConfig.post('/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (userData: { email: string; password: string; name: string }) => {
    const response = await axiosConfig.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    await axiosConfig.post('/auth/logout');
    localStorage.removeItem('authToken');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosConfig.get('/auth/me');
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  // Get user settings
  getSettings: async () => {
    const response = await axiosConfig.get('/settings');
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings: {
    firstName?: string;
    lastName?: string;
    address?: string;
    email?: string;
    phone?: string;
  }) => {
    const response = await axiosConfig.put('/settings', settings);
    return response.data;
  },
};
