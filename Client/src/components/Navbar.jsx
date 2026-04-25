import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">SUNFIRE</Link>
      <ul className="nav-links">
        <li><Link to="/">Start</Link></li>
        <li><Link to="/portfolio">Portfolio</Link></li>
        <li><Link to="/contact" className="nav-cta">Zatrudnij mnie</Link></li>
      </ul>
    </nav>
  );
}