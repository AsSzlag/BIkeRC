import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CameraAlt as CameraIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/ApiService';
import { useJobContext } from '../../hooks/useJobContext';
import jobMetadataService from '../../services/JobMetadataService';


const NewMeasurementPage: React.FC = () => {
  const navigate = useNavigate();
  const { addJob } = useJobContext();
  const [clientName, setClientName] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  
  // Camera states
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera1, setSelectedCamera1] = useState<string>('');
  const [isStreaming1, setIsStreaming1] = useState(false);
  const [isMeasuring1, setIsMeasuring1] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCameras, setIsLoadingCameras] = useState(false);
  
  // Recording states (only camera 1)
  const [recordingTime1, setRecordingTime1] = useState(0);
  const [recordedVideo1, setRecordedVideo1] = useState<string | null>(null);
  
  // Video refs (only camera 1)
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const streamRef1 = useRef<MediaStream | null>(null);
  
  // Recording refs (only camera 1)
  const mediaRecorder1 = useRef<MediaRecorder | null>(null);
  const recordingChunks1 = useRef<Blob[]>([]);
  const timerInterval1 = useRef<NodeJS.Timeout | null>(null);

  const handleSave = async () => {
    // Validate form data
    if (!clientName.trim()) {
      alert('Proszę podać nazwę klienta');
      return;
    }
    
    if (!bikeModel.trim()) {
      alert('Proszę podać model roweru');
      return;
    }

    // Check if recording exists (only camera 1 is enabled)
    if (!recordedVideo1) {
      alert('Proszę nagrać pomiar przed zapisaniem');
      return;
    }

    try {
      // Prepare file for backend submission (only camera 1)
      const file1 = await blobUrlToFile(recordedVideo1, `measurement_${Date.now()}`);


      console.log('Video file details:', {
        filename: file1.name,
        fileType: file1.type,
        mimeType: file1.type,
        size: file1.size,
        lastModified: file1.lastModified
      });
      
      console.log('Uploading measurement data:', {
        clientName: clientName.trim(),
        bikeModel: bikeModel.trim(),
        date: getCurrentDate(),
        duration: recordingTime1,
        filename: file1.name,
        fileType: file1.type,
        size: file1.size
      });
      
      // Send to backend API using ApiService uploadVideo method
      const result = await apiService.uploadVideo(file1, {
        format: file1.name.endsWith('.mp4') ? 'mp4' : 
                file1.name.endsWith('.avi') ? 'avi' : 
                file1.name.endsWith('.mov') ? 'mov' : 'mp4',
        quality: 'high',
        processingType: 'convert'
      });
      console.log('Upload successful:', result);
      
      // Store job data in context
      addJob({
        job_id: result.job_id,
        filename: result.filename,
        message: result.message,
        estimated_wait_time: result.estimated_wait_time,
        queue_position: result.queue_position,
        status: 'pending',
        created_at: new Date().toISOString(),
        client_name: clientName.trim(),
        bike_model: bikeModel.trim(),
        type: 'measurement'
      });

      // Save metadata to local storage
      const metadata = {
        job_id: result.job_id,
        name: `Pomiar ${clientName.trim()}`,
        rower: clientName.trim(),
        type: 'measurement' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        bike_info: {
          model: bikeModel.trim(),
          brand: '',
          size: '',
          year: 0
        }
      };
      jobMetadataService.saveJobMetadata(metadata);
      
      // Navigate back to measurements list
      navigate('/pomiary');
    } catch (error) {
      console.error('Error uploading measurement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      alert(`Wystąpił błąd podczas zapisywania pomiaru:\n\n${errorMessage}\n\nSpróbuj ponownie.`);
    }
  };

  const handleBack = () => {
    navigate('/pomiary');
  };

  // Load available cameras
  const loadCameras = async () => {
    try {
      setIsLoadingCameras(true);
      setCameraError(null);
      
      // Request permission to access media devices
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Get all video input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      setCameras(videoDevices);
      
      // Auto-select first camera if available
      if (videoDevices.length > 0) {
        setSelectedCamera1(videoDevices[0].deviceId);
      }
      
    } catch (error) {
      console.error('Error loading cameras:', error);
      setCameraError('Nie można uzyskać dostępu do kamer. Sprawdź uprawnienia przeglądarki.');
    } finally {
      setIsLoadingCameras(false);
    }
  };

  // Start camera stream (camera 1 only)
  const startCamera = async (cameraId: string) => {
    try {
      setCameraError(null);
      console.log(`Starting camera 1 with ID: ${cameraId}`);
      
      let constraints;
      
      // Try with specific camera first, fallback to any camera
      if (cameraId) {
        constraints = {
          video: {
            deviceId: { exact: cameraId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        };
      } else {
        constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera 1 stream obtained:', stream);
      
      console.log('Setting up camera 1, videoRef1.current:', videoRef1.current);
      if (videoRef1.current) {
        videoRef1.current.srcObject = stream;
        streamRef1.current = stream;
        
        // Ensure video plays
        videoRef1.current.onloadedmetadata = () => {
          console.log('Camera 1 metadata loaded');
          if (videoRef1.current) {
            videoRef1.current.play().catch(console.error);
          }
        };
        
        // Also try to play immediately
        setTimeout(() => {
          if (videoRef1.current) {
            console.log('Attempting to play camera 1 video');
            videoRef1.current.play().catch(console.error);
          }
        }, 100);
        
        setIsStreaming1(true);
        console.log('Camera 1 streaming state set to true');
      } else {
        console.error('Video ref 1 is null!');
      }
      
    } catch (error) {
      console.error('Error starting camera 1:', error);
      setCameraError('Nie można uruchomić kamery. Sprawdź czy kamera nie jest używana przez inną aplikację.');
    }
  };

  // Stop camera stream (camera 1 only)
  const stopCamera = () => {
    if (streamRef1.current) {
      streamRef1.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef1.current = null;
    }
    if (videoRef1.current) {
      videoRef1.current.srcObject = null;
    }
    setIsStreaming1(false);
  };


  const handleStartMeasurement = () => {
    if (isMeasuring1) {
      // Stop measurement and recording
      stopRecording();
      setIsMeasuring1(false);
      console.log('Stopping measurement for camera 1');
    } else {
      // Start measurement and recording
      startRecording();
      setIsMeasuring1(true);
      console.log('Starting measurement for camera 1');
    }
  };

  // Start recording function (camera 1 only)
  const startRecording = () => {
    const stream = streamRef1.current;
    if (!stream) {
      console.error('No stream available for camera 1');
      return;
    }

    try {
      // Try different MIME types in order of preference (avoid WebM)
      let mimeType = '';
      const supportedTypes = [
        'video/mp4;codecs=h264',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/avi',
        'video/quicktime', // MOV
        'video/x-msvideo', // AVI alternative
        'video/x-matroska', // MKV
        'video/webm;codecs=h264', // Only as last resort
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      if (!mimeType) {
        throw new Error('No supported video format found');
      }

      console.log('Video recording MIME type:', mimeType);
      console.log('Supported video formats:', supportedTypes);
      
      // Warn if WebM is being used
      if (mimeType.includes('webm')) {
        console.warn('⚠️ WebM format detected! This will be converted to MP4 for upload.');
      } else {
        console.log('✅ Using preferred format:', mimeType);
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      recordingChunks1.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunks1.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunks1.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        
        console.log('Video blob created:', {
          type: blob.type,
          size: blob.size,
          mimeType: mimeType,
          url: videoUrl
        });
        
        setRecordedVideo1(videoUrl);
        mediaRecorder1.current = null;
        
        console.log('Recording stopped for camera 1, video URL created with type:', mimeType);
      };

      mediaRecorder.start();
      
      mediaRecorder1.current = mediaRecorder;
      // Start timer
      setRecordingTime1(0);
      timerInterval1.current = setInterval(() => {
        setRecordingTime1(prev => prev + 1);
      }, 1000);

      console.log('Recording started for camera 1 with type:', mimeType);
    } catch (error) {
      console.error('Error starting recording for camera 1:', error);
    }
  };

  // Stop recording function (camera 1 only)
  const stopRecording = () => {
    const mediaRecorder = mediaRecorder1.current;
    const timerInterval = timerInterval1.current;

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval1.current = null;
    }

    console.log('Recording stopped for camera 1');
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert blob URL to File object for backend submission
  const blobUrlToFile = async (blobUrl: string, filename: string): Promise<File> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    // Determine file extension based on MIME type (prioritize MP4, AVI, MOV, MKV)
    let extension = '.mp4'; // default to MP4 instead of WebM
    let finalMimeType = 'video/mp4'; // default MIME type
    
    if (blob.type.includes('mp4')) {
      extension = '.mp4';
      finalMimeType = 'video/mp4';
    } else if (blob.type.includes('avi') || blob.type.includes('x-msvideo')) {
      extension = '.avi';
      finalMimeType = 'video/avi';
    } else if (blob.type.includes('quicktime') || blob.type.includes('mov')) {
      extension = '.mov';
      finalMimeType = 'video/quicktime';
    } else if (blob.type.includes('matroska') || blob.type.includes('mkv')) {
      extension = '.mkv';
      finalMimeType = 'video/x-matroska';
    } else if (blob.type.includes('webm')) {
      // Convert WebM to MP4 if possible
      extension = '.mp4';
      finalMimeType = 'video/mp4';
      console.warn('WebM detected, converting to MP4 format');
    }
    
    // Ensure filename has correct extension
    const finalFilename = filename.endsWith(extension) ? filename : filename.replace(/\.[^/.]+$/, '') + extension;
    
    console.log('Converting blob to file:', { 
      originalType: blob.type, 
      finalMimeType: finalMimeType,
      finalFilename, 
      size: blob.size,
      converted: blob.type !== finalMimeType
    });
    
    // Create file with the determined MIME type
    return new File([blob], finalFilename, { type: finalMimeType });
  };

  // Load cameras on component mount
  useEffect(() => {
    loadCameras();
    
    // Cleanup streams on unmount
    return () => {
      stopCamera();
      
      // Stop recordings
      if (mediaRecorder1.current && mediaRecorder1.current.state === 'recording') {
        mediaRecorder1.current.stop();
      }
      
      // Clear timers
      if (timerInterval1.current) {
        clearInterval(timerInterval1.current);
      }
      
      // Clean up video URLs
      if (recordedVideo1) {
        URL.revokeObjectURL(recordedVideo1);
      }
    };
  }, [recordedVideo1]);

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


      {/* Error Alert */}
      {cameraError && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}
          onClose={() => setCameraError(null)}
        >
          {cameraError}
        </Alert>
      )}

      {/* Loading State */}
      {isLoadingCameras && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress sx={{ color: '#22D3BB' }} />
          <Typography variant="body2" sx={{ ml: 2, color: '#666' }}>
            Ładowanie dostępnych kamer...
          </Typography>
        </Box>
      )}

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

          {/* Camera Selection */}
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Wybierz kamerę</InputLabel>
              <Select
                value={selectedCamera1}
                onChange={(e) => setSelectedCamera1(e.target.value)}
                label="Wybierz kamerę"
                disabled={isLoadingCameras}
              >
                {cameras.map((camera) => (
                  <MenuItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Kamera ${camera.deviceId.slice(0, 8)}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Camera Preview Area */}
          <Box
            sx={{
              width: '100%',
              height: 300,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              border: isStreaming1 ? (isMeasuring1 ? '3px solid #ff9800' : '2px solid #22D3BB') : '2px dashed #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Always render video element, but hide when not streaming */}
            <video
              ref={videoRef1}
              autoPlay
              playsInline
              muted
              controls={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000',
                display: isStreaming1 ? 'block' : 'none',
              }}
              onLoadStart={() => console.log('Camera 1 video load started')}
              onCanPlay={() => console.log('Camera 1 video can play')}
              onError={(e) => console.error('Camera 1 video error:', e)}
            />
            
            {/* Measurement indicator overlay */}
            {isStreaming1 && isMeasuring1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  backgroundColor: 'rgba(255, 152, 0, 0.9)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}
              >
                🔴 POMIAR W TOKU - {formatTime(recordingTime1)}
              </Box>
            )}
            
            {/* Placeholder when not streaming */}
            {!isStreaming1 && (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <CameraIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                  Podgląd kamery
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Kliknij "Uruchom kamerę" aby rozpocząć podgląd
                </Typography>
              </Box>
            )}
          </Box>

          {/* Camera Controls */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
            <Button
              variant={isStreaming1 ? "outlined" : "contained"}
              startIcon={isStreaming1 ? <VideocamOffIcon /> : <VideocamIcon />}
              onClick={() => {
                console.log('Camera 1 button clicked, current state:', { isStreaming1, selectedCamera1 });
                if (isStreaming1) {
                  stopCamera();
                  setIsMeasuring1(false); // Stop measurement if camera is stopped
                } else {
                  // Try to start camera even without selection
                  const cameraToUse = selectedCamera1 || '';
                  console.log('Starting camera 1 with:', cameraToUse);
                  startCamera(cameraToUse);
                }
              }}
              disabled={isLoadingCameras}
              sx={{
                backgroundColor: isStreaming1 ? 'transparent' : '#22D3BB',
                borderColor: '#22D3BB',
                color: isStreaming1 ? '#22D3BB' : 'white',
                '&:hover': {
                  backgroundColor: isStreaming1 ? '#f0f0f0' : '#1bb5a3',
                },
              }}
            >
              {isStreaming1 ? 'Zatrzymaj kamerę' : 'Uruchom kamerę'}
            </Button>
            
          </Box>

          {/* Measurement Button */}
          {isStreaming1 && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleStartMeasurement}
                sx={{
                  backgroundColor: isMeasuring1 ? '#ff9800' : '#22D3BB',
                  '&:hover': {
                    backgroundColor: isMeasuring1 ? '#f57c00' : '#1bb5a3',
                  },
                }}
              >
                {isMeasuring1 ? '⏹️ Zakończ pomiar' : '▶️ Rozpocznij pomiar'}
              </Button>
            </Box>
          )}

          {/* Recorded Video Playback */}
          {recordedVideo1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#22D3BB', fontWeight: 'bold' }}>
                📹 Nagrany pomiar (Kamera 1)
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  border: '2px solid #22D3BB',
                  overflow: 'hidden',
                }}
              >
                <video
                  src={recordedVideo1}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Box>
          )}
        </Paper>

        {/* Camera View 2 - DISABLED */}
        {/* Camera 2 functionality has been disabled */}
      </Box>
    </Box>
  );
};

export default NewMeasurementPage;
