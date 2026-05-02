import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [attemptsInfo, setAttemptsInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    setAttemptsInfo(null);

    try {
      await login(data.username, data.password);
      toast.success('Zalogowano pomyślnie!');
      navigate('/admin');
    } catch (err) {
      const errorData = err.data;
      const errorMessage = errorData?.message || 'Niepoprawne dane logowania.';
      toast.error(errorMessage);
      
      if (errorData?.remainingAttempts !== undefined) {
        setAttemptsInfo(errorData.remainingAttempts);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-glow"></div>
      
      <form className="login-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="login-header">
          <h1>SUN<span>FIRE</span></h1>
        </div>

        {attemptsInfo !== null && attemptsInfo > 0 && (
          <p className="attempts-info" style={{ color: 'var(--sunfire-accent, #ff4d00)', textAlign: 'center', fontSize: '0.85rem', marginBottom: '15px' }}>
            Pozostało prób: {attemptsInfo}
          </p>
        )}

        <div className="login-input-group">
          <label>Login</label>
          <input 
            type="text" 
            placeholder="username"
            {...register("username", { required: "Podaj login" })}
          />
          {errors.username && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px' }}>{errors.username.message}</span>}
        </div>

        <div className="login-input-group">
          <label>Hasło</label>
          <input 
            type="password" 
            placeholder="••••••••"
            {...register("password", { required: "Podaj hasło" })}
          />
          {errors.password && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px' }}>{errors.password.message}</span>}
        </div>

        <button className="login-submit-btn" type="submit" disabled={loading}>
          {loading ? <span className="loader"></span> : 'ZALOGUJ'}
        </button>

        <Link to="/" className="login-back-link">Wróć do strony głównej</Link>
      </form>
    </div>
  );
}