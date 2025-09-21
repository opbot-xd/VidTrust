import React from 'react';
import FactChecker from '@/components/FactChecker';
import { Box, Paper } from '@mui/material';

const FactCheckPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
        <FactChecker />
      </Paper>
    </Box>
  );
}

export default FactCheckPage;
