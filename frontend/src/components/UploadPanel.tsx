import React from 'react';
import { 
  Box, TextField, Button, Typography, LinearProgress, Paper,
  Alert, CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Grow } from '@mui/material';

interface UploadPanelProps {
  title: string;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadFile: () => Promise<void>;
  handleFinalSubmit: (e: React.FormEvent) => Promise<void>;
  isUploading: boolean;
  isChecking: boolean;
  isSubmitValid: boolean;
  progress: number;
  error: string | null;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  title,
  handleTitleChange,
  selectedFile,
  handleFileInput,
  uploadFile,
  handleFinalSubmit,
  isUploading,
  isChecking,
  isSubmitValid,
  progress,
  error
}) => {
  return (
    <Box className="panel-container" sx={{ height: 'auto', minHeight: '500px' }}>
      <div className="floating-element-top-right"></div>
      <div className="floating-element-bottom-left"></div>

      <Typography variant="h5" className="section-title">
        Upload Your Video
      </Typography>
      
      <Typography variant="body2" className="section-description">
        Our advanced AI system will analyze your video for signs of tampering or manipulation.
        Upload your video file below to begin the verification process.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80' }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Video Title"
        variant="outlined"
        value={title}
        onChange={handleTitleChange}
        className="custom-text-field"
        sx={{ mb: 3, position: 'relative', zIndex: 1 }}
      />
      
      <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <input
          accept="video/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileInput}
        />
        <label htmlFor="raised-button-file">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            fullWidth
            className="upload-button"
          >
            Select Video File
          </Button>
        </label>
      </Box>
      
      {selectedFile && (
        <Grow in={!!selectedFile} timeout={500}>
          <Paper elevation={0} className="file-info-paper">
            <Typography variant="body2">
              <b>Selected file:</b> {selectedFile.name}
            </Typography>
            <Typography variant="body2">
              <b>Size:</b> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </Typography>
            <Typography variant="body2">
              <b>Type:</b> {selectedFile.type || "Unknown"}
            </Typography>
            <Typography variant="body2">
              <b>Last modified:</b> {new Date(selectedFile.lastModified).toLocaleString()}
            </Typography>
          </Paper>
        </Grow>
      )}
      
      <Button
        onClick={uploadFile}
        variant="contained"
        disabled={!selectedFile || isUploading}
        startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
        className="submit-button"
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </Button>
      
      {progress > 0 && (
        <Box className="progress-container">
          <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
            Upload Progress: {progress}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            className="custom-progress"
          />
        </Box>
      )}
      
      <Button
        onClick={handleFinalSubmit}
        variant="contained"
        disabled={!isSubmitValid || isChecking}
        startIcon={isChecking ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
        className="submit-button"
        sx={{ position: 'relative', zIndex: 1, mt: 'auto' }}
      >
        {isChecking ? 'Analyzing...' : 'Verify Video Authenticity'}
      </Button>
      
      {isChecking && (
        <Box sx={{ 
          mt: 3, 
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: 2,
          borderRadius: 1,
          border: '1px solid rgba(0, 237, 100, 0.2)'
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
            Analyzing video for tampering...
          </Typography>
          <LinearProgress 
            color="success" 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: 'rgba(0, 237, 100, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#00ED64'
              }
            }} 
          />
        </Box>
      )}
    </Box>
  );
};