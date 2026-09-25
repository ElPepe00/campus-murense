// frontend/src/pages/admin/DashboardPage.tsx
import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Coins, 
  CalendarCheck, 
  CreditCard, 
  FileSpreadsheet, 
  Settings, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type { PageTabKey } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

interface DashboardPageProps {
  onNavigateTab: (tab: PageTabKey) => void;
  stats?: {
    totalInscritos: number;
    presentesHoy: number;
    pendientesPago: number;
  };
}

/**
 * Tauler de control principal per a l'equip de coordinació i staff del C.D. Murense.
 * Proporciona mètriques clau del campus en temps real i accés directe als mòduls de gestió.
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  stats = {
    totalInscritos: 86,
    presentesHoy: 74,
    pendientesPago: 12,
  },
}) => {
  const { usuari } = useAuth();

  return (
    <div className="home-screen-container">
      {/* 1. Banner de Benvinguda per a Staff */}
      <section className="dashboard-hero" style={{ marginBottom: '24px' }}>
        <div className="hero-content-col">
          <div className="hero-pill-badge" style={{ background: '#ecfdf5', color: '#065f46' }}>
            <ShieldCheck size={14} />
            <span>Sessió iniciada com a {usuari?.rol || 'Coordinador'} • {usuari?.nom_complet || 'Staff C.D. Murense'}</span>
          </div>

          <h1 className="hero-heading" style={{ fontSize: '32px' }}>
            Panell de Gestió Esportiva <span>Campus 2027</span>
          </h1>

          <p className="hero-description">
            Control integral del campus esportiu del C.D. Murense. Consulta fitxes d'inscrits, passa llista diària, gestiona les quotes i descarrega llistats oficials.
          </p>

          <div className="hero-buttons-row">
            <button 
              type="button" 
              className="btn-hero-primary"
              onClick={() => onNavigateTab('admin-inscripcions')}
            >
              <Users size={18} />
              <span>Gestionar Inscrits</span>
            </button>

            <button 
              type="button" 
              className="btn-hero-secondary"
              onClick={() => onNavigateTab('admin-assistencia')}
            >
              <CalendarCheck size={18} />
              <span>Passar Llista Diària</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Targetes d'Estadístiques Clau (KPIs) */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Estat del Campus en Temps Real</h2>
          <p className="section-subtitle">Dades actualitzades directament de la base de dades</p>
        </div>
      </div>

      <section className="stats-grid" style={{ marginBottom: '32px' }}>
        <div 
          className="stat-card blue"
          onClick={() => onNavigateTab('admin-inscripcions')}
          role="button"
          tabIndex={0}
          title="Veure tots els nins inscrits"
        >
          <div className="stat-icon-box">
            <Users size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{stats.totalInscritos}</span>
            <span className="stat-title">Infants Inscrits</span>
          </div>
        </div>

        <div 
          className="stat-card green"
          onClick={() => onNavigateTab('admin-assistencia')}
          role="button"
          tabIndex={0}
          title="Veure el control d'assistència d'avui"
        >
          <div className="stat-icon-box">
            <CheckCircle2 size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{stats.presentesHoy}</span>
            <span className="stat-title">Presents Avui</span>
          </div>
        </div>

        <div 
          className="stat-card yellow"
          onClick={() => onNavigateTab('admin-pagos')}
          role="button"
          tabIndex={0}
          title="Veure pagaments pendents de cobrar"
        >
          <div className="stat-icon-box">
            <Coins size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{stats.pendientesPago}</span>
            <span className="stat-title">Pagaments Pendents</span>
          </div>
        </div>
      </section>

      {/* 3. Mòduls Operatius de Gestió del Campus */}
      <div className="dashboard-section-header">
        <div>
          <h2 className="section-title">Mòduls Operatius</h2>
          <p className="section-subtitle">Accés directe a les eines de coordinació i monitoratge</p>
        </div>
      </div>

      <section className="modules-grid" style={{ marginBottom: '24px' }}>
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
            <p className="module-desc">Control d'assistència ràpid per a monitors amb marcatge d'entrades i sortides.</p>
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
            <p className="module-desc">Comprovació de transferències, rebuts i canvi directe d'estat de pagament.</p>
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
            <p className="module-desc">Exportació de llistats complets en format CSV per a fulls de càlcul.</p>
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
            <p className="module-desc">Gestió de monitors, quotes setmanals, servei de menjador i dades oficials.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
