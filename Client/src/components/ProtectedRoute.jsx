import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAdmin, children }) => {
    // Jeśli nie jesteś adminem, przekieruj do logowania
    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    // Jeśli jesteś adminem, pokaż zawartość (stronę Admin)
    return children;
};

export default ProtectedRoute;