import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';
import { useParams, useNavigate } from 'react-router-dom';

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedBodyPart, setSelectedBodyPart] = useState('Prawy bark');

  console.log(id);

  const bodyParts = [
    'Prawy bark',
    'Lewy bark',
    'Prawy łokieć',
    'Lewy łokieć',
    'Prawy biodro',
    'Lewe biodro',
    'Prawe kolano',
    'Lewe kolano',
    'Prawa kostka',
    'Lewa kostka',
  ];

  // Sample data for charts
  const timelineData = {
    xAxis: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    series: [
      {
        data: [0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11, 13, 12],
        color: '#22D3BB',
      },
    ],
  };

  // Deviation data for horizontal bar chart
  const deviationData = [
    { time: 't1', left: 15, right: 12 },
    { time: 't2', left: 22, right: 18 },
    { time: 't3', left: 18, right: 15 },
    { time: 't4', left: 25, right: 20 },
    { time: 't5', left: 20, right: 16 },
    { time: 't6', left: 28, right: 22 },
    { time: 't7', left: 16, right: 14 },
    { time: 't8', left: 24, right: 19 },
    { time: 't9', left: 19, right: 17 },
    { time: 't10', left: 26, right: 21 },
    { time: 't11', left: 17, right: 13 },
    { time: 't12', left: 23, right: 18 },
  ];

  const leftAverage = Math.round(deviationData.reduce((sum, item) => sum + item.left, 0) / deviationData.length);
  const rightAverage = Math.round(deviationData.reduce((sum, item) => sum + item.right, 0) / deviationData.length);

  const handleBack = () => {
    navigate('/analizy');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={handleBack}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0',
            mr: 2,
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          <ArrowBackIcon sx={{ color: '#666', fontSize: 20 }} />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
            12/10.09.2025
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Szczegóły pomiaru
          </Typography>
        </Box>
      </Box>

      {/* Video Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
          Wideo z pomiarem
        </Typography>

        {/* Video Player Area */}
        <Box
          sx={{
            width: '100%',
            height: 300,
            backgroundColor: '#f8f9fa',
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Mock video content with biomechanical tracking points */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `
                linear-gradient(90deg, #e0e0e0 1px, transparent 1px),
                linear-gradient(#e0e0e0 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Mock person silhouette */}
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': { backgroundColor: '#1bb5a3' },
          }}
        >
          Wgraj plik
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': { backgroundColor: '#1bb5a3' },
          }}
        >
          Pobierz wideo
        </Button>
      </Box>

      {/* Timeline Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon sx={{ color: '#22D3BB' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Linia czasowa
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#22D3BB' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#22D3BB' },
              }}
            >
              {bodyParts.map((part) => (
                <MenuItem key={part} value={part}>
                  {part}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AccessTimeIcon sx={{ color: '#666', fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: '#666' }}>
            CZAS POMIARU
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
            4 min
          </Typography>
        </Box>

        {/* Line Chart */}
        <Box
          sx={{
            width: '100%',
            height: 300,
            backgroundColor: '#f8f9fa',
            borderRadius: 1,
            p: 2,
          }}
        >
          <LineChart
            xAxis={[{ data: timelineData.xAxis, scaleType: 'linear' }]}
            series={timelineData.series}
            height={250}
            colors={['#22D3BB']}
            grid={{ horizontal: true, vertical: true }}
            margin={{ left: 40, right: 20, top: 20, bottom: 40 }}
          />
        </Box>
      </Paper>

      {/* Left/Right Deviations Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ScheduleIcon sx={{ color: '#22D3BB' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
            Odchylenia lewa/prawa
          </Typography>
        </Box>

        {/* Custom Horizontal Bar Chart */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              width: '100%',
              height: 350,
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              p: 2,
              position: 'relative',
            }}
          >
            {/* Chart Title */}
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold', color: '#333' }}>
              Odchylenia lewa/prawa
            </Typography>

            {/* Chart Container */}
            <Box
              sx={{
                width: '100%',
                height: 250,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Center vertical axis */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: '#333',
                  transform: 'translateX(-50%)',
                  zIndex: 1,
                }}
              />

              {/* Time axis labels */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: -20,
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#333',
                }}
              >
                t
              </Box>

              {/* Horizontal bars */}
              {deviationData.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 15,
                    position: 'relative',
                    mb: 0.5,
                    maxWidth: '100%',
                  }}
                >
                  {/* Left bar (blue) */}
                  <Box
                    sx={{
                      position: 'absolute',
                      right: '50%',
                      width: `${Math.min((item.left / 30) * 45, 45)}%`,
                      height: 10,
                      backgroundColor: '#2196f3',
                      borderRadius: '5px 0 0 5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pr: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontSize: '8px', fontWeight: 'bold' }}>
                      {item.left}
                    </Typography>
                  </Box>

                  {/* Right bar (orange) */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      width: `${Math.min((item.right / 30) * 45, 45)}%`,
                      height: 10,
                      backgroundColor: '#ff9800',
                      borderRadius: '0 5px 5px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      pl: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontSize: '8px', fontWeight: 'bold' }}>
                      {item.right}
                    </Typography>
                  </Box>

                  {/* Time label */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: -15,
                      transform: 'translateX(-50%)',
                      fontSize: '9px',
                      color: '#666',
                    }}
                  >
                    {item.time}
                  </Typography>
                </Box>
              ))}

              {/* Units label */}
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: 0,
                  color: '#666',
                  fontSize: '12px',
                }}
              >
                mm
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Summary */}
        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: '#ff9800',
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              Prawa średnie odhylenie = {rightAverage}mm
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: '#2196f3',
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
              Lewa średnie odhylenie = {leftAverage}mm
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Download Report Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          size="large"
          sx={{
            backgroundColor: '#22D3BB',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': { backgroundColor: '#1bb5a3' },
          }}
        >
          Pobierz raport z pomiaru
        </Button>
      </Box>
    </Box>
  );
};

export default AnalysisDetail;