// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, type PageTabKey } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { InscripcionWizard } from './pages/public/inscripcion/InscripcionWizard';
import { NoticiasPage } from './pages/public/NoticiasPage';
import { ContactoPage } from './pages/public/ContactoPage';
import { LoginPage } from './pages/public/LoginPage';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<PageTabKey>('inici');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const { isLoggedIn, usuari } = useAuth();

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

  const handleInscripcioSuccess = (_idInscripcio: number) => {
    alert('Inscripció guardada correctament! Aviat rebràs la confirmació.');
    setActiveTab('inici');
  };

  return (
    <div className="app-wrapper">
      {/* 1. Barra de navegació adaptable (Pública / Staff) */}
      <Navbar 
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenLogin={() => setShowLoginModal(true)}
        onToggleMobileMenu={() => alert('Campus C.D. Murense')}
      />

      {/* 2. Contingut principal segons la pestanya seleccionada */}
      <main className="main-content">
        {activeTab === 'inici' && (
          <HomeScreen 
            onNavigateToInscripcion={() => setActiveTab('inscripcio')}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenLogin={() => setShowLoginModal(true)}
            apiConnected={apiConnected}
          />
        )}

        {activeTab === 'inscripcio' && (
          <InscripcionWizard 
            onCancel={() => setActiveTab('inici')}
            onSuccess={handleInscripcioSuccess}
          />
        )}

        {activeTab === 'noticies' && (
          <NoticiasPage />
        )}

        {activeTab === 'contacte' && (
          <ContactoPage />
        )}

        {/* Vistes d'administració (requereixen login) */}
        {activeTab.startsWith('admin-') && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '32px auto',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)'
          }}>
            {!isLoggedIn ? (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Accés Restringit
                </h2>
                <p style={{ fontSize: '14.5px', color: '#64748b', marginBottom: '24px' }}>
                  Aquesta secció és d'ús exclusiu per a l'equip de coordinació i monitors del C.D. Murense.
                </p>
                <button
                  type="button"
                  className="btn-hero-primary"
                  style={{ margin: '0 auto' }}
                  onClick={() => setShowLoginModal(true)}
                >
                  Iniciar sessió com a Staff
                </button>
              </>
            ) : (
              <>
                <div style={{
                  display: 'inline-flex',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: '#eff6ff',
                  color: '#0066f5',
                  fontWeight: 700,
                  fontSize: '12px',
                  marginBottom: '14px'
                }}>
                  Rol actiu: {usuari?.rol}
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Panell Admin: {activeTab.replace('admin-', '').toUpperCase()}
                </h2>
                <p style={{ fontSize: '14.5px', color: '#64748b', marginBottom: '24px' }}>
                  Aquesta pantalla es desenvoluparà en la següent fase del panell esportiu.
                </p>
                <button
                  type="button"
                  className="btn-hero-secondary"
                  style={{ margin: '0 auto' }}
                  onClick={() => setActiveTab('inici')}
                >
                  Tornar a l'Inici
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* 3. Modal d'inici de sessió de Staff */}
      {showLoginModal && (
        <LoginPage 
          onSuccess={() => {
            setShowLoginModal(false);
            setActiveTab('inici');
          }}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      {/* 4. Peu de pàgina net */}
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

      {/* 5. Barra inferior per a pantalles tàctils / mòbils */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenLogin={() => setShowLoginModal(true)}
      />
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
