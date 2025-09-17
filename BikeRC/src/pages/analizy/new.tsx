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
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // const handleSave = () => {
  //   // Handle save logic here
  //   console.log('Saving analysis:', { clientName, bikeModel, selectedFile });
  //   navigate('/analizy');
  // };

  const handleBack = () => {
    navigate('/analizy');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    // Handle upload logic here
    console.log('Uploading file:', selectedFile);
    // You can add file upload logic here
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
            Nowa analiza
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Uzupełnij dane do analizy
          </Typography>
        </Box>
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

        {/* Video/File Upload Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CameraIcon sx={{ color: '#22D3BB', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Wideo z pomiarem
            </Typography>
          </Box>
          
          {/* File Upload Area */}
          <Box
            sx={{
              width: '100%',
              height: 200,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '2px dashed #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                borderColor: '#22D3BB',
              },
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {/* Laptop Icon with Stopwatch */}
            <Box
              sx={{
                width: 80,
                height: 60,
                backgroundColor: '#e0e0e0',
                borderRadius: 2,
                position: 'relative',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Laptop Screen */}
              <Box
                sx={{
                  width: 60,
                  height: 40,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Stopwatch Icon */}
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid #666',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '2px',
                      height: '8px',
                      backgroundColor: '#666',
                      transform: 'translate(-50%, -100%)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '6px',
                      height: '2px',
                      backgroundColor: '#666',
                      transform: 'translate(-50%, -50%)',
                    },
                  }}
                />
              </Box>
              
              {/* Laptop Base */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 70,
                  height: 8,
                  backgroundColor: '#d0d0d0',
                  borderRadius: '0 0 4px 4px',
                }}
              />
            </Box>

            {/* Star-like shapes around laptop */}
            <Box
              sx={{
                position: 'absolute',
                top: '20%',
                left: '15%',
                width: 8,
                height: 8,
                backgroundColor: '#ccc',
                borderRadius: '50%',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 4,
                  height: 4,
                  backgroundColor: '#ccc',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '25%',
                right: '20%',
                width: 6,
                height: 6,
                backgroundColor: '#ccc',
                borderRadius: '50%',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '30%',
                left: '10%',
                width: 7,
                height: 7,
                backgroundColor: '#ccc',
                borderRadius: '50%',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '25%',
                right: '15%',
                width: 5,
                height: 5,
                backgroundColor: '#ccc',
                borderRadius: '50%',
              }}
            />

            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', maxWidth: 300 }}>
              Wybierz video lub plik .csv z pomiarem aby wykonać analizę
            </Typography>

            {/* Hidden file input */}
            <input
              id="file-upload"
              type="file"
              accept=".mp4,.avi,.mov,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </Box>

          {/* Selected file info */}
          {selectedFile && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                Wybrany plik: {selectedFile.name}
              </Typography>
            </Box>
          )}

          {/* Upload Button */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleUploadClick}
              disabled={!selectedFile}
              sx={{
                backgroundColor: '#22D3BB',
                minWidth: 200,
                '&:hover': {
                  backgroundColor: '#1bb5a3',
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                },
              }}
            >
              Wgraj plik
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default NewAnalysisPage;
