import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from '../utils/api';

interface VideoUrl {
  id: string;
  email: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  date:string;
}

const VideosFetch: React.FC = () => {
  const [urls, setUrls] = useState<VideoUrl[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoUrl | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const get_video_urls = async () => {
    try {
      const response = await axios.get<VideoUrl[]>(`${serverUrl}/auth/video_fetch_url`);
      setUrls(response.data);
    } catch (err) {
      console.error("Error fetching video URLs:", err);
    }
  };

  useEffect(()=>{
    get_video_urls()
  },[])

  const playVideo = (video: VideoUrl) => {
    setSelectedVideo(video);
    setIsVideoPlaying(true);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setIsVideoPlaying(false);
  };

  return (
    <div style={styles.container}>
      {isVideoPlaying && selectedVideo && (
        <div style={styles.overlay}>
          <div style={styles.modalContent}>
            <div style={styles.videoWrapper}>
              <video 
                src={selectedVideo.videoUrl} 
                controls 
                autoPlay 
                style={styles.video}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <h2 style={styles.modalTitle}>{selectedVideo.title}</h2>
            <button 
              onClick={closeVideo}
              style={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {urls.map((video) => (
          <div key={video.id} style={styles.card}>
            <div style={{...styles.thumbnail, backgroundImage: `url(${video.imageUrl})`}} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{video.title}</h3>
              <button 
                onClick={() => playVideo(video)}
                style={styles.playButton}
              >
                Play
              </button>
              <h3 style={styles.cardTitle}>{video.date}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position : 'absolute' as const,
    right:0,
    top:0,
    left:250,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '40px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '15px',
    boxShadow: '0 0 10px 5px rgba(0, 237, 100, 0.3)',
    backdropFilter: 'blur(5px)',
    maxWidth: '1150px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  thumbnail: {
    width: '100%',
    height: '200px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  cardContent: {
    padding: '15px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'white',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  playButton: {
    backgroundColor: '#00ED64',
    color: 'black',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '80%',
    width: '800px',
    boxShadow: '0 0 10px 5px rgba(0, 237, 100, 0.3)',
  },
  videoWrapper: {
    position: 'relative' as const,
    paddingTop: '56.25%', 
  },
  video: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '15px',
    marginBottom: '15px',
    color: 'white',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  closeButton: {
    backgroundColor: '#00ED64',
    color: 'black',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
};

export default VideosFetch;