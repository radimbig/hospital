import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
// No longer importing HomePage directly, it will be handled by AuthenticatedRoutes
import AdminPage from './pages/admin/AdminPage';
import DoctorPage from './pages/doctor/DoctorPage';
import PatientPage from './pages/patient/PatientPage';
import useAuthStore from './store/authStore';
import { getAuthTokenFromStorage, isTokenExpired, getUserDetailsFromDecodedToken } from './utils/authUtils';
import { jwtDecode } from 'jwt-decode';
// import './App.css'; // Keep commented out

// This component will decide which page to show based on the role
function AuthenticatedRoutes() {
  const { userRole } = useAuthStore();

  // It's good practice to handle potential string case differences
  const role = userRole ? userRole.toLowerCase() : null;

  if (role === 'admin') {
    return <AdminPage />;
  } else if (role === 'doctor') {
    return <DoctorPage />;
  } else if (role === 'patient') {
    return <PatientPage />;
  } else {
    // Fallback if role is not recognized or user is not authenticated properly
    // This could redirect to login or show an error/generic dashboard
    console.warn('Authenticated user with unrecognized role:', userRole);
    // For now, let's redirect to login if role is unknown, or you can have a default authenticated page
    return <Navigate to="/login" replace />;
  }
}

function App() {
  const { isAuthenticated, userRole, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const token = getAuthTokenFromStorage();
    if (token && !isTokenExpired(token)) {
      try {
        const decodedToken = jwtDecode(token);
        const userDetails = getUserDetailsFromDecodedToken(decodedToken);
        if (userDetails) {
          setAuth(token, userDetails.userId, userDetails.userRole);
        }
      } catch (error) {
        console.error("Error decoding token on app load:", error);
        clearAuth();
      }
    } else if (token) {
      clearAuth();
    }
  }, [setAuth, clearAuth]);

  // A wrapper for protected routes
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    // If authenticated, render the children, which will be AuthenticatedRoutes
    return children;
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AuthenticatedRoutes />
          </ProtectedRoute>
        }
      />
      {/* Catch-all for any other undefined paths */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
