import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeService } from '../services/homeService';
import ConfirmModal from '../components/modals/ConfirmModal';
import { HomeSkeleton } from '../components/Skeletons';
import { toast } from 'react-hot-toast';
import './Home.css';

export default function Home() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [tempData, setTempData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const result = await homeService.getHomeData();
      setData(result);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (type, index = null) => {
    const deepCopy = JSON.parse(JSON.stringify(data));
    setTempData(deepCopy);
    setEditingItem(index !== null ? { type, index } : type);
  };

  const handleSave = async (dataToSave = tempData) => {
    setIsSaving(true);
    try {
      await homeService.updateHomeData(dataToSave);
      setData(dataToSave);
      setEditingItem(null);
      setItemToDelete(null);
      toast.success("Zapisano pomyślnie");
    } catch (err) {
      toast.error("Błąd połączenia z serwerem.");
    } finally {
      setIsSaving(false);
    }
  };

  const addNewFocusItem = () => {
    const newItem = { title: "NOWA USŁUGA", description: "Opis...", size: "1-3" };
    const updatedData = { ...data, focusItems: [...(data.focusItems || []), newItem] };
    handleSave(updatedData);
  };

  const confirmDelete = () => {
    const newItems = data.focusItems.filter((_, i) => i !== itemToDelete);
    const updatedData = { ...data, focusItems: newItems };
    handleSave(updatedData);
  };

  if (loading) return <HomeSkeleton />;
  if (!data) return <div className="error-screen">DATABASE ERROR.</div>;

  return (
    <div className="home-container">
      <div className="home-bg-noise"></div>
      <div className="home-glow-main"></div>


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

      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="POTWIERDŹ USUNIĘCIE"
        message={data.focusItems && itemToDelete !== null ? `Czy na pewno chcesz usunąć: ${data.focusItems[itemToDelete]?.title}?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
        isSaving={isSaving}
        confirmText="USUŃ"
      />


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