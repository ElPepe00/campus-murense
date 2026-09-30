// frontend/src/pages/public/HomePage.tsx
import React from 'react';
import { 
  Plus, 
  Bell, 
  MessageSquare, 
  Shirt, 
  Waves, 
  UtensilsCrossed, 
  ShieldCheck, 
  ChevronRight,
  Award,
  Activity,
  Clock,
  FileText
} from 'lucide-react';
import type { PageTabKey } from '../../components/Navbar';

interface HomePageProps {
  onNavigateToRegistration: () => void;
  onNavigateTab: (tab: PageTabKey) => void;
  apiConnected?: boolean | null;
}

/**
 * Pàgina principal pública per a famílies i visitants del Campus C.D. Murense.
 * Mostra informació del campus, serveis esportius inclosos i enllaços directes a la inscripció.
 */
export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToRegistration,
  onNavigateTab,
}) => {
  return (
    <div className="home-screen-container">
      {/* 1. Banner Principal (Hero) */}
      <section className="dashboard-hero">
        <div className="hero-content-col">
          <h1 className="hero-heading">
            Viu l'estiu més esportiu al <span>C.D. Murense</span>
          </h1>

          <p className="hero-description">
            Obert el període d'inscripcions per a nins i nines de 4 a 14 anys. Futbol formatiu, piscina diària, servei de menjador i excursions en el millor ambient esportiu de Muro.
          </p>

          <div className="hero-buttons-row">
            <a 
              href="/inscripcio" 
              className="btn-hero-primary"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onNavigateToRegistration();
                }
              }}
              id="btn-hero-inscriute"
            >
              <Plus size={19} strokeWidth={2.6} />
              <span>Inscriu el teu fill/a ara</span>
            </a>

            <a 
              href="/noticies" 
              className="btn-hero-secondary"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onNavigateTab('noticies');
                }
              }}
            >
              <Bell size={18} />
              <span>Notícies i Avisos</span>
            </a>

            <a 
              href="/contacte" 
              className="btn-hero-secondary"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onNavigateTab('contacte');
                }
              }}
            >
              <MessageSquare size={18} />
              <span>Contacte</span>
            </a>
          </div>
        </div>

        <div className="hero-image-col">
          <picture>
            <source srcSet="/hero-campus.webp" type="image/webp" />
            <img 
              src="/hero-campus.jpg" 
              alt="Nins i nines al camp de futbol C.D. Murense durant el campus esportiu" 
              loading="eager"
              decoding="async"
              width="688"
              height="384"
            />
          </picture>
          <div className="hero-image-gradient"></div>
        </div>
      </section>

      {/* 2. Serveis Esportius Inclosos */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Què inclou el nostre Campus?</h2>
          <p className="section-subtitle">Tots els serveis i activitats pensats per al desenvolupament esportiu i la comoditat familiar</p>
        </div>
      </div>

      <section className="stats-grid" style={{ marginBottom: '36px' }}>
        <div className="stat-card blue" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <Activity size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Futbol & Multiesport</span>
            <span className="stat-title">Tecnificació diària, partits i jocs d'equip amb entrenadors titulats</span>
          </div>
        </div>

        <div className="stat-card blue" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <Waves size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Piscina Diària</span>
            <span className="stat-title">Sessions refrescants i segures a la piscina municipal amb socorristes</span>
          </div>
        </div>

        <div className="stat-card yellow" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <Shirt size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Roba Oficial Inclosa</span>
            <span className="stat-title">Pack oficial amb dues samarretes tècniques i motxilla del C.D. Murense</span>
          </div>
        </div>

        <div className="stat-card blue" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <ShieldCheck size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Seguretat & Assegurança</span>
            <span className="stat-title">Ràtio reduïda per grup, monitors formats i cobertura d'assegurança mèdica</span>
          </div>
        </div>

        <div className="stat-card green" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <UtensilsCrossed size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Servei de Menjador</span>
            <span className="stat-title">Servei opcional amb menús saludables, monitors i atenció a al·lèrgies (13:30h - 15:00h)</span>
          </div>
        </div>

        <div className="stat-card green" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <Clock size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Escoleta Matinera</span>
            <span className="stat-title">Acollida matinal opcional a partir de les 08:00h per a la conciliació de les famílies</span>
          </div>
        </div>
      </section>

      {/* 3. Seccions Informatives */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Informació i Comunicació</h2>
          <p className="section-subtitle">Consulta els avisos del club i contacta amb els coordinadors</p>
        </div>
      </div>

      <section className="modules-grid" style={{ marginBottom: '32px' }}>
        <a 
          href="/noticies"
          className="module-card"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0) {
              e.preventDefault();
              onNavigateTab('noticies');
            }
          }}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="module-card-top">
            <div className="module-icon-box">
              <Bell size={22} />
            </div>
            <ChevronRight size={18} className="module-arrow" />
          </div>
          <div>
            <h3 className="module-name">Tauler de Notícies i Avisos (/noticies)</h3>
            <p className="module-desc">Dates d'inici, reunions informatives per a famílies i documentació d'interès.</p>
          </div>
        </a>

        <a 
          href="/contacte"
          className="module-card"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0) {
              e.preventDefault();
              onNavigateTab('contacte');
            }
          }}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="module-card-top">
            <div className="module-icon-box">
              <MessageSquare size={22} />
            </div>
            <ChevronRight size={18} className="module-arrow" />
          </div>
          <div>
            <h3 className="module-name">Bústia de Contacte (/contacte)</h3>
            <p className="module-desc">Envia qualsevol consulta o dubte directament a l'equip de coordinació esportiva.</p>
          </div>
        </a>
      </section>

      {/* 4. Informació Important per a les Famílies (Secció 7 de la Guia Oficial) */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Informació Important per a les Famílies</h2>
          <p className="section-subtitle">Tots els detalls pràctics sobre equipament, documentació i pagament</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Motxilla */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Shirt size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Què han de portar a la motxilla
            </h3>
          </div>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: 1.65 }}>
            <li><strong>Botella d’aigua:</strong> es podrà omplir còmodament a les instal·lacions.</li>
            <li><strong>Crema solar:</strong> es recomana posar-ne primer a casa abans de venir.</li>
            <li><strong>Roba esportiva:</strong> gorra, camiseta i calçons del campus. També calcetins o calces.</li>
            <li><strong>Berenar:</strong> l’organització aportarà fruita fresca de temporada.</li>
            <li><strong>Tovallola + roba de recanvi:</strong> es podran dutxar en finalitzar la jornada (no obligatori).</li>
            <li><strong>Estris per la piscina:</strong> banyador, tovallola, xancles i maneguets si els necessiten per seguretat.</li>
          </ul>
        </div>

        {/* Documentació i Pagament */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Documentació i Pagament
            </h3>
          </div>
          <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 6px' }}>
              <strong>Documentació a presentar:</strong>
            </p>
            <ul style={{ paddingLeft: '18px', margin: '0 0 12px' }}>
              <li>Còpia DNI (jugador/a o tutor)</li>
              <li>Còpia Targeta Sanitària</li>
              <li>Justificant de pagament</li>
            </ul>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', marginBottom: '10px' }}>
              <strong style={{ color: '#0f172a' }}>Transferència Bancària:</strong><br />
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0066f5', fontSize: '13px' }}>
                IBAN ES93 2056 0016 0520 8320 6827
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '12.5px', color: '#b45309' }}>
              *Data límit per formalitzar la inscripció: <strong>10/06/2027</strong>.<br />
              Enviar justificant a <strong>campuscdmurense@gmail.com</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Valors del Club */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}>
          <Award size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Compromís i Valors amb l'Esport Base
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0', lineHeight: 1.45 }}>
            Al C.D. Murense fomentem el respecte, el treball en equip, la superació i la companyonia en un entorn segur i divertit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
