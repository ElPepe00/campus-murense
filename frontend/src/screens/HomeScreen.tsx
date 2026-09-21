// frontend/src/screens/HomeScreen.tsx
import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Coins, 
  Plus, 
  CalendarCheck, 
  CreditCard, 
  FileSpreadsheet, 
  Settings, 
  ChevronRight,
  Sparkles,
  Bell,
  MessageSquare,
  Clock,
  Shirt,
  Waves,
  UtensilsCrossed,
  ShieldCheck
} from 'lucide-react';
import type { PageTabKey } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

interface HomeScreenProps {
  onNavigateToInscripcion: () => void;
  onNavigateTab: (tab: PageTabKey) => void;
  onOpenLogin: () => void;
  apiConnected?: boolean | null;
  stats?: {
    totalInscritos: number;
    presentesHoy: number;
    pendientesPago: number;
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToInscripcion,
  onNavigateTab,
  onOpenLogin,
  stats = {
    totalInscritos: 86,
    presentesHoy: 74,
    pendientesPago: 12,
  },
}) => {
  const { isLoggedIn, usuari } = useAuth();

  // =========================================================================
  // VISTA 1: PANELL DE GESTIÓ PRIVAT (Només visible per a ADMIN / STAFF)
  // =========================================================================
  if (isLoggedIn) {
    return (
      <div className="home-screen-container">
        {/* Banner de Benvinguda per a Staff */}
        <section className="dashboard-hero" style={{ marginBottom: '24px' }}>
          <div className="hero-content-col">
            <div className="hero-pill-badge" style={{ background: '#ecfdf5', color: '#065f46' }}>
              <ShieldCheck size={14} />
              <span>Sessió iniciada com a {usuari?.rol} • {usuari?.nom_complet}</span>
            </div>

            <h1 className="hero-heading">
              Panell de Gestió <span>Campus 2027</span>
            </h1>

            <p className="hero-description">
              Supervisió operativa del campus esportiu. Consulta les inscripcions per grups, passa llista diària d'assistència i valida els pagaments.
            </p>

            <div className="hero-buttons-row">
              <button 
                type="button" 
                className="btn-hero-primary"
                onClick={onNavigateToInscripcion}
              >
                <Plus size={19} strokeWidth={2.6} />
                <span>Nova inscripció manual</span>
              </button>

              <button 
                type="button" 
                className="btn-hero-secondary"
                onClick={() => onNavigateTab('admin-assistencia')}
              >
                <CalendarCheck size={17} />
                <span>Passe de llista d'avui</span>
              </button>
            </div>
          </div>

          <div className="hero-image-col">
            <img 
              src="/hero-campus.jpg" 
              alt="Campus C.D. Murense" 
              loading="eager"
            />
            <div className="hero-image-gradient"></div>
          </div>
        </section>

        {/* Tarjetas KPI de Control Interno */}
        <div className="dashboard-section-header">
          <div>
            <h2 className="section-title">Estat General del Campus</h2>
            <p className="section-subtitle">Dades en temps real de les inscripcions i l'assistència</p>
          </div>
        </div>

        <section className="stats-grid" aria-label="Métricas de gestió">
          <div 
            className="stat-card blue"
            onClick={() => onNavigateTab('admin-inscripcions')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-box">
              <Users size={26} strokeWidth={2.2} />
            </div>
            <div className="stat-info-col">
              <span className="stat-value">{stats.totalInscritos}</span>
              <span className="stat-title">Inscrits totals</span>
            </div>
          </div>

          <div 
            className="stat-card green"
            onClick={() => onNavigateTab('admin-assistencia')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-box">
              <CheckCircle2 size={26} strokeWidth={2.2} />
            </div>
            <div className="stat-info-col">
              <span className="stat-value">{stats.presentesHoy}</span>
              <span className="stat-title">Presents avui</span>
            </div>
          </div>

          <div 
            className="stat-card orange"
            onClick={() => onNavigateTab('admin-pagos')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-box">
              <Coins size={26} strokeWidth={2.2} />
            </div>
            <div className="stat-info-col">
              <span className="stat-value">{stats.pendientesPago}</span>
              <span className="stat-title">Pendents de pagament</span>
            </div>
          </div>
        </section>

        {/* Mòduls Operatius d'Administració */}
        <div className="dashboard-section-header">
          <div>
            <h2 className="section-title">Mòduls Operatius</h2>
            <p className="section-subtitle">Selecciona una àrea de treball</p>
          </div>
        </div>

        <section className="modules-grid">
          <div 
            className="module-card"
            onClick={() => onNavigateTab('admin-inscripcions')}
            role="button"
            tabIndex={0}
          >
            <div className="module-card-top">
              <div className="module-icon-box">
                <Users size={22} />
              </div>
              <ChevronRight size={18} className="module-arrow" />
            </div>
            <div>
              <h3 className="module-name">Llistat d'Inscrits</h3>
              <p className="module-desc">Filtres per grups (A, B, C), edats, escoles i consulta de fitxes mèdiques.</p>
            </div>
          </div>

          <div 
            className="module-card"
            onClick={() => onNavigateTab('admin-assistencia')}
            role="button"
            tabIndex={0}
          >
            <div className="module-card-top">
              <div className="module-icon-box">
                <CalendarCheck size={22} />
              </div>
              <ChevronRight size={18} className="module-arrow" />
            </div>
            <div>
              <h3 className="module-name">Passe de Llista Diari</h3>
              <p className="module-desc">Control d'assistència ràpid per a monitors amb marcatge de presents i absents.</p>
            </div>
          </div>

          <div 
            className="module-card"
            onClick={() => onNavigateTab('admin-pagos')}
            role="button"
            tabIndex={0}
          >
            <div className="module-card-top">
              <div className="module-icon-box">
                <CreditCard size={22} />
              </div>
              <ChevronRight size={18} className="module-arrow" />
            </div>
            <div>
              <h3 className="module-name">Control de Pagaments</h3>
              <p className="module-desc">Comprovació de transferències, rebuts i canvi d'estat de pagament.</p>
            </div>
          </div>

          <div 
            className="module-card"
            onClick={() => onNavigateTab('admin-informes')}
            role="button"
            tabIndex={0}
          >
            <div className="module-card-top">
              <div className="module-icon-box">
                <FileSpreadsheet size={22} />
              </div>
              <ChevronRight size={18} className="module-arrow" />
            </div>
            <div>
              <h3 className="module-name">Informes i Excel</h3>
              <p className="module-desc">Descàrrega de dades en full de càlcul per a la coordinació i assegurances.</p>
            </div>
          </div>

          <div 
            className="module-card"
            onClick={() => onNavigateTab('admin-configuracio')}
            role="button"
            tabIndex={0}
          >
            <div className="module-card-top">
              <div className="module-icon-box">
                <Settings size={22} />
              </div>
              <ChevronRight size={18} className="module-arrow" />
            </div>
            <div>
              <h3 className="module-name">Configuració del Club</h3>
              <p className="module-desc">Gestió de monitors, preus per setmana, menjador i paràmetres del campus.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: PORTAL PÚBLIC (Per a famílies, nins i visitants)
  // =========================================================================
  return (
    <div className="home-screen-container">
      {/* 1. Hero Banner Públic */}
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
            Obert el període d'inscripcions per a nins i nines de 4 a 14 anys. Futbol formatiu, piscina diària, servei de menjador i excursions en el millor ambient del poble.
          </p>

          <div className="hero-buttons-row">
            <button 
              type="button" 
              className="btn-hero-primary"
              onClick={onNavigateToInscripcion}
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

      {/* 2. Serveis Inclosos per a les Famílies */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Què inclou el nostre Campus?</h2>
          <p className="section-subtitle">Tots els serveis pensats per a la comoditat de les famílies</p>
        </div>
      </div>

      <section className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card blue" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <Waves size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Piscina Diària</span>
            <span className="stat-title">Amb monitors i adaptat a cada edat</span>
          </div>
        </div>

        <div className="stat-card green" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <UtensilsCrossed size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Menjador i Matinera</span>
            <span className="stat-title">Horaris de 7:45h fins a 15:30h</span>
          </div>
        </div>

        <div className="stat-card orange" style={{ cursor: 'default' }}>
          <div className="stat-icon-box">
            <Shirt size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value" style={{ fontSize: '18px' }}>Roba Oficial</span>
            <span className="stat-title">2 samarretes tècniques i motxilla</span>
          </div>
        </div>
      </section>

      {/* 3. Accesos Principals per a Famílies */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Com començar?</h2>
          <p className="section-subtitle">Tria l'opció que necessitis</p>
        </div>
      </div>

      <section className="modules-grid" style={{ marginBottom: '36px' }}>
        <div 
          className="module-card"
          onClick={onNavigateToInscripcion}
          role="button"
          tabIndex={0}
          style={{ borderColor: '#93c5fd', background: '#f8faff' }}
        >
          <div className="module-card-top">
            <div className="module-icon-box" style={{ background: '#eff6ff', color: '#0066f5' }}>
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <ChevronRight size={18} className="module-arrow" />
          </div>
          <div>
            <h3 className="module-name" style={{ color: '#0066f5' }}>Inscripció en Línia</h3>
            <p className="module-desc">Formulari en 5 passos senzills per reservar la plaça de les setmanes que triïs.</p>
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
            <p className="module-desc">Dates d'inici, reunions informatives de pares i documents d'interès.</p>
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
            <p className="module-desc">Envia qualsevol consulta o dubte directament a l'equip de coordinació del campus.</p>
          </div>
        </div>
      </section>

      {/* 4. Caixa Informativa sobre l'Accés de Coordinació */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Ets coordinador o monitor del C.D. Murense?</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Identifica't amb el teu compte per accedir al control d'assistència i gestió interna del campus.
            </p>
          </div>
        </div>

        <button 
          type="button" 
          className="btn-hero-secondary"
          onClick={onOpenLogin}
          style={{ padding: '10px 18px', fontSize: '14px' }}
        >
          <span>Accés per a Staff</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
