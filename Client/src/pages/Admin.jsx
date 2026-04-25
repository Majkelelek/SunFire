import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({ primaryColor: '#ff4d00', backgroundColor: '#050505' });
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [bgFile, setBgFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Pobierz aktualne kolory przy wejściu do panelu
  useEffect(() => {
    fetch('http://localhost:5150/api/cms', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setConfig(data); });
  }, []);

  // Zapisz kolory (Tło i Akcent)
  const handleSaveConfig = async () => {
    console.log("Wysyłam do bazy:", config);
    setLoading(true);
    const res = await fetch('http://localhost:5150/api/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(config)
    });

    if (res.ok) {
      alert("Zmiany zapisane w MongoDB!");
      
      // 1. To zmienia tło (już masz)
      document.body.style.backgroundColor = config.backgroundColor;
      
      // 2. DODAJ TO: To zmienia kolor akcentu w CSS na żywo
      document.documentElement.style.setProperty('--sunfire-accent', config.primaryColor);
      
    } else {
      alert("Błąd 401: Twoja sesja wygasła. Zaloguj się ponownie.");
      navigate('/login');
    }
    setLoading(false);
  };

  // Rejestracja nowego admina
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5150/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ Username: newUser.username, Password: newUser.password })
    });

    if (res.ok) {
      alert("Dodano nowego administratora!");
      setNewUser({ username: '', password: '' });
    } else {
      alert("Błąd: Nie masz uprawnień lub użytkownik już istnieje.");
    }
  };

  const logout = () => {
    document.cookie = "sunfire_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate('/login');
  };

  const handleUploadBg = async () => {
    if (!bgFile) return alert("Wybierz plik!");
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', bgFile);

    const res = await fetch('http://localhost:5150/api/cms/upload-bg', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    if (res.ok) {
        const data = await res.json();
        alert("Zdjęcie tła zaktualizowane!");
        // Zastosuj tło natychmiast
        document.body.style.backgroundImage = `url(${data.imageUrl})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        alert("Błąd przesyłania zdjęcia.");
    }
    setUploading(false);
    };
    
    const handleRemoveBg = async () => {
        if (!window.confirm("Czy na pewno chcesz usunąć zdjęcie z tła?")) return;

        const res = await fetch('http://localhost:5150/api/cms/remove-bg', {
            method: 'DELETE',
            credentials: 'include'
        });

        if (res.ok) {
            alert("Zdjęcie usunięte!");
            // Usuwamy tło z podglądu na żywo
            document.body.style.backgroundImage = "none";
            // Opcjonalnie przywracamy kolor tła z configu
            document.body.style.backgroundColor = config.backgroundColor;
        } else {
            alert("Błąd podczas usuwania tła.");
        }
        };



  return (
    <div className="admin-wrapper">
      <button onClick={logout} className="logout-btn">WYLOGUJ</button>
      <h1 className="admin-header">Sunfire CMS</h1>

      <div className="admin-section">
        <h3>Kolory Strony</h3>
        <div className="color-inputs">
          <div className="color-field">
            <label>Główny Akcent</label>
            <input type="color" value={config.primaryColor} 
                   onChange={e => setConfig({...config, primaryColor: e.target.value})} />
          </div>
          <div className="color-field">
            <label>Kolor Tła</label>
            <input type="color" value={config.backgroundColor} 
                   onChange={e => setConfig({...config, backgroundColor: e.target.value})} />
          </div>
        </div>
        <div className="upload-group">
    <input type="file" onChange={e => setBgFile(e.target.files[0])} accept="image/*" className="admin-input" />
    <button onClick={handleUploadBg} className="sunfire-btn" disabled={uploading}>
      {uploading ? "Przesyłanie..." : "USTAW ZDJĘCIE W TLE"}
    </button>
    <button onClick={handleRemoveBg} className="delete-btn">USUŃ ZDJĘCIE</button>
  </div>
        <button onClick={handleSaveConfig} className="sunfire-btn" disabled={loading}>
          {loading ? 'Zapisywanie...' : 'ZAPISZ KOLORY'}
        </button>
      </div>
      <div className="admin-section">
        <h3>Dodaj nowego Admina</h3>
        <form onSubmit={handleAddAdmin}>
          <input className="admin-input" type="text" placeholder="Login" value={newUser.username}
                 onChange={e => setNewUser({...newUser, username: e.target.value})} required />
          <input className="admin-input" type="password" placeholder="Hasło" value={newUser.password}
                 onChange={e => setNewUser({...newUser, password: e.target.value})} required />
          <button type="submit" className="sunfire-btn">STWÓRZ KONTO</button>
        </form>
      </div>
    </div>
  );
}