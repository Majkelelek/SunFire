import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAdmin, isAuthLoading } = useAuth();
    
    if (isAuthLoading) return null; // Or a loader

    // Jeśli nie jesteś adminem, przekieruj do logowania
    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    // Jeśli jesteś adminem, pokaż zawartość (stronę Admin)
    return children;
};

export default ProtectedRoute;