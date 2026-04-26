import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login({ setIsAdmin, checkAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attemptsInfo, setAttemptsInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAttemptsInfo(null);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Username: username, 
          Password: password 
        }),
        credentials: 'include'
      });

      // Sprawdzamy czy odpowiedź zawiera treść przed parsonowaniem JSON
      const data = res.headers.get('content-type')?.includes('application/json') 
                   ? await res.json() 
                   : null;

      if (res.ok) {
        // 1. Aktualizujemy stan w App.jsx
        if (setIsAdmin) setIsAdmin(true);
        
        // 2. Wymuszamy odświeżenie danych o sesji z serwera
        if (checkAuth) await checkAuth();

        // 3. Przekierowujemy do panelu (Navbar będzie już zaktualizowany)
        navigate('/admin');
      } else {
        // Obsługa błędów i wyświetlanie liczby pozostałych prób
        setError(data?.message || 'Niepoprawne dane logowania.');
        if (data?.remainingAttempts !== undefined) {
          setAttemptsInfo(data.remainingAttempts);
        }
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem.');
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
        
        {attemptsInfo !== null && attemptsInfo > 0 && (
          <p className="attempts-info" style={{ color: '#ff4d00', textAlign: 'center', fontSize: '0.85rem', marginBottom: '15px' }}>
            Pozostało prób: {attemptsInfo}
          </p>
        )}

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