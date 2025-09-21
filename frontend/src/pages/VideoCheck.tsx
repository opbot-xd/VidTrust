import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import axios from "axios";
import { serverUrl } from '../utils/api';
import { useNavigate } from "react-router-dom";
import { 
  Box, TextField, Button, Typography, LinearProgress, Paper,
  Container, Grid, Fade, Grow, IconButton, Tooltip,
  CircularProgress, Alert, Chip, Card, CardContent,
  Step, StepLabel, Stepper, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { motion } from "framer-motion";
import { Report, Shorts_Report, VideoTamperingDetectionReport } from "../type";
import './VideoCheck.css';
import { PageHeader } from "../components/PageHeader";
import { UploadPanel } from "../components/UploadPanel";
import { ResultsPanel } from "../components/ResultsPanel";
import { HelpContent } from "../components/HelpContent";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const VideoCheck: React.FC = () => {
  
  const [wasVidChecked, setWasVidChecked] = useState<boolean>(false);
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [json_report, setReport] = useState<Report|null>(null);
  const [json_report_for_shorts, setReport_for_shorts] = useState<Shorts_Report|null>(null);
  const [video_tampering_report, setVideoTamperingReport] = useState<VideoTamperingDetectionReport|null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isSubmitValid, setIsSubmitValid] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Steps for the stepper
  const steps = ['Upload Video', 'Process Video', 'View Results'];

  // Effects
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    if (selectedFile) {
      setActiveStep(1);
    }
    if (isSubmitValid) {
      setActiveStep(2);
    }
    if (json_report || json_report_for_shorts) {
      setActiveStep(3);
    }
  }, [selectedFile, isSubmitValid, json_report, json_report_for_shorts]);

  // Event handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return;
    if (!title.trim()) {
      setError("Please enter a title for your video");
      return;
    }

    setIsUploading(true);
    setError(null);

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('videos-to-check')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('videos-to-check')
        .getPublicUrl(filePath);
      
      setVideoUrl(publicUrl);
      setIsSubmitValid(true);
      setProgress(100);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError(null);
    
    try {
      const storeStruct = {
        name: title,
        videoUrl: videoUrl,
      }
      
      const response = await axios.post(`${serverUrl}/test_video_url`, storeStruct);
      
      if (response.status === 200) {
        setWasVidChecked(true);
        
        if (response.data.is_video) {
          const json_report = response.data.message;
          const video_tampering_report = JSON.parse(json_report['Tampering detection result'].replace(/```json|```/g, '').trim());
          setReport(json_report);
          setVideoTamperingReport(video_tampering_report);
        } else if (!response.data.is_video) {
          const shorts_report = response.data.message;
          const video_tampering_report = JSON.parse(shorts_report['Tampering detection result'].replace(/```json|```/g, '').trim());
          setReport_for_shorts(shorts_report);
          setVideoTamperingReport(video_tampering_report);
        }
      }
    } catch (error) {
      console.error('Error checking video:', error);
      setError("Failed to analyze video. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }

  const handleBackToHome = async () => {
    if (wasVidChecked) {
      try {
        const deleteThisVideo = {
          name: title
        }
        await axios.post(`${serverUrl}/delete_video`, deleteThisVideo);
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
    navigate('/');
  }

  // Main render
  return (
    <Fade in={pageLoaded} timeout={800}>
      <Container maxWidth="lg" className="video-check-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader 
            title="Video Authentication" 
            handleBackToHome={handleBackToHome} 
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          />
          
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel className="custom-stepper">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          {showHelp && <HelpContent setShowHelp={setShowHelp} />}
        </motion.div>

        <Grid container spacing={3}>
          {/* Upload  */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <UploadPanel
                title={title}
                handleTitleChange={handleTitleChange}
                selectedFile={selectedFile}
                handleFileInput={handleFileInput}
                uploadFile={uploadFile}
                handleFinalSubmit={handleFinalSubmit}
                isUploading={isUploading}
                isChecking={isChecking}
                isSubmitValid={isSubmitValid}
                progress={progress}
                error={error}
              />
            </motion.div>
          </Grid>

          {/* Results */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ResultsPanel
                json_report={json_report}
                json_report_for_shorts={json_report_for_shorts}
                video_tampering_report={video_tampering_report}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default VideoCheck;