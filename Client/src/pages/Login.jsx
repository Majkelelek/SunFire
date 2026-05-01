import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setIsAdmin, checkAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attemptsInfo, setAttemptsInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";

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

      const data = res.headers.get('content-type')?.includes('application/json') 
                   ? await res.json() 
                   : null;

      if (res.ok) {
        if (setIsAdmin) setIsAdmin(true);
        if (checkAuth) await checkAuth();
        navigate('/admin');
      } else {
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
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center bg-[#050505] bg-[radial-gradient(circle_at_20%_30%,color-mix(in_srgb,var(--sunfire-accent),transparent_95%)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,color-mix(in_srgb,var(--sunfire-accent),transparent_95%)_0%,transparent_50%)] overflow-hidden relative font-sans">
      
      <form className="bg-[linear-gradient(160deg,color-mix(in_srgb,var(--sunfire-accent),black_92%)_0%,rgba(10,10,10,0.95)_50%,color-mix(in_srgb,#ff8c00,black_92%)_100%)] backdrop-blur-[25px] p-[40px_30px] md:p-[60px_100px] rounded-[30px] border border-[color-mix(in_srgb,var(--sunfire-accent),transparent_80%)] w-[90%] max-w-[750px] shadow-[0_40px_100px_rgba(0,0,0,0.8),-15px_-15px_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_80%),15px_15px_50px_color-mix(in_srgb,#ff8c00,transparent_80%)] z-[1] flex flex-col animate-[fadeInScale_0.6s_ease-out] overflow-visible" onSubmit={handleLogin}>
        <div className="text-center mb-[40px] relative">
          <h1 className="text-[2.5rem] md:text-[4rem] tracking-[8px] md:tracking-[15px] m-0 text-white font-black uppercase [text-shadow:0_0_35px_color-mix(in_srgb,var(--sunfire-accent),transparent_40%)]">SUN<span className="text-sunfire">FIRE</span></h1>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 border border-red-500/50 p-[15px] rounded-[10px] text-center font-bold mb-[20px]">{error}</div>}
        
        {attemptsInfo !== null && attemptsInfo > 0 && (
          <p className="text-sunfire text-center text-[0.85rem] mb-[15px]">
            Pozostało prób: {attemptsInfo}
          </p>
        )}

        <div className="flex flex-col mb-[20px]">
          <label className="text-sunfire text-[0.8rem] font-extrabold uppercase mb-[12px]">Login</label>
          <input 
            className="w-full p-[18px] bg-[#1a1a1a] border border-[#222] text-white rounded-[12px] focus:outline-none focus:border-sunfire focus:shadow-[0_0_20px_color-mix(in_srgb,var(--sunfire-accent),transparent_85%)] transition duration-300 box-border"
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="username"
            required
          />
        </div>

        <div className="flex flex-col mb-[25px]">
          <label className="text-sunfire text-[0.8rem] font-extrabold uppercase mb-[12px]">Hasło</label>
          <input 
            className="w-full p-[18px] bg-[#1a1a1a] border border-[#222] text-white rounded-[12px] focus:outline-none focus:border-sunfire focus:shadow-[0_0_20px_color-mix(in_srgb,var(--sunfire-accent),transparent_85%)] transition duration-300 box-border"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
            required
          />
        </div>

        <button className="relative bg-[linear-gradient(90deg,var(--sunfire-accent,#6a11cb),#ff8c00)] text-white border-none p-[22px] rounded-[15px] font-black text-[1.2rem] cursor-pointer tracking-[3px] transition-all duration-300 mt-[20px] uppercase z-[1] hover:not(:disabled):-translate-y-[4px] before:absolute before:inset-x-[10px] before:top-[10px] before:-bottom-[15px] before:bg-[linear-gradient(90deg,var(--sunfire-accent,#6a11cb),#ff8c00)] before:blur-[25px] before:opacity-60 before:-z-10 before:rounded-[15px] before:transition-all before:duration-300 hover:before:opacity-80 hover:before:blur-[35px] hover:before:-bottom-[25px]" type="submit" disabled={loading}>
          {loading ? <span className="w-[18px] h-[18px] border-[3px] border-white/30 border-t-white rounded-full animate-spin inline-block"></span> : 'ZALOGUJ'}
        </button>

        <Link to="/" className="text-center mt-[40px] text-white/40 no-underline text-[0.9rem] transition duration-300 tracking-[1px] hover:text-sunfire hover:[text-shadow:0_0_10px_var(--sunfire-accent)]">Wróć do strony głównej</Link>
      </form>
    </div>
  );
}