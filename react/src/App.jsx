import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import Profile from './components/Profile';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  return <Navigate to={token ? "/chat" : "/login"} replace />;
};

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/register', '/login', '/chat', '/profile']);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container" data-easytag="id5-src/App.jsx">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
