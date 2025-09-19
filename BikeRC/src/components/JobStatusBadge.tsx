import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { type UploadResponse } from '../types/job';

interface JobStatusBadgeProps {
  job: UploadResponse;
  showDetails?: boolean;
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ job, showDetails = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#e8f5e8', color: '#2e7d32', text: 'Ukończone' };
      case 'processing':
        return { bg: '#fff3cd', color: '#856404', text: 'Przetwarzanie' };
      case 'failed':
        return { bg: '#f8d7da', color: '#721c24', text: 'Błąd' };
      case 'pending':
      default:
        return { bg: '#e2e3e5', color: '#383d41', text: 'Oczekujące' };
    }
  };

  const statusInfo = getStatusColor(job.status || 'pending');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Chip
        label={statusInfo.text}
        size="small"
        sx={{
          backgroundColor: statusInfo.bg,
          color: statusInfo.color,
          fontWeight: 'bold',
          fontSize: '0.75rem',
          height: 24,
        }}
      />
      
      {showDetails && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
            Czas: {job.estimated_wait_time}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
            Kolejka: #{job.queue_position}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
            ID: {job.job_id.slice(0, 8)}...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default JobStatusBadge;
