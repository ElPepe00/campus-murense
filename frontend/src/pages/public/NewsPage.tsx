// frontend/src/pages/public/NewsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Trophy, 
  AlertCircle, 
  Megaphone,
  Plus
} from 'lucide-react';

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



interface NewsPageProps {
  onNavigate?: (path: string) => void;
}

/**
 * Pàgina de notícies, comunicats oficials i novetats del campus (/noticies).
 * Permet a l'administrador crear noves notícies (títol, tipus, data, descripció) i eliminar les existents.
 */
export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate }) => {
  const [noticies, setNoticies] = useState<NoticiaItem[]>([]);

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

  return (
    <div className="noticias-page-container">
      {/* Fil d'Ariadna (Breadcrumbs) */}
      <nav className="breadcrumbs" aria-label="Fil d'Ariadna">
        <a 
          href="/" 
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
        >
          Inici
        </a>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Notícies</span>
      </nav>

      {/* Capçalera de la pàgina */}
      <div className="page-header-box">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-main-title">Comunicats del Campus C.D. Murense</h1>
            <p className="page-main-desc">
              Tota la informació actualitzada, dates rellevants i novetats sobre les activitats de l'estiu.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {onNavigate && (
              <a
                href="/inscripcio"
                className="btn-hero-secondary"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    onNavigate('/inscripcio');
                  }
                }}
                style={{ padding: '9px 16px', fontSize: '13.5px', textDecoration: 'none' }}
              >
                <Plus size={16} />
                <span>Formulari d'Inscripció</span>
              </a>
            )}
          </div>
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
                  <span className="noticia-date">{noticia.data}</span>
                </div>

                <h2 className="noticia-title">{noticia.titol}</h2>
                <p className="noticia-summary">{noticia.descripcio}</p>
              </article>
            );
          })}
        </div>
      )}

      {/* Targeta informativa inferior amb enllaços directes */}
      <section className="news-cta-banner" style={{ marginTop: '36px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px', boxShadow: 'var(--shadow-card)' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Tens algun dubte sobre les activitats o la inscripció?</h3>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>L'equip de coordinació esportiva del C.D. Murense està a la teva disposició.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="/contacte"
            className="btn-hero-secondary"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
                e.preventDefault();
                onNavigate('/contacte');
              }
            }}
            style={{ textDecoration: 'none' }}
          >
            Anar a Contacte (/contacte)
          </a>
          <a
            href="/inscripcio"
            className="btn-hero-primary"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
                e.preventDefault();
                onNavigate('/inscripcio');
              }
            }}
            style={{ textDecoration: 'none' }}
          >
            Inscriure Alumne (/inscripcio)
          </a>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
