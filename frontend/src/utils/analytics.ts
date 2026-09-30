// frontend/src/utils/analytics.ts

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

const COOKIE_STORAGE_KEY = 'murense_cookies_accepted';

/**
 * Comprova si l'usuari ha acceptat les galetes d'anàlisi
 */
export function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

/**
 * Registra una visualització de pàgina respectant el consentiment
 */
export function trackPageView(path: string) {
  if (!hasAnalyticsConsent()) return;

  try {
    // Suport per a Google Analytics (GA4)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
      });
    }

    // Suport per a Plausible Analytics
    if (typeof window.plausible === 'function') {
      window.plausible('pageview', { props: { path } });
    }

    // Registre local en mode desenvolupament
    if (import.meta.env.DEV) {
      console.log(`[Analytics] PageView: ${path}`);
    }
  } catch (err) {
    // Silenciós per a no afectar l'execució de l'aplicació
  }
}

/**
 * Registra una acció o conversió clau (ex: clic a WhatsApp, inscripció iniciada, enviament de contacte)
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!hasAnalyticsConsent()) return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, properties);
    }

    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: properties });
    }

    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event: ${eventName}`, properties);
    }
  } catch {
    // Ignorar errors de telemetria
  }
}
