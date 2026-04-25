import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuth, setIsAuth] = useState(null);

    useEffect(() => {
        // Sprawdzamy status na backendzie
        fetch('http://localhost:5150/api/auth/check', { credentials: 'include' })
            .then(res => {
                if (res.ok) setIsAuth(true);
                else setIsAuth(false);
            })
            .catch(() => setIsAuth(false));
    }, []);

    if (isAuth === null) return <div>Sprawdzanie uprawnień...</div>;

    // Jeśli nie jest zalogowany, wyrzuć go na stronę logowania
    return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;