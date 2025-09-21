import React from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { serverUrl } from '../utils/api';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LogoutIcon from '@mui/icons-material/Logout';

const Dashboard: React.FC = () => {
  const { loggedIn, checkLoginState, user } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/auth/logout`);
      checkLoginState();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(0, 237, 100, 0.1)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Avatar
        src={user?.picture}
        alt={user?.name}
        sx={{
          width: 60,
          height: 60,
          border: '2px solid #00ED64',
          boxShadow: '0 0 10px rgba(0, 237, 100, 0.3)',
        }}
      />
      
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: '1rem',
          mt: 1.5,
          mb: 0.5,
          textAlign: 'center',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {user?.name}
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontFamily: 'Roboto, sans-serif',
          mb: 2,
          fontSize: '0.75rem',
          textAlign: 'center',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {user?.email}
      </Typography>
      
      <Button
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        size="small"
        sx={{
          color: '#00ED64',
          borderColor: 'rgba(0, 237, 100, 0.5)',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 500,
          fontSize: '0.75rem',
          padding: '4px 12px',
          borderRadius: '8px',
          textTransform: 'none',
          maxWidth: '100%',
          '&:hover': {
            backgroundColor: 'rgba(0, 237, 100, 0.1)',
            borderColor: '#00ED64',
          },
        }}
      >
        Sign Out
      </Button>
    </Box>
  );
};

export default Dashboard;