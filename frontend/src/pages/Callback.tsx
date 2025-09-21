import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { serverUrl } from '../utils/api';

const Callback: React.FC = () => {
  const called = useRef(false);
  const { checkLoginState, loggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      if (loggedIn === false) {
        try {
          if (called.current) return;
          called.current = true;
          const res = await axios.get(`${serverUrl}/auth/token${window.location.search}`);
          console.log('response: ', res);
          checkLoginState();
          console.log("abhi chalo home page par !!!")
          navigate('/home');
        } catch (err) {
          console.error(err);
          navigate('/');
        }
      } else if (loggedIn === true) {
        navigate('/home');
      }
    };

    handleCallback();
  }, [checkLoginState, loggedIn, navigate]);

  return null;
};

export default Callback;