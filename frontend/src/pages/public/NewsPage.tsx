// frontend/src/pages/public/NewsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Sparkles, 
  Trophy, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle, 
  Megaphone,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface NoticiaItem {
  id: string | number;
  titol: string;
  tipus: string;
  data: string;
  descripcio: string;
  createdAt: number;
}

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

/**
 * Ordena les notícies estrictament per data de creació (de més recent a més antiga)
 */
function sortNoticiesByCreation(items: NoticiaItem[]): NoticiaItem[] {
  return [...items].sort((a, b) => {
    const timeA = typeof a.createdAt === 'number' ? a.createdAt : 0;
    const timeB = typeof b.createdAt === 'number' ? b.createdAt : 0;
    return timeB - timeA;
  });
}

/**
 * Assigna icona i paleta de colors segons el tipus de notícia
 */
function getTipusMeta(tipus: string) {
  const lower = tipus.toLowerCase();
  if (lower.includes('inscripc')) {
    return { icon: Sparkles, color: '#0066f5', bg: '#eff6ff' };
  }
  if (lower.includes('reuni')) {
    return { icon: Calendar, color: '#10b981', bg: '#ecfdf5' };
  }
  if (lower.includes('material') || lower.includes('equip')) {
    return { icon: Trophy, color: '#f59e0b', bg: '#fffbeb' };
  }
  if (lower.includes('avís') || lower.includes('avis') || lower.includes('urgent') || lower.includes('important')) {
    return { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' };
  }
  return { icon: Megaphone, color: '#6366f1', bg: '#eef2ff' };
}

/**
 * Retorna la data d'avui en català formatat per defecte
 */
function getTodayFormatted(): string {
  try {
    const today = new Date();
    return new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);
  } catch {
    return '25 de Setembre 2026';
  }
}

/**
 * Pàgina de notícies, comunicats oficials i novetats del campus.
 * Permet a l'administrador crear noves notícies (títol, tipus, data, descripció) i eliminar les existents.
 */
export const NewsPage: React.FC = () => {
  const { isLoggedIn, usuari } = useAuth();
  const [noticies, setNoticies] = useState<NoticiaItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Camps del formulari de creació de notícia
  const [formTitol, setFormTitol] = useState('');
  const [formTipus, setFormTipus] = useState('Inscripcions');
  const [formData, setFormData] = useState('');
  const [formDescripcio, setFormDescripcio] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Carregar notícies des de localStorage o establir les inicials ordenades per creació
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

  // Obrir modal i preparar valors per defecte
  const handleOpenModal = () => {
    setFormTitol('');
    setFormTipus('Inscripcions');
    setFormData(getTodayFormatted());
    setFormDescripcio('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Tancar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  // Guardar nova notícia creada per l'administrador
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitol.trim()) {
      setFormError('El títol de la notícia és obligatori.');
      return;
    }
    if (!formTipus.trim()) {
      setFormError('El tipus de la notícia és obligatori.');
      return;
    }
    if (!formData.trim()) {
      setFormError('La data de la notícia és obligatòria.');
      return;
    }
    if (!formDescripcio.trim()) {
      setFormError('La descripció de la notícia és obligatòria.');
      return;
    }

    const now = Date.now();
    const novaNoticia: NoticiaItem = {
      id: `noticia-${now}`,
      titol: formTitol.trim(),
      tipus: formTipus.trim(),
      data: formData.trim(),
      descripcio: formDescripcio.trim(),
      createdAt: now,
    };

    const updated = sortNoticiesByCreation([novaNoticia, ...noticies]);
    setNoticies(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error desant notícies a localStorage:', err);
    }

    setIsModalOpen(false);
  };

  // Eliminar una notícia existent
  const handleDeleteNoticia = (id: string | number) => {
    const item = noticies.find((n) => n.id === id);
    const confirmText = item
      ? `Segur que vols eliminar la notícia "${item.titol}"?`
      : 'Segur que vols eliminar aquesta notícia?';

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

  return (
    <div className="noticias-page-container">
      {/* Capçalera de la pàgina */}
      <div className="page-header-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div className="badge-pill">
            <Bell size={14} />
            <span>Tauler de Notícies i Avisos</span>
          </div>

          {isLoggedIn && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#065f46', background: '#ecfdf5', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              <span>Mode Administrador ({usuari?.rol || 'Staff'})</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-main-title">Comunicats del Campus C.D. Murense</h1>
            <p className="page-main-desc">
              Tota la informació actualitzada, dates rellevants i novetats sobre les activitats de l'estiu.
            </p>
          </div>

          {isLoggedIn && (
            <button
              type="button"
              className="btn-hero-primary"
              onClick={handleOpenModal}
              style={{ padding: '10px 18px', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              <Plus size={18} />
              <span>Nova Notícia</span>
            </button>
          )}
        </div>
      </div>

      {/* Llistat de notícies o estat buit */}
      {noticies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <Megaphone size={40} style={{ color: 'var(--text-light)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>No hi ha cap notícia publicada</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px' }}>
            Actualment no s'ha publicat cap comunicat ni avís oficial.
          </p>
          {isLoggedIn && (
            <button type="button" className="btn-hero-primary" onClick={handleOpenModal} style={{ padding: '9px 16px', fontSize: '13.5px' }}>
              <Plus size={16} />
              <span>Publicar la primera notícia</span>
            </button>
          )}
        </div>
      ) : (
        <div className="noticias-grid">
          {noticies.map((noticia) => {
            const meta = getTipusMeta(noticia.tipus);
            const IconComp = meta.icon;

            return (
              <article key={noticia.id} className="noticia-card">
                <div className="noticia-card-header">
                  <span className="noticia-tag" style={{ color: meta.color, background: meta.bg }}>
                    <IconComp size={14} />
                    {noticia.tipus}
                  </span>

                  <div className="noticia-header-actions">
                    <span className="noticia-date">{noticia.data}</span>
                    {isLoggedIn && (
                      <button
                        type="button"
                        className="btn-delete-noticia"
                        onClick={() => handleDeleteNoticia(noticia.id)}
                        title="Eliminar notícia"
                        aria-label={`Eliminar notícia ${noticia.titol}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="noticia-title">{noticia.titol}</h2>
                <p className="noticia-summary">{noticia.descripcio}</p>
              </article>
            );
          })}
        </div>
      )}

      {/* Finestra modal per a crear una nova notícia (només visible per a administradors) */}
      {isModalOpen && (
        <div className="noticia-modal-overlay" onClick={handleCloseModal}>
          <div className="noticia-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="noticia-modal-header">
              <div>
                <h3 className="noticia-modal-title">Publicar Nova Notícia</h3>
                <p className="noticia-modal-subtitle">Afegeix un nou comunicat oficial per a totes les famílies</p>
              </div>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={handleCloseModal}
                aria-label="Tancar finestra"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="noticia-form">
              <div className="form-group">
                <label className="form-label" htmlFor="noticia-titol">
                  Títol de la notícia *
                </label>
                <input
                  id="noticia-titol"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Obertura d'inscripcions per al segon torn"
                  value={formTitol}
                  onChange={(e) => setFormTitol(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="noticia-tipus">
                    Tipus de notícia *
                  </label>
                  <select
                    id="noticia-tipus"
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

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="noticia-data">
                    Data de publicació *
                  </label>
                  <input
                    id="noticia-data"
                    type="text"
                    className="form-input"
                    placeholder="Ex: 25 de Setembre 2026"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="noticia-descripcio">
                  Descripció completa *
                </label>
                <textarea
                  id="noticia-descripcio"
                  className="form-textarea"
                  rows={4}
                  style={{ minHeight: '90px', resize: 'vertical' }}
                  placeholder="Escriu els detalls de la notícia, recomanacions o instruccions..."
                  value={formDescripcio}
                  onChange={(e) => setFormDescripcio(e.target.value)}
                  required
                />
              </div>

              <div className="noticia-modal-footer">
                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={handleCloseModal}
                  style={{ padding: '9px 18px', fontSize: '14px' }}
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="btn-hero-primary"
                  style={{ padding: '9px 20px', fontSize: '14px' }}
                >
                  Publicar notícia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
