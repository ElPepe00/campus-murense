// frontend/src/pages/public/CookiesPage.tsx
import React from 'react';
import { Cookie, Settings, Shield } from 'lucide-react';

interface CookiesPageProps {
  onNavigate?: (path: string) => void;
  onOpenCookieSettings?: () => void;
}

export const CookiesPage: React.FC<CookiesPageProps> = ({ onNavigate, onOpenCookieSettings }) => {
  return (
    <div className="legal-page-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Fil d'Ariadna */}
      <nav className="breadcrumbs" aria-label="Fil d'Ariadna">
        <a 
          href="/" 
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
        >
          Inici
        </a>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Política de Cookies</span>
      </nav>

      <div className="page-header-box" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#b45309', background: '#fef3c7', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
          <Cookie size={16} />
          <span>Gestió i Ús de Cookies</span>
        </div>
        <h1 className="page-main-title">Política de Cookies</h1>
        <p className="page-main-desc">
          Informació detallada sobre les galetes utilitzades en el portal del Campus C.D. Murense.
        </p>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '28px', color: '#334155', lineHeight: 1.7, fontSize: '14.5px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cookie size={20} color="var(--primary)" />
            1. Què és una Cookie?
          </h2>
          <p>
            Una galeta o cookie és un petit fitxer de text que es descarrega al navegador del vostre dispositiu quan visiteu determinades pàgines web. Permet emmagatzemar preferències de navegació, mantenir la sessió segura de l'equip de coordinació i millorar la velocitat de càrrega.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            2. Tipus de Cookies que utilitzam
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '14px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)', fontWeight: 700 }}>
                <Shield size={18} />
                <span>Cookies Tècniques i Essencials</span>
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                Estrictament necessàries per al funcionament de l'aplicació: manteniment de la sessió de staff, tokens de seguretat JWT i recordatori del consentiment de cookies. No es poden desactivar.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#059669', fontWeight: 700 }}>
                <Settings size={18} />
                <span>Cookies de Rendiment i Preferències</span>
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                Permeten recordar l'idioma seleccionat, millorar la fluïdesa del formulari d'inscripció i registrar mètriques anònimes d'ús per optimitzar el lloc web.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            3. Taula de Cookies Utilitzades
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 14px' }}>Nom</th>
                  <th style={{ padding: '10px 14px' }}>Tipus</th>
                  <th style={{ padding: '10px 14px' }}>Finalitat</th>
                  <th style={{ padding: '10px 14px' }}>Caducitat</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }}>murense_token</td>
                  <td style={{ padding: '10px 14px' }}>Tècnica (JWT)</td>
                  <td style={{ padding: '10px 14px' }}>Autenticació segura de l'equip coordinador a /admin</td>
                  <td style={{ padding: '10px 14px' }}>24 hores</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }}>murense_cookies_accepted</td>
                  <td style={{ padding: '10px 14px' }}>Preferència</td>
                  <td style={{ padding: '10px 14px' }}>Guarda l'estat del consentiment del banner de cookies</td>
                  <td style={{ padding: '10px 14px' }}>1 any</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            4. Com configurar o revocar el consentiment
          </h2>
          <p>
            Podeu modificar les vostres preferències de cookies en qualsevol moment fent clic al botó inferior de configuració, o bé configurant les opcions de privacitat del vostre navegador web (Chrome, Firefox, Safari o Edge).
          </p>
          {onOpenCookieSettings && (
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={onOpenCookieSettings}
              style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Settings size={17} />
              <span>Configurar preferències de Cookies ara</span>
            </button>
          )}
        </section>
      </div>

      {/* Enllaços de navegació relacionats */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '28px' }}>
        <a 
          href="/avis-legal" 
          className="btn-hero-secondary"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/avis-legal');
            }
          }}
          style={{ textDecoration: 'none' }}
        >
          Avís Legal
        </a>
        <a 
          href="/politica-privacitat" 
          className="btn-hero-secondary"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/politica-privacitat');
            }
          }}
          style={{ textDecoration: 'none' }}
        >
          Política de Privacitat
        </a>
      </div>
    </div>
  );
};

export default CookiesPage;
