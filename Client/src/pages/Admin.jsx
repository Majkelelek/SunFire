import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from "react-colorful";

export default function Admin() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({ primaryColor: '#ff4d00', backgroundColor: '#050505' });
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [bgFile, setBgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [modal, setModal] = useState({ isOpen: false, title: '', msg: '', isConfirm: false, onConfirm: null });

  const apiUrl = import.meta.env.VITE_API_URL || "";

  const showInfo = (title, msg) => setModal({ isOpen: true, title, msg, isConfirm: false });
  const showConfirm = (title, msg, onConfirm) => setModal({ isOpen: true, title, msg, isConfirm: true, onConfirm });
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
      showInfo("ZAPISANO", "Zmiany zostały pomyślnie zapisane w bazie danych.");
    } else {
      showInfo("SESJA WYGASŁA", "Twoja sesja wygasła. Zostaniesz przekierowany do logowania.");
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
      showInfo("SUKCES", "Nowy administrator został pomyślnie zarejestrowany.");
      setNewUser({ username: '', password: '' });
    } else {
      showInfo("BŁĄD", "Nie masz uprawnień lub taki użytkownik już istnieje.");
    }
  };

  const handleUploadBg = async () => {
    if (!bgFile) return showInfo("BRAK PLIKU", "Wybierz plik graficzny przed wysłaniem.");
    
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
        showInfo("ZAKTUALIZOWANO", "Nowe zdjęcie tła zostało ustawione.");
        document.body.style.backgroundImage = `url(${data.imageUrl})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        showInfo("BŁĄD", "Wystąpił problem podczas przesyłania zdjęcia.");
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
          showInfo("USUNIĘTO", "Zdjęcie tła zostało usunięte.");
          document.body.style.backgroundImage = "none";
          document.body.style.backgroundColor = config.backgroundColor;
      } else {
          showInfo("BŁĄD", "Błąd podczas usuwania tła z serwera.");
      }
    });
  };

  const inputClasses = "w-full p-[15px_20px] bg-white/[0.03] border border-white/10 rounded-[12px] text-white font-sans text-[1rem] outline-none transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] box-border hover:bg-white/[0.05] hover:border-white/20 focus:bg-black/40 focus:border-sunfire focus:shadow-[0_0_20px_color-mix(in_srgb,var(--sunfire-accent),transparent_85%)] focus:-translate-y-[1px]";
  const fileInputClasses = `${inputClasses} cursor-pointer text-[0.9rem] file:bg-sunfire file:border-none file:rounded-[6px] file:p-[5px_15px] file:mr-[15px] file:text-black file:font-bold file:cursor-pointer file:transition file:duration-300 hover:file:bg-white`;
  const sunfireBtnClasses = "bg-transparent text-white border-2 border-sunfire p-[12px_20px] rounded-[8px] font-bold cursor-pointer transition duration-300 uppercase text-[0.9rem] hover:not(:disabled):opacity-90 hover:not(:disabled):-translate-y-[2px] disabled:bg-[#555] disabled:cursor-not-allowed disabled:opacity-70 disabled:border-transparent";
  const deleteBtnClasses = "bg-transparent text-[#ff4757] border border-[#ff4757] p-[12px_20px] rounded-[8px] font-bold cursor-pointer transition duration-300 uppercase text-[0.9rem] hover:bg-[#ff4757] hover:text-white";

  return (
    <div className="max-w-[1000px] mx-auto p-[40px_20px] text-white font-sans">
      <h1 className="text-[2.5rem] mb-[30px] text-center text-sunfire font-black uppercase">Sunfire CMS</h1>

      {/* MODAL SYSTEM */}
      {modal.isOpen && (
        <div className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-[10px] flex justify-center items-center z-[1000] animate-[fadeIn_0.3s_ease-out]" onClick={closeModal}>
          <div className="bg-[#0f0f0f] border border-sunfire p-[40px] rounded-[25px] w-[90%] max-w-[500px] text-center shadow-[0_0_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_80%)]" onClick={e => e.stopPropagation()}>
            <h2 className={`text-sunfire uppercase mb-[25px] text-[1.5rem] tracking-[2px] ${modal.isConfirm ? '!text-[#ff4444]' : ''}`}>{modal.title}</h2>
            <p className="text-white/70 mb-[30px] text-[1.1rem] leading-[1.5]">{modal.msg}</p>
            <div className="flex gap-[15px] mt-[20px]">
              {modal.isConfirm ? (
                <>
                  <button className="flex-1 p-[15px] border border-[#ff4444] font-black rounded-[10px] cursor-pointer uppercase transition duration-300 !bg-[#db0707] text-[#ff4444] hover:!bg-[#ff4444] hover:!text-white" onClick={() => { modal.onConfirm(); closeModal(); }}>POTWIERDŹ</button>
                  <button className="flex-1 p-[15px] border border-white/10 font-black rounded-[10px] cursor-pointer uppercase transition duration-300 bg-white/5 text-white hover:bg-white/10 hover:border-white/30" onClick={closeModal}>ANULUJ</button>
                </>
              ) : (
                <button className="flex-1 p-[15px] border-none font-black rounded-[10px] cursor-pointer uppercase transition duration-300 bg-sunfire text-black hover:bg-white" onClick={closeModal}>ZROZUMIAŁEM</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-[40px]">
        <h3 className="text-[1.2rem] uppercase tracking-[2px] text-sunfire mb-[25px]">Kolory Strony</h3>
        <div className="flex gap-[40px] flex-wrap mb-[20px]">
          
          <div className="flex-1 flex flex-col gap-[8px]">
            <label className="text-[0.9rem] text-[#ccc] block mb-[10px] font-bold">
              Akcent: <span style={{ color: config.primaryColor }}>{config.primaryColor}</span>
            </label>
            <HexColorPicker 
              color={config.primaryColor} 
              onChange={(newColor) => handleColorChange('primaryColor', newColor)} 
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-[8px]">
            <label className="text-[0.9rem] text-[#ccc] block mb-[10px] font-bold">
              Tło: <span style={{ color: config.backgroundColor }}>{config.backgroundColor}</span>
            </label>
            <HexColorPicker 
              color={config.backgroundColor} 
              onChange={(newColor) => handleColorChange('backgroundColor', newColor)} 
            />
          </div>
          
          <button onClick={handleSaveConfig} className={`${sunfireBtnClasses} w-full mt-[20px]`} disabled={loading}>
            {loading ? 'ZAPISYWANIE...' : 'ZAPISZ ZMIANY W BAZIE'}
          </button>
        </div>

        <div className="flex flex-col gap-[15px] mt-[30px]">
          <input type="file" onChange={e => setBgFile(e.target.files[0])} accept="image/*" className={fileInputClasses} />
          <div className="flex gap-[10px] mt-[10px]">
            <button onClick={handleUploadBg} className={`${sunfireBtnClasses} flex-1`} disabled={uploading}>
              {uploading ? "PRZESYŁANIE..." : "USTAW ZDJĘCIE W TLE"}
            </button>
            <button onClick={handleRemoveBg} className={`${deleteBtnClasses} flex-1`}>USUŃ ZDJĘCIE</button>
          </div>
        </div>
      </div>

      <div className="mt-[40px]">
        <h3 className="text-[1.2rem] uppercase tracking-[2px] text-sunfire mb-[25px]">Zarządzanie Administracją</h3>
        <form onSubmit={handleAddAdmin} className="flex flex-col gap-[20px] bg-white/[0.02] p-[30px] rounded-[20px] border border-white/5">
          <input className={inputClasses} type="text" placeholder="Nowy login" value={newUser.username}
                 onChange={e => setNewUser({...newUser, username: e.target.value})} required />
          <input className={inputClasses} type="password" placeholder="Hasło" value={newUser.password}
                 onChange={e => setNewUser({...newUser, password: e.target.value})} required />
          <button type="submit" className={sunfireBtnClasses}>DODAJ ADMINISTRATORA</button>
        </form>
      </div>
    </div>
  );
}