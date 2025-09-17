import React, { useState } from 'react';
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

const MeasurementsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data for the table - expanded to 25 records for pagination
  const initialMeasurements = [
    { id: 'ORD-98745', client: 'Sophia Williams', bike: 'Fitness Tracker S5 GPS 40mm White' },
    { id: 'ORD-98746', client: 'John Smith', bike: 'Mountain Bike Pro 2024' },
    { id: 'ORD-98747', client: 'Emma Johnson', bike: 'Road Bike Carbon Elite' },
    { id: 'ORD-98748', client: 'Michael Brown', bike: 'Hybrid Bike Comfort' },
    { id: 'ORD-98749', client: 'Sarah Davis', bike: 'Electric Bike City Pro' },
    { id: 'ORD-98750', client: 'David Wilson', bike: 'BMX Bike Street' },
    { id: 'ORD-98751', client: 'Lisa Anderson', bike: 'Touring Bike Adventure' },
    { id: 'ORD-98752', client: 'Robert Taylor', bike: 'Cyclocross Bike Pro' },
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

  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

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
            }}
          >
            <HistoryIcon sx={{ color: '#666', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
              Lista pomiarów
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Manage and track your orders
            </Typography>
          </Box>
        </Box>
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
            Pomiarów w sumie
          </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333' }}>
                650
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <span style={{ color: '#1FC16B' }}>+12</span> w tym tygodniu
              </Typography>
            </Box>

        </Box>
        <Box sx={{ p: 3, borderRadius: 2, flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            Oczekujących bikefittingów
          </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333' }}>
                28
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Oczekujących
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
            {currentMeasurements.map((measurement, index) => (
              <TableRow 
                key={index} 
                hover 
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(measurement.id)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  #{measurement.id}
                </TableCell>
                <TableCell>{measurement.client}</TableCell>
                <TableCell>{measurement.bike}</TableCell>
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
