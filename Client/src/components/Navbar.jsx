import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAdmin, setIsAdmin }) => { //
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await fetch('http://localhost:5150/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    if (res.ok) {
      setIsAdmin(false);
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">SUNFIRE</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">START</Link></li>
        <li><Link to="/portfolio">PORTFOLIO</Link></li>
        <li><Link to="/contact">ZATRUDNIJ MNIE</Link></li>
        {/* Przycisk wylogowania jako element listy li */}
        {isAdmin && (
          <li>
            <button className="logout-btn" onClick={handleLogout}>
              WYLOGUJ
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;