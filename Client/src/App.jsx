import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import Admin from './pages/Admin';
import Login from './pages/Login';
import PortfolioPage from './pages/PortfolioPage';
import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Funkcja sprawdzająca autoryzację, którą przekażemy do komponentu Login
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/check`, { credentials: 'include' });
      const authData = await res.json();
      setIsAdmin(authData.isAuthenticated);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  }, [apiUrl]);

  // Sprawdzanie uprawnień przy starcie aplikacji
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authLoading) return <div className="loading">Weryfikacja uprawnień...</div>;

  return (
    <Router>
      {/* Navbar automatycznie pokaże linki admina, gdy isAdmin zmieni się na true */}
      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <div className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Przekazujemy funkcje do komponentu Login */}
          <Route 
            path="/login" 
            element={<Login setIsAdmin={setIsAdmin} checkAuth={checkAuth} />} 
          />
          
          <Route path="/about" element={<AboutPage isAdmin={isAdmin} />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute isAdmin={isAdmin}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/portfolio" element={<PortfolioPage isAdmin={isAdmin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;