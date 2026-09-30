// frontend/src/pages/public/NotFoundPage.tsx
import { Home, Plus, MessageSquare, Bell } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate?: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="not-found-container" style={{ maxWidth: '720px', margin: '60px auto 100px', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '90px', height: '90px', borderRadius: '50%', background: '#eff6ff', color: 'var(--primary)', marginBottom: '24px' }}>
        <span style={{ fontSize: '38px', fontWeight: 900 }}>404</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
        Pàgina no trobada
      </h1>

      <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px', maxWidth: '520px', margin: '0 auto 32px' }}>
        Ho sentim, la direcció que cerques no existeix o s'ha mogut. Pots tornar a la pàgina d'inici o utilitzar algun dels enllaços següents:
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <a 
          href="/" 
          className="btn-hero-primary"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
          style={{ padding: '12px 24px', fontSize: '15px', textDecoration: 'none' }}
        >
          <Home size={18} />
          <span>Tornar a l'Inici</span>
        </a>

        <a 
          href="/inscripcio" 
          className="btn-hero-secondary"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/inscripcio');
            }
          }}
          style={{ padding: '12px 24px', fontSize: '15px', textDecoration: 'none' }}
        >
          <Plus size={18} />
          <span>Inscriure Alumne</span>
        </a>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <a 
          href="/noticies" 
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/noticies');
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
        >
          <Bell size={16} color="var(--primary)" />
          <span>Notícies i Avisos</span>
        </a>

        <a 
          href="/contacte" 
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/contacte');
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
        >
          <MessageSquare size={16} color="var(--primary)" />
          <span>Bústia de Contacte</span>
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
