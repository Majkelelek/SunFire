import React, { useEffect, useState } from 'react';
import './PortfolioPage.css';

const PortfolioPage = () => {
    // --- STANY ---
    const [projects, setProjects] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Stan powiększenia (Lightbox)
    const [expandedProject, setExpandedProject] = useState(null);
    
    // Obsługa Modala Admina
    const [editingSlot, setEditingSlot] = useState(null);
    const [modalStep, setModalStep] = useState('choose');
    
    // Dane dla nowego elementu
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null);
    const [uploading, setUploading] = useState(false);

    // 1. Pobieranie danych
    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5150/api/projects');
            const data = await res.json();
            setProjects(data);

            const resAuth = await fetch('http://localhost:5150/api/auth/check', { credentials: 'include' });
            if (resAuth.ok) setIsAdmin(true);
        } catch (err) {
            console.error("Błąd ładowania:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Bezpieczna logika dynamicznej liczby slotów
    const getSlotsCount = () => {
        const slotNumbers = projects
            .map(p => parseInt(p.slotNumber, 10))
            .filter(n => !isNaN(n));

        const maxSlot = slotNumbers.length > 0 ? Math.max(...slotNumbers) : -1;

        let count = 8; 
        if (isAdmin) {
            count = Math.max(8, (Math.floor(maxSlot / 4) + 2) * 4);
        } else {
            count = (Math.floor(maxSlot / 4) + 1) * 4;
        }
        return isNaN(count) || count < 0 ? 8 : count;
    };

    const slotsCount = getSlotsCount();

    // 3. Dodawanie TEKSTU
    const handleAddText = async () => {
        if (!textInput.trim()) return alert("Wpisz tekst!");
        setUploading(true);
        const newProject = {
            type: 'text',
            content: textInput,
            slotNumber: parseInt(editingSlot, 10),
            title: "Notatka"
        };

        const res = await fetch('http://localhost:5150/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject),
            credentials: 'include'
        });

        if (res.ok) {
            resetModal();
            fetchData();
        } else {
            setUploading(false);
            alert("Błąd zapisu tekstu");
        }
    };

    // 4. Dodawanie OBRAZKA
    const handleAddImage = async () => {
        if (!fileInput) return alert("Wybierz plik!");
        setUploading(true);

        const formData = new FormData();
        formData.append('file', fileInput);

        try {
            const uploadRes = await fetch('http://localhost:5150/api/cms/upload-image', { 
                method: 'POST', body: formData, credentials: 'include' 
            });
            const { url } = await uploadRes.json();

            const newProject = {
                type: 'image',
                imageUrl: url,
                slotNumber: parseInt(editingSlot, 10),
                title: "Obraz"
            };

            const res = await fetch('http://localhost:5150/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject),
                credentials: 'include'
            });

            if (res.ok) {
                resetModal();
                fetchData();
            }
        } catch (err) {
            alert("Błąd wysyłania obrazu");
        } finally {
            setUploading(false);
        }
    };

    // 5. Usuwanie projektu
    const handleDelete = async (id) => {
        if (!window.confirm("Usunąć ten element?")) return;
        await fetch(`http://localhost:5150/api/projects/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchData();
    };

    const resetModal = () => {
        setEditingSlot(null);
        setModalStep('choose');
        setTextInput('');
        setFileInput(null);
        setUploading(false);
    };

    if (loading) return <div className="loading">Wczytywanie...</div>;

    return (
        <div className="portfolio-container">
            <header className="portfolio-header">
                <h1>Portfolio</h1>
                {isAdmin && <p className="admin-badge">Tryb Edycji Aktywny</p>}
            </header>

            <div className="slots-grid">
                {[...Array(slotsCount)].map((_, index) => {
                    const project = projects.find(p => parseInt(p.slotNumber, 10) === index);

                    if (!isAdmin && !project) return null;


                        return (
                          <div 
                              key={index} 
                              className={`slot ${!project ? 'empty' : 'filled'}`}
                              onClick={() => {
                                  // Bezpieczne sprawdzanie typu (obsługuje type i Type)
                                  const pType = project?.type || project?.Type;
                                  if (project && pType === 'image') {
                                      setExpandedProject(project); 
                                  } else if (isAdmin && !project) {
                                      setEditingSlot(index); 
                                  }
                              }}
                              style={{ cursor: (project?.type || project?.Type) === 'text' ? 'default' : 'pointer' }}
                          >
                              {project ? (
                                  <div className="project-content">
                                      {/* Sprawdzamy type/Type oraz content/Content */}
                                      {(project.type === 'text' || project.Type === 'text') ? (
                                          <div className="text-box">
                                              {project.content || project.Content || "Brak treści"}
                                          </div>
                                      ) : (
                                          <img src={project.imageUrl || project.ImageUrl} alt="Projekt" />
                                      )}
                                      
                                      {isAdmin && (
                                          <button className="delete-slot-btn" onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(project.id || project.Id);
                                          }}>×</button>
                                      )}
                                  </div>
                            ) : (
                                isAdmin && (
                                    <div className="target-icon">
                                        <div className="plus">+</div>
                                        <div className="corner tl"></div>
                                        <div className="corner tr"></div>
                                        <div className="corner bl"></div>
                                        <div className="corner br"></div>
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- POWIĘKSZENIE (LIGHTBOX) --- */}
            {expandedProject && (
                <div className="lightbox-overlay" onClick={() => setExpandedProject(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setExpandedProject(null)}>×</button>
                        {expandedProject.type === 'text' ? (
                            <div className="expanded-text">{expandedProject.content}</div>
                        ) : (
                            <img src={expandedProject.imageUrl} alt="Powiększony projekt" />
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL DODAWANIA (ADMIN) --- */}
            {editingSlot !== null && (
                <div className="modal-overlay" onClick={resetModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Dodaj do Slotu #{editingSlot + 1}</h2>
                        {modalStep === 'choose' && (
                            <div className="modal-options">
                                <button onClick={() => setModalStep('image')}>🖼️ Dodaj Obraz</button>
                                <button onClick={() => setModalStep('text')}>✍️ Dodaj Tekst</button>
                            </div>
                        )}
                        {modalStep === 'text' && (
                            <div className="modal-form">
                                <textarea 
                                    placeholder="Wpisz treść..." 
                                    value={textInput} 
                                    onChange={e => setTextInput(e.target.value)}
                                />
                                <button onClick={handleAddText} disabled={uploading}>
                                    {uploading ? "Zapisywanie..." : "Zapisz Tekst"}
                                </button>
                            </div>
                        )}
                        {modalStep === 'image' && (
                            <div className="modal-form">
                                <input type="file" onChange={e => setFileInput(e.target.files[0])} />
                                <button onClick={handleAddImage} disabled={uploading}>
                                    {uploading ? "Wysyłanie..." : "Wyślij Obraz"}
                                </button>
                            </div>
                        )}
                        <button className="modal-cancel" onClick={resetModal}>Anuluj</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;