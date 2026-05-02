import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from "react-colorful";
import { toast } from 'react-hot-toast';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({ primaryColor: '#ff4d00', backgroundColor: '#050505' });
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [bgFile, setBgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // State dla modala confirm
  const [modal, setModal] = useState({ isOpen: false, title: '', msg: '', onConfirm: null });

  const apiUrl = import.meta.env.VITE_API_URL || "";

  const showConfirm = (title, msg, onConfirm) => setModal({ isOpen: true, title, msg, onConfirm });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    fetch(`${apiUrl}/api/cms`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setConfig(data); });
  }, [apiUrl]);

  const handleColorChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (field === 'primaryColor') {
      document.documentElement.style.setProperty('--sunfire-accent', value);
    } else if (field === 'backgroundColor') {
      document.body.style.backgroundColor = value;
      document.body.style.backgroundImage = 'none';
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    const res = await fetch(`${apiUrl}/api/cms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(config)
    });

    if (res.ok) {
      toast.success("Zmiany zostały pomyślnie zapisane w bazie danych.");
    } else {
      toast.error("Twoja sesja wygasła. Zostaniesz przekierowany do logowania.");
      navigate('/login');
    }
    setLoading(false);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ Username: newUser.username, Password: newUser.password })
    });

    if (res.ok) {
      toast.success("Nowy administrator został pomyślnie zarejestrowany.");
      setNewUser({ username: '', password: '' });
    } else {
      toast.error("Nie masz uprawnień lub taki użytkownik już istnieje.");
    }
  };

  const handleUploadBg = async () => {
    if (!bgFile) {
        toast.error("Wybierz plik graficzny przed wysłaniem.");
        return;
    }
    
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
        toast.success("Nowe zdjęcie tła zostało ustawione.");
        document.body.style.backgroundImage = `url(${data.imageUrl})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        toast.error("Wystąpił problem podczas przesyłania zdjęcia.");
    }
    setUploading(false);
  };
    
  const handleRemoveBg = () => {
    showConfirm("USUWANIE TŁA", "Czy na pewno chcesz usunąć aktualne zdjęcie tła?", async () => {
      const res = await fetch(`${apiUrl}/api/cms/remove-bg`, {
          method: 'DELETE',
          credentials: 'include'
      });

      if (res.ok) {
          toast.success("Zdjęcie tła zostało usunięte.");
          document.body.style.backgroundImage = "none";
          document.body.style.backgroundColor = config.backgroundColor;
      } else {
          toast.error("Błąd podczas usuwania tła z serwera.");
      }
    });
  };

  return (
    <div className="admin-wrapper">
      <h1 className="admin-header">Sunfire CMS</h1>

      {/* MODAL SYSTEM (Tylko Potwierdzenia) */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#ff4444' }}>{modal.title}</h2>
            <p>{modal.msg}</p>
            <div className="modal-btns">
                <button className="btn-delete" onClick={() => { modal.onConfirm(); closeModal(); }}>POTWIERDŹ</button>
                <button className="btn-cancel" onClick={closeModal}>ANULUJ</button>
            </div>
          </div>
        </div>
      )}

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
            {loading ? 'ZAPISYWANIE...' : 'ZAPISZ ZMIANY W BAZIE'}
          </button>
        </div>

        <div className="upload-group" style={{ marginTop: '30px' }}>
          <input type="file" onChange={e => setBgFile(e.target.files[0])} accept="image/*" className="admin-input" />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={handleUploadBg} className="sunfire-btn" disabled={uploading}>
              {uploading ? "PRZESYŁANIE..." : "USTAW ZDJĘCIE W TLE"}
            </button>
            <button onClick={handleRemoveBg} className="delete-btn">USUŃ ZDJĘCIE</button>
          </div>
        </div>
      </div>

      <div className="admin-section" style={{ marginTop: '40px' }}>
        <h3>Zarządzanie Administracją</h3>
        <form onSubmit={handleAddAdmin} className="admin-form">
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