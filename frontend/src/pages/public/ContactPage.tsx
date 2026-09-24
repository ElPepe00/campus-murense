// frontend/src/pages/public/ContactPage.tsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ContactFormData {
  nom: string;
  email: string;
  telefon: string;
  assumpte: string;
  missatge: string;
}

/**
 * Pàgina pública de contacte i atenció a les famílies del campus.
 */
export const ContactPage: React.FC = () => {
  const [enviat, setEnviat] = useState(false);
  const [form, setForm] = useState<ContactFormData>({
    nom: '',
    email: '',
    telefon: '',
    assumpte: '',
    missatge: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.missatge) {
      alert('Per favor, omple els camps obligatoris (Nom, Correu i Missatge)');
      return;
    }
    // Simulació d'enviament de la consulta
    setEnviat(true);
  };

  return (
    <div className="contacto-page-container">
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
              <div className="form-group">
                <label className="form-label" htmlFor="contacto-nom">Nom complet *</label>
                <input
                  id="contacto-nom"
                  type="text"
                  className="form-input"
                  placeholder="El teu nom"
                  value={form.nom}
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
                  onChange={(e) => setForm({ ...form, assumpte: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contacto-missatge">Missatge *</label>
                <textarea
                  id="contacto-missatge"
                  rows={4}
                  className="form-textarea"
                  placeholder="Escriu aquí la teva consulta..."
                  value={form.missatge}
                  onChange={(e) => setForm({ ...form, missatge: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-hero-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Send size={18} />
                <span>Enviar missatge a administració</span>
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
              <MapPin size={20} color="#0066f5" />
            </div>
            <div>
              <strong>Camp Municipal d'Esports</strong>
              <p>Muro, Illes Balears</p>
            </div>
          </div>

          <div className="contacto-info-item">
            <div className="contacto-icon-pill">
              <Mail size={20} color="#0066f5" />
            </div>
            <div>
              <strong>Correu electrònic oficial</strong>
              <p>campus@cdmurense.com</p>
            </div>
          </div>

          <div className="contacto-info-item">
            <div className="contacto-icon-pill">
              <Phone size={20} color="#0066f5" />
            </div>
            <div>
              <strong>Atenció telefònica</strong>
              <p>Dilluns a Divendres: 9:00h - 14:00h</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ContactPage;
