import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService, { type VideoProcessingJob } from '../services/ApiService';
import jobMetadataService from '../services/JobMetadataService';

const MeasurementsPage: React.FC = () => {
  const navigate = useNavigate();

  // State for managing measurements data
  interface MeasurementData {
    id: string;
    client: string;
    bike: string;
    name: string;
    date: string;
  }

  // API response type for getAllJobs
  interface JobsResponse {
    data?: VideoProcessingJob[];
    jobs?: VideoProcessingJob[];
  }

  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Fetch jobs data from API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all jobs from the API
      const response = await apiService.getAllJobs();
      console.log('API response:', response); // Debug log
      
      // Handle different response formats
      const jobs: VideoProcessingJob[] = Array.isArray(response) ? response : 
                                        (response as JobsResponse)?.data ? (response as JobsResponse).data! : 
                                        (response as JobsResponse)?.jobs ? (response as JobsResponse).jobs! : [];
      
      console.log('Jobs array:', jobs); // Debug log
      
      // Ensure jobs is an array before mapping
      if (!Array.isArray(jobs)) {
        console.error('Jobs is not an array:', jobs);
        setError('Invalid data format received from server');
        return;
      }
      
      // Map VideoProcessingJob data to MeasurementData format, combining with metadata
      const measurementsData: MeasurementData[] = jobs.map(job => {
        const metadata = jobMetadataService.getJobMetadata(job.job_id || job.id);
        console.log('Metadata:', metadata);
        
        return {
          id: job.job_id || job.id,
          client: metadata?.name || job.filename || 'Nieznany klient',
          bike: metadata?.bike_info?.model || metadata?.bike_info?.brand || 'Nieznany rower',
          name: metadata?.name || `Pomiar`,
          date: metadata?.updated_at 
            ? new Date(metadata.updated_at).toLocaleDateString('pl-PL')
            : new Date().toLocaleDateString('pl-PL')
        };
      });
      
      setMeasurements(measurementsData);
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load measurements data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRowClick = (id: string) => {
    navigate(`/analizy/${id}`);
  };

  const handleSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    
    setSortField(field);
    setSortDirection(direction);
    
    const sorted = [...measurements].sort((a, b) => {
      const aValue = a[field as keyof typeof a].toLowerCase();
      const bValue = b[field as keyof typeof b].toLowerCase();
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    setMeasurements(sorted);
  };

  // Pagination calculations
  const totalPages = Math.ceil(measurements.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentMeasurements = measurements.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRecordsPerPageChange = (value: number) => {
    setRecordsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  const handleFirstPage = () => setCurrentPage(1);
  const handlePrevPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const handleNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const handleLastPage = () => setCurrentPage(totalPages);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#22D3BB',
                transform: 'scale(1.05)',
              },
            }}
            onClick={fetchJobs}
            title="Odśwież listę pomiarów"
          >
            <HistoryIcon sx={{ color: '#666', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
              Pomiary
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Sprawdź wyniki pomiarów i zarządzaj nimi
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pomiary/new')}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': {
              backgroundColor: '#1bb5a3',
            },
          }}
        >
          Nowy pomiar
        </Button>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#22D3BB' }} />
        </Box>
      ) : (
        <>
          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell padding="checkbox" sx={{ width: '50px' }}>
                    <Checkbox />
                  </TableCell>
                  <TableCell sx={{ width: '200px' }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f0f0f0' }
                      }}
                      onClick={() => handleSort('client')}
                    >
                      Klient
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <ArrowUpwardIcon 
                          sx={{ 
                            fontSize: 12, 
                            color: sortField === 'client' && sortDirection === 'asc' ? '#22D3BB' : '#666' 
                          }} 
                        />
                        <ArrowDownwardIcon 
                          sx={{ 
                            fontSize: 12, 
                            color: sortField === 'client' && sortDirection === 'desc' ? '#22D3BB' : '#666' 
                          }} 
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '200px' }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f0f0f0' }
                      }}
                      onClick={() => handleSort('bike')}
                    >
                      Rower
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <ArrowUpwardIcon 
                          sx={{ 
                            fontSize: 12, 
                            color: sortField === 'bike' && sortDirection === 'asc' ? '#22D3BB' : '#666' 
                          }} 
                        />
                        <ArrowDownwardIcon 
                          sx={{ 
                            fontSize: 12, 
                            color: sortField === 'bike' && sortDirection === 'desc' ? '#22D3BB' : '#666' 
                          }} 
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '150px' }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f0f0f0' }
                      }}
                      onClick={() => handleSort('date')}
                    >
                      Data
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <ArrowUpwardIcon 
                          sx={{ 
                            fontSize: 12, 
                            color: sortField === 'date' && sortDirection === 'asc' ? '#22D3BB' : '#666' 
                          }} 
                        />
                        <ArrowDownwardIcon 
                          sx={{ 
                            fontSize: 12, 
                            color: sortField === 'date' && sortDirection === 'desc' ? '#22D3BB' : '#666' 
                          }} 
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ width: '50px' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentMeasurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        Brak pomiarów do wyświetlenia
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentMeasurements.map((measurement) => (
                    <TableRow 
                      key={measurement.id} 
                      hover 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleRowClick(measurement.id)}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox />
                      </TableCell>
                      <TableCell>{measurement.client}</TableCell>
                      <TableCell>{measurement.bike}</TableCell>
                      <TableCell>{measurement.date}</TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Pagination - Only show when not loading and have data */}
      {!loading && measurements.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Strona {currentPage}/{totalPages}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button 
            size="small" 
            sx={{ minWidth: 'auto', p: 1 }}
            onClick={handleFirstPage}
            disabled={currentPage === 1}
          >
            ««
          </Button>
          <Button 
            size="small" 
            sx={{ minWidth: 'auto', p: 1 }}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            «
          </Button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                size="small"
                sx={{
                  minWidth: 'auto',
                  p: 1,
                  backgroundColor: currentPage === pageNum ? '#22D3BB' : 'transparent',
                  color: currentPage === pageNum ? 'white' : '#666',
                  '&:hover': {
                    backgroundColor: currentPage === pageNum ? '#1bb5a3' : '#f0f0f0',
                  },
                }}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <Typography sx={{ mx: 1 }}>...</Typography>
              <Button
                size="small"
                sx={{
                  minWidth: 'auto',
                  p: 1,
                  backgroundColor: currentPage === totalPages ? '#22D3BB' : 'transparent',
                  color: currentPage === totalPages ? 'white' : '#666',
                  '&:hover': {
                    backgroundColor: currentPage === totalPages ? '#1bb5a3' : '#f0f0f0',
                  },
                }}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button 
            size="small" 
            sx={{ minWidth: 'auto', p: 1 }}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            »
          </Button>
          <Button 
            size="small" 
            sx={{ minWidth: 'auto', p: 1 }}
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
          >
            »»
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Pokazuj
          </Typography>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={recordsPerPage}
              onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
              sx={{ 
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#22D3BB' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#22D3BB' },
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ color: '#666' }}>
            na stronę
          </Typography>
        </Box>
        </Box>
      )}
    </Box>
  );
};

export default MeasurementsPage;
