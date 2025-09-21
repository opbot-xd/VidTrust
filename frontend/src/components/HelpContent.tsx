import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';

interface HelpContentProps {
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HelpContent: React.FC<HelpContentProps> = ({ setShowHelp }) => {
  return (
    <Paper className="help-paper">
      <Typography variant="h6" className="help-title">
        How Video Authentication Works
      </Typography>
      
      <Box className="help-feature">
        <Typography variant="subtitle2" className="help-feature-title">
          1. Digital Signature Verification
        </Typography>
        <Typography variant="body2">
          Checks if the video's digital signature matches its content to detect tampering.
        </Typography>
      </Box>
      
      <Box className="help-feature">
        <Typography variant="subtitle2" className="help-feature-title">
          2. Audio Analysis
        </Typography>
        <Typography variant="body2">
          Examines audio for inconsistencies, splices, or artificial generation.
        </Typography>
      </Box>
      
      <Box className="help-feature">
        <Typography variant="subtitle2" className="help-feature-title">
          3. Frame Analysis
        </Typography>
        <Typography variant="body2">
          Analyzes video frames for signs of editing, splicing, or deepfake artifacts.
        </Typography>
      </Box>
      
      <Box className="help-feature">
        <Typography variant="subtitle2" className="help-feature-title">
          4. Object & Face Tracking
        </Typography>
        <Typography variant="body2">
          Detects objects or faces that appear/disappear unnaturally, suggesting manipulation.
        </Typography>
      </Box>
      
      <Button 
        variant="outlined" 
        size="small"
        onClick={() => setShowHelp(false)}
        className="close-help-button"
      >
        Close Help
      </Button>
    </Paper>
  );
};