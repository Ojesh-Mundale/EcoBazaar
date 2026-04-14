import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If a specific role is required and user doesn't have it, redirect to appropriate dashboard
  if (requiredRole && user.role !== requiredRole) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'seller':
        return <Navigate to="/seller" replace />;
      case 'customer':
        return <Navigate to="/customer" replace />;
      default:
        return <Navigate to="/auth" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;
