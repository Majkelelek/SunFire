import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login({ setIsAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5150/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Username: username, 
          Password: password 
        }),
        credentials: 'include'
      });

      if (res.ok) {
        if (setIsAdmin) setIsAdmin(true); // Aktualizujemy stan w App.jsx
        navigate('/admin');
      } else {
        setError('Nieuprawniony dostęp.');
      }
    } catch (err) {
      setError('Błąd połączenia z bazą.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-glow"></div>
      
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-header">
          <h1>SUN<span>FIRE</span></h1>
        </div>

        {error && <div className="login-error-badge">{error}</div>}

        <div className="login-input-group">
          <label>Login</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="username"
            required
          />
        </div>

        <div className="login-input-group">
          <label>Hasło</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
            required
          />
        </div>

        <button className="login-submit-btn" type="submit" disabled={loading}>
          {loading ? <span className="loader"></span> : 'ZALOGUJ'}
        </button>

        <Link to="/" className="login-back-link">Wróć do strony głównej</Link>
      </form>
    </div>
  );
}