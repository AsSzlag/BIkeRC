// Service for managing job metadata that combines backend job_id with local custom data
import { saveToLocalStorage, loadFromLocalStorage, STORAGE_KEYS } from '../utils/localStorage';

export interface JobMetadata {
  job_id: string;
  name: string;           // Custom name for the job
  rower: string;          // Cyclist/rider name
  type: 'analysis' | 'measurement';
  created_at: string;
  updated_at: string;
  
  // Optional additional metadata
  description?: string;
  tags?: string[];
  client_info?: {
    age?: number;
    height?: number;
    weight?: number;
    experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  };
  bike_info?: {
    brand?: string;
    model?: string;
    size?: string;
    year?: number;
  };
  session_info?: {
    duration?: number;
    location?: string;
    weather?: string;
    notes?: string;
  };
}

export interface JobWithMetadata {
  job_id: string;
  backend_data: any;      // Data from backend API
  metadata: JobMetadata;  // Local metadata
  status: string;
  last_synced: string;
}

class JobMetadataService {
  private readonly METADATA_KEY = 'bikerc_job_metadata';
  private readonly JOBS_WITH_METADATA_KEY = 'bikerc_jobs_with_metadata';

  // Save job metadata
  saveJobMetadata(metadata: JobMetadata): void {
    try {
      const existingMetadata = this.getAllJobMetadata();
      const updatedMetadata = {
        ...existingMetadata,
        [metadata.job_id]: {
          ...metadata,
          updated_at: new Date().toISOString()
        }
      };
      saveToLocalStorage(this.METADATA_KEY, updatedMetadata);
      console.log('Saved job metadata:', metadata);
    } catch (error) {
      console.error('Error saving job metadata:', error);
    }
  }

  // Get job metadata by job_id
  getJobMetadata(job_id: string): JobMetadata | null {
    try {
      const allMetadata = this.getAllJobMetadata();
      return allMetadata[job_id] || null;
    } catch (error) {
      console.error('Error getting job metadata:', error);
      return null;
    }
  }

  // Get all job metadata
  getAllJobMetadata(): Record<string, JobMetadata> {
    try {
      return loadFromLocalStorage<Record<string, JobMetadata>>(this.METADATA_KEY) || {};
    } catch (error) {
      console.error('Error getting all job metadata:', error);
      return {};
    }
  }

  // Update job metadata
  updateJobMetadata(job_id: string, updates: Partial<JobMetadata>): void {
    try {
      const existing = this.getJobMetadata(job_id);
      if (existing) {
        const updated = {
          ...existing,
          ...updates,
          job_id, // Ensure job_id doesn't get overwritten
          updated_at: new Date().toISOString()
        };
        this.saveJobMetadata(updated);
      }
    } catch (error) {
      console.error('Error updating job metadata:', error);
    }
  }

  // Delete job metadata
  deleteJobMetadata(job_id: string): void {
    try {
      const allMetadata = this.getAllJobMetadata();
      delete allMetadata[job_id];
      saveToLocalStorage(this.METADATA_KEY, allMetadata);
      console.log('Deleted job metadata for:', job_id);
    } catch (error) {
      console.error('Error deleting job metadata:', error);
    }
  }

  // Combine backend job data with local metadata
  combineJobWithMetadata(backendJob: any): JobWithMetadata | null {
    try {
      const metadata = this.getJobMetadata(backendJob.job_id);
      if (!metadata) {
        return null;
      }

      return {
        job_id: backendJob.job_id,
        backend_data: backendJob,
        metadata,
        status: backendJob.status || 'unknown',
        last_synced: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error combining job with metadata:', error);
      return null;
    }
  }

  // Get all jobs with metadata
  getAllJobsWithMetadata(backendJobs: any[]): JobWithMetadata[] {
    try {
      return backendJobs
        .map(job => this.combineJobWithMetadata(job))
        .filter((job): job is JobWithMetadata => job !== null);
    } catch (error) {
      console.error('Error getting all jobs with metadata:', error);
      return [];
    }
  }

  // Search jobs by metadata
  searchJobsByMetadata(searchTerm: string): JobMetadata[] {
    try {
      const allMetadata = this.getAllJobMetadata();
      const searchLower = searchTerm.toLowerCase();
      
      return Object.values(allMetadata).filter(metadata => 
        metadata.name.toLowerCase().includes(searchLower) ||
        metadata.rower.toLowerCase().includes(searchLower) ||
        metadata.description?.toLowerCase().includes(searchLower) ||
        metadata.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        metadata.bike_info?.brand?.toLowerCase().includes(searchLower) ||
        metadata.bike_info?.model?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching jobs by metadata:', error);
      return [];
    }
  }

  // Get jobs by type
  getJobsByType(type: 'analysis' | 'measurement'): JobMetadata[] {
    try {
      const allMetadata = this.getAllJobMetadata();
      return Object.values(allMetadata).filter(metadata => metadata.type === type);
    } catch (error) {
      console.error('Error getting jobs by type:', error);
      return [];
    }
  }

  // Get jobs by rower (cyclist)
  getJobsByRower(rower: string): JobMetadata[] {
    try {
      const allMetadata = this.getAllJobMetadata();
      return Object.values(allMetadata).filter(metadata => 
        metadata.rower.toLowerCase() === rower.toLowerCase()
      );
    } catch (error) {
      console.error('Error getting jobs by rower:', error);
      return [];
    }
  }

  // Get unique rowers (cyclists)
  getUniqueRowers(): string[] {
    try {
      const allMetadata = this.getAllJobMetadata();
      const rowers = Object.values(allMetadata).map(metadata => metadata.rower);
      return [...new Set(rowers)].sort();
    } catch (error) {
      console.error('Error getting unique rowers:', error);
      return [];
    }
  }

  // Get recent jobs (last 30 days)
  getRecentJobs(days: number = 30): JobMetadata[] {
    try {
      const allMetadata = this.getAllJobMetadata();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return Object.values(allMetadata)
        .filter(metadata => new Date(metadata.created_at) >= cutoffDate)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('Error getting recent jobs:', error);
      return [];
    }
  }

  // Export all metadata as JSON
  exportMetadata(): string {
    try {
      const allMetadata = this.getAllJobMetadata();
      return JSON.stringify({
        metadata: allMetadata,
        exported_at: new Date().toISOString(),
        version: '1.0'
      }, null, 2);
    } catch (error) {
      console.error('Error exporting metadata:', error);
      return '{}';
    }
  }

  // Import metadata from JSON
  importMetadata(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      if (importData.metadata && typeof importData.metadata === 'object') {
        saveToLocalStorage(this.METADATA_KEY, importData.metadata);
        console.log('Successfully imported job metadata');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing metadata:', error);
      return false;
    }
  }

  // Clear all metadata
  clearAllMetadata(): void {
    try {
      saveToLocalStorage(this.METADATA_KEY, {});
      console.log('Cleared all job metadata');
    } catch (error) {
      console.error('Error clearing all metadata:', error);
    }
  }

  // Get statistics
  getStatistics() {
    try {
      const allMetadata = this.getAllJobMetadata();
      const jobs = Object.values(allMetadata);
      
      return {
        total_jobs: jobs.length,
        analyses: jobs.filter(j => j.type === 'analysis').length,
        measurements: jobs.filter(j => j.type === 'measurement').length,
        unique_rowers: this.getUniqueRowers().length,
        recent_jobs_30d: this.getRecentJobs(30).length,
        recent_jobs_7d: this.getRecentJobs(7).length,
        oldest_job: jobs.length > 0 ? jobs.reduce((oldest, job) => 
          new Date(job.created_at) < new Date(oldest.created_at) ? job : oldest
        ).created_at : null,
        newest_job: jobs.length > 0 ? jobs.reduce((newest, job) => 
          new Date(job.created_at) > new Date(newest.created_at) ? job : newest
        ).created_at : null
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total_jobs: 0,
        analyses: 0,
        measurements: 0,
        unique_rowers: 0,
        recent_jobs_30d: 0,
        recent_jobs_7d: 0,
        oldest_job: null,
        newest_job: null
      };
    }
  }
}

// Create singleton instance
const jobMetadataService = new JobMetadataService();
export default jobMetadataService;
