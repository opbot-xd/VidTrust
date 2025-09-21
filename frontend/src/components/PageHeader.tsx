import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface PageHeaderProps {
  title: string;
  handleBackToHome: () => void;
  showHelp: boolean;
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  handleBackToHome, 
  showHelp, 
  setShowHelp 
}) => {
  return (
    <Box className="page-header">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={handleBackToHome}
          className="back-button"
        >
          <ArrowBackIcon sx={{ color: '#00ED64' }} />
        </IconButton>
        <Typography variant="h4" className="page-title" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          {title}
        </Typography>
      </Box>
      
      <Tooltip title="How it works">
        <IconButton 
          onClick={() => setShowHelp(!showHelp)}
          className="help-button"
        >
          <HelpOutlineIcon sx={{ color: '#00ED64' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};