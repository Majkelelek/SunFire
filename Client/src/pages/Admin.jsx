import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from "react-colorful"; // Biblioteka do przesuwania kolorów
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({ primaryColor: '#ff4d00', backgroundColor: '#050505' });
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [bgFile, setBgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // Pobierz aktualne kolory przy wejściu do panelu
  useEffect(() => {
    fetch(`${apiUrl}/api/cms`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setConfig(data); });
  }, [apiUrl]);

  // Funkcja obsługująca przesuwanie koloru i podgląd na żywo
  const handleColorChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    
    // Zastosowanie zmian natychmiastowo na stronie
    if (field === 'primaryColor') {
      document.documentElement.style.setProperty('--sunfire-accent', value);
    } else if (field === 'backgroundColor') {
      document.body.style.backgroundColor = value;
      document.body.style.backgroundImage = 'none'; // Ukrywamy zdjęcie, żeby widzieć kolor
    }
  };

  // Zapisz kolory do bazy MongoDB
  const handleSaveConfig = async () => {
    setLoading(true);
    const res = await fetch(`${apiUrl}/api/cms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(config)
    });

    if (res.ok) {
      alert("Zmiany zapisane w MongoDB!");
    } else {
      alert("Błąd 401: Twoja sesja wygasła. Zaloguj się ponownie.");
      navigate('/login');
    }
    setLoading(false);
  };

  // Rejestracja nowego administratora
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiUrl}/api/auth/register`, {
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

  // Przesyłanie zdjęcia tła do Cloudinary
  const handleUploadBg = async () => {
    if (!bgFile) return alert("Wybierz plik!");
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', bgFile);

    const res = await fetch(`${apiUrl}/api/cms/upload-bg`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    if (res.ok) {
        const data = await res.json();
        alert("Zdjęcie tła zaktualizowane!");
        document.body.style.backgroundImage = `url(${data.imageUrl})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        alert("Błąd przesyłania zdjęcia.");
    }
    setUploading(false);
  };
    
  // Usuwanie zdjęcia tła
  const handleRemoveBg = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć zdjęcie z tła?")) return;

    const res = await fetch(`${apiUrl}/api/cms/remove-bg`, {
        method: 'DELETE',
        credentials: 'include'
    });

    if (res.ok) {
        alert("Zdjęcie usunięte!");
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = config.backgroundColor;
    } else {
        alert("Błąd podczas usuwania tła.");
    }
  };

  return (
    <div className="admin-wrapper">
      <h1 className="admin-header">Sunfire CMS</h1>

      <div className="admin-section">
        <h3>Kolory Strony</h3>
        <div className="color-inputs" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '20px' }}>
          
          <div className="color-field">
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Akcent: <span style={{ color: config.primaryColor }}>{config.primaryColor}</span>
            </label>
            <HexColorPicker 
              color={config.primaryColor} 
              onChange={(newColor) => handleColorChange('primaryColor', newColor)} 
            />
          </div>
          
          <div className="color-field">
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Tło: <span style={{ color: config.primaryColor }}>{config.backgroundColor}</span>
            </label>
            <HexColorPicker 
              color={config.backgroundColor} 
              onChange={(newColor) => handleColorChange('backgroundColor', newColor)} 
            />
          </div>
          <button onClick={handleSaveConfig} className="sunfire-btn" style={{ marginTop: '20px', width: '100%' }} disabled={loading}>
          {loading ? 'Zapisywanie...' : 'ZAPISZ ZMIANY W BAZIE'}
        </button>
          
        </div>

        <div className="upload-group" style={{ marginTop: '30px' }}>
          <input type="file" onChange={e => setBgFile(e.target.files[0])} accept="image/*" className="admin-input" />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={handleUploadBg} className="sunfire-btn" disabled={uploading}>
              {uploading ? "Przesyłanie..." : "USTAW ZDJĘCIE W TLE"}
            </button>
            <button onClick={handleRemoveBg} className="delete-btn">USUŃ ZDJĘCIE</button>
          </div>
        </div>

        <button onClick={handleSaveConfig} className="sunfire-btn" style={{ marginTop: '20px', width: '100%' }} disabled={loading}>
          {loading ? 'Zapisywanie...' : 'ZAPISZ ZMIANY W BAZIE'}
        </button>
      </div>

      <div className="admin-section">
        <h3>Zarządzanie Administracją</h3>
        <form onSubmit={handleAddAdmin}>
          <input className="admin-input" type="text" placeholder="Nowy login" value={newUser.username}
                 onChange={e => setNewUser({...newUser, username: e.target.value})} required />
          <input className="admin-input" type="password" placeholder="Hasło" value={newUser.password}
                 onChange={e => setNewUser({...newUser, password: e.target.value})} required />
          <button type="submit" className="sunfire-btn">DODAJ ADMINISTRATORA</button>
        </form>
      </div>
    </div>
  );
}