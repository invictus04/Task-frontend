import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8080/api';


export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const storedAuth = localStorage.getItem('authToken');
    if (storedAuth) {
      setAuth(storedAuth);
    }
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);

    const token = 'Basic ' + btoa(`${username}:${password}`);

    try {

      await axios.get(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: token,
        },
        params: { page: 0, size: 1 }, 
      });

      localStorage.setItem('authToken', token);
      setAuth(token);
      navigate('/dashboard');

    } catch (err) {
   
      if (err.response && err.response.status === 401) {
        setError('Invalid username or password. Please try again.');
      } else {
    
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const contextValue = { auth, isLoading, error, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

