import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2,
  X, 
  AlertCircle, 
  Megaphone,
  Save,
  Search
} from 'lucide-react';
import type { NoticiaItem } from '../public/NewsPage';

const STORAGE_KEY = 'campus_murense_noticies';

const INITIAL_NOTICIES: NoticiaItem[] = [
  {
    id: 'noticia-3',
    titol: 'Equipacions oficials C.D. Murense per a tots els inscrits',
    data: '1 de Juny 2027',
    tipus: 'Material',
    descripcio: 'Cada participant rebrà el pack de dues samarretes tècniques d’entrenament i la motxilla oficial del club amb la inscripció.',
    createdAt: 1717200000000,
  },
  {
    id: 'noticia-2',
    titol: 'Reunió informativa per a pares i mares al camp municipal',
    data: '28 de Maig 2027 - 19:30h',
    tipus: 'Reunió',
    descripcio: 'Explicarem la dinàmica setmanal, horaris del servei de menjador i matinera, i resoldrem qualsevol dubte sobre el material.',
    createdAt: 1716880000000,
  },
  {
    id: 'noticia-1',
    titol: 'Obert el termini d’inscripcions per al Campus d’Estiu 2027',
    data: '15 de Maig 2027',
    tipus: 'Inscripcions',
    descripcio: 'Ja està disponible el formulari en línia per a formalitzar la plaça. Recordau que les places són limitades per grups d’edat.',
    createdAt: 1715750000000,
  },
];

function sortNoticiesByCreation(items: NoticiaItem[]): NoticiaItem[] {
  return [...items].sort((a, b) => {
    const timeA = typeof a.createdAt === 'number' ? a.createdAt : 0;
    const timeB = typeof b.createdAt === 'number' ? b.createdAt : 0;
    return timeB - timeA;
  });
}

function getTodayFormatted(): string {
  try {
    const today = new Date();
    return new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);
  } catch {
    return '25 de Setembre 2026';
  }
}

export const NoticiesManagementPage: React.FC = () => {
  const [noticies, setNoticies] = useState<NoticiaItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Formulari
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formTitol, setFormTitol] = useState('');
  const [formTipus, setFormTipus] = useState('Inscripcions');
  const [formData, setFormData] = useState('');
  const [formDescripcio, setFormDescripcio] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const withTimestamps: NoticiaItem[] = parsed.map((item, idx) => {
            let ts = typeof item.createdAt === 'number' ? item.createdAt : undefined;
            if (!ts) {
              const match = String(item.id).match(/\d{10,}/);
              ts = match ? Number(match[0]) : Date.now() - idx * 100000;
            }
            return {
              ...item,
              createdAt: ts,
            };
          });
          setNoticies(sortNoticiesByCreation(withTimestamps));
          return;
        }
      }
    } catch (e) {
      console.error('Error carregant notícies de localStorage:', e);
    }
    setNoticies(sortNoticiesByCreation(INITIAL_NOTICIES));
  }, []);

  const handleOpenModal = (noticiaToEdit?: NoticiaItem) => {
    if (noticiaToEdit) {
      setEditingId(noticiaToEdit.id);
      setFormTitol(noticiaToEdit.titol);
      setFormTipus(noticiaToEdit.tipus);
      setFormData(noticiaToEdit.data);
      setFormDescripcio(noticiaToEdit.descripcio);
    } else {
      setEditingId(null);
      setFormTitol('');
      setFormTipus('Inscripcions');
      setFormData(getTodayFormatted());
      setFormDescripcio('');
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitol.trim()) return setFormError('El títol és obligatori.');
    if (!formTipus.trim()) return setFormError('El tipus és obligatori.');
    if (!formData.trim()) return setFormError('La data és obligatòria.');
    if (!formDescripcio.trim()) return setFormError('La descripció és obligatòria.');

    const now = Date.now();
    let updated: NoticiaItem[];

    if (editingId) {
      // Modificar
      updated = noticies.map(n => 
        n.id === editingId 
          ? { 
              ...n, 
              titol: formTitol.trim(), 
              tipus: formTipus.trim(), 
              data: formData.trim(), 
              descripcio: formDescripcio.trim() 
            } 
          : n
      );
    } else {
      // Crear
      const novaNoticia: NoticiaItem = {
        id: `noticia-${now}`,
        titol: formTitol.trim().slice(0, 150),
        tipus: formTipus.trim().slice(0, 50),
        data: formData.trim().slice(0, 50),
        descripcio: formDescripcio.trim().slice(0, 2000),
        createdAt: now,
      };
      updated = [novaNoticia, ...noticies];
    }

    updated = sortNoticiesByCreation(updated);
    setNoticies(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error desant canvis a localStorage:', err);
    }
    setIsModalOpen(false);
  };

  const handleDeleteNoticia = (id: string | number) => {
    const confirmText = 'Segur que vols eliminar aquesta notícia de forma permanent?';
    if (window.confirm(confirmText)) {
      const updated = sortNoticiesByCreation(noticies.filter((n) => n.id !== id));
      setNoticies(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error desant canvis a localStorage:', err);
      }
    }
  };

  const filteredNoticies = noticies.filter(n => 
    n.titol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.descripcio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container fade-in">
      <div className="page-header-box">
        <div>
          <h1 className="page-main-title">Gestió de Notícies</h1>
          <p className="page-main-desc">
            Crea, modifica o elimina els comunicats oficials del campus. Aquestes notícies es veuran a la web pública.
          </p>
        </div>
        <button
          type="button"
          className="btn-hero-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          <span>Nova Notícia</span>
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Megaphone size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Notícies Publicades</span>
            <span className="stat-value">{noticies.length}</span>
          </div>
        </div>
      </div>

      <div className="search-filter-bar">
        <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cercar notícies per títol o descripció..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipus</th>
                <th>Títol</th>
                <th style={{ textAlign: 'right' }}>Accions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNoticies.length > 0 ? (
                filteredNoticies.map((n) => (
                  <tr key={n.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{n.data}</td>
                    <td>
                      <span className="status-badge status-pagat">{n.tipus}</span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-main)', maxWidth: '400px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.titol}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon btn-edit"
                          onClick={() => handleOpenModal(n)}
                          title="Modificar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteNoticia(n.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No s'han trobat notícies.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Modificar Notícia' : 'Publicar Nova Notícia'}</h3>
              <button className="btn-close-modal" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {formError && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form id="noticia-form" onSubmit={handleSaveSubmit} className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Títol de la notícia *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formTitol}
                    onChange={(e) => setFormTitol(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipus de notícia *</label>
                  <select
                    className="form-select"
                    value={formTipus}
                    onChange={(e) => setFormTipus(e.target.value)}
                  >
                    <option value="Inscripcions">Inscripcions</option>
                    <option value="Reunió">Reunió</option>
                    <option value="Material">Material</option>
                    <option value="Avís Urgent">Avís Urgent</option>
                    <option value="Esport">Esport / Partits</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Data de publicació *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Descripció completa *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    value={formDescripcio}
                    onChange={(e) => setFormDescripcio(e.target.value)}
                    required
                  />
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-modal-secondary" onClick={handleCloseModal}>
                Cancel·lar
              </button>
              <button type="submit" form="noticia-form" className="btn-modal-primary">
                <Save size={16} style={{ marginRight: '6px' }} />
                <span>{editingId ? 'Desar canvis' : 'Publicar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
