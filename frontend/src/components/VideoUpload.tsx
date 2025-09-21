import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY);


import { Box, Typography, TextField, Button, LinearProgress, Alert, Paper, Grid, Divider } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MovieIcon from '@mui/icons-material/Movie';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { serverUrl } from '../utils/api';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadVideoToS3WithNativeSdk = () => {
    const [video_exists, setVideo_exists] = useState<Boolean>(false);
    const [video_exists_error, setVideo_exists_error] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [selectedFile2, setSelectedFile2] = useState<any>();
    const [selectedFile1, setSelectedFile1] = useState<any>();
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileInput1 = (e: any) => {
        setSelectedFile1(e.target.files[0]);
    }

    const handleFileInput2 = (e: any) => {
        setSelectedFile2(e.target.files[0]);
    }

    const handleTitleChange = (e: any) => {
        setTitle(e.target.value);
    }

    const handleFinalSubmit = async (e: any) => {
        e.preventDefault();
        var date_stamp = new Date()
        const date = `${date_stamp.getDate()} - ${date_stamp.getMonth()} - ${date_stamp.getFullYear()}`
        var storeStruct = {
            title: title,
            imageUrl: imageUrl,
            videoUrl: videoUrl,
            date: date,
        }
        
        try {
            const response = await axios.post(`${serverUrl}/auth/video_url`, storeStruct)
            if (response.status === 200) {
                if(response.data.status === 'success'){
                    setUploadSuccess(true);
                    setTimeout(() => {
                        setUploadSuccess(false);
                        resetForm();
                    }, 3000);
                }
                else if (response.data.status === 'failure'){
                    setVideo_exists(true)
                    setVideo_exists_error(response.data.message)
                    setTimeout(() => {
                        setVideo_exists(false);
                        resetForm();
                    }, 5000);
                }
            }
        } catch (error) {
            console.error("Error submitting video:", error);
            setVideo_exists(true);
            setVideo_exists_error("An error occurred while uploading your video");
        }
    }

    const resetForm = () => {
        setImageUrl("");
        setProgress1(0);
        setProgress2(0);
        setVideoUrl("");
        setTitle("");
        setSelectedFile1(null);
        setSelectedFile2(null);
    }

    const uploadFile1 = async (file: File, bucket: string, setProgress: React.Dispatch<React.SetStateAction<number>>, setUrl: React.Dispatch<React.SetStateAction<string>>) => {
        if (!file) return;
        const fileExt = file.name.split('.').pop();
        
        if(fileExt === "mkv"){
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;
            
            try {
                const { data, error } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(filePath);
                setUrl(publicUrl);
                setProgress(100);
            } catch (error) {
                console.error('Error uploading file:', error);
                setProgress(0);
            }
        }
        else if(fileExt === "mp4"){
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;
            
            try {
                const { data, error } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(filePath);
                setUrl(publicUrl);
                
                const response = await axios.post(`${serverUrl}/auth/mp4_file_handler`,{
                    url : publicUrl
                });
                
                if(response.status === 200){
                    setUrl(response.data['data']);
                    setProgress(100);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                setProgress(0);
            }
        }
    }

    const uploadFile2 = async (file: File, bucket: string, setProgress: React.Dispatch<React.SetStateAction<number>>, setUrl: React.Dispatch<React.SetStateAction<string>>) => {
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
            setUrl(publicUrl);
            setProgress(100);

        } catch (error) {
            console.error('Error uploading file:', error);
            setProgress(0);
        }
    }

    return (
        <Paper elevation={0} sx={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 237, 100, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 237, 100, 0.1)',
            overflow: 'hidden',
        }}>
            {uploadSuccess && (
                <Alert 
                    icon={<CheckCircleIcon fontSize="inherit" />} 
                    severity="success"
                    sx={{ 
                        backgroundColor: 'rgba(0, 237, 100, 0.2)',
                        color: '#00ED64',
                        fontFamily: 'Space Grotesk, sans-serif',
                    }}
                >
                    Video uploaded successfully!
                </Alert>
            )}
            
            {video_exists && (
                <Alert 
                    severity="error"
                    sx={{ 
                        backgroundColor: 'rgba(255, 72, 66, 0.2)',
                        color: '#ff4842',
                        fontFamily: 'Space Grotesk, sans-serif',
                    }}
                >
                    {video_exists_error}
                </Alert>
            )}
            
            <Box sx={{
                padding: '32px',
            }}>
                <TextField
                    fullWidth
                    label="Video Title"
                    variant="outlined"
                    value={title}
                    onChange={handleTitleChange}
                    sx={{
                        mb: 4,
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(0, 237, 100, 0.5)', borderRadius: '10px' },
                            '&:hover fieldset': { borderColor: '#00ED64' },
                            '&.Mui-focused fieldset': { borderColor: '#00ED64' },
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        },
                        '& .MuiInputLabel-root': { 
                            color: 'rgba(0, 237, 100, 0.8)',
                            fontFamily: 'Space Grotesk, sans-serif',
                        },
                        '& .MuiInputLabel-root.Mui-focused': { 
                            color: '#00ED64',
                        },
                    }}
                />

                <Grid container spacing={4}>
                    {/* Video Upload Section */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            border: '1px dashed rgba(0, 237, 100, 0.5)',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <MovieIcon sx={{ fontSize: 48, color: '#00ED64', mb: 2 }} />
                            
                            <Typography variant="h6" sx={{ 
                                color: 'white', 
                                mb: 1,
                                fontFamily: 'Space Grotesk, sans-serif',
                            }}>
                                Upload Video
                            </Typography>
                            
                            <Typography variant="body2" sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)', 
                                mb: 3,
                                fontFamily: 'Space Grotesk, sans-serif',
                            }}>
                                Supported formats: MP4, MKV
                            </Typography>
                            
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    mb: 2,
                                    borderColor: '#00ED64',
                                    color: '#00ED64',
                                    '&:hover': { 
                                        backgroundColor: 'rgba(0, 237, 100, 0.1)',
                                        borderColor: '#00ED64',
                                    },
                                }}
                            >
                                Select Video
                                <VisuallyHiddenInput type="file" onChange={handleFileInput1} />
                            </Button>
                            
                            {selectedFile1 && (
                                <Typography variant="body2" sx={{ 
                                    color: 'white', 
                                    mb: 2,
                                    fontFamily: 'Space Grotesk, sans-serif',
                                }}>
                                    {selectedFile1.name}
                                </Typography>
                            )}
                            
                            <Button
                                variant="contained"
                                onClick={() => uploadFile1(selectedFile1, 'video', setProgress1, setVideoUrl)}
                                disabled={!selectedFile1}
                                sx={{
                                    backgroundColor: '#00ED64',
                                    color: 'black',
                                    '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
                                    '&.Mui-disabled': { backgroundColor: 'rgba(0, 237, 100, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
                                    fontFamily: 'Space Grotesk, sans-serif',
                                    fontWeight: 600,
                                }}
                            >
                                Upload Video
                            </Button>
                            
                            {progress1 > 0 && (
                                <Box sx={{ width: '100%', mt: 2 }}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={progress1} 
                                        sx={{ 
                                            backgroundColor: 'rgba(0, 237, 100, 0.3)', 
                                            '& .MuiLinearProgress-bar': { backgroundColor: '#00ED64' },
                                            height: 8,
                                            borderRadius: 4,
                                        }} 
                                    />
                                    <Typography variant="body2" sx={{ 
                                        color: 'white', 
                                        mt: 1,
                                        textAlign: 'center',
                                        fontFamily: 'Space Grotesk, sans-serif',
                                    }}>
                                        {progress1}% Uploaded
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                    
                    {/* Thumbnail Upload Section */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            border: '1px dashed rgba(0, 237, 100, 0.5)',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <ImageIcon sx={{ fontSize: 48, color: '#00ED64', mb: 2 }} />
                            
                            <Typography variant="h6" sx={{ 
                                color: 'white', 
                                mb: 1,
                                fontFamily: 'Space Grotesk, sans-serif',
                            }}>
                                Upload Thumbnail
                            </Typography>
                            
                            <Typography variant="body2" sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)', 
                                mb: 3,
                                fontFamily: 'Space Grotesk, sans-serif',
                            }}>
                                Recommended size: 1280×720 pixels
                            </Typography>
                            
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    mb: 2,
                                    borderColor: '#00ED64',
                                    color: '#00ED64',
                                    '&:hover': { 
                                        backgroundColor: 'rgba(0, 237, 100, 0.1)',
                                        borderColor: '#00ED64',
                                    },
                                }}
                            >
                                Select Image
                                <VisuallyHiddenInput type="file" onChange={handleFileInput2} />
                            </Button>
                            
                            {selectedFile2 && (
                                <Typography variant="body2" sx={{ 
                                    color: 'white', 
                                    mb: 2,
                                    fontFamily: 'Space Grotesk, sans-serif',
                                }}>
                                    {selectedFile2.name}
                                </Typography>
                            )}
                            
                            <Button
                                variant="contained"
                                onClick={() => uploadFile2(selectedFile2, 'images', setProgress2, setImageUrl)}
                                disabled={!selectedFile2}
                                sx={{
                                    backgroundColor: '#00ED64',
                                    color: 'black',
                                    '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
                                    '&.Mui-disabled': { backgroundColor: 'rgba(0, 237, 100, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
                                    fontFamily: 'Space Grotesk, sans-serif',
                                    fontWeight: 600,
                                }}
                            >
                                Upload Thumbnail
                            </Button>
                            
                            {progress2 > 0 && (
                                <Box sx={{ width: '100%', mt: 2 }}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={progress2} 
                                        sx={{ 
                                            backgroundColor: 'rgba(0, 237, 100, 0.3)', 
                                            '& .MuiLinearProgress-bar': { backgroundColor: '#00ED64' },
                                            height: 8,
                                            borderRadius: 4,
                                        }} 
                                    />
                                    <Typography variant="body2" sx={{ 
                                        color: 'white', 
                                        mt: 1,
                                        textAlign: 'center',
                                        fontFamily: 'Space Grotesk, sans-serif',
                                    }}>
                                        {progress2}% Uploaded
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
                
                <Divider sx={{ my: 4, backgroundColor: 'rgba(0, 237, 100, 0.2)' }} />
                
                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={handleFinalSubmit}
                    disabled={!title || !videoUrl || !imageUrl}
                    sx={{
                        py: 1.5,
                        backgroundColor: '#00ED64',
                        color: 'black',
                        '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
                        '&.Mui-disabled': { backgroundColor: 'rgba(0, 237, 100, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderRadius: '10px',
                    }}
                >
                    Submit Video
                </Button>
            </Box>
        </Paper>
    );
}

export default UploadVideoToS3WithNativeSdk;