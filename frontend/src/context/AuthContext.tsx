import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { serverUrl } from '../utils/api';

interface AuthContextType {
  loggedIn: boolean | null;
  checkLoginState: () => Promise<void>;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  // const [loggedIn, setLoggedIn] = useState<boolean | null>(null);/
  const [loggedIn, setLoggedIn] = useState<boolean | null>(true);
  const [user, setUser] = useState<any>(null);

  const checkLoginState = useCallback(async () => {
    try {
      // const {
      //   data: { loggedIn: logged_in, user },
      // } = await axios.get(`${serverUrl}/auth/logged_in`);
      // setLoggedIn(logged_in);
      // if (user) {
      //   setUser(user);
      // }/
      setLoggedIn(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  return (
    <AuthContext.Provider value={{ loggedIn, checkLoginState, user }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};