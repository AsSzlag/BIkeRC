import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  DirectionsBike as BikeIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Sample data - in real app this would come from API
const analysisData: Record<string, any> = {
  'ORD-98745': {
    id: 'ORD-98745',
    client: 'Sophia Williams',
    email: 'sophia.williams@email.com',
    phone: '+48 123 456 789',
    bike: 'Fitness Tracker S5 GPS 40mm White',
    bikeType: 'Road Bike',
    date: '2024-01-15',
    status: 'Completed',
    analysisType: 'Performance Analysis',
    results: {
      efficiency: 85,
      comfort: 92,
      power: 78,
      aerodynamics: 88,
      overall: 86,
    },
    recommendations: [
      'Adjust saddle height by 2cm for optimal power transfer',
      'Consider shorter stem for better aerodynamics',
      'Lower handlebar position for improved performance',
    ],
    notes: 'Excellent overall fit. Minor adjustments recommended for competitive riding.',
    location: 'Warsaw, Poland',
  },
  'ORD-98746': {
    id: 'ORD-98746',
    client: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+48 987 654 321',
    bike: 'Mountain Bike Pro 2024',
    bikeType: 'Mountain Bike',
    date: '2024-01-14',
    status: 'In Progress',
    analysisType: 'Comfort Analysis',
    results: {
      efficiency: 75,
      comfort: 95,
      power: 82,
      aerodynamics: 70,
      overall: 81,
    },
    recommendations: [
      'Current setup is optimal for comfort',
      'Consider wider handlebars for better control',
      'Suspension settings are well-tuned',
    ],
    notes: 'Great comfort-focused setup. Ready for long-distance riding.',
    location: 'Krakow, Poland',
  },
};

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const analysis = analysisData[id || ''];

  if (!analysis) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Analysis not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/analizy')}
        >
          Back to Analyses
        </Button>
      </Box>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#8bc34a';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircleIcon sx={{ color: getScoreColor(score) }} />;
    return <WarningIcon sx={{ color: getScoreColor(score) }} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/analizy')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Analysis Details
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': { backgroundColor: '#1bb5a3' },
          }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            borderColor: '#22D3BB',
            color: '#22D3BB',
            '&:hover': { borderColor: '#1bb5a3' },
          }}
        >
          Export Report
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          sx={{
            borderColor: '#f44336',
            color: '#f44336',
            '&:hover': { borderColor: '#d32f2f' },
          }}
        >
          Delete
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Client Information */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#22D3BB', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {analysis.client}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {analysis.email}
                </Typography>
              </Box>
            </Box>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon sx={{ color: '#666' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone" 
                  secondary={analysis.phone}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon sx={{ color: '#666' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Date" 
                  secondary={analysis.date}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon sx={{ color: '#666' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Location" 
                  secondary={analysis.location}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>

        {/* Bike Information */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                <BikeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {analysis.bike}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {analysis.bikeType}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Status:</Typography>
              <Chip
                label={analysis.status}
                size="small"
                sx={{
                  backgroundColor: analysis.status === 'Completed' ? '#e8f5e8' : '#fff3e0',
                  color: analysis.status === 'Completed' ? '#2e7d32' : '#f57c00',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AnalyticsIcon sx={{ color: '#666', mr: 1 }} />
              <Typography variant="body2" sx={{ color: '#666' }}>
                {analysis.analysisType}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Analysis Results */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Analysis Results
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {Object.entries(analysis.results).map(([key, value]) => (
                <Box key={key} sx={{ minWidth: '150px', flex: '1 1 150px' }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      {getScoreIcon(value as number)}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: getScoreColor(value as number), mb: 1 }}>
                      {String(value)}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={value as number}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(value as number),
                        },
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Recommendations */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Recommendations
            </Typography>
            <List>
              {analysis.recommendations.map((recommendation: string, index: number) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#22D3BB', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={recommendation}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Notes */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Analysis Notes
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              {analysis.notes}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AnalysisDetail;
