// frontend/src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Menu,
  Bell,
  MessageSquare,
  X
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
  onNavigateToRegistration?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onToggleMobileMenu,
  onNavigateToRegistration,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Controlar obertura de menú (externa o interna)
  const handleOpenMobileMenu = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    }
    setMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleSelectTab = (tab: PageTabKey) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const handleGoToRegistration = () => {
    setMobileMenuOpen(false);
    if (onNavigateToRegistration) {
      onNavigateToRegistration();
    } else {
      onTabChange('inscripcio');
    }
  };

  // Bloquejar l'scroll de fons quan el menú lateral està obert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
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
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* Brand Group */}
          <div 
            className="brand-group"
            onClick={() => handleSelectTab('inici')}
            role="button"
            tabIndex={0}
          >
            <img 
              src="/logo.png" 
              alt="Escut oficial C.D. Murense" 
              className="brand-logo-img" 
            />
            <div className="brand-text-col">
              <span className="brand-title-main">CAMPUS C.D. MURENSE</span>
              <span className="brand-subtitle-tag">Campus d'Estiu 2027</span>
            </div>
          </div>

          {/* Desktop Nav Links (Portal Públic Net - Sense secció repetida d'inscripció) */}
          <nav className="nav-links" aria-label="Navegació principal">
            <button
              type="button"
              className={`nav-link-btn ${activeTab === 'inici' ? 'active' : ''}`}
              onClick={() => handleSelectTab('inici')}
            >
              <Home size={17} />
              <span>Inici</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === 'noticies' ? 'active' : ''}`}
              onClick={() => handleSelectTab('noticies')}
            >
              <Bell size={17} />
              <span>Notícies</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === 'contacte' ? 'active' : ''}`}
              onClick={() => handleSelectTab('contacte')}
            >
              <MessageSquare size={17} />
              <span>Contacte</span>
            </button>
          </nav>

          {/* Navbar Actions: Únic botó blau d'inscripció al header redirigit a /inscripcio */}
          <div className="navbar-actions">
            <a
              href="/inscripcio"
              className="btn-navbar-cta"
              id="btn-navbar-inscriute"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleGoToRegistration();
                }
              }}
            >
              <Plus size={18} strokeWidth={2.6} />
              <span>Inscriu-te ara</span>
            </a>

            <button
              type="button"
              className="btn-mobile-menu"
              aria-label="Obrir menú lateral"
              onClick={handleOpenMobileMenu}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Menú lateral mòbil (Slide-over drawer) */}
      {mobileMenuOpen && (
        <div 
          className="public-mobile-backdrop" 
          onClick={handleCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`public-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-label="Menú lateral de navegació"
      >
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <img 
              src="/logo.png" 
              alt="C.D. Murense" 
              className="mobile-drawer-logo" 
            />
            <div className="mobile-drawer-brand-text">
              <span className="mobile-drawer-club-title">C.D. MURENSE</span>
              <span className="mobile-drawer-club-sub">Campus d'Estiu 2027</span>
            </div>
          </div>

          <button
            type="button"
            className="mobile-drawer-close"
            onClick={handleCloseMobileMenu}
            aria-label="Tancar menú lateral"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mobile-drawer-nav" aria-label="Navegació mòbil">
          <button
            type="button"
            className={`mobile-drawer-item ${activeTab === 'inici' ? 'active' : ''}`}
            onClick={() => handleSelectTab('inici')}
          >
            <div className="mobile-drawer-icon-wrap">
              <Home size={20} />
            </div>
            <span>Inici</span>
          </button>

          <button
            type="button"
            className={`mobile-drawer-item ${activeTab === 'noticies' ? 'active' : ''}`}
            onClick={() => handleSelectTab('noticies')}
          >
            <div className="mobile-drawer-icon-wrap">
              <Bell size={20} />
            </div>
            <span>Notícies</span>
          </button>

          <button
            type="button"
            className={`mobile-drawer-item ${activeTab === 'contacte' ? 'active' : ''}`}
            onClick={() => handleSelectTab('contacte')}
          >
            <div className="mobile-drawer-icon-wrap">
              <MessageSquare size={20} />
            </div>
            <span>Contacte</span>
          </button>
        </nav>

        <div className="mobile-drawer-cta-section">
          <a
            href="/inscripcio"
            className="btn-mobile-drawer-cta"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                handleGoToRegistration();
              } else {
                handleCloseMobileMenu();
              }
            }}
          >
            <Plus size={18} strokeWidth={2.8} />
            <span>Inscriu-te ara</span>
          </a>
        </div>

        <div className="mobile-drawer-footer">
          <span className="mobile-drawer-footer-text">
            © 2027 Club Esportiu C.D. Murense
          </span>
        </div>
      </aside>
    </>
  );
};
