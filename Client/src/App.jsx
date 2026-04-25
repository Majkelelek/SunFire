import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Dodano useState
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
  const [authLoading, setAuthLoading] = useState(true); // Nowy stan ładowania

  useEffect(() => {
    // Sprawdzanie czy jesteś zalogowany
    fetch('http://localhost:5150/api/auth/check', { credentials: 'include' })
      .then(res => res.json())
      .then(authData => {
        if (authData.isAuthenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setAuthLoading(false)); // Kończymy ładowanie
  }, []);

  // Jeśli jeszcze sprawdzamy uprawnienia, nie renderujemy nic lub pokazujemy loader
  if (authLoading) return <div className="loading">Weryfikacja uprawnień...</div>;

  return (
    <Router>
      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <div className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutPage isAdmin={isAdmin} />} />
          
          {/* PRZEKAZUJEMY isAdmin DO PROTECTED ROUTE */}
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