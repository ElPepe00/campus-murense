// frontend/src/pages/public/LegalPage.tsx
import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

interface LegalPageProps {
  onNavigate?: (path: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
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
        <span className="breadcrumb-current">Avís Legal</span>
      </nav>

      <div className="page-header-box" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', background: '#eff6ff', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
          <FileText size={16} />
          <span>Informació Jurídica Oficial</span>
        </div>
        <h1 className="page-main-title">Avís Legal i Condicions d'Ús</h1>
        <p className="page-main-desc">
          En compliment de la Llei 34/2002, d'11 de juliol, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE).
        </p>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '28px', color: '#334155', lineHeight: 1.7, fontSize: '14.5px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            1. Dades Identificatives del Responsable
          </h2>
          <p>
            En compliment de l'article 10 de la Llei 34/2002, es posa en coneixement dels usuaris les dades identificatives del titular d'aquest lloc web:
          </p>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginTop: '10px' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Denominació social:</strong> Club Esportiu C.D. Murense</li>
              <li><strong>CIF / NIF:</strong> G-07123456</li>
              <li><strong>Domicili social:</strong> Carrer de Santa Anna, s/n (Camp Municipal d'Esports), 07440 Muro, Illes Balears</li>
              <li><strong>Correu electrònic:</strong> <a href="mailto:campuscdmurense@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>campuscdmurense@gmail.com</a></li>
              <li><strong>Telèfon de contacte:</strong> 654 321 987 / 971 860 000</li>
              <li><strong>Activitat:</strong> Entitat esportiva sense ànim de lucre dedicada al foment del futbol base i activitats esportives infantils.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            2. Objecte i Àmbit d'Aplicació
          </h2>
          <p>
            El present avís legal regula l'accés, navegació i ús del lloc web oficial del <strong>Campus d'Estiu C.D. Murense 2027</strong>. L'accés o utilització de qualsevol servei d'aquest lloc web atribueix la condició d'usuari i implica l'adhesió plena i sense reserves a totes les condicions publicades.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            3. Propietat Intel·lectual i Industrial
          </h2>
          <p>
            Tots els continguts d'aquest lloc web, incloent-hi l'escut oficial del C.D. Murense, logotips, textos, fotografies, icones, tecnologia, programari i disseny gràfic són propietat exclusiva del Club Esportiu C.D. Murense o de tercers que n'han autoritzat l'ús. Queda expressament prohibida la reproducció, distribució o transformació sense autorització prèvia per escrit.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            4. Inscripcions i Condicions de Participació
          </h2>
          <p>
            El formulari telemàtic d'inscripció posat a disposició de les famílies té caràcter oficial de pre-reserva de plaça. La inscripció queda confirmada un cop validat el pagament de la quota corresponent segons les setmanes contractades i presentada la documentació requerida (DNI i Targeta Sanitària).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            5. Legislació Aplicable i Jurisdicció
          </h2>
          <p>
            Per a la resolució de totes les controvèrsies o qüestions relacionades amb el present lloc web serà d'aplicació la legislació espanyola, essent competents per a la resolució de conflictes els Jutjats i Tribunals d'Inca / Palma de Mallorca.
          </p>
        </section>
      </div>

      {/* Enllaços de navegació relacionats */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '28px' }}>
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
          href="/contacte" 
          className="btn-hero-secondary"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
              e.preventDefault();
              onNavigate('/contacte');
            }
          }}
          style={{ textDecoration: 'none' }}
        >
          Contactar amb el Club
        </a>
      </div>
    </div>
  );
};

export default LegalPage;
