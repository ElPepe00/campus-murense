// frontend/src/pages/admin/SettingsPage.tsx
import React from 'react';
import { 
  Building, 
  Users, 
  UserCheck, 
  Bell, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Pantalla de configuració general del club, paràmetres del campus i comptes tècnics (Pantalla 8).
 */
export const SettingsPage: React.FC = () => {
  const { usuari } = useAuth();

  return (
    <div className="admin-page-container" style={{ maxWidth: '780px' }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Configuració del Campus</h1>
          <p className="admin-page-subtitle">Paràmetres oficials, grups d'edat i equip tècnic</p>
        </div>
      </div>

      {/* Estat de l'usuari actual connectat */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#eff6ff',
            color: '#0066f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{usuari?.nom_complet || 'Coordinador Campus'}</strong>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{usuari?.email} • Rol: {usuari?.rol}</p>
          </div>
        </div>

        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          background: '#ecfdf5',
          color: '#065f46',
          padding: '5px 12px',
          borderRadius: '999px'
        }}>
          Actiu
        </span>
      </div>

      {/* Llista d'opcions de configuració del campus */}
      <div className="menu-list" style={{ boxShadow: 'var(--shadow-card)', borderRadius: '16px' }}>
        <div 
          className="menu-item"
          onClick={() => alert('Campus d\'Estiu 2027: 23 de Juny a 31 de Juliol. Horari: 9:00h a 14:00h (Matinera 7:45h, Menjador fins 15:30h). Preu setmana: 40€.')}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#eff6ff', color: '#0066f5' }}>
              <Building size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Dades del campus</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Dates oficials, horaris de menjador, preus i quotes</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>

        <div 
          className="menu-item"
          onClick={() => alert('Grups configurats: Grup A (4-7 anys), Grup B (8-10 anys), Grup C (11-14 anys).')}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Users size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Grups i categories</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Configuració de ràtios i edats (Grups A, B i C)</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>

        <div 
          className="menu-item"
          onClick={() => alert('Equip del club: 1 Administrador/Coordinador i 4 monitors assignats.')}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Usuaris i monitors</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Monitors autoritzats a passar llista i coordinadors</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>

        <div 
          className="menu-item"
          onClick={() => alert('Canal de comunicació: Notificacions per email i missatgeria interna habilitades.')}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <Bell size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Notificacions</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Avisos automàtics de pagaments pendents a les famílies</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>

        <div 
          className="menu-item"
          onClick={() => alert('Informació legal: Política de privacitat i protecció de dades (RGPD) segons la normativa de la Federació de Futbol de les Illes Balears.')}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Informació legal i RGPD</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Protecció de dades de menors i consentiment mèdic</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
