
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import Dashboard from './components/Dashboard';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('auth_token');
  const storedTime = localStorage.getItem('auth_login_time');
  const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

  // Condition: Token exists AND it has been LESS than 4 days
  const isValidSession = token && storedTime && (Date.now() - parseInt(storedTime)) <= FOUR_DAYS_MS;

  if (!isValidSession) {
    // If the token is missing OR it has been MORE than 4 days
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_login_time');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
