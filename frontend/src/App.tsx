// frontend/src/App.tsx
import { useState, useEffect } from 'react';
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
import { fetchCampusStats, type CampusStats } from './api/campusApi';

/**
 * Component principal que gestiona l'enrutament intern (/ i /admin),
 * la càrrega d'estadístiques i la divisió estricta entre el portal de famílies i el panell d'staff.
 */
function MainAppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [activeTab, setActiveTab] = useState<PageTabKey>(() => {
    const path = window.location.pathname;
    if (path === '/inscripcio' || path.startsWith('/inscripcio')) {
      return 'inscripcio';
    }
    return 'inici';
  });
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [stats, setStats] = useState<CampusStats | undefined>(undefined);
  const { isLoggedIn, usuari, logout } = useAuth();

  const isAdminRoute = currentPath.startsWith('/admin');

  // Canvi de ruta amb l'API History del navegador (/inscripcio, /admin, /)
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setSelectedChildId(null);
    if (path === '/inscripcio' || path.startsWith('/inscripcio')) {
      setActiveTab('inscripcio');
    } else if (path === '/' || path === '/admin') {
      setActiveTab('inici');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Suport als botons d'avançar i retrocedir del navegador
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      setSelectedChildId(null);
      if (path === '/inscripcio' || path.startsWith('/inscripcio')) {
        setActiveTab('inscripcio');
      } else if (path === '/') {
        setActiveTab('inici');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Comprovació de disponibilitat de l'API de FastAPI
  useEffect(() => {
    fetch('http://localhost:8000/')
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
          .catch(() => {});
      } else {
        document.title = 'Campus C.D. Murense • Accés Staff';
      }
    } else if (currentPath === '/inscripcio' || activeTab === 'inscripcio') {
      document.title = "Campus C.D. Murense • Formulari d'Inscripció 2027";
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
    if (tab === 'inscripcio') {
      navigateTo('/inscripcio');
      return;
    }
    if (currentPath === '/inscripcio') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
    setActiveTab(tab);
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

        {activeTab === 'noticies' && <NewsPage />}
        {activeTab === 'contacte' && <ContactPage />}
      </main>

      {/* Peu de pàgina públic */}
      <footer className="site-footer">
        <div className="footer-container">
          <p>© 2027 Club Esportiu C.D. Murense • Campus d'Estiu. Tots els drets reservats.</p>
          <div className="footer-status-pill">
            <span className={`status-dot ${apiConnected ? 'green' : apiConnected === false ? 'red' : 'yellow'}`}></span>
            <span>
              {apiConnected ? 'Servidor Backend connectat' : apiConnected === false ? 'Backend desconnectat' : 'Connectant...'}
            </span>
          </div>
        </div>
      </footer>
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
