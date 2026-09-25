// frontend/src/components/AdminTopBar.tsx
import React from 'react';
import { Menu, Globe } from 'lucide-react';
import type { PageTabKey } from './Navbar';

interface AdminTopBarProps {
  activeTab: PageTabKey;
  onToggleSidebar: () => void;
  onViewPublicSite: () => void;
  apiConnected?: boolean | null;
}

const TAB_TITLES: { [key in PageTabKey]?: string } = {
  'inici': "Tauler d'Inici",
  'admin-inscripcions': "Llistat d'Inscrits",
  'admin-assistencia': "Control d'Assistència Diària",
  'admin-pagos': "Control de Pagaments i Quotes",
  'admin-informes': "Informes i Exportació",
  'admin-configuracio': "Configuració del Campus",
  'inscripcio': "Formulari d'Inscripció",
  'noticies': "Tauler de Notícies",
  'contacte': "Bústia de Contacte",
};

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  activeTab,
  onToggleSidebar,
  onViewPublicSite,
  apiConnected,
}) => {
  const currentTitle = TAB_TITLES[activeTab] || "Panell de Gestió";

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          aria-label="Obrir menú lateral"
        >
          <Menu size={22} />
        </button>

        <div className="admin-breadcrumb">
          <img 
            src="/logo.png" 
            alt="C.D. Murense" 
            className="topbar-mini-logo" 
          />
          <span className="breadcrumb-sub">Campus C.D. Murense</span>
          <span className="breadcrumb-separator">/</span>
          <h1 className="breadcrumb-current">{currentTitle}</h1>
        </div>
      </div>

      <div className="admin-topbar-right">
        {/* Indicador de connexió */}
        <div className="topbar-status-badge">
          {apiConnected ? (
            <>
              <span className="status-dot green"></span>
              <span className="status-text-pill">Sistema en línia</span>
            </>
          ) : (
            <>
              <span className="status-dot red"></span>
              <span className="status-text-pill">Sense connexió</span>
            </>
          )}
        </div>

        {/* Botó per veure la web pública */}
        <button
          type="button"
          className="btn-topbar-ghost"
          onClick={onViewPublicSite}
          title="Veure portal públic per a famílies"
        >
          <Globe size={16} />
          <span className="hide-on-mobile">Web Pública</span>
        </button>
      </div>
    </header>
  );
};
