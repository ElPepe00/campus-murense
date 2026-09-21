// frontend/src/pages/public/NoticiasPage.tsx
import React from 'react';
import { Bell, Calendar, Sparkles, Trophy } from 'lucide-react';

export const NoticiasPage: React.FC = () => {
  const NOTICIAS = [
    {
      id: 1,
      titol: 'Obert el termini d’inscripcions per al Campus d’Estiu 2027',
      data: '15 de Maig 2027',
      categoria: 'Inscripcions',
      resum: 'Ja està disponible el formulari en línia per a formalitzar la plaça. Recordau que les places són limitades per grups d’edat.',
      icon: Sparkles,
      color: '#0066f5',
    },
    {
      id: 2,
      titol: 'Reunió informativa per a pares i mares al camp municipal',
      data: '28 de Maig 2027 - 19:30h',
      categoria: 'Reunió',
      resum: 'Explicarem la dinàmica setmanal, horaris del servei de menjador i matinera, i resoldrem qualsevol dubte sobre el material.',
      icon: Calendar,
      color: '#10b981',
    },
    {
      id: 3,
      titol: 'Equipacions oficials C.D. Murense per a tots els inscrits',
      data: '1 de Juny 2027',
      categoria: 'Material',
      resum: 'Cada participant rebrà el pack de dues samarretes tècniques d’entrenament i la motxilla oficial del club amb la inscripció.',
      icon: Trophy,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="noticias-page-container">
      <div className="page-header-box">
        <div className="badge-pill">
          <Bell size={14} />
          <span>Tauler de Notícies i Avisos</span>
        </div>
        <h1 className="page-main-title">Comunicats del Campus C.D. Murense</h1>
        <p className="page-main-desc">
          Tota la informació actualitzada, dates rellevants i novetats sobre les activitats de l'estiu.
        </p>
      </div>

      <div className="noticias-grid">
        {NOTICIAS.map((noticia) => {
          const IconComp = noticia.icon;
          return (
            <article key={noticia.id} className="noticia-card">
              <div className="noticia-card-header">
                <span className="noticia-tag" style={{ color: noticia.color, background: `${noticia.color}15` }}>
                  <IconComp size={14} />
                  {noticia.categoria}
                </span>
                <span className="noticia-date">{noticia.data}</span>
              </div>
              <h2 className="noticia-title">{noticia.titol}</h2>
              <p className="noticia-summary">{noticia.resum}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
};
