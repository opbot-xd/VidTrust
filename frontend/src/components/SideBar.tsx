import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import Dashboard from './Dashboard';
import { useSidebarContext } from '../context/TabContext.tsx';
import { useMediaQuery, useTheme } from '@mui/material';

export default function StyledDrawer() {
  const { selectedItem, updateSelectedItem, sidebarOpen, toggleSidebar } = useSidebarContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const DrawerList = (
    <Box 
      sx={{ 
        width: 250, 
        height: '100%',
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(0, 237, 100, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }} 
      role="presentation"
    >
      <Box sx={{ 
        padding: '20px 15px',
        borderBottom: '1px solid rgba(0, 237, 100, 0.1)',
      }}>
        <h2 style={{
          color: 'white',
          fontSize: "1.5rem",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: "700",
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          <span style={{ color:"#00ED64" }}>Trust</span>Vid
        </h2>
      </Box>
      
      <List sx={{ 
        flexGrow: 1, 
        padding: '15px 0',
        overflowY: 'auto',
      }}>
        {[
          { text: 'Upload Videos', icon: <DriveFolderUploadIcon /> },
          { text: 'Video Library', icon: <VideoLibraryIcon /> }
        ].map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => updateSelectedItem(index)}
              sx={{
                margin: '0 8px',
                borderRadius: '8px',
                padding: '10px 12px',
                backgroundColor: selectedItem === index ? 'rgba(0, 237, 100, 0.15)' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: selectedItem === index ? 'rgba(0, 237, 100, 0.2)' : 'rgba(0, 237, 100, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: selectedItem === index ? '#00ED64' : 'rgba(255, 255, 255, 0.7)',
                minWidth: '35px',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    color: selectedItem === index ? '#00ED64' : 'white',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: selectedItem === index ? 600 : 400,
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ 
        p: 2, 
        mt: 'auto',
        borderTop: '1px solid rgba(0, 237, 100, 0.1)',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <Dashboard />
      </Box>
    </Box>
  );

  return (
    <Drawer 
      open={sidebarOpen}
      variant={isMobile ? "temporary" : "persistent"}
      onClose={toggleSidebar}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          width: 250,
          border: 'none',
        }
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {DrawerList}
    </Drawer>
  );
}