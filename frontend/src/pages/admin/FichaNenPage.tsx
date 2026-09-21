// frontend/src/pages/admin/FichaNenPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Edit,
  Waves,
  UtensilsCrossed
} from 'lucide-react';
import { fetchFitxaInfant, type FitxaInfant } from '../../api/campusApi';

interface FichaNenPageProps {
  childId: number;
  onBack: () => void;
}

type SubTabKey = 'datos' | 'familia' | 'medica' | 'campus';

export const FichaNenPage: React.FC<FichaNenPageProps> = ({ childId, onBack }) => {
  const [fitxa, setFitxa] = useState<FitxaInfant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('datos');

  useEffect(() => {
    fetchFitxaInfant(childId)
      .then((data) => setFitxa(data))
      .catch((err) => console.error('Error carregant fitxa:', err))
      .finally(() => setLoading(false));
  }, [childId]);

  if (loading) {
    return (
      <div className="admin-page-container">
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          Carregant fitxa de l'alumne...
        </div>
      </div>
    );
  }

  if (!fitxa) {
    return (
      <div className="admin-page-container">
        <button type="button" className="btn-wizard-back" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Tornar al llistat</span>
        </button>
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
          No s'ha pogut trobar la fitxa de l'infant.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container" style={{ maxWidth: '840px' }}>
      {/* Botó enrere */}
      <div style={{ marginBottom: '16px' }}>
        <button type="button" className="btn-wizard-back" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Tornar a la llista d'inscrits</span>
        </button>
      </div>

      {/* Targeta Principal de l'Alumne (Capçalera com a la pantalla 4) */}
      <div className="child-profile-hero-card">
        <div className="child-hero-avatar">
          <User size={48} color="#0066f5" />
        </div>
        <div className="child-hero-info">
          <h1 className="child-hero-name">{fitxa.nom}</h1>
          <div className="child-hero-meta">
            <span>{fitxa.edat} anys</span>
            <span className="bullet">•</span>
            <span className="child-hero-group">{fitxa.grup}</span>
            <span className="bullet">•</span>
            <span>{fitxa.poblacio}</span>
          </div>
        </div>
        <div className="child-hero-status">
          {fitxa.campus.estatPagament === 'PAGAT' ? (
            <span className="status-badge success">
              <CheckCircle2 size={16} />
              <span>Pagat ({fitxa.campus.preuTotal.toFixed(0)}€)</span>
            </span>
          ) : (
            <span className="status-badge warning">
              <Clock size={16} />
              <span>Pendent ({fitxa.campus.preuTotal.toFixed(0)}€)</span>
            </span>
          )}
        </div>
      </div>

      {/* Pestanyes de navegació de la fitxa */}
      <div className="profile-subtabs-nav" role="tablist">
        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'datos' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('datos')}
        >
          <User size={16} />
          <span>Dades personals</span>
        </button>

        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'familia' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('familia')}
        >
          <Phone size={16} />
          <span>Família i Contacte</span>
        </button>

        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'medica' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('medica')}
        >
          <AlertTriangle size={16} />
          <span>Fitxa Mèdica</span>
        </button>

        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'campus' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('campus')}
        >
          <ShieldCheck size={16} />
          <span>Campus i Serveis</span>
        </button>
      </div>

      {/* Contingut de la pestanya seleccionada */}
      <div className="profile-card-body">
        {/* PESTANYA 1: DADES */}
        {activeSubTab === 'datos' && (
          <div className="profile-fields-grid">
            <div className="profile-field-item">
              <span className="field-title">
                <Calendar size={15} />
                Data de naixement
              </span>
              <strong className="field-value">{fitxa.dataNaixement || 'No especificada'}</strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">
                <FileText size={15} />
                DNI / NIE
              </span>
              <strong className="field-value">{fitxa.dni}</strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">
                <GraduationCap size={15} />
                Col·legi / Centre
              </span>
              <strong className="field-value">{fitxa.colegi}</strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">
                <GraduationCap size={15} />
                Curs escolar
              </span>
              <strong className="field-value">{fitxa.curs}</strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">Talla de roba</span>
              <strong className="field-value">{fitxa.tallaRoba}</strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">Club de procedència</span>
              <strong className="field-value">{fitxa.clubProcedencia}</strong>
            </div>
          </div>
        )}

        {/* PESTANYA 2: FAMÍLIA */}
        {activeSubTab === 'familia' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: '#0f172a' }}>
              Tutor / Contacte Principal
            </h3>
            <div className="profile-fields-grid" style={{ marginBottom: '28px' }}>
              <div className="profile-field-item">
                <span className="field-title">Nom del tutor/a</span>
                <strong className="field-value">{fitxa.tutor.nom}</strong>
              </div>

              <div className="profile-field-item">
                <span className="field-title">Telèfon principal</span>
                <a href={`tel:${fitxa.tutor.telefon}`} className="field-value phone-link">
                  <Phone size={15} />
                  <span>{fitxa.tutor.telefon}</span>
                </a>
              </div>

              <div className="profile-field-item">
                <span className="field-title">Correu electrònic</span>
                <a href={`mailto:${fitxa.tutor.email}`} className="field-value mail-link">
                  <Mail size={15} />
                  <span>{fitxa.tutor.email}</span>
                </a>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: '#0f172a' }}>
              Persones Autoritzades a recollir l'infant
            </h3>
            <div className="autoritzats-list">
              {fitxa.autoritzats.map((a) => (
                <div key={a.id} className="autoritzat-card">
                  <div className="autoritzat-icon">
                    <User size={18} />
                  </div>
                  <div>
                    <strong>{a.nom}</strong>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      DNI: {a.dni} • Parentiu: {a.parentiu}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTANYA 3: MÈDICA */}
        {activeSubTab === 'medica' && (
          <div>
            <div className="medical-alert-box">
              <div className="medical-alert-icon">
                <AlertTriangle size={24} color="#b45309" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#92400e', marginBottom: '4px' }}>
                  Al·lèrgies i Intoleràncies
                </h4>
                <p style={{ fontSize: '14.5px', color: '#78350f', fontWeight: 600 }}>
                  {fitxa.alergies}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Malalties o tractaments registrats
              </h4>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {fitxa.malalties}
              </p>
            </div>
          </div>
        )}

        {/* PESTANYA 4: CAMPUS I SERVEIS */}
        {activeSubTab === 'campus' && (
          <div className="profile-fields-grid">
            <div className="profile-field-item">
              <span className="field-title">Setmanes contractades</span>
              <strong className="field-value">{fitxa.campus.setmanes} setmanes</strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">
                <Waves size={15} />
                Servei de Piscina
              </span>
              <strong className="field-value">
                {fitxa.campus.piscina === 'SI' ? 'Sí (Autònom)' : fitxa.campus.piscina === 'SI_MANIGUETS' ? 'Sí (Amb maniguets)' : 'No'}
              </strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">
                <UtensilsCrossed size={15} />
                Servei de Menjador
              </span>
              <strong className="field-value">{fitxa.campus.menjador ? 'Contractat' : 'No contractat'}</strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">Servei de Matinera</span>
              <strong className="field-value">{fitxa.campus.matinera ? 'Sí (Des de les 7:45h)' : 'No'}</strong>
            </div>

            <div className="profile-field-item">
              <span className="field-title">Preu Total</span>
              <strong className="field-value" style={{ color: '#0066f5', fontSize: '18px' }}>
                {fitxa.campus.preuTotal.toFixed(2)} €
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Botó d'edició */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          type="button" 
          className="btn-hero-secondary"
          onClick={() => alert('Modificar fitxa de l\'alumne')}
        >
          <Edit size={16} />
          <span>Editar fitxa de l'infant</span>
        </button>
      </div>
    </div>
  );
};
