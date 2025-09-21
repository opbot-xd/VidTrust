import React from 'react';
import { useAuth } from '../context/AuthContext';
import UploadVideoToS3WithNativeSdk from '@/components/VideoUpload';
import VideosFetch from '@/components/VideosFetch';
import StyledDrawer from '@/components/SideBar';
import { useSidebarContext } from '@/context/TabContext';
import { 
  Box, Typography, Paper, Fade, useMediaQuery, useTheme, IconButton 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import MenuIcon from '@mui/icons-material/Menu';
import FactChecker from '@/components/FactChecker';

const Home: React.FC = () => {
  const { loggedIn, user } = useAuth();
  const { selectedItem, sidebarOpen, toggleSidebar } = useSidebarContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loggedIn === true) {
    return (
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        maxWidth: '100vw',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.9) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          zIndex: 0,
          opacity: 0.5,
          pointerEvents: 'none',
        }} />
        
        {isMobile && (
          <IconButton 
            onClick={toggleSidebar}
            sx={{ 
              position: 'fixed',
              top: '15px',
              left: '15px',
              zIndex: 1200,
              color: '#00ED64',
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <StyledDrawer />
        
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          ml: { xs: 0, md: sidebarOpen ? '250px' : '0' },
          // add extra top margin so the right-hand content bar doesn't stick to top
          mt: { xs: isMobile ? '80px' : (sidebarOpen ? '200px' : '300px'), md: sidebarOpen ? '200px' : '300px' },
          transition: 'all 0.3s ease',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
          overflowX: 'hidden',
        }}>
          
          <Fade in={true} timeout={800}>
            <Paper elevation={0} sx={{
              mb: 3,
              p: { xs: 2, sm: 3 },
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    mb: 1,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  Welcome back
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'white',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    wordBreak: 'break-word',
                  }}
                >
                  {user?.name || 'Creator'}
                </Typography>
                
                <Box sx={{ 
                  width: '60px', 
                  height: '3px', 
                  background: '#00ED64',
                  borderRadius: '2px',
                  mt: 1
                }} />
              </Box>
            </Paper>
          </Fade>

          {/* Header Section */}
          <Fade in={true} timeout={1000}>
            <Box sx={{ 
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                width: '100%',
                boxSizing: 'border-box',
              }}>
                <Box sx={{ 
                  color: '#00ED64', 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: { xs: '36px', sm: '42px' },
                  height: { xs: '36px', sm: '42px' },
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 237, 100, 0.1)',
                }}>
                  {selectedItem === 0 ? (
                    <CloudUploadIcon sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />
                  ) : (
                    <VideoLibraryIcon sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />
                  )}
                </Box>
                
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: 'white',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {selectedItem === 0 ? 'Upload New Video' : 'Your Video Library'}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: { xs: '0.75rem', sm: '0.8rem' },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {selectedItem === 0 
                      ? 'Share your content securely with TrustVid technology' 
                      : 'Manage and view your uploaded videos'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>

          {/* Content Section */}
          <Fade in={true} timeout={1200}>
            <Paper elevation={0} sx={{ 
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
              p: { xs: 2, sm: 3 },
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxSizing: 'border-box',
              overflow: 'auto',
              minHeight: '400px',
              maxWidth: '100%',
            }}>
              {selectedItem === 0 ? <UploadVideoToS3WithNativeSdk /> : <VideosFetch />}
            </Paper>
          </Fade>
          {/* Fact Checker Section (moved below content) */}
          <Fade in={true} timeout={1100}>
            <Box sx={{ mt: 3 }}>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', background: 'transparent', border: 'none' }}>
                <FactChecker />
              </Paper>
            </Box>
          </Fade>
          
          {/* Footer */}
          <Box sx={{ 
            mt: 3, 
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.75rem',
            fontFamily: 'Space Grotesk, sans-serif',
            width: '100%',
            pb: 2,
          }}>
            TrustVid © {new Date().getFullYear()} | Secure Video Authentication Platform
          </Box>
        </Box>
      </Box>
    );
  }

  return null;
};

export default Home;