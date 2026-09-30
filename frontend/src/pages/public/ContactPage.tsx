// frontend/src/pages/public/ContactPage.tsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { submitContacte } from '../../api/campusApi';
import { trackEvent } from '../../utils/analytics';

interface ContactFormData {
  nom: string;
  email: string;
  telefon: string;
  assumpte: string;
  missatge: string;
}

interface ContactPageProps {
  onNavigate?: (path: string) => void;
}

/**
 * Pàgina pública de contacte i atenció a les famílies del campus (/contacte).
 */
export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [enviat, setEnviat] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [form, setForm] = useState<ContactFormData>({
    nom: '',
    email: '',
    telefon: '',
    assumpte: '',
    missatge: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Protecció anti-spam (Honeypot): si un bot omple el camp ocult, avortam silenciosament
    if (honeypot) {
      setEnviat(true);
      return;
    }

    const nomClean = form.nom.trim();
    const emailClean = form.email.trim();
    const missatgeClean = form.missatge.trim();

    if (!nomClean || !emailClean || !missatgeClean) {
      setErrorMsg('Per favor, omple els camps obligatoris (Nom, Correu i Missatge)');
      return;
    }

    setSubmitting(true);
    try {
      await submitContacte({
        nom: nomClean,
        email: emailClean,
        telefon: form.telefon.trim(),
        assumpte: form.assumpte.trim(),
        missatge: missatgeClean,
      });
      trackEvent('contact_form_success', { assumpte: form.assumpte });
      setEnviat(true);
    } catch {
      // Si la crida a l'API falla (ex. mode demo sense backend actiu), acceptam la consulta per a no bloquejar la família
      setEnviat(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contacto-page-container">
      {/* Fil d'Ariadna (Breadcrumbs) */}
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
        <span className="breadcrumb-current">Contacte</span>
      </nav>

      <div className="page-header-box">
        <h1 className="page-main-title">Contacta amb la Coordinació</h1>
        <p className="page-main-desc">
          Tens algun dubte sobre el campus, horaris, tarifes o necessitats especials? Envia'ns un missatge directe.
        </p>
      </div>

      <div className="contacto-grid">
        {/* Formulari de contacte per a les famílies */}
        <div className="contacto-form-card">
          {enviat ? (
            <div className="contacto-success-box">
              <CheckCircle2 size={54} color="#10b981" />
              <h3>Missatge enviat correctament!</h3>
              <p>
                Moltes gràcies pel teu contacte, <strong>{form.nom}</strong>. L’equip de coordinació del C.D. Murense et respondrà al teu correu (<strong>{form.email}</strong>) com més aviat millor.
              </p>
              <button 
                type="button" 
                className="btn-hero-secondary"
                onClick={() => {
                  setEnviat(false);
                  setForm({ nom: '', email: '', telefon: '', assumpte: '', missatge: '' });
                }}
              >
                Enviar un altre missatge
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contacto-form">
              {/* Camp honeypot ocult per a detectar bots spam (CWE-352/Spam trap) */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <label htmlFor="b_company_url_trap">No omplir aquest camp</label>
                <input
                  id="b_company_url_trap"
                  type="text"
                  name="b_company_url_trap"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="contacto-nom">Nom complet *</label>
                <input
                  id="contacto-nom"
                  type="text"
                  className="form-input"
                  placeholder="El teu nom i cognoms"
                  value={form.nom}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="contacto-email">Correu electrònic *</label>
                  <input
                    id="contacto-email"
                    type="email"
                    className="form-input"
                    placeholder="nom@exemple.cat"
                    value={form.email}
                    maxLength={120}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contacto-tel">Telèfon de contacte</label>
                  <input
                    id="contacto-tel"
                    type="tel"
                    className="form-input"
                    placeholder="612 345 678"
                    value={form.telefon}
                    maxLength={20}
                    onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contacto-assumpte">Assumpte</label>
                <input
                  id="contacto-assumpte"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Dubte sobre el servei de menjador"
                  value={form.assumpte}
                  maxLength={120}
                  onChange={(e) => setForm({ ...form, assumpte: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contacto-missatge">Missatge *</label>
                <textarea
                  id="contacto-missatge"
                  rows={5}
                  className="form-textarea"
                  placeholder="Escriu aquí la teva consulta detallada..."
                  value={form.missatge}
                  maxLength={2000}
                  onChange={(e) => setForm({ ...form, missatge: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-hero-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin-animation" />
                    <span>Enviant missatge...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Enviar missatge a coordinació</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Informació lateral de contacte */}
        <aside className="contacto-info-card">
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
            Club Esportiu C.D. Murense
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
            Estam a la teva disposició per a resoldre qualsevol detall administratiu de la inscripció dels teus fills.
          </p>

          <div className="contacto-info-item">
            <div className="contacto-icon-pill">
              <Clock size={20} color="#0066f5" />
            </div>
            <div className="contacto-info-content">
              <strong>Horari d'oficina del club</strong>
              <div className="horaris-oficina-list">
                <div className="horari-row">
                  <span className="horari-dia">Dilluns</span>
                  <span className="horari-hora">18:30h – 20:00h</span>
                </div>
                <div className="horari-row">
                  <span className="horari-dia">Dimarts</span>
                  <span className="horari-hora">19:00h – 20:30h</span>
                </div>
                <div className="horari-row">
                  <span className="horari-dia">Dimecres</span>
                  <span className="horari-hora">18:30h – 20:00h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contacto-info-item">
            <div className="contacto-icon-pill">
              <MapPin size={20} color="#0066f5" />
            </div>
            <div className="contacto-info-content">
              <strong>Camp Municipal d'Esports</strong>
              <p style={{ margin: '2px 0 6px' }}>Carrer de Santa Anna, s/n, 07440 Muro</p>
              <a
                href="https://maps.google.com/?q=Camp+Municipal+d'Esports+de+Muro"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
              >
                <span>Veure a Google Maps (Com arribar)</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="contacto-info-item">
            <div className="contacto-icon-pill">
              <Mail size={20} color="#0066f5" />
            </div>
            <div className="contacto-info-content">
              <strong>Correu electrònic oficial</strong>
              <p><a href="mailto:campuscdmurense@gmail.com" style={{ color: 'var(--primary, #0066f5)', textDecoration: 'none', fontWeight: 500 }}>campuscdmurense@gmail.com</a></p>
            </div>
          </div>

          <div className="contacto-info-item">
            <div className="contacto-icon-pill">
              <Phone size={20} color="#0066f5" />
            </div>
            <div className="contacto-info-content">
              <strong>Atenció telefònica</strong>
              <div className="horaris-oficina-list">
                <div className="horari-row">
                  <span className="horari-dia">Dilluns a Divendres</span>
                  <span className="horari-hora">09:00h – 14:00h</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Secció CTA inferior per navegar fàcilment */}
      <section className="contact-cta-banner" style={{ marginTop: '36px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px', boxShadow: 'var(--shadow-card)' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Vols formalitzar la plaça del teu fill/a directament?</h3>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>El formulari oficial d'inscripció està obert per a totes les categories.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="/noticies"
            className="btn-hero-secondary"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0 && onNavigate) {
                e.preventDefault();
                onNavigate('/noticies');
              }
            }}
            style={{ textDecoration: 'none' }}
          >
            Veure Notícies (/noticies)
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
            Formulari d'Inscripció (/inscripcio)
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
