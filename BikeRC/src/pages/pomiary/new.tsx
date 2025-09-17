import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NewMeasurementPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [bikeModel, setBikeModel] = useState('');

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving measurement:', { clientName, bikeModel });
    navigate('/pomiary');
  };

  const handleBack = () => {
    navigate('/pomiary');
  };

  const handleStartMeasurement = (cameraNumber: number) => {
    // Handle start measurement logic here
    console.log(`Starting measurement for camera ${cameraNumber}`);
  };

  // Get current date in DD.MM.YYYY format
  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
            Nowy pomiar
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            {getCurrentDate()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': {
              backgroundColor: '#1bb5a3',
            },
          }}
        >
          Zapisz pomiar
        </Button>
      </Box>

      {/* Form Content */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Client Information */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
            Klient*
          </Typography>
          <TextField
            fullWidth
            placeholder="Imię i nazwisko"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Paper>

        {/* Bike Information */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
            Rower*
          </Typography>
          <TextField
            fullWidth
            placeholder="Nazwa, model"
            value={bikeModel}
            onChange={(e) => setBikeModel(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Paper>

        {/* Camera View 1 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CameraIcon sx={{ color: '#22D3BB', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Podgląd z kamery
            </Typography>
          </Box>
          
          {/* Camera View Area */}
          <Box
            sx={{
              width: '100%',
              height: 300,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              border: '2px dashed #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Placeholder for camera view */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'%23e0e0e0\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'white\'/%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3Ccircle cx=\'200\' cy=\'150\' r=\'60\' fill=\'%23f0f0f0\' stroke=\'%23ccc\' stroke-width=\'2\'/%3E%3Ctext x=\'200\' y=\'155\' text-anchor=\'middle\' fill=\'%23666\' font-family=\'Arial\' font-size=\'14\'%3ECamera View%3C/text%3E%3C/svg%3E")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#666', backgroundColor: 'rgba(255,255,255,0.8)', px: 2, py: 1, borderRadius: 1 }}>
                Camera preview will appear here
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => handleStartMeasurement(1)}
              sx={{
                backgroundColor: '#22D3BB',
                '&:hover': {
                  backgroundColor: '#1bb5a3',
                },
              }}
            >
              + Rozpocznij pomiar
            </Button>
          </Box>
        </Paper>

        {/* Camera View 2 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CameraIcon sx={{ color: '#22D3BB', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Podgląd z kamery 2
            </Typography>
          </Box>
          
          {/* Camera View Area */}
          <Box
            sx={{
              width: '100%',
              height: 300,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              border: '2px dashed #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Placeholder for camera view */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Cdefs%3E%3Cpattern id=\'grid2\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'%23e0e0e0\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'white\'/%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid2)\'/%3E%3Ccircle cx=\'200\' cy=\'150\' r=\'60\' fill=\'%23f0f0f0\' stroke=\'%23ccc\' stroke-width=\'2\'/%3E%3Ctext x=\'200\' y=\'155\' text-anchor=\'middle\' fill=\'%23666\' font-family=\'Arial\' font-size=\'14\'%3ECamera View 2%3C/text%3E%3C/svg%3E")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#666', backgroundColor: 'rgba(255,255,255,0.8)', px: 2, py: 1, borderRadius: 1 }}>
                Camera preview will appear here
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => handleStartMeasurement(2)}
              sx={{
                backgroundColor: '#22D3BB',
                '&:hover': {
                  backgroundColor: '#1bb5a3',
                },
              }}
            >
              + Rozpocznij pomiar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default NewMeasurementPage;
