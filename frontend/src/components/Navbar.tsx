// frontend/src/components/Navbar.tsx
import React from 'react';
import { 
  Shield, 
  Home, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  FileSpreadsheet, 
  Settings, 
  Plus, 
  Menu,
  Bell,
  MessageSquare,
  Lock,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  onOpenLogin: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenLogin,
  onToggleMobileMenu,
}) => {
  const { isLoggedIn, usuari, logout } = useAuth();

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
          <div className="brand-badge-icon">
            <Shield size={24} strokeWidth={2.4} />
          </div>
          <div className="brand-text-col">
            <span className="brand-title-main">CAMPUS C.D. MURENSE</span>
            <span className="brand-subtitle-tag">
              {isLoggedIn ? `Panell de Gestió (${usuari?.rol})` : "Campus d'Estiu 2027"}
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="nav-links" aria-label="Navegació principal">
          {/* Enllaços generals / públics */}
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

          {/* Enllaços exclusius d'administració quan està loguejat */}
          {isLoggedIn && (
            <>
              <div style={{ width: '1px', height: '22px', background: '#cbd5e1', margin: '0 4px' }} />
              
              <button
                type="button"
                className={`nav-link-btn ${activeTab === 'admin-inscripcions' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-inscripcions')}
              >
                <Users size={17} />
                <span>Inscrits</span>
              </button>

              <button
                type="button"
                className={`nav-link-btn ${activeTab === 'admin-assistencia' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-assistencia')}
              >
                <CalendarCheck size={17} />
                <span>Assistència</span>
              </button>

              <button
                type="button"
                className={`nav-link-btn ${activeTab === 'admin-pagos' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-pagos')}
              >
                <CreditCard size={17} />
                <span>Pagaments</span>
              </button>

              <button
                type="button"
                className={`nav-link-btn ${activeTab === 'admin-informes' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-informes')}
              >
                <FileSpreadsheet size={17} />
                <span>Informes</span>
              </button>

              <button
                type="button"
                className={`nav-link-btn ${activeTab === 'admin-configuracio' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-configuracio')}
              >
                <Settings size={17} />
                <span>Configuració</span>
              </button>
            </>
          )}
        </nav>

        {/* Navbar Actions */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <button
              type="button"
              className="btn-hero-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              onClick={logout}
              title="Tancar sessió de gestió"
            >
              <LogOut size={16} />
              <span>Sortir</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-hero-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              onClick={onOpenLogin}
              title="Accés per a monitors i coordinació"
            >
              <Lock size={15} />
              <span>Accés Staff</span>
            </button>
          )}

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
