// frontend/src/components/CookieBanner.tsx
import React, { useState, useEffect } from 'react';
import { Cookie, Check, Settings } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'murense_cookies_accepted';

interface CookieBannerProps {
  onNavigate?: (path: string) => void;
  isOpenExplicitly?: boolean;
  onCloseExplicit?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  onNavigate,
  isOpenExplicitly,
  onCloseExplicit,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    if (isOpenExplicitly) {
      setIsVisible(true);
      setShowConfig(true);
      return;
    }
    const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!saved) {
      // Retard subtil per no interrompre el primer render
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isOpenExplicitly]);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({ essential: true, analytics: true, date: Date.now() }));
    setIsVisible(false);
    setShowConfig(false);
    if (onCloseExplicit) onCloseExplicit();
  };

  const handleAcceptEssentialOnly = () => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({ essential: true, analytics: false, date: Date.now() }));
    setIsVisible(false);
    setShowConfig(false);
    if (onCloseExplicit) onCloseExplicit();
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({ essential: true, analytics: analyticsEnabled, date: Date.now() }));
    setIsVisible(false);
    setShowConfig(false);
    if (onCloseExplicit) onCloseExplicit();
  };

  if (!isVisible) return null;

  return (
    <aside 
      className="cookie-consent-bar"
      role="region"
      aria-label="Avís de consentiment de cookies"
    >
      <div className="cookie-consent-container">
        <div className="cookie-consent-main">
          <div className="cookie-consent-icon">
            <Cookie size={24} />
          </div>
          <div className="cookie-consent-text">
            <h3 className="cookie-consent-title">Utilitzam cookies per millorar la teva experiència</h3>
            <p className="cookie-consent-desc">
              Fem servir cookies tècniques per al funcionament de la plataforma d'inscripcions i mètriques anònimes per optimitzar la navegació. Pots acceptar-les totes o gestionar les teves preferències segons la nostra{' '}
              <a 
                href="/politica-cookies" 
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
                    e.preventDefault();
                    onNavigate('/politica-cookies');
                  }
                }}
                className="cookie-link"
              >
                Política de Cookies
              </a>.
            </p>
          </div>
        </div>

        {showConfig && (
          <div className="cookie-config-modal-box">
            <div className="cookie-config-item">
              <div>
                <strong>Cookies Tècniques (Obligatòries)</strong>
                <p>Necessàries per a mantenir les sessions, seguretat i navegació bàsica.</p>
              </div>
              <span className="badge-essential">Sempre actives</span>
            </div>

            <div className="cookie-config-item">
              <div>
                <strong>Mètriques de Rendiment Anònimes</strong>
                <p>Ajuden a saber quines seccions són més visitades per millorar la velocitat.</p>
              </div>
              <label className="cookie-toggle-switch">
                <input 
                  type="checkbox" 
                  checked={analyticsEnabled} 
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        )}

        <div className="cookie-consent-actions">
          {showConfig ? (
            <>
              <button 
                type="button" 
                className="btn-cookie-accept"
                onClick={handleSavePreferences}
              >
                <Check size={16} />
                <span>Desar preferències</span>
              </button>
              <button 
                type="button" 
                className="btn-cookie-ghost"
                onClick={() => setShowConfig(false)}
              >
                Tornar
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                className="btn-cookie-accept"
                onClick={handleAcceptAll}
              >
                <Check size={16} />
                <span>Acceptar totes</span>
              </button>
              <button 
                type="button" 
                className="btn-cookie-secondary"
                onClick={handleAcceptEssentialOnly}
              >
                Només essencials
              </button>
              <button 
                type="button" 
                className="btn-cookie-ghost"
                onClick={() => setShowConfig(true)}
              >
                <Settings size={15} />
                <span>Configurar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
