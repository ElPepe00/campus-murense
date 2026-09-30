// frontend/src/pages/public/PrivacyPage.tsx
import { Lock, ShieldCheck, UserCheck, HeartPulse, Camera } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate?: (path: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
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
        <span className="breadcrumb-current">Política de Privacitat</span>
      </nav>

      <div className="page-header-box" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#059669', background: '#ecfdf5', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
          <Lock size={16} />
          <span>Protecció de Dades (RGPD / LOPDGDD)</span>
        </div>
        <h1 className="page-main-title">Política de Privacitat i Protecció de Menors</h1>
        <p className="page-main-desc">
          Tractament segur i confidencial de les dades personals de participants i tutors del Campus C.D. Murense.
        </p>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '28px', color: '#334155', lineHeight: 1.7, fontSize: '14.5px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            1. Responsable del Tractament
          </h2>
          <p>
            El responsable del tractament de les dades recollides mitjançant els formularis del campus és el <strong>Club Esportiu C.D. Murense</strong>, amb domicili al Carrer de Santa Anna, s/n (Camp Municipal d'Esports), 07440 Muro, Illes Balears. Correu de contacte: <a href="mailto:campuscdmurense@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>campuscdmurense@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--primary)" />
            2. Finalitat del Tractament
          </h2>
          <p>Les dades personals de l'infant i dels seus pares o tutors legals es tractaran per a les següents finalitats:</p>
          <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Gestionar la inscripció, assignació de grup per edats i participació en el Campus d'Estiu 2027.</li>
            <li>Coordinació d'horaris, control diari d'assistència i lliurament segur de l'infant a persones autoritzades.</li>
            <li>Gestió administrativa, assegurança mèdica esportiva d'accidents i cobrament de les quotes.</li>
            <li>Enviament d'avisos i comunicacions urgents relatives a les activitats o estat del menor.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartPulse size={20} color="#e11d48" />
            3. Dades de Salut, Al·lèrgies i Menjador
          </h2>
          <p>
            Les informacions relatives a al·lèrgies, intoleràncies alimentàries, medicació o necessitats d'atenció mèdica són dades de categoria especial. Es recullen exclusivament sota el consentiment explícit dels tutors per garantir la seguretat física i la salut de l'infant durant els entrenaments, excursions i servei de menjador.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="#d97706" />
            4. Drets d'Imatge
          </h2>
          <p>
            Durant les jornades del campus es poden prendre fotografies o vídeos dels entrenaments i sortides per a la memòria gràfica del club, xarxes socials oficials o tauler de notícies per a les famílies. Aquesta autorització és voluntària i es pot concedir o revocar en qualsevol moment mitjançant el formulari o sol·licitud directa.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            5. Drets dels Usuaris (ARCO-POL)
          </h2>
          <p>
            Els tutors legals poden exercir en qualsevol moment els seus drets d'<strong>accés, rectificació, supressió, limitació del tractament, portabilitat i oposició</strong> enviant un correu electrònic a <a href="mailto:campuscdmurense@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>campuscdmurense@gmail.com</a> acompanyat d'una còpia del seu document d'identitat.
          </p>
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
          href="/politica-cookies" 
          className="btn-hero-secondary"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/politica-cookies');
            }
          }}
          style={{ textDecoration: 'none' }}
        >
          Política de Cookies
        </a>
        <a 
          href="/inscripcio" 
          className="btn-hero-primary"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/inscripcio');
            }
          }}
          style={{ textDecoration: 'none' }}
        >
          Anar a la Inscripció
        </a>
      </div>
    </div>
  );
};

export default PrivacyPage;
