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
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Sample data - in real app this would come from API
const measurementData: Record<string, any> = {
  'ORD-98745': {
    id: 'ORD-98745',
    client: 'Sophia Williams',
    email: 'sophia.williams@email.com',
    phone: '+48 123 456 789',
    bike: 'Fitness Tracker S5 GPS 40mm White',
    bikeType: 'Road Bike',
    date: '2024-01-15',
    status: 'Completed',
    measurements: {
      height: '170 cm',
      inseam: '78 cm',
      armSpan: '168 cm',
      shoulderWidth: '42 cm',
      flexibility: 'Good',
    },
    notes: 'Client prefers aggressive riding position. Recommended saddle height adjustment.',
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
    measurements: {
      height: '185 cm',
      inseam: '85 cm',
      armSpan: '182 cm',
      shoulderWidth: '45 cm',
      flexibility: 'Excellent',
    },
    notes: 'Experienced rider, looking for optimal performance setup.',
    location: 'Krakow, Poland',
  },
};

const MeasurementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const measurement = measurementData[id || ''];

  if (!measurement) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Measurement not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/pomiary')}
        >
          Back to Measurements
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/pomiary')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Measurement Details
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
          Export
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
                  {measurement.client}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {measurement.email}
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
                  secondary={measurement.phone}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon sx={{ color: '#666' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Date" 
                  secondary={measurement.date}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon sx={{ color: '#666' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Location" 
                  secondary={measurement.location}
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
                  {measurement.bike}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {measurement.bikeType}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Status:</Typography>
              <Chip
                label={measurement.status}
                size="small"
                sx={{
                  backgroundColor: measurement.status === 'Completed' ? '#e8f5e8' : '#fff3e0',
                  color: measurement.status === 'Completed' ? '#2e7d32' : '#f57c00',
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* Measurements */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Body Measurements
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.entries(measurement.measurements).map(([key, value]) => (
                <Box key={key} sx={{ minWidth: '120px', flex: '1 1 120px' }}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22D3BB' }}>
                      {String(value)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Notes */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Notes
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              {measurement.notes}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default MeasurementDetail;
