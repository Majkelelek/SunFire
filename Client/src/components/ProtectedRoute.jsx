import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAdmin, isAuthLoading } = useAuth();
    
    if (isAuthLoading) return null;


    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }


    return children;
};

export default ProtectedRoute;
