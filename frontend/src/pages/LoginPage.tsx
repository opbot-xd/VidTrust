import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import MovieIcon from '@mui/icons-material/Movie';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import StarIcon from '@mui/icons-material/Star';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';

import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && menuOpen) {
        setMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogin = async () => {
    try {
      const { data: { url } } = await axios.get(`${serverUrl}/auth/url`);
      window.location.assign(url);
    } catch (err) {
      console.error(err);
    }
  };
  

  const to_video_check = () => {
    navigate("/video_check");
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <>
      <div className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <div className="logo-icon">TV</div>
            <div className="logo-text">TrustVid</div>
          </div>
          
          <div className="navbar-links-desktop">
            <a href="#" className="navbar-link active">
              <HomeIcon fontSize="small" style={{ marginRight: '5px' }} />
              Home
            </a>
            <a href="#" className="navbar-link">
              <InfoIcon fontSize="small" style={{ marginRight: '5px' }} />
              About
            </a>
            <a href="#" className="navbar-link">
              <PriceCheckIcon fontSize="small" style={{ marginRight: '5px' }} />
              Pricing
            </a>
            <a href="#" className="navbar-link">
              <ContactSupportIcon fontSize="small" style={{ marginRight: '5px' }} />
              Contact
            </a>
          </div>
          
          <div className="navbar-actions">
            <Button 
              variant="outlined" 
              className="navbar-button"
              onClick={to_video_check}
              style={{
                borderColor: '#00ED64',
                color: '#00ED64',
                marginRight: '10px',
                display: isMobile ? 'none' : 'flex'
              }}
            >
              Verify Video
            </Button>
            <Button 
              variant="contained" 
              className="navbar-button"
              onClick={handleLogin}
              style={{
                backgroundColor: '#00ED64',
                color: 'black',
                display: isMobile ? 'none' : 'flex'
              }}
            >
              Sign In
            </Button>
            <div className="menu-toggle" onClick={toggleMenu}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </div>
          </div>
        </div>
        
        <div ref={menuRef} className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-links">
            <a href="#" className="mobile-menu-link active">
              <HomeIcon fontSize="small" style={{ marginRight: '10px' }} />
              Home
            </a>
            <a href="#" className="mobile-menu-link">
              <InfoIcon fontSize="small" style={{ marginRight: '10px' }} />
              About
            </a>
            <a href="#" className="mobile-menu-link">
              <PriceCheckIcon fontSize="small" style={{ marginRight: '10px' }} />
              Pricing
            </a>
            <a href="#" className="mobile-menu-link">
              <ContactSupportIcon fontSize="small" style={{ marginRight: '10px' }} />
              Contact
            </a>
            <div className="mobile-menu-buttons">
              <Button 
                variant="outlined" 
                className="mobile-menu-button"
                onClick={to_video_check}
                fullWidth
                style={{
                  borderColor: '#00ED64',
                  color: '#00ED64',
                  marginBottom: '10px'
                }}
              >
                Verify Video
              </Button>
              <Button 
                variant="contained" 
                className="mobile-menu-button"
                onClick={handleLogin}
                fullWidth
                style={{
                  backgroundColor: '#00ED64',
                  color: 'black'
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* animationnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn */}
      <div className='main_div'>
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
        
        <div className='left'>
          <div className='heading'>
            TrustVid
          </div>
          <div className='motto'>
            Your <span>Content</span> now <span>Authenticated</span>
          </div>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            lineHeight: '1.6',
            marginBottom: '2rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            TrustVid is a revolutionary platform that ensures the authenticity of your video content using 
            blockchain technology. Protect your intellectual property and build trust with your audience.
          </p>
          
          <div className="features">
            <div className="feature-item">
              <div className="feature-title">
                <SecurityIcon style={{ marginRight: '8px', fontSize: isMobile ? '1rem' : '1.2rem' }} />
                Secure Authentication
              </div>
              <div className="feature-desc">
                Our platform uses advanced encryption to ensure your content remains secure and tamper-proof.
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-title">
                <MovieIcon style={{ marginRight: '8px', fontSize: isMobile ? '1rem' : '1.2rem' }} />
                Content Verification
              </div>
              <div className="feature-desc">
                Verify the authenticity of any video with our proprietary verification system.
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-title">
                <EnhancedEncryptionIcon style={{ marginRight: '8px', fontSize: isMobile ? '1rem' : '1.2rem' }} />
                Blockchain Technology
              </div>
              <div className="feature-desc">
                Leverage the power of blockchain to create immutable records of your content ownership.
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-title">
                <VerifiedUserIcon style={{ marginRight: '8px', fontSize: isMobile ? '1rem' : '1.2rem' }} />
                Creator Protection
              </div>
              <div className="feature-desc">
                Protect your intellectual property and ensure proper attribution for your creative work.
              </div>
            </div>
          </div>
        </div>

        <div className='right' style={{ 
          opacity: isVisible ? 1 : 0, 
          transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
        }}>
          <Card 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              boxShadow: '0 0 20px 5px rgba(0, 237, 100, 0.3)',
              backdropFilter: 'blur(10px)',
              padding: isMobile ? "4%" : "5%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxSizing: "border-box",
              overflow: "hidden"
            }}
          >
            <CardContent 
              className='card' 
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                padding: isMobile ? "12px" : "16px",
                boxSizing: "border-box"
              }}
            >
              <h2 
                className='form_heading' 
                style={{ 
                  marginTop:"0px",
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: isMobile ? '20px' : '30px',
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: "700",
                  width: "100%",
                  wordWrap: "break-word"
                }}
              >
                Login as Content Creator
              </h2>
              <Button   
                variant='contained'
                onClick={handleLogin}
                startIcon={<GoogleIcon />}
                style={{
                  padding: isMobile ? "10px 0" : "12px 0",
                  width: isMobile ? "90%" : "70%",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: "700",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  backgroundColor: '#00ED64',
                  color: 'black',
                  marginBottom: isMobile ? '20px' : '25px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                className="form_button"
              >
                Sign In with Google
              </Button>
              
              <div className="social-proof" style={{ 
                width: "100%", 
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "8px" : "0"
              }}>
                <div className="social-icon" style={{ 
                  display: "inline-flex",
                  marginRight: isMobile ? "0" : "8px" 
                }}>
                  <StarIcon style={{ color: '#00ED64', fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
                </div>
                <p style={{ 
                  color: 'white', 
                  fontFamily: 'Roboto, sans-serif', 
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  margin: isMobile ? "0" : "0 0 0 8px",
                  display: "inline-block",
                  verticalAlign: "middle"
                }}>
                  Trusted by 10,000+ content creators worldwide
                </p>
              </div>
            </CardContent>
            
            <div style={{
              width: isMobile ? "90%" : "80%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #00ED64, transparent)",
              margin: isMobile ? "15px 0" : "20px 0",
            }}></div>
            
            <Button 
              onClickCapture={to_video_check}  
              variant='contained'
              startIcon={<VerifiedUserIcon />}
              style={{
                padding: isMobile ? "10px 0" : "12px 0",
                width: isMobile ? "90%" : "70%",
                fontFamily: "Roboto, sans-serif",
                fontWeight: "700",
                fontSize: isMobile ? "0.9rem" : "1rem",
                backgroundColor: 'rgba(0, 237, 100, 0.2)',
                color: 'white',
                marginBottom: '0px',
                marginTop: isMobile ? "15px" : "25px",
                borderRadius: '8px',
                border: '1px solid #00ED64',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              className="form_button"
            >
              Authenticate a Video
            </Button>
            
            <p style={{
              color: "white",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              fontSize: isMobile ? "0.9rem" : "1rem",
              margin: isMobile ? "8px 0" : "10px 0",
              textAlign: "center",
            }}>
              (No Login Required)
            </p>
            
            <div className="testimonials" style={{ 
              width: isMobile ? "95%" : "90%", 
              padding: isMobile ? "12px" : "15px",
              boxSizing: "border-box" 
            }}>
              <div className="testimonial-text" style={{
                fontSize: isMobile ? "0.8rem" : "0.9rem",
                lineHeight: isMobile ? "1.4" : "1.5"
              }}>
                "TrustVid has completely transformed how I protect my content. The authentication process is seamless and gives me peace of mind."
              </div>
              <div className="testimonial-author" style={{
                fontSize: isMobile ? "0.8rem" : "0.9rem"
              }}>
                — Deenank Sharma, Developer
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;