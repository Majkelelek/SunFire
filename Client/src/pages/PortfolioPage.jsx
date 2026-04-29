import React, { useEffect, useState } from 'react';
import './PortfolioPage.css';

const PortfolioPage = ({ isAdmin }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL || "";
    
    // Stany dla modali
    const [expandedProject, setExpandedProject] = useState(null);
    const [editingSlot, setEditingSlot] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null); // NOWE: do modala usuwania
    
    const [modalStep, setModalStep] = useState('choose');
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/projects`);
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error("Błąd ładowania projektów");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        return count;
    };

    const slotsCount = getSlotsCount();

    // --- LOGIKA DODAWANIA ---
    const handleAddText = async () => {
        if (!textInput.trim()) return;
        setUploading(true);
        const newProject = {
            type: 'text',
            content: textInput,
            slotNumber: parseInt(editingSlot, 10),
            title: "Notatka"
        };
        const res = await fetch(`${apiUrl}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject),
            credentials: 'include'
        });
        if (res.ok) { resetModal(); fetchData(); }
        else { setUploading(false); }
    };

    const handleAddImage = async () => {
        if (!fileInput) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileInput);
        try {
            const uploadRes = await fetch(`${apiUrl}/api/cms/upload-image`, { 
                method: 'POST', body: formData, credentials: 'include' 
            });
            const { url } = await uploadRes.json();
            const newProject = {
                type: 'image',
                imageUrl: url,
                slotNumber: parseInt(editingSlot, 10),
                title: "Obraz"
            };
            await fetch(`${apiUrl}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject),
                credentials: 'include'
            });
            resetModal(); fetchData();
        } catch (err) { console.error("Błąd uploadu"); }
        finally { setUploading(false); }
    };

    // --- NOWA LOGIKA USUWANIA ---
    const confirmDelete = async () => {
        if (!projectToDelete) return;
        setUploading(true);
        try {
            await fetch(`${apiUrl}/api/projects/${projectToDelete}`, { 
                method: 'DELETE', 
                credentials: 'include' 
            });
            setProjectToDelete(null);
            fetchData();
        } catch (err) {
            console.error("Błąd usuwania");
        } finally {
            setUploading(false);
        }
    };

    const resetModal = () => {
        setEditingSlot(null); 
        setModalStep('choose'); 
        setTextInput(''); 
        setFileInput(null); 
        setUploading(false);
    };

    if (loading) return <div className="loading"></div>;

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
                                if (project && (project.type === 'image' || project.Type === 'image')) {
                                    setExpandedProject(project); 
                                } else if (isAdmin && !project) {
                                    setEditingSlot(index); 
                                }
                            }}
                        >
                            {project ? (
                                <div className="project-content">
                                    {(project.type === 'text' || project.Type === 'text') ? (
                                        <div className="text-box">{project.content || project.Content}</div>
                                    ) : (
                                        <img src={project.imageUrl || project.ImageUrl} alt="Projekt" />
                                    )}
                                    {isAdmin && (
                                        <button className="delete-slot-btn" onClick={(e) => {
                                            e.stopPropagation();
                                            setProjectToDelete(project.id || project.Id); // Otwiera modal zamiast alertu
                                        }}>×</button>
                                    )}
                                </div>
                            ) : (
                                isAdmin && (
                                    <div className="target-icon">
                                        <div className="plus">+</div>
                                        <div className="corner tl"></div><div className="corner tr"></div>
                                        <div className="corner bl"></div><div className="corner br"></div>
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>

            {/* LIGHTBOX (Powiększony obraz) */}
            {expandedProject && (
                <div className="lightbox-overlay" onClick={() => setExpandedProject(null)}>
                    {/* Ten przycisk jest teraz duży i jaskrawy dzięki CSS */}
                    <button className="lightbox-close" onClick={() => setExpandedProject(null)}>×</button>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <img src={expandedProject.imageUrl || expandedProject.ImageUrl} alt="Powiększony" />
                    </div>
                </div>
            )}

            {/* MODAL USUWANIA (NOWOŚĆ) */}
            {projectToDelete && (
                <div className="modal-overlay" onClick={() => setProjectToDelete(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: '#ff4444' }}>POTWIERDŹ USUNIĘCIE</h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px', fontSize: '1.1rem' }}>
                            Czy na pewno chcesz bezpowrotnie usunąć ten element ze swojego portfolio?
                        </p>
                        <div className="modal-btns">
                            <button className="btn-delete" onClick={confirmDelete} disabled={uploading}>
                                {uploading ? "USUWAM..." : "USUŃ TRWALE"}
                            </button>
                            <button className="btn-cancel" onClick={() => setProjectToDelete(null)}>ANULUJ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DODAWANIA PROJEKTU */}
            {editingSlot !== null && (
                <div className="modal-overlay" onClick={resetModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Dodaj do slotu #{editingSlot + 1}</h2>
                        {modalStep === 'choose' && (
                            <div className="modal-options">
                                <button onClick={() => setModalStep('image')}>🖼️ Obraz</button>
                                <button onClick={() => setModalStep('text')}>✍️ Tekst</button>
                            </div>
                        )}
                        {modalStep === 'text' && (
                            <div className="modal-form">
                                <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Wpisz treść..."/>
                                <button onClick={handleAddText} disabled={uploading}>Zapisz</button>
                            </div>
                        )}
                        {modalStep === 'image' && (
                            <div className="modal-form">
                                <input type="file" onChange={e => setFileInput(e.target.files[0])} />
                                <button onClick={handleAddImage} disabled={uploading}>Wyślij</button>
                            </div>
                        )}
                        <button className="cancel-btn" onClick={resetModal}>Anuluj</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;