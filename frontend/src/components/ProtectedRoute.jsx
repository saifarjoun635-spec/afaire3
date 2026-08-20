import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-gold font-heading">
        Chargement...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const home = user.role === 'admin' ? '/admin' : user.role === 'employee' ? '/employe' : '/portail';
    return <Navigate to={home} replace />;
  }
  return children;
};

export default ProtectedRoute;
