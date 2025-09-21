import React from 'react';
import { 
  Box, Typography, Card, CardContent, Accordion, 
  AccordionSummary, AccordionDetails, CircularProgress 
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import FaceIcon from '@mui/icons-material/Face';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Report, Shorts_Report, VideoTamperingDetectionReport } from "../type";

interface ResultsPanelProps {
  json_report: Report | null;
  json_report_for_shorts: Shorts_Report | null;
  video_tampering_report: VideoTamperingDetectionReport | null;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  json_report,
  json_report_for_shorts,
  video_tampering_report
}) => {
  const getTamperingScore = () => {
    if (!video_tampering_report) return 0;
    
    const reasons = video_tampering_report['Video Tampering Detection Report']["4. Tampering Detection Summary"]["Reasons for Potential Tampering Detection"].length;
    const isTampered = video_tampering_report['Video Tampering Detection Report']["4. Tampering Detection Summary"]["Tampering Detected"] === "Yes";
    
    return isTampered ? Math.min(100, 50 + (reasons * 10)) : Math.max(0, 40 - (reasons * 10));
  }

  const renderTrustScore = () => {
    const score = 100 - getTamperingScore();
    let color = '#4CAF50';
    let label = 'High Trust';
    
    if (score < 40) {
      color = '#F44336';
      label = 'Low Trust';
    } else if (score < 70) {
      color = '#FFC107';
      label = 'Medium Trust';
    }
    
    return (
      <Box className="trust-score-container">
        <Typography variant="h6" sx={{ mb: 1 }}>Trust Score</Typography>
        <Box className="score-circle">
          <CircularProgress 
            variant="determinate" 
            value={100} 
            size={120} 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.1)',
              position: 'absolute',
            }} 
          />
          <CircularProgress 
            variant="determinate" 
            value={score} 
            size={120} 
            sx={{ 
              color: color,
              position: 'absolute',
            }} 
          />
          <Typography className="score-value" sx={{ color }}>
            {Math.round(score)}%
          </Typography>
        </Box>
        <Typography className="score-label" sx={{ color }}>
          {label}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="panel-container" sx={{ height: 'auto', minHeight: '500px', overflowY: 'auto' }}>
      <div className="floating-element-top-left"></div>
      
      <Typography variant="h5" className="section-title">
        Authentication Report
      </Typography>

      {!json_report && !json_report_for_shorts ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          position: 'relative',
          zIndex: 1
        }}>
          <SecurityIcon sx={{ fontSize: 60, color: '#00ED64', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Report Available
          </Typography>
          <Typography variant="body2">
            Upload and verify a video to see the authentication report here.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {renderTrustScore()}
          
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" className="info-card-title">
                Verification Results
              </Typography>
              
              {json_report && (
                <>
                  <Box className="feature-item">
                    <SecurityIcon className="feature-icon" />
                    <Typography variant="body2">
                      <b>Signature:</b> {json_report["Signature verification result"]}
                    </Typography>
                  </Box>
                  
                  <Box className="feature-item">
                    <MovieIcon className="feature-icon" />
                    <Typography variant="body2">
                      <b>Tampering:</b> {video_tampering_report?.["Video Tampering Detection Report"]["4. Tampering Detection Summary"]["Tampering Detected"]}
                    </Typography>
                  </Box>
                  
                  <Box className="feature-item">
                    <AudiotrackIcon className="feature-icon" />
                    <Typography variant="body2">
                      <b>Audio:</b> {json_report["Audio analysis result"]}
                    </Typography>
                  </Box>
                  
                  <Box className="feature-item">
                    <FaceIcon className="feature-icon" />
                    <Typography variant="body2">
                      <b>Deepfake Probability:</b> {json_report["deepfake chances"]}%
                    </Typography>
                  </Box>
                </>
              )}
              
              {json_report_for_shorts && (
                <>
                  <Box className="feature-item">
                    <SecurityIcon className="feature-icon" />
                    <Typography variant="body2">
                      <b>Signature:</b> {json_report_for_shorts["Signature verification result"]}
                    </Typography>
                  </Box>
                  
                  <Box className="feature-item">
                    <MovieIcon className="feature-icon" />
                    <Typography variant="body2">
                      <b>Tampering:</b> {video_tampering_report?.["Video Tampering Detection Report"]["4. Tampering Detection Summary"]["Tampering Detected"]}
                    </Typography>
                  </Box>
                  
                  <Box className="feature-item">
                    <FaceIcon className="feature-icon" />
                    <Typography variant="body2">
                      <b>Deepfake Probability:</b> {json_report_for_shorts["deepfake chances"]}%
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
          
          {video_tampering_report && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                Detailed Analysis
              </Typography>
              
              <Accordion className="report-accordion">
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00ED64' }} />}>
                  <Typography>Shot Change Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails className="accordion-content">
                  <Box className="report-detail-item">
                    <Typography variant="body2" className="report-detail-label">
                      Average Shot Duration:
                    </Typography>
                    <Typography variant="body2" className="report-detail-value">
                      {video_tampering_report["Video Tampering Detection Report"]["1. Shot Change Analysis"]["Average Shot Duration"]}
                    </Typography>
                  </Box>
                  <Box className="report-detail-item">
                    <Typography variant="body2" className="report-detail-label">
                      Rapid Shot Changes:
                    </Typography>
                    <Typography variant="body2" className="report-detail-value">
                      {video_tampering_report["Video Tampering Detection Report"]["1. Shot Change Analysis"]["Number of Rapid Shot Changes"]}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
              
              <Accordion className="report-accordion">
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00ED64' }} />}>
                  <Typography>Motion Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails className="accordion-content">
                  <Box className="report-detail-item">
                    <Typography variant="body2" className="report-detail-label">
                      Motion Consistency:
                    </Typography>
                    <Typography variant="body2">
                      {video_tampering_report["Video Tampering Detection Report"]["2. Motion Analysis"]["Motion Consistency"]}
                    </Typography>
                  </Box>
                  <Box className="report-detail-item">
                    <Typography variant="body2" className="report-detail-label">
                      Unnatural Motion Detected:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className={`report-detail-value ${
                        video_tampering_report["Video Tampering Detection Report"]["2. Motion Analysis"]["Unnatural Motion Detected"] === "No" 
                          ? "positive" 
                          : "negative"
                      }`}
                    >
                      {video_tampering_report["Video Tampering Detection Report"]["2. Motion Analysis"]["Unnatural Motion Detected"]}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
              
              {/* Visual Artifacts and Tampering Summary accordions would go here */}
              {/* Abbreviated for brevity */}
            </Box>
          )}
          
          <Box className="info-box">
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ fontSize: 16, mr: 1, color: '#00ED64' }} />
              This report is based on AI analysis and should be used as a guide. For critical verification, consult with digital forensics experts.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};