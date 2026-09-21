// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, type PageTabKey } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Sidebar } from './components/Sidebar';
import { AdminTopBar } from './components/AdminTopBar';
import { HomeScreen } from './screens/HomeScreen';
import { InscripcionWizard } from './pages/public/inscripcion/InscripcionWizard';
import { NoticiasPage } from './pages/public/NoticiasPage';
import { ContactoPage } from './pages/public/ContactoPage';
import { LoginPage } from './pages/public/LoginPage';
import { InscritosPage } from './pages/admin/InscritosPage';
import { FichaNenPage } from './pages/admin/FichaNenPage';
import { AsistenciaPage } from './pages/admin/AsistenciaPage';
import { PagosPage } from './pages/admin/PagosPage';
import { InformesPage } from './pages/admin/InformesPage';
import { ConfigPage } from './pages/admin/ConfigPage';
import { fetchCampusStats, type CampusStats } from './api/campusApi';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<PageTabKey>('inici');
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [stats, setStats] = useState<CampusStats | undefined>(undefined);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // Comprovar connexió amb el backend de FastAPI
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

  useEffect(() => {
    if (isLoggedIn) {
      document.title = 'Campus C.D. Murense • Panell Staff';
      fetchCampusStats()
        .then((data) => setStats(data))
        .catch(() => {});
    } else {
      document.title = "Campus C.D. Murense • Campus d'Estiu 2027";
    }
  }, [isLoggedIn, activeTab]);

  const handleInscripcioSuccess = (_idInscripcio: number) => {
    alert('Inscripció guardada correctament! Aviat rebràs la confirmació.');
    setActiveTab('inici');
  };

  const handleSelectChild = (id: number) => {
    setSelectedChildId(id);
  };

  const handleTabChange = (tab: PageTabKey) => {
    setSelectedChildId(null);
    setActiveTab(tab);
  };

  // Renderitzador del contingut central
  const renderScreenContent = () => {
    if (activeTab === 'inici') {
      return (
        <HomeScreen 
          onNavigateToInscripcion={() => setActiveTab('inscripcio')}
          onNavigateTab={handleTabChange}
          onOpenLogin={() => setShowLoginModal(true)}
          apiConnected={apiConnected}
          stats={stats}
        />
      );
    }

    if (activeTab === 'inscripcio') {
      return (
        <InscripcionWizard 
          onCancel={() => setActiveTab('inici')}
          onSuccess={handleInscripcioSuccess}
        />
      );
    }

    if (activeTab === 'noticies') {
      return <NoticiasPage />;
    }

    if (activeTab === 'contacte') {
      return <ContactoPage />;
    }

    if (activeTab === 'admin-inscripcions') {
      return isLoggedIn ? (
        selectedChildId ? (
          <FichaNenPage 
            childId={selectedChildId} 
            onBack={() => setSelectedChildId(null)} 
          />
        ) : (
          <InscritosPage 
            onSelectChild={handleSelectChild}
            onNewInscripcion={() => setActiveTab('inscripcio')}
          />
        )
      ) : (
        <RequireLoginPrompt onOpenLogin={() => setShowLoginModal(true)} />
      );
    }

    if (activeTab === 'admin-assistencia') {
      return isLoggedIn ? (
        <AsistenciaPage />
      ) : (
        <RequireLoginPrompt onOpenLogin={() => setShowLoginModal(true)} />
      );
    }

    if (activeTab === 'admin-pagos') {
      return isLoggedIn ? (
        <PagosPage />
      ) : (
        <RequireLoginPrompt onOpenLogin={() => setShowLoginModal(true)} />
      );
    }

    if (activeTab === 'admin-informes') {
      return isLoggedIn ? (
        <InformesPage />
      ) : (
        <RequireLoginPrompt onOpenLogin={() => setShowLoginModal(true)} />
      );
    }

    if (activeTab === 'admin-configuracio') {
      return isLoggedIn ? (
        <ConfigPage />
      ) : (
        <RequireLoginPrompt onOpenLogin={() => setShowLoginModal(true)} />
      );
    }

    return null;
  };

  // =========================================================================
  // VISTA A: SI L'ADMIN / STAFF ESTÀ LOGUEJAT -> LAYOUT PROFESSIONAL AMB SIDEBAR
  // =========================================================================
  if (isLoggedIn) {
    return (
      <div className="admin-layout-wrapper">
        {/* Sidebar Lateral amb tota la gestió del club */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onNewInscripcion={() => handleTabChange('inscripcio')}
          isOpenMobile={sidebarOpenMobile}
          onCloseMobile={() => setSidebarOpenMobile(false)}
        />

        {/* Àrea Principal de Treball */}
        <div className="admin-main-wrapper">
          {/* Header Superior Net i Espaiós */}
          <AdminTopBar 
            activeTab={activeTab}
            onToggleSidebar={() => setSidebarOpenMobile(!sidebarOpenMobile)}
            onNewInscripcion={() => handleTabChange('inscripcio')}
            onViewPublicSite={() => handleTabChange('inici')}
            apiConnected={apiConnected}
          />

          {/* Contingut del panell */}
          <main className="main-content" style={{ maxWidth: '100%', padding: '28px 32px 60px' }}>
            {renderScreenContent()}
          </main>
        </div>

        {showLoginModal && (
          <LoginPage 
            onSuccess={() => setShowLoginModal(false)}
            onCancel={() => setShowLoginModal(false)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // VISTA B: SI ÉS UN USUARI PÚBLIC / FAMÍLIA -> WEB PÚBLICA NORMAL AMB NAVBAR
  // =========================================================================
  return (
    <div className="app-wrapper">
      {/* Barra de navegació pública neta */}
      <Navbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenLogin={() => setShowLoginModal(true)}
        onToggleMobileMenu={() => alert('Campus C.D. Murense')}
      />

      {/* Contingut públic */}
      <main className="main-content">
        {renderScreenContent()}
      </main>

      {/* Modal d'accés staff */}
      {showLoginModal && (
        <LoginPage 
          onSuccess={() => {
            setShowLoginModal(false);
            setActiveTab('inici');
          }}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      {/* Peu de pàgina net */}
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

      {/* Barra inferior per a mòbils */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenLogin={() => setShowLoginModal(true)}
      />
    </div>
  );
}

function RequireLoginPrompt({ onOpenLogin }: { onOpenLogin: () => void }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '48px 24px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '40px auto',
      boxShadow: 'var(--shadow-card)'
    }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
        Accés Restringit
      </h2>
      <p style={{ fontSize: '14.5px', color: '#64748b', marginBottom: '24px' }}>
        Aquesta àrea és d'ús exclusiu per a l'equip de coordinació i monitors del C.D. Murense.
      </p>
      <button
        type="button"
        className="btn-hero-primary"
        style={{ margin: '0 auto' }}
        onClick={onOpenLogin}
      >
        Identificar-se com a Staff
      </button>
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
