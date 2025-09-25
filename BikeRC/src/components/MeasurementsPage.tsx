import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
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
  Search as SearchIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';
import { useJobContext } from '../hooks/useJobContext';
import JobStatusBadge from './JobStatusBadge';

const MeasurementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getJobsByType } = useJobContext();
  
  // State management
  const [videoJobs, setVideoJobs] = useState<Array<Record<string, unknown>>>([]);
  
  // Get measurement jobs from context
  const measurementJobs = getJobsByType('measurement');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Fetch data from API on component mount
  useEffect(() => {
    fetchVideoJobs();
  }, []);

  const fetchVideoJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching video jobs...');
      const videoJobsResponse = await apiService.getVideoJobs();
      console.log('Video jobs response:', videoJobsResponse);
      
      // Handle different response structures
      const jobs = videoJobsResponse.data || videoJobsResponse || [];
      setVideoJobs(Array.isArray(jobs) ? jobs as unknown as Array<Record<string, unknown>> : []);
      
    } catch (err: unknown) {
      console.error('API Error:', err);
      setError((err as Error).message || 'Failed to fetch video jobs from API');
      
      // Fallback to mock data on error
      const mockData = [
        { 
          id: 'job-001', 
          status: 'completed', 
          created_at: '2024-01-15T10:30:00Z',
          client_name: 'John Smith',
          bike_model: 'Mountain Bike Pro 2024',
          duration: 45,
          file_size: 15728640
        },
        { 
          id: 'job-002', 
          status: 'processing', 
          created_at: '2024-01-15T11:15:00Z',
          client_name: 'Emma Johnson',
          bike_model: 'Road Bike Carbon Elite',
          duration: 32,
          file_size: 12345678
        },
        { 
          id: 'job-003', 
          status: 'completed', 
          created_at: '2024-01-15T12:00:00Z',
          client_name: 'Michael Brown',
          bike_model: 'Hybrid Bike Comfort',
          duration: 28,
          file_size: 9876543
        },
        { 
          id: 'job-004', 
          status: 'failed', 
          created_at: '2024-01-15T13:20:00Z',
          client_name: 'Sarah Davis',
          bike_model: 'Electric Bike City Pro',
          duration: 0,
          file_size: 0
        },
        { 
          id: 'job-005', 
          status: 'completed', 
          created_at: '2024-01-15T14:45:00Z',
          client_name: 'David Wilson',
          bike_model: 'BMX Bike Street',
          duration: 38,
          file_size: 11234567
        },
      ];
      setVideoJobs(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/pomiary/${id}`);
  };

  const handleSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    
    setSortField(field);
    setSortDirection(direction);
    
    const sorted = [...videoJobs].sort((a, b) => {
      let aValue: unknown = a[field];
      let bValue: unknown = b[field];
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        // Numbers are already comparable
      } else {
        // Convert to string for other types
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (direction === 'asc') {
        return (aValue as string | number) < (bValue as string | number) ? -1 : 
               (aValue as string | number) > (bValue as string | number) ? 1 : 0;
      } else {
        return (aValue as string | number) > (bValue as string | number) ? -1 : 
               (aValue as string | number) < (bValue as string | number) ? 1 : 0;
      }
    });
    
    setVideoJobs(sorted);
  };

  // Pagination calculations
  const totalPages = Math.ceil(videoJobs.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentVideoJobs = videoJobs.slice(startIndex, endIndex);

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


  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#22D3BB', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666' }}>
            Ładowanie zadań wideo z API...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Ostrzeżenie: Problem z połączeniem do API
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Wyświetlane są dane przykładowe. Sprawdź konsolę przeglądarki dla szczegółów.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={fetchVideoJobs}
            sx={{ 
              borderColor: '#22D3BB', 
              color: '#22D3BB',
              '&:hover': { borderColor: '#1bb5a3', color: '#1bb5a3' }
            }}
          >
            Spróbuj ponownie
          </Button>
        </Alert>
      </Box>
    );
  }

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
            }}
          >
            <HistoryIcon sx={{ color: '#666', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
              Lista zadań wideo
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Manage and track your video processing jobs
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/pomiary/new')}
            sx={{
              backgroundColor: '#22D3BB',
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: '#1bb5a3',
              },
            }}
          >
            Nowy pomiar
          </Button>
        </Box>
      </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              width: '100%', 
              height: '1px',
              borderTop: '1px dashed #e0e0e0'
            }} 
          />
        </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Box
          sx={{
            p: 3,
            borderRight: '2px dashed #e0e0e0',
            borderRadius: 2,
            flex: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            Zadań wideo w sumie
          </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333' }}>
                {measurementJobs.length + videoJobs.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <span style={{ color: '#1FC16B' }}>+{measurementJobs.filter(job => job.status === 'completed').length + videoJobs.filter(job => job.status === 'completed').length}</span> ukończonych
              </Typography>
            </Box>

        </Box>
        <Box sx={{ p: 3, borderRadius: 2, flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            W trakcie przetwarzania
          </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333' }}>
                {measurementJobs.filter(job => job.status === 'processing').length + videoJobs.filter(job => job.status === 'processing').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                W trakcie
              </Typography>
            </Box>

        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              width: '100%', 
              height: '1px',
              borderTop: '1px dashed #e0e0e0'
            }} 
          />
        </Box>

      {/* Search and Export */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Wyszukaj"
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          sx={{
            borderColor: '#e0e0e0',
            color: '#666',
            '&:hover': {
              borderColor: '#22D3BB',
              color: '#22D3BB',
            },
          }}
        >
          Export
        </Button>
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell padding="checkbox" sx={{ width: '50px' }}>
                <Checkbox />
              </TableCell>
              <TableCell sx={{ width: '120px' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                  onClick={() => handleSort('id')}
                >
                  ID
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ArrowUpwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'id' && sortDirection === 'asc' ? '#22D3BB' : '#666' 
                      }} 
                    />
                    <ArrowDownwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'id' && sortDirection === 'desc' ? '#22D3BB' : '#666' 
                      }} 
                    />
                  </Box>
                </Box>
              </TableCell>
              <TableCell sx={{ width: '100px' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                  onClick={() => handleSort('status')}
                >
                  Status
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ArrowUpwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'status' && sortDirection === 'asc' ? '#22D3BB' : '#666' 
                      }} 
                    />
                    <ArrowDownwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'status' && sortDirection === 'desc' ? '#22D3BB' : '#666' 
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
                  onClick={() => handleSort('client_name')}
                >
                  Klient
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ArrowUpwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'client_name' && sortDirection === 'asc' ? '#22D3BB' : '#666' 
                      }} 
                    />
                    <ArrowDownwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'client_name' && sortDirection === 'desc' ? '#22D3BB' : '#666' 
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
                  onClick={() => handleSort('bike_model')}
                >
                  Rower
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ArrowUpwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'bike_model' && sortDirection === 'asc' ? '#22D3BB' : '#666' 
                      }} 
                    />
                    <ArrowDownwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'bike_model' && sortDirection === 'desc' ? '#22D3BB' : '#666' 
                      }} 
                    />
                  </Box>
                </Box>
              </TableCell>
              <TableCell sx={{ width: '100px' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                  onClick={() => handleSort('duration')}
                >
                  Czas
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ArrowUpwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'duration' && sortDirection === 'asc' ? '#22D3BB' : '#666' 
                      }} 
                    />
                    <ArrowDownwardIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: sortField === 'duration' && sortDirection === 'desc' ? '#22D3BB' : '#666' 
                      }} 
                    />
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ width: '50px' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Show measurement jobs from context first */}
            {measurementJobs.map((job) => (
              <TableRow 
                key={`context-${job.job_id}`} 
                hover 
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(job.job_id)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  #{job.job_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <JobStatusBadge job={job} />
                </TableCell>
                <TableCell>{job.client_name || 'N/A'}</TableCell>
                <TableCell>{job.bike_model || 'N/A'}</TableCell>
                <TableCell>
                  {job.estimated_wait_time || 'N/A'}
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Show API video jobs */}
            {currentVideoJobs.map((job, index) => (
              <TableRow 
                key={`api-${index}`} 
                hover 
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(String(job.id || ''))}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  #{String(job.id || 'N/A')}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: 
                        job.status === 'completed' ? '#e8f5e8' :
                        job.status === 'processing' ? '#fff3cd' :
                        job.status === 'failed' ? '#f8d7da' : '#e2e3e5',
                      color: 
                        job.status === 'completed' ? '#155724' :
                        job.status === 'processing' ? '#856404' :
                        job.status === 'failed' ? '#721c24' : '#383d41',
                    }}
                  >
                    {job.status === 'completed' ? 'Ukończone' :
                     job.status === 'processing' ? 'Przetwarzanie' :
                     job.status === 'failed' ? 'Błąd' : String(job.status || 'Unknown')}
                  </Box>
                </TableCell>
                <TableCell>{String(job.client_name || 'N/A')}</TableCell>
                <TableCell>{String(job.bike_model || 'N/A')}</TableCell>
                <TableCell>
                  {job.duration ? `${job.duration}s` : 'N/A'}
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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
    </Box>
  );
};

export default MeasurementsPage;
