import React from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AnalysesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data for the analyses table
  const analyses = [
    { id: 'ORD-98745', client: 'Sophia Williams', bike: 'Fitness Tracker S5 GPS 40mm White' },
    { id: 'ORD-98746', client: 'Laura Perez', bike: 'Rider Xtreme 2023 256GB Silver' },
    { id: 'ORD-98747', client: 'Lena Müller', bike: 'Visionary Pro 24-inch Purple' },
    { id: 'ORD-98748', client: 'Natalia Nowak', bike: 'SoundBlaster Max Green' },
    { id: 'ORD-98749', client: 'Wei Chen', bike: 'SmartHome Mini Orange' },
    { id: 'ORD-98750', client: 'Emma Wright', bike: 'DisplayMaster Studio Standard Glass' },
    { id: 'ORD-98751', client: 'Ravi Patel', bike: 'AirBuds Pro 2nd Gen' },
    { id: 'ORD-98752', client: 'Nuray Aksoy', bike: 'Tablet Pro 10th Gen 64GB Wi-Fi Space Gray' },
  ];

  const handleRowClick = (id: string) => {
    navigate(`/analizy/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RefreshIcon sx={{ color: '#22D3BB', mr: 1, fontSize: '1.5rem' }} />
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
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  ID
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ArrowUpwardIcon sx={{ fontSize: 12, color: '#666' }} />
                    <ArrowDownwardIcon sx={{ fontSize: 12, color: '#666' }} />
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Klient
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ArrowUpwardIcon sx={{ fontSize: 12, color: '#666' }} />
                    <ArrowDownwardIcon sx={{ fontSize: 12, color: '#666' }} />
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Rower
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ArrowUpwardIcon sx={{ fontSize: 12, color: '#666' }} />
                    <ArrowDownwardIcon sx={{ fontSize: 12, color: '#666' }} />
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analyses.map((analysis, index) => (
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
          Strona 1/10
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>««</Button>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>«</Button>
          <Button
            size="small"
            sx={{
              minWidth: 'auto',
              p: 1,
              backgroundColor: '#22D3BB',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1bb5a3',
              },
            }}
          >
            1
          </Button>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>2</Button>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>3</Button>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>4</Button>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>5</Button>
          <Typography sx={{ mx: 1 }}>...</Typography>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>16</Button>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>»</Button>
          <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>»»</Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            10/ stronę
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AnalysesPage;
