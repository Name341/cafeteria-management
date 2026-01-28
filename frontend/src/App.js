import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import CookDashboard from './pages/CookDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const ProtectedRoute = ({ element, role }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.id) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }
  
  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/student" 
          element={<ProtectedRoute element={<StudentDashboard />} role="student" />}
        />
        <Route 
          path="/cook" 
          element={<ProtectedRoute element={<CookDashboard />} role="cook" />}
        />
        <Route 
          path="/admin" 
          element={<ProtectedRoute element={<AdminDashboard />} role="admin" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
