import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import {
  GridView as GridViewIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import BikeRCLogo from '../assets/BikeRCLogo.png';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
        <Box
          sx={{
            width: 280,
            height: '100vh',
            backgroundColor: '#ffffff',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e0e0e0',
          }}
        >
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography
        onClick={() => navigate('/')}
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#22D3BB',
            fontSize: '1.8rem',
            padding: 3,
            '&:hover': {
              cursor: 'pointer',
            },
          }}
        >
          <img src={BikeRCLogo} alt="BikeRC Logo" style={{ height: '40px', width: 'auto' }} />
         
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Divider sx={{ width: '75%', backgroundColor: '#e0e0e0' }} />
      </Box>
      {/* Navigation */}
      <Box sx={{ flexGrow: 1, pr: 2 }}>
        <List>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/pomiary"
                  sx={{
                    backgroundColor: location.pathname === '/pomiary' ? '#f5f5f5' : 'transparent',
                    color: '#333',
                    borderRadius: 2,
                    mb: 1,
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: location.pathname === '/pomiary' ? '#f0f0f0' : '#e0e0e0',
                    },
                    '&::before': location.pathname === '/pomiary' ? {
                      content: '""',
                      position: 'absolute',
                      left: '0px',
                      top: '8px',
                      bottom: '8px',
                      width: '6px',
                      backgroundColor: '#22D3BB',
                      borderRadius: '0 3px 3px 0',
                    } : {},
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === '/pomiary' ? '#22D3BB' : '#666' }}>
                    <GridViewIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Pomiary"
                    primaryTypographyProps={{ color: '#333' }}
                  />
                </ListItemButton>
              </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/analizy"
              sx={{
                backgroundColor: location.pathname === '/analizy' ? '#f5f5f5' : 'transparent',
                color: '#333',
                borderRadius: 2,
                mb: 1,
                position: 'relative',
                '&:hover': {
                  backgroundColor: location.pathname === '/analizy' ? '#f0f0f0' : '#e0e0e0',
                },
                '&::before': location.pathname === '/analizy' ? {
                  content: '""',
                  position: 'absolute',
                  left: '-2px',
                  top: '8px',
                  bottom: '8px',
                  width: '6px',
                  backgroundColor: '#22D3BB',
                  borderRadius: '0 3px 3px 0',
                } : {},
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === '/analizy' ? '#22D3BB' : '#666' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText
                primary="Analizy"
                primaryTypographyProps={{ color: '#333' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, pl: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Divider sx={{ width: '75%', backgroundColor: '#e0e0e0' }} />
      </Box>
        
        {/* Settings */}
        <ListItem disablePadding sx={{ mb: 2 }}>
          <ListItemButton
            component={Link}
            to="/settings"
            sx={{
              backgroundColor: location.pathname === '/settings' ? '#f5f5f5' : 'transparent',
              color: '#333',
              borderRadius: 2,
              position: 'relative',
              '&:hover': {
                backgroundColor: location.pathname === '/settings' ? '#f0f0f0' : '#e0e0e0',
              },
              '&::before': location.pathname === '/settings' ? {
                content: '""',
                position: 'absolute',
                left: '0px',
                top: '8px',
                bottom: '8px',
                width: '6px',
                backgroundColor: '#22D3BB',
                borderRadius: '0 3px 3px 0',
              } : {},
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === '/settings' ? '#22D3BB' : '#666' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Ustawienia" 
              primaryTypographyProps={{ color: '#333' }}
            />
          </ListItemButton>
        </ListItem>

        {/* Shop Profile */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <Avatar
            sx={{
              bgcolor: '#ff4081',
              width: 40,
              height: 40,
              mr: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: 'white' }}>
              S
            </Typography>
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }} onClick={() => window.open('https://google.com', '_blank')}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }} >
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
                Sklep Rowerowy
              </Typography>
              <CheckCircleIcon 
                sx={{ 
                  color: '#22D3BB', 
                  fontSize: 16, 
                  ml: 0.5 
                }} 
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Rowerylublin@op.pl
            </Typography>
          </Box>
          
          <ArrowForwardIcon sx={{ color: '#666', fontSize: 20 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
