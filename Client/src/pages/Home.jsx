import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home({ isAdmin }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // Stany edycji i modali
  const [editingItem, setEditingItem] = useState(null); // 'hero' lub {type: 'focus', index}
  const [itemToDelete, setItemToDelete] = useState(null); // index elementu
  const [tempData, setTempData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/home`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Błąd ładowania strony głównej:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNKCJE POMOCNICZE ---

  const openEdit = (type, index = null) => {
    // Głęboka kopia zapobiega "podglądowi" zmian przed zapisem
    const deepCopy = JSON.parse(JSON.stringify(data));
    setTempData(deepCopy);
    setEditingItem(index !== null ? { type, index } : type);
  };

  const handleSave = async (dataToSave = tempData) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/home`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
        credentials: 'include'
      });
      if (res.ok) {
        setData(dataToSave);
        setEditingItem(null);
        setItemToDelete(null);
      }
    } catch (err) {
      alert("Błąd połączenia z serwerem.");
    } finally {
      setIsSaving(false);
    }
  };

  const addNewFocusItem = () => {
    const newItem = { title: "NOWA USŁUGA", description: "Opis...", size: "1-3" };
    const updatedData = { ...data, focusItems: [...(data.focusItems || []), newItem] };
    handleSave(updatedData); // Automatyczny zapis po dodaniu[cite: 4]
  };

  const confirmDelete = () => {
    const newItems = data.focusItems.filter((_, i) => i !== itemToDelete);
    const updatedData = { ...data, focusItems: newItems };
    handleSave(updatedData);
  };

  if (loading) return <div className="loading">INITIALIZING SUNFIRE...</div>;
  if (!data) return <div className="error-screen">DATABASE ERROR.</div>;

  return (
    <div className="home-container">
      <div className="home-bg-noise"></div>
      <div className="home-glow-main"></div>

      {/* --- SEKCJA HERO --- */}
      <section className="hero">
        <div className="hero-content">
          <div className="editable-wrapper">
            <p className="hero-tagline">{data.tagline}</p>
            <h1 className="hero-title">{data.titleStart}<span>{data.titleAccent}</span></h1>
            <p className="hero-motto">{data.motto}</p>
            {isAdmin && (
              <button className="admin-main-edit" onClick={() => openEdit('hero')}>✎ EDYTUJ</button>
            )}
          </div>
          <div className="hero-btns">
            <Link to="/portfolio" className="btn-primary">ZOBACZ PRACE</Link>
            <Link to="/contact" className="btn-secondary">POROZMAWIAJMY</Link>
          </div>
        </div>
      </section>

      {/* --- SEKCJA FOCUS (SIATKA) --- */}
      <section className="design-focus">
        {data.focusItems && data.focusItems.map((item, index) => (
          <div key={index} className={`focus-item size-${item.size || '1-3'}`}>
            <span className="focus-num">0{index + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {isAdmin && (
              <div className="admin-actions-small">
                  <button className="del-dot" onClick={() => setItemToDelete(index)}>
                      ×
                  </button>
                  <button className="edit-dot" onClick={() => openEdit('focus', index)}>
                      ✎
                  </button>
              </div>
            )}
          </div>
        ))}
        {isAdmin && (
          <button className="add-focus-item-card" onClick={addNewFocusItem}>
            <span>+ DODAJ SEKCJĘ</span>
          </button>
        )}
      </section>

      {/* --- MODAL USUWANIA --- */}
      {itemToDelete !== null && (
        <div className="modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="danger-text">POTWIERDŹ USUNIĘCIE</h2>
            <p className="modal-desc">Czy na pewno chcesz usunąć: <strong>{data.focusItems[itemToDelete]?.title}</strong>?</p>
            <div className="modal-btns">
              <button className="btn-delete" onClick={confirmDelete} disabled={isSaving}>USUŃ</button>
              <button className="btn-cancel" onClick={() => setItemToDelete(null)}>ANULUJ</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDYCJI --- */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingItem === 'hero' ? "EDYTUJ HERO" : "EDYTUJ CECHĘ"}</h2>
            
            {editingItem === 'hero' ? (
              <div className="modal-fields">
                <label>TAGLINE</label>
                <input value={tempData.tagline} onChange={e => setTempData({...tempData, tagline: e.target.value})} />
                <label>TYTUŁ (GŁÓWNY)</label>
                <input value={tempData.titleStart} onChange={e => setTempData({...tempData, titleStart: e.target.value})} />
                <label>TYTUŁ (AKCENT)</label>
                <input value={tempData.titleAccent} onChange={e => setTempData({...tempData, titleAccent: e.target.value})} />
                <label>MOTTO</label>
                <textarea value={tempData.motto} onChange={e => setTempData({...tempData, motto: e.target.value})} />
              </div>
            ) : (
              <div className="modal-fields">
                <label>TYTUŁ CECHY</label>
                <input value={tempData.focusItems[editingItem.index].title} 
                       onChange={e => {
                         const items = [...tempData.focusItems];
                         items[editingItem.index].title = e.target.value;
                         setTempData({...tempData, focusItems: items});
                       }} />
                
                <label>SZEROKOŚĆ (GRID)</label>
                <div className="size-btns">
                  {['1-3', '2-3', '3-3'].map(s => (
                    <button 
                      key={s}
                      className={tempData.focusItems[editingItem.index].size === s ? 'active' : ''} 
                      onClick={() => {
                        const items = [...tempData.focusItems];
                        items[editingItem.index].size = s;
                        setTempData({...tempData, focusItems: items});
                      }}
                    >
                      {s === '1-3' ? '1/3' : s === '2-3' ? '2/3' : '3/3'}
                    </button>
                  ))}
                </div>

                <label>OPIS</label>
                <textarea value={tempData.focusItems[editingItem.index].description} 
                          onChange={e => {
                            const items = [...tempData.focusItems];
                            items[editingItem.index].description = e.target.value;
                            setTempData({...tempData, focusItems: items});
                          }} />
              </div>
            )}
            <div className="modal-btns">
              <button className="btn-save" onClick={() => handleSave()} disabled={isSaving}>ZAPISZ</button>
              <button className="btn-cancel" onClick={() => setEditingItem(null)}>ANULUJ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}