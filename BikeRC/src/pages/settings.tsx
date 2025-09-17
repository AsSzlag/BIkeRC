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
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    phone: '',
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving settings:', formData);
    // You can add API call here to save the data
    alert('Settings saved successfully!');
  };

  const handleBack = () => {
    navigate('/pomiary'); // Navigate back to measurements page
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Ustawienia
        </Typography>
      </Box>

      {/* Settings Form */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
            Dane osobowe
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* First Row - Name Fields */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                label="Imię"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                variant="outlined"
                sx={{
                  flex: '1 1 300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Nazwisko"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                variant="outlined"
                sx={{
                  flex: '1 1 300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Second Row - Contact Fields */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                variant="outlined"
                sx={{
                  flex: '1 1 300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                variant="outlined"
                sx={{
                  flex: '1 1 300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Address Field */}
            <TextField
              fullWidth
              label="Adres"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleInputChange('address')}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                backgroundColor: '#22D3BB',
                minWidth: 150,
                '&:hover': {
                  backgroundColor: '#1bb5a3',
                },
              }}
            >
              Zapisz
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SettingsPage;
