import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      navigate('/');
    } catch {
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          SUN<span>FIRE</span>
        </Link>


        <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>


        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
              Start
            </Link>
            <Link to="/portfolio" className={location.pathname === '/portfolio' ? 'active' : ''} onClick={closeMenu}>
              Portfolio
            </Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMenu}>
              O mnie
            </Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={closeMenu}>
              Kontakt
            </Link>
            
            {isAdmin && (
              <Link to="/admin" className={`nav-admin-link ${location.pathname === '/admin' ? 'active' : ''}`} onClick={closeMenu}>
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
              <Link to="/login" className="login-link" onClick={closeMenu}>ZALOGUJ</Link>
            )}
          </div>
        </div>
      </div>
      <div className="nav-bottom-glow"></div>
    </nav>
  );
}