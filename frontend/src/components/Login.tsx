import React from 'react';
import axios from 'axios';
import { serverUrl } from '../utils/api';

const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      const { data: { url } } = await axios.get(`${serverUrl}/auth/url`);
      window.location.assign(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h3>Login to Dashboard</h3>
      <button className="btn" onClick={handleLogin}>
        Login
      </button>
    </>
  );
};

export default Login;