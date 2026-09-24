// frontend/src/components/MobileBottomNav.tsx
import React from 'react';
import { Home, PlusCircle, Bell, MessageSquare, Users, CalendarCheck } from 'lucide-react';
import type { PageTabKey } from './Navbar';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeTab: PageTabKey;
  onTabChange: (tab: PageTabKey) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return (
      <nav className="mobile-bottom-nav" aria-label="Navegació mòbil d'administració">
        <button
          type="button"
          className={`nav-tab-mobile ${activeTab === 'inici' ? 'active' : ''}`}
          onClick={() => onTabChange('inici')}
        >
          <Home size={19} strokeWidth={activeTab === 'inici' ? 2.5 : 2} />
          <span>Inici</span>
        </button>

        <button
          type="button"
          className={`nav-tab-mobile ${activeTab === 'admin-inscripcions' ? 'active' : ''}`}
          onClick={() => onTabChange('admin-inscripcions')}
        >
          <Users size={19} strokeWidth={activeTab === 'admin-inscripcions' ? 2.5 : 2} />
          <span>Inscrits</span>
        </button>

        <button
          type="button"
          className={`nav-tab-mobile ${activeTab === 'admin-assistencia' ? 'active' : ''}`}
          onClick={() => onTabChange('admin-assistencia')}
        >
          <CalendarCheck size={19} strokeWidth={activeTab === 'admin-assistencia' ? 2.5 : 2} />
          <span>Assistència</span>
        </button>

        <button
          type="button"
          className={`nav-tab-mobile ${activeTab === 'inscripcio' ? 'active' : ''}`}
          onClick={() => onTabChange('inscripcio')}
        >
          <PlusCircle size={19} strokeWidth={activeTab === 'inscripcio' ? 2.5 : 2} />
          <span>Inscripció</span>
        </button>
      </nav>
    );
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegació mòbil pública">
      <button
        type="button"
        className={`nav-tab-mobile ${activeTab === 'inici' ? 'active' : ''}`}
        onClick={() => onTabChange('inici')}
      >
        <Home size={19} strokeWidth={activeTab === 'inici' ? 2.5 : 2} />
        <span>Inici</span>
      </button>

      <button
        type="button"
        className={`nav-tab-mobile ${activeTab === 'inscripcio' ? 'active' : ''}`}
        onClick={() => onTabChange('inscripcio')}
      >
        <PlusCircle size={19} strokeWidth={activeTab === 'inscripcio' ? 2.5 : 2} />
        <span>Inscriure's</span>
      </button>

      <button
        type="button"
        className={`nav-tab-mobile ${activeTab === 'noticies' ? 'active' : ''}`}
        onClick={() => onTabChange('noticies')}
      >
        <Bell size={19} strokeWidth={activeTab === 'noticies' ? 2.5 : 2} />
        <span>Notícies</span>
      </button>

      <button
        type="button"
        className={`nav-tab-mobile ${activeTab === 'contacte' ? 'active' : ''}`}
        onClick={() => onTabChange('contacte')}
      >
        <MessageSquare size={19} strokeWidth={activeTab === 'contacte' ? 2.5 : 2} />
        <span>Contacte</span>
      </button>
    </nav>
  );
};
