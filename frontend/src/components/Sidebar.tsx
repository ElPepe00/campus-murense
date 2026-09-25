// frontend/src/components/Sidebar.tsx
import React, { useEffect } from 'react';
import { 
  Home, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Bell, 
  MessageSquare,
  X
} from 'lucide-react';
import type { PageTabKey } from './Navbar';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: PageTabKey;
  onTabChange: (tab: PageTabKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { usuari, logout } = useAuth();

  const handleNavClick = (tab: PageTabKey) => {
    onTabChange(tab);
    onCloseMobile();
  };

  // Bloquejar el desplaçament del fons quan la sidebar mòbil està oberta
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCloseMobile();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpenMobile, onCloseMobile]);

  return (
    <>
      {/* Overlay per a mòbils quan la sidebar està oberta */}
      {isOpenMobile && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`admin-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
        {/* Capçalera del Club */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img 
              src="/logo.png" 
              alt="C.D. Murense" 
              className="sidebar-brand-logo" 
            />
            <div className="sidebar-brand-text">
              <span className="sidebar-club-name">C.D. MURENSE</span>
              <span className="sidebar-sub-badge">Campus Estiu 2027</span>
            </div>
          </div>

          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={onCloseMobile}
            aria-label="Tancar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Targeta de perfil de l'staff */}
        <div className="sidebar-user-card">
          <div className="user-avatar-pill">
            {usuari?.nom_complet.charAt(0) || 'A'}
          </div>
          <div className="user-info-col">
            <span className="user-name">{usuari?.nom_complet || 'Coordinador'}</span>
            <span className="user-role-badge">{usuari?.rol || 'ADMIN'}</span>
          </div>
        </div>

        {/* Menú de navegació principal */}
        <div className="sidebar-nav-scroll">
          <span className="sidebar-section-title">GESTIÓ ESPORTIVA</span>
          <nav className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-link ${activeTab === 'inici' ? 'active' : ''}`}
              onClick={() => handleNavClick('inici')}
            >
              <Home size={18} />
              <span>Tauler d'Inici</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'admin-inscripcions' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin-inscripcions')}
            >
              <Users size={18} />
              <span>Llistat d'Inscrits</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'admin-assistencia' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin-assistencia')}
            >
              <CalendarCheck size={18} />
              <span>Assistència Diària</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'admin-pagos' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin-pagos')}
            >
              <CreditCard size={18} />
              <span>Control de Pagaments</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'admin-informes' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin-informes')}
            >
              <FileSpreadsheet size={18} />
              <span>Informes i Excel</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'admin-configuracio' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin-configuracio')}
            >
              <Settings size={18} />
              <span>Configuració del Club</span>
            </button>
          </nav>

          <span className="sidebar-section-title" style={{ marginTop: '24px' }}>
            PORTAL PÚBLIC
          </span>
          <nav className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-link ${activeTab === 'noticies' ? 'active' : ''}`}
              onClick={() => handleNavClick('noticies')}
            >
              <Bell size={18} />
              <span>Tauler de Notícies</span>
            </button>

            <button
              type="button"
              className={`sidebar-link ${activeTab === 'contacte' ? 'active' : ''}`}
              onClick={() => handleNavClick('contacte')}
            >
              <MessageSquare size={18} />
              <span>Bústia de Contacte</span>
            </button>
          </nav>
        </div>

        {/* Peu de la sidebar */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={logout}
          >
            <LogOut size={17} />
            <span>Tancar sessió</span>
          </button>
        </div>
      </aside>
    </>
  );
};
