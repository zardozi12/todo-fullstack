import React from 'react';
import LoginSignupForm from './components/LoginSignupForm';
import TodoList from './components/TodoList';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';

const AppContent = () => {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<LoginSignupForm />} />
      <Route path="/" element={token ? <TodoList /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;