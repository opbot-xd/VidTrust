import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Callback from './pages/Callback';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import VideoCheck from './pages/VideoCheck';
import FactCheckPage from './pages/FactCheckPage';

const App: React.FC = () => {
  useAuth();
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
            <Routes>
            <Route element={<LoginPage />} path='/' />
            {/* <Route element={loggedIn ? <Home /> : <Navigate to="/"/>} path="/home" />  */}
            <Route element={<Home />} path="/home" /> 
            <Route element={<Callback />} path='/auth/callback' />
            <Route element={<VideoCheck />} path='/video_check'/>
            <Route element={<FactCheckPage />} path='/fact-check' />
            </Routes>
        </BrowserRouter>

      </header>
    </div>
  );
};

export default App;