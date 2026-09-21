import React from 'react';
import { Home, Users, CalendarCheck, CreditCard, MoreHorizontal } from 'lucide-react';

export type TabKey = 'inicio' | 'inscritos' | 'asistencia' | 'pagos' | 'mas';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bottom-nav" aria-label="Navegación inferior">
      <button
        type="button"
        className={`nav-tab ${activeTab === 'inicio' ? 'active' : ''}`}
        onClick={() => onTabChange('inicio')}
      >
        <Home size={21} strokeWidth={activeTab === 'inicio' ? 2.5 : 2} />
        <span>Inicio</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'inscritos' ? 'active' : ''}`}
        onClick={() => onTabChange('inscritos')}
      >
        <Users size={21} strokeWidth={activeTab === 'inscritos' ? 2.5 : 2} />
        <span>Inscritos</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'asistencia' ? 'active' : ''}`}
        onClick={() => onTabChange('asistencia')}
      >
        <CalendarCheck size={21} strokeWidth={activeTab === 'asistencia' ? 2.5 : 2} />
        <span>Asistencia</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'pagos' ? 'active' : ''}`}
        onClick={() => onTabChange('pagos')}
      >
        <CreditCard size={21} strokeWidth={activeTab === 'pagos' ? 2.5 : 2} />
        <span>Pagos</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'mas' ? 'active' : ''}`}
        onClick={() => onTabChange('mas')}
      >
        <MoreHorizontal size={21} strokeWidth={activeTab === 'mas' ? 2.5 : 2} />
        <span>Más</span>
      </button>
    </nav>
  );
};
