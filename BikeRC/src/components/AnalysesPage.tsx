import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';
import { useJobContext } from '../hooks/useJobContext';

const AnalysesPage: React.FC = () => {
  const navigate = useNavigate();
  const { latest_analysis_job_id, saveJobResponseData, getJobResponseData } = useJobContext();

  const fetchDoneJob = async () => {
    if (latest_analysis_job_id) {
      try {
        // Check if we already have response data saved
        const savedData = getJobResponseData(latest_analysis_job_id);
        if (savedData) {
          console.log('Using saved job response data:', savedData);
          return;
        }

        // Fetch fresh data from API
        const response = await apiService.getJobDetails(latest_analysis_job_id);
        console.log('Latest analysis job details:', response);
        
        // Save response data to localStorage
        if (response) {
          const jobResponseData = {
            job_id: latest_analysis_job_id,
            files: response.files || [],
            links: response.links || [],
            analysis_results: response.analysis_results || null,
            download_urls: response.download_urls || [],
            created_at: new Date().toISOString(),
          };
          
          saveJobResponseData(jobResponseData);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    } else {
      console.log('No latest analysis job ID found in context');
    }
  }
  fetchDoneJob();
  
  // Sample data for the analyses table - expanded to 25 records for pagination
  const initialAnalyses = [
    { id: 'ORD-98745', client: 'Sophia Williams', bike: 'Fitness Tracker S5 GPS 40mm White' },
    { id: 'ORD-98746', client: 'Laura Perez', bike: 'Rider Xtreme 2023 256GB Silver' },
    { id: 'ORD-98747', client: 'Lena Müller', bike: 'Visionary Pro 24-inch Purple' },
    { id: 'ORD-98748', client: 'Natalia Nowak', bike: 'SoundBlaster Max Green' },
    { id: 'ORD-98749', client: 'Wei Chen', bike: 'SmartHome Mini Orange' },
    { id: 'ORD-98750', client: 'Emma Wright', bike: 'DisplayMaster Studio Standard Glass' },
    { id: 'ORD-98751', client: 'Ravi Patel', bike: 'AirBuds Pro 2nd Gen' },
    { id: 'ORD-98752', client: 'Nuray Aksoy', bike: 'Tablet Pro 10th Gen 64GB Wi-Fi Space Gray' },
    { id: 'ORD-98753', client: 'Anna Kowalski', bike: 'City Bike Urban Pro' },
    { id: 'ORD-98754', client: 'Piotr Nowak', bike: 'Mountain Bike Trail Master' },
    { id: 'ORD-98755', client: 'Maria Garcia', bike: 'Road Bike Speed Demon' },
    { id: 'ORD-98756', client: 'James Wilson', bike: 'Electric Bike Eco Ride' },
    { id: 'ORD-98757', client: 'Elena Petrov', bike: 'Touring Bike Adventure Plus' },
    { id: 'ORD-98758', client: 'Carlos Rodriguez', bike: 'BMX Bike Street Pro' },
    { id: 'ORD-98759', client: 'Jennifer Lee', bike: 'Hybrid Bike Comfort Plus' },
    { id: 'ORD-98760', client: 'Thomas Mueller', bike: 'Road Bike Carbon Pro' },
    { id: 'ORD-98761', client: 'Amanda White', bike: 'Mountain Bike All Terrain' },
    { id: 'ORD-98762', client: 'Daniel Kim', bike: 'City Bike Commuter' },
    { id: 'ORD-98763', client: 'Rachel Green', bike: 'Electric Bike City Cruiser' },
    { id: 'ORD-98764', client: 'Mark Johnson', bike: 'Touring Bike Explorer' },
    { id: 'ORD-98765', client: 'Laura Martinez', bike: 'Road Bike Racing Edition' },
    { id: 'ORD-98766', client: 'Kevin Brown', bike: 'Mountain Bike Enduro' },
    { id: 'ORD-98767', client: 'Natalie Chen', bike: 'Hybrid Bike Urban Explorer' },
    { id: 'ORD-98768', client: 'Alex Thompson', bike: 'BMX Bike Freestyle' },
    { id: 'ORD-98769', client: 'Samantha Davis', bike: 'Electric Bike Eco Pro' },
  ];

  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

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
    
    const sorted = [...analyses].sort((a, b) => {
      const aValue = a[field as keyof typeof a].toLowerCase();
      const bValue = b[field as keyof typeof b].toLowerCase();
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    setAnalyses(sorted);
  };

  // Pagination calculations
  const totalPages = Math.ceil(analyses.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentAnalyses = analyses.slice(startIndex, endIndex);

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
            }}
          >
            <HistoryIcon sx={{ color: '#666', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
              Lista analiz
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Manage and track your orders
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/analizy/new')}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': {
              backgroundColor: '#1bb5a3',
            },
          }}
        >
          Nowa analiza
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
              <TableCell sx={{ width: '150px' }}>
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
              <TableCell sx={{ width: '300px' }}>
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
              <TableCell align="right" sx={{ width: '50px' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentAnalyses.map((analysis, index) => (
              <TableRow 
                key={index} 
                hover 
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(analysis.id)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  #{analysis.id}
                </TableCell>
                <TableCell>{analysis.client}</TableCell>
                <TableCell>{analysis.bike}</TableCell>
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

export default AnalysesPage;
