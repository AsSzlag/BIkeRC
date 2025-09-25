import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  VideoFile as VideoFileIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/ApiService';
import { useJobContext } from '../../hooks/useJobContext';
import jobMetadataService, { type JobMetadata } from '../../services/JobMetadataService';

const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { addJob } = useJobContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [jobMetadata, setJobMetadata] = useState<Partial<JobMetadata>>({});

  const handleSave = async () => {
    // Validate metadata
    if (!jobMetadata.name?.trim()) {
      alert('Proszę podać nazwę analizy');
      return;
    }
    
    if (!jobMetadata.bike_info?.model?.trim()) {
      alert('Proszę podać model roweru');
      return;
    }

    if (!selectedFile) {
      alert('Proszę wybrać plik wideo do analizy');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      console.log('Video file details:', {
        filename: selectedFile.name,
        fileType: selectedFile.type,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        lastModified: selectedFile.lastModified
      });
      
      console.log('Uploading analysis data:', {
        name: jobMetadata.name,
        bikeModel: jobMetadata.bike_info?.model,
        date: getCurrentDate(),
        filename: selectedFile.name,
        fileType: selectedFile.type,
        size: selectedFile.size
      });
      
      // Send to backend API using ApiService uploadVideo method
      const result = await apiService.uploadVideo(selectedFile, {
        format: selectedFile.name.endsWith('.mp4') ? 'mp4' : 
                selectedFile.name.endsWith('.avi') ? 'avi' : 
                selectedFile.name.endsWith('.mov') ? 'mov' : 'mp4',
        quality: 'high',
        processingType: 'enhance'
      });
      console.log('Upload successful:', result);
      
      // Save job metadata
      const metadata: JobMetadata = {
        job_id: result.job_id,
        name: jobMetadata.name!.trim(),
        rower: 'Nieznany klient', // Default client name since we don't have a client field
        type: 'analysis',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: jobMetadata.description,
        tags: jobMetadata.tags,
        client_info: jobMetadata.client_info,
        bike_info: {
          model: jobMetadata.bike_info!.model!.trim(),
          brand: '',
          size: '',
          year: 0
        },
        session_info: jobMetadata.session_info,
      };
      
      jobMetadataService.saveJobMetadata(metadata);
      
      // Store job data in context
      addJob({
        job_id: result.job_id,
        filename: result.filename,
        message: result.message,
        estimated_wait_time: result.estimated_wait_time,
        queue_position: result.queue_position,
        status: 'pending',
        created_at: new Date().toISOString(),
        client_name: 'Nieznany klient', // Default client name
        bike_model: jobMetadata.bike_info!.model!.trim(),
        type: 'analysis'
      });
      
      // Show success message with job details
      alert(`Analiza uruchomiona!\n\nNazwa: ${metadata.name}\nRower: ${metadata?.bike_info?.model}\nData: ${getCurrentDate()}\n\nPlik: ${selectedFile.name}\n\nJob ID: ${result.job_id}\nSzacowany czas: ${result.estimated_wait_time}\nPozycja w kolejce: ${result.queue_position}`);
      
      // Navigate back to analyses list
      navigate('/analizy');
    } catch (error) {
      console.error('Error uploading analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      setUploadError(errorMessage);
      alert(`Wystąpił błąd podczas przesyłania pliku:\n\n${errorMessage}\n\nSpróbuj ponownie.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate('/analizy');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
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
            Nowa analiza
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            {getCurrentDate()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isUploading}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': {
              backgroundColor: '#1bb5a3',
            },
            '&:disabled': {
              backgroundColor: '#ccc',
            },
          }}
        >
          {isUploading ? 'Przesyłanie...' : 'Uruchom analizę'}
        </Button>
      </Box>

      {/* Error Alert */}
      {uploadError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}
          onClose={() => setUploadError(null)}
        >
          {uploadError}
        </Alert>
      )}

      {/* Loading State */}
      {isUploading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress sx={{ color: '#22D3BB' }} />
          <Typography variant="body2" sx={{ ml: 2, color: '#666' }}>
            Przesyłanie pliku do analizy...
          </Typography>
        </Box>
      )}

      {/* Form Content */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Simple Metadata Form */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
            Informacje o analizie
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Nazwa analizy"
              placeholder="Wprowadź nazwę analizy"
              value={jobMetadata.name || ''}
              onChange={(e) => setJobMetadata(prev => ({ ...prev, name: e.target.value }))}
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="Rower"
              placeholder="Wprowadź model roweru"
              value={jobMetadata.bike_info?.model || ''}
              onChange={(e) => setJobMetadata(prev => ({ 
                ...prev, 
                bike_info: { 
                  ...prev.bike_info, 
                  model: e.target.value 
                } 
              }))}
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Paper>

        {/* Video/File Upload Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <VideoFileIcon sx={{ color: '#22D3BB', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Plik wideo do analizy
            </Typography>
          </Box>
          
          {/* File Upload Area */}
          <Box
            sx={{
              width: '100%',
              height: 200,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              border: selectedFile ? '2px solid #22D3BB' : '2px dashed #e0e0e0',
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
            <VideoFileIcon sx={{ fontSize: 48, color: selectedFile ? '#22D3BB' : '#ccc', mb: 2 }} />
            <Typography variant="h6" sx={{ color: selectedFile ? '#22D3BB' : '#999', mb: 1 }}>
              {selectedFile ? 'Plik wybrany' : 'Wybierz plik wideo'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc', textAlign: 'center', maxWidth: 300 }}>
              {selectedFile 
                ? `Kliknij aby zmienić plik` 
                : 'Kliknij aby wybrać plik wideo (MP4, AVI, MOV) do analizy'
              }
            </Typography>

            {/* Hidden file input */}
            <input
              id="file-upload"
              type="file"
              accept=".mp4,.avi,.mov,.mkv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </Box>

          {/* Selected file info */}
          {selectedFile && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                ✅ Wybrany plik:
              </Typography>
              <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                📁 {selectedFile.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                📊 Rozmiar: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
              <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                🎥 Typ: {selectedFile.type || 'Nieznany'}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default NewAnalysisPage;
