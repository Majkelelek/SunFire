import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ isAdmin, setIsAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      setIsAdmin(false);
      navigate('/');
    } catch (err) {
      console.error("Błąd wylogowania", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          SUN<span>FIRE</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Start
          </Link>
          <Link to="/portfolio" className={location.pathname === '/portfolio' ? 'active' : ''}>
            Portfolio
          </Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
            O mnie
          </Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
            Kontakt
          </Link>
          
          {isAdmin && (
            <Link to="/admin" className={`nav-admin-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              Panel Admina
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {isAdmin ? (
            <button onClick={handleLogout} className="logout-btn">
              WYLOGUJ
            </button>
          ) : (
            <Link to="/login" className="login-link">ZALOGUJ</Link>
          )}
        </div>
      </div>
      <div className="nav-bottom-glow"></div>
    </nav>
  );
}