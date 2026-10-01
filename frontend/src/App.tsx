// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, type PageTabKey } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AdminTopBar } from './components/AdminTopBar';
import { HomePage } from './pages/public/HomePage';
import { RegistrationWizard } from './pages/public/registration/RegistrationWizard';
import { NewsPage } from './pages/public/NewsPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { StudentDetailPage } from './pages/admin/StudentDetailPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { NoticiesManagementPage } from './pages/admin/NoticiesManagementPage';
import { LegalPage } from './pages/public/LegalPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { CookiesPage } from './pages/public/CookiesPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { CookieBanner } from './components/CookieBanner';
import { WhatsAppButton } from './components/WhatsAppButton';
import { trackPageView } from './utils/analytics';
import { fetchCampusStats, type CampusStats } from './api/campusApi';
import { API_BASE_URL } from './api/client';

function getTabFromPath(path: string): PageTabKey {
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  if (cleanPath === '/' || cleanPath === '') {
    return 'inici';
  }
  if (cleanPath === '/inscripcio' || cleanPath.startsWith('/inscripcio/')) {
    return 'inscripcio';
  }
  if (cleanPath === '/noticies' || cleanPath.startsWith('/noticies/')) {
    return 'noticies';
  }
  if (cleanPath === '/contacte' || cleanPath.startsWith('/contacte/')) {
    return 'contacte';
  }
  if (cleanPath === '/avis-legal' || cleanPath === '/aviso-legal') {
    return 'avis-legal';
  }
  if (cleanPath === '/politica-privacitat' || cleanPath === '/privacitat' || cleanPath === '/privacidad') {
    return 'politica-privacitat';
  }
  if (cleanPath === '/politica-cookies' || cleanPath === '/cookies') {
    return 'politica-cookies';
  }
  if (cleanPath === '/admin' || cleanPath === '/admin/inici') {
    return 'inici';
  }
  if (cleanPath === '/admin/llistat-inscrits') return 'admin-inscripcions';
  if (cleanPath === '/admin/assistencia') return 'admin-assistencia';
  if (cleanPath === '/admin/pagaments') return 'admin-pagos';
  if (cleanPath === '/admin/informes') return 'admin-informes';
  if (cleanPath === '/admin/configuracio') return 'admin-configuracio';
  if (cleanPath === '/admin/gestio-noticies') return 'admin-noticies';

  return 'not-found';
}

/**
 * Component principal que gestiona l'enrutament intern (/ i /admin),
 * la càrrega d'estadístiques i la divisió estricta entre el portal de famílies i el panell d'staff.
 */
function MainAppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [activeTab, setActiveTab] = useState<PageTabKey>(() => getTabFromPath(window.location.pathname));
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState<boolean>(false);
  const [cookieModalOpen, setCookieModalOpen] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [stats, setStats] = useState<CampusStats | undefined>(undefined);
  const { isLoggedIn, usuari, logout } = useAuth();

  const isAdminRoute = currentPath.startsWith('/admin');

  // Canvi de ruta amb l'API History del navegador (/inscripcio, /noticies, /contacte, /admin, /)
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setSelectedChildId(null);
    setActiveTab(getTabFromPath(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Suport als botons d'avançar i retrocedir del navegador
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      setSelectedChildId(null);
      setActiveTab(getTabFromPath(path));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Registre analític de visualització de pàgina respectant el consentiment
  useEffect(() => {
    trackPageView(currentPath);
  }, [currentPath]);

  // Comprovació de disponibilitat de l'API de FastAPI
  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setApiConnected(true);
        }
      })
      .catch(() => {
        setApiConnected(false);
      });
  }, []);

  // Gestió del títol de la pestanya del navegador segons la ruta
  useEffect(() => {
    if (isAdminRoute) {
      if (isLoggedIn) {
        document.title = 'Campus C.D. Murense • Panell Staff';
        fetchCampusStats()
          .then((data) => setStats(data))
          .catch(() => { });
      } else {
        document.title = 'Campus C.D. Murense • Accés Staff';
      }
    } else if (currentPath === '/inscripcio' || activeTab === 'inscripcio') {
      document.title = "Campus C.D. Murense • Formulari d'Inscripció 2027";
    } else if (currentPath === '/noticies' || activeTab === 'noticies') {
      document.title = "Campus C.D. Murense • Notícies i Novetats";
    } else if (currentPath === '/contacte' || activeTab === 'contacte') {
      document.title = "Campus C.D. Murense • Contacte i Atenció";
    } else if (currentPath === '/avis-legal' || activeTab === 'avis-legal') {
      document.title = "Campus C.D. Murense • Avís Legal";
    } else if (currentPath === '/politica-privacitat' || activeTab === 'politica-privacitat') {
      document.title = "Campus C.D. Murense • Política de Privacitat";
    } else if (currentPath === '/politica-cookies' || activeTab === 'politica-cookies') {
      document.title = "Campus C.D. Murense • Política de Cookies";
    } else if (activeTab === 'not-found') {
      document.title = "Pàgina No Trobada (404) • Campus C.D. Murense";
    } else {
      document.title = "Campus C.D. Murense • Campus d'Estiu 2027";
    }
  }, [isAdminRoute, isLoggedIn, activeTab, currentPath]);

  const handleInscripcioSuccess = (_idInscripcio: number) => {
    alert('Inscripció guardada correctament! Aviat rebràs la confirmació oficial.');
    navigateTo('/');
  };

  const handleSelectChild = (id: number) => {
    setSelectedChildId(id);
  };

  const handleTabChange = (tab: PageTabKey) => {
    setSelectedChildId(null);

    if (isAdminRoute) {
      if (tab === 'inici') navigateTo('/admin');
      else if (tab === 'admin-inscripcions') navigateTo('/admin/llistat-inscrits');
      else if (tab === 'admin-assistencia') navigateTo('/admin/assistencia');
      else if (tab === 'admin-pagos') navigateTo('/admin/pagaments');
      else if (tab === 'admin-informes') navigateTo('/admin/informes');
      else if (tab === 'admin-configuracio') navigateTo('/admin/configuracio');
      else if (tab === 'admin-noticies') navigateTo('/admin/gestio-noticies');
      return;
    }

    // Rutes de navegació de la web pública per a famílies
    if (tab === 'inscripcio') navigateTo('/inscripcio');
    else if (tab === 'noticies') navigateTo('/noticies');
    else if (tab === 'contacte') navigateTo('/contacte');
    else if (tab === 'avis-legal') navigateTo('/avis-legal');
    else if (tab === 'politica-privacitat') navigateTo('/politica-privacitat');
    else if (tab === 'politica-cookies') navigateTo('/politica-cookies');
    else if (tab === 'inici') navigateTo('/');
    else setActiveTab(tab);
  };

  // =========================================================================
  // VISTA A: RUTA D'ADMINISTRACIÓ (/admin)
  // =========================================================================
  if (isAdminRoute) {
    // Si l'usuari no està autenticat, mostrem la pàgina d'inici de sessió dedicada
    if (!isLoggedIn) {
      return (
        <LoginPage
          isFullPage
          onSuccess={() => navigateTo('/admin')}
          onCancel={() => navigateTo('/')}
        />
      );
    }

    // Panell d'administració complet per a coordinadors i monitors
    return (
      <div className="admin-layout-wrapper">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpenMobile={sidebarOpenMobile}
          onCloseMobile={() => setSidebarOpenMobile(false)}
        />

        <div className="admin-main-wrapper">
          <AdminTopBar
            activeTab={activeTab}
            onToggleSidebar={() => setSidebarOpenMobile(!sidebarOpenMobile)}
            onViewPublicSite={() => {
              setActiveTab('inici');
              navigateTo('/');
            }}
            onNavigateHome={() => handleTabChange('inici')}
            apiConnected={apiConnected}
          />

          <main className="main-content admin-main-content">
            {activeTab === 'inici' && (
              <DashboardPage
                onNavigateTab={handleTabChange}
                stats={stats}
              />
            )}

            {activeTab === 'admin-inscripcions' && (
              selectedChildId ? (
                <StudentDetailPage
                  childId={selectedChildId}
                  onBack={() => setSelectedChildId(null)}
                />
              ) : (
                <StudentsPage
                  onSelectChild={handleSelectChild}
                />
              )
            )}

            {activeTab === 'admin-assistencia' && <AttendancePage />}
            {activeTab === 'admin-pagos' && <PaymentsPage />}
            {activeTab === 'admin-informes' && <ReportsPage />}
            {activeTab === 'admin-configuracio' && <SettingsPage />}
            {activeTab === 'admin-noticies' && <NoticiesManagementPage />}
            {activeTab === 'inscripcio' && (
              <RegistrationWizard
                onCancel={() => handleTabChange('inici')}
                onSuccess={handleInscripcioSuccess}
              />
            )}
            {activeTab === 'noticies' && <NewsPage />}
            {activeTab === 'contacte' && <ContactPage />}
          </main>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA B: RUTA PÚBLICA (PORTAL PER A FAMÍLIES I VISITANTS)
  // =========================================================================
  return (
    <div className="app-wrapper">
      {/* Si l'administrador està autenticat a la web pública, li mostrem la barra d'accés ràpid a /admin */}
      {isLoggedIn && (
        <aside className="staff-preview-banner" aria-label="Avís de sessió activa">
          <div className="staff-preview-content">
            <span>🛡️ Sessió d'administrador iniciada: <strong>{usuari?.nom_complet}</strong></span>
            <div className="staff-preview-actions">
              <button
                type="button"
                className="btn-staff-pill"
                onClick={() => navigateTo('/admin')}
              >
                Anar al Panell d'Administració (/admin)
              </button>
              <button
                type="button"
                className="btn-staff-ghost"
                onClick={() => {
                  logout();
                  navigateTo('/');
                }}
              >
                Tancar sessió
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Barra de navegació pública */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNavigateToRegistration={() => navigateTo('/inscripcio')}
      />

      {/* Contingut públic */}
      <main className="main-content">
        {activeTab === 'inici' && (
          <HomePage
            onNavigateToRegistration={() => navigateTo('/inscripcio')}
            onNavigateTab={handleTabChange}
            apiConnected={apiConnected}
          />
        )}

        {activeTab === 'inscripcio' && (
          <RegistrationWizard
            onCancel={() => navigateTo('/')}
            onSuccess={handleInscripcioSuccess}
          />
        )}

        {activeTab === 'noticies' && <NewsPage onNavigate={navigateTo} />}
        {activeTab === 'contacte' && <ContactPage onNavigate={navigateTo} />}
        {activeTab === 'avis-legal' && <LegalPage onNavigate={navigateTo} />}
        {activeTab === 'politica-privacitat' && <PrivacyPage onNavigate={navigateTo} />}
        {activeTab === 'politica-cookies' && (
          <CookiesPage 
            onNavigate={navigateTo} 
            onOpenCookieSettings={() => setCookieModalOpen(true)} 
          />
        )}
        {activeTab === 'not-found' && <NotFoundPage onNavigate={navigateTo} />}
      </main>

      {/* Peu de pàgina públic */}
      <footer className="site-footer">
        <div className="footer-container">
          <p>© 2027 Club Esportiu C.D. Murense • Campus d'Estiu. Tots els drets reservats.</p>
          <div className="footer-links-group">
            <a
              href="/"
              className="footer-nav-link"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  navigateTo('/');
                }
              }}
            >
              Inici
            </a>
            <a
              href="/noticies"
              className="footer-nav-link"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  navigateTo('/noticies');
                }
              }}
            >
              Notícies
            </a>
            <a
              href="/contacte"
              className="footer-nav-link"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  navigateTo('/contacte');
                }
              }}
            >
              Contacte
            </a>
            <a
              href="/inscripcio"
              className="footer-nav-link"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  navigateTo('/inscripcio');
                }
              }}
            >
              Inscripció
            </a>
            <a
              href="/avis-legal"
              className="footer-nav-link"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  navigateTo('/avis-legal');
                }
              }}
            >
              Avís Legal
            </a>
            <a
              href="/politica-privacitat"
              className="footer-nav-link"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  navigateTo('/politica-privacitat');
                }
              }}
            >
              Privacitat
            </a>
            <a
              href="/politica-cookies"
              className="footer-nav-link"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  navigateTo('/politica-cookies');
                }
              }}
            >
              Cookies
            </a>
            <button
              type="button"
              className="footer-cookie-btn"
              onClick={() => setCookieModalOpen(true)}
              title="Configurar el consentiment de galetes"
            >
              Preferències Cookies
            </button>
            <a
              href="/admin"
              className="footer-staff-link"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  navigateTo('/admin');
                }
              }}
              title="Accés Staff i Panell de Gestió"
            >
              <ShieldCheck size={14} />
              <span>Accés Staff</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Banner de consentiment de Cookies (RGPD / LSSI) */}
      <CookieBanner
        onNavigate={navigateTo}
        isOpenExplicitly={cookieModalOpen}
        onCloseExplicit={() => setCookieModalOpen(false)}
      />

      {/* Botó flotant directe de WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
