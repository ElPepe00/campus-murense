// frontend/src/pages/public/registration/Step5SummaryData.tsx
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, User, Users, Calendar } from 'lucide-react';
import type { InscripcioState } from '../../../types/inscripcio';

interface Step5SummaryDataProps {
  formData: InscripcioState;
  onBack: () => void;
  onConfirm: () => void;
}

export const Step5SummaryData: React.FC<Step5SummaryDataProps> = ({
  formData,
  onBack,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Càlculs econòmics
  const countWeeks = formData.serveis.setmanes.length;
  const basePrice = countWeeks * 65;
  const menjadorPrice = formData.serveis.menjador ? countWeeks * 35 : 0;
  const matineraPrice = formData.serveis.matinera ? countWeeks * 15 : 0;
  const totalPrice = basePrice + menjadorPrice + matineraPrice;

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulem o enviem la inscripció
      await new Promise((resolve) => setTimeout(resolve, 600));
      onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="step-card">
      <div className="step-card-header">
        <h2 className="step-card-title">Resum i Confirmació de la Inscripció</h2>
        <p className="step-card-subtitle">
          Revisa que totes les dades siguin correctes abans de confirmar la sol·licitud oficial del Campus 2027.
        </p>
      </div>

      {/* 1. Dades de l'infant i tutor */}
      <div className="summary-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary)' }}>
          <User size={18} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Dades de l'Infant</h3>
        </div>

        <div className="summary-row">
          <span className="summary-label">Nom i Cognoms:</span>
          <span className="summary-val">{formData.nen.nom} {formData.nen.cognoms}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Data de Naixement:</span>
          <span className="summary-val">{formData.nen.dataNaixement}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Sexe:</span>
          <span className="summary-val">{formData.nen.sexe === 'nen' ? 'Nen' : 'Nena'}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Col·legi i Curs:</span>
          <span className="summary-val">{formData.nen.colegi} • {formData.nen.curs}</span>
        </div>
      </div>

      {/* 2. Dades del tutor */}
      <div className="summary-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary)' }}>
          <Users size={18} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Dades de Contacte</h3>
        </div>

        <div className="summary-row">
          <span className="summary-label">Tutor Legal:</span>
          <span className="summary-val">{formData.tutor.nomComplet} ({formData.tutor.parentiu || 'Tutor'})</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Telèfon de Contacte:</span>
          <span className="summary-val">{formData.tutor.telefonPrincipal}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Correu Electrònic:</span>
          <span className="summary-val">{formData.tutor.email}</span>
        </div>
        {formData.autoritzats.length > 0 && formData.autoritzats[0]?.nomComplet && (
          <div className="summary-row">
            <span className="summary-label">Autoritzat Recollida:</span>
            <span className="summary-val">{formData.autoritzats[0].nomComplet} ({formData.autoritzats[0].dni})</span>
          </div>
        )}
      </div>

      {/* 3. Desglossament econòmic */}
      <div className="summary-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary)' }}>
          <Calendar size={18} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Serveis Contractats</h3>
        </div>

        <div className="summary-row">
          <span className="summary-label">Setmanes seleccionades ({countWeeks}):</span>
          <span className="summary-val">Setmanes {formData.serveis.setmanes.join(', ')} ({basePrice} €)</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Servei de Menjador:</span>
          <span className="summary-val">{formData.serveis.menjador ? `Sí (${menjadorPrice} €)` : 'No sol·licitat'}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Escola Matinera:</span>
          <span className="summary-val">{formData.serveis.matinera ? `Sí (${matineraPrice} €)` : 'No sol·licitat'}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Piscina Municipal:</span>
          <span className="summary-val">{formData.serveis.piscina === 'NO' ? 'No' : formData.serveis.piscina === 'SI_MANIGUETS' ? 'Sí (amb maniguets)' : 'Sí (autònom)'}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Drets d'imatge autoritzats:</span>
          <span className="summary-val">{formData.autoritzacions.imatges ? 'Sí' : 'No'}</span>
        </div>
      </div>

      {/* Banner de total a pagar */}
      <div className="summary-total-banner">
        <div>
          <span className="summary-total-title">Total Final a Abonar</span>
          <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px' }}>
            Pagament mitjançant transferència o a les oficines del C.D. Murense
          </div>
        </div>
        <span className="summary-total-amount">{totalPrice} €</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ecfdf5', padding: '14px 18px', borderRadius: '12px', border: '1px solid #a7f3d0', marginBottom: '28px' }}>
        <CheckCircle2 size={20} color="#059669" />
        <span style={{ fontSize: '13.5px', color: '#065f46', fontWeight: 600 }}>
          En prémer el botó inferior rebràs per email la confirmació oficial amb el codi de referència i instruccions de pagament.
        </span>
      </div>

      {/* Botons de navegació */}
      <div className="step-actions-footer">
        <button
          type="button"
          className="btn-step-prev"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft size={18} />
          <span>Modificar dades</span>
        </button>

        <button
          type="button"
          className="btn-step-next"
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)' }}
          id="btn-confirmar-inscripcio"
        >
          <ShieldCheck size={18} />
          <span>{isSubmitting ? 'Guardant inscripció...' : 'Confirmar i Enviar Inscripció'}</span>
        </button>
      </div>
    </div>
  );
};

export default Step5SummaryData;
