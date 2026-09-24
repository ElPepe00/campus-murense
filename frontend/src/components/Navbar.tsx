// frontend/src/components/Navbar.tsx
import React from 'react';
import { 
  Home, 
  Plus, 
  Menu,
  Bell,
  MessageSquare
} from 'lucide-react';

export type PageTabKey = 
  | 'inici' 
  | 'inscripcio' 
  | 'noticies' 
  | 'contacte'
  // Admin only tabs:
  | 'admin-inscripcions' 
  | 'admin-assistencia' 
  | 'admin-pagos' 
  | 'admin-informes' 
  | 'admin-configuracio';

interface NavbarProps {
  activeTab: PageTabKey;
  onTabChange: (tab: PageTabKey) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onToggleMobileMenu,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Group */}
        <div 
          className="brand-group"
          onClick={() => onTabChange('inici')}
          role="button"
          tabIndex={0}
        >
          <img 
            src="/logo.jpeg" 
            alt="C.D. Murense" 
            className="brand-logo-img" 
          />
          <div className="brand-text-col">
            <span className="brand-title-main">CAMPUS C.D. MURENSE</span>
            <span className="brand-subtitle-tag">Campus d'Estiu 2027</span>
          </div>
        </div>

        {/* Desktop Nav Links (Portal Públic Net) */}
        <nav className="nav-links" aria-label="Navegació principal">
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'inici' ? 'active' : ''}`}
            onClick={() => onTabChange('inici')}
          >
            <Home size={17} />
            <span>Inici</span>
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'inscripcio' ? 'active' : ''}`}
            onClick={() => onTabChange('inscripcio')}
          >
            <Plus size={17} />
            <span>Inscripció</span>
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'noticies' ? 'active' : ''}`}
            onClick={() => onTabChange('noticies')}
          >
            <Bell size={17} />
            <span>Notícies</span>
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'contacte' ? 'active' : ''}`}
            onClick={() => onTabChange('contacte')}
          >
            <MessageSquare size={17} />
            <span>Contacte</span>
          </button>
        </nav>

        {/* Navbar Actions */}
        <div className="navbar-actions">
          <button
            type="button"
            className="btn-navbar-cta"
            onClick={() => onTabChange('inscripcio')}
            id="btn-navbar-inscriute"
          >
            <Plus size={18} strokeWidth={2.6} />
            <span>Inscriu-te ara</span>
          </button>

          <button
            type="button"
            className="btn-mobile-menu"
            aria-label="Menú mòbil"
            onClick={onToggleMobileMenu}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
