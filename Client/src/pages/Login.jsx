import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Zapobiega odświeżeniu strony
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
        credentials: 'include' // Kluczowe: pozwala przeglądarce przyjąć ciasteczko HttpOnly
      });

      if (res.ok) {
        navigate('/admin'); // Sukces! Idziemy do panelu
      } else {
        setError('Błędny login lub hasło.');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  // Stylizacja "na szybko", żeby grafik był zadowolony z wyglądu
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#050505',
      color: '#fff',
      fontFamily: 'sans-serif'
    },
    form: {
      backgroundColor: '#111',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 0 20px rgba(255, 77, 0, 0.2)',
      width: '300px',
      display: 'flex',
      flexDirection: 'column'
    },
    input: {
      padding: '12px',
      margin: '10px 0',
      borderRadius: '4px',
      border: '1px solid #333',
      backgroundColor: '#222',
      color: '#fff'
    },
    button: {
      padding: '12px',
      marginTop: '20px',
      backgroundColor: '#ff4d00',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: '0.3s'
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleLogin}>
        <h2 style={{ textAlign: 'center', color: '#ff4d00' }}>SUNFIRE</h2>
        
        {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
        
        <label>Login</label>
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
          style={styles.input}
          placeholder="admin"
          required
        />

        <label>Hasło</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          style={styles.input}
          placeholder="••••••••"
          required
        />

        <button 
          type="submit" 
          style={styles.button}
          disabled={loading}
        >
          {loading ? 'Logowanie...' : 'WEJDŹ DO PANELU'}
        </button>
      </form>
    </div>
  );
}