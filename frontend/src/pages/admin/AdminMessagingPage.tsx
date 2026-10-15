// frontend/src/pages/admin/AdminMessagingPage.tsx
import React, { useState } from 'react';
import { 
  Send, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Sparkles 
} from 'lucide-react';
import { sendBulkEmail } from '../../api/campusApi';

export const AdminMessagingPage: React.FC = () => {
  const [filterGrup, setFilterGrup] = useState<string>('Tots');
  const [filterSetmana, setFilterSetmana] = useState<string>('Totes');
  const [filterPagament, setFilterPagament] = useState<string>('Tots');

  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [sending, setSending] = useState<boolean>(false);
  const [result, setResult] = useState<{ total: number; sent: number; failed: number } | null>(null);

  const TEMPLATES = [
    {
      title: '☀️ Recordatori gorra i tovallola',
      subject: "Avis important de cara a demà: portar gorra, tovallola i crema solar",
      body: "Recordau que demà farà molta calor al camp de futbol. És imprescindible que [NOM_INFANT] dugui gorra, tovallola gran i crema solar aplicada des de casa. Moltes gràcies!",
    },
    {
      title: '🏊 Dia de piscina municipal',
      subject: "Dimecres d'aigua i piscina: banyador i muda de recanvi",
      body: "Us informam que demà l'activitat principal serà a la piscina municipal. Pregam que [NOM_INFANT] vingui amb el banyador posat sota la roba i una motxilla amb xancletes i tovallola.",
    },
    {
      title: '💳 Recordatori formalització pagament',
      subject: "Recordatori de pagament de la inscripció al Campus C.D. Murense 2027",
      body: "Us recordam que la data límit per a realitzar la transferència bancària de la inscripció de [NOM_INFANT] finalitza el 10/06/2027. Per favor, recordau indicar com a concepte el DNI i nom complet de l'infant.",
    },
  ];

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleSend = async () => {
    setShowConfirmModal(false);
    setSending(true);
    setResult(null);

    try {
      const payload = {
        subject,
        body,
        filter_grup: filterGrup !== 'Tots' ? filterGrup : undefined,
        filter_setmana: filterSetmana !== 'Totes' ? parseInt(filterSetmana) : undefined,
        filter_estat_pagament: filterPagament !== 'Tots' ? filterPagament : undefined,
      };

      const res = await sendBulkEmail(payload);
      setResult({
        total: res.total,
        sent: res.sent,
        failed: res.failed,
      });
    } catch (err: unknown) {
      console.error('Error enviant correus massius:', err);
      alert("S'ha produït un error en enviar els correus. Revisa la consola o credencials SMTP/Resend.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Missatgeria Directa als Tutors</h1>
          <p className="admin-page-subtitle">
            Envia comunicats oficials, avisos d'equipament o recordatoris a les famílies inscrites (filtrats per grup, setmana o pagament).
          </p>
        </div>
      </div>

      {result && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '18px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#16a34a" />
            <div>
              <strong style={{ color: '#166534', fontSize: '15px' }}>Comunicat tramès correctament!</strong>
              <div style={{ fontSize: '13px', color: '#15803d', marginTop: '2px' }}>
                S'han enviat <strong>{result.sent}</strong> correus electrònics amb èxit (Total destinataris filtrats: {result.total}).
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-staff-pill"
            onClick={() => setResult(null)}
          >
            Tancar avís
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '24px' }}>
        {/* Formulari de redacció */}
        <div className="step-card" style={{ padding: '24px' }}>
          {/* Filtres de destinataris */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Filter size={16} color="var(--primary)" />
              <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>Filtres de Destinataris</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Grup</label>
                <select
                  className="form-select"
                  style={{ fontSize: '13px', padding: '8px 10px' }}
                  value={filterGrup}
                  onChange={(e) => setFilterGrup(e.target.value)}
                >
                  <option value="Tots">Tots els grups</option>
                  <option value="Grup A">Grup A (4-7 anys)</option>
                  <option value="Grup B">Grup B (8-11 anys)</option>
                  <option value="Grup C">Grup C (12-14 anys)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Setmana Contractada</label>
                <select
                  className="form-select"
                  style={{ fontSize: '13px', padding: '8px 10px' }}
                  value={filterSetmana}
                  onChange={(e) => setFilterSetmana(e.target.value)}
                >
                  <option value="Totes">Totes les setmanes</option>
                  <option value="1">Setmana 1 (28/06 - 02/07)</option>
                  <option value="2">Setmana 2 (05/07 - 09/07)</option>
                  <option value="3">Setmana 3 (12/07 - 16/07)</option>
                  <option value="4">Setmana 4 (19/07 - 23/07)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Estat del Pagament</label>
                <select
                  className="form-select"
                  style={{ fontSize: '13px', padding: '8px 10px' }}
                  value={filterPagament}
                  onChange={(e) => setFilterPagament(e.target.value)}
                >
                  <option value="Tots">Tots els estats</option>
                  <option value="PAGAT">Només Pagats</option>
                  <option value="PENDENT">Només Pendents</option>
                </select>
              </div>
            </div>
          </div>

          {/* Camp Assumpte */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-assumpte">
              Assumpte del correu *
            </label>
            <input
              id="email-assumpte"
              type="text"
              className="form-input"
              placeholder="Ex: Recordatori d'equipament per a demà dimecres"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Cos del missatge */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="email-body" style={{ margin: 0 }}>
                Cos del missatge *
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span
                  onClick={() => setBody((prev) => prev + ' [NOM_TUTOR]')}
                  style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                  title="Insereix el nom del tutor"
                >
                  + [NOM_TUTOR]
                </span>
                <span
                  onClick={() => setBody((prev) => prev + ' [NOM_INFANT]')}
                  style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                  title="Insereix el nom de l'infant"
                >
                  + [NOM_INFANT]
                </span>
              </div>
            </div>

            <textarea
              id="email-body"
              className="form-input"
              rows={9}
              placeholder="Escriu aquí el comunicat que rebran les famílies. Pots utilitzar els tags [NOM_TUTOR] i [NOM_INFANT] per a personalitzar l'enviament..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              style={{ lineHeight: 1.5, fontFamily: 'inherit' }}
            />
          </div>

          {/* Botons d'acció */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => setShowPreview(!showPreview)}
              style={{ padding: '10px 16px', fontSize: '13px' }}
            >
              <Eye size={16} />
              <span>{showPreview ? 'Ocultar Previsualització' : 'Previsualitzar Correu'}</span>
            </button>

            <button
              type="button"
              className="btn-step-confirm"
              onClick={() => setShowConfirmModal(true)}
              disabled={sending || !subject.trim() || !body.trim()}
              style={{ padding: '10px 22px' }}
            >
              <Send size={16} />
              <span>{sending ? 'Enviant correus...' : 'Enviar Comunicat Massiu'}</span>
            </button>
          </div>
        </div>

        {/* Columna lateral: Plantilles ràpides i ajuda */}
        <div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Plantilles Ràpides</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px' }}>
              Fes clic a una plantilla per omplir l'assumpte i el text ràpidament:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{
                    textAlign: 'left',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1e293b',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '18px 20px', fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
            <strong style={{ display: 'block', marginBottom: '6px', fontSize: '13.5px' }}>🛡️ Seguretat i Proveïdor</strong>
            Els correus s'envien mitjançant el servei configurat a <code>.env</code> (Resend o SMTP <code>campuscdmurense@gmail.com</code>). Cada tutor rep el missatge en una comunicació individual i confidencial protegint les adreces RGPD de la resta de famílies.
          </div>
        </div>
      </div>

      {/* Previsualització interactiva */}
      {showPreview && (
        <div style={{ marginTop: '24px', background: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>
            Previsualització del correu (Exemple amb Marc Garcia)
          </span>
          <div style={{ marginTop: '12px', maxWidth: '600px', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ background: '#b91c1c', color: '#fff', padding: '18px 20px', textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>C.D. MURENSE • CAMPUS D'ESTIU 2027</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.9 }}>Comunicat Oficial de Coordinació</p>
            </div>
            <div style={{ padding: '20px', fontSize: '14px', lineHeight: 1.6 }}>
              <p>Hola <strong>Laura López</strong>,</p>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #b91c1c', whiteSpace: 'pre-wrap', color: '#334155' }}>
                {(body || "Escriu el missatge...")
                  .replace(/\[NOM_TUTOR\]/g, 'Laura López')
                  .replace(/\[NOM_INFANT\]/g, 'Martín')
                  .replace(/\[NOM_JUGADOR\]/g, 'Martín')}
              </div>
              <p style={{ marginTop: '16px', color: '#64748b', fontSize: '13px' }}>
                Salutacions cordials,<br />
                <strong>Equip de Monitors i Coordinació C.D. Murense</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmació abans d'enviar */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <AlertCircle size={28} color="#b91c1c" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Confirmar enviament massiu</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
              Estàs a punt d'enviar aquest correu electrònic a tots els tutors que compleixen els filtres:
            </p>
            <ul style={{ fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '12px 20px', borderRadius: '8px', margin: '0 0 20px' }}>
              <li>Grup: <strong>{filterGrup}</strong></li>
              <li>Setmana: <strong>{filterSetmana === 'Totes' ? 'Totes les setmanes' : `Setmana ${filterSetmana}`}</strong></li>
              <li>Estat Pagament: <strong>{filterPagament}</strong></li>
              <li>Assumpte: <strong>{subject}</strong></li>
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-hero-secondary"
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '8px 16px' }}
              >
                Cancel·lar
              </button>
              <button
                type="button"
                className="btn-step-confirm"
                onClick={handleSend}
                style={{ padding: '8px 20px', background: '#b91c1c' }}
              >
                Confirmar i Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagingPage;
