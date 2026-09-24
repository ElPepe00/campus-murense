// frontend/src/pages/public/HomePage.tsx
import React from 'react';
import { 
  Plus, 
  Sparkles, 
  Bell, 
  MessageSquare, 
  Shirt, 
  Waves, 
  UtensilsCrossed, 
  ShieldCheck, 
  ChevronRight,
  Calendar,
  Award
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
          <div className="hero-pill-badge">
            <Sparkles size={14} />
            <span>Campus d'Estiu 2027 • C.D. Murense</span>
          </div>

          <h1 className="hero-heading">
            Viu l'estiu més esportiu al <span>C.D. Murense</span>
          </h1>

          <p className="hero-description">
            Obert el període d'inscripcions per a nins i nines de 4 a 14 anys. Futbol formatiu, piscina diària, servei de menjador i excursions en el millor ambient esportiu de Muro.
          </p>

          <div className="hero-buttons-row">
            <button 
              type="button" 
              className="btn-hero-primary"
              onClick={onNavigateToRegistration}
              id="btn-hero-inscriute"
            >
              <Plus size={19} strokeWidth={2.6} />
              <span>Inscriu el teu fill/a ara</span>
            </button>

            <button 
              type="button" 
              className="btn-hero-secondary"
              onClick={() => onNavigateTab('noticies')}
            >
              <Bell size={17} />
              <span>Consultar notícies</span>
            </button>
          </div>
        </div>

        <div className="hero-image-col">
          <img 
            src="/hero-campus.jpg" 
            alt="Nins i nines al camp de futbol C.D. Murense" 
            loading="eager"
          />
          <div className="hero-image-gradient"></div>
        </div>
      </section>

      {/* 2. Serveis Esportius Inclosos */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Què inclou el nostre Campus?</h2>
          <p className="section-subtitle">Tots els serveis pensats per a la comoditat de les famílies</p>
        </div>
      </div>

      <section className="stats-grid" style={{ marginBottom: '36px' }}>
        <div className="stat-card blue" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <Waves size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Piscina Diària</span>
            <span className="stat-title">Amb monitors titulats i adaptat a cada edat</span>
          </div>
        </div>

        <div className="stat-card green" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <UtensilsCrossed size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Servei de Menjador</span>
            <span className="stat-title">Menús saludables i atenció especial d'al·lèrgies</span>
          </div>
        </div>

        <div className="stat-card yellow" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <Shirt size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Roba Oficial</span>
            <span className="stat-title">Samarreta i motxilla tècnica del C.D. Murense</span>
          </div>
        </div>

        <div className="stat-card blue" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <ShieldCheck size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Seguretat i Monitors</span>
            <span className="stat-title">Ràtio reduïda i assegurança mèdica inclosa</span>
          </div>
        </div>
      </section>

      {/* 3. Mòduls d'Accés Ràpid per a Famílies */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Com funciona el procés?</h2>
          <p className="section-subtitle">Gestiona la participació del teu infant de manera fàcil i ràpida</p>
        </div>
      </div>

      <section className="modules-grid" style={{ marginBottom: '32px' }}>
        <div 
          className="module-card"
          onClick={onNavigateToRegistration}
          role="button"
          tabIndex={0}
        >
          <div className="module-card-top">
            <div className="module-icon-box">
              <Calendar size={22} />
            </div>
            <ChevronRight size={18} className="module-arrow" />
          </div>
          <div>
            <h3 className="module-name">Inscripció en Línia</h3>
            <p className="module-desc">Selecciona les setmanes, dades de l'infant, contactes d'emergència i serveis addicionals.</p>
          </div>
        </div>

        <div 
          className="module-card"
          onClick={() => onNavigateTab('noticies')}
          role="button"
          tabIndex={0}
        >
          <div className="module-card-top">
            <div className="module-icon-box">
              <Bell size={22} />
            </div>
            <ChevronRight size={18} className="module-arrow" />
          </div>
          <div>
            <h3 className="module-name">Tauler de Notícies i Avisos</h3>
            <p className="module-desc">Dates d'inici, reunions informatives per a famílies i documentació d'interès.</p>
          </div>
        </div>

        <div 
          className="module-card"
          onClick={() => onNavigateTab('contacte')}
          role="button"
          tabIndex={0}
        >
          <div className="module-card-top">
            <div className="module-icon-box">
              <MessageSquare size={22} />
            </div>
            <ChevronRight size={18} className="module-arrow" />
          </div>
          <div>
            <h3 className="module-name">Bústia de Contacte</h3>
            <p className="module-desc">Envia qualsevol consulta o dubte directament a l'equip de coordinació esportiva.</p>
          </div>
        </div>
      </section>

      {/* 4. Valors del Club */}
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
